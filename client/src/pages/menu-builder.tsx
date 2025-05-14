import { Link } from 'wouter';
import MenuOptions from '@/components/settings/MenuOptions';

export default function MenuBuilder() {
  return (
    <div className="bg-whatsapp-bg min-h-screen">
      {/* Header */}
      <div className="bg-whatsapp-dark text-white py-3 px-4 flex items-center shadow-md">
        <Link href="/">
          <a className="flex items-center">
            <span className="material-icons mr-2">arrow_back</span>
            <h1 className="font-medium text-xl">Menu Builder</h1>
          </a>
        </Link>
      </div>
      
      {/* Content */}
      <div className="max-w-4xl mx-auto px-4 py-6">
        <div className="bg-white rounded-md shadow-sm p-6">
          <div className="mb-6">
            <h2 className="text-xl font-medium text-whatsapp-dark mb-2">Menu Builder</h2>
            <p className="text-gray-600">
              Create and customize the menu options that Maximus presents to your contacts.
              Add top-level options and sub-menu items to guide the conversation flow.
            </p>
          </div>
          
          <div className="mb-6 bg-blue-50 p-4 rounded-md border border-blue-200">
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
      </div>
    </div>
  );
}
