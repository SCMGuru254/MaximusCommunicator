import { useState, useRef, useEffect } from 'react';
import { useWhatsApp } from '@/hooks/useWhatsApp';
import ChatBubble, { chatBubbleStyles } from './ChatBubble';
import { extractFormLink } from '@/lib/messageProcessor';
import { detectIntent, generateResponse, processSelection } from '@/lib/ai';

interface ChatInterfaceProps {
  phoneNumber: string;
  contactName: string;
  onBack?: () => void;
}

export default function ChatInterface({ phoneNumber, contactName, onBack }: ChatInterfaceProps) {
  const [inputValue, setInputValue] = useState('');
  const { messages, sendMessage, isConnected, reconnect } = useWhatsApp();
  const chatContainerRef = useRef<HTMLDivElement>(null);
  
  // Get messages for this contact
  const contactMessages = messages[phoneNumber] || [];
  
  // Extract additional information from the most recent assistant message
  const lastAssistantMessage = [...contactMessages]
    .reverse()
    .find(msg => !msg.isFromContact);
  
  // Extract form link, either from message content or from AI response
  const formLink = contactMessages.length > 0 
    ? extractFormLink(lastAssistantMessage?.content || '')
    : null;
    
  // Determine if it's an automated message
  const isAutomatedMessage = lastAssistantMessage?.content?.includes('[This is an automated response');
    
  // Extract estimated response time
  const estimatedResponseTimeMatch = lastAssistantMessage?.content?.match(/respond within (\d+\s+\w+\s+\w+)/);
  const estimatedResponseTime = estimatedResponseTimeMatch ? estimatedResponseTimeMatch[1] : undefined;
  
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
  
  // Handle reconnect
  const handleReconnect = () => {
    reconnect();
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
              <p className="text-xs opacity-80">
                {isConnected ? (
                  <span className="flex items-center">
                    <span className="h-2 w-2 bg-green-500 rounded-full inline-block mr-1"></span>
                    Online
                  </span>
                ) : (
                  <span className="flex items-center">
                    <span className="h-2 w-2 bg-gray-400 rounded-full inline-block mr-1"></span>
                    <span className="cursor-pointer underline" onClick={handleReconnect}>
                      Disconnected (click to reconnect)
                    </span>
                  </span>
                )}
              </p>
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
          <div className="flex flex-col items-center justify-center h-full text-gray-500">
            <p className="mb-4">No messages yet. Send a message to start the conversation.</p>
            <p className="text-xs text-center max-w-xs">
              Maximus (AI Assistant) will respond automatically with categorized responses for business inquiries, work-related questions, and personal contacts.
            </p>
          </div>
        ) : (
          contactMessages.map((message) => (
            <ChatBubble 
              key={message.id} 
              message={message} 
              formLink={extractFormLink(message.content) || (message.content.includes('personal') && formLink ? formLink : undefined)}
              estimatedResponseTime={!message.isFromContact ? estimatedResponseTime : undefined}
              isAutomatedMessage={!message.isFromContact && !!isAutomatedMessage}
              onOptionSelect={handleOptionSelect}
            />
          ))
        )}
      </div>
      
      {/* Connection Warning Banner */}
      {!isConnected && (
        <div className="bg-yellow-100 text-yellow-800 text-xs px-4 py-2 flex items-center">
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-2">
            <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"></path>
            <line x1="12" y1="9" x2="12" y2="13"></line>
            <line x1="12" y1="17" x2="12.01" y2="17"></line>
          </svg>
          WebSocket disconnected. Messages will be processed locally until connection is restored.
          <button 
            onClick={handleReconnect}
            className="ml-2 underline hover:text-yellow-900"
          >
            Try reconnecting
          </button>
        </div>
      )}
      
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
