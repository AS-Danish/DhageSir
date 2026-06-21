"use client";
import React, { useState, useEffect } from 'react';
import { FileText, Plus, Upload, Loader } from 'lucide-react';
import { useAdminStore } from '@/store/useAdminStore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { storage } from '@/firebase/firebaseConfig';
import AdminTable from '@/components/admin/ui/AdminTable';
import AdminModal from '@/components/admin/ui/AdminModal';

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

export default function AdminArticlesPage() {
  const { 
    articles, 
    categories, 
    isLoading, 
    fetchCollection, 
    addDocument, 
    updateDocument, 
    deleteDocument,
    currentPage,
    itemsPerPage,
    setPagination
  } = useAdminStore();

  const [isManageCategoriesModalOpen, setIsManageCategoriesModalOpen] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  
  // Modals
  const [isArticleModalOpen, setIsArticleModalOpen] = useState(false);
  const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);
  const [editingArticle, setEditingArticle] = useState(null);
  const [editingCategory, setEditingCategory] = useState(null);
  const [viewingImage, setViewingImage] = useState(null);
  
  // Forms
  const [articleForm, setArticleForm] = useState({ title: '', description: '', article_category: '', preview_image_url: '' });
  const [categoryForm, setCategoryForm] = useState({ name: '' });
  
  // Image Upload
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState('');
  const [uploadingImage, setUploadingImage] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    const loadData = async () => {
      setInitialLoading(true);
      try {
        await Promise.all([
          fetchCollection('categories', 'categories'),
          fetchCollection('articles', 'articles')
        ]);
      } catch (error) {
        console.error('Failed to load initial data');
      } finally {
        setInitialLoading(false);
      }
    };
    loadData();
  }, [fetchCollection]);

  const uploadImage = async (file) => {
    try {
      setUploadingImage(true);
      const fileName = `${Date.now()}_${file.name.replace(/[^a-zA-Z0-9.]/g, '_')}`;
      const storageRef = ref(storage, `article-images/${fileName}`);
      const snapshot = await uploadBytes(storageRef, file);
      return await getDownloadURL(snapshot.ref);
    } catch (error) {
      alert('Failed to upload image. Please check permissions.');
      throw error;
    } finally {
      setUploadingImage(false);
    }
  };

  const handleImageFileChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) return alert('Image size should be less than 5MB');
      setImageFile(file);
      setArticleForm({ ...articleForm, preview_image_url: '' });
      const reader = new FileReader();
      reader.onloadend = () => setImagePreview(reader.result);
      reader.readAsDataURL(file);
    }
  };

  // Article Handlers
  const openArticleModal = (article = null) => {
    if (article) {
      setEditingArticle(article);
      setArticleForm({ title: article.title, description: article.description, article_category: article.article_category, preview_image_url: article.preview_image_url });
      setImagePreview(article.preview_image_url);
    } else {
      setEditingArticle(null);
      setArticleForm({ title: '', description: '', article_category: '', preview_image_url: '' });
      setImagePreview('');
    }
    setImageFile(null);
    setIsArticleModalOpen(true);
  };

  const saveArticle = async () => {
    if (!articleForm.title || !articleForm.description || !articleForm.article_category) {
      return alert('Please fill in all required fields');
    }
    setIsSaving(true);
    try {
      let imageUrl = articleForm.preview_image_url;
      if (imageFile) imageUrl = await uploadImage(imageFile);
      if (!imageUrl) return alert('Please provide a preview image');

      const data = {
        title: articleForm.title,
        description: articleForm.description,
        article_category: articleForm.article_category,
        preview_image_url: imageUrl,
        [editingArticle ? 'updated_at' : 'created_at']: new Date().toISOString(),
      };

      if (editingArticle) {
        await updateDocument('articles', editingArticle.id, data, 'articles');
      } else {
        await addDocument('articles', data, 'articles');
      }
      setIsArticleModalOpen(false);
    } catch (error) {
      console.error(error);
    } finally {
      setIsSaving(false);
    }
  };

  const deleteArticle = async (id) => {
    if (window.confirm('Are you sure you want to delete this article?')) {
      await deleteDocument('articles', id, 'articles');
    }
  };

  // Category Handlers
  const openCategoryModal = (category = null) => {
    if (category) {
      setEditingCategory(category);
      setCategoryForm({ name: category.name });
    } else {
      setEditingCategory(null);
      setCategoryForm({ name: '' });
    }
    setIsCategoryModalOpen(true);
  };

  const saveCategory = async () => {
    if (!categoryForm.name.trim()) return alert('Please enter a category name');
    
    const isDuplicate = categories.some(cat => 
      cat.id !== editingCategory?.id && cat.name.toLowerCase() === categoryForm.name.trim().toLowerCase()
    );
    if (isDuplicate) return alert('Category exists');

    setIsSaving(true);
    try {
      const data = { name: categoryForm.name.trim(), [editingCategory ? 'updated_at' : 'created_at']: new Date().toISOString() };
      
      if (editingCategory) {
        await updateDocument('categories', editingCategory.id, data, 'categories');
        // Update all related articles
        const related = articles.filter(a => a.article_category === editingCategory.name);
        for (const article of related) {
          await updateDocument('articles', article.id, { article_category: data.name }, 'articles');
        }
      } else {
        await addDocument('categories', data, 'categories');
      }
      setIsCategoryModalOpen(false);
    } finally {
      setIsSaving(false);
    }
  };

  const deleteCategory = async (id) => {
    const cat = categories.find(c => c.id === id);
    const related = articles.filter(a => a.article_category === cat?.name);
    if (related.length > 0) return alert('Cannot delete category with active articles');
    
    if (window.confirm('Are you sure you want to delete this category?')) {
      await deleteDocument('categories', id, 'categories');
    }
  };

  if (initialLoading) {
    return (
      <div className="min-h-[80vh] flex items-center justify-center">
        <Loader className="w-12 h-12 text-orange-500 animate-spin" />
      </div>
    );
  }

  const articleColumns = [
    { header: 'Image', accessor: 'preview_image_url', render: (item) => (
      <div className="w-16 h-12 rounded-lg bg-gray-100 overflow-hidden">
        <img src={item.preview_image_url} alt="" className="w-full h-full object-cover" />
      </div>
    )},
    { header: 'Title', accessor: 'title', render: (item) => <div className="font-bold text-gray-900">{item.title}</div> },
    { header: 'Category', accessor: 'article_category', render: (item) => (
      <span className="px-3 py-1 bg-gray-100 text-gray-700 text-xs font-bold rounded-full">{item.article_category}</span>
    )},
    { header: 'Created', accessor: 'created_at', render: (item) => (
      <div className="text-gray-500 text-sm">{new Date(item.created_at).toLocaleDateString()}</div>
    )}
  ];

  const categoryColumns = [
    { header: 'Name', accessor: 'name', render: (item) => <div className="font-bold text-gray-900">{item.name}</div> },
    { header: 'Articles', accessor: 'count', render: (item) => (
      <div className="text-gray-500">{articles.filter(a => a.article_category === item.name).length} articles</div>
    )}
  ];

  return (
    <div className="min-h-screen">
      {/* Header */}
      <div className={`bg-gradient-to-r ${theme.gradients.primary} py-8 px-8 rounded-3xl shadow-lg mb-8`}>
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-black text-white mb-2">Articles Management</h1>
            <p className="text-orange-100 font-medium">Manage your articles and categories</p>
          </div>
          <FileText className="w-16 h-16 text-white opacity-20" />
        </div>
      </div>

      {/* Content */}
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-900">All Articles</h2>
        <div className="flex items-center gap-3">
          <button
            onClick={() => setIsManageCategoriesModalOpen(true)}
            className="px-5 py-3 bg-gray-100 text-gray-700 font-bold rounded-xl hover:bg-gray-200 transition-all shadow-sm"
          >
            Manage Categories
          </button>
          <button
            onClick={() => openArticleModal()}
            className={`inline-flex items-center gap-2 ${getButton('primary')}`}
          >
            <Plus className="w-5 h-5" />
            Add New Article
          </button>
        </div>
      </div>

      <AdminTable
        items={articles}
        columns={articleColumns}
        currentPage={currentPage}
        itemsPerPage={itemsPerPage}
        onPageChange={setPagination}
        onEdit={openArticleModal}
        onDelete={deleteArticle}
        onViewImage={setViewingImage}
      />

      {/* Modals */}
      <AdminModal
        isOpen={isArticleModalOpen}
        onClose={() => setIsArticleModalOpen(false)}
        title={editingArticle ? "Edit Article" : "Add Article"}
        onSave={saveArticle}
        isSaving={isSaving}
        size="lg"
      >
        <div className="grid md:grid-cols-2 gap-6">
          <div className="md:col-span-2">
            <label className="block text-sm font-bold text-gray-700 mb-2">Title *</label>
            <input type="text" value={articleForm.title} onChange={e => setArticleForm({...articleForm, title: e.target.value})} className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-orange-500 outline-none transition-all text-black" placeholder="Enter title" />
          </div>
          <div className="md:col-span-2">
            <label className="block text-sm font-bold text-gray-700 mb-2">Category *</label>
            <div className="flex gap-2">
              <select value={articleForm.article_category} onChange={e => setArticleForm({...articleForm, article_category: e.target.value})} className="flex-1 px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-orange-500 outline-none transition-all text-black">
                <option value="">Select Category</option>
                {categories.map(c => <option key={c.id} value={c.name}>{c.name}</option>)}
              </select>
              <button type="button" onClick={() => openCategoryModal()} className="px-4 py-3 bg-orange-100 text-orange-600 font-bold rounded-xl hover:bg-orange-200 transition-colors whitespace-nowrap">
                + New
              </button>
            </div>
          </div>
          <div className="md:col-span-2">
            <label className="block text-sm font-bold text-gray-700 mb-2">Description *</label>
            <textarea value={articleForm.description} onChange={e => setArticleForm({...articleForm, description: e.target.value})} rows={4} className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-orange-500 outline-none transition-all resize-none text-black" placeholder="Enter description" />
          </div>
          <div className="md:col-span-2">
            <label className="block text-sm font-bold text-gray-700 mb-2">Preview Image *</label>
            <div className="flex gap-4">
              <label className="flex-1 cursor-pointer border-2 border-dashed border-gray-300 rounded-xl p-6 hover:border-orange-500 transition-colors flex flex-col items-center">
                <Upload className="w-8 h-8 text-gray-400 mb-2" />
                <span className="text-sm font-medium text-gray-600">{uploadingImage ? 'Uploading...' : 'Upload Image'}</span>
                <input type="file" className="hidden" accept="image/*" onChange={handleImageFileChange} disabled={uploadingImage} />
              </label>
              <div className="flex items-center justify-center px-4 text-gray-400 font-bold">OR</div>
              <input type="url" value={articleForm.preview_image_url} onChange={e => {setArticleForm({...articleForm, preview_image_url: e.target.value}); setImagePreview(e.target.value); setImageFile(null);}} placeholder="Image URL" className="flex-1 px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-orange-500 outline-none transition-all text-black h-fit my-auto" />
            </div>
            {imagePreview && (
              <img src={imagePreview} alt="Preview" className="mt-4 h-48 w-full object-cover rounded-xl border border-gray-200" />
            )}
          </div>
        </div>
      </AdminModal>

      <AdminModal
        isOpen={isCategoryModalOpen}
        onClose={() => setIsCategoryModalOpen(false)}
        title={editingCategory ? "Edit Category" : "Add Category"}
        onSave={saveCategory}
        isSaving={isSaving}
        size="md"
      >
        <div>
          <label className="block text-sm font-bold text-gray-700 mb-2">Category Name *</label>
          <input type="text" value={categoryForm.name} onChange={e => setCategoryForm({...categoryForm, name: e.target.value})} className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-orange-500 outline-none transition-all text-black" placeholder="Enter category name" />
        </div>
      </AdminModal>

      <AdminModal
        isOpen={isManageCategoriesModalOpen}
        onClose={() => setIsManageCategoriesModalOpen(false)}
        title="Manage Categories"
        size="lg"
      >
        <div className="mb-4 flex justify-end">
           <button onClick={() => openCategoryModal()} className="px-4 py-2 bg-orange-100 text-orange-600 font-bold rounded-xl hover:bg-orange-200 transition-colors flex items-center gap-2">
             <Plus className="w-4 h-4" /> Add Category
           </button>
        </div>
        <div className="max-h-[60vh] overflow-y-auto">
          <AdminTable
            items={categories}
            columns={categoryColumns}
            onEdit={openCategoryModal}
            onDelete={deleteCategory}
            hidePagination={true}
          />
        </div>
      </AdminModal>

      <AdminModal
        isOpen={!!viewingImage}
        onClose={() => setViewingImage(null)}
        title="Image Preview"
        size="lg"
      >
        <img src={viewingImage} alt="Preview" className="w-full rounded-xl" />
      </AdminModal>
    </div>
  );
}