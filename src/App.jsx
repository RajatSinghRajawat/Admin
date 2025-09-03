import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import Sidebar from './components/Sidebar';
import Dashboard from './components/Dashboard';
import Leads from './components/Leads';
import Products from './components/Products';
import Blogs from './components/Blogs';
import Analytics from './components/Analytics';
import Messages from './components/Messages';
import Settings from './components/Settings';
import Users from './components/Users';
import { FiMenu, FiX } from 'react-icons/fi';
import Login from './components/Login';

const RequireAuth = ({ children }) => {
  const token = typeof window !== 'undefined' ? localStorage.getItem('adminToken') : null;
  if (!token) {
    return <Navigate to="/login" replace />;
  }
  return children;
};

const App = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  const closeSidebar = () => {
    setSidebarOpen(false);
  };

  return (
    <Router>
      <div className="min-h-screen bg-gray-50 flex">
        {/* Mobile overlay */}
        {sidebarOpen && (
          <div 
            className="fixed inset-0 z-40 lg:hidden"
            onClick={closeSidebar}
          />
        )}
        
        {/* Sidebar (hidden on login page) */}
        <Routes>
          <Route path="/login" element={null} />
          <Route path="*" element={
            <div className={`
              fixed inset-y-0 left-0 z-50 transform transition-transform duration-300 ease-in-out
              ${sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
            `}>
              <Sidebar onClose={closeSidebar} />
            </div>
          } />
        </Routes>

        {/* Main content */}
        <div className="flex-1 flex flex-col ml-0 lg:ml-64">
          {/* Mobile header (hidden on login page) */}
          <Routes>
            <Route path="/login" element={null} />
            <Route path="*" element={
              <header className="lg:hidden bg-white border-b border-gray-200 px-4 py-3 flex items-center justify-between">
                <button
                  onClick={toggleSidebar}
                  className="p-2 rounded-md text-gray-600 hover:text-gray-900 hover:bg-gray-100"
                >
                  <FiMenu size={24} />
                </button>
                {/* <div className="flex items-center">
                  <img 
                    src="https://indiawalls.in/wp-content/uploads/2024/09/Logo-Indiawalls.svg" 
                    className="h-8" 
                    alt="Logo" 
                  />
                </div> */}
                <div className="w-10"></div>
              </header>
            } />
          </Routes>

          {/* Main content area */}
          <main className="flex-1 p-4 sm:p-6 lg:p-8 transition-all duration-300 h-screen overflow-y-auto">
            <Routes>
              <Route path="/login" element={<Login />} />
              <Route path="/" element={<RequireAuth><Dashboard /></RequireAuth>} />
              <Route path="/leads" element={<RequireAuth><Leads /></RequireAuth>} />
              <Route path="/products" element={<RequireAuth><Products /></RequireAuth>} />
              <Route path="/blogs" element={<RequireAuth><Blogs /></RequireAuth>} />
              <Route path="/analytics" element={<RequireAuth><Analytics /></RequireAuth>} />
              <Route path="/messages" element={<RequireAuth><Messages /></RequireAuth>} />
              <Route path="/settings" element={<RequireAuth><Settings /></RequireAuth>} />
              <Route path="/users" element={<RequireAuth><Users /></RequireAuth>} />
            </Routes>
          </main>
        </div>
      </div>
    </Router>
  );
};

export default App;