import { useState, useEffect } from 'react';
import { apiRequest } from '@/lib/queryClient';
import { Message, Contact } from '@shared/schema';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  PieChart,
  Pie,
  Cell
} from 'recharts';

export default function MessageAnalytics() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Fetch messages and contacts
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        
        // Get all contacts
        const contactsRes = await apiRequest('GET', '/api/contacts');
        const contactsData = await contactsRes.json();
        setContacts(contactsData);
        
        // Get messages for each contact
        const allMessages: Message[] = [];
        
        for (const contact of contactsData) {
          const messagesRes = await apiRequest('GET', `/api/messages/${contact.id}`);
          const messagesData = await messagesRes.json();
          allMessages.push(...messagesData);
        }
        
        setMessages(allMessages);
        setLoading(false);
      } catch (error) {
        setError('Failed to load analytics data');
        setLoading(false);
      }
    };
    
    fetchData();
  }, []);
  
  // Calculate message statistics
  const totalMessages = messages.length;
  const incomingMessages = messages.filter(m => m.isFromContact).length;
  const outgoingMessages = totalMessages - incomingMessages;
  
  // Messages by category
  const messagesByCategory = contacts.reduce((acc, contact) => {
    const category = contact.category || 'uncategorized';
    const contactMessages = messages.filter(m => m.contactId === contact.id).length;
    
    acc[category] = (acc[category] || 0) + contactMessages;
    return acc;
  }, {} as Record<string, number>);
  
  const categoryChartData = Object.entries(messagesByCategory).map(([category, count]) => ({
    name: category.charAt(0).toUpperCase() + category.slice(1),
    value: count
  }));
  
  // Messages by contact (top 5)
  const messagesByContact = contacts.map(contact => {
    const count = messages.filter(m => m.contactId === contact.id).length;
    return {
      name: contact.name,
      count
    };
  }).sort((a, b) => b.count - a.count).slice(0, 5);
  
  // Messages over time (last 7 days)
  const last7Days = Array.from({ length: 7 }, (_, i) => {
    const date = new Date();
    date.setDate(date.getDate() - i);
    return date.toISOString().split('T')[0];
  }).reverse();
  
  const messagesByDay = last7Days.map(day => {
    const dayMessages = messages.filter(m => 
      new Date(m.timestamp).toISOString().split('T')[0] === day
    );
    
    return {
      name: new Date(day).toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric' }),
      incoming: dayMessages.filter(m => m.isFromContact).length,
      outgoing: dayMessages.filter(m => !m.isFromContact).length
    };
  });
  
  // Colors for pie chart
  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8'];
  
  if (loading) {
    return (
      <div className="text-center py-4">
        <p>Loading analytics data...</p>
      </div>
    );
  }
  
  if (error) {
    return (
      <div className="bg-red-100 text-red-800 p-4 rounded-md">
        <p>{error}</p>
      </div>
    );
  }
  
  return (
    <div className="space-y-6">
      <h3 className="font-medium text-whatsapp-dark text-xl">Message Analytics</h3>
      
      {/* Message Count Summary */}
      <div className="grid grid-cols-3 gap-4">
        <div className="bg-blue-50 p-4 rounded-md text-center">
          <p className="text-3xl font-bold text-blue-600">{totalMessages}</p>
          <p className="text-sm text-blue-800">Total Messages</p>
        </div>
        <div className="bg-green-50 p-4 rounded-md text-center">
          <p className="text-3xl font-bold text-green-600">{incomingMessages}</p>
          <p className="text-sm text-green-800">Incoming</p>
        </div>
        <div className="bg-purple-50 p-4 rounded-md text-center">
          <p className="text-3xl font-bold text-purple-600">{outgoingMessages}</p>
          <p className="text-sm text-purple-800">Outgoing</p>
        </div>
      </div>
      
      {/* Messages by Category */}
      <div className="bg-white p-4 rounded-md border">
        <h4 className="text-lg font-medium mb-4">Messages by Category</h4>
        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={categoryChartData}
                nameKey="name"
                dataKey="value"
                cx="50%"
                cy="50%"
                outerRadius={100}
                fill="#8884d8"
                label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
              >
                {categoryChartData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>
      
      {/* Messages by Contact */}
      <div className="bg-white p-4 rounded-md border">
        <h4 className="text-lg font-medium mb-4">Top Contacts by Message Count</h4>
        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={messagesByContact}
              layout="vertical"
              margin={{ top: 20, right: 30, left: 100, bottom: 5 }}
            >
              <XAxis type="number" />
              <YAxis dataKey="name" type="category" />
              <Tooltip />
              <Bar dataKey="count" fill="#075E54" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
      
      {/* Messages Over Time */}
      <div className="bg-white p-4 rounded-md border">
        <h4 className="text-lg font-medium mb-4">Messages Over Time (Last 7 Days)</h4>
        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={messagesByDay}
              margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
            >
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="incoming" stackId="a" fill="#25D366" name="Incoming" />
              <Bar dataKey="outgoing" stackId="a" fill="#34B7F1" name="Outgoing" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
