import { useState, useEffect } from 'react';
import { apiRequest } from '@/lib/queryClient';
import { queryClient } from '@/lib/queryClient';
import { Contact } from '@shared/schema';

export default function ExemptedContacts() {
  const [exemptedContacts, setExemptedContacts] = useState<Contact[]>([]);
  const [allContacts, setAllContacts] = useState<Contact[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedContact, setSelectedContact] = useState<string>('');
  
  // Fetch exempted contacts and all contacts
  useEffect(() => {
    const fetchContacts = async () => {
      try {
        setLoading(true);
        
        // Fetch exempted contacts
        const exemptedRes = await apiRequest('GET', '/api/contacts/exempted');
        const exemptedData = await exemptedRes.json();
        setExemptedContacts(exemptedData);
        
        // Fetch all contacts
        const allRes = await apiRequest('GET', '/api/contacts');
        const allData = await allRes.json();
        setAllContacts(allData);
        
        setLoading(false);
      } catch (error) {
        setError('Failed to load contacts');
        setLoading(false);
      }
    };
    
    fetchContacts();
  }, []);
  
  // Get contacts that are not exempted for the dropdown
  const nonExemptedContacts = allContacts.filter(
    contact => !exemptedContacts.some(exempted => exempted.id === contact.id)
  );
  
  // Function to add a contact to exempted list
  const addExemptedContact = async () => {
    if (!selectedContact) return;
    
    try {
      const contactId = parseInt(selectedContact);
      const contact = allContacts.find(c => c.id === contactId);
      
      if (!contact) {
        setError('Contact not found');
        return;
      }
      
      // Update the contact to be exempted
      await apiRequest('PUT', `/api/contacts/${contactId}`, {
        ...contact,
        isExempted: true
      });
      
      // Update the UI
      setExemptedContacts([...exemptedContacts, { ...contact, isExempted: true }]);
      setSelectedContact('');
      
      // Invalidate contacts queries
      queryClient.invalidateQueries({ queryKey: ['/api/contacts'] });
      queryClient.invalidateQueries({ queryKey: ['/api/contacts/exempted'] });
    } catch (error) {
      setError('Failed to add exempted contact');
    }
  };
  
  // Function to remove a contact from exempted list
  const removeExemptedContact = async (contactId: number) => {
    try {
      const contact = exemptedContacts.find(c => c.id === contactId);
      
      if (!contact) {
        setError('Contact not found');
        return;
      }
      
      // Update the contact to not be exempted
      await apiRequest('PUT', `/api/contacts/${contactId}`, {
        ...contact,
        isExempted: false
      });
      
      // Update the UI
      setExemptedContacts(exemptedContacts.filter(c => c.id !== contactId));
      
      // Invalidate contacts queries
      queryClient.invalidateQueries({ queryKey: ['/api/contacts'] });
      queryClient.invalidateQueries({ queryKey: ['/api/contacts/exempted'] });
    } catch (error) {
      setError('Failed to remove exempted contact');
    }
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
  
  if (loading) {
    return (
      <div className="text-center py-4">
        <p>Loading contacts...</p>
      </div>
    );
  }
  
  return (
    <div className="space-y-3">
      <h3 className="font-medium text-whatsapp-dark">Exempted Contacts</h3>
      <p className="text-xs text-gray-500">These contacts will receive direct messages instead of AI responses</p>
      
      {error && (
        <div className="bg-red-100 text-red-800 p-2 rounded-md text-sm">
          {error}
        </div>
      )}
      
      <div className="border rounded-md divide-y max-h-60 overflow-y-auto">
        {exemptedContacts.length === 0 ? (
          <div className="p-4 text-center text-gray-500">
            <p>No exempted contacts yet</p>
          </div>
        ) : (
          exemptedContacts.map(contact => (
            <div key={contact.id} className="flex items-center p-3 hover:bg-gray-50">
              <div className={`h-8 w-8 rounded-full ${getAvatarColor(contact.name)} flex items-center justify-center text-white text-sm`}>
                {getInitials(contact.name)}
              </div>
              <div className="ml-3">
                <p className="text-sm font-medium">{contact.name}</p>
                <p className="text-xs text-gray-500">{contact.phoneNumber}</p>
              </div>
              <button 
                className="ml-auto"
                onClick={() => removeExemptedContact(contact.id)}
              >
                <span className="material-icons text-red-500">delete</span>
              </button>
            </div>
          ))
        )}
      </div>
      
      <div className="flex items-center space-x-2 mt-2">
        <select
          className="flex-1 border rounded-md p-2 text-sm outline-none"
          value={selectedContact}
          onChange={(e) => setSelectedContact(e.target.value)}
        >
          <option value="">Select a contact</option>
          {nonExemptedContacts.map(contact => (
            <option key={contact.id} value={contact.id.toString()}>
              {contact.name} ({contact.phoneNumber})
            </option>
          ))}
        </select>
        <button 
          className="flex items-center text-whatsapp-green text-sm px-3 py-2 border rounded-md hover:bg-gray-50"
          onClick={addExemptedContact}
          disabled={!selectedContact}
        >
          <span className="material-icons text-sm mr-1">add_circle</span>
          Add
        </button>
      </div>
    </div>
  );
}
