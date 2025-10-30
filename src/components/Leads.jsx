import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { 
  FiSearch, 
  FiFilter, 
  FiPlus, 
  FiEdit, 
  FiTrash2, 
  FiEye,
  FiDownload,
  FiMail,
  FiPhone,
  FiX,
  FiCheck,
  FiAlertCircle
} from 'react-icons/fi';

const Leads = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedLeads, setSelectedLeads] = useState([]);
  const [leads, setLeads] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const location = useLocation();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [deleteLoadingId, setDeleteLoadingId] = useState(null);
  const [createForm, setCreateForm] = useState({
    name: '',
    email: '',
    phone: '',
    company: '',
    projectType: '',
    projectSize: '',
    address: '',
    city: '',
    state: '',
    pincode: '',
    requirements: '',
    budget: '',
    timeline: '',
    source: ''
  });
  const [createErrors, setCreateErrors] = useState({});

  useEffect(() => {
    const fetchLeads = async () => {
      setLoading(true);
      setError(null);
      try {
        const token = localStorage.getItem('adminToken') || localStorage.getItem('token');
        const response = await fetch('http://93.127.166.30:5000/api/leads', {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        if (!response.ok) {
          throw new Error('Failed to fetch leads');
        }
        const data = await response.json();
        setLeads(data.leads || []);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchLeads();
  }, []);

  useEffect(() => {
    if (location.state?.openCreate) {
      setShowCreateModal(true);
      window.history.replaceState({}, document.title);
    }
  }, [location.state]);

  const refreshLeads = async () => {
    try {
      const token = localStorage.getItem('adminToken') || localStorage.getItem('token');
      const response = await fetch('http://93.127.166.30:5000/api/leads', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (response.ok) {
        const data = await response.json();
        setLeads(data.leads || []);
      }
    } catch {}
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'New': return 'bg-blue-100 text-blue-800';
      case 'Contacted': return 'bg-yellow-100 text-yellow-800';
      case 'Qualified': return 'bg-purple-100 text-purple-800';
      case 'Converted': return 'bg-green-100 text-green-800';
      case 'Lost': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const filteredLeads = leads.filter(lead => {
    const matchesSearch = lead.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         lead.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         lead.company.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || lead.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  // Single-select logic for leads
  const handleSelectLead = (leadId) => {
    setSelectedLeads([leadId]);
  };

  const handleCreateInputChange = (e) => {
    const { name, value } = e.target;
    if (createErrors[name]) setCreateErrors(prev => ({ ...prev, [name]: '' }));
    setCreateForm(prev => ({ ...prev, [name]: value }));
  };

  const validateCreate = () => {
    const errs = {};
    if (!createForm.name.trim()) errs.name = 'Name is required';
    if (!createForm.email.trim()) errs.email = 'Email is required';
    if (!createForm.phone.trim()) errs.phone = 'Phone is required';
    if (!createForm.projectType) errs.projectType = 'Project type is required';
    if (!createForm.projectSize) errs.projectSize = 'Project size is required';
    if (!createForm.timeline) errs.timeline = 'Timeline is required';
    if (!createForm.address.trim()) errs.address = 'Address is required';
    if (!createForm.city.trim()) errs.city = 'City is required';
    if (!createForm.state.trim()) errs.state = 'State is required';
    if (!createForm.pincode.trim()) errs.pincode = 'Pincode is required';
    if (!createForm.requirements.trim()) errs.requirements = 'Requirements are required';
    setCreateErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleCreateSubmit = async (e) => {
    e.preventDefault();
    if (!validateCreate()) return;
    setIsSubmitting(true);
    try {
      const token = localStorage.getItem('adminToken') || localStorage.getItem('token');
      const payload = {
        name: createForm.name,
        email: createForm.email,
        phone: createForm.phone,
        company: createForm.company,
        projectType: createForm.projectType, // one of: residential, commercial, industrial, infrastructure, other
        projectSize: createForm.projectSize, // one of: small, medium, large, very-large
        location: {
          address: createForm.address,
          city: createForm.city,
          state: createForm.state,
          pincode: createForm.pincode
        },
        requirements: createForm.requirements,
        timeline: createForm.timeline, // one of: immediate, 1-3months, 3-6months, 6-12months, above-1year
        // optional client fields not in schema are ignored by backend
      };
      const response = await fetch('http://93.127.166.30:5000/api/leads', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify(payload)
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.message || 'Failed to create lead');
      setShowCreateModal(false);
      setCreateForm({
        name: '', email: '', phone: '', company: '', projectType: '', projectSize: '',
        address: '', city: '', state: '', pincode: '', requirements: '', budget: '', timeline: '', source: ''
      });
      setCreateErrors({});
      await refreshLeads();
    } catch (err) {
      setCreateErrors(prev => ({ ...prev, form: err.message }));
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (lead) => {
    if (!window.confirm(`Delete lead "${lead.name}"?`)) return;
    setDeleteLoadingId(lead._id || lead.id);
    try {
      const token = localStorage.getItem('adminToken') || localStorage.getItem('token');
      const response = await fetch(`http://93.127.166.30:5000/api/leads/${lead._id || lead.id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (!response.ok) {
        const errData = await response.json();
        throw new Error(errData.message || 'Failed to delete');
      }
      await refreshLeads();
      setSelectedLeads(prev => prev.filter(id => id !== (lead._id || lead.id)));
    } catch (err) {
      alert('Delete failed: ' + err.message);
    } finally {
      setDeleteLoadingId(null);
    }
  };

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900">Leads Management</h1>
          <p className="text-sm sm:text-base text-gray-600 mt-1">Manage and track your leads effectively</p>
        </div>
        <div className="flex flex-col sm:flex-row gap-3">
          <button className="px-3 sm:px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors text-sm sm:text-base flex items-center justify-center gap-2">
            <FiDownload className="inline" size={16} />
            <span>Export</span>
          </button>
          <button 
            onClick={() => setShowCreateModal(true)}
            className="px-3 sm:px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm sm:text-base flex items-center justify-center gap-2">
            <FiPlus className="inline" size={16} />
            <span>Add New Lead</span>
          </button>
        </div>
      </div>

      {/* Filters and Search */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0">
          <div className="flex flex-col sm:flex-row sm:items-center space-y-2 sm:space-y-0 sm:space-x-4">
            <div className="relative">
              <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Search leads..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="all">All Status</option>
              <option value="New">New</option>
              <option value="Contacted">Contacted</option>
              <option value="Qualified">Qualified</option>
              <option value="Converted">Converted</option>
              <option value="Lost">Lost</option>
            </select>
          </div>
          <div className="flex items-center space-x-2">
            <span className="text-sm text-gray-600">
              {filteredLeads.length} of {leads.length} leads
            </span>
          </div>
        </div>
      </div>

      {/* Leads Table */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200 text-sm">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-4 py-3 text-left sticky left-0 bg-gray-50 z-10 align-middle">
                {/* Single-select: No select all checkbox */}
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap">Lead</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap">Company</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap">Source</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap">Status</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap">Date Added</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap">Last Contact</th>
              <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap">Actions</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {filteredLeads.map((lead) => (
              <tr key={lead.id} className="hover:bg-gray-50">
                <td className="px-4 py-4 whitespace-nowrap align-middle">
                  <input
                    type="checkbox"
                    checked={selectedLeads.includes(lead.id)}
                    onChange={() => handleSelectLead(lead.id)}
                    className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500 align-middle"
                    style={{ minWidth: '1rem', minHeight: '1rem' }}
                  />
                </td>
                <td className="px-4 py-4 whitespace-nowrap min-w-[180px]">
                  <div className="flex items-center">
                    <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                      <span className="text-blue-600 font-semibold">
                        {lead.name.split(' ').map(n => n[0]).join('')}
                      </span>
                    </div>
                    <div className="ml-4 min-w-0">
                      <div className="text-sm font-medium text-gray-900 truncate">{lead.name}</div>
                      <div className="text-xs text-gray-500 truncate">{lead.email}</div>
                      <div className="text-xs text-gray-500 truncate">{lead.phone}</div>
                    </div>
                  </div>
                </td>
                <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900 min-w-[120px]">{lead.company}</td>
                <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-500 min-w-[100px]">{lead.source}</td>
                <td className="px-4 py-4 whitespace-nowrap min-w-[100px]">
                  <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(lead.status)}`}>
                    {lead.status}
                  </span>
                </td>
                <td className="px-4 py-4 whitespace-nowrap text-xs text-gray-500 min-w-[100px]">{lead.date}</td>
                <td className="px-4 py-4 whitespace-nowrap text-xs text-gray-500 min-w-[100px]">{lead.lastContact}</td>
                <td className="px-4 py-4 whitespace-nowrap text-right text-sm font-medium min-w-[120px]">
                  <div className="flex items-center justify-end space-x-2">
                    <button className="text-blue-600 hover:text-blue-900"><FiEye size={16} /></button>
                    <button className="text-green-600 hover:text-green-900"><FiMail size={16} /></button>
                    <button className="text-purple-600 hover:text-purple-900"><FiPhone size={16} /></button>
                    <button className="text-gray-600 hover:text-gray-900"><FiEdit size={16} /></button>
                    <button onClick={() => handleDelete(lead)} className="text-red-600 hover:text-red-900">
                      {deleteLoadingId === (lead._id || lead.id) ? '...' : <FiTrash2 size={16} />}
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Bulk Actions */}
      {selectedLeads.length > 0 && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <span className="text-sm text-blue-800">
              {selectedLeads.length} lead(s) selected
            </span>
            <div className="flex space-x-2">
              <button className="px-3 py-1 bg-blue-600 text-white text-sm rounded hover:bg-blue-700">
                Send Email
              </button>
              <button className="px-3 py-1 bg-green-600 text-white text-sm rounded hover:bg-green-700">
                Mark as Contacted
              </button>
              <button className="px-3 py-1 bg-red-600 text-white text-sm rounded hover:bg-red-700">
                Delete Selected
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Create Lead Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <h2 className="text-xl font-semibold text-gray-900">Add New Lead</h2>
              <button
                onClick={() => setShowCreateModal(false)}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <FiX size={24} />
              </button>
            </div>
            <form onSubmit={handleCreateSubmit} className="p-6 space-y-4">
              {createErrors.form && (
                <div className="bg-red-50 text-red-700 text-sm px-3 py-2 rounded flex items-center gap-2">
                  <FiAlertCircle />
                  {createErrors.form}
                </div>
              )}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Name *</label>
                  <input
                    type="text"
                    name="name"
                    value={createForm.name}
                    onChange={handleCreateInputChange}
                    className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${createErrors.name ? 'border-red-500' : 'border-gray-300'}`}
                    placeholder="John Doe"
                  />
                  {createErrors.name && <p className="mt-1 text-xs text-red-600">{createErrors.name}</p>}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Email *</label>
                  <input
                    type="email"
                    name="email"
                    value={createForm.email}
                    onChange={handleCreateInputChange}
                    className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${createErrors.email ? 'border-red-500' : 'border-gray-300'}`}
                    placeholder="john@example.com"
                  />
                  {createErrors.email && <p className="mt-1 text-xs text-red-600">{createErrors.email}</p>}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Phone *</label>
                  <input
                    type="text"
                    name="phone"
                    value={createForm.phone}
                    onChange={handleCreateInputChange}
                    className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${createErrors.phone ? 'border-red-500' : 'border-gray-300'}`}
                    placeholder="+91 99999 99999"
                  />
                  {createErrors.phone && <p className="mt-1 text-xs text-red-600">{createErrors.phone}</p>}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Company</label>
                  <input
                    type="text"
                    name="company"
                    value={createForm.company}
                    onChange={handleCreateInputChange}
                    className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent border-gray-300"
                    placeholder="Company Pvt Ltd"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Project Type *</label>
                  <select
                    name="projectType"
                    value={createForm.projectType}
                    onChange={handleCreateInputChange}
                    className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${createErrors.projectType ? 'border-red-500' : 'border-gray-300'}`}
                  >
                    <option value="">Select</option>
                    <option value="residential">Residential</option>
                    <option value="commercial">Commercial</option>
                    <option value="industrial">Industrial</option>
                    <option value="infrastructure">Infrastructure</option>
                    <option value="other">Other</option>
                  </select>
                  {createErrors.projectType && <p className="mt-1 text-xs text-red-600">{createErrors.projectType}</p>}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Project Size *</label>
                  <select
                    name="projectSize"
                    value={createForm.projectSize}
                    onChange={handleCreateInputChange}
                    className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${createErrors.projectSize ? 'border-red-500' : 'border-gray-300'}`}
                  >
                    <option value="">Select</option>
                    <option value="small">Small</option>
                    <option value="medium">Medium</option>
                    <option value="large">Large</option>
                    <option value="very-large">Very Large</option>
                  </select>
                  {createErrors.projectSize && <p className="mt-1 text-xs text-red-600">{createErrors.projectSize}</p>}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Address *</label>
                  <input
                    type="text"
                    name="address"
                    value={createForm.address}
                    onChange={handleCreateInputChange}
                    className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${createErrors.address ? 'border-red-500' : 'border-gray-300'}`}
                    placeholder="Street address"
                  />
                  {createErrors.address && <p className="mt-1 text-xs text-red-600">{createErrors.address}</p>}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">City *</label>
                  <input
                    type="text"
                    name="city"
                    value={createForm.city}
                    onChange={handleCreateInputChange}
                    className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${createErrors.city ? 'border-red-500' : 'border-gray-300'}`}
                    placeholder="City"
                  />
                  {createErrors.city && <p className="mt-1 text-xs text-red-600">{createErrors.city}</p>}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">State *</label>
                  <input
                    type="text"
                    name="state"
                    value={createForm.state}
                    onChange={handleCreateInputChange}
                    className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${createErrors.state ? 'border-red-500' : 'border-gray-300'}`}
                    placeholder="State"
                  />
                  {createErrors.state && <p className="mt-1 text-xs text-red-600">{createErrors.state}</p>}
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Requirements</label>
                  <textarea
                    name="requirements"
                    value={createForm.requirements}
                    onChange={handleCreateInputChange}
                    rows={3}
                    className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${createErrors.requirements ? 'border-red-500' : 'border-gray-300'}`}
                    placeholder="Project requirements"
                  />
                  {createErrors.requirements && <p className="mt-1 text-xs text-red-600">{createErrors.requirements}</p>}
                </div>
                <div className="md:col-span-2">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Pincode *</label>
                      <input
                        type="text"
                        name="pincode"
                        value={createForm.pincode}
                        onChange={handleCreateInputChange}
                        className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${createErrors.pincode ? 'border-red-500' : 'border-gray-300'}`}
                        placeholder="110001"
                      />
                      {createErrors.pincode && <p className="mt-1 text-xs text-red-600">{createErrors.pincode}</p>}
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Timeline *</label>
                      <select
                        name="timeline"
                        value={createForm.timeline}
                        onChange={handleCreateInputChange}
                        className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${createErrors.timeline ? 'border-red-500' : 'border-gray-300'}`}
                      >
                        <option value="">Select</option>
                        <option value="immediate">Immediate</option>
                        <option value="1-3months">1-3 months</option>
                        <option value="3-6months">3-6 months</option>
                        <option value="6-12months">6-12 months</option>
                        <option value="above-1year">Above 1 year</option>
                      </select>
                      {createErrors.timeline && <p className="mt-1 text-xs text-red-600">{createErrors.timeline}</p>}
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Source</label>
                      <input
                        type="text"
                        name="source"
                        value={createForm.source}
                        onChange={handleCreateInputChange}
                        className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent border-gray-300"
                        placeholder="Website / Referral / Ad"
                      />
                    </div>
                  </div>
                </div>
              </div>
              <div className="flex items-center justify-end gap-2 pt-4 border-t border-gray-200">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
                >
                  {isSubmitting ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Creating...
                    </>
                  ) : (
                    <>
                      <FiCheck size={16} className="mr-2" />
                      Create Lead
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Leads;
