/**
 * WhatsApp Integration Service
 * 
 * This service handles connecting to the WhatsApp Business API
 * to send and receive messages.
 */

import { storage } from './storage';
import { db } from './db';
import { detectIntent, generateResponse } from '@/lib/ai';

// Client-side imports need to be dynamically imported at runtime
// to avoid server-side import errors
const getEncryptionUtils = async () => {
  const { getOrCreateEncryptionKey, encryptMessage, decryptMessage } = await import('@/lib/encryption');
  return { getOrCreateEncryptionKey, encryptMessage, decryptMessage };
};

interface WhatsAppCredentials {
  apiKey: string;
  phoneNumberId: string;
  businessAccountId: string;
}

class WhatsAppService {
  private apiKey: string | null = null;
  private phoneNumberId: string | null = null;
  private businessAccountId: string | null = null;
  private baseUrl = 'https://graph.facebook.com/v17.0';
  private initialized = false;
  
  constructor() {
    this.loadCredentialsFromEnv();
  }
  
  private loadCredentialsFromEnv() {
    this.apiKey = process.env.WHATSAPP_API_KEY || null;
    this.phoneNumberId = process.env.WHATSAPP_PHONE_NUMBER_ID || null;
    this.businessAccountId = process.env.WHATSAPP_BUSINESS_ACCOUNT_ID || null;
    
    this.initialized = !!(this.apiKey && this.phoneNumberId && this.businessAccountId);
    
    if (!this.initialized) {
      console.warn('WhatsApp API credentials not found in environment variables. WhatsApp integration will be disabled.');
    } else {
      console.log('WhatsApp API credentials loaded successfully.');
    }
  }
  
  public async setCredentials(credentials: WhatsAppCredentials) {
    this.apiKey = credentials.apiKey;
    this.phoneNumberId = credentials.phoneNumberId;
    this.businessAccountId = credentials.businessAccountId;
    this.initialized = true;
    
    // Store credentials in settings
    await storage.updateSetting('whatsapp_api_key', credentials.apiKey);
    await storage.updateSetting('whatsapp_phone_number_id', credentials.phoneNumberId);
    await storage.updateSetting('whatsapp_business_account_id', credentials.businessAccountId);
    
    console.log('WhatsApp API credentials updated successfully.');
  }
  
  public isInitialized(): boolean {
    return this.initialized;
  }
  
  /**
   * Send a message to a WhatsApp contact
   */
  public async sendMessage(phoneNumber: string, content: string, isEncrypted: boolean = false): Promise<boolean> {
    try {
      if (!this.initialized) {
        console.error('Cannot send WhatsApp message: service not initialized');
        return false;
      }
      
      // Check if encryption is enabled
      const encryptionEnabled = await this.isEncryptionEnabled();
      
      let finalContent = content;
      if (encryptionEnabled && isEncrypted) {
        const encryptionUtils = await getEncryptionUtils();
        finalContent = encryptionUtils.encryptMessage(
          content, 
          encryptionUtils.getOrCreateEncryptionKey()
        );
      }
      
      // Get or create contact
      const contact = await this.getOrCreateContact(phoneNumber);
      
      // In a real implementation, we would call the WhatsApp API here
      // For now, we'll just simulate a successful message
      console.log(`[WhatsApp] Sending message to ${phoneNumber}: ${content}`);
      
      // Store the message in the database
      await storage.createMessage({
        contactId: contact.id,
        content: finalContent,
        isFromContact: false,
        isEncrypted: encryptionEnabled && isEncrypted
      });
      
      // In a real implementation, we would return true only if the API call was successful
      return true;
    } catch (error) {
      console.error('Error sending WhatsApp message:', error);
      return false;
    }
  }
  
  /**
   * Process an incoming message from WhatsApp
   */
  public async processIncomingMessage(phoneNumber: string, content: string): Promise<void> {
    try {
      const encryptionEnabled = await this.isEncryptionEnabled();
      
      // Get or create contact
      const contact = await this.getOrCreateContact(phoneNumber);
      
      // Store the incoming message
      await storage.createMessage({
        contactId: contact.id,
        content: content,
        isFromContact: true,
        isEncrypted: false // We don't encrypt incoming messages, as they come from WhatsApp
      });
      
      // Check if contact is exempted from AI responses
      if (contact.isExempted) {
        console.log(`[WhatsApp] Contact ${phoneNumber} is exempted from AI responses`);
        return;
      }
      
      // Check if AI assistant is active
      const aiActive = await this.isAIAssistantActive();
      if (!aiActive) {
        console.log('[WhatsApp] AI assistant is disabled');
        return;
      }
      
      // Generate AI response
      const assistantName = await this.getAssistantName();
      const intent = detectIntent(content);
      const aiResponse = generateResponse(intent, assistantName, contact.name);
      
      // Send the AI response
      await this.sendMessage(phoneNumber, aiResponse.message, encryptionEnabled);
      
      console.log(`[WhatsApp] Processed message from ${phoneNumber} with intent: ${intent}`);
    } catch (error) {
      console.error('Error processing incoming WhatsApp message:', error);
    }
  }
  
  /**
   * Helper to get or create a contact
   */
  private async getOrCreateContact(phoneNumber: string): Promise<{ id: number; name: string; isExempted: boolean }> {
    let contact = await storage.getContactByPhoneNumber(phoneNumber);
    
    if (!contact) {
      // Create a new contact
      contact = await storage.createContact({
        name: `WhatsApp User (${phoneNumber})`,
        phoneNumber,
        category: 'uncategorized',
        isExempted: false
      });
    }
    
    return contact;
  }
  
  /**
   * Check if encryption is enabled
   */
  private async isEncryptionEnabled(): Promise<boolean> {
    const setting = await storage.getSetting('encryption_enabled');
    return setting?.value === 'true';
  }
  
  /**
   * Check if AI assistant is active
   */
  private async isAIAssistantActive(): Promise<boolean> {
    const setting = await storage.getSetting('ai_assistant_active');
    return setting?.value === 'true';
  }
  
  /**
   * Get the assistant name
   */
  private async getAssistantName(): Promise<string> {
    const setting = await storage.getSetting('assistant_name');
    return setting?.value || 'Maximus';
  }
}

// Create a singleton instance of the WhatsApp service
export const whatsappService = new WhatsAppService();