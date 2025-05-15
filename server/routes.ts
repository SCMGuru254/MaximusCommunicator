import express, { type Request, Response } from "express";
import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { 
  insertContactSchema, 
  insertMessageSchema,
  insertMenuOptionSchema,
  insertSettingSchema
} from "@shared/schema";
import { WebSocketServer } from "ws";

// Utility function for validating request body
const validateRequestBody = (schema: any, body: any) => {
  const result = schema.safeParse(body);
  if (!result.success) {
    throw new Error(`Invalid request body: ${result.error.message}`);
  }
  return result.data;
};

export async function registerRoutes(app: Express): Promise<Server> {
  const router = express.Router();
  
  // Create a separate HTTP server for our API and WebSocket
  const httpServer = createServer(app);
  
  // Setup WebSocket server on a different path to avoid conflicts with Vite
  const wss = new WebSocketServer({ 
    server: httpServer,
    path: '/ws-maximus'  // Custom path to avoid conflicts with Vite WebSockets
  });
  
  wss.on("connection", (ws) => {
    console.log("WebSocket client connected");
    
    ws.on("message", async (message) => {
      try {
        const data = JSON.parse(message.toString());
        
        // Handle incoming messages from WhatsApp
        if (data.type === "whatsapp_message") {
          const { phoneNumber, content } = data;
          
          // Get or create contact
          let contact = await storage.getContactByPhoneNumber(phoneNumber);
          if (!contact) {
            contact = await storage.createContact({
              name: phoneNumber, // Default name is the phone number
              phoneNumber,
              category: "uncategorized",
              isExempted: false
            });
          }
          
          // Store the incoming message
          const storeMessage = await storage.getSetting("store_conversation_history");
          if (storeMessage?.value === "true") {
            await storage.createMessage({
              contactId: contact.id,
              content,
              isFromContact: true,
              isEncrypted: false // Actual encryption would happen in a real implementation
            });
          }
          
          // Check if contact is exempted from AI
          if (contact.isExempted) {
            // Send notification to admin through WebSocket
            wss.clients.forEach(client => {
              client.send(JSON.stringify({
                type: "exempted_message",
                contactId: contact?.id,
                phoneNumber,
                message: content
              }));
            });
            
            // No AI response for exempted contacts
            return;
          }
          
          // Process the message with AI 
          const assistantName = await storage.getSetting("assistant_name");
          const aiAssistantName = assistantName?.value || "Maximus";
          
          // Generate response based on message content or selection
          let aiResponse: string = "";
          let estimatedResponseTime: string | undefined = undefined;
          let formLink: string | undefined = undefined;
          
          // Check if the message is selecting a menu option
          if (/^[1-4]\./.test(content) || /^[a-d]\./.test(content)) {
            // Handle menu selection
            const selection = content.charAt(0);
            let selectedOption;
            
            if (/^[1-4]$/.test(selection)) {
              // Top-level menu selection
              const options = await storage.getTopLevelMenuOptions();
              selectedOption = options[parseInt(selection) - 1];
            } else if (/^[a-d]$/.test(selection)) {
              // Submenu selection (assuming parent is known from context)
              // In a real implementation, you'd track conversation state
              const parentId = 1; // Default to Business Inquiries submenu
              const options = await storage.getSubmenuOptions(parentId);
              selectedOption = options[selection.charCodeAt(0) - 97]; // Convert a-d to 0-3
            }
            
            if (selectedOption) {
              aiResponse = selectedOption.responseText || "Thank you for your selection.";
              
              // If it's the Personal Contact option, include the form link
              if (selectedOption.title === "Personal Contact") {
                const formLink = await storage.getSetting("form_link");
                if (formLink) {
                  aiResponse += ` Please fill out this form: ${formLink.value}`;
                }
              }
              
              // If the option has submenu items, send those as well
              const subOptions = await storage.getSubmenuOptions(selectedOption.id);
              if (subOptions.length > 0) {
                aiResponse += "\n\nPlease select an option:";
                subOptions.forEach((option, index) => {
                  const letter = String.fromCharCode(97 + index); // a, b, c, d...
                  aiResponse += `\n${letter}. ${option.title}`;
                });
              }
            } else {
              aiResponse = "I'm sorry, I couldn't understand your selection. Please try again.";
            }
          } else {
            // Generic welcome message with menu options for non-selection messages
            const assistantName = await storage.getSetting("assistant_name");
            aiResponse = `👋 Hello! I'm ${assistantName?.value || "Maximus"}, your AI assistant. I'm here to help you with inquiries related to the business. How can I assist you today?\n\nPlease select an option:`;
            
            const options = await storage.getTopLevelMenuOptions();
            options.forEach((option, index) => {
              aiResponse += `\n${index + 1}. ${option.title}`;
            });
          }
          
          // Store the AI response
          if (storeMessage?.value === "true") {
            await storage.createMessage({
              contactId: contact.id,
              content: aiResponse,
              isFromContact: false,
              isEncrypted: false
            });
          }
          
          // Send AI response back to client with additional metadata
          ws.send(JSON.stringify({
            type: "ai_response",
            phoneNumber,
            content: aiResponse,
            estimatedResponseTime,
            formLink,
            isAutomatedMessage: true
          }));
          
          // Also broadcast the message to all connected clients
          wss.clients.forEach(client => {
            if (client !== ws) {
              client.send(JSON.stringify({
                type: "message_update",
                contact,
                incomingMessage: content,
                aiResponse,
                estimatedResponseTime,
                formLink,
                isAutomatedMessage: true
              }));
            }
          });
        }
      } catch (error) {
        console.error("Error processing WebSocket message:", error);
        ws.send(JSON.stringify({
          type: "error",
          message: "Error processing message"
        }));
      }
    });
  });

  // API Routes
  
  // Contacts API
  router.get("/contacts", async (_req: Request, res: Response) => {
    try {
      const contacts = await storage.getAllContacts();
      res.json(contacts);
    } catch (error) {
      res.status(500).json({ message: "Error fetching contacts", error: (error as Error).message });
    }
  });
  
  router.get("/contacts/exempted", async (_req: Request, res: Response) => {
    try {
      const exemptedContacts = await storage.getExemptedContacts();
      res.json(exemptedContacts);
    } catch (error) {
      res.status(500).json({ message: "Error fetching exempted contacts", error: (error as Error).message });
    }
  });
  
  router.get("/contacts/:id", async (req: Request, res: Response) => {
    try {
      const contact = await storage.getContact(parseInt(req.params.id));
      if (!contact) {
        return res.status(404).json({ message: "Contact not found" });
      }
      res.json(contact);
    } catch (error) {
      res.status(500).json({ message: "Error fetching contact", error: (error as Error).message });
    }
  });
  
  router.post("/contacts", async (req: Request, res: Response) => {
    try {
      const validatedData = validateRequestBody(insertContactSchema, req.body);
      const contact = await storage.createContact(validatedData);
      res.status(201).json(contact);
    } catch (error) {
      res.status(400).json({ message: "Error creating contact", error: (error as Error).message });
    }
  });
  
  router.put("/contacts/:id", async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      const validatedData = validateRequestBody(insertContactSchema.partial(), req.body);
      const updatedContact = await storage.updateContact(id, validatedData);
      if (!updatedContact) {
        return res.status(404).json({ message: "Contact not found" });
      }
      res.json(updatedContact);
    } catch (error) {
      res.status(400).json({ message: "Error updating contact", error: (error as Error).message });
    }
  });
  
  router.delete("/contacts/:id", async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      const success = await storage.deleteContact(id);
      if (!success) {
        return res.status(404).json({ message: "Contact not found" });
      }
      res.json({ message: "Contact deleted successfully" });
    } catch (error) {
      res.status(500).json({ message: "Error deleting contact", error: (error as Error).message });
    }
  });
  
  // Messages API
  router.get("/messages/:contactId", async (req: Request, res: Response) => {
    try {
      const contactId = parseInt(req.params.contactId);
      const messages = await storage.getMessagesByContactId(contactId);
      res.json(messages);
    } catch (error) {
      res.status(500).json({ message: "Error fetching messages", error: (error as Error).message });
    }
  });
  
  router.post("/messages", async (req: Request, res: Response) => {
    try {
      const validatedData = validateRequestBody(insertMessageSchema, req.body);
      const message = await storage.createMessage(validatedData);
      res.status(201).json(message);
    } catch (error) {
      res.status(400).json({ message: "Error creating message", error: (error as Error).message });
    }
  });
  
  // Menu Options API
  router.get("/menu-options", async (_req: Request, res: Response) => {
    try {
      const menuOptions = await storage.getAllMenuOptions();
      res.json(menuOptions);
    } catch (error) {
      res.status(500).json({ message: "Error fetching menu options", error: (error as Error).message });
    }
  });
  
  router.get("/menu-options/top-level", async (_req: Request, res: Response) => {
    try {
      const topLevelOptions = await storage.getTopLevelMenuOptions();
      res.json(topLevelOptions);
    } catch (error) {
      res.status(500).json({ message: "Error fetching top-level menu options", error: (error as Error).message });
    }
  });
  
  router.get("/menu-options/submenu/:parentId", async (req: Request, res: Response) => {
    try {
      const parentId = parseInt(req.params.parentId);
      const submenuOptions = await storage.getSubmenuOptions(parentId);
      res.json(submenuOptions);
    } catch (error) {
      res.status(500).json({ message: "Error fetching submenu options", error: (error as Error).message });
    }
  });
  
  router.post("/menu-options", async (req: Request, res: Response) => {
    try {
      const validatedData = validateRequestBody(insertMenuOptionSchema, req.body);
      const menuOption = await storage.createMenuOption(validatedData);
      res.status(201).json(menuOption);
    } catch (error) {
      res.status(400).json({ message: "Error creating menu option", error: (error as Error).message });
    }
  });
  
  router.put("/menu-options/:id", async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      const validatedData = validateRequestBody(insertMenuOptionSchema.partial(), req.body);
      const updatedMenuOption = await storage.updateMenuOption(id, validatedData);
      if (!updatedMenuOption) {
        return res.status(404).json({ message: "Menu option not found" });
      }
      res.json(updatedMenuOption);
    } catch (error) {
      res.status(400).json({ message: "Error updating menu option", error: (error as Error).message });
    }
  });
  
  router.delete("/menu-options/:id", async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      const success = await storage.deleteMenuOption(id);
      if (!success) {
        return res.status(404).json({ message: "Menu option not found" });
      }
      res.json({ message: "Menu option deleted successfully" });
    } catch (error) {
      res.status(500).json({ message: "Error deleting menu option", error: (error as Error).message });
    }
  });
  
  // Settings API
  router.get("/settings", async (_req: Request, res: Response) => {
    try {
      const settings = await storage.getAllSettings();
      res.json(settings);
    } catch (error) {
      res.status(500).json({ message: "Error fetching settings", error: (error as Error).message });
    }
  });
  
  router.get("/settings/:key", async (req: Request, res: Response) => {
    try {
      const setting = await storage.getSetting(req.params.key);
      if (!setting) {
        return res.status(404).json({ message: "Setting not found" });
      }
      res.json(setting);
    } catch (error) {
      res.status(500).json({ message: "Error fetching setting", error: (error as Error).message });
    }
  });
  
  router.put("/settings/:key", async (req: Request, res: Response) => {
    try {
      const { key } = req.params;
      const { value } = req.body;
      
      if (typeof value !== "string") {
        return res.status(400).json({ message: "Value must be a string" });
      }
      
      const updatedSetting = await storage.updateSetting(key, value);
      if (!updatedSetting) {
        return res.status(404).json({ message: "Setting not found" });
      }
      res.json(updatedSetting);
    } catch (error) {
      res.status(400).json({ message: "Error updating setting", error: (error as Error).message });
    }
  });
  
  // Simulate WhatsApp message (for testing)
  router.post("/simulate/whatsapp", async (req: Request, res: Response) => {
    try {
      const { phoneNumber, content } = req.body;
      
      if (!phoneNumber || !content) {
        return res.status(400).json({ message: "Phone number and content are required" });
      }
      
      // Get or create contact
      let contact = await storage.getContactByPhoneNumber(phoneNumber);
      if (!contact) {
        contact = await storage.createContact({
          name: phoneNumber,
          phoneNumber,
          category: "uncategorized",
          isExempted: false
        });
      }
      
      // Store the incoming message
      const storeMessage = await storage.getSetting("store_conversation_history");
      if (storeMessage?.value === "true") {
        await storage.createMessage({
          contactId: contact.id,
          content,
          isFromContact: true,
          isEncrypted: false
        });
      }
      
      // Check if contact is exempted from AI
      if (contact.isExempted) {
        return res.json({
          type: "exempted_message",
          message: "This contact is exempted from AI responses",
          contactId: contact.id
        });
      }
      
      // Process the message with AI
      const assistantName = await storage.getSetting("assistant_name");
      const aiAssistantName = assistantName?.value || "Maximus";
      
      // Generate response based on message content or selection
      let aiResponse: string = "";
      let estimatedResponseTime: string | undefined = undefined;
      let formLink: string | undefined = undefined;
      
      // Check if the message is selecting a menu option
      if (/^[1-4]\./.test(content) || /^[a-d]\./.test(content)) {
        // Handle menu selection
        const selection = content.charAt(0);
        let selectedOption;
        
        if (/^[1-4]$/.test(selection)) {
          // Top-level menu selection
          const options = await storage.getTopLevelMenuOptions();
          selectedOption = options[parseInt(selection) - 1];
        } else if (/^[a-d]$/.test(selection)) {
          // Submenu selection
          const parentId = 1; // Default to Business Inquiries submenu
          const options = await storage.getSubmenuOptions(parentId);
          selectedOption = options[selection.charCodeAt(0) - 97]; // Convert a-d to 0-3
        }
        
        if (selectedOption) {
          aiResponse = selectedOption.responseText || "Thank you for your selection.";
          
          // If it's the Personal Contact option, include the form link
          if (selectedOption.title === "Personal Contact") {
            const formLink = await storage.getSetting("form_link");
            if (formLink) {
              aiResponse += ` Please fill out this form: ${formLink.value}`;
            }
          }
          
          // If the option has submenu items, send those as well
          const subOptions = await storage.getSubmenuOptions(selectedOption.id);
          if (subOptions.length > 0) {
            aiResponse += "\n\nPlease select an option:";
            subOptions.forEach((option, index) => {
              const letter = String.fromCharCode(97 + index); // a, b, c, d...
              aiResponse += `\n${letter}. ${option.title}`;
            });
          }
        } else {
          aiResponse = "I'm sorry, I couldn't understand your selection. Please try again.";
        }
      } else {
        // Generic welcome message with menu options
        const assistantName = await storage.getSetting("assistant_name");
        aiResponse = `👋 Hello! I'm ${assistantName?.value || "Maximus"}, your AI assistant. I'm here to help you with inquiries related to the business. How can I assist you today?\n\nPlease select an option:`;
        
        const options = await storage.getTopLevelMenuOptions();
        options.forEach((option, index) => {
          aiResponse += `\n${index + 1}. ${option.title}`;
        });
      }
      
      // Store the AI response
      if (storeMessage?.value === "true") {
        await storage.createMessage({
          contactId: contact.id,
          content: aiResponse,
          isFromContact: false,
          isEncrypted: false
        });
      }
      
      // Return the AI response
      res.json({
        type: "ai_response",
        phoneNumber,
        content: aiResponse
      });
      
    } catch (error) {
      res.status(500).json({ message: "Error simulating WhatsApp message", error: (error as Error).message });
    }
  });
  
  app.use("/api", router);
  return httpServer;
}
