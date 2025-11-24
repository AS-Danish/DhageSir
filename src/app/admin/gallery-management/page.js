"use client";
import React, { useState, useEffect } from 'react';
import { ImageIcon, Plus, Edit2, Trash2, X, Save, Upload, Loader, ChevronLeft, ChevronRight, ZoomIn } from 'lucide-react';
import { db, storage } from '../../../firebase/firebaseConfig';
import { collection, getDocs, addDoc, updateDoc, deleteDoc, doc, query, orderBy } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL, deleteObject } from 'firebase/storage';

// Theme configuration
const theme = {
  gradients: {
    primary: 'from-orange-500 to-orange-600',
  },
  cards: {
    elevated: 'bg-white shadow-xl',
  },
};

const getButton = (variant = 'primary') => {
  const variants = {
    primary: 'bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white rounded-xl py-3 px-6 font-bold transition-all hover:scale-105 hover:shadow-2xl',
    secondary: 'bg-gray-100 hover:bg-gray-200 text-gray-900 rounded-xl py-3 px-6 font-bold transition-all',
    danger: 'bg-red-500 hover:bg-red-600 text-white rounded-xl py-3 px-6 font-bold transition-all',
  };
  return variants[variant];
};

const ITEMS_PER_PAGE = 12;

const AdminGalleryPage = () => {
  const [showAddImage, setShowAddImage] = useState(false);
  const [editingImage, setEditingImage] = useState(null);
  const [loading, setLoading] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [viewingImage, setViewingImage] = useState(null);

  // Gallery State
  const [galleryImages, setGalleryImages] = useState([]);

  // Form State
  const [imageForm, setImageForm] = useState({
    title: '',
    image_url: '',
  });

  const [selectedFile, setSelectedFile] = useState(null);
  const [imagePreview, setImagePreview] = useState('');

  // Helper to invalidate cache
  const invalidateCache = () => {
    localStorage.removeItem('gallery_cache');
    localStorage.removeItem('gallery_cache_timestamp');
  };

  // Fetch and cache gallery images
  const fetchAndCacheGallery = async () => {
    const q = query(collection(db, "gallery"), orderBy("created_at", "desc"));
    const querySnapshot = await getDocs(q);
    const galleryData = querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
    
    setGalleryImages(galleryData);
    
    // Cache the data
    localStorage.setItem('gallery_cache', JSON.stringify(galleryData));
    localStorage.setItem('gallery_cache_timestamp', Date.now().toString());
  };

  // Load gallery from Firestore with caching
  const loadGallery = async () => {
    try {
      // Try to load from cache first
      const cachedGallery = localStorage.getItem('gallery_cache');
      const cacheTimestamp = localStorage.getItem('gallery_cache_timestamp');
      
      // Use cache if it's less than 5 minutes old
      if (cachedGallery && cacheTimestamp) {
        const cacheAge = Date.now() - parseInt(cacheTimestamp);
        if (cacheAge < 5 * 60 * 1000) { // 5 minutes
          setGalleryImages(JSON.parse(cachedGallery));
          // Still fetch in background to update
          fetchAndCacheGallery();
          return;
        }
      }
      
      // Fetch fresh data
      await fetchAndCacheGallery();
    } catch (error) {
      console.error('Error loading gallery:', error);
      alert('Failed to load gallery: ' + error.message);
    }
  };

  // Upload image to Firebase Storage
  const uploadImageToStorage = async (file) => {
    try {
      setUploadingImage(true);
      
      // Create a unique filename with sanitized name
      const timestamp = Date.now();
      const sanitizedFileName = file.name.replace(/[^a-zA-Z0-9.]/g, '_');
      const fileName = `${timestamp}_${sanitizedFileName}`;
      const storageRef = ref(storage, `gallery/${fileName}`);
      
      // Upload file
      const snapshot = await uploadBytes(storageRef, file);
      
      // Get download URL
      const downloadURL = await getDownloadURL(snapshot.ref);
      
      return {
        url: downloadURL,
        storagePath: `gallery/${fileName}`
      };
    } catch (error) {
      console.error('Error uploading image:', error);
      if (error.code === 'storage/unauthorized') {
        alert('Storage permission denied. Please update Firebase Storage rules to allow uploads.');
      } else {
        alert('Failed to upload image: ' + error.message);
      }
      throw error;
    } finally {
      setUploadingImage(false);
    }
  };

  // Add image to Firestore
  const handleAddImage = async () => {
    if (!selectedFile) {
      alert('Please select an image to upload');
      return;
    }

    try {
      setLoading(true);
      
      // Upload image
      const imageData = await uploadImageToStorage(selectedFile);

      const galleryData = {
        title: imageForm.title.trim() || 'Untitled',
        image_url: imageData.url,
        storage_path: imageData.storagePath,
        created_at: new Date().toISOString(),
      };

      const docRef = await addDoc(collection(db, "gallery"), galleryData);
      const newImage = { id: docRef.id, ...galleryData };
      
      setGalleryImages([newImage, ...galleryImages]);
      invalidateCache();

      resetImageForm();
      setShowAddImage(false);
      alert('Image added to gallery successfully!');
    } catch (error) {
      console.error('Error adding image:', error);
      alert('Failed to add image: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  // Update image in Firestore
  const handleUpdateImage = async () => {
    try {
      setLoading(true);
      
      let imageData = {
        url: imageForm.image_url,
        storagePath: editingImage.storage_path
      };
      
      // Upload new image if selected
      if (selectedFile) {
        // Delete old image from storage
        if (editingImage.storage_path) {
          try {
            const oldImageRef = ref(storage, editingImage.storage_path);
            await deleteObject(oldImageRef);
          } catch (error) {
            console.warn('Could not delete old image:', error);
          }
        }
        
        imageData = await uploadImageToStorage(selectedFile);
      }

      const galleryData = {
        title: imageForm.title.trim() || 'Untitled',
        image_url: imageData.url,
        storage_path: imageData.storagePath,
        updated_at: new Date().toISOString(),
      };

      await updateDoc(doc(db, "gallery", editingImage.id), galleryData);
      
      setGalleryImages(galleryImages.map(img => 
        img.id === editingImage.id ? { ...img, ...galleryData } : img
      ));
      invalidateCache();

      resetImageForm();
      setEditingImage(null);
      alert('Image updated successfully!');
    } catch (error) {
      console.error('Error updating image:', error);
      alert('Failed to update image: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  // Delete image from Firestore
  const handleDeleteImage = async (image) => {
    if (!window.confirm('Are you sure you want to delete this image?')) {
      return;
    }

    try {
      setLoading(true);
      
      // Delete image from storage
      if (image.storage_path) {
        try {
          const imageRef = ref(storage, image.storage_path);
          await deleteObject(imageRef);
        } catch (error) {
          console.warn('Could not delete image from storage:', error);
        }
      }
      
      await deleteDoc(doc(db, "gallery", image.id));
      
      setGalleryImages(galleryImages.filter(img => img.id !== image.id));
      invalidateCache();
      
      alert('Image deleted successfully!');
    } catch (error) {
      console.error('Error deleting image:', error);
      alert('Failed to delete image: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  // Handle file selection
  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      // Validate file type
      if (!file.type.startsWith('image/')) {
        alert('Please select a valid image file');
        return;
      }
      
      // Validate file size (10MB)
      if (file.size > 10 * 1024 * 1024) {
        alert('Image size should be less than 10MB');
        return;
      }
      
      setSelectedFile(file);
      
      // Create preview
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const startEditImage = (image) => {
    setEditingImage(image);
    setImageForm({
      title: image.title === 'Untitled' ? '' : image.title,
      image_url: image.image_url,
    });
    setImagePreview(image.image_url);
    setSelectedFile(null);
  };

  const resetImageForm = () => {
    setImageForm({
      title: '',
      image_url: '',
    });
    setEditingImage(null);
    setShowAddImage(false);
    setSelectedFile(null);
    setImagePreview('');
  };

  // Load data on mount
  useEffect(() => {
    const loadData = async () => {
      setInitialLoading(true);
      try {
        await loadGallery();
      } catch (error) {
        console.error('Error loading data:', error);
      } finally {
        setInitialLoading(false);
      }
    };
    
    loadData();
  }, []);

  // Pagination
  const totalPages = Math.ceil(galleryImages.length / ITEMS_PER_PAGE);
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const endIndex = startIndex + ITEMS_PER_PAGE;
  const currentImages = galleryImages.slice(startIndex, endIndex);

  const goToPage = (page) => {
    setCurrentPage(Math.max(1, Math.min(page, totalPages)));
  };

  if (initialLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Loader className="w-12 h-12 text-orange-500 animate-spin mx-auto mb-4" />
          <p className="text-gray-600 font-semibold">Loading gallery...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Loading Overlay */}
      {loading && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center">
          <div className="bg-white rounded-2xl p-8 flex flex-col items-center">
            <Loader className="w-12 h-12 text-orange-500 animate-spin mb-4" />
            <p className="text-gray-900 font-bold">Processing...</p>
          </div>
        </div>
      )}

      {/* Image Viewer Modal */}
      {viewingImage && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-90 z-50 flex items-center justify-center p-4"
          onClick={() => setViewingImage(null)}
        >
          <div className="relative max-w-6xl max-h-[90vh]">
            <button
              onClick={() => setViewingImage(null)}
              className="absolute -top-12 right-0 text-white hover:text-orange-500 transition-colors"
            >
              <X className="w-8 h-8" />
            </button>
            <img
              src={viewingImage.image_url}
              alt={viewingImage.title}
              className="max-w-full max-h-[85vh] object-contain rounded-2xl"
              onClick={(e) => e.stopPropagation()}
            />
            {viewingImage.title && viewingImage.title !== 'Untitled' && (
              <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black to-transparent p-6 rounded-b-2xl">
                <p className="text-white font-bold text-xl">{viewingImage.title}</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Header */}
      <div className={`bg-gradient-to-r ${theme.gradients.primary} py-8 shadow-xl`}>
        <div className="container mx-auto px-4 max-w-7xl">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-4xl font-black text-white mb-2">Gallery Management</h1>
              <p className="text-orange-100">Upload and manage your image gallery</p>
            </div>
            <ImageIcon className="w-16 h-16 text-white opacity-50" />
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 max-w-7xl py-8">
        {/* Add Image Button */}
        <div className="flex justify-between items-center mb-8">
          <h2 className="text-3xl font-black text-gray-900">All Images ({galleryImages.length})</h2>
          <button
            onClick={() => setShowAddImage(true)}
            className={`inline-flex items-center gap-2 ${getButton('primary')}`}
          >
            <Plus className="w-5 h-5" />
            Add New Image
          </button>
        </div>

        {/* Add/Edit Image Form */}
        {(showAddImage || editingImage) && (
          <div className={`${theme.cards.elevated} rounded-2xl p-8 mb-8`}>
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-2xl font-bold text-gray-900">
                {editingImage ? 'Edit Image' : 'Add New Image'}
              </h3>
              <button
                onClick={resetImageForm}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="space-y-6">
              {/* Title (Optional) */}
              <div>
                <label className="block text-sm font-bold text-gray-900 mb-2">
                  Image Title (Optional)
                </label>
                <input
                  type="text"
                  value={imageForm.title}
                  onChange={(e) => setImageForm({ ...imageForm, title: e.target.value })}
                  placeholder="Enter image title (leave empty for 'Untitled')"
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-orange-500 focus:outline-none transition-colors"
                />
              </div>

              {/* Image Upload */}
              <div>
                <label className="block text-sm font-bold text-gray-900 mb-2">
                  {editingImage ? 'Replace Image (Optional) *' : 'Upload Image *'}
                </label>
                
                <label className="block w-full cursor-pointer">
                  <div className="border-2 border-dashed border-gray-300 rounded-xl p-8 hover:border-orange-500 transition-colors">
                    <div className="flex flex-col items-center">
                      <Upload className="w-12 h-12 text-gray-400 mb-3" />
                      <p className="text-lg font-bold text-gray-900 mb-1">
                        {uploadingImage ? 'Uploading...' : selectedFile ? selectedFile.name : (editingImage ? 'Click to replace image' : 'Click to upload image')}
                      </p>
                      <p className="text-sm text-gray-500">JPG, PNG, GIF, WebP up to 10MB</p>
                    </div>
                  </div>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleFileChange}
                    className="hidden"
                    disabled={uploadingImage}
                  />
                </label>
              </div>

              {/* Image Preview */}
              {imagePreview && (
                <div>
                  <label className="block text-sm font-bold text-gray-900 mb-2">Preview</label>
                  <div className="relative inline-block">
                    <img
                      src={imagePreview}
                      alt="Preview"
                      className="max-w-md w-full h-auto rounded-xl shadow-lg"
                      onError={(e) => {
                        e.target.style.display = 'none';
                      }}
                    />
                  </div>
                </div>
              )}
            </div>

            {/* Action Buttons */}
            <div className="flex gap-4 mt-6">
              <button
                onClick={editingImage ? handleUpdateImage : handleAddImage}
                disabled={loading || uploadingImage || (!selectedFile && !editingImage)}
                className={`inline-flex items-center gap-2 ${getButton('primary')} disabled:opacity-50 disabled:cursor-not-allowed`}
              >
                {loading || uploadingImage ? (
                  <Loader className="w-5 h-5 animate-spin" />
                ) : (
                  <Save className="w-5 h-5" />
                )}
                {editingImage ? 'Update Image' : 'Add Image'}
              </button>
              <button
                onClick={resetImageForm}
                className={getButton('secondary')}
              >
                Cancel
              </button>
            </div>
          </div>
        )}

        {/* Gallery Grid */}
        {galleryImages.length > 0 ? (
          <>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {currentImages.map((image) => (
                <div key={image.id} className={`${theme.cards.elevated} rounded-2xl overflow-hidden hover:shadow-2xl transition-all group`}>
                  <div className="relative aspect-square overflow-hidden bg-gray-100">
                    <img
                      src={image.image_url}
                      alt={image.title}
                      className="w-full h-full object-cover transition-transform group-hover:scale-110 cursor-pointer"
                      onClick={() => setViewingImage(image)}
                    />
                    
                    {/* Overlay on hover */}
                    <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-40 transition-all flex items-center justify-center">
                      <button
                        onClick={() => setViewingImage(image)}
                        className="opacity-0 group-hover:opacity-100 transition-opacity bg-white rounded-full p-3 hover:bg-orange-500 hover:text-white"
                      >
                        <ZoomIn className="w-6 h-6" />
                      </button>
                    </div>

                    {/* Title Badge */}
                    {image.title && image.title !== 'Untitled' && (
                      <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black to-transparent p-3">
                        <p className="text-white text-sm font-bold truncate">{image.title}</p>
                      </div>
                    )}
                  </div>

                  <div className="p-4">
                    <div className="flex gap-2">
                      <button
                        onClick={() => startEditImage(image)}
                        className="flex-1 inline-flex items-center justify-center gap-2 bg-blue-500 hover:bg-blue-600 text-white rounded-xl py-2 px-3 font-bold transition-all text-sm"
                      >
                        <Edit2 className="w-4 h-4" />
                        Edit
                      </button>
                      <button
                        onClick={() => handleDeleteImage(image)}
                        className="flex-1 inline-flex items-center justify-center gap-2 bg-red-500 hover:bg-red-600 text-white rounded-xl py-2 px-3 font-bold transition-all text-sm"
                      >
                        <Trash2 className="w-4 h-4" />
                        Delete
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex items-center justify-center gap-2 mt-8">
                <button
                  onClick={() => goToPage(currentPage - 1)}
                  disabled={currentPage === 1}
                  className="p-2 rounded-lg bg-white shadow hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                >
                  <ChevronLeft className="w-5 h-5" />
                </button>

                <div className="flex gap-2">
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                    <button
                      key={page}
                      onClick={() => goToPage(page)}
                      className={`w-10 h-10 rounded-lg font-bold transition-all ${
                        currentPage === page
                          ? 'bg-gradient-to-r from-orange-500 to-orange-600 text-white shadow-lg'
                          : 'bg-white text-gray-900 hover:shadow-lg'
                      }`}
                    >
                      {page}
                    </button>
                  ))}
                </div>

                <button
                  onClick={() => goToPage(currentPage + 1)}
                  disabled={currentPage === totalPages}
                  className="p-2 rounded-lg bg-white shadow hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                >
                  <ChevronRight className="w-5 h-5" />
                </button>
              </div>
            )}

            <div className="text-center text-sm text-gray-600 mt-4">
              Showing {startIndex + 1}-{Math.min(endIndex, galleryImages.length)} of {galleryImages.length} images
            </div>
          </>
        ) : (
          <div className="text-center py-20">
            <ImageIcon className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-2xl font-bold text-gray-900 mb-2">No images in gallery yet</h3>
            <p className="text-gray-600 mb-6">Start by uploading your first image</p>
            <button
              onClick={() => setShowAddImage(true)}
              className={`inline-flex items-center gap-2 ${getButton('primary')}`}
            >
              <Plus className="w-5 h-5" />
              Add Your First Image
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminGalleryPage;