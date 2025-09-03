import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { 
  FiSearch, 
  FiPlus, 
  FiEdit, 
  FiTrash2, 
  FiEye,
  FiCalendar,
  FiUser,
  FiEye as FiViews,
  FiX,
  FiUpload,
  FiCheck,
  FiAlertCircle
} from 'react-icons/fi';
import toast, { Toaster } from 'react-hot-toast';

const Blogs = () => {
  const ASSET_BASE = 'https://backend.readymadewall.in/';
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [blogs, setBlogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [imageIndexById, setImageIndexById] = useState({});

  const getImageUrl = (nameOrUrl) => {
    if (!nameOrUrl) return '';
    if (typeof nameOrUrl !== 'string') return '';
    if (/^https?:\/\//i.test(nameOrUrl)) return nameOrUrl;
    return ASSET_BASE + encodeURIComponent(nameOrUrl);
  };

  const getCurrentImage = (blog) => {
    const images = Array.isArray(blog.image) ? blog.image : [];
    const index = imageIndexById[blog._id || blog.id] || 0;
    if (images.length > 0) {
      const boundedIndex = ((index % images.length) + images.length) % images.length;
      return getImageUrl(images[boundedIndex]);
    }
    if (typeof blog.image === 'string' && blog.image.length > 0) {
      return getImageUrl(blog.image);
    }
    return '';
  };

  const nextImage = (blog) => {
    const images = Array.isArray(blog.image) ? blog.image : [];
    if (images.length === 0) return;
    const key = blog._id || blog.id;
    setImageIndexById(prev => ({ ...prev, [key]: (prev[key] || 0) + 1 }));
  };

  const prevImage = (blog) => {
    const images = Array.isArray(blog.image) ? blog.image : [];
    if (images.length === 0) return;
    const key = blog._id || blog.id;
    setImageIndexById(prev => ({ ...prev, [key]: (prev[key] || 0) - 1 }));
  };
  
  // Create blog modal states
  const [showCreateModal, setShowCreateModal] = useState(false);
  const location = useLocation();
  const [createFormData, setCreateFormData] = useState({
    title: '',
    category: 'other',
    metaTitle: '',
    metaDescription: '',
    author: '',
    images: []
  });
  const [createErrors, setCreateErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Edit/Delete state
  const [showEditModal, setShowEditModal] = useState(false);
  const [editFormData, setEditFormData] = useState({
    _id: '',
    title: '',
    category: 'other',
    metaTitle: '',
    metaDescription: '',
    author: '',
    images: []
  });
  const [editErrors, setEditErrors] = useState({});
  const [isUpdating, setIsUpdating] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [blogToDelete, setBlogToDelete] = useState(null);

  // View single blog
  const [showViewModal, setShowViewModal] = useState(false);
  const [viewBlog, setViewBlog] = useState(null);
  const [viewLoading, setViewLoading] = useState(false);
  const [viewImageIndex, setViewImageIndex] = useState(0);

  useEffect(() => {
    const fetchBlogs = async () => {
      setLoading(true);
      setError(null);
      try {
        const response = await fetch('https://backend.readymadewall.in/api/blogs');
        if (!response.ok) {
          throw new Error('Failed to fetch blogs');
        }
        const data = await response.json();
        setBlogs(data.blogs || []);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchBlogs();
  }, []);

  useEffect(() => {
    if (location.state?.openCreate) {
      setShowCreateModal(true);
      window.history.replaceState({}, document.title);
    }
  }, [location.state]);

  const getCategoryColor = (category) => {
    switch (category) {
      case 'construction': return 'bg-emerald-100 text-emerald-800';
      case 'design': return 'bg-blue-100 text-blue-800';
      case 'tips': return 'bg-yellow-100 text-yellow-800';
      case 'news': return 'bg-purple-100 text-purple-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const filteredBlogs = blogs.filter(blog => {
    const titleText = (blog.title || '').toLowerCase();
    const metaTitleText = (blog.metaTitle || '').toLowerCase();
    const metaDescText = (blog.metaDescription || '').toLowerCase();
    const matchesSearch = titleText.includes(searchTerm.toLowerCase()) ||
      metaTitleText.includes(searchTerm.toLowerCase()) ||
      metaDescText.includes(searchTerm.toLowerCase());
    const matchesCategory = categoryFilter === 'all' || blog.category === categoryFilter;
    return matchesSearch && matchesCategory;
  });

  // Handle create form input changes
  const handleCreateInputChange = (e) => {
    const { name, value, type, files } = e.target;
    if (createErrors[name]) {
      setCreateErrors(prev => ({ ...prev, [name]: '' }));
    }
    if (type === 'file') {
      // multiple images
      setCreateFormData(prev => ({
        ...prev,
        images: Array.from(files || [])
      }));
    } else {
      setCreateFormData(prev => ({
        ...prev,
        [name]: value
      }));
    }
  };

  // Validate create form
  const validateCreateForm = () => {
    const newErrors = {};
    
    if (!createFormData.title.trim()) newErrors.title = 'Blog title is required';
    if (!createFormData.author.trim()) newErrors.author = 'Author name is required';
    
    setCreateErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Handle create blog submission
  const handleCreateBlog = async (e) => {
    e.preventDefault();
    
    if (!validateCreateForm()) {
      toast.error('Please fix the errors in the form');
      return;
    }

    setIsSubmitting(true);
    
    try {
      const formData = new FormData();
      formData.append('title', createFormData.title);
      formData.append('category', createFormData.category);
      formData.append('metaTitle', createFormData.metaTitle);
      formData.append('metaDescription', createFormData.metaDescription);
      formData.append('author', createFormData.author);
      // append multiple images under the same field name to match upload.array('image')
      (createFormData.images || []).forEach((file) => formData.append('image', file));

      const token = localStorage.getItem('token');
      const response = await fetch('https://backend.readymadewall.in/api/blogs/create', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: formData
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to create blog');
      }
      
      const data = await response.json();
      setBlogs(prev => [data.blog, ...prev]);
      setShowCreateModal(false);
      resetCreateForm();
      toast.success('Blog created successfully!');
    } catch (err) {
      toast.error('Error creating blog: ' + err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Reset create form
  const resetCreateForm = () => {
    setCreateFormData({
      title: '',
      category: 'other',
      metaTitle: '',
      metaDescription: '',
      author: '',
      images: []
    });
    setCreateErrors({});
  };

  // Close create modal
  const closeCreateModal = () => {
    setShowCreateModal(false);
    resetCreateForm();
  };

  return (
    <div className="space-y-4 sm:space-y-6">
      <Toaster 
        position="top-right"
        toastOptions={{
          duration: 4000,
          style: {
            background: '#363636',
            color: '#fff',
          },
          success: {
            duration: 3000,
            iconTheme: {
              primary: '#10B981',
              secondary: '#fff',
            },
          },
          error: {
            duration: 4000,
            iconTheme: {
              primary: '#EF4444',
              secondary: '#fff',
            },
          },
        }}
      />
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900">Blogs Management</h1>
          <p className="text-sm sm:text-base text-gray-600 mt-1">Manage your blog content and articles</p>
        </div>
        <div className="flex flex-col sm:flex-row gap-3">
          <button 
            onClick={() => setShowCreateModal(true)}
            className="px-3 sm:px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm sm:text-base flex items-center justify-center gap-2"
          >
            <FiPlus className="inline" size={16} />
            <span>Create New Blog</span>
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 sm:p-6">
        <div className="flex flex-col sm:flex-row sm:items-center gap-3">
          <div className="relative">
            <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
            <input
              type="text"
              placeholder="Search blogs..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="all">All Categories</option>
            <option value="construction">Construction</option>
            <option value="design">Design</option>
            <option value="tips">Tips</option>
            <option value="news">News</option>
            <option value="other">Other</option>
          </select>
        </div>
      </div>

      {/* Loading State */}
      {loading && (
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading blogs...</p>
        </div>
      )}

      {/* Error State */}
      {error && !loading && (
        <div className="text-center py-12">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <FiAlertCircle className="text-red-600" size={24} />
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">Error loading blogs</h3>
          <p className="text-gray-600 mb-4">{error}</p>
          <button 
            onClick={() => window.location.reload()}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Try Again
          </button>
        </div>
      )}

      {/* Blogs Grid */}
      {!loading && !error && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredBlogs.map((blog) => (
                         <div key={blog._id || blog.id} className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow flex flex-col h-full">
               <div className="relative">
                 <img
                   src={getCurrentImage(blog)}
                   alt={blog.title}
                   className="w-full h-48 object-cover"
                 />
                 {Array.isArray(blog.image) && blog.image.length > 1 && (
                   <div className="absolute inset-0 flex items-center justify-between px-2">
                     <button
                       type="button"
                       onClick={() => prevImage(blog)}
                       className="bg-black/40 hover:bg-black/60 text-white rounded-full w-8 h-8 flex items-center justify-center"
                       aria-label="Previous image"
                     >
                       ‹
                     </button>
                     <button
                       type="button"
                       onClick={() => nextImage(blog)}
                       className="bg-black/40 hover:bg-black/60 text-white rounded-full w-8 h-8 flex items-center justify-center"
                       aria-label="Next image"
                     >
                       ›
                     </button>
                   </div>
                 )}
                 {Array.isArray(blog.image) && blog.image.length > 0 && (
                   <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex gap-1">
                     {blog.image.map((_, idx) => {
                       const key = blog._id || blog.id;
                       const active = ((imageIndexById[key] || 0) % blog.image.length + blog.image.length) % blog.image.length === idx;
                       return <span key={idx} className={`w-2 h-2 rounded-full ${active ? 'bg-white' : 'bg-white/50'}`}></span>;
                     })}
                   </div>
                 )}
                 <div className="absolute top-2 left-2">
                   <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getCategoryColor(blog.category)}`}>
                     {blog.category || 'other'}
                   </span>
                 </div>
               </div>
               <div className="p-4 flex flex-col flex-1">
                 <div className="flex-1">
                   <h3 className="text-lg font-semibold text-gray-900 mb-2 line-clamp-2">{blog.title}</h3>
                   
                   <div className="flex items-center justify-between text-xs text-gray-500 mb-4">
                     <div className="flex items-center space-x-4">
                       <span className="flex items-center">
                         <FiUser className="mr-1" size={12} />
                         {blog.author}
                       </span>
                       {blog.createdAt && (
                         <span className="flex items-center">
                           <FiCalendar className="mr-1" size={12} />
                           {new Date(blog.createdAt).toLocaleDateString()}
                         </span>
                       )}
                     </div>
                     {/* <span className="flex items-center">{blog.metaTitle}</span> */}
                   </div>
                 </div>
                 
                 <div className="mt-auto pt-4 flex items-center justify-between">
                   <button className="text-blue-600 hover:text-blue-700 text-sm font-medium">
                     Read More
                   </button>
                   <div className="flex space-x-2">
                     <button
                       onClick={async () => {
                         try {
                           setViewLoading(true);
                           setShowViewModal(true);
                           setViewImageIndex(0);
                           const res = await fetch(`https://backend.readymadewall.in/api/blogs/${blog._id || blog.id}`);
                           const data = await res.json();
                           setViewBlog(data.blog || blog);
                         } catch (e) {
                           setViewBlog(blog);
                         } finally {
                           setViewLoading(false);
                         }
                       }}
                       className="text-blue-600 hover:text-blue-900"
                     >
                       <FiEye size={16} />
                     </button>
                     <button
                       onClick={() => {
                         setEditFormData({
                           _id: blog._id,
                           title: blog.title || '',
                           category: blog.category || 'other',
                           metaTitle: blog.metaTitle || '',
                           metaDescription: blog.metaDescription || '',
                           author: blog.author || '',
                           images: []
                         });
                         setEditErrors({});
                         setShowEditModal(true);
                       }}
                       className="text-gray-600 hover:text-gray-900"
                     >
                       <FiEdit size={16} />
                     </button>
                     <button
                       onClick={() => { setBlogToDelete(blog); setShowDeleteModal(true); }}
                       className="text-red-600 hover:text-red-900"
                     >
                       <FiTrash2 size={16} />
                     </button>
                   </div>
                 </div>
               </div>
             </div>
          ))}
        </div>
      )}

      {/* Empty State */}
      {!loading && !error && filteredBlogs.length === 0 && (
        <div className="text-center py-12">
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <FiEdit className="text-gray-400" size={24} />
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">No blogs found</h3>
          <p className="text-gray-600 mb-4">Try adjusting your search or filter criteria</p>
          <button 
            onClick={() => setShowCreateModal(true)}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <FiPlus className="inline mr-2" />
            Create Your First Blog
          </button>
        </div>
      )}

      {/* Create Blog Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <h2 className="text-xl font-semibold text-gray-900">Create New Blog</h2>
              <button
                onClick={closeCreateModal}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <FiX size={24} />
              </button>
            </div>

            <form onSubmit={handleCreateBlog} className="p-6 space-y-6">
              {/* Basic Information */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Blog Title *
                  </label>
                  <input
                    type="text"
                    name="title"
                    value={createFormData.title}
                    onChange={handleCreateInputChange}
                    className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                      createErrors.title ? 'border-red-500' : 'border-gray-300'
                    }`}
                    placeholder="Enter blog title"
                  />
                  {createErrors.title && (
                    <p className="mt-1 text-sm text-red-600 flex items-center gap-1">
                      <FiAlertCircle size={14} />
                      {createErrors.title}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Author *
                  </label>
                  <input
                    type="text"
                    name="author"
                    value={createFormData.author}
                    onChange={handleCreateInputChange}
                    className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                      createErrors.author ? 'border-red-500' : 'border-gray-300'
                    }`}
                    placeholder="Enter author name"
                  />
                  {createErrors.author && (
                    <p className="mt-1 text-sm text-red-600 flex items-center gap-1">
                      <FiAlertCircle size={14} />
                      {createErrors.author}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Category
                  </label>
                  <select
                    name="category"
                    value={createFormData.category}
                    onChange={handleCreateInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="construction">Construction</option>
                    <option value="design">Design</option>
                    <option value="tips">Tips</option>
                    <option value="news">News</option>
                    <option value="other">Other</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Featured Images
                  </label>
                  <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-blue-400 transition-colors">
                    <FiUpload className="mx-auto h-12 w-12 text-gray-400" />
                    <div className="mt-4">
                      <label htmlFor="blog-image-upload" className="cursor-pointer bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors">
                        Choose Images
                      </label>
                      <input
                        id="blog-image-upload"
                        type="file"
                        name="image"
                        accept="image/*"
                        multiple
                        onChange={handleCreateInputChange}
                        className="hidden"
                      />
                    </div>
                    <p className="mt-2 text-sm text-gray-600">
                      PNG, JPG, WEBP up to 5MB
                    </p>
                  </div>
                  {createErrors.images && (
                    <p className="mt-1 text-sm text-red-600 flex items-center gap-1">
                      <FiAlertCircle size={14} />
                      {createErrors.images}
                    </p>
                  )}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Meta Title
                </label>
                <input
                  type="text"
                  name="metaTitle"
                  value={createFormData.metaTitle}
                  onChange={handleCreateInputChange}
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                    createErrors.metaTitle ? 'border-red-500' : 'border-gray-300'
                  }`}
                  placeholder="SEO title"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Meta Description
                </label>
                <textarea
                  name="metaDescription"
                  value={createFormData.metaDescription}
                  onChange={handleCreateInputChange}
                  rows={4}
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                    createErrors.metaDescription ? 'border-red-500' : 'border-gray-300'
                  }`}
                  placeholder="SEO description"
                />
              </div>

              {/* Form Actions */}
              <div className="flex items-center justify-end space-x-3 pt-6 border-t border-gray-200">
                <button
                  type="button"
                  onClick={closeCreateModal}
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
                      Create Blog
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Blog Modal */}
      {showEditModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <h2 className="text-xl font-semibold text-gray-900">Edit Blog</h2>
              <button
                onClick={() => setShowEditModal(false)}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <FiX size={24} />
              </button>
            </div>

            <form
              onSubmit={async (e) => {
                e.preventDefault();
                const errs = {};
                if (!editFormData.title.trim()) errs.title = 'Blog title is required';
                if (!editFormData.author.trim()) errs.author = 'Author name is required';
                setEditErrors(errs);
                if (Object.keys(errs).length) return;
                setIsUpdating(true);
                try {
                  const formData = new FormData();
                  formData.append('title', editFormData.title);
                  formData.append('category', editFormData.category);
                  formData.append('metaTitle', editFormData.metaTitle);
                  formData.append('metaDescription', editFormData.metaDescription);
                  formData.append('author', editFormData.author);
                  (editFormData.images || []).forEach((file) => formData.append('image', file));
                  const token = localStorage.getItem('token');
                  const res = await fetch(`https://backend.readymadewall.in/api/blogs/update/${editFormData._id}`, {
                    method: 'PUT',
                    headers: { 'Authorization': `Bearer ${token}` },
                    body: formData
                  });
                  if (!res.ok) {
                    const data = await res.json();
                    throw new Error(data.message || 'Failed to update');
                  }
                  const data = await res.json();
                  setBlogs(prev => prev.map(b => (b._id === data.blog._id ? data.blog : b)));
                  setShowEditModal(false);
                } catch (err) {
                  toast.error(err.message);
                } finally {
                  setIsUpdating(false);
                }
              }}
              className="p-6 space-y-6"
            >
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Blog Title *</label>
                  <input
                    type="text"
                    value={editFormData.title}
                    onChange={(e) => { setEditFormData(p => ({ ...p, title: e.target.value })); if (editErrors.title) setEditErrors(s => ({ ...s, title: '' })); }}
                    className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${editErrors.title ? 'border-red-500' : 'border-gray-300'}`}
                    placeholder="Enter blog title"
                  />
                  {editErrors.title && <p className="mt-1 text-sm text-red-600">{editErrors.title}</p>}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Author *</label>
                  <input
                    type="text"
                    value={editFormData.author}
                    onChange={(e) => { setEditFormData(p => ({ ...p, author: e.target.value })); if (editErrors.author) setEditErrors(s => ({ ...s, author: '' })); }}
                    className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${editErrors.author ? 'border-red-500' : 'border-gray-300'}`}
                    placeholder="Enter author name"
                  />
                  {editErrors.author && <p className="mt-1 text-sm text-red-600">{editErrors.author}</p>}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Category</label>
                  <select
                    value={editFormData.category}
                    onChange={(e) => setEditFormData(p => ({ ...p, category: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="construction">Construction</option>
                    <option value="design">Design</option>
                    <option value="tips">Tips</option>
                    <option value="news">News</option>
                    <option value="other">Other</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Replace Images</label>
                  <input
                    type="file"
                    accept="image/*"
                    multiple
                    onChange={(e) => setEditFormData(p => ({ ...p, images: Array.from(e.target.files || []) }))}
                    className="w-full"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Meta Title</label>
                <input
                  type="text"
                  value={editFormData.metaTitle}
                  onChange={(e) => setEditFormData(p => ({ ...p, metaTitle: e.target.value }))}
                  className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="SEO title"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Meta Description</label>
                <textarea
                  rows={4}
                  value={editFormData.metaDescription}
                  onChange={(e) => setEditFormData(p => ({ ...p, metaDescription: e.target.value }))}
                  className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="SEO description"
                />
              </div>

              <div className="flex items-center justify-end space-x-3 pt-6 border-t border-gray-200">
                <button type="button" onClick={() => setShowEditModal(false)} className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200">Cancel</button>
                <button type="submit" disabled={isUpdating} className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50">
                  {isUpdating ? 'Updating...' : 'Update Blog'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Blog Modal */}
      {showDeleteModal && blogToDelete && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-md">
            <div className="p-6 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900">Delete Blog</h3>
            </div>
            <div className="p-6">
              <p className="text-gray-700">Are you sure you want to delete "{blogToDelete.title}"?</p>
            </div>
            <div className="flex items-center justify-end gap-3 p-6 border-t border-gray-200">
              <button onClick={() => { setShowDeleteModal(false); setBlogToDelete(null); }} className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200">Cancel</button>
              <button
                onClick={async () => {
                  try {
                    const token = localStorage.getItem('token');
                    const res = await fetch(`https://backend.readymadewall.in/api/blogs/delete/${blogToDelete._id}`, {
                      method: 'DELETE',
                      headers: { 'Authorization': `Bearer ${token}` }
                    });
                    if (!res.ok) {
                      const data = await res.json();
                      throw new Error(data.message || 'Failed to delete');
                    }
                    setBlogs(prev => prev.filter(b => b._id !== blogToDelete._id));
                    setShowDeleteModal(false);
                    setBlogToDelete(null);
                    toast.success('Blog deleted');
                  } catch (err) {
                    toast.error(err.message);
                  }
                }}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {/* View Blog Modal */}
      {showViewModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-3xl w-full max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <h2 className="text-xl font-semibold text-gray-900">Blog Details</h2>
              <button onClick={() => { setShowViewModal(false); setViewBlog(null); }} className="text-gray-400 hover:text-gray-600">
                <FiX size={24} />
              </button>
            </div>
            <div className="p-6 space-y-4">
              {viewLoading && <p className="text-gray-500">Loading...</p>}
              {viewBlog && (
                <div className="space-y-4">
                  <h3 className="text-2xl font-semibold text-gray-900">{viewBlog.title}</h3>
                  <div className="text-sm text-gray-600 flex flex-wrap gap-4">
                    <span>Author: {viewBlog.author}</span>
                    <span>Category: {viewBlog.category}</span>
                    {viewBlog.createdAt && <span>Date: {new Date(viewBlog.createdAt).toLocaleDateString()}</span>}
                  </div>
                  {(() => {
                    const imgs = Array.isArray(viewBlog.image) ? viewBlog.image : (viewBlog.image ? [viewBlog.image] : []);
                    if (imgs.length === 0) return null;
                    const boundedIndex = ((viewImageIndex % imgs.length) + imgs.length) % imgs.length;
                    return (
                      <div className="relative">
                        <img src={getImageUrl(imgs[boundedIndex])} alt="" className="w-full h-64 object-cover rounded" />
                        {imgs.length > 1 && (
                          <>
                            <button
                              type="button"
                              onClick={() => setViewImageIndex(i => i - 1)}
                              className="absolute left-2 top-1/2 -translate-y-1/2 bg-black/40 hover:bg-black/60 text-white rounded-full w-9 h-9 flex items-center justify-center"
                              aria-label="Previous image"
                            >
                              ‹
                            </button>
                            <button
                              type="button"
                              onClick={() => setViewImageIndex(i => i + 1)}
                              className="absolute right-2 top-1/2 -translate-y-1/2 bg-black/40 hover:bg-black/60 text-white rounded-full w-9 h-9 flex items-center justify-center"
                              aria-label="Next image"
                            >
                              ›
                            </button>
                            <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1">
                              {imgs.map((_, idx) => (
                                <span key={idx} className={`w-2 h-2 rounded-full ${idx === boundedIndex ? 'bg-white' : 'bg-white/50'}`}></span>
                              ))}
                            </div>
                          </>
                        )}
                      </div>
                    );
                  })()}
                  {viewBlog.metaTitle && (
                    <div>
                      <div className="text-sm font-medium text-gray-700">Meta Title</div>
                      <div className="text-gray-900">{viewBlog.metaTitle}</div>
                    </div>
                  )}
                  {viewBlog.metaDescription && (
                    <div>
                      <div className="text-sm font-medium text-gray-700">Meta Description</div>
                      <div className="text-gray-900 whitespace-pre-wrap">{viewBlog.metaDescription}</div>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Blogs;
