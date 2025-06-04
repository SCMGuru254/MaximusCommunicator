/**
 * AI Service for handling natural language processing and responses
 * In a production version, this would connect to an actual NLP service
 */

// Interface for AI response
export interface AIResponse {
  message: string;
  options?: {
    label: string;
    value: string;
  }[];
  formLink?: string;
  estimatedResponseTime?: string;
  isAutomatedMessage?: boolean;
}

// Contact type enumeration
export enum ContactType {
  BUSINESS = 'business',
  WORK = 'work',
  PERSONAL = 'personal',
  STRANGER = 'stranger',
  INACTIVE = 'inactive',
  OTHER = 'other'
}

// API configuration for Nous
export const API_CONFIG = {
  baseUrl: 'https://api.nous.hermes.com/v1',
  apiKey: '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',
  model: 'nous-hermes-3-mistral-24b'
};

// Basic intent detection
export function detectIntent(message: string): string {
  const lowerMessage = message.toLowerCase();
  
  // Business-related keywords
  if (lowerMessage.includes('business') || lowerMessage.includes('service') || 
      lowerMessage.includes('pricing') || lowerMessage.includes('product') || 
      lowerMessage.includes('quote') || lowerMessage.includes('offer')) {
    return ContactType.BUSINESS;
  }
  
  // Work-related keywords
  if (lowerMessage.includes('work') || lowerMessage.includes('job') || 
      lowerMessage.includes('project') || lowerMessage.includes('career') || 
      lowerMessage.includes('application') || lowerMessage.includes('position')) {
    return ContactType.WORK;
  }
  
  // Personal-related keywords
  if (lowerMessage.includes('personal') || lowerMessage.includes('private') || 
      lowerMessage.includes('individual') || lowerMessage.includes('friend') || 
      lowerMessage.includes('family')) {
    return ContactType.PERSONAL;
  }
  
  // Check for inactive relationship resumption
  if (lowerMessage.includes('been a while') || lowerMessage.includes('long time') || 
      lowerMessage.includes('remember me') || lowerMessage.includes('catch up') ||
      lowerMessage.includes('last spoke')) {
    return ContactType.INACTIVE;
  }
  
  // New connections/strangers specific keywords
  if (lowerMessage.includes('introduction') || lowerMessage.includes('new here') || 
      lowerMessage.includes('first time') || lowerMessage.includes('never met') ||
      lowerMessage.includes('introduction') || lowerMessage.includes('just found')) {
    return ContactType.STRANGER;
  }
  
  // Default to "other" if no clear intent is detected
  return ContactType.OTHER;
}

// Generate a response based on detected intent and contact type
export function generateResponse(intent: string, assistantName: string = 'Maximus', contactName: string = ''): AIResponse {
  const personalizedGreeting = contactName ? `Hi ${contactName}! ` : '';
  
  // Common automated message disclosure
  const automatedDisclosure = `[This is an automated response from ${assistantName}. A team member will respond as soon as available.]`;

  switch (intent) {
    case ContactType.BUSINESS:
      return {
        message: `${personalizedGreeting}${automatedDisclosure}\n\nI'd be happy to help with your business inquiry. How can I assist you today?`,
        options: [
          { label: 'Services offered', value: 'a' },
          { label: 'Pricing information', value: 'b' },
          { label: 'Schedule a consultation', value: 'c' },
          { label: 'Speak to a human', value: 'h' }
        ],
        estimatedResponseTime: 'A team member will respond within 2 business hours.',
        isAutomatedMessage: true
      };
      
    case ContactType.WORK:
      return {
        message: `${personalizedGreeting}${automatedDisclosure}\n\nThank you for your work-related inquiry. What specific information are you looking for?`,
        options: [
          { label: 'Job opportunities', value: 'a' },
          { label: 'Project collaboration', value: 'b' },
          { label: 'Work process', value: 'c' },
          { label: 'Speak to a human', value: 'h' }
        ],
        estimatedResponseTime: 'Our team reviews all work inquiries within 24 hours.',
        isAutomatedMessage: true
      };
      
    case ContactType.PERSONAL:
      return {
        message: `${personalizedGreeting}${automatedDisclosure}\n\nThank you for your personal inquiry! To better assist you, could you please fill out this quick form about your request?`,
        formLink: 'https://tally.so/r/w4q5Mo',
        isAutomatedMessage: true
      };
      
    case ContactType.STRANGER:
      return {
        message: `Hello! ${automatedDisclosure}\n\nThanks for reaching out. I'm ${assistantName}, the AI assistant for this business. To help you better, could you please let me know what brings you here today?`,
        options: [
          { label: 'Learn about our services', value: '1' },
          { label: 'Pricing information', value: '2' },
          { label: 'Job opportunities', value: '3' },
          { label: 'Other inquiry', value: '4' }
        ],
        isAutomatedMessage: true
      };
      
    case ContactType.INACTIVE:
      return {
        message: `${personalizedGreeting}Great to hear from you again! ${automatedDisclosure}\n\nIt's been a while since we last connected. Here's what's new with us: [Latest business updates]. How can we assist you today?`,
        options: [
          { label: 'Business Inquiries', value: '1' },
          { label: 'Work-Related Questions', value: '2' },
          { label: 'Personal Contact', value: '3' },
          { label: 'Speak to a human', value: 'h' }
        ],
        isAutomatedMessage: true
      };
      
    case ContactType.OTHER:
    default:
      return {
        message: `${personalizedGreeting}${automatedDisclosure}\n\nI'm ${assistantName}, your AI assistant. How can I help you today?`,
        options: [
          { label: 'Business Inquiries', value: '1' },
          { label: 'Work-Related Questions', value: '2' },
          { label: 'Personal Contact', value: '3' },
          { label: 'Speak to a human', value: 'h' }
        ],
        isAutomatedMessage: true
      };
  }
}

