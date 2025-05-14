import { useState, useRef, useEffect } from 'react';
import { useWhatsApp } from '@/hooks/useWhatsApp';
import ChatBubble, { chatBubbleStyles } from './ChatBubble';
import { extractFormLink } from '@/lib/messageProcessor';

interface ChatInterfaceProps {
  phoneNumber: string;
  contactName: string;
  onBack?: () => void;
}

export default function ChatInterface({ phoneNumber, contactName, onBack }: ChatInterfaceProps) {
  const [inputValue, setInputValue] = useState('');
  const { messages, sendMessage, isConnected } = useWhatsApp();
  const chatContainerRef = useRef<HTMLDivElement>(null);
  
  // Get messages for this contact
  const contactMessages = messages[phoneNumber] || [];
  
  // Extract form link from the most recent message that might contain it
  const formLink = contactMessages.length > 0 
    ? extractFormLink(contactMessages[contactMessages.length - 1].content)
    : null;
  
  // Scroll to bottom when messages change
  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }
  }, [contactMessages]);
  
  // Handle message submission
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (inputValue.trim() === '') return;
    
    sendMessage(phoneNumber, inputValue);
    setInputValue('');
  };
  
  // Handle option selection
  const handleOptionSelect = (option: string) => {
    sendMessage(phoneNumber, option);
  };
  
  return (
    <div className="flex flex-col h-screen">
      {/* Chat Header */}
      <style>{chatBubbleStyles}</style>
      
      <div className="bg-whatsapp-dark text-white py-3 px-4 flex items-center justify-between shadow-md">
        <div className="flex items-center">
          <button onClick={onBack} className="mr-2">
            <span className="material-icons">arrow_back</span>
          </button>
          <div className="flex items-center">
            <div className="h-10 w-10 rounded-full bg-whatsapp-blue flex items-center justify-center text-white text-lg font-bold">
              {contactName.charAt(0).toUpperCase()}
            </div>
            <div className="ml-3">
              <h1 className="font-medium">{contactName}</h1>
              <p className="text-xs opacity-80">{isConnected ? 'Online' : 'Connecting...'}</p>
            </div>
          </div>
        </div>
        <div className="flex items-center space-x-4">
          <button>
            <span className="material-icons">videocam</span>
          </button>
          <button>
            <span className="material-icons">call</span>
          </button>
          <button>
            <span className="material-icons">more_vert</span>
          </button>
        </div>
      </div>
      
      {/* Chat Area */}
      <div 
        className="flex-1 overflow-y-auto px-4 py-3 bg-whatsapp-bg" 
        id="chat-container"
        ref={chatContainerRef}
      >
        {contactMessages.length === 0 ? (
          <div className="flex items-center justify-center h-full text-gray-500">
            <p>No messages yet. Send a message to start the conversation.</p>
          </div>
        ) : (
          contactMessages.map((message) => (
            <ChatBubble 
              key={message.id} 
              message={message} 
              formLink={extractFormLink(message.content) || (message.content.includes('personal') ? formLink : undefined)}
              onOptionSelect={handleOptionSelect}
            />
          ))
        )}
      </div>
      
      {/* Message Input Area */}
      <form onSubmit={handleSubmit} className="bg-gray-100 px-4 py-3">
        <div className="flex items-center">
          <div className="flex-1 bg-white rounded-full px-4 py-2 flex items-center shadow-sm">
            <button type="button" className="mr-2">
              <span className="material-icons text-gray-500">emoji_emotions</span>
            </button>
            <input 
              type="text" 
              placeholder="Type a message" 
              className="flex-1 outline-none text-sm"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              disabled={!isConnected}
            />
            <button type="button" className="ml-2">
              <span className="material-icons text-gray-500">attach_file</span>
            </button>
            <button type="button" className="ml-2">
              <span className="material-icons text-gray-500">photo_camera</span>
            </button>
          </div>
          <button 
            type={inputValue.trim() ? 'submit' : 'button'} 
            className="bg-whatsapp-green w-10 h-10 rounded-full flex items-center justify-center ml-2 shadow-sm"
            disabled={!isConnected}
          >
            <span className="material-icons text-white">
              {inputValue.trim() ? 'send' : 'mic'}
            </span>
          </button>
        </div>
      </form>
    </div>
  );
}
