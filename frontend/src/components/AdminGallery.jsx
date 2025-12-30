import React, { useState, useEffect, useContext } from 'react';
import { Search, Filter, Plus, Edit, Trash2, Eye, Calendar, MapPin, User, Loader, Download } from 'lucide-react';
import GalleryModal from '../components/GalleryModal';
import { AuthContext } from '../context/AuthContext';

const AdminGallery = () => {
  const { user } = useContext(AuthContext);
  const [images, setImages] = useState([]);
  const [filteredImages, setFilteredImages] = useState([]);
  const [branches, setBranches] = useState([]);
  const [selectedBranch, setSelectedBranch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingImage, setEditingImage] = useState(null);
  const [selectedImage, setSelectedImage] = useState(null);
  const [stats, setStats] = useState({ totalImages: 0, categoryStats: {} });
  const [pagination, setPagination] = useState({ page: 1, limit: 20, total: 0, pages: 0 });

  const categories = ['All', 'Events', 'Classes', 'Campus', 'Students', 'Activities', 'Other'];

  useEffect(() => {
    fetchImages();
    fetchBranches();
    fetchStats();
  }, [selectedBranch, selectedCategory, searchTerm, pagination.page]);

  useEffect(() => {
    filterImages();
  }, [images, selectedBranch, selectedCategory, searchTerm]);

  const fetchImages = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        page: pagination.page,
        limit: pagination.limit,
      });

      if (selectedBranch) {
        params.append('branchId', selectedBranch);
      }

      if (selectedCategory && selectedCategory !== 'All') {
        params.append('category', selectedCategory);
      }

      const response = await fetch(`http://localhost:5000/api/gallery?${params}`);
      const data = await response.json();

      if (response.ok) {
        setImages(data.images || []);
        setPagination(data.pagination || pagination);
      }
    } catch (error) {
      console.error('Error fetching gallery images:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchBranches = async () => {
    try {
      const response = await fetch('http://localhost:5000/api/branches');
      const data = await response.json();
      if (response.ok) {
        setBranches(data);
      }
    } catch (error) {
      console.error('Error fetching branches:', error);
    }
  };

  const fetchStats = async () => {
    try {
      const params = selectedBranch ? `?branchId=${selectedBranch}` : '';
      const response = await fetch(`http://localhost:5000/api/gallery/stats${params}`);
      const data = await response.json();
      if (response.ok) {
        setStats(data);
      }
    } catch (error) {
      console.error('Error fetching stats:', error);
    }
  };

  const filterImages = () => {
    let filtered = images;

    if (searchTerm) {
      filtered = filtered.filter(img =>
        img.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (img.description && img.description.toLowerCase().includes(searchTerm.toLowerCase()))
      );
    }

    setFilteredImages(filtered);
  };

  const handleAddImage = () => {
    setEditingImage(null);
    setShowModal(true);
  };

  const handleEditImage = (image) => {
    setEditingImage(image);
    setShowModal(true);
  };

  const handleSubmitImage = async (id, formData) => {
    try {
      const token = localStorage.getItem('token');
      const url = id 
        ? `http://localhost:5000/api/gallery/${id}`
        : 'http://localhost:5000/api/gallery';
      
      const method = id ? 'PUT' : 'POST';
      
      const response = await fetch(url, {
        method,
        headers: {
          'Authorization': `Bearer ${token}`,
        },
        body: formData
      });

      const data = await response.json();

      if (response.ok) {
        fetchImages();
        fetchStats();
        alert(id ? 'Image updated successfully!' : 'Image uploaded successfully!');
      } else {
        alert(data.message || 'Failed to save image');
      }
    } catch (error) {
      console.error('Error saving image:', error);
      alert('Failed to save image');
    }
  };

  const handleDeleteImage = async (imageId) => {
    if (!confirm('Are you sure you want to delete this image? This action cannot be undone.')) {
      return;
    }

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`http://localhost:5000/api/gallery/${imageId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
        }
      });

      const data = await response.json();

      if (response.ok) {
        fetchImages();
        fetchStats();
        alert('Image deleted successfully!');
      } else {
        alert(data.message || 'Failed to delete image');
      }
    } catch (error) {
      console.error('Error deleting image:', error);
      alert('Failed to delete image');
    }
  };

  const exportData = () => {
    const csvContent = [
      ['Title', 'Description', 'Category', 'Branch', 'Created By', 'Created Date'],
      ...filteredImages.map(img => [
        img.title,
        img.description || '',
        img.category,
        img.branchId?.name || '',
        `${img.createdBy?.firstName} ${img.createdBy?.lastName}`,
        new Date(img.createdAt).toLocaleDateString()
      ])
    ].map(row => row.map(cell => `"${cell}"`).join(',')).join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `gallery_export_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  return (
    <div className='p-6'>
      <div className='mb-6'>
        <h1 className='text-3xl font-bold text-gray-800 mb-2'>Gallery Management</h1>
        <p className='text-gray-600'>Manage all gallery images across branches</p>
      </div>

      {/* Stats Cards */}
      <div className='grid grid-cols-1 md:grid-cols-4 gap-4 mb-6'>
        <div className='bg-white p-6 rounded-lg shadow-sm border'>
          <div className='flex items-center justify-between'>
            <div>
              <p className='text-sm text-gray-600 mb-1'>Total Images</p>
              <p className='text-2xl font-bold text-blue-600'>{stats.totalImages}</p>
            </div>
            <div className='bg-blue-100 p-3 rounded-full'>
              <Eye className='w-6 h-6 text-blue-600' />
            </div>
          </div>
        </div>

        <div className='bg-white p-6 rounded-lg shadow-sm border'>
          <div className='flex items-center justify-between'>
            <div>
              <p className='text-sm text-gray-600 mb-1'>Branches</p>
              <p className='text-2xl font-bold text-green-600'>{branches.length}</p>
            </div>
            <div className='bg-green-100 p-3 rounded-full'>
              <MapPin className='w-6 h-6 text-green-600' />
            </div>
          </div>
        </div>

        <div className='bg-white p-6 rounded-lg shadow-sm border'>
          <div className='flex items-center justify-between'>
            <div>
              <p className='text-sm text-gray-600 mb-1'>Categories</p>
              <p className='text-2xl font-bold text-purple-600'>{categories.length - 1}</p>
            </div>
            <div className='bg-purple-100 p-3 rounded-full'>
              <Filter className='w-6 h-6 text-purple-600' />
            </div>
          </div>
        </div>

        <div className='bg-white p-6 rounded-lg shadow-sm border'>
          <div className='flex items-center justify-between'>
            <div>
              <p className='text-sm text-gray-600 mb-1'>Filtered</p>
              <p className='text-2xl font-bold text-orange-600'>{filteredImages.length}</p>
            </div>
            <div className='bg-orange-100 p-3 rounded-full'>
              <Search className='w-6 h-6 text-orange-600' />
            </div>
          </div>
        </div>
      </div>

      {/* Filters and Actions */}
      <div className='bg-white p-4 rounded-lg shadow-sm border mb-6'>
        <div className='flex flex-col lg:flex-row gap-4 items-center justify-between'>
          <div className='flex flex-col sm:flex-row gap-4 flex-1'>
            {/* Search */}
            <div className='relative flex-1 max-w-md'>
              <Search className='absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5' />
              <input
                type='text'
                placeholder='Search images...'
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className='w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500'
              />
            </div>

            {/* Branch Filter */}
            <select
              value={selectedBranch}
              onChange={(e) => setSelectedBranch(e.target.value)}
              className='px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500'
            >
              <option value=''>All Branches</option>
              {branches.map(branch => (
                <option key={branch._id} value={branch._id}>{branch.name}</option>
              ))}
            </select>

            {/* Category Filter */}
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className='px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500'
            >
              {categories.map(category => (
                <option key={category} value={category}>{category}</option>
              ))}
            </select>
          </div>

          {/* Actions */}
          <div className='flex gap-2'>
            <button
              onClick={exportData}
              className='px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors flex items-center gap-2'
            >
              <Download className='w-4 h-4' />
              Export
            </button>
            <button
              onClick={handleAddImage}
              className='px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2'
            >
              <Plus className='w-4 h-4' />
              Add Image
            </button>
          </div>
        </div>
      </div>

      {/* Images Grid */}
      <div className='bg-white rounded-lg shadow-sm border'>
        {loading ? (
          <div className='flex justify-center items-center py-20'>
            <Loader className='w-8 h-8 animate-spin text-blue-600' />
          </div>
        ) : filteredImages.length === 0 ? (
          <div className='text-center py-20'>
            <div className='text-gray-500 mb-4'>
              {searchTerm || selectedBranch || (selectedCategory !== 'All') 
                ? 'No images found matching your criteria.' 
                : 'No images in the gallery yet.'}
            </div>
            <button
              onClick={handleAddImage}
              className='px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors inline-flex items-center gap-2'
            >
              <Plus className='w-5 h-5' />
              Add First Image
            </button>
          </div>
        ) : (
          <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 p-6'>
            {filteredImages.map((image) => (
              <div
                key={image._id}
                className='group relative bg-gray-50 rounded-lg overflow-hidden hover:shadow-lg transition-all duration-300'
              >
                {/* Image */}
                <div
                  className='aspect-square overflow-hidden cursor-pointer'
                  onClick={() => setSelectedImage(image)}
                >
                  <img
                    src={`http://localhost:5000${image.imageUrl}`}
                    alt={image.title}
                    className='w-full h-full object-cover group-hover:scale-105 transition-transform duration-300'
                    loading='lazy'
                  />
                </div>

                {/* Info */}
                <div className='p-4'>
                  <h3 className='font-semibold text-gray-800 mb-1 truncate'>{image.title}</h3>
                  {image.description && (
                    <p className='text-sm text-gray-600 line-clamp-2 mb-2'>{image.description}</p>
                  )}
                  
                  <div className='flex items-center justify-between text-xs text-gray-500 mb-3'>
                    <span className='flex items-center gap-1'>
                      <MapPin className='w-3 h-3' />
                      {image.branchId?.name}
                    </span>
                    <span className='px-2 py-1 bg-blue-100 text-blue-700 rounded-full'>
                      {image.category}
                    </span>
                  </div>

                  {/* Actions */}
                  <div className='flex gap-2'>
                    <button
                      onClick={() => setSelectedImage(image)}
                      className='flex-1 px-3 py-1 text-sm bg-gray-100 text-gray-700 rounded hover:bg-gray-200 transition-colors flex items-center justify-center gap-1'
                    >
                      <Eye className='w-3 h-3' />
                      View
                    </button>
                    <button
                      onClick={() => handleEditImage(image)}
                      className='flex-1 px-3 py-1 text-sm bg-blue-100 text-blue-700 rounded hover:bg-blue-200 transition-colors flex items-center justify-center gap-1'
                    >
                      <Edit className='w-3 h-3' />
                      Edit
                    </button>
                    <button
                      onClick={() => handleDeleteImage(image._id)}
                      className='px-3 py-1 text-sm bg-red-100 text-red-700 rounded hover:bg-red-200 transition-colors'
                    >
                      <Trash2 className='w-3 h-3' />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Pagination */}
        {pagination.pages > 1 && (
          <div className='flex justify-center items-center gap-2 p-4 border-t'>
            <button
              onClick={() => setPagination(prev => ({ ...prev, page: prev.page - 1 }))}
              disabled={pagination.page === 1}
              className='px-3 py-1 border border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50'
            >
              Previous
            </button>
            <span className='px-3 py-1 text-sm text-gray-600'>
              Page {pagination.page} of {pagination.pages}
            </span>
            <button
              onClick={() => setPagination(prev => ({ ...prev, page: prev.page + 1 }))}
              disabled={pagination.page === pagination.pages}
              className='px-3 py-1 border border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50'
            >
              Next
            </button>
          </div>
        )}
      </div>

      {/* Lightbox */}
      {selectedImage && (
        <div
          className='fixed inset-0 bg-black/90 z-50 flex items-center justify-center p-4'
          onClick={() => setSelectedImage(null)}
        >
          <div className='relative max-w-6xl max-h-full'>
            <button
              onClick={() => setSelectedImage(null)}
              className='absolute -top-12 right-0 text-white hover:text-gray-300 transition-colors'
            >
              <Trash2 className='w-8 h-8' />
            </button>
            <img
              src={`http://localhost:5000${selectedImage.imageUrl}`}
              alt={selectedImage.title}
              className='max-w-full max-h-[80vh] object-contain rounded-lg'
            />
            <div className='absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-6 text-white rounded-b-lg'>
              <h3 className='text-2xl font-bold mb-2'>{selectedImage.title}</h3>
              {selectedImage.description && (
                <p className='text-gray-200 mb-4'>{selectedImage.description}</p>
              )}
              <div className='flex items-center gap-6 text-sm text-gray-300'>
                <span className='flex items-center gap-2'>
                  <User className='w-4 h-4' />
                  {selectedImage.createdBy?.firstName} {selectedImage.createdBy?.lastName}
                </span>
                <span className='flex items-center gap-2'>
                  <MapPin className='w-4 h-4' />
                  {selectedImage.branchId?.name}
                </span>
                <span className='flex items-center gap-2'>
                  <Calendar className='w-4 h-4' />
                  {new Date(selectedImage.createdAt).toLocaleDateString()}
                </span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Gallery Modal */}
      {showModal && (
        <GalleryModal
          isOpen={showModal}
          onClose={() => setShowModal(false)}
          editingImage={editingImage}
          onSubmit={handleSubmitImage}
          user={user}
          branches={branches}
        />
      )}
    </div>
  );
};

export default AdminGallery;
