import { useState, useEffect, useCallback, useRef } from 'react';
import { apiRequest } from '@/lib/queryClient';
import { processOutgoingMessage, processIncomingMessage } from '@/lib/messageProcessor';
import { Message, Contact } from '@shared/schema';

interface WhatsAppHook {
  isConnected: boolean;
  sendMessage: (phoneNumber: string, content: string) => Promise<void>;
  messages: Record<string, Message[]>;
  contacts: Contact[];
  loading: boolean;
  error: string | null;
  reconnect: () => void;
}

// Mock data for development when connection fails
const MOCK_CONTACTS: Contact[] = [
  {
    id: 1,
    name: 'John Doe',
    phoneNumber: '+1234567890',
    category: 'business',
    isExempted: false,
    createdAt: new Date()
  },
  {
    id: 2,
    name: 'Jane Smith',
    phoneNumber: '+9876543210',
    category: 'personal',
    isExempted: true,
    createdAt: new Date()
  },
];

export function useWhatsApp(): WhatsAppHook {
  const [socket, setSocket] = useState<WebSocket | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [messages, setMessages] = useState<Record<string, Message[]>>({});
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [encryptionEnabled, setEncryptionEnabled] = useState(false);
  const reconnectAttempts = useRef(0);
  const maxReconnectAttempts = 5;
  const reconnectTimeoutRef = useRef<number | null>(null);

  // Function to establish WebSocket connection
  const connectWebSocket = useCallback(() => {
    try {
      const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
      const ws = new WebSocket(`${protocol}//${window.location.host}/ws-maximus`);
      
      ws.onopen = () => {
        console.log('WebSocket connection established');
        setIsConnected(true);
        setError(null);
        reconnectAttempts.current = 0;
      };
      
      ws.onclose = (event) => {
        console.log(`WebSocket connection closed: ${event.code} - ${event.reason}`);
        setIsConnected(false);
        
        // Try to reconnect if not closing cleanly and maximum attempts not reached
        if (reconnectAttempts.current < maxReconnectAttempts) {
          const timeout = Math.min(1000 * Math.pow(2, reconnectAttempts.current), 30000);
          console.log(`Attempting to reconnect in ${timeout/1000} seconds...`);
          
          reconnectTimeoutRef.current = window.setTimeout(() => {
            reconnectAttempts.current++;
            connectWebSocket();
          }, timeout);
        } else {
          setError(`WebSocket connection closed after ${maxReconnectAttempts} attempts. Try refreshing the page.`);
        }
      };
      
      ws.onerror = (e) => {
        console.error('WebSocket error:', e);
        setError('WebSocket connection error. Server might be unavailable.');
      };
      
      ws.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          
          switch (data.type) {
            case 'ai_response':
              // Extract additional metadata from the response
              const { phoneNumber, content, estimatedResponseTime, formLink, isAutomatedMessage } = data;
              
              // Create a custom property to track metadata for this message
              const messageMetadata = {
                estimatedResponseTime,
                formLink,
                isAutomatedMessage
              };
              
              // Store metadata for this message to access later
              setMessages(prevMessages => {
                const messageId = Date.now();
                
                // Store metadata indexed by message ID
                localStorage.setItem(`message_metadata_${messageId}`, JSON.stringify(messageMetadata));
                
                // Create and store the message
                const newMessage = {
                  id: messageId,
                  contactId: 0,
                  content,
                  isFromContact: false,
                  timestamp: new Date(),
                  isEncrypted: false
                };
                
                const contactMessages = prevMessages[phoneNumber] || [];
                return {
                  ...prevMessages,
                  [phoneNumber]: [...contactMessages, newMessage]
                };
              });
              break;
              
            case 'exempted_message':
              // Handle notification for exempted contact
              console.log('Exempted message:', data);
              break;
              
            case 'message_update':
              // Handle incoming message from contact
              handleIncomingMessage(data.contact.phoneNumber, data.incomingMessage, true);
              
              // Extract additional metadata from the AI response
              const metadata = {
                estimatedResponseTime: data.estimatedResponseTime,
                formLink: data.formLink,
                isAutomatedMessage: data.isAutomatedMessage
              };
              
              // Generate a unique message ID
              const messageId = Date.now();
              
              // Store metadata indexed by message ID
              localStorage.setItem(`message_metadata_${messageId}`, JSON.stringify(metadata));
              
              // Create and store the AI response
              setMessages(prevMessages => {
                const contactMessages = prevMessages[data.contact.phoneNumber] || [];
                
                const newMessage = {
                  id: messageId,
                  contactId: data.contact.id,
                  content: data.aiResponse,
                  isFromContact: false,
                  timestamp: new Date(),
                  isEncrypted: false
                };
                
                return {
                  ...prevMessages,
                  [data.contact.phoneNumber]: [...contactMessages, newMessage]
                };
              });
              break;
              
            case 'error':
              setError(data.message || 'Unknown error');
              break;
              
            default:
              console.log('Unknown message type:', data.type);
          }
        } catch (error) {
          console.error('Error parsing WebSocket message:', error);
        }
      };
      
      setSocket(ws);
      
      return ws;
    } catch (err) {
      console.error('Error creating WebSocket:', err);
      setError('Failed to establish WebSocket connection');
      return null;
    }
  }, []);

  // Manual reconnect function
  const reconnect = useCallback(() => {
    if (socket) {
      socket.close();
    }
    
    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current);
      reconnectTimeoutRef.current = null;
    }
    
    reconnectAttempts.current = 0;
    setError(null);
    connectWebSocket();
  }, [socket, connectWebSocket]);

  // Initialize WebSocket connection
  useEffect(() => {
    const ws = connectWebSocket();
    
    return () => {
      if (ws) {
        ws.close();
      }
      
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
      }
    };
  }, [connectWebSocket]);

  // Load contacts and settings
  useEffect(() => {
    const loadInitialData = async () => {
      try {
        setLoading(true);
        
        // Load contacts
        try {
          const contactsResponse = await apiRequest('GET', '/api/contacts');
          const contactsData = await contactsResponse.json();
          setContacts(contactsData);
        } catch (contactError) {
          console.error('Failed to load contacts:', contactError);
          
          // Use mock contacts if real data can't be loaded
          console.log('Using mock contacts for development');
          setContacts(MOCK_CONTACTS);
        }
        
        // Load encryption setting
        try {
          const encryptionSetting = await apiRequest('GET', '/api/settings/encryption_enabled');
          const encryptionData = await encryptionSetting.json();
          setEncryptionEnabled(encryptionData.value === 'true');
        } catch (settingError) {
          console.error('Failed to load encryption setting:', settingError);
          setEncryptionEnabled(false);
        }
        
        setLoading(false);
      } catch (error) {
        console.error('Failed to load initial data:', error);
        setError('Failed to load initial data. Using default settings.');
        setLoading(false);
      }
    };
    
    loadInitialData();
  }, []);

  // Function to handle incoming messages
  const handleIncomingMessage = useCallback((phoneNumber: string, content: string, isFromContact: boolean) => {
    const messageContent = encryptionEnabled ? processIncomingMessage(content, false) : content;
    
    setMessages(prevMessages => {
      const contactMessages = prevMessages[phoneNumber] || [];
      
      // Create a new message object
      const newMessage: Message = {
        id: Date.now(), // Temporary ID
        contactId: 0, // Will be set properly when saved to the server
        content: messageContent,
        isFromContact,
        timestamp: new Date(),
        isEncrypted: false
      };
      
      return {
        ...prevMessages,
        [phoneNumber]: [...contactMessages, newMessage]
      };
    });
  }, [encryptionEnabled]);

  // Function to send a message
  const sendMessage = useCallback(async (phoneNumber: string, content: string) => {
    if (!socket || socket.readyState !== WebSocket.OPEN) {
      setError('WebSocket is not connected. Message will be sent locally only.');
      
      // Add to local messages anyway for better UX
      handleIncomingMessage(phoneNumber, content, true);
      
      // Simulate AI response after a delay (for development when backend is unavailable)
      setTimeout(() => {
        const aiResponse = `👋 Hello! I'm Maximus, your AI assistant. I'm here to help you with inquiries related to the business. How can I assist you today?\n\n1. Business Inquiries\n2. Work-Related Questions\n3. Personal Contact\n4. Other`;
        handleIncomingMessage(phoneNumber, aiResponse, false);
      }, 1000);
      
      return;
    }
    
    try {
      // Process the outgoing message (encrypt if needed)
      const { content: processedContent, isEncrypted } = processOutgoingMessage(content, encryptionEnabled);
      
      // Add to local messages immediately
      handleIncomingMessage(phoneNumber, content, true);
      
      // Send via WebSocket
      socket.send(JSON.stringify({
        type: 'whatsapp_message',
        phoneNumber,
        content: processedContent,
        isEncrypted
      }));
      
      // For demo purposes, we'll also send to the simulate endpoint
      try {
        await apiRequest('POST', '/api/simulate/whatsapp', {
          phoneNumber,
          content: processedContent
        });
      } catch (apiError) {
        console.error('Failed to send to simulate endpoint:', apiError);
        // Simulate a response if server is unavailable (development fallback)
        setTimeout(() => {
          const aiResponse = `👋 Hello! I'm Maximus, your AI assistant. I'm here to help you with inquiries related to the business. How can I assist you today?\n\n1. Business Inquiries\n2. Work-Related Questions\n3. Personal Contact\n4. Other`;
          handleIncomingMessage(phoneNumber, aiResponse, false);
        }, 1000);
      }
    } catch (error) {
      console.error('Failed to send message:', error);
      setError('Failed to send message');
    }
  }, [socket, encryptionEnabled, handleIncomingMessage]);

  return {
    isConnected,
    sendMessage,
    messages,
    contacts,
    loading,
    error,
    reconnect
  };
}
