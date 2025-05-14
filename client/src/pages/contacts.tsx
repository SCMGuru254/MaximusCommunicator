import { Link } from 'wouter';
import ContactsList from '@/components/admin/ContactsList';

export default function Contacts() {
  return (
    <div className="bg-whatsapp-bg min-h-screen">
      {/* Header */}
      <div className="bg-whatsapp-dark text-white py-3 px-4 flex items-center justify-between shadow-md">
        <Link href="/">
          <a className="flex items-center">
            <span className="material-icons mr-2">arrow_back</span>
            <h1 className="font-medium text-xl">Contacts</h1>
          </a>
        </Link>
        <div className="flex items-center space-x-4">
          <button>
            <span className="material-icons">search</span>
          </button>
          <button>
            <span className="material-icons">person_add</span>
          </button>
        </div>
      </div>
      
      {/* Content */}
      <div className="max-w-4xl mx-auto px-4 py-6">
        <div className="bg-white rounded-md shadow-sm p-6">
          <ContactsList />
        </div>
      </div>
    </div>
  );
}
