import { formatMessageTime } from '@/lib/messageProcessor';
import { Message } from '@shared/schema';
import { AIResponse } from '@/lib/ai';

interface ChatBubbleProps {
  message: Message | {
    id: number;
    content: string;
    isFromContact: boolean;
    timestamp: Date;
  };
  formLink?: string;
  estimatedResponseTime?: string;
  isAutomatedMessage?: boolean;
  onOptionSelect?: (option: string) => void;
}

export default function ChatBubble({ 
  message, 
  formLink, 
  estimatedResponseTime, 
  isAutomatedMessage,
  onOptionSelect 
}: ChatBubbleProps) {
  const isOutgoing = message.isFromContact;
  const bubbleClass = isOutgoing ? 'chat-bubble-out' : 'chat-bubble-in';
  const alignClass = isOutgoing ? 'justify-end' : '';
  
  // Check if content has automated message disclosure
  const hasAutomatedDisclosure = !isOutgoing && 
    (isAutomatedMessage || message.content.includes('[This is an automated response'));
  
  // Function to render menu options as buttons
  const renderMenuOptions = () => {
    // Find all options in message content (1. Option, 2. Option, etc.)
    const optionMatches = message.content.match(/\n(\d+|[a-z])\.\s+(.*)/g);
    
    if (!optionMatches) return null;
    
    return (
      <div className="flex flex-col space-y-2 mt-2">
        {optionMatches.map((option, index) => {
          const [, prefix, text] = option.match(/\n(\d+|[a-z])\.\s+(.*)/) || [];
          
          return (
            <button 
              key={index}
              className="bg-whatsapp-green hover:bg-whatsapp-dark text-white py-2 px-3 rounded-md text-sm transition-colors text-left"
              onClick={() => onOptionSelect && onOptionSelect(`${prefix}. ${text}`)}
            >
              {`${prefix}. ${text}`}
            </button>
          );
        })}
      </div>
    );
  };
  
  // Function to render form link
  const renderFormLink = () => {
    if (!formLink) return null;
    
    return (
      <div className="bg-gray-100 p-3 rounded-md mt-2 border border-gray-300">
        <p className="text-sm font-medium text-whatsapp-dark">Contact Form</p>
        <p className="text-xs text-gray-600 mb-2">Share your details so we can help you</p>
        <a href={formLink} target="_blank" rel="noopener noreferrer" className="flex items-center text-blue-600 text-sm">
          <span className="material-icons text-sm mr-1">insert_link</span>
          {formLink}
        </a>
      </div>
    );
  };
  
  // Function to render estimated response time
  const renderEstimatedResponseTime = () => {
    if (!estimatedResponseTime) return null;
    
    return (
      <div className="bg-blue-50 p-2 rounded-md mt-2 border border-blue-100">
        <div className="flex items-center text-xs text-blue-700">
          <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-1">
            <circle cx="12" cy="12" r="10"></circle>
            <polyline points="12 6 12 12 16 14"></polyline>
          </svg>
          <span>Estimated response time: {estimatedResponseTime}</span>
        </div>
      </div>
    );
  };
  
  return (
    <div className={`flex mb-4 ${alignClass}`}>
      <div className={`${bubbleClass} px-3 py-2 max-w-[75%] shadow-sm`}>
        {/* Automated message indicator */}
        {hasAutomatedDisclosure && (
          <div className="flex items-center mb-1">
            <span className="text-xs bg-green-100 text-green-800 px-2 py-0.5 rounded flex items-center">
              <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-1">
                <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
                <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
              </svg>
              AUTOMATED
            </span>
          </div>
        )}
        
        {/* Direct message indicator for exempted contacts */}
        {!isOutgoing && message.content.includes('[DIRECT MESSAGE]') && (
          <div className="flex items-center mb-1">
            <p className="text-xs bg-blue-100 text-blue-800 px-2 py-0.5 rounded">DIRECT MESSAGE</p>
          </div>
        )}
        
        {/* Message content - replace \n with <br> and remove automated message tag if displayed separately */}
        <p className="text-sm whitespace-pre-wrap">
          {message.content
            .replace(/\n(\d+|[a-z])\.\s+(.*)/g, '') // Remove menu options for display
            .replace(/\[This is an automated response from.*?\]/, hasAutomatedDisclosure ? '' : '') // Remove tag if showing indicator
            .trim()}
        </p>
        
        {/* Render menu options if present and message is from the assistant */}
        {!isOutgoing && renderMenuOptions()}
        
        {/* Render form link if present */}
        {!isOutgoing && formLink && renderFormLink()}
        
        {/* Render estimated response time if present */}
        {!isOutgoing && estimatedResponseTime && renderEstimatedResponseTime()}
        
        {/* Timestamp */}
        <p className="text-xs text-gray-500 text-right mt-1">
          {formatMessageTime(message.timestamp || new Date())}
        </p>
      </div>
    </div>
  );
}

// Add custom CSS for chat bubbles
export const chatBubbleStyles = `
  .chat-bubble-in {
    position: relative;
    background: #FFFFFF;
    border-radius: 0.75rem 0.75rem 0.75rem 0;
  }
  .chat-bubble-in:after {
    content: '';
    position: absolute;
    left: 0;
    bottom: 0;
    width: 12px;
    height: 12px;
    background: radial-gradient(circle at 0 0, transparent 12px, #FFFFFF 0);
    transform: translate(-100%, 100%);
  }
  .chat-bubble-out {
    position: relative;
    background: #DCF8C6;
    border-radius: 0.75rem 0.75rem 0 0.75rem;
  }
  .chat-bubble-out:after {
    content: '';
    position: absolute;
    right: 0;
    bottom: 0;
    width: 12px;
    height: 12px;
    background: radial-gradient(circle at 100% 0, transparent 12px, #DCF8C6 0);
    transform: translate(100%, 100%);
  }
`;
