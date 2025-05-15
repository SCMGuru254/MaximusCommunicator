import { useState } from 'react';
import { useToast } from '@/hooks/use-toast';
import { apiRequest } from '@/lib/queryClient';

export default function WhatsAppSettings() {
  const [apiKey, setApiKey] = useState('');
  const [phoneNumberId, setPhoneNumberId] = useState('');
  const [businessAccountId, setBusinessAccountId] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!apiKey || !phoneNumberId || !businessAccountId) {
      toast({
        title: 'Missing fields',
        description: 'Please fill out all required fields',
        variant: 'destructive'
      });
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      const response = await apiRequest(
        'POST',
        '/api/whatsapp/config',
        {
          apiKey,
          phoneNumberId,
          businessAccountId
        }
      );
      
      toast({
        title: 'Success',
        description: 'WhatsApp API credentials updated successfully!'
      });
      
      // Clear form
      setApiKey('');
      setPhoneNumberId('');
      setBusinessAccountId('');
    } catch (error) {
      console.error('Error updating WhatsApp API credentials:', error);
      toast({
        title: 'Error',
        description: 'Failed to update WhatsApp API credentials. Please try again.',
        variant: 'destructive'
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-medium">WhatsApp Business API Configuration</h3>
      <p className="text-sm text-gray-500">
        Connect to the WhatsApp Business API to enable sending and receiving WhatsApp messages.
        You'll need to create a WhatsApp Business account and obtain API credentials from Meta Business Platform.
      </p>
      
      <form onSubmit={handleSubmit} className="space-y-4 mt-4">
        <div>
          <label className="block text-sm font-medium mb-1">
            API Key (Token)
          </label>
          <input
            type="password"
            value={apiKey}
            onChange={(e) => setApiKey(e.target.value)}
            className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-whatsapp-green"
            placeholder="WhatsApp API Key"
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium mb-1">
            Phone Number ID
          </label>
          <input
            type="text"
            value={phoneNumberId}
            onChange={(e) => setPhoneNumberId(e.target.value)}
            className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-whatsapp-green"
            placeholder="Your WhatsApp Phone Number ID"
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium mb-1">
            Business Account ID
          </label>
          <input
            type="text"
            value={businessAccountId}
            onChange={(e) => setBusinessAccountId(e.target.value)}
            className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-whatsapp-green"
            placeholder="Your Business Account ID"
          />
        </div>
        
        <button
          type="submit"
          disabled={isSubmitting}
          className={`px-4 py-2 rounded text-white ${
            isSubmitting ? 'bg-gray-400' : 'bg-whatsapp-green hover:bg-whatsapp-dark'
          }`}
        >
          {isSubmitting ? 'Updating...' : 'Update WhatsApp Configuration'}
        </button>
      </form>
      
      <div className="mt-6 pt-4 border-t">
        <h4 className="font-medium">WhatsApp Webhook Setup</h4>
        <p className="text-sm text-gray-500 mt-1">
          To receive messages from WhatsApp, you need to set up a webhook in your Meta Business Platform dashboard.
          Use the following URL as your webhook endpoint:
        </p>
        <div className="bg-gray-100 p-3 rounded mt-2 text-sm font-mono break-all">
          {`${window.location.origin}/api/webhooks/whatsapp`}
        </div>
      </div>
    </div>
  );
}