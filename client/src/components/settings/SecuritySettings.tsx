import { useState, useEffect } from 'react';
import { apiRequest } from '@/lib/queryClient';
import { queryClient } from '@/lib/queryClient';

export default function SecuritySettings() {
  const [settings, setSettings] = useState({
    encryption_enabled: false,
    store_conversation_history: false,
    form_link: 'https://tally.so/r/w4q5Mo'
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'success' | 'error'>('idle');
  
  // Fetch security settings
  useEffect(() => {
    const fetchSettings = async () => {
      try {
        setLoading(true);
        
        // Fetch encryption setting
        const encryptionRes = await apiRequest('GET', '/api/settings/encryption_enabled');
        const encryptionData = await encryptionRes.json();
        
        // Fetch conversation history setting
        const historyRes = await apiRequest('GET', '/api/settings/store_conversation_history');
        const historyData = await historyRes.json();
        
        // Fetch form link
        const formLinkRes = await apiRequest('GET', '/api/settings/form_link');
        const formLinkData = await formLinkRes.json();
        
        setSettings({
          encryption_enabled: encryptionData.value === 'true',
          store_conversation_history: historyData.value === 'true',
          form_link: formLinkData.value
        });
        
        setLoading(false);
      } catch (error) {
        setError('Failed to load security settings');
        setLoading(false);
      }
    };
    
    fetchSettings();
  }, []);
  
  // Handle toggle changes
  const handleToggle = async (setting: 'encryption_enabled' | 'store_conversation_history') => {
    try {
      const newValue = !settings[setting];
      
      // Update UI immediately for better UX
      setSettings({
        ...settings,
        [setting]: newValue
      });
      
      // Send update to server
      await apiRequest('PUT', `/api/settings/${setting}`, {
        value: newValue.toString()
      });
      
      // Invalidate queries
      queryClient.invalidateQueries({ queryKey: [`/api/settings/${setting}`] });
    } catch (error) {
      setError(`Failed to update ${setting.replace('_', ' ')}`);
      
      // Revert UI change on error
      setSettings({
        ...settings,
        [setting]: !settings[setting]
      });
    }
  };
  
  // Handle form link update
  const handleFormLinkChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSettings({
      ...settings,
      form_link: e.target.value
    });
  };
  
  // Save form link
  const saveFormLink = async () => {
    try {
      setSaveStatus('saving');
      
      await apiRequest('PUT', '/api/settings/form_link', {
        value: settings.form_link
      });
      
      // Invalidate query
      queryClient.invalidateQueries({ queryKey: ['/api/settings/form_link'] });
      
      setSaveStatus('success');
      
      // Reset status after a delay
      setTimeout(() => {
        setSaveStatus('idle');
      }, 2000);
    } catch (error) {
      setError('Failed to update form link');
      setSaveStatus('error');
    }
  };
  
  if (loading) {
    return (
      <div className="text-center py-4">
        <p>Loading security settings...</p>
      </div>
    );
  }
  
  return (
    <div className="space-y-3">
      <h3 className="font-medium text-whatsapp-dark">Security</h3>
      
      {error && (
        <div className="bg-red-100 text-red-800 p-2 rounded-md text-sm">
          {error}
        </div>
      )}
      
      <div className="space-y-4">
        {/* Encryption Setting */}
        <div className="flex items-center justify-between">
          <div>
            <span className="text-sm">End-to-End Encryption</span>
            <p className="text-xs text-gray-500">Encrypt messages for added security</p>
          </div>
          <label className="relative inline-flex items-center cursor-pointer">
            <input 
              type="checkbox" 
              checked={settings.encryption_enabled}
              onChange={() => handleToggle('encryption_enabled')}
              className="sr-only peer" 
            />
            <div className="w-11 h-6 bg-gray-300 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-whatsapp-green"></div>
          </label>
        </div>
        
        {/* Conversation History Setting */}
        <div className="flex items-center justify-between">
          <div>
            <span className="text-sm">Store Conversation History</span>
            <p className="text-xs text-gray-500">Save message history for reference</p>
          </div>
          <label className="relative inline-flex items-center cursor-pointer">
            <input 
              type="checkbox" 
              checked={settings.store_conversation_history}
              onChange={() => handleToggle('store_conversation_history')}
              className="sr-only peer" 
            />
            <div className="w-11 h-6 bg-gray-300 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-whatsapp-green"></div>
          </label>
        </div>
        
        {/* Form Link Setting */}
        <div className="space-y-2">
          <h4 className="text-sm font-medium">Form Integration</h4>
          <div className="flex space-x-2">
            <input
              type="text"
              value={settings.form_link}
              onChange={handleFormLinkChange}
              className="flex-1 border rounded-md p-2 text-sm"
              placeholder="Tally form link"
            />
            <button 
              onClick={saveFormLink}
              disabled={saveStatus === 'saving'}
              className="bg-whatsapp-green hover:bg-whatsapp-dark text-white py-2 px-3 rounded-md text-sm transition-colors disabled:bg-gray-400"
            >
              {saveStatus === 'saving' ? 'Saving...' : 
               saveStatus === 'success' ? 'Saved!' : 
               saveStatus === 'error' ? 'Try Again' : 'Save'}
            </button>
          </div>
          <p className="text-xs text-gray-500">This form link will be sent to contacts who select the "Personal Contact" option</p>
        </div>
      </div>
    </div>
  );
}
