import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { 
  FiHome, 
  FiUsers, 
  FiShoppingBag, 
  FiFileText, 
  FiSettings, 
  FiBarChart2,
  FiMessageSquare,
  FiX,
  FiLogOut
} from 'react-icons/fi';
import logo from './logo.jpg';

const Sidebar = ({ onClose }) => {
  const location = useLocation();
  const navigate = useNavigate();

  const menuItems = [
    { name: 'Dashboard', icon: FiHome, path: '/' },
    { name: 'Leads', icon: FiUsers, path: '/leads' },
    { name: 'Users', icon: FiUsers, path: '/users' },
    { name: 'Products', icon: FiShoppingBag, path: '/products' },
    { name: 'Blogs', icon: FiFileText, path: '/blogs' },
    { name: 'Analytics', icon: FiBarChart2, path: '/analytics' },
    { name: 'Messages', icon: FiMessageSquare, path: '/messages' },
    { name: 'Settings', icon: FiSettings, path: '/settings' },
  ];

  const handleLinkClick = () => {
    // Close sidebar on mobile when a link is clicked
    if (onClose) {
      onClose();
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('adminToken');
    localStorage.removeItem('token');
    navigate('/login');
  };

  return (
    <aside className="w-64 lg:w-64  border-r border-gray-200 flex flex-col py-4 px-2 h-screen overflow-hidden sidebar-mobile">
      {/* Mobile close button */}
      <div className="lg:hidden flex items-center justify-between mb-6 px-2">
        <div className="flex items-center">
          <img 
            src={logo}
            className="h-20 w-40 object-contain max-w-full" 
            alt="Logo" 
          />
        </div>
        <button
          onClick={onClose}
          className="p-2 rounded-md text-gray-600 hover:text-gray-900 hover:bg-gray-100"
        >
          <FiX size={20} />
        </button>
      </div>

      {/* Desktop logo */}
      <div className="hidden lg:flex items-center mb-8 px-2">
        <img 
          src={logo} 
          className="h-20 w-40 object-contain max-w-full" 
          alt="Logo" 
        />
      </div>

      <nav className="flex-1 flex flex-col gap-1">
        {menuItems.map((item) => {
          const Icon = item.icon;
          const isActive = location.pathname === item.path;
          return (
            <Link
              key={item.name}
              to={item.path}
              onClick={handleLinkClick}
              className={`flex items-center gap-3 px-3 py-3 rounded-lg font-medium transition-all duration-200
                ${isActive 
                  ? 'bg-blue-100 text-blue-700 shadow-sm' 
                  : 'text-gray-700 hover:bg-blue-50 hover:text-blue-600'
                }`}
            >
              <Icon size={20} />
              <span className="text-sm lg:text-base">{item.name}</span>
            </Link>
          );
        })}
        
        <div className="mt-6 text-xs text-gray-400 font-semibold px-3">Statistics</div>
        <Link 
          onClick={handleLinkClick}
          className="flex items-center gap-3 px-3 py-3 rounded-lg font-medium text-blue-700 bg-blue-100 shadow-sm"
        >
          <FiUsers size={20} />
          <span className="text-sm lg:text-base">Inactive</span>
        </Link>
      </nav>

      <div className="mt-auto px-2 py-3 border-t border-gray-200 space-y-2">
        <div className="flex items-center gap-2">
          <FiSettings size={18} className="text-gray-400" />
          <span className="text-gray-600 text-sm">Settings</span>
        </div>
        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-red-600 hover:bg-red-50 text-sm font-medium"
        >
          <FiLogOut size={18} />
          Logout
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;
