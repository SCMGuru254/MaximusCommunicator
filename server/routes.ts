import express, { type Request, Response } from "express";
import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { WebSocketServer } from "ws";
import { nousService } from "./nous";
import chatRoutes from "./chatRoutes";

export async function registerRoutes(app: Express): Promise<Server> {
  const router = express.Router();
  const httpServer = createServer(app);
  
  // Initialize the default data in the database
  try {
    await storage.initializeDefaultData();
    console.log("Default data initialized successfully");
  } catch (error) {
    console.error("Error initializing default data:", error);
  }
  
  // Setup WebSocket server
  const wss = new WebSocketServer({ 
    server: httpServer,
    path: '/ws-maximus'
  });
  
  // Register chat routes
  app.use('/api', chatRoutes);
  
  // WebSocket connection handler
  wss.on("connection", (ws) => {
    console.log("WebSocket client connected");
    
    ws.on("message", async (message) => {
      try {
        const data = JSON.parse(message.toString());
        console.log("Received WebSocket message:", data);
        
        // Broadcast the message to all connected clients except sender
        wss.clients.forEach((client) => {
          if (client !== ws) {
            client.send(JSON.stringify({
              type: "message_update",
              data
            }));
          }
        });
      } catch (error) {
        console.error("Error processing WebSocket message:", error);
        ws.send(JSON.stringify({
          type: "error",
          message: error instanceof Error ? error.message : "Unknown error"
        }));
      }
    });
  });
  
  app.use(router);
  return httpServer;
}
