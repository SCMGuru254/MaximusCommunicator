import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/components/ui/use-toast";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Switch } from "@/components/ui/switch";
import { useSetting } from '@/hooks/useSetting';
import { useApi } from '@/hooks/useApi';

export function NousSettings() {
  const { toast } = useToast();
  const api = useApi();
  
  // API Key state
  const [apiKey, setApiKey] = useState<string>("");
  const [isLoading, setIsLoading] = useState<boolean>(false);
  
  // Settings
  const [aiAssistantActive, setAiAssistantActive] = useSetting('ai_assistant_active');
  const [encryptionEnabled, setEncryptionEnabled] = useSetting('encryption_enabled');
  const [storeConversationHistory, setStoreConversationHistory] = useSetting('store_conversation_history');
  
  // Load API key from settings
  useEffect(() => {
    const loadApiKey = async () => {
      try {
        const response = await api.get('/settings/nous_api_key');
        if (response.data && response.data.value) {
          setApiKey(response.data.value);
        }
      } catch (error) {
        console.error('Error loading Nous API key:', error);
      }
    };
    
    loadApiKey();
  }, [api]);
  
  const handleSaveApiKey = async () => {
    setIsLoading(true);
    try {
      await api.post('/nous/credentials', {
        apiKey
      });
      
      toast({
        title: "API Key Saved",
        description: "Your Nous API key has been saved successfully.",
      });
    } catch (error) {
      console.error('Error saving Nous API key:', error);
      toast({
        title: "Error",
        description: "There was an error saving your Nous API key. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };
  
  return (
    <div className="container mx-auto py-10">
      <Tabs defaultValue="api-settings">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="api-settings">API Settings</TabsTrigger>
          <TabsTrigger value="chat-settings">Chat Settings</TabsTrigger>
        </TabsList>
        
        <TabsContent value="api-settings">
          <Card>
            <CardHeader>
              <CardTitle>Nous API Settings</CardTitle>
              <CardDescription>
                Configure your Nous: DeepHermes 3 Mistral 24B API credentials for chat functionality.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="api-key">API Key</Label>
                <Input
                  id="api-key"
                  type="password"
                  placeholder="sk-or-v1-xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx"
                  value={apiKey}
                  onChange={(e) => setApiKey(e.target.value)}
                />
                <p className="text-sm text-muted-foreground">
                  Enter your Nous API key to enable chat functionality.
                </p>
              </div>
            </CardContent>
            <CardFooter>
              <Button onClick={handleSaveApiKey} disabled={isLoading}>
                {isLoading ? "Saving..." : "Save API Key"}
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>
        
        <TabsContent value="chat-settings">
          <Card>
            <CardHeader>
              <CardTitle>Chat Settings</CardTitle>
              <CardDescription>
                Configure how the chat functionality works.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="ai-assistant">AI Assistant</Label>
                  <p className="text-sm text-muted-foreground">
                    Enable or disable the AI assistant for automatic responses.
                  </p>
                </div>
                <Switch
                  id="ai-assistant"
                  checked={aiAssistantActive === 'true'}
                  onCheckedChange={(checked) => setAiAssistantActive(checked ? 'true' : 'false')}
                />
              </div>
              
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="encryption">Message Encryption</Label>
                  <p className="text-sm text-muted-foreground">
                    Enable or disable encryption for messages.
                  </p>
                </div>
                <Switch
                  id="encryption"
                  checked={encryptionEnabled === 'true'}
                  onCheckedChange={(checked) => setEncryptionEnabled(checked ? 'true' : 'false')}
                />
              </div>
              
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="store-history">Store Conversation History</Label>
                  <p className="text-sm text-muted-foreground">
                    Enable or disable storing conversation history.
                  </p>
                </div>
                <Switch
                  id="store-history"
                  checked={storeConversationHistory === 'true'}
                  onCheckedChange={(checked) => setStoreConversationHistory(checked ? 'true' : 'false')}
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

export default NousSettings;