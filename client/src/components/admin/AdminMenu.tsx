import { useState, useEffect } from 'react';
import { apiRequest } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';
import { Link } from 'wouter';

interface AdminMenuProps {
  onClose: () => void;
}

export default function AdminMenu({ onClose }: AdminMenuProps) {
  const [assistantActive, setAssistantActive] = useState(true);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();
  
  // Fetch assistant active state
  useEffect(() => {
    const fetchAssistantStatus = async () => {
      try {
        setLoading(true);
        const res = await apiRequest('GET', '/api/settings/ai_assistant_active');
        const data = await res.json();
        setAssistantActive(data.value === 'true');
        setLoading(false);
      } catch (error) {
        toast({
          title: 'Error',
          description: 'Failed to load assistant status',
          variant: 'destructive'
        });
        setLoading(false);
      }
    };
    
    fetchAssistantStatus();
  }, [toast]);
  
  // Toggle assistant active state
  const toggleAssistant = async () => {
    try {
      const newValue = !assistantActive;
      
      // Update UI immediately
      setAssistantActive(newValue);
      
      // Send update to server
      await apiRequest('PUT', '/api/settings/ai_assistant_active', {
        value: newValue.toString()
      });
      
      toast({
        title: 'Success',
        description: `Maximus Assistant is now ${newValue ? 'active' : 'inactive'}`,
      });
    } catch (error) {
      // Revert UI change on error
      setAssistantActive(!assistantActive);
      
      toast({
        title: 'Error',
        description: 'Failed to toggle assistant status',
        variant: 'destructive'
      });
    }
  };
  
  return (
    <div className="fixed inset-0 bg-black bg-opacity-70 z-50 flex items-center justify-center" onClick={onClose}>
      <div className="w-11/12 max-w-md bg-white rounded-lg shadow-xl p-4" onClick={(e) => e.stopPropagation()}>
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-medium text-whatsapp-dark">Maximus Admin</h2>
          <button onClick={onClose}>
            <span className="material-icons">close</span>
          </button>
        </div>
        
        <div className="grid grid-cols-2 gap-4">
          <Link href="/settings" onClick={onClose}>
            <button className="bg-gray-100 hover:bg-gray-200 p-4 rounded-lg flex flex-col items-center justify-center transition-colors w-full">
              <span className="material-icons text-whatsapp-dark text-2xl mb-2">settings</span>
              <span className="text-sm font-medium">Settings</span>
            </button>
          </Link>
          
          <Link href="/contacts" onClick={onClose}>
            <button className="bg-gray-100 hover:bg-gray-200 p-4 rounded-lg flex flex-col items-center justify-center transition-colors w-full">
              <span className="material-icons text-whatsapp-dark text-2xl mb-2">people</span>
              <span className="text-sm font-medium">Contacts</span>
            </button>
          </Link>
          
          <Link href="/analytics" onClick={onClose}>
            <button className="bg-gray-100 hover:bg-gray-200 p-4 rounded-lg flex flex-col items-center justify-center transition-colors w-full">
              <span className="material-icons text-whatsapp-dark text-2xl mb-2">analytics</span>
              <span className="text-sm font-medium">Analytics</span>
            </button>
          </Link>
          
          <Link href="/menu-builder" onClick={onClose}>
            <button className="bg-gray-100 hover:bg-gray-200 p-4 rounded-lg flex flex-col items-center justify-center transition-colors w-full">
              <span className="material-icons text-whatsapp-dark text-2xl mb-2">format_list_bulleted</span>
              <span className="text-sm font-medium">Menu Builder</span>
            </button>
          </Link>
          
          <Link href="/security" onClick={onClose}>
            <button className="bg-gray-100 hover:bg-gray-200 p-4 rounded-lg flex flex-col items-center justify-center transition-colors w-full">
              <span className="material-icons text-whatsapp-dark text-2xl mb-2">security</span>
              <span className="text-sm font-medium">Security</span>
            </button>
          </Link>
          
          <Link href="/help" onClick={onClose}>
            <button className="bg-gray-100 hover:bg-gray-200 p-4 rounded-lg flex flex-col items-center justify-center transition-colors w-full">
              <span className="material-icons text-whatsapp-dark text-2xl mb-2">help</span>
              <span className="text-sm font-medium">Help</span>
            </button>
          </Link>
        </div>
        
        <div className="mt-4 pt-4 border-t">
          <button 
            className={`w-full ${assistantActive ? 'bg-whatsapp-green' : 'bg-red-500'} hover:opacity-90 text-white py-2 rounded-md transition-colors flex items-center justify-center`}
            onClick={toggleAssistant}
            disabled={loading}
          >
            <span className="material-icons mr-1">{assistantActive ? 'toggle_on' : 'toggle_off'}</span>
            {loading ? 'Loading...' : `Toggle Assistant (Currently ${assistantActive ? 'ON' : 'OFF'})`}
          </button>
        </div>
      </div>
    </div>
  );
}
