"use client";
import React, { useState, useEffect } from 'react';
import { ImageIcon, Plus, Edit2, Trash2, X, Save, Upload, Loader, ZoomIn } from 'lucide-react';
import { useAdminStore } from '@/store/useAdminStore';
import { ref, uploadBytes, getDownloadURL, deleteObject } from 'firebase/storage';
import { storage } from '@/firebase/firebaseConfig';
import AdminModal from '@/components/admin/ui/AdminModal';
import Pagination from '@/components/admin/ui/Pagination';

const theme = {
  gradients: {
    primary: 'from-orange-500 to-orange-600',
  },
};

const getButton = (variant = 'primary') => {
  const variants = {
    primary: 'bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white rounded-xl py-3 px-6 font-bold transition-all shadow-md hover:shadow-lg',
  };
  return variants[variant];
};

export default function AdminGalleryPage() {
  const { 
    gallery, 
    fetchCollection, 
    addDocument, 
    updateDocument, 
    deleteDocument,
    currentPage,
    itemsPerPage,
    setPagination
  } = useAdminStore();

  const [initialLoading, setInitialLoading] = useState(true);
  
  // Modals
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingImage, setEditingImage] = useState(null);
  const [viewingImage, setViewingImage] = useState(null);
  
  // Forms
  const [imageForm, setImageForm] = useState({ title: '', image_url: '' });
  
  // Uploads
  const [selectedFile, setSelectedFile] = useState(null);
  const [imagePreview, setImagePreview] = useState('');
  const [uploadingImage, setUploadingImage] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    const loadData = async () => {
      setInitialLoading(true);
      try {
        await fetchCollection('gallery', 'gallery');
      } catch (error) {
        console.error('Failed to load gallery');
      } finally {
        setInitialLoading(false);
      }
    };
    loadData();
  }, [fetchCollection]);

  const uploadImageToStorage = async (file) => {
    try {
      setUploadingImage(true);
      const fileName = `${Date.now()}_${file.name.replace(/[^a-zA-Z0-9.]/g, '_')}`;
      const storageRef = ref(storage, `gallery/${fileName}`);
      const snapshot = await uploadBytes(storageRef, file);
      const url = await getDownloadURL(snapshot.ref);
      return { url, storagePath: `gallery/${fileName}` };
    } catch (error) {
      alert('Failed to upload image. Please check permissions.');
      throw error;
    } finally {
      setUploadingImage(false);
    }
  };

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 10 * 1024 * 1024) return alert('Image size should be less than 10MB');
      setSelectedFile(file);
      const reader = new FileReader();
      reader.onloadend = () => setImagePreview(reader.result);
      reader.readAsDataURL(file);
    }
  };

  const openModal = (image = null) => {
    if (image) {
      setEditingImage(image);
      setImageForm({ title: image.title === 'Untitled' ? '' : image.title, image_url: image.image_url });
      setImagePreview(image.image_url);
    } else {
      setEditingImage(null);
      setImageForm({ title: '', image_url: '' });
      setImagePreview('');
    }
    setSelectedFile(null);
    setIsModalOpen(true);
  };

  const saveImage = async () => {
    if (!selectedFile && !editingImage) return alert('Please select an image to upload');
    
    setIsSaving(true);
    try {
      let imageData = { url: imageForm.image_url, storagePath: editingImage?.storage_path };
      
      if (selectedFile) {
        if (editingImage?.storage_path) {
          try {
            await deleteObject(ref(storage, editingImage.storage_path));
          } catch (e) {
            console.warn('Could not delete old image', e);
          }
        }
        imageData = await uploadImageToStorage(selectedFile);
      }

      const data = {
        title: imageForm.title.trim() || 'Untitled',
        image_url: imageData.url,
        storage_path: imageData.storagePath,
        [editingImage ? 'updated_at' : 'created_at']: new Date().toISOString(),
      };

      if (editingImage) {
        await updateDocument('gallery', editingImage.id, data, 'gallery');
      } else {
        await addDocument('gallery', data, 'gallery');
      }
      setIsModalOpen(false);
    } catch (error) {
      console.error(error);
    } finally {
      setIsSaving(false);
    }
  };

  const deleteImage = async (image) => {
    if (window.confirm('Are you sure you want to delete this image?')) {
      if (image.storage_path) {
        try {
          await deleteObject(ref(storage, image.storage_path));
        } catch (e) {
          console.warn('Could not delete image from storage', e);
        }
      }
      await deleteDocument('gallery', image.id, 'gallery');
    }
  };

  if (initialLoading) {
    return (
      <div className="min-h-[80vh] flex items-center justify-center">
        <Loader className="w-12 h-12 text-orange-500 animate-spin" />
      </div>
    );
  }

  // Gallery pagination logic
  const itemsPerGridPage = 12; // Force 12 for gallery grid
  const startIndex = (currentPage - 1) * itemsPerGridPage;
  const paginatedImages = gallery.slice(startIndex, startIndex + itemsPerGridPage);

  return (
    <div className="min-h-screen">
      <div className={`bg-gradient-to-r ${theme.gradients.primary} py-8 px-8 rounded-3xl shadow-lg mb-8`}>
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-black text-white mb-2">Gallery Management</h1>
            <p className="text-orange-100 font-medium">Upload and manage your image gallery</p>
          </div>
          <ImageIcon className="w-16 h-16 text-white opacity-20" />
        </div>
      </div>

      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-900">All Images ({gallery.length})</h2>
        <button onClick={() => openModal()} className={`inline-flex items-center gap-2 ${getButton('primary')}`}>
          <Plus className="w-5 h-5" />
          Add New Image
        </button>
      </div>

      {gallery.length > 0 ? (
        <>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 mb-8">
            {paginatedImages.map((image) => (
              <div key={image.id} className="bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-xl border border-gray-100 transition-all group">
                <div className="relative aspect-square overflow-hidden bg-gray-50">
                  <img
                    src={image.image_url}
                    alt={image.title}
                    className="w-full h-full object-cover transition-transform group-hover:scale-105 cursor-pointer"
                    onClick={() => setViewingImage(image)}
                  />
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-all flex items-center justify-center">
                    <button
                      onClick={() => setViewingImage(image)}
                      className="text-white opacity-0 group-hover:opacity-100 transition-opacity bg-black/50 rounded-full p-3 hover:bg-orange-500"
                    >
                      <ZoomIn className="w-6 h-6" />
                    </button>
                  </div>
                  {image.title && image.title !== 'Untitled' && (
                    <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-3">
                      <p className="text-white text-sm font-bold truncate">{image.title}</p>
                    </div>
                  )}
                </div>
                <div className="p-4 flex gap-2">
                  <button onClick={() => openModal(image)} className="flex-1 inline-flex justify-center items-center gap-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg py-2 text-sm font-bold transition-colors">
                    <Edit2 className="w-4 h-4" /> Edit
                  </button>
                  <button onClick={() => deleteImage(image)} className="flex-1 inline-flex justify-center items-center gap-2 bg-red-50 hover:bg-red-100 text-red-600 rounded-lg py-2 text-sm font-bold transition-colors">
                    <Trash2 className="w-4 h-4" /> Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
          <Pagination 
            currentPage={currentPage}
            totalItems={gallery.length}
            itemsPerPage={itemsPerGridPage}
            onPageChange={setPagination}
          />
        </>
      ) : (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-12 text-center">
          <ImageIcon className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-xl font-bold text-gray-900 mb-2">No images in gallery yet</h3>
          <p className="text-gray-500 mb-6">Start by uploading your first image</p>
          <button onClick={() => openModal()} className={getButton('primary')}>
            Add Your First Image
          </button>
        </div>
      )}

      {/* Upload/Edit Modal */}
      <AdminModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingImage ? "Edit Image" : "Add Image"}
        onSave={saveImage}
        isSaving={isSaving}
        size="md"
      >
        <div className="space-y-6">
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-2">Image Title (Optional)</label>
            <input type="text" value={imageForm.title} onChange={e => setImageForm({...imageForm, title: e.target.value})} className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-orange-500 outline-none transition-all text-black" placeholder="Leave empty for 'Untitled'" />
          </div>
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-2">{editingImage ? 'Replace Image (Optional)' : 'Upload Image *'}</label>
            <label className="block w-full cursor-pointer">
              <div className="border-2 border-dashed border-gray-300 rounded-xl p-8 hover:border-orange-500 transition-colors">
                <div className="flex flex-col items-center text-center">
                  <Upload className="w-10 h-10 text-gray-400 mb-3" />
                  <p className="font-bold text-gray-900 mb-1">{uploadingImage ? 'Uploading...' : selectedFile ? selectedFile.name : 'Click to upload image'}</p>
                  <p className="text-sm text-gray-500">JPG, PNG, WebP up to 10MB</p>
                </div>
              </div>
              <input type="file" accept="image/*" onChange={handleFileChange} className="hidden" disabled={uploadingImage} />
            </label>
          </div>
          {imagePreview && (
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">Preview</label>
              <img src={imagePreview} alt="Preview" className="w-full rounded-xl border border-gray-200" />
            </div>
          )}
        </div>
      </AdminModal>

      {/* View Image Modal */}
      <AdminModal
        isOpen={!!viewingImage}
        onClose={() => setViewingImage(null)}
        title={viewingImage?.title !== 'Untitled' ? viewingImage?.title : 'Image View'}
        size="lg"
      >
        <img src={viewingImage?.image_url} alt={viewingImage?.title} className="w-full rounded-xl" />
      </AdminModal>
    </div>
  );
}