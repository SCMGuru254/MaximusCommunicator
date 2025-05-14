import { useState, useEffect } from 'react';
import { useWhatsApp } from '@/hooks/useWhatsApp';
import ChatInterface from '@/components/chat/ChatInterface';
import AdminMenu from '@/components/admin/AdminMenu';
import { Contact } from '@shared/schema';

export default function Home() {
  const [selectedContact, setSelectedContact] = useState<Contact | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [showAdminMenu, setShowAdminMenu] = useState(false);
  const { contacts, loading, error } = useWhatsApp();
  
  // Filter contacts based on search query
  const filteredContacts = searchQuery 
    ? contacts.filter(contact => 
        contact.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        contact.phoneNumber.includes(searchQuery)
      )
    : contacts;
  
  // Sort contacts by name
  const sortedContacts = [...filteredContacts].sort((a, b) => a.name.localeCompare(b.name));
  
  // Show admin menu when double-clicking on the header
  const handleHeaderDoubleClick = () => {
    setShowAdminMenu(true);
  };
  
  // Generate initials for the contact avatar
  const getInitials = (name: string) => {
    if (!name) return '';
    
    const parts = name.split(' ');
    if (parts.length === 1) return parts[0].charAt(0).toUpperCase();
    return (parts[0].charAt(0) + parts[parts.length - 1].charAt(0)).toUpperCase();
  };
  
  // Generate a color based on the contact name
  const getAvatarColor = (name: string) => {
    const colors = [
      'bg-purple-500', 'bg-blue-500', 'bg-green-500', 
      'bg-yellow-500', 'bg-red-500', 'bg-pink-500'
    ];
    
    let hash = 0;
    for (let i = 0; i < name.length; i++) {
      hash = name.charCodeAt(i) + ((hash << 5) - hash);
    }
    
    return colors[Math.abs(hash) % colors.length];
  };
  
  // If a contact is selected, show the chat interface
  if (selectedContact) {
    return (
      <ChatInterface
        phoneNumber={selectedContact.phoneNumber}
        contactName={selectedContact.name}
        onBack={() => setSelectedContact(null)}
      />
    );
  }
  
  return (
    <div className="flex flex-col h-screen">
      {/* Header */}
      <div 
        className="bg-whatsapp-dark text-white py-3 px-4 flex items-center justify-between shadow-md"
        onDoubleClick={handleHeaderDoubleClick}
      >
        <h1 className="font-medium text-xl">Maximus Assistant</h1>
        <div className="flex items-center space-x-4">
          <button>
            <span className="material-icons">search</span>
          </button>
          <button>
            <span className="material-icons">more_vert</span>
          </button>
        </div>
      </div>
      
      {/* Search Bar */}
      <div className="bg-gray-100 px-4 py-2">
        <div className="bg-white rounded-full px-4 py-2 flex items-center shadow-sm">
          <span className="material-icons text-gray-500 mr-2">search</span>
          <input 
            type="text" 
            placeholder="Search contacts" 
            className="flex-1 outline-none text-sm"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>
      
      {/* Contacts List */}
      <div className="flex-1 overflow-y-auto bg-white">
        {loading ? (
          <div className="text-center py-4">
            <p>Loading contacts...</p>
          </div>
        ) : error ? (
          <div className="text-center py-4 text-red-500">
            <p>{error}</p>
          </div>
        ) : sortedContacts.length === 0 ? (
          <div className="text-center py-4 text-gray-500">
            <p>No contacts found</p>
            {searchQuery && (
              <p className="text-sm mt-1">Try a different search term</p>
            )}
          </div>
        ) : (
          <div className="divide-y">
            {sortedContacts.map(contact => (
              <div 
                key={contact.id} 
                className="p-3 hover:bg-gray-50 cursor-pointer"
                onClick={() => setSelectedContact(contact)}
              >
                <div className="flex items-center">
                  <div className={`h-12 w-12 rounded-full ${getAvatarColor(contact.name)} flex items-center justify-center text-white text-lg`}>
                    {getInitials(contact.name)}
                  </div>
                  <div className="ml-3">
                    <p className="font-medium">{contact.name}</p>
                    <p className="text-xs text-gray-500">{contact.phoneNumber}</p>
                    {contact.isExempted && (
                      <span className="bg-yellow-100 text-yellow-800 text-xs px-2 py-0.5 rounded mt-1 inline-block">
                        Exempted
                      </span>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
      
      {/* Demo Controls */}
      <div className="bg-gray-100 p-3 border-t border-gray-300">
        <button 
          className="w-full bg-whatsapp-green hover:bg-whatsapp-dark text-white py-2 rounded-md transition-colors"
          onClick={() => setShowAdminMenu(true)}
        >
          Open Admin Menu
        </button>
      </div>
      
      {/* Admin Menu Modal */}
      {showAdminMenu && (
        <AdminMenu onClose={() => setShowAdminMenu(false)} />
      )}
    </div>
  );
}
