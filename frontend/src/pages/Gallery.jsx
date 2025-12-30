import React, { useState, useEffect, useContext } from 'react';
import { Search, Filter, X, Plus, Calendar, MapPin, User, Loader } from 'lucide-react';
import GalleryModal from '../components/GalleryModal';
import { AuthContext } from '../context/AuthContext';

const Gallery = () => {
  const { user } = useContext(AuthContext);
  const [images, setImages] = useState([]);
  const [filteredImages, setFilteredImages] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingImage, setEditingImage] = useState(null);
  const [selectedImage, setSelectedImage] = useState(null);
  const [branches, setBranches] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, limit: 20, total: 0, pages: 0 });

  const categoryOptions = ['All', 'Events', 'Classes', 'Campus', 'Students', 'Activities', 'Other'];

  useEffect(() => {
    fetchImages();
    fetchBranches();
  }, [selectedCategory, searchTerm, pagination.page]);

  useEffect(() => {
    filterImages();
  }, [images, selectedCategory, searchTerm]);

  const fetchImages = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        page: pagination.page,
        limit: pagination.limit,
      });

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

  const filterImages = () => {
    let filtered = images;

    if (selectedCategory && selectedCategory !== 'All') {
      filtered = filtered.filter(img => img.category === selectedCategory);
    }

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
    if (!confirm('Are you sure you want to delete this image?')) {
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
        alert('Image deleted successfully!');
      } else {
        alert(data.message || 'Failed to delete image');
      }
    } catch (error) {
      console.error('Error deleting image:', error);
      alert('Failed to delete image');
    }
  };

  const canAddImages = user && ['Admin', 'Branch Admin'].includes(user.role);

  return (
    <div className='min-h-screen bg-gray-50'>
      {/* Hero Section */}
      <div className='bg-blue-900 text-white py-16'>
        <div className='container mx-auto px-4 text-center'>
          <h1 className='text-4xl md:text-5xl font-bold mb-4'>
            Gallery
          </h1>
          <p className='text-xl text-blue-100 max-w-3xl mx-auto'>
            Explore our campus life, events, and student activities through our photo gallery
          </p>
        </div>
      </div>

      {/* Search and Filter Section */}
      <div className='container mx-auto px-4 py-8'>
        <div className='flex flex-col md:flex-row gap-4 items-center justify-between'>
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

          {/* Category Filter */}
          <div className='flex flex-wrap gap-2'>
            {categoryOptions.map(category => (
              <button
                key={category}
                onClick={() => setSelectedCategory(category)}
                className={`px-4 py-2 rounded-full font-medium transition-colors ${
                  selectedCategory === category
                    ? 'bg-blue-600 text-white'
                    : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
                }`}
              >
                {category}
              </button>
            ))}
          </div>

          {/* Add Image Button */}
          {canAddImages && (
            <button
              onClick={handleAddImage}
              className='px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2'
            >
              <Plus className='w-5 h-5' />
              Add Image
            </button>
          )}
        </div>
      </div>

      {/* Gallery Stats */}
      <div className='container mx-auto px-4 pb-8'>
        <div className='grid grid-cols-2 md:grid-cols-4 gap-4'>
          <div className='bg-white p-4 rounded-lg shadow-sm text-center'>
            <div className='text-2xl font-bold text-blue-600'>{pagination.total}</div>
            <div className='text-gray-600 text-sm'>Total Photos</div>
          </div>
          <div className='bg-white p-4 rounded-lg shadow-sm text-center'>
            <div className='text-2xl font-bold text-blue-600'>{categoryOptions.length - 1}</div>
            <div className='text-gray-600 text-sm'>Categories</div>
          </div>
          <div className='bg-white p-4 rounded-lg shadow-sm text-center'>
            <div className='text-2xl font-bold text-blue-600'>{branches.length}</div>
            <div className='text-gray-600 text-sm'>Branches</div>
          </div>
          <div className='bg-white p-4 rounded-lg shadow-sm text-center'>
            <div className='text-2xl font-bold text-blue-600'>{filteredImages.length}</div>
            <div className='text-gray-600 text-sm'>Filtered Results</div>
          </div>
        </div>
      </div>

      {/* Gallery Grid */}
      <div className='container mx-auto px-4 pb-16'>
        {loading ? (
          <div className='flex justify-center items-center py-20'>
            <Loader className='w-8 h-8 animate-spin text-blue-600' />
          </div>
        ) : filteredImages.length === 0 ? (
          <div className='text-center py-20'>
            <div className='text-gray-500 mb-4'>
              {searchTerm || (selectedCategory !== 'All') 
                ? 'No images found matching your criteria.' 
                : 'No images in the gallery yet.'}
            </div>
            {canAddImages && !searchTerm && selectedCategory === 'All' && (
              <button
                onClick={handleAddImage}
                className='px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors inline-flex items-center gap-2'
              >
                <Plus className='w-5 h-5' />
                Add First Image
              </button>
            )}
          </div>
        ) : (
          <div className='grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6'>
            {filteredImages.map((image) => (
              <div
                key={image._id}
                className='group relative bg-white rounded-lg overflow-hidden shadow-md hover:shadow-xl transition-all duration-300 transform hover:scale-105'
              >
                {/* Image */}
                <div
                  className='aspect-square overflow-hidden cursor-pointer'
                  onClick={() => setSelectedImage(image)}
                >
                  <img
                    src={`http://localhost:5000${image.imageUrl}`}
                    alt={image.title}
                    className='w-full h-full object-cover group-hover:scale-110 transition-transform duration-300'
                    loading='lazy'
                  />
                </div>

                {/* Overlay */}
                <div className='absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300'>
                  <div className='absolute bottom-0 left-0 right-0 p-4 text-white'>
                    <h3 className='font-semibold text-lg mb-1'>{image.title}</h3>
                    {image.description && (
                      <p className='text-sm text-gray-200 line-clamp-2'>{image.description}</p>
                    )}
                    <div className='flex items-center gap-4 mt-2 text-xs text-gray-300'>
                      <span className='flex items-center gap-1'>
                        <MapPin className='w-3 h-3' />
                        {image.branchId?.name}
                      </span>
                      <span className='flex items-center gap-1'>
                        <Calendar className='w-3 h-3' />
                        {new Date(image.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Admin Actions */}
                {canAddImages && (
                  <div className='absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300'>
                    <div className='flex gap-2'>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleEditImage(image);
                        }}
                        className='p-2 bg-white/90 backdrop-blur-sm rounded-full hover:bg-white transition-colors'
                        title='Edit'
                      >
                        <svg className='w-4 h-4 text-gray-700' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                          <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z' />
                        </svg>
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDeleteImage(image._id);
                        }}
                        className='p-2 bg-white/90 backdrop-blur-sm rounded-full hover:bg-white transition-colors'
                        title='Delete'
                      >
                        <svg className='w-4 h-4 text-red-600' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                          <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16' />
                        </svg>
                      </button>
                    </div>
                  </div>
                )}

                {/* Category Badge */}
                <div className='absolute top-2 left-2'>
                  <span className='px-2 py-1 bg-blue-600/90 backdrop-blur-sm text-white text-xs rounded-full'>
                    {image.category}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Pagination */}
        {pagination.pages > 1 && (
          <div className='flex justify-center items-center gap-2 mt-8'>
            <button
              onClick={() => setPagination(prev => ({ ...prev, page: prev.page - 1 }))}
              disabled={pagination.page === 1}
              className='px-3 py-1 border border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50'
            >
              Previous
            </button>
            <span className='px-3 py-1'>
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
              <X className='w-8 h-8' />
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

export default Gallery;