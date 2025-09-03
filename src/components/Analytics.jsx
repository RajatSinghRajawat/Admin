import React from 'react';
import { 
  FiTrendingUp, 
  FiTrendingDown, 
  FiUsers, 
  FiShoppingBag,
  FiEye,
  FiDollarSign
} from 'react-icons/fi';

const Analytics = () => {
  const statsCards = [
    {
      title: 'Total Revenue',
      value: '₹2.4M',
      change: '+15.3%',
      changeType: 'positive',
      icon: FiDollarSign,
      color: 'bg-green-500'
    },
    {
      title: 'Total Leads',
      value: '1,234',
      change: '+12.5%',
      changeType: 'positive',
      icon: FiUsers,
      color: 'bg-blue-500'
    },
    {
      title: 'Products Sold',
      value: '89',
      change: '+5.2%',
      changeType: 'positive',
      icon: FiShoppingBag,
      color: 'bg-purple-500'
    },
    {
      title: 'Page Views',
      value: '45.2K',
      change: '-2.1%',
      changeType: 'negative',
      icon: FiEye,
      color: 'bg-orange-500'
    }
  ];

  const monthlyData = [
    { month: 'Jan', revenue: 180000, leads: 120, products: 65 },
    { month: 'Feb', revenue: 220000, leads: 140, products: 72 },
    { month: 'Mar', revenue: 190000, leads: 110, products: 58 },
    { month: 'Apr', revenue: 240000, leads: 160, products: 85 },
    { month: 'May', revenue: 280000, leads: 180, products: 92 },
    { month: 'Jun', revenue: 320000, leads: 200, products: 105 }
  ];

  const topProducts = [
    { name: 'Interlocking Paver Blocks', sales: 450, revenue: '₹202,500' },
    { name: 'Concrete Precast Slabs', sales: 320, revenue: '₹384,000' },
    { name: 'Garden Paver Stones', sales: 280, revenue: '₹98,000' },
    { name: 'Precast Wall Panels', sales: 180, revenue: '₹324,000' },
    { name: 'Parking Paver Blocks', sales: 150, revenue: '₹82,500' }
  ];

  const leadSources = [
    { source: 'Website', count: 456, percentage: 37 },
    { source: 'Referral', count: 234, percentage: 19 },
    { source: 'Social Media', count: 189, percentage: 15 },
    { source: 'Direct', count: 156, percentage: 13 },
    { source: 'Other', count: 199, percentage: 16 }
  ];

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900">Analytics Dashboard</h1>
          <p className="text-sm sm:text-base text-gray-600 mt-1">Track your business performance and insights</p>
        </div>
        <div className="flex flex-col sm:flex-row gap-3">
          <select className="px-3 sm:px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm sm:text-base">
            <option>Last 30 Days</option>
            <option>Last 90 Days</option>
            <option>Last 6 Months</option>
            <option>Last Year</option>
          </select>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        {statsCards.map((card, index) => {
          const Icon = card.icon;
          return (
            <div key={index} className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">{card.title}</p>
                  <p className="text-2xl font-bold text-gray-900 mt-1">{card.value}</p>
                </div>
                <div className={`p-3 rounded-lg ${card.color}`}>
                  <Icon className="text-white" size={24} />
                </div>
              </div>
              <div className="flex items-center mt-4">
                {card.changeType === 'positive' ? (
                  <FiTrendingUp className="text-green-500 mr-1" size={16} />
                ) : (
                  <FiTrendingDown className="text-red-500 mr-1" size={16} />
                )}
                <span className={`text-sm font-medium ${
                  card.changeType === 'positive' ? 'text-green-600' : 'text-red-600'
                }`}>
                  {card.change}
                </span>
                <span className="text-sm text-gray-500 ml-1">from last month</span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Revenue Chart */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Revenue Trend</h3>
          <div className="space-y-4">
            {['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'].map((month, index) => (
              <div key={index} className="flex items-center justify-between">
                <span className="text-sm text-gray-600 w-12">{month}</span>
                <div className="flex-1 mx-4">
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-blue-600 h-2 rounded-full" 
                      style={{ width: `${(index + 1) * 15}%` }}
                    ></div>
                  </div>
                </div>
                <span className="text-sm font-medium text-gray-900">₹{(index + 1) * 50}K</span>
              </div>
            ))}
          </div>
        </div>

        {/* Lead Sources */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Lead Sources</h3>
          <div className="space-y-4">
            {[
              { source: 'Website', count: 456, percentage: 37 },
              { source: 'Referral', count: 234, percentage: 19 },
              { source: 'Social Media', count: 189, percentage: 15 },
              { source: 'Direct', count: 156, percentage: 13 },
              { source: 'Other', count: 199, percentage: 16 }
            ].map((source, index) => (
              <div key={index} className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className={`w-3 h-3 rounded-full ${
                    index === 0 ? 'bg-blue-500' :
                    index === 1 ? 'bg-green-500' :
                    index === 2 ? 'bg-purple-500' :
                    index === 3 ? 'bg-orange-500' : 'bg-gray-500'
                  }`}></div>
                  <span className="text-sm text-gray-900">{source.source}</span>
                </div>
                <div className="flex items-center space-x-2">
                  <span className="text-sm font-medium text-gray-900">{source.count}</span>
                  <span className="text-sm text-gray-500">({source.percentage}%)</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Top Products */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Top Performing Products</h3>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Product
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Units Sold
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Revenue
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Performance
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {topProducts.map((product, index) => (
                <tr key={index} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">{product.name}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {product.sales}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-green-600">
                    {product.revenue}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="w-20 bg-gray-200 rounded-full h-2 mr-2">
                        <div 
                          className="bg-green-600 h-2 rounded-full" 
                          style={{ width: `${(product.sales / 450) * 100}%` }}
                        ></div>
                      </div>
                      <span className="text-sm text-gray-500">{Math.round((product.sales / 450) * 100)}%</span>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Analytics; 