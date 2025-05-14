import { Link } from 'wouter';
import MessageAnalytics from '@/components/admin/MessageAnalytics';

export default function Analytics() {
  return (
    <div className="bg-whatsapp-bg min-h-screen">
      {/* Header */}
      <div className="bg-whatsapp-dark text-white py-3 px-4 flex items-center shadow-md">
        <Link href="/">
          <a className="flex items-center">
            <span className="material-icons mr-2">arrow_back</span>
            <h1 className="font-medium text-xl">Analytics</h1>
          </a>
        </Link>
      </div>
      
      {/* Content */}
      <div className="max-w-6xl mx-auto px-4 py-6">
        <div className="bg-white rounded-md shadow-sm p-6">
          <div className="mb-6 flex justify-between items-center">
            <div>
              <h2 className="text-xl font-medium text-whatsapp-dark mb-1">Message Analytics</h2>
              <p className="text-gray-600">Track conversation metrics and message patterns</p>
            </div>
            <div>
              <button className="flex items-center bg-whatsapp-green hover:bg-whatsapp-dark text-white py-2 px-4 rounded-md transition-colors">
                <span className="material-icons mr-2">download</span>
                Export Data
              </button>
            </div>
          </div>
          
          <MessageAnalytics />
        </div>
      </div>
    </div>
  );
}
