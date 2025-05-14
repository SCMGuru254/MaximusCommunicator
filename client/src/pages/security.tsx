import { Link } from 'wouter';
import SecuritySettings from '@/components/settings/SecuritySettings';

export default function Security() {
  return (
    <div className="bg-whatsapp-bg min-h-screen">
      {/* Header */}
      <div className="bg-whatsapp-dark text-white py-3 px-4 flex items-center shadow-md">
        <Link href="/">
          <a className="flex items-center">
            <span className="material-icons mr-2">arrow_back</span>
            <h1 className="font-medium text-xl">Security</h1>
          </a>
        </Link>
      </div>
      
      {/* Content */}
      <div className="max-w-4xl mx-auto px-4 py-6">
        <div className="bg-white rounded-md shadow-sm p-6">
          <div className="mb-6">
            <h2 className="text-xl font-medium text-whatsapp-dark mb-2">Security Settings</h2>
            <p className="text-gray-600">
              Configure security and privacy settings for your WhatsApp assistant.
              Manage message encryption, data storage, and external integrations.
            </p>
          </div>
          
          <div className="mb-6 bg-yellow-50 p-4 rounded-md border border-yellow-200">
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
        </div>
      </div>
    </div>
  );
}
