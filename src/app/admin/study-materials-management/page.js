"use client";
import React, { useState, useEffect } from 'react';
import { FileText, Plus, Upload, Loader, Download } from 'lucide-react';
import { useAdminStore } from '@/store/useAdminStore';
import { ref, uploadBytes, getDownloadURL, deleteObject } from 'firebase/storage';
import { storage } from '@/firebase/firebaseConfig';
import AdminTable from '@/components/admin/ui/AdminTable';
import AdminModal from '@/components/admin/ui/AdminModal';

const theme = {
  gradients: { primary: 'from-orange-500 to-orange-600' },
};

const getButton = (variant = 'primary') => {
  const variants = {
    primary: 'bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white rounded-xl py-3 px-6 font-bold transition-all shadow-md hover:shadow-lg',
  };
  return variants[variant];
};

export default function AdminStudyMaterialsPage() {
  const { studyMaterials, fetchCollection, addDocument, updateDocument, deleteDocument, currentPage, itemsPerPage, setPagination } = useAdminStore();
  const [initialLoading, setInitialLoading] = useState(true);
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingMaterial, setEditingMaterial] = useState(null);
  
  const [materialForm, setMaterialForm] = useState({ title: '', file_url: '', file_name: '', file_type: '', file_size: 0 });
  const [selectedFile, setSelectedFile] = useState(null);
  const [uploadingFile, setUploadingFile] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    const loadData = async () => {
      setInitialLoading(true);
      try {
        await fetchCollection('study_materials', 'studyMaterials');
      } catch (error) {
        console.error('Failed to load study materials');
      } finally {
        setInitialLoading(false);
      }
    };
    loadData();
  }, [fetchCollection]);

  const uploadFileToStorage = async (file) => {
    try {
      setUploadingFile(true);
      const fileName = `${Date.now()}_${file.name.replace(/[^a-zA-Z0-9.]/g, '_')}`;
      const storageRef = ref(storage, `study-materials/${fileName}`);
      const snapshot = await uploadBytes(storageRef, file);
      const url = await getDownloadURL(snapshot.ref);
      return { url, name: file.name, type: file.type, size: file.size, storagePath: `study-materials/${fileName}` };
    } catch (error) {
      alert('Failed to upload file. Please check permissions.');
      throw error;
    } finally {
      setUploadingFile(false);
    }
  };

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      const allowedTypes = [
        'application/pdf', 'application/vnd.ms-powerpoint', 'application/vnd.openxmlformats-officedocument.presentationml.presentation',
        'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
      ];
      if (!allowedTypes.includes(file.type)) return alert('Please select a valid PDF, PowerPoint, or Word file');
      if (file.size > 50 * 1024 * 1024) return alert('File size should be less than 50MB');
      setSelectedFile(file);
    }
  };

  const openModal = (material = null) => {
    if (material) {
      setEditingMaterial(material);
      setMaterialForm({ title: material.title, file_url: material.file_url, file_name: material.file_name, file_type: material.file_type, file_size: material.file_size });
    } else {
      setEditingMaterial(null);
      setMaterialForm({ title: '', file_url: '', file_name: '', file_type: '', file_size: 0 });
    }
    setSelectedFile(null);
    setIsModalOpen(true);
  };

  const saveMaterial = async () => {
    if (!materialForm.title.trim()) return alert('Please enter a title');
    if (!selectedFile && !editingMaterial) return alert('Please select a file to upload');

    setIsSaving(true);
    try {
      let fileData = { url: materialForm.file_url, name: materialForm.file_name, type: materialForm.file_type, size: materialForm.file_size, storagePath: editingMaterial?.storage_path };
      
      if (selectedFile) {
        if (editingMaterial?.storage_path) {
          try { await deleteObject(ref(storage, editingMaterial.storage_path)); } catch (e) { console.warn('Could not delete old file', e); }
        }
        fileData = await uploadFileToStorage(selectedFile);
      }

      const data = {
        title: materialForm.title.trim(),
        file_url: fileData.url,
        file_name: fileData.name,
        file_type: fileData.type,
        file_size: fileData.size,
        storage_path: fileData.storagePath,
        [editingMaterial ? 'updated_at' : 'created_at']: new Date().toISOString(),
      };

      if (editingMaterial) {
        await updateDocument('study_materials', editingMaterial.id, data, 'studyMaterials');
      } else {
        await addDocument('study_materials', data, 'studyMaterials');
      }
      setIsModalOpen(false);
    } catch (error) {
      console.error(error);
    } finally {
      setIsSaving(false);
    }
  };

  const deleteMaterial = async (id) => {
    if (window.confirm('Are you sure you want to delete this study material?')) {
      const material = studyMaterials.find(m => m.id === id);
      if (material?.storage_path) {
        try { await deleteObject(ref(storage, material.storage_path)); } catch (e) { console.warn('Could not delete file', e); }
      }
      await deleteDocument('study_materials', id, 'studyMaterials');
    }
  };

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024, sizes = ['Bytes', 'KB', 'MB', 'GB'], i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
  };

  const getFileIcon = (fileType) => {
    if (fileType?.includes('pdf')) return '📄';
    if (fileType?.includes('presentation') || fileType?.includes('powerpoint')) return '📊';
    if (fileType?.includes('word') || fileType?.includes('document')) return '📝';
    return '📎';
  };

  if (initialLoading) {
    return (
      <div className="min-h-[80vh] flex items-center justify-center">
        <Loader className="w-12 h-12 text-orange-500 animate-spin" />
      </div>
    );
  }

  const columns = [
    { header: "Type", accessor: "file_type", render: (item) => (
      <div className="w-12 h-12 bg-gradient-to-br from-orange-400 to-orange-600 rounded-xl flex items-center justify-center text-xl text-white shadow-sm">
        {getFileIcon(item.file_type)}
      </div>
    )},
    { header: "Title", accessor: "title", render: (item) => (
      <div>
        <div className="font-bold text-gray-900">{item.title}</div>
        <div className="text-sm text-gray-500 mt-1">{item.file_name}</div>
      </div>
    )},
    { header: "Size", accessor: "file_size", render: (item) => (
      <div className="text-gray-600 font-medium">{formatFileSize(item.file_size)}</div>
    )},
    { header: "Download", accessor: "file_url", render: (item) => (
      <a href={item.file_url} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 px-4 py-2 bg-green-500 hover:bg-green-600 text-white rounded-lg text-sm font-bold transition-colors">
        <Download className="w-4 h-4" /> Download
      </a>
    )}
  ];

  return (
    <div className="min-h-screen">
      <div className={`bg-gradient-to-r ${theme.gradients.primary} py-8 px-8 rounded-3xl shadow-lg mb-8`}>
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-black text-white mb-2">Study Materials</h1>
            <p className="text-orange-100 font-medium">Upload and manage PDF, PowerPoint and Word study materials</p>
          </div>
          <FileText className="w-16 h-16 text-white opacity-20" />
        </div>
      </div>

      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-900">All Study Materials ({studyMaterials.length})</h2>
        <button onClick={() => openModal()} className={`inline-flex items-center gap-2 ${getButton('primary')}`}>
          <Plus className="w-5 h-5" /> Add New Material
        </button>
      </div>

      <AdminTable
        items={studyMaterials}
        columns={columns}
        currentPage={currentPage}
        itemsPerPage={itemsPerPage}
        onPageChange={setPagination}
        onEdit={openModal}
        onDelete={deleteMaterial}
      />

      <AdminModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingMaterial ? "Edit Study Material" : "Add Study Material"}
        onSave={saveMaterial}
        isSaving={isSaving}
        size="md"
      >
        <div className="space-y-6">
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-2">Material Title *</label>
            <input type="text" value={materialForm.title} onChange={e => setMaterialForm({...materialForm, title: e.target.value})} className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-orange-500 outline-none transition-all text-black" placeholder="e.g., Chapter 1: Introduction" />
          </div>
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-2">{editingMaterial ? 'Replace File (Optional)' : 'Upload File *'}</label>
            <label className="block w-full cursor-pointer">
              <div className="border-2 border-dashed border-gray-300 rounded-xl p-8 hover:border-orange-500 transition-colors">
                <div className="flex flex-col items-center text-center">
                  <Upload className="w-10 h-10 text-gray-400 mb-3" />
                  <p className="font-bold text-gray-900 mb-1">{uploadingFile ? 'Uploading...' : selectedFile ? selectedFile.name : 'Click to upload file'}</p>
                  <p className="text-sm text-gray-500 mb-2">PDF, PowerPoint, or Word up to 50MB</p>
                  {selectedFile && <p className="text-xs text-orange-600 font-bold">{formatFileSize(selectedFile.size)}</p>}
                </div>
              </div>
              <input type="file" accept=".pdf,.ppt,.pptx,.doc,.docx,application/pdf,application/vnd.ms-powerpoint,application/vnd.openxmlformats-officedocument.presentationml.presentation,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document" onChange={handleFileChange} className="hidden" disabled={uploadingFile} />
            </label>
            {editingMaterial && !selectedFile && (
              <div className="mt-4 p-4 bg-gray-50 rounded-xl border border-gray-200">
                <p className="text-sm text-gray-600"><span className="font-bold">Current file:</span> {materialForm.file_name}</p>
                <p className="text-xs text-gray-500 mt-1">{formatFileSize(materialForm.file_size)}</p>
              </div>
            )}
          </div>
        </div>
      </AdminModal>
    </div>
  );
}