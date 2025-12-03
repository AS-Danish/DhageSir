"use client";
import React, { useState, useEffect } from 'react';
import { FileText, Plus, Edit2, Trash2, X, Save, Upload, Loader, ChevronLeft, ChevronRight, Download } from 'lucide-react';
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

const ITEMS_PER_PAGE = 10;

const AdminStudyMaterialsPage = () => {
  const [showAddMaterial, setShowAddMaterial] = useState(false);
  const [editingMaterial, setEditingMaterial] = useState(null);
  const [loading, setLoading] = useState(false);
  const [uploadingFile, setUploadingFile] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);

  // Materials State
  const [materials, setMaterials] = useState([]);

  // Form State
  const [materialForm, setMaterialForm] = useState({
    title: '',
    file_url: '',
    file_name: '',
    file_type: '',
    file_size: 0,
  });

  const [selectedFile, setSelectedFile] = useState(null);

  // Helper to invalidate cache
  const invalidateCache = () => {
    localStorage.removeItem('study_materials_cache');
    localStorage.removeItem('study_materials_cache_timestamp');
  };

  // Fetch and cache study materials
  const fetchAndCacheMaterials = async () => {
    const q = query(collection(db, "study_materials"), orderBy("created_at", "desc"));
    const querySnapshot = await getDocs(q);
    const materialsData = querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));

    setMaterials(materialsData);

    // Cache the data
    localStorage.setItem('study_materials_cache', JSON.stringify(materialsData));
    localStorage.setItem('study_materials_cache_timestamp', Date.now().toString());
  };

  // Load materials from Firestore with caching
  const loadMaterials = async () => {
    try {
      // Try to load from cache first
      const cachedMaterials = localStorage.getItem('study_materials_cache');
      const cacheTimestamp = localStorage.getItem('study_materials_cache_timestamp');

      // Use cache if it's less than 5 minutes old
      if (cachedMaterials && cacheTimestamp) {
        const cacheAge = Date.now() - parseInt(cacheTimestamp);
        if (cacheAge < 5 * 60 * 1000) { // 5 minutes
          setMaterials(JSON.parse(cachedMaterials));
          // Still fetch in background to update
          fetchAndCacheMaterials();
          return;
        }
      }

      // Fetch fresh data
      await fetchAndCacheMaterials();
    } catch (error) {
      console.error('Error loading study materials:', error);
      alert('Failed to load study materials: ' + error.message);
    }
  };

  // Upload file to Firebase Storage
  const uploadFileToStorage = async (file) => {
    try {
      setUploadingFile(true);

      // Create a unique filename with sanitized name
      const timestamp = Date.now();
      const sanitizedFileName = file.name.replace(/[^a-zA-Z0-9.]/g, '_');
      const fileName = `${timestamp}_${sanitizedFileName}`;
      const storageRef = ref(storage, `study-materials/${fileName}`);

      // Upload file
      const snapshot = await uploadBytes(storageRef, file);

      // Get download URL
      const downloadURL = await getDownloadURL(snapshot.ref);

      return {
        url: downloadURL,
        name: file.name,
        type: file.type,
        size: file.size,
        storagePath: `study-materials/${fileName}`
      };
    } catch (error) {
      console.error('Error uploading file:', error);
      if (error.code === 'storage/unauthorized') {
        alert('Storage permission denied. Please update Firebase Storage rules to allow uploads.');
      } else {
        alert('Failed to upload file: ' + error.message);
      }
      throw error;
    } finally {
      setUploadingFile(false);
    }
  };

  // Add material to Firestore
  const handleAddMaterial = async () => {
    if (!materialForm.title.trim()) {
      alert('Please enter a title for the study material');
      return;
    }

    if (!selectedFile) {
      alert('Please select a file to upload (PDF or PPT)');
      return;
    }

    try {
      setLoading(true);

      // Upload file
      const fileData = await uploadFileToStorage(selectedFile);

      const materialData = {
        title: materialForm.title.trim(),
        file_url: fileData.url,
        file_name: fileData.name,
        file_type: fileData.type,
        file_size: fileData.size,
        storage_path: fileData.storagePath,
        created_at: new Date().toISOString(),
      };

      const docRef = await addDoc(collection(db, "study_materials"), materialData);
      const newMaterial = { id: docRef.id, ...materialData };

      setMaterials([newMaterial, ...materials]);
      invalidateCache();

      resetMaterialForm();
      setShowAddMaterial(false);
      alert('Study material added successfully!');
    } catch (error) {
      console.error('Error adding study material:', error);
      alert('Failed to add study material: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  // Update material in Firestore
  const handleUpdateMaterial = async () => {
    if (!materialForm.title.trim()) {
      alert('Please enter a title for the study material');
      return;
    }

    try {
      setLoading(true);

      let fileData = {
        url: materialForm.file_url,
        name: materialForm.file_name,
        type: materialForm.file_type,
        size: materialForm.file_size,
        storagePath: editingMaterial.storage_path
      };

      // Upload new file if selected
      if (selectedFile) {
        // Delete old file from storage
        if (editingMaterial.storage_path) {
          try {
            const oldFileRef = ref(storage, editingMaterial.storage_path);
            await deleteObject(oldFileRef);
          } catch (error) {
            console.warn('Could not delete old file:', error);
          }
        }

        fileData = await uploadFileToStorage(selectedFile);
      }

      const materialData = {
        title: materialForm.title.trim(),
        file_url: fileData.url,
        file_name: fileData.name,
        file_type: fileData.type,
        file_size: fileData.size,
        storage_path: fileData.storagePath,
        updated_at: new Date().toISOString(),
      };

      await updateDoc(doc(db, "study_materials", editingMaterial.id), materialData);

      setMaterials(materials.map(material =>
        material.id === editingMaterial.id ? { ...material, ...materialData } : material
      ));
      invalidateCache();

      resetMaterialForm();
      setEditingMaterial(null);
      alert('Study material updated successfully!');
    } catch (error) {
      console.error('Error updating study material:', error);
      alert('Failed to update study material: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  // Delete material from Firestore
  const handleDeleteMaterial = async (material) => {
    if (!window.confirm('Are you sure you want to delete this study material?')) {
      return;
    }

    try {
      setLoading(true);

      // Delete file from storage
      if (material.storage_path) {
        try {
          const fileRef = ref(storage, material.storage_path);
          await deleteObject(fileRef);
        } catch (error) {
          console.warn('Could not delete file from storage:', error);
        }
      }

      await deleteDoc(doc(db, "study_materials", material.id));

      setMaterials(materials.filter(m => m.id !== material.id));
      invalidateCache();

      alert('Study material deleted successfully!');
    } catch (error) {
      console.error('Error deleting study material:', error);
      alert('Failed to delete study material: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  // Handle file selection
  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      // Validate file type - ADD WORD FORMATS
      const allowedTypes = [
        'application/pdf',
        'application/vnd.ms-powerpoint',
        'application/vnd.openxmlformats-officedocument.presentationml.presentation',
        'application/msword', // .doc
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document' // .docx
      ];

      if (!allowedTypes.includes(file.type)) {
        alert('Please select a valid PDF, PowerPoint, or Word file');
        return;
      }

      // Rest of the validation code remains the same
      if (file.size > 50 * 1024 * 1024) {
        alert('File size should be less than 50MB');
        return;
      }

      setSelectedFile(file);
    }
  };

  const startEditMaterial = (material) => {
    setEditingMaterial(material);
    setMaterialForm({
      title: material.title,
      file_url: material.file_url,
      file_name: material.file_name,
      file_type: material.file_type,
      file_size: material.file_size,
    });
    setSelectedFile(null);
  };

  const resetMaterialForm = () => {
    setMaterialForm({
      title: '',
      file_url: '',
      file_name: '',
      file_type: '',
      file_size: 0,
    });
    setEditingMaterial(null);
    setShowAddMaterial(false);
    setSelectedFile(null);
  };

  // Load data on mount
  useEffect(() => {
    const loadData = async () => {
      setInitialLoading(true);
      try {
        await loadMaterials();
      } catch (error) {
        console.error('Error loading data:', error);
      } finally {
        setInitialLoading(false);
      }
    };

    loadData();
  }, []);

  // Pagination
  const totalPages = Math.ceil(materials.length / ITEMS_PER_PAGE);
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const endIndex = startIndex + ITEMS_PER_PAGE;
  const currentMaterials = materials.slice(startIndex, endIndex);

  const goToPage = (page) => {
    setCurrentPage(Math.max(1, Math.min(page, totalPages)));
  };

  // Format file size
  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
  };

  // Get file icon
  const getFileIcon = (fileType) => {
    if (fileType?.includes('pdf')) {
      return '📄';
    } else if (fileType?.includes('presentation') || fileType?.includes('powerpoint')) {
      return '📊';
    } else if (fileType?.includes('word') || fileType?.includes('document')) {
      return '📝'; // Word icon
    }
    return '📎';
  };

  if (initialLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Loader className="w-12 h-12 text-orange-500 animate-spin mx-auto mb-4" />
          <p className="text-gray-600 font-semibold">Loading study materials...</p>
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

      {/* Header */}
      <div className={`bg-gradient-to-r ${theme.gradients.primary} py-8 shadow-xl`}>
        <div className="container mx-auto px-4 max-w-7xl">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-4xl font-black text-white mb-2">Study Materials Management</h1>
              <p className="text-orange-100">Upload and manage PDF, PowerPoint and Word study materials</p>
            </div>
            <FileText className="w-16 h-16 text-white opacity-50" />
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 max-w-7xl py-8">
        {/* Add Material Button */}
        <div className="flex justify-between items-center mb-8">
          <h2 className="text-3xl font-black text-gray-900">All Study Materials ({materials.length})</h2>
          <button
            onClick={() => setShowAddMaterial(true)}
            className={`inline-flex items-center gap-2 ${getButton('primary')}`}
          >
            <Plus className="w-5 h-5" />
            Add New Material
          </button>
        </div>

        {/* Add/Edit Material Form */}
        {(showAddMaterial || editingMaterial) && (
          <div className={`${theme.cards.elevated} rounded-2xl p-8 mb-8`}>
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-2xl font-bold text-gray-900">
                {editingMaterial ? 'Edit Study Material' : 'Add New Study Material'}
              </h3>
              <button
                onClick={resetMaterialForm}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="space-y-6">
              {/* Title */}
              <div>
                <label className="block text-sm font-bold text-gray-900 mb-2">
                  Material Title *
                </label>
                <input
                  type="text"
                  value={materialForm.title}
                  onChange={(e) => setMaterialForm({ ...materialForm, title: e.target.value })}
                  placeholder="Enter material title (e.g., Chapter 1: Introduction to Physics)"
                  className="text-black w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-orange-500 focus:outline-none transition-colors"
                />
              </div>

              {/* File Upload */}
              <div>
                <label className="block text-sm font-bold text-gray-900 mb-2">
                  {editingMaterial ? 'Replace File (Optional)' : 'Upload File *'}
                </label>

                <label className="block w-full cursor-pointer">
                  <div className="border-2 border-dashed border-gray-300 rounded-xl p-8 hover:border-orange-500 transition-colors">
                    <div className="flex flex-col items-center">
                      <Upload className="w-12 h-12 text-gray-400 mb-3" />
                      <p className="text-lg font-bold text-gray-900 mb-1">
                        {uploadingFile ? 'Uploading...' : selectedFile ? selectedFile.name : (editingMaterial ? 'Click to replace file' : 'Click to upload file')}
                      </p>
                      <p className="text-sm text-gray-500 mb-2">PDF, PowerPoint, or Word documents up to 50MB</p>
                      {selectedFile && (
                        <p className="text-xs text-orange-600 font-semibold">
                          {formatFileSize(selectedFile.size)}
                        </p>
                      )}
                    </div>
                  </div>
                  <input
                    type="file"
                    accept=".pdf,.ppt,.pptx,.doc,.docx,application/pdf,application/vnd.ms-powerpoint,application/vnd.openxmlformats-officedocument.presentationml.presentation,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
                    onChange={handleFileChange}
                    className="hidden"
                    disabled={uploadingFile}
                  />
                </label>

                {/* Current file info when editing */}
                {editingMaterial && !selectedFile && (
                  <div className="mt-4 p-4 bg-gray-50 rounded-xl">
                    <p className="text-sm text-gray-600">
                      <span className="font-bold">Current file:</span> {materialForm.file_name}
                    </p>
                    <p className="text-xs text-gray-500 mt-1">
                      {formatFileSize(materialForm.file_size)}
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-4 mt-6">
              <button
                onClick={editingMaterial ? handleUpdateMaterial : handleAddMaterial}
                disabled={loading || uploadingFile}
                className={`inline-flex items-center gap-2 ${getButton('primary')} disabled:opacity-50 disabled:cursor-not-allowed`}
              >
                {loading || uploadingFile ? (
                  <Loader className="w-5 h-5 animate-spin" />
                ) : (
                  <Save className="w-5 h-5" />
                )}
                {editingMaterial ? 'Update Material' : 'Add Material'}
              </button>
              <button
                onClick={resetMaterialForm}
                className={getButton('secondary')}
              >
                Cancel
              </button>
            </div>
          </div>
        )}

        {/* Materials List */}
        {materials.length > 0 ? (
          <>
            <div className="space-y-4">
              {currentMaterials.map((material) => (
                <div key={material.id} className={`${theme.cards.elevated} rounded-2xl p-6 hover:shadow-2xl transition-shadow`}>
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex items-start gap-4 flex-1">
                      {/* File Icon */}
                      <div className="w-16 h-16 bg-gradient-to-br from-orange-400 to-orange-600 rounded-xl flex items-center justify-center text-3xl flex-shrink-0">
                        {getFileIcon(material.file_type)}
                      </div>

                      {/* Material Info */}
                      <div className="flex-1 min-w-0">
                        <h3 className="text-xl font-bold text-gray-900 mb-1">
                          {material.title}
                        </h3>
                        <div className="flex flex-wrap items-center gap-3 text-sm text-gray-600">
                          <span className="font-semibold">{material.file_name}</span>
                          <span>•</span>
                          <span>{formatFileSize(material.file_size)}</span>
                          <span>•</span>
                          <span className="text-xs text-gray-500">
                            Added {new Date(material.created_at).toLocaleDateString()}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex gap-2 flex-shrink-0">
                      <a
                        href={material.file_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center justify-center gap-2 bg-green-500 hover:bg-green-600 text-white rounded-xl py-2 px-4 font-bold transition-all"
                      >
                        <Download className="w-4 h-4" />
                        Download
                      </a>
                      <button
                        onClick={() => startEditMaterial(material)}
                        className="inline-flex items-center justify-center gap-2 bg-blue-500 hover:bg-blue-600 text-white rounded-xl py-2 px-4 font-bold transition-all"
                      >
                        <Edit2 className="w-4 h-4" />
                        Edit
                      </button>
                      <button
                        onClick={() => handleDeleteMaterial(material)}
                        className="inline-flex items-center justify-center gap-2 bg-red-500 hover:bg-red-600 text-white rounded-xl py-2 px-4 font-bold transition-all"
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
                      className={`w-10 h-10 rounded-lg font-bold transition-all ${currentPage === page
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
              Showing {startIndex + 1}-{Math.min(endIndex, materials.length)} of {materials.length} materials
            </div>
          </>
        ) : (
          <div className="text-center py-20">
            <FileText className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-2xl font-bold text-gray-900 mb-2">No study materials yet</h3>
            <p className="text-gray-600 mb-6">Start by uploading your first study material</p>
            <button
              onClick={() => setShowAddMaterial(true)}
              className={`inline-flex items-center gap-2 ${getButton('primary')}`}
            >
              <Plus className="w-5 h-5" />
              Add Your First Material
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminStudyMaterialsPage;