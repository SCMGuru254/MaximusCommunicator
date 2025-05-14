import { Link } from 'wouter';

export default function Help() {
  return (
    <div className="bg-whatsapp-bg min-h-screen">
      {/* Header */}
      <div className="bg-whatsapp-dark text-white py-3 px-4 flex items-center shadow-md">
        <Link href="/">
          <a className="flex items-center">
            <span className="material-icons mr-2">arrow_back</span>
            <h1 className="font-medium text-xl">Help</h1>
          </a>
        </Link>
      </div>
      
      {/* Content */}
      <div className="max-w-4xl mx-auto px-4 py-6">
        <div className="bg-white rounded-md shadow-sm p-6">
          <h2 className="text-2xl font-medium text-whatsapp-dark mb-4">Maximus Assistant Help</h2>
          
          <div className="space-y-6">
            <section>
              <h3 className="text-lg font-medium text-whatsapp-dark mb-2 flex items-center">
                <span className="material-icons mr-2 text-whatsapp-green">info</span>
                About Maximus
              </h3>
              <p className="text-gray-700">
                Maximus is an AI-powered WhatsApp assistant that automatically responds to messages,
                markets your business, and directs users through menu options. It helps you manage
                conversations efficiently while providing a consistent experience for your contacts.
              </p>
            </section>
            
            <section>
              <h3 className="text-lg font-medium text-whatsapp-dark mb-2 flex items-center">
                <span className="material-icons mr-2 text-whatsapp-green">help_outline</span>
                Getting Started
              </h3>
              <ol className="list-decimal pl-5 space-y-2 text-gray-700">
                <li>
                  <strong>Configure Settings:</strong> Set up your assistant name, welcome message, and security preferences.
                </li>
                <li>
                  <strong>Create Menu Options:</strong> Use the Menu Builder to customize the options presented to contacts.
                </li>
                <li>
                  <strong>Add Exempted Contacts:</strong> Specify contacts who should bypass AI responses and receive direct messages.
                </li>
                <li>
                  <strong>Set Form Integration:</strong> Ensure your Tally form link is correctly configured.
                </li>
                <li>
                  <strong>Test the System:</strong> Use the simulation feature to test how Maximus responds to different messages.
                </li>
              </ol>
            </section>
            
            <section>
              <h3 className="text-lg font-medium text-whatsapp-dark mb-2 flex items-center">
                <span className="material-icons mr-2 text-whatsapp-green">settings</span>
                Key Features
              </h3>
              <ul className="list-disc pl-5 space-y-2 text-gray-700">
                <li>
                  <strong>AI-Powered Responses:</strong> Automatically respond to messages based on their content.
                </li>
                <li>
                  <strong>Menu-Based Navigation:</strong> Guide contacts through a structured conversation with menu options.
                </li>
                <li>
                  <strong>Contact Exemption:</strong> Skip AI responses for specified contacts who require personal attention.
                </li>
                <li>
                  <strong>Form Integration:</strong> Direct personal inquiries to a Tally form for structured data collection.
                </li>
                <li>
                  <strong>Message Encryption:</strong> Optional end-to-end encryption for enhanced privacy.
                </li>
                <li>
                  <strong>Analytics Dashboard:</strong> Track conversation metrics and message patterns.
                </li>
              </ul>
            </section>
            
            <section>
              <h3 className="text-lg font-medium text-whatsapp-dark mb-2 flex items-center">
                <span className="material-icons mr-2 text-whatsapp-green">support</span>
                Support
              </h3>
              <p className="text-gray-700">
                For additional help or questions about Maximus, please contact support at:
              </p>
              <div className="mt-2 p-3 bg-gray-50 border rounded-md">
                <p className="text-whatsapp-dark">
                  <strong>Email:</strong> support@maximus-assistant.com<br />
                  <strong>WhatsApp:</strong> +1 (555) 123-4567
                </p>
              </div>
            </section>
            
            <section className="bg-whatsapp-green bg-opacity-10 p-4 rounded-md">
              <h3 className="text-lg font-medium text-whatsapp-dark mb-2 flex items-center">
                <span className="material-icons mr-2 text-whatsapp-green">tips_and_updates</span>
                Pro Tips
              </h3>
              <ul className="list-disc pl-5 space-y-1 text-gray-700">
                <li>Regularly review analytics to understand common customer inquiries</li>
                <li>Update menu options periodically to reflect changes in your business</li>
                <li>Use clear, concise language in your automated responses</li>
                <li>Create specific responses for different contact categories</li>
                <li>Test your configuration with different message scenarios</li>
              </ul>
            </section>
          </div>
        </div>
      </div>
    </div>
  );
}
