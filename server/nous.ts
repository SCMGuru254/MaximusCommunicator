/**
 * Nous API Integration Service
 * 
 * This service handles connecting to the Nous: DeepHermes 3 Mistral 24B API
 * to send and receive messages for normal chat functionality.
 */

import { storage } from './storage';
import { db } from './db';

// Client-side imports need to be dynamically imported at runtime
// to avoid server-side import errors
const getEncryptionUtils = async () => {
  const { getOrCreateEncryptionKey, encryptMessage, decryptMessage } = await import('@/lib/encryption');
  return { getOrCreateEncryptionKey, encryptMessage, decryptMessage };
};

interface NousCredentials {
  apiKey: string;
}

class NousService {
  private apiKey: string | null = null;
  private baseUrl = 'https://api.nousresearch.com/v1';
  private initialized = false;
  private model = 'nous-hermes3-mistral-24b';
  
  constructor() {
    this.loadCredentialsFromEnv();
  }
  
  private loadCredentialsFromEnv() {
    this.apiKey = process.env.NOUS_API_KEY || null;
    
    this.initialized = !!this.apiKey;
    
    if (!this.initialized) {
      console.warn('Nous API key not found in environment variables. Nous chat integration will be disabled.');
    } else {
      console.log('Nous API credentials loaded successfully.');
    }
  }
  
  public async setCredentials(credentials: NousCredentials) {
    this.apiKey = credentials.apiKey;
    this.initialized = true;
    
    // Store credentials in settings
    await storage.updateSetting('nous_api_key', credentials.apiKey);
    
    console.log('Nous API credentials updated successfully.');
  }
  
  public isInitialized(): boolean {
    return this.initialized;
  }
  
  /**
   * Send a message to the Nous API and get a response
   */
  public async sendMessage(content: string, contactId: number, isEncrypted: boolean = false): Promise<string> {
    try {
      if (!this.initialized) {
        console.error('Cannot send Nous message: service not initialized');
        return 'Error: Nous API not initialized';
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
      
      // Get contact
      const contact = await storage.getContactById(contactId);
      if (!contact) {
        throw new Error(`Contact with ID ${contactId} not found`);
      }
      
      // Store the outgoing message in the database
      await storage.createMessage({
        contactId: contact.id,
        content: finalContent,
        isFromContact: false,
        isEncrypted: encryptionEnabled && isEncrypted
      });
      
      // Get conversation history for context
      const conversationHistory = await storage.getMessagesForContact(contactId, 10);
      
      // Format conversation history for the API
      const messages = conversationHistory.map(msg => ({
        role: msg.isFromContact ? 'user' : 'assistant',
        content: msg.content
      }));
      
      // Add the current message
      messages.push({
        role: 'user',
        content: content
      });
      
      // Call the Nous API
      const response = await this.callNousAPI(messages);
      
      // Store the AI response
      await storage.createMessage({
        contactId: contact.id,
        content: response,
        isFromContact: false,
        isEncrypted: false
      });
      
      return response;
    } catch (error) {
      console.error('Error sending Nous message:', error);
      return `Error: ${error instanceof Error ? error.message : 'Unknown error'}`;
    }
  }
  
  /**
   * Process an incoming message from a contact
   */
  public async processIncomingMessage(contactId: number, content: string): Promise<string> {
    try {
      const encryptionEnabled = await this.isEncryptionEnabled();
      
      // Get contact
      const contact = await storage.getContactById(contactId);
      if (!contact) {
        throw new Error(`Contact with ID ${contactId} not found`);
      }
      
      // Store the incoming message
      await storage.createMessage({
        contactId: contact.id,
        content: content,
        isFromContact: true,
        isEncrypted: false
      });
      
      // Check if contact is exempted from AI responses
      if (contact.isExempted) {
        console.log(`[Nous] Contact ${contact.name} is exempted from AI responses`);
        return '';
      }
      
      // Check if AI assistant is active
      const aiActive = await this.isAIAssistantActive();
      if (!aiActive) {
        console.log('[Nous] AI assistant is disabled');
        return '';
      }
      
      // Get conversation history for context
      const conversationHistory = await storage.getMessagesForContact(contactId, 10);
      
      // Format conversation history for the API
      const messages = conversationHistory.map(msg => ({
        role: msg.isFromContact ? 'user' : 'assistant',
        content: msg.content
      }));
      
      // Call the Nous API
      const response = await this.callNousAPI(messages);
      
      // Store the AI response
      await storage.createMessage({
        contactId: contact.id,
        content: response,
        isFromContact: false,
        isEncrypted: false
      });
      
      console.log(`[Nous] Processed message from ${contact.name}`);
      
      return response;
    } catch (error) {
      console.error('Error processing incoming Nous message:', error);
      return `Error: ${error instanceof Error ? error.message : 'Unknown error'}`;
    }
  }
  
  /**
   * Call the Nous API with the given messages
   */
  private async callNousAPI(messages: Array<{role: string, content: string}>): Promise<string> {
    try {
      if (!this.apiKey) {
        throw new Error('Nous API key not set');
      }
      
      const response = await fetch(`${this.baseUrl}/chat/completions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.apiKey}`
        },
        body: JSON.stringify({
          model: this.model,
          messages: messages,
          temperature: 0.7,
          max_tokens: 1000
        })
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(`Nous API error: ${errorData.error?.message || response.statusText}`);
      }
      
      const data = await response.json();
      return data.choices[0].message.content;
    } catch (error) {
      console.error('Error calling Nous API:', error);
      throw error;
    }
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

  public async sendChatMessage(message: string) {
    if (!this.initialized) {
      throw new Error('Nous API not initialized. Please set API credentials first.');
    }

    try {
      const response = await fetch(`${this.baseUrl}/chat/completions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.apiKey}`
        },
        body: JSON.stringify({
          model: this.model,
          messages: [{ role: 'user', content: message }],
          temperature: 0.7,
          max_tokens: 1000
        })
      });

      if (!response.ok) {
        throw new Error(`Nous API error: ${response.statusText}`);
      }

      const data = await response.json();
      return {
        message: data.choices[0].message.content,
        timestamp: new Date().toISOString()
      };
    } catch (error) {
      console.error('Error sending message to Nous API:', error);
      throw error;
    }
  }
}

export const nousService = new NousService();