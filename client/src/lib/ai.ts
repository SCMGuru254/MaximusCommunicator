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
}

// Basic intent detection
export function detectIntent(message: string): string {
  const lowerMessage = message.toLowerCase();
  
  if (lowerMessage.includes('business') || lowerMessage.includes('service') || lowerMessage.includes('pricing')) {
    return 'business';
  }
  
  if (lowerMessage.includes('work') || lowerMessage.includes('job') || lowerMessage.includes('project')) {
    return 'work';
  }
  
  if (lowerMessage.includes('personal') || lowerMessage.includes('private') || lowerMessage.includes('individual')) {
    return 'personal';
  }
  
  // Default to "other" if no clear intent is detected
  return 'other';
}

// Generate a response based on detected intent
export function generateResponse(intent: string, assistantName: string = 'Maximus'): AIResponse {
  switch (intent) {
    case 'business':
      return {
        message: `I'd be happy to help with your business inquiry. How can I assist you?`,
        options: [
          { label: 'Services offered', value: 'a' },
          { label: 'Pricing information', value: 'b' },
          { label: 'Schedule a consultation', value: 'c' },
          { label: 'Other business question', value: 'd' }
        ]
      };
      
    case 'work':
      return {
        message: 'Thank you for your work-related inquiry. What specific information are you looking for?',
        options: [
          { label: 'Job opportunities', value: 'a' },
          { label: 'Project collaboration', value: 'b' },
          { label: 'Work process', value: 'c' },
          { label: 'Other work question', value: 'd' }
        ]
      };
      
    case 'personal':
      return {
        message: 'Thank you for your personal inquiry! To better assist you, could you please fill out this quick form about your request?',
        formLink: 'https://tally.so/r/w4q5Mo'
      };
      
    case 'other':
    default:
      return {
        message: `Hello! I'm ${assistantName}, your AI assistant. How can I help you today?`,
        options: [
          { label: 'Business Inquiries', value: '1' },
          { label: 'Work-Related Questions', value: '2' },
          { label: 'Personal Contact', value: '3' },
          { label: 'Other', value: '4' }
        ]
      };
  }
}

// Process a selection from a menu
export function processSelection(selection: string): AIResponse {
  // This would normally track conversation state
  // For now, we'll provide predefined responses
  
  switch (selection) {
    case '1':
      return generateResponse('business');
      
    case '2':
      return generateResponse('work');
      
    case '3':
      return {
        message: 'Thank you for your personal inquiry! To better assist you, could you please fill out this quick form about your request?',
        formLink: 'https://tally.so/r/w4q5Mo'
      };
      
    case '4':
      return {
        message: 'What can I help you with?'
      };
      
    case 'a':
    case 'b':
    case 'c':
    case 'd':
      // Submenu responses
      return {
        message: 'Thanks for selecting this option. I\'ll help you with that specific request.'
      };
      
    default:
      return {
        message: 'I\'m sorry, I couldn\'t understand your selection. Please try again.'
      };
  }
}
