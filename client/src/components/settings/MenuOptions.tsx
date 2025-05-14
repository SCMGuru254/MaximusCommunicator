import { useState, useEffect } from 'react';
import { apiRequest } from '@/lib/queryClient';
import { queryClient } from '@/lib/queryClient';
import { MenuOption } from '@shared/schema';

export default function MenuOptions() {
  const [menuOptions, setMenuOptions] = useState<MenuOption[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [editingOption, setEditingOption] = useState<MenuOption | null>(null);
  const [isAddingOption, setIsAddingOption] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    responseText: '',
    parentId: '',
    order: 0
  });
  
  // Fetch menu options
  useEffect(() => {
    const fetchMenuOptions = async () => {
      try {
        setLoading(true);
        const res = await apiRequest('GET', '/api/menu-options');
        const data = await res.json();
        setMenuOptions(data);
        setLoading(false);
      } catch (error) {
        setError('Failed to load menu options');
        setLoading(false);
      }
    };
    
    fetchMenuOptions();
  }, []);
  
  // Get top-level menu options
  const topLevelOptions = menuOptions.filter(option => !option.parentId);
  
  // Get all parent options for the dropdown
  const parentOptions = menuOptions.filter(option => 
    // Only include options that don't have a parent themselves
    !option.parentId
  );
  
  // Handle form input changes
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: name === 'parentId' || name === 'order' 
        ? value === '' ? '' : parseInt(value) 
        : value
    });
  };
  
  // Open edit form for an option
  const handleEditOption = (option: MenuOption) => {
    setEditingOption(option);
    setFormData({
      title: option.title,
      description: option.description || '',
      responseText: option.responseText || '',
      parentId: option.parentId ? option.parentId.toString() : '',
      order: option.order
    });
    setIsAddingOption(false);
  };
  
  // Open form to add a new option
  const handleAddOption = () => {
    setEditingOption(null);
    setFormData({
      title: '',
      description: '',
      responseText: '',
      parentId: '',
      order: menuOptions.length + 1
    });
    setIsAddingOption(true);
  };
  
  // Save changes (create or update)
  const handleSaveOption = async () => {
    try {
      const payload = {
        ...formData,
        parentId: formData.parentId ? parseInt(formData.parentId) : null
      };
      
      if (editingOption) {
        // Update existing option
        await apiRequest('PUT', `/api/menu-options/${editingOption.id}`, payload);
      } else {
        // Create new option
        await apiRequest('POST', '/api/menu-options', payload);
      }
      
      // Refresh data
      queryClient.invalidateQueries({ queryKey: ['/api/menu-options'] });
      
      // Reset form
      setEditingOption(null);
      setIsAddingOption(false);
      
      // Fetch updated data
      const res = await apiRequest('GET', '/api/menu-options');
      const data = await res.json();
      setMenuOptions(data);
    } catch (error) {
      setError('Failed to save menu option');
    }
  };
  
  // Delete an option
  const handleDeleteOption = async (optionId: number) => {
    try {
      await apiRequest('DELETE', `/api/menu-options/${optionId}`);
      
      // Update the UI
      setMenuOptions(menuOptions.filter(o => o.id !== optionId));
      
      // Invalidate queries
      queryClient.invalidateQueries({ queryKey: ['/api/menu-options'] });
    } catch (error) {
      setError('Failed to delete menu option');
    }
  };
  
  // Cancel editing
  const handleCancelEdit = () => {
    setEditingOption(null);
    setIsAddingOption(false);
  };
  
  if (loading) {
    return (
      <div className="text-center py-4">
        <p>Loading menu options...</p>
      </div>
    );
  }
  
  // If editing or adding, show the form
  if (editingOption || isAddingOption) {
    return (
      <div className="space-y-3">
        <h3 className="font-medium text-whatsapp-dark">
          {editingOption ? 'Edit Menu Option' : 'Add Menu Option'}
        </h3>
        
        {error && (
          <div className="bg-red-100 text-red-800 p-2 rounded-md text-sm">
            {error}
          </div>
        )}
        
        <div className="space-y-3">
          <div>
            <label className="block text-sm font-medium mb-1">Title</label>
            <input
              type="text"
              name="title"
              value={formData.title}
              onChange={handleInputChange}
              className="w-full border rounded-md p-2 text-sm"
              placeholder="Option title"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium mb-1">Description</label>
            <input
              type="text"
              name="description"
              value={formData.description}
              onChange={handleInputChange}
              className="w-full border rounded-md p-2 text-sm"
              placeholder="Brief description"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium mb-1">Response Text</label>
            <textarea
              name="responseText"
              value={formData.responseText}
              onChange={handleInputChange}
              className="w-full border rounded-md p-2 text-sm"
              placeholder="AI response for this option"
              rows={3}
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium mb-1">Parent Option</label>
            <select
              name="parentId"
              value={formData.parentId}
              onChange={handleInputChange}
              className="w-full border rounded-md p-2 text-sm"
            >
              <option value="">No parent (top-level)</option>
              {parentOptions.map(option => (
                <option key={option.id} value={option.id.toString()}>
                  {option.title}
                </option>
              ))}
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium mb-1">Display Order</label>
            <input
              type="number"
              name="order"
              value={formData.order}
              onChange={handleInputChange}
              className="w-full border rounded-md p-2 text-sm"
              min={0}
            />
          </div>
          
          <div className="flex space-x-2 pt-2">
            <button
              className="bg-whatsapp-green hover:bg-whatsapp-dark text-white py-2 px-4 rounded-md text-sm"
              onClick={handleSaveOption}
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
      <h3 className="font-medium text-whatsapp-dark">Menu Options</h3>
      <p className="text-xs text-gray-500">Customize the menu options presented to contacts</p>
      
      {error && (
        <div className="bg-red-100 text-red-800 p-2 rounded-md text-sm">
          {error}
        </div>
      )}
      
      <div className="space-y-2">
        {topLevelOptions.length === 0 ? (
          <div className="p-4 text-center text-gray-500 border rounded-md">
            <p>No menu options created yet</p>
          </div>
        ) : (
          topLevelOptions.map(option => (
            <div key={option.id} className="border rounded-md p-3 hover:bg-gray-50">
              <div className="flex justify-between items-center">
                <p className="text-sm font-medium">{option.title}</p>
                <div className="flex space-x-2">
                  <button onClick={() => handleEditOption(option)}>
                    <span className="material-icons text-blue-500">edit</span>
                  </button>
                  <button onClick={() => handleDeleteOption(option.id)}>
                    <span className="material-icons text-red-500">delete</span>
                  </button>
                </div>
              </div>
              
              {/* Show description if available */}
              {option.description && (
                <p className="text-xs text-gray-500 mt-1">{option.description}</p>
              )}
              
              {/* Show child options if any */}
              {menuOptions.some(o => o.parentId === option.id) && (
                <div className="mt-2 pl-4 border-l-2 border-gray-200">
                  <p className="text-xs font-medium">Submenu:</p>
                  {menuOptions
                    .filter(o => o.parentId === option.id)
                    .map(subOption => (
                      <div key={subOption.id} className="flex justify-between items-center mt-1 text-sm">
                        <span>{subOption.title}</span>
                        <div className="flex space-x-2">
                          <button onClick={() => handleEditOption(subOption)}>
                            <span className="material-icons text-blue-500 text-sm">edit</span>
                          </button>
                          <button onClick={() => handleDeleteOption(subOption.id)}>
                            <span className="material-icons text-red-500 text-sm">delete</span>
                          </button>
                        </div>
                      </div>
                    ))}
                </div>
              )}
            </div>
          ))
        )}
      </div>
      
      <div className="flex items-center mt-2">
        <button 
          className="flex items-center text-whatsapp-green text-sm px-3 py-2 border rounded-md hover:bg-gray-50"
          onClick={handleAddOption}
        >
          <span className="material-icons text-sm mr-1">add_circle</span>
          Add Menu Option
        </button>
      </div>
    </div>
  );
}
