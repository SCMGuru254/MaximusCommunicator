import { useState, useEffect } from 'react';
import { Link } from 'wouter';
import { apiRequest } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';
import ExemptedContacts from '@/components/settings/ExemptedContacts';
import MenuOptions from '@/components/settings/MenuOptions';
import SecuritySettings from '@/components/settings/SecuritySettings';
import ContactsList from '@/components/admin/ContactsList';
import MessageAnalytics from '@/components/admin/MessageAnalytics';

export default function Admin() {
  const [activeTab, setActiveTab] = useState<'dashboard' | 'contacts' | 'menu' | 'security' | 'analytics'>('dashboard');
  const [assistantActive, setAssistantActive] = useState(true);
  const [assistantName, setAssistantName] = useState('Maximus');
  const [welcomeMessage, setWelcomeMessage] = useState('👋 Hello! I\'m Maximus, your AI assistant. I\'m here to help you with inquiries related to the business. How can I assist you today?');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const { toast } = useToast();

  // Fetch settings
  useEffect(() => {
    const fetchSettings = async () => {
      try {
        setLoading(true);
        
        // Fetch AI assistant active state
        const activeRes = await apiRequest('GET', '/api/settings/ai_assistant_active');
        const activeData = await activeRes.json();
        setAssistantActive(activeData.value === 'true');
        
        // Fetch assistant name
        const nameRes = await apiRequest('GET', '/api/settings/assistant_name');
        const nameData = await nameRes.json();
        setAssistantName(nameData.value);
        
        setLoading(false);
      } catch (error) {
        toast({
          title: 'Error',
          description: 'Failed to load settings',
          variant: 'destructive'
        });
        setLoading(false);
      }
    };
    
    fetchSettings();
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

  // Save assistant settings
  const saveAssistantSettings = async () => {
    try {
      setSaving(true);
      
      // Update assistant name
      await apiRequest('PUT', '/api/settings/assistant_name', {
        value: assistantName
      });
      
      toast({
        title: 'Success',
        description: 'Assistant settings saved successfully',
      });
      
      setSaving(false);
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to save assistant settings',
        variant: 'destructive'
      });
      
      setSaving(false);
    }
  };

  return (
    <div className="bg-whatsapp-bg min-h-screen">
      {/* Header */}
      <div className="bg-whatsapp-dark text-white py-3 px-4 flex items-center justify-between shadow-md">
        <Link href="/">
          <a className="flex items-center">
            <span className="material-icons mr-2">arrow_back</span>
            <h1 className="font-medium text-xl">Maximus Admin</h1>
          </a>
        </Link>
        <div>
          <button
            className={`${assistantActive ? 'bg-whatsapp-green' : 'bg-red-500'} hover:opacity-90 text-white py-1 px-3 rounded-md transition-colors flex items-center text-sm`}
            onClick={toggleAssistant}
            disabled={loading}
          >
            <span className="material-icons text-sm mr-1">{assistantActive ? 'toggle_on' : 'toggle_off'}</span>
            {loading ? 'Loading...' : assistantActive ? 'Active' : 'Inactive'}
          </button>
        </div>
      </div>
      
      {/* Admin Content */}
      <div className="flex max-w-6xl mx-auto px-4 py-6">
        {/* Admin Sidebar */}
        <div className="w-64 bg-white rounded-md shadow-sm mr-6 p-4">
          <h3 className="font-medium mb-4 text-whatsapp-dark border-b pb-2">Admin Menu</h3>
          <ul className="space-y-1">
            <li>
              <button
                className={`w-full text-left px-3 py-2 rounded-md flex items-center ${
                  activeTab === 'dashboard' ? 'bg-whatsapp-green bg-opacity-10 text-whatsapp-green' : 'hover:bg-gray-100'
                }`}
                onClick={() => setActiveTab('dashboard')}
              >
                <span className="material-icons mr-2 text-sm">dashboard</span>
                Dashboard
              </button>
            </li>
            <li>
              <button
                className={`w-full text-left px-3 py-2 rounded-md flex items-center ${
                  activeTab === 'contacts' ? 'bg-whatsapp-green bg-opacity-10 text-whatsapp-green' : 'hover:bg-gray-100'
                }`}
                onClick={() => setActiveTab('contacts')}
              >
                <span className="material-icons mr-2 text-sm">people</span>
                Contacts
              </button>
            </li>
            <li>
              <button
                className={`w-full text-left px-3 py-2 rounded-md flex items-center ${
                  activeTab === 'menu' ? 'bg-whatsapp-green bg-opacity-10 text-whatsapp-green' : 'hover:bg-gray-100'
                }`}
                onClick={() => setActiveTab('menu')}
              >
                <span className="material-icons mr-2 text-sm">format_list_bulleted</span>
                Menu Builder
              </button>
            </li>
            <li>
              <button
                className={`w-full text-left px-3 py-2 rounded-md flex items-center ${
                  activeTab === 'security' ? 'bg-whatsapp-green bg-opacity-10 text-whatsapp-green' : 'hover:bg-gray-100'
                }`}
                onClick={() => setActiveTab('security')}
              >
                <span className="material-icons mr-2 text-sm">security</span>
                Security
              </button>
            </li>
            <li>
              <button
                className={`w-full text-left px-3 py-2 rounded-md flex items-center ${
                  activeTab === 'analytics' ? 'bg-whatsapp-green bg-opacity-10 text-whatsapp-green' : 'hover:bg-gray-100'
                }`}
                onClick={() => setActiveTab('analytics')}
              >
                <span className="material-icons mr-2 text-sm">analytics</span>
                Analytics
              </button>
            </li>
          </ul>
          
          <div className="mt-8 border-t pt-4">
            <Link href="/">
              <a className="flex items-center text-gray-600 hover:text-whatsapp-green">
                <span className="material-icons mr-2 text-sm">chat</span>
                Back to Chat
              </a>
            </Link>
            <Link href="/help">
              <a className="flex items-center text-gray-600 hover:text-whatsapp-green mt-2">
                <span className="material-icons mr-2 text-sm">help</span>
                Help & Support
              </a>
            </Link>
          </div>
        </div>
        
        {/* Admin Content */}
        <div className="flex-1 bg-white rounded-md shadow-sm p-6">
          {/* Dashboard */}
          {activeTab === 'dashboard' && (
            <div>
              <h2 className="text-xl font-medium text-whatsapp-dark mb-4">Dashboard</h2>
              
              <div className="bg-whatsapp-green bg-opacity-10 p-4 rounded-md border border-whatsapp-green border-opacity-20 mb-6">
                <h3 className="text-whatsapp-dark font-medium flex items-center">
                  <span className="material-icons mr-2 text-whatsapp-green">notifications</span>
                  Maximus Assistant Status
                </h3>
                <p className="text-gray-700 mt-2">
                  {assistantActive 
                    ? 'Maximus is currently active and responding to messages.' 
                    : 'Maximus is currently inactive. No automated responses will be sent.'}
                </p>
              </div>
              
              <div className="space-y-6">
                <div className="border rounded-md p-4">
                  <h3 className="font-medium text-whatsapp-dark mb-3">AI Assistant Configuration</h3>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium mb-1">Assistant Name</label>
                      <input
                        type="text"
                        value={assistantName}
                        onChange={(e) => setAssistantName(e.target.value)}
                        className="w-full border rounded-md p-2 text-sm"
                      />
                      <p className="text-xs text-gray-500 mt-1">This name will be used when the assistant introduces itself.</p>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium mb-1">Welcome Message</label>
                      <textarea
                        value={welcomeMessage}
                        onChange={(e) => setWelcomeMessage(e.target.value)}
                        rows={3}
                        className="w-full border rounded-md p-2 text-sm"
                      />
                      <p className="text-xs text-gray-500 mt-1">This message will be sent when someone contacts you for the first time.</p>
                    </div>
                    
                    <div className="pt-2">
                      <button
                        className="bg-whatsapp-green hover:bg-whatsapp-dark text-white py-2 px-4 rounded-md text-sm transition-colors flex items-center"
                        onClick={saveAssistantSettings}
                        disabled={saving}
                      >
                        {saving ? (
                          <>
                            <span className="material-icons animate-spin mr-2 text-sm">refresh</span>
                            Saving...
                          </>
                        ) : (
                          <>
                            <span className="material-icons mr-2 text-sm">save</span>
                            Save Settings
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                </div>
                
                <div className="border rounded-md p-4">
                  <h3 className="font-medium text-whatsapp-dark mb-3">Quick Actions</h3>
                  <div className="grid grid-cols-2 gap-3">
                    <button
                      className="bg-gray-100 hover:bg-gray-200 p-3 rounded-md flex flex-col items-center justify-center transition-colors"
                      onClick={() => setActiveTab('contacts')}
                    >
                      <span className="material-icons text-whatsapp-dark text-xl mb-1">people</span>
                      <span className="text-sm font-medium">Manage Contacts</span>
                    </button>
                    
                    <button
                      className="bg-gray-100 hover:bg-gray-200 p-3 rounded-md flex flex-col items-center justify-center transition-colors"
                      onClick={() => setActiveTab('menu')}
                    >
                      <span className="material-icons text-whatsapp-dark text-xl mb-1">format_list_bulleted</span>
                      <span className="text-sm font-medium">Edit Menu Options</span>
                    </button>
                    
                    <button
                      className="bg-gray-100 hover:bg-gray-200 p-3 rounded-md flex flex-col items-center justify-center transition-colors"
                      onClick={() => setActiveTab('security')}
                    >
                      <span className="material-icons text-whatsapp-dark text-xl mb-1">security</span>
                      <span className="text-sm font-medium">Security Settings</span>
                    </button>
                    
                    <button
                      className="bg-gray-100 hover:bg-gray-200 p-3 rounded-md flex flex-col items-center justify-center transition-colors"
                      onClick={() => setActiveTab('analytics')}
                    >
                      <span className="material-icons text-whatsapp-dark text-xl mb-1">analytics</span>
                      <span className="text-sm font-medium">View Analytics</span>
                    </button>
                  </div>
                </div>
                
                <div className="border rounded-md p-4">
                  <h3 className="font-medium text-whatsapp-dark mb-3">Test WhatsApp Integration</h3>
                  <p className="text-sm text-gray-600 mb-3">
                    Send a test message to see how Maximus responds. This helps you verify your settings and menu options.
                  </p>
                  <Link href="/">
                    <a className="bg-whatsapp-green hover:bg-whatsapp-dark text-white py-2 px-4 rounded-md text-sm transition-colors inline-flex items-center">
                      <span className="material-icons mr-2 text-sm">send</span>
                      Open Chat Simulator
                    </a>
                  </Link>
                </div>
              </div>
            </div>
          )}
          
          {/* Contacts */}
          {activeTab === 'contacts' && (
            <div>
              <h2 className="text-xl font-medium text-whatsapp-dark mb-4">Contact Management</h2>
              <ContactsList />
            </div>
          )}
          
          {/* Menu Builder */}
          {activeTab === 'menu' && (
            <div>
              <h2 className="text-xl font-medium text-whatsapp-dark mb-4">Menu Builder</h2>
              <div className="mb-4 bg-blue-50 p-4 rounded-md border border-blue-200">
                <h3 className="text-blue-800 font-medium flex items-center">
                  <span className="material-icons mr-2 text-blue-600">lightbulb</span>
                  Tips for Effective Menus
                </h3>
                <ul className="text-sm text-blue-700 mt-2 list-disc pl-5 space-y-1">
                  <li>Keep menu options clear and concise</li>
                  <li>Limit top-level options to 4-5 choices</li>
                  <li>Make sure response text is helpful and specific</li>
                  <li>Consider the logical flow of conversation</li>
                </ul>
              </div>
              <MenuOptions />
            </div>
          )}
          
          {/* Security */}
          {activeTab === 'security' && (
            <div>
              <h2 className="text-xl font-medium text-whatsapp-dark mb-4">Security Settings</h2>
              <div className="mb-4 bg-yellow-50 p-4 rounded-md border border-yellow-200">
                <h3 className="text-yellow-800 font-medium flex items-center">
                  <span className="material-icons mr-2 text-yellow-600">security</span>
                  Security Information
                </h3>
                <p className="text-sm text-yellow-700 mt-2">
                  Enabling encryption helps protect message content from unauthorized access.
                  When storing conversation history, make sure you comply with relevant data
                  protection regulations.
                </p>
              </div>
              <SecuritySettings />
              <div className="mt-6 border-t pt-6">
                <h3 className="font-medium text-whatsapp-dark mb-3">Exempted Contacts</h3>
                <ExemptedContacts />
              </div>
            </div>
          )}
          
          {/* Analytics */}
          {activeTab === 'analytics' && (
            <div>
              <h2 className="text-xl font-medium text-whatsapp-dark mb-4">Message Analytics</h2>
              <div className="flex justify-end mb-4">
                <button className="flex items-center bg-whatsapp-green hover:bg-whatsapp-dark text-white py-2 px-4 rounded-md transition-colors">
                  <span className="material-icons mr-2">download</span>
                  Export Data
                </button>
              </div>
              <MessageAnalytics />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
