import { useState } from 'react';
import { Link } from 'wouter';
import ExemptedContacts from '@/components/settings/ExemptedContacts';
import MenuOptions from '@/components/settings/MenuOptions';
import SecuritySettings from '@/components/settings/SecuritySettings';

export default function Settings() {
  const [activeTab, setActiveTab] = useState<'ai' | 'contacts' | 'menu' | 'security'>('ai');
  
  return (
    <div className="bg-whatsapp-bg min-h-screen">
      {/* Header */}
      <div className="bg-whatsapp-dark text-white py-3 px-4 flex items-center shadow-md">
        <Link href="/">
          <a className="flex items-center">
            <span className="material-icons mr-2">arrow_back</span>
            <h1 className="font-medium text-xl">Settings</h1>
          </a>
        </Link>
      </div>
      
      {/* Settings Content */}
      <div className="max-w-4xl mx-auto px-4 py-6">
        {/* Settings Tabs */}
        <div className="bg-white rounded-md shadow-sm mb-6">
          <div className="flex border-b">
            <button
              className={`flex-1 py-3 px-4 text-center ${activeTab === 'ai' ? 'border-b-2 border-whatsapp-green text-whatsapp-green font-medium' : 'text-gray-600'}`}
              onClick={() => setActiveTab('ai')}
            >
              AI Assistant
            </button>
            <button
              className={`flex-1 py-3 px-4 text-center ${activeTab === 'contacts' ? 'border-b-2 border-whatsapp-green text-whatsapp-green font-medium' : 'text-gray-600'}`}
              onClick={() => setActiveTab('contacts')}
            >
              Exempted Contacts
            </button>
            <button
              className={`flex-1 py-3 px-4 text-center ${activeTab === 'menu' ? 'border-b-2 border-whatsapp-green text-whatsapp-green font-medium' : 'text-gray-600'}`}
              onClick={() => setActiveTab('menu')}
            >
              Menu Options
            </button>
            <button
              className={`flex-1 py-3 px-4 text-center ${activeTab === 'security' ? 'border-b-2 border-whatsapp-green text-whatsapp-green font-medium' : 'text-gray-600'}`}
              onClick={() => setActiveTab('security')}
            >
              Security
            </button>
          </div>
        </div>
        
        {/* Active Settings Panel */}
        <div className="bg-white rounded-md shadow-sm p-6">
          {activeTab === 'ai' && (
            <div className="space-y-3">
              <h3 className="font-medium text-whatsapp-dark">AI Assistant Configuration</h3>
              <div className="flex items-center justify-between">
                <span className="text-sm">AI Assistant Name</span>
                <input 
                  type="text" 
                  defaultValue="Maximus" 
                  className="border rounded p-2 w-48"
                />
              </div>
              <p className="text-xs text-gray-500">This is the name the assistant will use when introducing itself to contacts.</p>
              
              <div className="flex items-center justify-between mt-4">
                <span className="text-sm">AI Assistant Active</span>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input type="checkbox" defaultChecked className="sr-only peer" />
                  <div className="w-11 h-6 bg-gray-300 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-whatsapp-green"></div>
                </label>
              </div>
              <p className="text-xs text-gray-500">Turn the AI assistant on or off for all contacts (except exempted ones).</p>
              
              <div className="border-t mt-4 pt-4">
                <h4 className="font-medium">Response Settings</h4>
                <div className="mt-2">
                  <label className="block text-sm mb-1">Default Welcome Message</label>
                  <textarea 
                    className="w-full border rounded p-2 text-sm" 
                    rows={3}
                    defaultValue="👋 Hello! I'm Maximus, your AI assistant. I'm here to help you with inquiries related to the business. How can I assist you today?"
                  ></textarea>
                </div>
                <p className="text-xs text-gray-500 mt-1">This message will be sent when someone contacts you for the first time.</p>
              </div>
            </div>
          )}
          
          {activeTab === 'contacts' && <ExemptedContacts />}
          
          {activeTab === 'menu' && <MenuOptions />}
          
          {activeTab === 'security' && <SecuritySettings />}
        </div>
      </div>
    </div>
  );
}
