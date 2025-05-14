import { formatMessageTime } from '@/lib/messageProcessor';
import { Message } from '@shared/schema';

interface ChatBubbleProps {
  message: Message | {
    id: number;
    content: string;
    isFromContact: boolean;
    timestamp: Date;
  };
  formLink?: string;
  onOptionSelect?: (option: string) => void;
}

export default function ChatBubble({ message, formLink, onOptionSelect }: ChatBubbleProps) {
  const isOutgoing = message.isFromContact;
  const bubbleClass = isOutgoing ? 'chat-bubble-out' : 'chat-bubble-in';
  const alignClass = isOutgoing ? 'justify-end' : '';
  
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
  
  return (
    <div className={`flex mb-4 ${alignClass}`}>
      <div className={`${bubbleClass} px-3 py-2 max-w-[75%] shadow-sm`}>
        {/* Direct message indicator for exempted contacts */}
        {!isOutgoing && message.content.includes('[DIRECT MESSAGE]') && (
          <div className="flex items-center mb-1">
            <p className="text-xs bg-blue-100 text-blue-800 px-2 py-0.5 rounded">DIRECT MESSAGE</p>
          </div>
        )}
        
        {/* Message content - replace \n with <br> */}
        <p className="text-sm whitespace-pre-wrap">
          {message.content
            .replace(/\n(\d+|[a-z])\.\s+(.*)/g, '')  // Remove menu options for display
            .trim()}
        </p>
        
        {/* Render menu options if present and message is from the assistant */}
        {!isOutgoing && renderMenuOptions()}
        
        {/* Render form link if present */}
        {!isOutgoing && formLink && renderFormLink()}
        
        {/* Timestamp */}
        <p className="text-xs text-gray-500 text-right mt-1">
          {formatMessageTime(message.timestamp)}
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
