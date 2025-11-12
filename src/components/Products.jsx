import React, { useState, useRef, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import toast, { Toaster } from 'react-hot-toast';
import { 
  FiSearch, 
  FiPlus, 
  FiEdit, 
  FiTrash2, 
  FiEye,
  FiGrid,
  FiList,
  FiFilter,
  FiDownload,
  FiImage,
  FiX,
  FiUpload,
  FiCheck,
  FiAlertCircle
} from 'react-icons/fi';

const Products = () => {
  const ASSET_BASE = 'https://api.readymadewall.in/';
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [viewMode, setViewMode] = useState('grid');
  const [selectedProducts, setSelectedProducts] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const location = useLocation();
  const [isLoading, setIsLoading] = useState(false);
  const [products, setProducts] = useState([]);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    category: '',
    unit: '',
    price: '',
    stock: '',
    isAvailable: true,
    specifications: {
      dimensions: {
        length: '',
        width: '',
        height: '',
        unit: 'mm'
      },
      strength: '',
      color: '',
      texture: ''
    }
  });
  const [images, setImages] = useState([]);
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const fileInputRef = useRef(null);

  // State for edit form
  const [editFormData, setEditFormData] = useState({
    name: '',
    description: '',
    category: '',
    unit: '',
    price: '',
    stock: '',
    isAvailable: true,
    specifications: {
      dimensions: {
        length: '',
        width: '',
        height: '',
        unit: 'mm'
      },
      strength: '',
      color: '',
      texture: ''
    }
  });
  const [editErrors, setEditErrors] = useState({});
  const [isEditMode, setIsEditMode] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [updateLoading, setUpdateLoading] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [imageIndexById, setImageIndexById] = useState({});
  const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] = useState(false);
  const [productToDelete, setProductToDelete] = useState(null);

  const getImageUrl = (nameOrUrl) => {
    if (!nameOrUrl) return '';
    if (typeof nameOrUrl !== 'string') return '';
    if (/^https?:\/\//i.test(nameOrUrl)) return nameOrUrl;
    return ASSET_BASE + encodeURIComponent(nameOrUrl);
  };

  const getCurrentImage = (product) => {
    const images = Array.isArray(product.images) ? product.images : [];
    const index = imageIndexById[product._id || product.id] || 0;
    if (images.length > 0) {
      const boundedIndex = ((index % images.length) + images.length) % images.length;
      return getImageUrl(images[boundedIndex]);
    }
    return product.image ? product.image : '';
  };

  const nextImage = (product) => {
    const images = Array.isArray(product.images) ? product.images : [];
    if (images.length === 0) return;
    const key = product._id || product.id;
    setImageIndexById(prev => ({ ...prev, [key]: (prev[key] || 0) + 1 }));
  };

  const prevImage = (product) => {
    const images = Array.isArray(product.images) ? product.images : [];
    if (images.length === 0) return;
    const key = product._id || product.id;
    setImageIndexById(prev => ({ ...prev, [key]: (prev[key] || 0) - 1 }));
  };

  // Sample products data - in real app, this would come from API
  const sampleProducts = [
    {
      id: 1,
      name: 'Interlocking Paver Blocks',
      category: 'Pavers',
      price: '₹45/sq ft',
      stock: 1500,
      status: 'In Stock',
      image: 'https://images.unsplash.com/photo-1581094794329-c8112a89af12?w=400&h=300&fit=crop',
      description: 'High-quality interlocking paver blocks for driveways and walkways'
    },
    {
      id: 2,
      name: 'Concrete Precast Slabs',
      category: 'Precast',
      price: '₹120/sq ft',
      stock: 800,
      status: 'In Stock',
      image: 'https://images.unsplash.com/photo-1581094794329-c8112a89af12?w=400&h=300&fit=crop',
      description: 'Precast concrete slabs for construction projects'
    },
    {
      id: 3,
      name: 'Garden Paver Stones',
      category: 'Pavers',
      price: '₹35/sq ft',
      stock: 0,
      status: 'Out of Stock',
      image: 'https://images.unsplash.com/photo-1581094794329-c8112a89af12?w=400&h=300&fit=crop',
      description: 'Decorative garden paver stones for landscaping'
    },
    {
      id: 4,
      name: 'Precast Wall Panels',
      category: 'Precast',
      price: '₹180/sq ft',
      stock: 500,
      status: 'In Stock',
      image: 'https://images.unsplash.com/photo-1581094794329-c8112a89af12?w=400&h=300&fit=crop',
      description: 'Precast wall panels for quick construction'
    },
    {
      id: 5,
      name: 'Parking Paver Blocks',
      category: 'Pavers',
      price: '₹55/sq ft',
      stock: 2000,
      status: 'In Stock',
      image: 'https://images.unsplash.com/photo-1581094794329-c8112a89af12?w=400&h=300&fit=crop',
      description: 'Heavy-duty paver blocks for parking areas'
    },
    {
      id: 6,
      name: 'Precast Staircase',
      category: 'Precast',
      price: '₹250/sq ft',
      stock: 100,
      status: 'Low Stock',
      image: 'https://images.unsplash.com/photo-1581094794329-c8112a89af12?w=400&h=300&fit=crop',
      description: 'Precast staircase units for residential and commercial use'
    }
  ];

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const response = await fetch('https://api.readymadewall.in/api/products');
        if (!response.ok) {
          throw new Error('Failed to fetch products');
        }
        const data = await response.json();
        setProducts(data.products || []);
      } catch (err) {
        console.error('Error fetching products:', err);
        // Fallback to sample data if API fails
        setProducts(sampleProducts);
      }
    };
    fetchProducts();
  }, []);

  useEffect(() => {
    if (location.state?.openCreate) {
      setShowModal(true);
      window.history.replaceState({}, document.title);
    }
  }, [location.state]);

  const categories = [
    { value: 'pavers', label: 'Pavers' },
    { value: 'precast', label: 'Precast' },
    { value: 'chainlinks', label: 'Chain Links' },
    { value: 'tiles', label: 'Tiles' },
    { value: 'blocks', label: 'Blocks' },
    { value: 'other', label: 'Other' },
    { value: 'fencingpoles', label: 'Fencing Poles' }
  ];

  const units = [
    { value: 'sqft', label: 'Square Feet' },
    { value: 'sqm', label: 'Square Meter' },
    { value: 'piece', label: 'Piece' },
    { value: 'kg', label: 'Kilogram' },
    { value: 'ton', label: 'Ton' },
    { value: 'm3', label: 'Cubic Meter' }
  ];

  const dimensionUnits = [
    { value: 'mm', label: 'Millimeter (mm)' },
    { value: 'cm', label: 'Centimeter (cm)' },
    { value: 'm', label: 'Meter (m)' },
    { value: 'inch', label: 'Inch' }
  ];

  const getStatusColor = (status) => {
    switch (status) {
      case 'In Stock': return 'bg-green-100 text-green-800';
      case 'Low Stock': return 'bg-yellow-100 text-yellow-800';
      case 'Out of Stock': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const filteredProducts = products.filter(product => {
    const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         product.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = categoryFilter === 'all' || product.category === categoryFilter;
    return matchesSearch && matchesCategory;
  });

  const handleSelectAll = (e) => {
    if (e.target.checked) {
      setSelectedProducts(filteredProducts.map(product => (product._id || product.id)));
    } else {
      setSelectedProducts([]);
    }
  };

  // Single-select logic for products
  const handleSelectProduct = (productId) => {
    setSelectedProducts([productId]);
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
    
    if (name.includes('.')) {
      const [parent, child] = name.split('.');
      setFormData(prev => ({
        ...prev,
        [parent]: {
          ...prev[parent],
          [child]: type === 'checkbox' ? checked : value
        }
      }));
    } else if (name.includes('specifications[')) {
      // Handle nested specifications
      const match = name.match(/specifications\[([^\]]+)\](\[([^\]]+)\])?/);
      if (match) {
        const [, specKey, , subKey] = match;
        setFormData(prev => ({
          ...prev,
          specifications: {
            ...prev.specifications,
            [specKey]: subKey ? {
              ...prev.specifications[specKey],
              [subKey]: value
            } : value
          }
        }));
      }
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: type === 'checkbox' ? checked : value
      }));
    }
  };

  const handleImageChange = (e) => {
    const files = Array.from(e.target.files);
    
    // Validate file types and sizes
    const validFiles = files.filter(file => {
      const isValidType = ['image/jpeg', 'image/png', 'image/webp'].includes(file.type);
      const isValidSize = file.size <= 10 * 1024 * 1024; // 10MB
      
      if (!isValidType) {
        toast.error(`${file.name} is not a valid image format`);
      }
      if (!isValidSize) {
        toast.error(`${file.name} is too large. Maximum size is 10MB`);
      }
      
      return isValidType && isValidSize;
    });
    
    setImages(prev => [...prev, ...validFiles]);
  };

  const removeImage = (index) => {
    setImages(prev => prev.filter((_, i) => i !== index));
  };

  const validateForm = () => {
    const newErrors = {};
    
    // Basic validation
    if (!formData.name.trim()) newErrors.name = 'Product name is required';
    if (!formData.description.trim()) newErrors.description = 'Description is required';
    if (!formData.category) newErrors.category = 'Category is required';
    if (!formData.unit) newErrors.unit = 'Unit is required';
    if (!formData.price) newErrors.price = 'Price is required';
    if (!formData.stock) newErrors.stock = 'Stock quantity is required';
    
    // Price validation
    if (formData.price && isNaN(parseFloat(formData.price))) {
      newErrors.price = 'Please enter a valid price';
    }
    
    // Stock validation
    if (formData.stock && (isNaN(parseInt(formData.stock)) || parseInt(formData.stock) < 0)) {
      newErrors.stock = 'Please enter a valid stock quantity';
    }
    
    // Image validation
    if (images.length === 0) newErrors.images = 'At least one image is required';
    
    // Specifications validation (optional but if provided, validate)
    if (formData.specifications.dimensions.length && isNaN(parseFloat(formData.specifications.dimensions.length))) {
      newErrors.length = 'Please enter a valid length';
    }
    if (formData.specifications.dimensions.width && isNaN(parseFloat(formData.specifications.dimensions.width))) {
      newErrors.width = 'Please enter a valid width';
    }
    if (formData.specifications.dimensions.height && isNaN(parseFloat(formData.specifications.dimensions.height))) {
      newErrors.height = 'Please enter a valid height';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      toast.error('Please fix the errors in the form');
      return;
    }

    setIsSubmitting(true);
    
    try {
      const submitFormData = new FormData();
      submitFormData.append("name", formData.name);
      submitFormData.append("description", formData.description);
      submitFormData.append("category", formData.category);
      submitFormData.append("unit", formData.unit);
      submitFormData.append("price", formData.price);
      submitFormData.append("stock", formData.stock);
      submitFormData.append("isAvailable", formData.isAvailable.toString());
      
      // Append images
      images.forEach((image, index) => {
        submitFormData.append("images", image);
      });
      
      // Append specifications
      submitFormData.append("specifications[dimensions][length]", formData.specifications.dimensions.length);
      submitFormData.append("specifications[dimensions][width]", formData.specifications.dimensions.width);
      submitFormData.append("specifications[dimensions][height]", formData.specifications.dimensions.height);
      submitFormData.append("specifications[dimensions][unit]", formData.specifications.dimensions.unit);
      submitFormData.append("specifications[strength]", formData.specifications.strength);
      submitFormData.append("specifications[color]", formData.specifications.color);
      submitFormData.append("specifications[texture]", formData.specifications.texture);

      const requestOptions = {
        method: "POST",
        body: submitFormData,
        redirect: "follow"
      };

      const response = await fetch("https://api.readymadewall.in/api/products/createProduct", requestOptions);
      const result = await response.json();
      
      if (response.ok) {
        toast.success('Product added successfully!');
        setShowModal(false);
        resetForm();
        // Add the new product to the list
        const newProduct = {
          id: Date.now(), // Temporary ID
          name: formData.name,
          category: categories.find(cat => cat.value === formData.category)?.label || formData.category,
          price: `₹${formData.price}/${formData.unit}`,
          stock: parseInt(formData.stock),
          status: formData.isAvailable ? 'In Stock' : 'Out of Stock',
          image: images.length > 0 ? URL.createObjectURL(images[0]) : 'https://images.unsplash.com/photo-1581094794329-c8112a89af12?w=400&h=300&fit=crop',
          description: formData.description
        };
        setProducts(prev => [newProduct, ...prev]);
      } else {
        toast.error('Error adding product: ' + (result.message || 'Unknown error'));
      }
    } catch (error) {
      console.error('Error:', error);
      toast.error('Error adding product. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      description: '',
      category: '',
      unit: '',
      price: '',
      stock: '',
      isAvailable: true,
      specifications: {
        dimensions: {
          length: '',
          width: '',
          height: '',
          unit: 'mm'
        },
        strength: '',
        color: '',
        texture: ''
      }
    });
    setImages([]);
    setErrors({});
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const closeModal = () => {
    setShowModal(false);
    resetForm();
  };

  const handleBulkDelete = () => {
    if (selectedProducts.length === 0) return;
    
    if (window.confirm(`Are you sure you want to delete ${selectedProducts.length} product(s)?`)) {
      setProducts(prev => prev.filter(product => !selectedProducts.includes(product.id)));
      setSelectedProducts([]);
      toast.success(`${selectedProducts.length} product(s) deleted successfully`);
    }
  };

  // Handle edit form input changes
  const handleEditInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    
    if (editErrors[name]) {
      setEditErrors(prev => ({ ...prev, [name]: '' }));
    }
    
    if (name.includes('.')) {
      const [parent, child] = name.split('.');
      setEditFormData(prev => ({
        ...prev,
        [parent]: {
          ...prev[parent],
          [child]: type === 'checkbox' ? checked : value
        }
      }));
    } else if (name.includes('specifications[')) {
      const match = name.match(/specifications\[([^\]]+)\](\[([^\]]+)\])?/);
      if (match) {
        const [, specKey, , subKey] = match;
        setEditFormData(prev => ({
          ...prev,
          specifications: {
            ...prev.specifications,
            [specKey]: subKey ? {
              ...prev.specifications[specKey],
              [subKey]: value
            } : value
          }
        }));
      }
    } else {
      setEditFormData(prev => ({
        ...prev,
        [name]: type === 'checkbox' ? checked : value
      }));
    }
  };

  // Validate edit form
  const validateEditForm = () => {
    const newErrors = {};
    
    if (!editFormData.name.trim()) newErrors.name = 'Product name is required';
    if (!editFormData.description.trim()) newErrors.description = 'Description is required';
    if (!editFormData.category) newErrors.category = 'Category is required';
    if (!editFormData.unit) newErrors.unit = 'Unit is required';
    if (!editFormData.price) newErrors.price = 'Price is required';
    if (!editFormData.stock) newErrors.stock = 'Stock quantity is required';
    
    if (editFormData.price && isNaN(parseFloat(editFormData.price))) {
      newErrors.price = 'Please enter a valid price';
    }
    
    if (editFormData.stock && (isNaN(parseInt(editFormData.stock)) || parseInt(editFormData.stock) < 0)) {
      newErrors.stock = 'Please enter a valid stock quantity';
    }

    setEditErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // View product details
  const handleView = (product) => {
    setSelectedProduct(product);
    setIsEditMode(false);
    setIsModalOpen(true);
  };

  // Edit product
  const handleEdit = (product) => {
    setSelectedProduct(product);
    setEditFormData({
      name: product.name || '',
      description: product.description || '',
      category: product.category || '',
      unit: product.unit || '',
      price: product.price || '',
      stock: product.stock || '',
      isAvailable: product.isAvailable !== false,
      specifications: {
        dimensions: {
          length: product.specifications?.dimensions?.length || '',
          width: product.specifications?.dimensions?.width || '',
          height: product.specifications?.dimensions?.height || '',
          unit: product.specifications?.dimensions?.unit || 'mm'
        },
        strength: product.specifications?.strength || '',
        color: product.specifications?.color || '',
        texture: product.specifications?.texture || ''
      }
    });
    setEditErrors({});
    setIsEditMode(true);
    setIsModalOpen(true);
  };

  // Update product
  const handleUpdate = async (e) => {
    e.preventDefault();
    
    if (!validateEditForm()) {
      toast.error('Please fix the errors in the form');
      return;
    }

    setUpdateLoading(true);
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`https://api.readymadewall.in/api/products/${selectedProduct._id || selectedProduct.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(editFormData)
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to update');
      }
      
      const data = await response.json();
      setProducts(prev => prev.map(p => (p._id || p.id) === (selectedProduct._id || selectedProduct.id) ? data.product || { ...selectedProduct, ...editFormData } : p));
      setIsModalOpen(false);
      setSelectedProduct(null);
      setSelectedProducts([]);
      toast.success('Product updated successfully!');
    } catch (err) {
      toast.error('Update failed: ' + err.message);
    } finally {
      setUpdateLoading(false);
    }
  };

  // Close edit modal
  const closeEditModal = () => {
    setIsModalOpen(false);
    setSelectedProduct(null);
    setEditFormData({
      name: '',
      description: '',
      category: '',
      unit: '',
      price: '',
      stock: '',
      isAvailable: true,
      specifications: {
        dimensions: {
          length: '',
          width: '',
          height: '',
          unit: 'mm'
        },
        strength: '',
        color: '',
        texture: ''
      }
    });
    setEditErrors({});
  };

  const openDeleteConfirm = (product) => {
    setProductToDelete(product);
    setIsDeleteConfirmOpen(true);
  };

  const confirmDelete = async () => {
    if (!productToDelete) return;
    setDeleteLoading(true);
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`https://api.readymadewall.in/api/products/${productToDelete._id || productToDelete.id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to delete');
      }
      setProducts(prev => prev.filter(p => (p._id || p.id) !== (productToDelete._id || productToDelete.id)));
      setSelectedProducts(prev => prev.filter(id => id !== (productToDelete._id || productToDelete.id)));
      toast.success('Product deleted successfully!');
      setIsDeleteConfirmOpen(false);
      setProductToDelete(null);
    } catch (err) {
      toast.error('Delete failed: ' + err.message);
    } finally {
      setDeleteLoading(false);
    }
  };

  const cancelDelete = () => {
    setIsDeleteConfirmOpen(false);
    setProductToDelete(null);
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
          <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900">Products Management</h1>
          <p className="text-sm sm:text-base text-gray-600 mt-1">Manage your product catalog and inventory</p>
        </div>
        <div className="flex flex-col sm:flex-row gap-3">
          <button className="px-3 sm:px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors text-sm sm:text-base flex items-center justify-center gap-2">
            <FiDownload className="inline" size={16} />
            <span>Export</span>
          </button>
          <button 
            onClick={() => setShowModal(true)}
            className="px-3 sm:px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm sm:text-base flex items-center justify-center gap-2"
          >
            <FiPlus className="inline" size={16} />
            <span>Add New Product</span>
          </button>
        </div>
      </div>

      {/* Filters and Search */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 sm:p-6">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div className="flex flex-col sm:flex-row sm:items-center gap-3">
            <div className="relative">
              <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
              <input
                type="text"
                placeholder="Search products..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm sm:text-base w-full"
              />
            </div>
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="px-2 py-1 border border-gray-300 rounded focus:ring-1 focus:ring-blue-500 focus:border-blue-500 text-sm"
            >
              <option value="all">All Categories</option>
              {categories.map(cat => (
                <option key={cat.value} value={cat.label}>{cat.label}</option>
              ))}
            </select>
          </div>
          <div className="flex items-center gap-3 sm:gap-4">
            <div className="flex items-center gap-2">
              <button
                onClick={() => setViewMode('grid')}
                className={`p-2 rounded ${viewMode === 'grid' ? 'bg-blue-100 text-blue-600' : 'text-gray-400 hover:text-gray-600'}`}
                title="Grid View"
              >
                <FiGrid size={18} />
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`p-2 rounded ${viewMode === 'list' ? 'bg-blue-100 text-blue-600' : 'text-gray-400 hover:text-gray-600'}`}
                title="List View"
              >
                <FiList size={18} />
              </button>
            </div>
            <span className="text-xs sm:text-sm text-gray-600">
              {filteredProducts.length} of {products.length} products
            </span>
          </div>
        </div>
      </div>

      {/* Products Grid/List */}
      {viewMode === 'grid' ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
          {filteredProducts.map((product) => {
            const pid = product._id || product.id;
            return (
            <div key={pid} className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow">
              <div className="relative">
                <img
                  src={getCurrentImage(product)}
                  alt={product.name}
                  className="w-full h-40 sm:h-48 object-cover"
                />
                {Array.isArray(product.images) && product.images.length > 1 && (
                  <div className="absolute inset-0 flex items-center justify-between px-2">
                    <button
                      type="button"
                      onClick={() => prevImage(product)}
                      className="bg-black/40 hover:bg-black/60 text-white rounded-full w-8 h-8 flex items-center justify-center"
                      aria-label="Previous image"
                    >
                      ‹
                    </button>
                    <button
                      type="button"
                      onClick={() => nextImage(product)}
                      className="bg-black/40 hover:bg-black/60 text-white rounded-full w-8 h-8 flex items-center justify-center"
                      aria-label="Next image"
                    >
                      ›
                    </button>
                  </div>
                )}
                {Array.isArray(product.images) && product.images.length > 0 && (
                  <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex gap-1">
                    {product.images.map((_, idx) => {
                      const key = product._id || product.id;
                      const active = ((imageIndexById[key] || 0) % product.images.length + product.images.length) % product.images.length === idx;
                      return <span key={idx} className={`w-2 h-2 rounded-full ${active ? 'bg-white' : 'bg-white/50'}`}></span>;
                    })}
                  </div>
                )}
                <div className="absolute top-2 right-2">
                  <input
                    type="checkbox"
                    checked={selectedProducts.includes(pid)}
                    onChange={() => handleSelectProduct(pid)}
                    className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500 cursor-pointer"
                    style={{ minHeight: '16px', minWidth: '16px' }}
                  />
                </div>
                <div className="absolute top-2 left-2">
                  <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(product.status)}`}>
                    {product.status}
                  </span>
                </div>
              </div>
              <div className="p-3 sm:p-4">
                <h3 className="text-sm sm:text-base lg:text-lg font-semibold text-gray-900 mb-2 line-clamp-2">{product.name}</h3>
                <p className="text-xs sm:text-sm text-gray-600 mb-3 line-clamp-2">{product.description}</p>
                <div className="flex items-center justify-between mb-3">
                  <span className="text-sm sm:text-base lg:text-lg font-bold text-blue-600">{product.price}</span>
                  <span className="text-xs sm:text-sm text-gray-500">Stock: {product.stock}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded">{product.category}</span>
                  <div className="flex gap-1 sm:gap-2">
                    <button onClick={() => handleView(product)} className="text-blue-600 hover:text-blue-900 p-1" title="View Details">
                      <FiEye size={14} />
                    </button>
                    <button onClick={() => handleEdit(product)} className="text-gray-600 hover:text-gray-900 p-1" title="Edit Product">
                      <FiEdit size={14} />
                    </button>
                    <button onClick={() => openDeleteConfirm(product)} className="text-red-600 hover:text-red-900 p-1" title="Delete Product">
                      <FiTrash2 size={14} />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          );})}
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-3 sm:px-6 py-3 text-left">
                    <input
                      type="checkbox"
                      checked={selectedProducts.length === filteredProducts.length && filteredProducts.length > 0}
                      onChange={handleSelectAll}
                      className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500 cursor-pointer"
                      style={{ minHeight: '16px', minWidth: '16px' }}
                    />
                  </th>
                  <th className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Product
                  </th>
                  <th className="hidden sm:table-cell px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Category
                  </th>
                  <th className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Price
                  </th>
                  <th className="hidden md:table-cell px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Stock
                  </th>
                  <th className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-3 sm:px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredProducts.map((product) => {
                  const pid = product._id || product.id;
                  return (
                  <tr key={pid} className="hover:bg-gray-50">
                    <td className="px-3 sm:px-6 py-4 whitespace-nowrap">
                      <input
                        type="checkbox"
                        checked={selectedProducts.includes(pid)}
                        onChange={() => handleSelectProduct(pid)}
                        className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500 cursor-pointer"
                        style={{ minHeight: '16px', minWidth: '16px' }}
                      />
                    </td>
                    <td className="px-3 sm:px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <img
                          src={getCurrentImage(product)}
                          alt={product.name}
                          className="w-10 h-10 sm:w-12 sm:h-12 object-cover rounded-lg"
                        />
                        <div className="ml-3 sm:ml-4 min-w-0 flex-1">
                          <div className="text-sm font-medium text-gray-900 truncate">{product.name}</div>
                          <div className="text-xs sm:text-sm text-gray-500 truncate">{product.description}</div>
                        </div>
                      </div>
                    </td>
                    <td className="hidden sm:table-cell px-3 sm:px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {product.category}
                    </td>
                    <td className="px-3 sm:px-6 py-4 whitespace-nowrap text-sm font-semibold text-blue-600">
                      {product.price}
                    </td>
                    <td className="hidden md:table-cell px-3 sm:px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {product.stock}
                    </td>
                    <td className="px-3 sm:px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(product.status)}`}>
                        {product.status}
                      </span>
                    </td>
                    <td className="px-3 sm:px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex items-center justify-end gap-1 sm:gap-2">
                        <button onClick={() => handleView(product)} className="text-blue-600 hover:text-blue-900 p-1" title="View Details">
                          <FiEye size={14} />
                        </button>
                        <button onClick={() => handleEdit(product)} className="text-gray-600 hover:text-gray-900 p-1" title="Edit Product">
                          <FiEdit size={14} />
                        </button>
                        <button onClick={() => openDeleteConfirm(product)} className="text-red-600 hover:text-red-900 p-1" title="Delete Product">
                          <FiTrash2 size={14} />
                        </button>
                      </div>
                    </td>
                  </tr>
                );})}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Bulk Actions */}
      {selectedProducts.length > 0 && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <span className="text-sm text-blue-800">
              {selectedProducts.length} product(s) selected
            </span>
            <div className="flex space-x-2">
              <button className="px-3 py-1 bg-blue-600 text-white text-sm rounded hover:bg-blue-700">
                Update Stock
              </button>
              <button className="px-3 py-1 bg-green-600 text-white text-sm rounded hover:bg-green-700">
                Export Selected
              </button>
              <button 
                onClick={handleBulkDelete}
                className="px-3 py-1 bg-red-600 text-white text-sm rounded hover:bg-red-700"
              >
                Delete Selected
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add Product Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <h2 className="text-xl font-semibold text-gray-900">Add New Product</h2>
              <button
                onClick={closeModal}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <FiX size={24} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-6">
              {/* Basic Information */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Product Name *
                  </label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                      errors.name ? 'border-red-500' : 'border-gray-300'
                    }`}
                    placeholder="Enter product name"
                  />
                  {errors.name && (
                    <p className="mt-1 text-sm text-red-600 flex items-center gap-1">
                      <FiAlertCircle size={14} />
                      {errors.name}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Category *
                  </label>
                  <select
                    name="category"
                    value={formData.category}
                    onChange={handleInputChange}
                    className={`w-full px-2 py-1 border rounded focus:ring-1 focus:ring-blue-500 focus:border-blue-500 text-sm ${
                      errors.category ? 'border-red-500' : 'border-gray-300'
                    }`}
                  >
                    <option value="">Select category</option>
                    {categories.map(cat => (
                      <option key={cat.value} value={cat.value}>{cat.label}</option>
                    ))}
                  </select>
                  {errors.category && (
                    <p className="mt-1 text-sm text-red-600 flex items-center gap-1">
                      <FiAlertCircle size={14} />
                      {errors.category}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Price *
                  </label>
                  <input
                    type="number"
                    name="price"
                    value={formData.price}
                    onChange={handleInputChange}
                    className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                      errors.price ? 'border-red-500' : 'border-gray-300'
                    }`}
                    placeholder="0.00"
                    step="0.01"
                    min="0"
                  />
                  {errors.price && (
                    <p className="mt-1 text-sm text-red-600 flex items-center gap-1">
                      <FiAlertCircle size={14} />
                      {errors.price}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Unit *
                  </label>
                  <select
                    name="unit"
                    value={formData.unit}
                    onChange={handleInputChange}
                    className={`w-full px-2 py-1 border rounded focus:ring-1 focus:ring-blue-500 focus:border-blue-500 text-sm ${
                      errors.unit ? 'border-red-500' : 'border-gray-300'
                    }`}
                  >
                    <option value="">Select unit</option>
                    {units.map(unit => (
                      <option key={unit.value} value={unit.value}>{unit.label}</option>
                    ))}
                  </select>
                  {errors.unit && (
                    <p className="mt-1 text-sm text-red-600 flex items-center gap-1">
                      <FiAlertCircle size={14} />
                      {errors.unit}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Stock Quantity *
                  </label>
                  <input
                    type="number"
                    name="stock"
                    value={formData.stock}
                    onChange={handleInputChange}
                    className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                      errors.stock ? 'border-red-500' : 'border-gray-300'
                    }`}
                    placeholder="0"
                    min="0"
                  />
                  {errors.stock && (
                    <p className="mt-1 text-sm text-red-600 flex items-center gap-1">
                      <FiAlertCircle size={14} />
                      {errors.stock}
                    </p>
                  )}
                </div>

                <div className="flex items-center">
                  <input
                    type="checkbox"
                    name="isAvailable"
                    checked={formData.isAvailable}
                    onChange={handleInputChange}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  <label className="ml-2 block text-sm text-gray-900">
                    Available for purchase
                  </label>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Description *
                </label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  rows={3}
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                    errors.description ? 'border-red-500' : 'border-gray-300'
                  }`}
                  placeholder="Enter product description"
                />
                {errors.description && (
                  <p className="mt-1 text-sm text-red-600 flex items-center gap-1">
                    <FiAlertCircle size={14} />
                    {errors.description}
                  </p>
                )}
              </div>

              {/* Images Upload */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Product Images *
                </label>
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-blue-400 transition-colors">
                  <FiUpload className="mx-auto h-12 w-12 text-gray-400" />
                  <div className="mt-4">
                    <label htmlFor="file-upload" className="cursor-pointer bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors">
                      Choose Files
                    </label>
                    <input
                      id="file-upload"
                      ref={fileInputRef}
                      type="file"
                      multiple
                      accept="image/*"
                      onChange={handleImageChange}
                      className="hidden"
                    />
                  </div>
                  <p className="mt-2 text-sm text-gray-600">
                    PNG, JPG, WEBP up to 10MB each
                  </p>
                </div>
                {errors.images && (
                  <p className="mt-1 text-sm text-red-600 flex items-center gap-1">
                    <FiAlertCircle size={14} />
                    {errors.images}
                  </p>
                )}
                
                {/* Preview Images */}
                {images.length > 0 && (
                  <div className="mt-4 grid grid-cols-2 md:grid-cols-4 gap-4">
                    {images.map((image, index) => (
                      <div key={index} className="relative">
                        <img
                          src={URL.createObjectURL(image)}
                          alt={`Preview ${index + 1}`}
                          className="w-full h-24 object-cover rounded-lg"
                        />
                        <button
                          type="button"
                          onClick={() => removeImage(index)}
                          className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center hover:bg-red-600"
                        >
                          <FiX size={12} />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Specifications */}
              <div className="border-t border-gray-200 pt-6">
                <h3 className="text-lg font-medium text-gray-900 mb-4">Specifications (Optional)</h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Length
                    </label>
                    <input
                      type="number"
                      name="specifications[dimensions][length]"
                      value={formData.specifications.dimensions.length}
                      onChange={handleInputChange}
                      className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                        errors.length ? 'border-red-500' : 'border-gray-300'
                      }`}
                      placeholder="200"
                      min="0"
                      step="0.1"
                    />
                    {errors.length && (
                      <p className="mt-1 text-sm text-red-600 flex items-center gap-1">
                        <FiAlertCircle size={14} />
                        {errors.length}
                      </p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Width
                    </label>
                    <input
                      type="number"
                      name="specifications[dimensions][width]"
                      value={formData.specifications.dimensions.width}
                      onChange={handleInputChange}
                      className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                        errors.width ? 'border-red-500' : 'border-gray-300'
                      }`}
                      placeholder="100"
                      min="0"
                      step="0.1"
                    />
                    {errors.width && (
                      <p className="mt-1 text-sm text-red-600 flex items-center gap-1">
                        <FiAlertCircle size={14} />
                        {errors.width}
                      </p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Height
                    </label>
                    <input
                      type="number"
                      name="specifications[dimensions][height]"
                      value={formData.specifications.dimensions.height}
                      onChange={handleInputChange}
                      className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                        errors.height ? 'border-red-500' : 'border-gray-300'
                      }`}
                      placeholder="75"
                      min="0"
                      step="0.1"
                    />
                    {errors.height && (
                      <p className="mt-1 text-sm text-red-600 flex items-center gap-1">
                        <FiAlertCircle size={14} />
                        {errors.height}
                      </p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Unit
                    </label>
                    <select
                      name="specifications[dimensions][unit]"
                      value={formData.specifications.dimensions.unit}
                      onChange={handleInputChange}
                      className="w-full px-2 py-1 border border-gray-300 rounded focus:ring-1 focus:ring-blue-500 focus:border-blue-500 text-sm"
                    >
                      {dimensionUnits.map(unit => (
                        <option key={unit.value} value={unit.value}>{unit.label}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Strength
                    </label>
                    <input
                      type="text"
                      name="specifications[strength]"
                      value={formData.specifications.strength}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="25MPa"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Color
                    </label>
                    <input
                      type="text"
                      name="specifications[color]"
                      value={formData.specifications.color}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Gray"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Texture
                    </label>
                    <input
                      type="text"
                      name="specifications[texture]"
                      value={formData.specifications.texture}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Smooth"
                    />
                  </div>
                </div>
              </div>

              {/* Form Actions */}
              <div className="flex items-center justify-end space-x-3 pt-6 border-t border-gray-200">
                <button
                  type="button"
                  onClick={closeModal}
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
                      Adding...
                    </>
                  ) : (
                    <>
                      <FiCheck size={16} className="mr-2" />
                      Add Product
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Product Modal */}
      {isModalOpen && selectedProduct && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <h2 className="text-xl font-semibold text-gray-900">
                {isEditMode ? 'Edit Product' : 'Product Details'}
              </h2>
              <button
                onClick={closeEditModal}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <FiX size={24} />
              </button>
            </div>

            {isEditMode ? (
              <form onSubmit={handleUpdate} className="p-6 space-y-6">
                {/* Basic Information */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Product Name *
                    </label>
                    <input
                      type="text"
                      name="name"
                      value={editFormData.name}
                      onChange={handleEditInputChange}
                      className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                        editErrors.name ? 'border-red-500' : 'border-gray-300'
                      }`}
                      placeholder="Enter product name"
                    />
                    {editErrors.name && (
                      <p className="mt-1 text-sm text-red-600 flex items-center gap-1">
                        <FiAlertCircle size={14} />
                        {editErrors.name}
                      </p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Category *
                    </label>
                    <select
                      name="category"
                      value={editFormData.category}
                      onChange={handleEditInputChange}
                      className={`w-full px-2 py-1 border rounded focus:ring-1 focus:ring-blue-500 focus:border-blue-500 text-sm ${
                        editErrors.category ? 'border-red-500' : 'border-gray-300'
                      }`}
                    >
                      <option value="">Select category</option>
                      {categories.map(cat => (
                        <option key={cat.value} value={cat.value}>{cat.label}</option>
                      ))}
                    </select>
                    {editErrors.category && (
                      <p className="mt-1 text-sm text-red-600 flex items-center gap-1">
                        <FiAlertCircle size={14} />
                        {editErrors.category}
                      </p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Price *
                    </label>
                    <input
                      type="number"
                      name="price"
                      value={editFormData.price}
                      onChange={handleEditInputChange}
                      className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                        editErrors.price ? 'border-red-500' : 'border-gray-300'
                      }`}
                      placeholder="0.00"
                      step="0.01"
                      min="0"
                    />
                    {editErrors.price && (
                      <p className="mt-1 text-sm text-red-600 flex items-center gap-1">
                        <FiAlertCircle size={14} />
                        {editErrors.price}
                      </p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Unit *
                    </label>
                    <select
                      name="unit"
                      value={editFormData.unit}
                      onChange={handleEditInputChange}
                      className={`w-full px-2 py-1 border rounded focus:ring-1 focus:ring-blue-500 focus:border-blue-500 text-sm ${
                        editErrors.unit ? 'border-red-500' : 'border-gray-300'
                      }`}
                    >
                      <option value="">Select unit</option>
                      {units.map(unit => (
                        <option key={unit.value} value={unit.value}>{unit.label}</option>
                      ))}
                    </select>
                    {editErrors.unit && (
                      <p className="mt-1 text-sm text-red-600 flex items-center gap-1">
                        <FiAlertCircle size={14} />
                        {editErrors.unit}
                      </p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Stock Quantity *
                    </label>
                    <input
                      type="number"
                      name="stock"
                      value={editFormData.stock}
                      onChange={handleEditInputChange}
                      className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                        editErrors.stock ? 'border-red-500' : 'border-gray-300'
                      }`}
                      placeholder="0"
                      min="0"
                    />
                    {editErrors.stock && (
                      <p className="mt-1 text-sm text-red-600 flex items-center gap-1">
                        <FiAlertCircle size={14} />
                        {editErrors.stock}
                      </p>
                    )}
                  </div>

                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      name="isAvailable"
                      checked={editFormData.isAvailable}
                      onChange={handleEditInputChange}
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    />
                    <label className="ml-2 block text-sm text-gray-900">
                      Available for purchase
                    </label>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Description *
                  </label>
                  <textarea
                    name="description"
                    value={editFormData.description}
                    onChange={handleEditInputChange}
                    rows={3}
                    className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                      editErrors.description ? 'border-red-500' : 'border-gray-300'
                    }`}
                    placeholder="Enter product description"
                  />
                  {editErrors.description && (
                    <p className="mt-1 text-sm text-red-600 flex items-center gap-1">
                      <FiAlertCircle size={14} />
                      {editErrors.description}
                    </p>
                  )}
                </div>

                {/* Specifications */}
                <div className="border-t border-gray-200 pt-6">
                  <h3 className="text-lg font-medium text-gray-900 mb-4">Specifications (Optional)</h3>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Length
                      </label>
                      <input
                        type="number"
                        name="specifications[dimensions][length]"
                        value={editFormData.specifications.dimensions.length}
                        onChange={handleEditInputChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="200"
                        min="0"
                        step="0.1"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Width
                      </label>
                      <input
                        type="number"
                        name="specifications[dimensions][width]"
                        value={editFormData.specifications.dimensions.width}
                        onChange={handleEditInputChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="100"
                        min="0"
                        step="0.1"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Height
                      </label>
                      <input
                        type="number"
                        name="specifications[dimensions][height]"
                        value={editFormData.specifications.dimensions.height}
                        onChange={handleEditInputChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="75"
                        min="0"
                        step="0.1"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Unit
                      </label>
                      <select
                        name="specifications[dimensions][unit]"
                        value={editFormData.specifications.dimensions.unit}
                        onChange={handleEditInputChange}
                        className="w-full px-2 py-1 border border-gray-300 rounded focus:ring-1 focus:ring-blue-500 focus:border-blue-500 text-sm"
                      >
                        {dimensionUnits.map(unit => (
                          <option key={unit.value} value={unit.value}>{unit.label}</option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Strength
                      </label>
                      <input
                        type="text"
                        name="specifications[strength]"
                        value={editFormData.specifications.strength}
                        onChange={handleEditInputChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="25MPa"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Color
                      </label>
                      <input
                        type="text"
                        name="specifications[color]"
                        value={editFormData.specifications.color}
                        onChange={handleEditInputChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="Gray"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Texture
                      </label>
                      <input
                        type="text"
                        name="specifications[texture]"
                        value={editFormData.specifications.texture}
                        onChange={handleEditInputChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="Smooth"
                      />
                    </div>
                  </div>
                </div>

                {/* Form Actions */}
                <div className="flex items-center justify-end space-x-3 pt-6 border-t border-gray-200">
                  <button
                    type="button"
                    onClick={closeEditModal}
                    className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={updateLoading}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
                  >
                    {updateLoading ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                        Updating...
                      </>
                    ) : (
                      <>
                        <FiCheck size={16} className="mr-2" />
                        Update Product
                      </>
                    )}
                  </button>
                </div>
              </form>
            ) : (
              <div className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">{selectedProduct.name}</h3>
                    <p className="text-gray-600 mb-4">{selectedProduct.description}</p>
                    <div className="space-y-2">
                      <p><span className="font-medium">Category:</span> {selectedProduct.category}</p>
                      <p><span className="font-medium">Price:</span> {selectedProduct.price}</p>
                      <p><span className="font-medium">Stock:</span> {selectedProduct.stock}</p>
                      <p><span className="font-medium">Status:</span> {selectedProduct.isAvailable ? 'Available' : 'Not Available'}</p>
                    </div>
                  </div>
                  <div>
                    <img
                      src={selectedProduct.image}
                      alt={selectedProduct.name}
                      className="w-full h-48 object-cover rounded-lg"
                    />
                  </div>
                </div>
                <div className="flex items-center justify-end space-x-3 pt-6 border-t border-gray-200 mt-6">
                  <button
                    onClick={() => setIsEditMode(true)}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    Edit Product
                  </button>
                  <button
                    onClick={() => openDeleteConfirm(selectedProduct)}
                    className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                    disabled={deleteLoading}
                  >
                    {deleteLoading ? 'Deleting...' : 'Delete Product'}
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {isDeleteConfirmOpen && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-md">
            <div className="p-6 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900">Delete Product</h3>
            </div>
            <div className="p-6 space-y-4">
              <p className="text-gray-700">Are you sure you want to delete
                {productToDelete ? ` "${productToDelete.name}"` : ''}? This action cannot be undone.</p>
            </div>
            <div className="flex items-center justify-end gap-3 p-6 border-t border-gray-200">
              <button
                onClick={cancelDelete}
                className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={confirmDelete}
                disabled={deleteLoading}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50"
              >
                {deleteLoading ? 'Deleting...' : 'Delete'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Products;
