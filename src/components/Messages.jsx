import React, { useState, useEffect } from 'react';
import { 
  FiSearch, 
  FiTrash2, 
  FiUser,
  FiMail,
  FiClock,
  FiCheck,
  FiCheckCircle,
  FiEye,
  FiEdit,
  FiPhone
} from 'react-icons/fi';

const Messages = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [inquiries, setInquiries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedInquiry, setSelectedInquiry] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [createLoading, setCreateLoading] = useState(false);
  const [createForm, setCreateForm] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    productInterest: '',
    message: ''
  });
  const [createErrors, setCreateErrors] = useState({});

  useEffect(() => {
    const fetchInquiries = async () => {
      setLoading(true);
      setError(null);
      try {
        const adminToken = localStorage.getItem('adminToken') || localStorage.getItem('token');
        const response = await fetch('https://backend.readymadewall.in/api/inquiry', {
          headers: adminToken ? { 'Authorization': `Bearer ${adminToken}` } : {}
        });
        if (!response.ok) {
          throw new Error('Failed to fetch inquiries');
        }
        const data = await response.json();
        setInquiries(data.data || []);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchInquiries();
  }, []);

  const filteredInquiries = inquiries.filter(inquiry => {
    const matchesSearch = 
      inquiry.firstName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      inquiry.lastName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      inquiry.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      inquiry.phone?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      inquiry.message?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      inquiry.productInterest?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = selectedStatus === 'all' || inquiry.status === selectedStatus;
    return matchesSearch && matchesStatus;
  });

  const statusCounts = {
    all: inquiries.length,
    new: inquiries.filter(i => i.status === 'new').length,
    contacted: inquiries.filter(i => i.status === 'contacted').length,
    closed: inquiries.filter(i => i.status === 'closed').length
  };

  const updateInquiryStatus = async (inquiryId, newStatus) => {
    try {
      const adminToken = localStorage.getItem('adminToken') || localStorage.getItem('token');
      const response = await fetch(`https://backend.readymadewall.in/api/inquiry/${inquiryId}/status`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          ...(adminToken ? { 'Authorization': `Bearer ${adminToken}` } : {})
        },
        body: JSON.stringify({ status: newStatus })
      });

      if (response.ok) {
        setInquiries(prev => 
          prev.map(inquiry => 
            inquiry._id === inquiryId 
              ? { ...inquiry, status: newStatus }
              : inquiry
          )
        );
      }
    } catch (err) {
      console.error('Failed to update status:', err);
    }
  };

  const deleteInquiry = async (inquiryId) => {
    if (!window.confirm('Are you sure you want to delete this inquiry?')) return;
    
    try {
      const adminToken = localStorage.getItem('adminToken') || localStorage.getItem('token');
      const response = await fetch(`https://backend.readymadewall.in/api/inquiry/${inquiryId}`, {
        method: 'DELETE',
        headers: adminToken ? { 'Authorization': `Bearer ${adminToken}` } : {}
      });

      if (response.ok) {
        setInquiries(prev => prev.filter(inquiry => inquiry._id !== inquiryId));
      }
    } catch (err) {
      console.error('Failed to delete inquiry:', err);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'new': return 'bg-blue-100 text-blue-800';
      case 'contacted': return 'bg-yellow-100 text-yellow-800';
      case 'closed': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <div className="text-red-600 mb-4">
          <FiMail className="mx-auto h-12 w-12" />
        </div>
        <h3 className="text-lg font-medium text-gray-900 mb-2">Error loading inquiries</h3>
        <p className="text-gray-600">{error}</p>
      </div>
    );
  }

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900">User Inquiries</h1>
          <p className="text-sm sm:text-base text-gray-600 mt-1">Manage all customer inquiries and messages</p>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-sm text-gray-500">Total: {inquiries.length} inquiries</span>
          <button
            onClick={() => setShowCreateModal(true)}
            className="px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm"
          >
            New Inquiry
          </button>
        </div>
      </div>

      {/* Status Tabs */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="border-b border-gray-200">
          <nav className="flex overflow-x-auto space-x-4 sm:space-x-8 px-4 sm:px-6">
            {[
              { id: 'all', label: 'All Inquiries', count: statusCounts.all },
              { id: 'new', label: 'New', count: statusCounts.new },
              { id: 'contacted', label: 'Contacted', count: statusCounts.contacted },
              { id: 'closed', label: 'Closed', count: statusCounts.closed }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setSelectedStatus(tab.id)}
                className={`py-4 px-1 border-b-2 font-medium text-sm whitespace-nowrap ${
                  selectedStatus === tab.id
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                {tab.label}
                {tab.count > 0 && (
                  <span className="ml-2 bg-gray-100 text-gray-900 py-0.5 px-2.5 rounded-full text-xs">
                    {tab.count}
                  </span>
                )}
              </button>
            ))}
          </nav>
        </div>

        {/* Search and Filters */}
        <div className="p-6 border-b border-gray-200">
          <div className="relative">
            <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search by name, email, phone, or message..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 pr-4 py-2 w-full border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
        </div>

        {/* Mobile Card List */}
        <div className="md:hidden divide-y divide-gray-200">
          {filteredInquiries.map((inquiry) => (
            <div key={inquiry._id} className="p-4">
              <div className="flex items-start">
                <div className="flex-shrink-0">
                  <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center">
                    <FiUser className="h-5 w-5 text-blue-600" />
                  </div>
                </div>
                <div className="ml-3 flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-medium text-gray-900 break-words">
                      {inquiry.firstName} {inquiry.lastName}
                    </p>
                    <span className={`ml-2 text-xs font-medium px-2 py-0.5 rounded-full ${getStatusColor(inquiry.status)}`}>
                      {inquiry.status}
                    </span>
                  </div>
                  <div className="mt-1 text-xs text-gray-600">
                    <div className="flex items-center">
                      <FiMail className="h-3 w-3 text-gray-400 mr-1" />
                      {inquiry.email}
                    </div>
                    <div className="flex items-center mt-1">
                      <FiPhone className="h-3 w-3 text-gray-400 mr-1" />
                      {inquiry.phone}
                    </div>
                  </div>
                  <p className="mt-2 text-sm text-gray-700 line-clamp-2">
                    {inquiry.message}
                  </p>
                  <div className="mt-3 flex items-center justify-between">
                    <div className="flex items-center text-xs text-gray-500">
                      <FiClock className="h-3 w-3 text-gray-400 mr-1" />
                      {formatDate(inquiry.createdAt)}
                    </div>
                    <div className="flex items-center space-x-3">
                      <select
                        value={inquiry.status}
                        onChange={(e) => updateInquiryStatus(inquiry._id, e.target.value)}
                        className="text-xs bg-gray-50 border border-gray-200 rounded-md px-2 py-1"
                      >
                        <option value="new">New</option>
                        <option value="contacted">Contacted</option>
                        <option value="closed">Closed</option>
                      </select>
                      <button
                        onClick={() => {
                          setSelectedInquiry(inquiry);
                          setShowModal(true);
                        }}
                        className="text-blue-600"
                        title="View Details"
                      >
                        <FiEye className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => deleteInquiry(inquiry._id)}
                        className="text-red-600"
                        title="Delete"
                      >
                        <FiTrash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
          {filteredInquiries.length === 0 && (
            <div className="text-center py-8">
              <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <FiMail className="text-gray-400" size={18} />
              </div>
              <p className="text-gray-600 text-sm">No inquiries found</p>
            </div>
          )}
        </div>

        {/* Inquiries Table */}
        <div className="hidden md:block overflow-x-auto">
          <table className="w-full table-fixed divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-56">
                  Customer
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-64">
                  Contact
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-48">
                  Product Interest
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-auto">
                  Message
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-36">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-40">
                  Date
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-28">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredInquiries.map((inquiry) => (
                <tr key={inquiry._id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-normal">
                    <div className="flex items-center">
                      <div className="flex-shrink-0 h-10 w-10">
                        <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center">
                          <FiUser className="h-5 w-5 text-blue-600" />
                        </div>
                      </div>
                      <div className="ml-4">
                        <div className="text-sm font-medium text-gray-900 break-words">
                          {inquiry.firstName} {inquiry.lastName}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900 break-words">
                      <div className="flex items-center">
                        <FiMail className="h-4 w-4 text-gray-400 mr-2" />
                        <span className="break-all">{inquiry.email}</span>
                      </div>
                      <div className="flex items-center mt-1">
                        <FiPhone className="h-4 w-4 text-gray-400 mr-2" />
                        <span className="break-all">{inquiry.phone}</span>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900 break-words">{inquiry.productInterest}</div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm text-gray-900 whitespace-normal break-words">{inquiry.message}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <select
                      value={inquiry.status}
                      onChange={(e) => updateInquiryStatus(inquiry._id, e.target.value)}
                      className={`min-w-[120px] text-xs font-medium px-2 py-1 rounded-full border-0 ${getStatusColor(inquiry.status)}`}
                    >
                      <option value="new">New</option>
                      <option value="contacted">Contacted</option>
                      <option value="closed">Closed</option>
                    </select>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    <div className="flex items-center">
                      <FiClock className="h-4 w-4 text-gray-400 mr-2" />
                      {formatDate(inquiry.createdAt)}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex space-x-2">
                      <button
                        onClick={() => {
                          setSelectedInquiry(inquiry);
                          setShowModal(true);
                        }}
                        className="text-blue-600 hover:text-blue-900"
                        title="View Details"
                      >
                        <FiEye className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => deleteInquiry(inquiry._id)}
                        className="text-red-600 hover:text-red-900"
                        title="Delete"
                      >
                        <FiTrash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Empty State */}
        {filteredInquiries.length === 0 && (
          <div className="text-center py-12">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <FiMail className="text-gray-400" size={24} />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">No inquiries found</h3>
            <p className="text-gray-600">
              {searchTerm ? 'No inquiries match your search criteria' : 'No inquiries available'}
            </p>
          </div>
        )}
      </div>

      {/* Inquiry Detail Modal */}
      {showModal && selectedInquiry && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-11/12 md:w-3/4 lg:w-1/2 shadow-lg rounded-md bg-white">
            <div className="mt-3">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-medium text-gray-900">Inquiry Details</h3>
                <button
                  onClick={() => setShowModal(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <span className="sr-only">Close</span>
                  <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Name</label>
                    <p className="mt-1 text-sm text-gray-900">{selectedInquiry.firstName} {selectedInquiry.lastName}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Email</label>
                    <p className="mt-1 text-sm text-gray-900">{selectedInquiry.email}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Phone</label>
                    <p className="mt-1 text-sm text-gray-900">{selectedInquiry.phone}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Product Interest</label>
                    <p className="mt-1 text-sm text-gray-900">{selectedInquiry.productInterest}</p>
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700">Message</label>
                  <p className="mt-1 text-sm text-gray-900 bg-gray-50 p-3 rounded-md">
                    {selectedInquiry.message}
                  </p>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Status</label>
                    <select
                      value={selectedInquiry.status}
                      onChange={(e) => {
                        updateInquiryStatus(selectedInquiry._id, e.target.value);
                        setSelectedInquiry({...selectedInquiry, status: e.target.value});
                      }}
                      className={`mt-1 text-sm font-medium px-3 py-1 rounded-full border-0 ${getStatusColor(selectedInquiry.status)}`}
                    >
                      <option value="new">New</option>
                      <option value="contacted">Contacted</option>
                      <option value="closed">Closed</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Submitted</label>
                    <p className="mt-1 text-sm text-gray-900">{formatDate(selectedInquiry.createdAt)}</p>
                  </div>
                </div>
              </div>
              
              <div className="mt-6 flex justify-end space-x-3">
                <button
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400"
                >
                  Close
                </button>
                <a
                  href={`mailto:${selectedInquiry.email}`}
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                >
                  Reply via Email
                </a>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Create Inquiry Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-11/12 md:w-3/4 lg:w-1/2 shadow-lg rounded-md bg-white">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-medium text-gray-900">Create Inquiry</h3>
              <button onClick={() => setShowCreateModal(false)} className="text-gray-400 hover:text-gray-600">
                <span className="sr-only">Close</span>
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <form
              onSubmit={async (e) => {
                e.preventDefault();
                const errs = {};
                if (!createForm.firstName.trim()) errs.firstName = 'First name is required';
                if (!createForm.lastName.trim()) errs.lastName = 'Last name is required';
                if (!createForm.email.trim()) errs.email = 'Email is required';
                if (!createForm.phone.trim()) errs.phone = 'Phone is required';
                if (!createForm.message.trim()) errs.message = 'Message is required';
                setCreateErrors(errs);
                if (Object.keys(errs).length) return;
                setCreateLoading(true);
                try {
                  const adminToken = localStorage.getItem('adminToken') || localStorage.getItem('token');
                  const res = await fetch('https://backend.readymadewall.in/api/inquiry/create', {
                    method: 'POST',
                    headers: { 
                      'Content-Type': 'application/json',
                      ...(adminToken ? { 'Authorization': `Bearer ${adminToken}` } : {})
                    },
                    body: JSON.stringify(createForm)
                  });
                  const data = await res.json();
                  if (!res.ok || !data.success) throw new Error(data.message || 'Failed to create');
                  setInquiries(prev => [data.data, ...prev]);
                  setShowCreateModal(false);
                  setCreateForm({ firstName: '', lastName: '', email: '', phone: '', productInterest: '', message: '' });
                  setCreateErrors({});
                } catch (err) {
                  alert(err.message);
                } finally {
                  setCreateLoading(false);
                }
              }}
              className="space-y-4"
            >
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">First Name *</label>
                  <input
                    type="text"
                    value={createForm.firstName}
                    onChange={(e) => { setCreateForm(p => ({ ...p, firstName: e.target.value })); if (createErrors.firstName) setCreateErrors(s => ({ ...s, firstName: '' })); }}
                    className={`mt-1 w-full border rounded px-3 py-2 ${createErrors.firstName ? 'border-red-500' : 'border-gray-300'}`}
                    placeholder="John"
                  />
                  {createErrors.firstName && <p className="text-xs text-red-600 mt-1">{createErrors.firstName}</p>}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Last Name *</label>
                  <input
                    type="text"
                    value={createForm.lastName}
                    onChange={(e) => { setCreateForm(p => ({ ...p, lastName: e.target.value })); if (createErrors.lastName) setCreateErrors(s => ({ ...s, lastName: '' })); }}
                    className={`mt-1 w-full border rounded px-3 py-2 ${createErrors.lastName ? 'border-red-500' : 'border-gray-300'}`}
                    placeholder="Doe"
                  />
                  {createErrors.lastName && <p className="text-xs text-red-600 mt-1">{createErrors.lastName}</p>}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Email *</label>
                  <input
                    type="email"
                    value={createForm.email}
                    onChange={(e) => { setCreateForm(p => ({ ...p, email: e.target.value })); if (createErrors.email) setCreateErrors(s => ({ ...s, email: '' })); }}
                    className={`mt-1 w-full border rounded px-3 py-2 ${createErrors.email ? 'border-red-500' : 'border-gray-300'}`}
                    placeholder="you@example.com"
                  />
                  {createErrors.email && <p className="text-xs text-red-600 mt-1">{createErrors.email}</p>}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Phone *</label>
                  <input
                    type="text"
                    value={createForm.phone}
                    onChange={(e) => { setCreateForm(p => ({ ...p, phone: e.target.value })); if (createErrors.phone) setCreateErrors(s => ({ ...s, phone: '' })); }}
                    className={`mt-1 w-full border rounded px-3 py-2 ${createErrors.phone ? 'border-red-500' : 'border-gray-300'}`}
                    placeholder="+91 99999 99999"
                  />
                  {createErrors.phone && <p className="text-xs text-red-600 mt-1">{createErrors.phone}</p>}
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700">Product Interest</label>
                  <input
                    type="text"
                    value={createForm.productInterest}
                    onChange={(e) => setCreateForm(p => ({ ...p, productInterest: e.target.value }))}
                    className="mt-1 w-full border rounded px-3 py-2 border-gray-300"
                    placeholder="Pavers / Precast / ..."
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700">Message *</label>
                  <textarea
                    value={createForm.message}
                    onChange={(e) => { setCreateForm(p => ({ ...p, message: e.target.value })); if (createErrors.message) setCreateErrors(s => ({ ...s, message: '' })); }}
                    rows={4}
                    className={`mt-1 w-full border rounded px-3 py-2 ${createErrors.message ? 'border-red-500' : 'border-gray-300'}`}
                    placeholder="Write your message"
                  />
                  {createErrors.message && <p className="text-xs text-red-600 mt-1">{createErrors.message}</p>}
                </div>
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <button type="button" onClick={() => setShowCreateModal(false)} className="px-4 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200">Cancel</button>
                <button type="submit" disabled={createLoading} className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-60">
                  {createLoading ? 'Creating...' : 'Create Inquiry'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Messages; 