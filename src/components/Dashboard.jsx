import React, { useEffect, useState } from 'react';
import { 
  FiUsers, 
  FiShoppingBag, 
  FiFileText, 
  FiTrendingUp,
  FiEye,
  FiDownload,
  FiArrowUp,
  FiArrowDown
} from 'react-icons/fi';
import { useNavigate } from 'react-router-dom';

const Dashboard = () => {
  const [counts, setCounts] = useState({ users: 0, products: 0, blogs: 0, leads: 0, inquiries: 0 });
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [recentLeads, setRecentLeads] = useState([]);
  const [recentActivities, setRecentActivities] = useState([]);

  useEffect(() => {
    const fetchCounts = async () => {
      try {
        const token = localStorage.getItem('adminToken');
        const base = import.meta.env.VITE_API_URL || 'https://backend.readymadewall.in';
        const res = await fetch(`${base}/api/stats/summary`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.message || 'Failed to load stats');
        setCounts(data);
      } catch (e) {
        setError(e.message);
      }
    };
    const fetchRecentLeads = async () => {
      try {
        const token = localStorage.getItem('adminToken');
        const base = import.meta.env.VITE_API_URL || 'https://backend.readymadewall.in';
        const res = await fetch(`${base}/api/leads?page=1&limit=6`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.message || 'Failed to load recent leads');
        setRecentLeads(Array.isArray(data.leads) ? data.leads : []);
        // Build lightweight activities from leads
        const acts = (data.leads || []).slice(0, 6).map((l) => ({
          action: 'New lead added',
          description: `${l.name} • ${l.email || ''}`.trim(),
          time: new Date(l.createdAt).toLocaleString()
        }));
        setRecentActivities(acts);
      } catch (e) {
        setError((prev) => prev || e.message);
      } finally {
        setLoading(false);
      }
    };
    fetchCounts();
    fetchRecentLeads();
  }, []);

  const statsCards = [
    { title: 'Total Leads', value: String(counts.leads), change: '+0%', changeType: 'positive', icon: FiUsers, color: 'bg-blue-500' },
    { title: 'Total Products', value: String(counts.products), change: '+0%', changeType: 'positive', icon: FiShoppingBag, color: 'bg-green-500' },
    { title: 'Total Blogs', value: String(counts.blogs), change: '+0%', changeType: 'positive', icon: FiFileText, color: 'bg-purple-500' },
    { title: 'Total Users', value: String(counts.users), change: '+0%', changeType: 'positive', icon: FiTrendingUp, color: 'bg-orange-500' }
  ];

  // helpers
  const statusChip = (status) => {
    const s = (status || 'new').toLowerCase();
    if (s === 'new') return 'bg-blue-100 text-blue-800';
    if (s === 'contacted') return 'bg-yellow-100 text-yellow-800';
    if (s === 'qualified') return 'bg-purple-100 text-purple-800';
    if (s === 'won') return 'bg-green-100 text-green-800';
    if (s === 'lost') return 'bg-red-100 text-red-800';
    return 'bg-gray-100 text-gray-800';
  };

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-sm sm:text-base text-gray-600 mt-1">Welcome back! Here's what's happening with your business.</p>
        </div>
        <div className="flex flex-col sm:flex-row gap-3">
          <button onClick={() => navigate('/leads', { state: { openCreate: true } })} className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm sm:text-base flex items-center justify-center gap-2">
            <FiDownload className="inline" size={16} />
            <span>Add New Lead</span>
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      {error && (
        <div className="bg-red-50 text-red-700 text-sm px-3 py-2 rounded">{error}</div>
      )}
      {loading ? (
        <div className="flex items-center justify-center h-24">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600"></div>
        </div>
      ) : null}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        {statsCards.map((card, index) => {
          const Icon = card.icon;
          return (
            <div key={index} className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 sm:p-6">
              <div className="flex items-center justify-between">
                <div className="flex-1 min-w-0">
                  <p className="text-xs sm:text-sm font-medium text-gray-600 truncate">{card.title}</p>
                  <p className="text-lg sm:text-xl lg:text-2xl font-bold text-gray-900 mt-1">{card.value}</p>
                </div>
                <div className={`p-2 sm:p-3 rounded-lg ${card.color} flex-shrink-0 ml-3`}>
                  <Icon className="text-white" size={20} />
                </div>
              </div>
              <div className="flex items-center mt-3 sm:mt-4">
                {card.changeType === 'positive' ? (
                  <FiArrowUp className="text-green-500 mr-1 flex-shrink-0" size={14} />
                ) : (
                  <FiArrowDown className="text-red-500 mr-1 flex-shrink-0" size={14} />
                )}
                <span className={`text-xs sm:text-sm font-medium ${
                  card.changeType === 'positive' ? 'text-green-600' : 'text-red-600'
                }`}>
                  {card.change}
                </span>
                <span className="text-xs text-gray-500 ml-1 hidden sm:inline">from last month</span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Charts and Recent Data */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-4 sm:gap-6">
        {/* Recent Leads */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          <div className="p-4 sm:p-6 border-b border-gray-200">
            <h3 className="text-base sm:text-lg font-semibold text-gray-900">Recent Leads</h3>
            <p className="text-xs sm:text-sm text-gray-600">Latest lead submissions</p>
          </div>
          <div className="p-4 sm:p-6">
            <div className="space-y-3 sm:space-y-4">
              {(recentLeads || []).map((lead, index) => (
                <div key={index} className="flex items-center justify-between p-3 sm:p-4 bg-gray-50 rounded-lg">
                  <div className="flex items-center space-x-2 sm:space-x-3 min-w-0 flex-1">
                    <div className="w-8 h-8 sm:w-10 sm:h-10 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                      <span className="text-blue-600 font-semibold text-xs sm:text-sm">
                        {lead.name.split(' ').map(n => n[0]).join('')}
                      </span>
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="font-medium text-gray-900 text-sm sm:text-base truncate">{lead.name}</p>
                      <p className="text-xs sm:text-sm text-gray-600 truncate">{lead.email}</p>
                    </div>
                  </div>
                  <div className="text-right flex-shrink-0 ml-2">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${statusChip(lead.status)}`}>
                      {lead.status || 'new'}
                    </span>
                    <p className="text-xs text-gray-500 mt-1">{new Date(lead.createdAt).toLocaleString()}</p>
                  </div>
                </div>
              ))}
            </div>
            <div className="mt-4 sm:mt-6">
              <button className="w-full py-2 text-blue-600 hover:text-blue-700 font-medium text-sm sm:text-base">
                View All Leads
              </button>
            </div>
          </div>
        </div>

        {/* Recent Activities */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          <div className="p-4 sm:p-6 border-b border-gray-200">
            <h3 className="text-base sm:text-lg font-semibold text-gray-900">Recent Activities</h3>
            <p className="text-xs sm:text-sm text-gray-600">Latest system activities</p>
          </div>
          <div className="p-4 sm:p-6">
            <div className="space-y-3 sm:space-y-4">
              {(recentActivities || []).map((activity, index) => (
                <div key={index} className="flex items-start space-x-2 sm:space-x-3">
                  <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0"></div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-gray-900 text-sm sm:text-base">{activity.action}</p>
                    <p className="text-xs sm:text-sm text-gray-600">{activity.description}</p>
                    <p className="text-xs text-gray-500 mt-1">{activity.time}</p>
                  </div>
                </div>
              ))}
            </div>
            <div className="mt-4 sm:mt-6">
              <button className="w-full py-2 text-blue-600 hover:text-blue-700 font-medium text-sm sm:text-base">
                View All Activities
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 sm:p-6">
        <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
        <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
          <button onClick={() => navigate('/leads', { state: { openCreate: true } })} className="p-3 sm:p-4 border border-gray-200 rounded-lg hover:border-blue-300 hover:bg-blue-50 transition-colors">
            <FiUsers className="text-blue-600 mx-auto mb-2" size={20} />
            <p className="text-xs sm:text-sm font-medium text-gray-900">Add New Lead</p>
          </button>
          <button onClick={() => navigate('/products', { state: { openCreate: true } })} className="p-3 sm:p-4 border border-gray-200 rounded-lg hover:border-green-300 hover:bg-green-50 transition-colors">
            <FiShoppingBag className="text-green-600 mx-auto mb-2" size={20} />
            <p className="text-xs sm:text-sm font-medium text-gray-900">Add Product</p>
          </button>
          <button onClick={() => navigate('/blogs', { state: { openCreate: true } })} className="p-3 sm:p-4 border border-gray-200 rounded-lg hover:border-purple-300 hover:bg-purple-50 transition-colors">
            <FiFileText className="text-purple-600 mx-auto mb-2" size={20} />
            <p className="text-xs sm:text-sm font-medium text-gray-900">Create Blog</p>
          </button>
          <button className="p-3 sm:p-4 border border-gray-200 rounded-lg hover:border-orange-300 hover:bg-orange-50 transition-colors">
            <FiTrendingUp className="text-orange-600 mx-auto mb-2" size={20} />
            <p className="text-xs sm:text-sm font-medium text-gray-900">View Analytics</p>
          </button>
        </div>
      </div>
    </div>
  );
};

export default Dashboard; 