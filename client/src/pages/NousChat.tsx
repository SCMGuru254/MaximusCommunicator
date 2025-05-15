import React, { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useToast } from "@/components/ui/use-toast";
import { useApi } from '@/hooks/useApi';
import { useSetting } from '@/hooks/useSetting';
import { useWebSocket } from '@/hooks/useWebSocket';

interface Message {
  id: number;
  content: string;
  isFromContact: boolean;
  timestamp: string;
}

interface Contact {
  id: number;
  name: string;
  phoneNumber: string;
  category: string;
  isExempted: boolean;
}

export function NousChat() {
  const { toast } = useToast();
  const api = useApi();
  const socket = useWebSocket();
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  
  const [message, setMessage] = useState<string>("");
  const [messages, setMessages] = useState<Message[]>([]);
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [selectedContact, setSelectedContact] = useState<Contact | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  
  const [assistantName] = useSetting('assistant_name');
  
  // Load contacts
  useEffect(() => {
    const loadContacts = async () => {
      try {
        const response = await api.get('/contacts');
        setContacts(response.data);
      } catch (error) {
        console.error('Error loading contacts:', error);
        toast({
          title: "Error",
          description: "Failed to load contacts. Please try again.",
          variant: "destructive",
        });
      }
    };
    
    loadContacts();
  }, [api, toast]);
  
  // Load messages for selected contact
  useEffect(() => {
    const loadMessages = async () => {
      if (!selectedContact) return;
      
      try {
        const response = await api.get(`/messages/${selectedContact.id}`);
        setMessages(response.data);
        
        // Scroll to bottom after messages load
        setTimeout(() => {
          if (scrollAreaRef.current) {
            scrollAreaRef.current.scrollTop = scrollAreaRef.current.scrollHeight;
          }
        }, 100);
      } catch (error) {
        console.error('Error loading messages:', error);
        toast({
          title: "Error",
          description: "Failed to load messages. Please try again.",
          variant: "destructive",
        });
      }
    };
    
    loadMessages();
  }, [api, selectedContact, toast]);
  
  // Handle WebSocket messages
  useEffect(() => {
    if (!socket) return;
    
    const handleSocketMessage = (event: MessageEvent) => {
      const data = JSON.parse(event.data);
      
      if (data.type === "nous_response" && selectedContact && data.contactId === selectedContact.id) {
        // Add the AI response to the messages
        setMessages(prev => [...prev, {
          id: Date.now(), // Temporary ID until we refresh
          content: data.content,
          isFromContact: false,
          timestamp: new Date().toISOString()
        }]);
        
        // Scroll to bottom
        setTimeout(() => {
          if (scrollAreaRef.current) {
            scrollAreaRef.current.scrollTop = scrollAreaRef.current.scrollHeight;
          }
        }, 100);
      }
    };
    
    socket.addEventListener('message', handleSocketMessage);
    
    return () => {
      socket.removeEventListener('message', handleSocketMessage);
    };
  }, [socket, selectedContact]);
  
  const handleSendMessage = async () => {
    if (!message.trim() || !selectedContact) return;
    
    setIsLoading(true);
    
    try {
      // Add the message to the UI immediately
      const newMessage = {
        id: Date.now(), // Temporary ID until we refresh
        content: message,
        isFromContact: true,
        timestamp: new Date().toISOString()
      };
      
      setMessages(prev => [...prev, newMessage]);
      
      // Clear the input
      setMessage("");
      
      // Scroll to bottom
      setTimeout(() => {
        if (scrollAreaRef.current) {
          scrollAreaRef.current.scrollTop = scrollAreaRef.current.scrollHeight;
        }
      }, 100);
      
      // Send the message via WebSocket
      if (socket && socket.readyState === WebSocket.OPEN) {
        socket.send(JSON.stringify({
          type: "nous_message",
          contactId: selectedContact.id,
          content: message
        }));
      } else {
        // Fallback to REST API if WebSocket is not available
        await api.post('/nous/chat', {
          contactId: selectedContact.id,
          content: message
        });
        
        // Refresh messages
        const response = await api.get(`/messages/${selectedContact.id}`);
        setMessages(response.data);
      }
    } catch (error) {
      console.error('Error sending message:', error);
      toast({
        title: "Error",
        description: "Failed to send message. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };
  
  return (
    <div className="container mx-auto py-10 grid grid-cols-4 gap-6 h-[calc(100vh-120px)]">
      {/* Contacts sidebar */}
      <Card className="col-span-1">
        <CardHeader>
          <CardTitle>Contacts</CardTitle>
          <CardDescription>Select a contact to chat with</CardDescription>
        </CardHeader>
        <CardContent>
          <ScrollArea className="h-[calc(100vh-250px)]">
            <div className="space-y-2">
              {contacts.map(contact => (
                <div
                  key={contact.id}
                  className={`p-3 rounded-md cursor-pointer hover:bg-accent ${selectedContact?.id === contact.id ? 'bg-accent' : ''}`}
                  onClick={() => setSelectedContact(contact)}
                >
                  <div className="flex items-center space-x-3">
                    <Avatar>
                      <AvatarFallback>{contact.name.substring(0, 2).toUpperCase()}</AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="font-medium">{contact.name}</p>
                      <p className="text-sm text-muted-foreground">{contact.category}</p>
                    </div>
                  </div>
                </div>
              ))}
              
              {contacts.length === 0 && (
                <p className="text-center text-muted-foreground py-4">No contacts found</p>
              )}
            </div>
          </ScrollArea>
        </CardContent>
      </Card>
      
      {/* Chat area */}
      <Card className="col-span-3">
        <CardHeader>
          <CardTitle>
            {selectedContact ? selectedContact.name : "Select a contact"}
          </CardTitle>
          <CardDescription>
            {selectedContact ? `Chat with ${selectedContact.name} using Nous AI` : "Please select a contact to start chatting"}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ScrollArea className="h-[calc(100vh-300px)]" ref={scrollAreaRef}>
            <div className="space-y-4">
              {messages.map(msg => (
                <div key={msg.id} className={`flex ${msg.isFromContact ? 'justify-start' : 'justify-end'}`}>
                  <div
                    className={`max-w-[80%] p-3 rounded-lg ${msg.isFromContact ? 'bg-accent text-accent-foreground' : 'bg-primary text-primary-foreground'}`}
                  >
                    <p>{msg.content}</p>
                    <p className="text-xs opacity-70 mt-1">
                      {new Date(msg.timestamp).toLocaleTimeString()}
                    </p>
                  </div>
                </div>
              ))}
              
              {messages.length === 0 && selectedContact && (
                <p className="text-center text-muted-foreground py-4">
                  No messages yet. Start a conversation!
                </p>
              )}
              
              {!selectedContact && (
                <p className="text-center text-muted-foreground py-4">
                  Select a contact to view messages
                </p>
              )}
            </div>
          </ScrollArea>
        </CardContent>
        <CardFooter>
          <div className="flex w-full space-x-2">
            <Input
              placeholder={selectedContact ? `Message ${selectedContact.name}...` : "Select a contact first..."}
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
              disabled={!selectedContact || isLoading}
            />
            <Button
              onClick={handleSendMessage}
              disabled={!selectedContact || !message.trim() || isLoading}
            >
              Send
            </Button>
          </div>
        </CardFooter>
      </Card>
    </div>
  );
}

export default NousChat;