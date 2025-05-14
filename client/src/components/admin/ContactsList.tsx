import { useState, useEffect } from 'react';
import { apiRequest } from '@/lib/queryClient';
import { queryClient } from '@/lib/queryClient';
import { Contact } from '@shared/schema';
import { useToast } from '@/hooks/use-toast';

export default function ContactsList() {
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [editingContact, setEditingContact] = useState<Contact | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    phoneNumber: '',
    category: 'uncategorized',
    isExempted: false
  });
  
  const { toast } = useToast();
  
  // Fetch contacts
  useEffect(() => {
    const fetchContacts = async () => {
      try {
        setLoading(true);
        const res = await apiRequest('GET', '/api/contacts');
        const data = await res.json();
        setContacts(data);
        setLoading(false);
      } catch (error) {
        setError('Failed to load contacts');
        setLoading(false);
      }
    };
    
    fetchContacts();
  }, []);
  
  // Handle form input changes
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    setFormData({
      ...formData,
      [name]: type === 'checkbox' 
        ? (e.target as HTMLInputElement).checked 
        : value
    });
  };
  
  // Open edit form for a contact
  const handleEditContact = (contact: Contact) => {
    setEditingContact(contact);
    setFormData({
      name: contact.name,
      phoneNumber: contact.phoneNumber,
      category: contact.category,
      isExempted: contact.isExempted
    });
  };
  
  // Save contact changes
  const handleSaveContact = async () => {
    try {
      if (!editingContact) return;
      
      await apiRequest('PUT', `/api/contacts/${editingContact.id}`, formData);
      
      // Update the UI
      setContacts(contacts.map(c => 
        c.id === editingContact.id 
          ? { ...c, ...formData } 
          : c
      ));
      
      // Reset form
      setEditingContact(null);
      
      // Show success toast
      toast({
        title: 'Success',
        description: 'Contact updated successfully',
      });
      
      // Invalidate queries
      queryClient.invalidateQueries({ queryKey: ['/api/contacts'] });
    } catch (error) {
      setError('Failed to update contact');
    }
  };
  
  // Cancel editing
  const handleCancelEdit = () => {
    setEditingContact(null);
  };
  
  // Delete a contact
  const handleDeleteContact = async (contactId: number) => {
    try {
      await apiRequest('DELETE', `/api/contacts/${contactId}`);
      
      // Update the UI
      setContacts(contacts.filter(c => c.id !== contactId));
      
      // Show success toast
      toast({
        title: 'Success',
        description: 'Contact deleted successfully',
      });
      
      // Invalidate queries
      queryClient.invalidateQueries({ queryKey: ['/api/contacts'] });
    } catch (error) {
      setError('Failed to delete contact');
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
  
  // Get category label with color
  const getCategoryLabel = (category: string) => {
    switch (category) {
      case 'business':
        return <span className="bg-blue-100 text-blue-800 text-xs px-2 py-0.5 rounded">Business</span>;
      case 'work':
        return <span className="bg-green-100 text-green-800 text-xs px-2 py-0.5 rounded">Work</span>;
      case 'personal':
        return <span className="bg-purple-100 text-purple-800 text-xs px-2 py-0.5 rounded">Personal</span>;
      default:
        return <span className="bg-gray-100 text-gray-800 text-xs px-2 py-0.5 rounded">Uncategorized</span>;
    }
  };
  
  if (loading) {
    return (
      <div className="text-center py-4">
        <p>Loading contacts...</p>
      </div>
    );
  }
  
  // If editing, show the edit form
  if (editingContact) {
    return (
      <div className="space-y-3">
        <h3 className="font-medium text-whatsapp-dark">Edit Contact</h3>
        
        {error && (
          <div className="bg-red-100 text-red-800 p-2 rounded-md text-sm">
            {error}
          </div>
        )}
        
        <div className="space-y-3">
          <div>
            <label className="block text-sm font-medium mb-1">Name</label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleInputChange}
              className="w-full border rounded-md p-2 text-sm"
              placeholder="Contact name"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium mb-1">Phone Number</label>
            <input
              type="text"
              name="phoneNumber"
              value={formData.phoneNumber}
              onChange={handleInputChange}
              className="w-full border rounded-md p-2 text-sm"
              placeholder="Phone number"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium mb-1">Category</label>
            <select
              name="category"
              value={formData.category}
              onChange={handleInputChange}
              className="w-full border rounded-md p-2 text-sm"
            >
              <option value="uncategorized">Uncategorized</option>
              <option value="business">Business</option>
              <option value="work">Work</option>
              <option value="personal">Personal</option>
            </select>
          </div>
          
          <div className="flex items-center">
            <input
              type="checkbox"
              id="isExempted"
              name="isExempted"
              checked={formData.isExempted}
              onChange={handleInputChange}
              className="mr-2"
            />
            <label htmlFor="isExempted" className="text-sm">
              Exempt from AI responses
            </label>
          </div>
          
          <div className="flex space-x-2 pt-2">
            <button
              className="bg-whatsapp-green hover:bg-whatsapp-dark text-white py-2 px-4 rounded-md text-sm"
              onClick={handleSaveContact}
            >
              Save
            </button>
            <button
              className="border border-gray-300 hover:bg-gray-100 py-2 px-4 rounded-md text-sm"
              onClick={handleCancelEdit}
            >
              Cancel
            </button>
          </div>
        </div>
      </div>
    );
  }
  
  return (
    <div className="space-y-3">
      <h3 className="font-medium text-whatsapp-dark">Contacts</h3>
      
      {error && (
        <div className="bg-red-100 text-red-800 p-2 rounded-md text-sm">
          {error}
        </div>
      )}
      
      <div className="border rounded-md divide-y max-h-screen overflow-y-auto">
        {contacts.length === 0 ? (
          <div className="p-4 text-center text-gray-500">
            <p>No contacts found</p>
          </div>
        ) : (
          contacts.map(contact => (
            <div key={contact.id} className="p-3 hover:bg-gray-50">
              <div className="flex items-center">
                <div className={`h-10 w-10 rounded-full ${getAvatarColor(contact.name)} flex items-center justify-center text-white text-sm`}>
                  {getInitials(contact.name)}
                </div>
                <div className="ml-3 flex-1">
                  <div className="flex justify-between">
                    <p className="text-sm font-medium">{contact.name}</p>
                    <div className="flex space-x-2">
                      <button onClick={() => handleEditContact(contact)}>
                        <span className="material-icons text-blue-500">edit</span>
                      </button>
                      <button onClick={() => handleDeleteContact(contact.id)}>
                        <span className="material-icons text-red-500">delete</span>
                      </button>
                    </div>
                  </div>
                  <p className="text-xs text-gray-500">{contact.phoneNumber}</p>
                  <div className="mt-1 flex items-center space-x-2">
                    {getCategoryLabel(contact.category)}
                    {contact.isExempted && (
                      <span className="bg-yellow-100 text-yellow-800 text-xs px-2 py-0.5 rounded">Exempted</span>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