// Process a selection from a menu
export function processSelection(selection: string, contactName: string = ''): AIResponse {
  const personalizedGreeting = contactName ? `Hi ${contactName}! ` : '';
  
  switch (selection) {
    case '1': // Business Inquiries
      return generateResponse(ContactType.BUSINESS, 'Maximus', contactName);
      
    case '2': // Work-Related Questions
      return generateResponse(ContactType.WORK, 'Maximus', contactName);
      
    case '3': // Personal Contact
      return {
        message: `${personalizedGreeting}Thank you for your personal inquiry! To better assist you, could you please fill out this quick form about your request?`,
        formLink: 'https://tally.so/r/w4q5Mo',
        isAutomatedMessage: true
      };
      
    case '4': // Other
      return {
        message: `${personalizedGreeting}What specific information are you looking for? Please provide more details so I can help you better.`,
        isAutomatedMessage: true
      };
      
    case 'a': // Services or Job opportunities
      return {
        message: `${personalizedGreeting}Here's detailed information about our services/opportunities. Would you like to schedule a time to discuss this with our team?`,
        options: [
          { label: 'Yes, schedule a call', value: 'call' },
          { label: 'Send more information', value: 'info' },
          { label: 'Speak to a human now', value: 'h' }
        ],
        isAutomatedMessage: true
      };
      
    case 'b': // Pricing information or Project collaboration
      return {
        message: `${personalizedGreeting}Our pricing/collaboration details depend on specific project requirements. To provide an accurate quote, could you share more details about your needs?`,
        options: [
          { label: 'Share project details', value: 'details' },
          { label: 'Schedule consultation', value: 'consult' },
          { label: 'Speak to a human', value: 'h' }
        ],
        isAutomatedMessage: true
      };
      
    case 'c': // Schedule a consultation or Work process
      return {
        message: `${personalizedGreeting}We'd be happy to discuss this further. When would be a good time for you to have a consultation call with our team?`,
        options: [
          { label: 'This week', value: 'week' },
          { label: 'Next week', value: 'next' },
          { label: 'Specific date', value: 'date' }
        ],
        isAutomatedMessage: true
      };
      
    case 'h': // Human request
      return {
        message: `${personalizedGreeting}I understand you'd like to speak with a human team member. Someone will respond to your message as soon as possible. The typical response time is within 2 business hours.`,
        estimatedResponseTime: 'Within 2 business hours',
        isAutomatedMessage: true
      };
      
    default:
      return {
        message: `I'm sorry, I couldn't understand your selection. Please try again or type your question in a different way.`,
        options: [
          { label: 'Business Inquiries', value: '1' },
          { label: 'Work-Related Questions', value: '2' },
          { label: 'Personal Contact', value: '3' },
          { label: 'Speak to a human', value: 'h' }
        ],
        isAutomatedMessage: true
      };
  }
}

// Send a chat message to the Nous API and get a response
export async function sendChatMessage(message: string): Promise<AIResponse> {
  try {
    const response = await fetch('/api/chat', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ message }),
    });

    if (!response.ok) {
      throw new Error('Failed to send message');
    }

    const data = await response.json();
    return {
      message: data.message,
      timestamp: data.timestamp
    };
  } catch (error) {
    console.error('Error sending chat message:', error);
    throw error;
  }
}
