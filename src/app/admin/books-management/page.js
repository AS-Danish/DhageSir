"use client";
import React, { useState, useEffect } from "react";
import { BookOpen, Plus, Upload, Loader, Video } from "lucide-react";
import { useAdminStore } from "@/store/useAdminStore";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { storage, db } from "@/firebase/firebaseConfig";
import { doc, getDoc, setDoc } from "firebase/firestore";
import AdminTable from "@/components/admin/ui/AdminTable";
import AdminModal from "@/components/admin/ui/AdminModal";

const theme = {
  gradients: {
    primary: "from-orange-500 to-orange-600",
  },
};

const getButton = (variant = "primary") => {
  const variants = {
    primary: "bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white rounded-xl py-3 px-6 font-bold transition-all shadow-md hover:shadow-lg",
  };
  return variants[variant];
};

export default function AdminBooksPage() {
  const { 
    books, 
    categories, 
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
  const [isBookModalOpen, setIsBookModalOpen] = useState(false);
  const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);
  const [editingBook, setEditingBook] = useState(null);
  const [editingCategory, setEditingCategory] = useState(null);
  const [viewingImage, setViewingImage] = useState(null);
  
  // Forms
  const [bookForm, setBookForm] = useState({ title: "", description: "", book_category: "", book_url: "", promo_video_url: "", book_image_url: "" });
  const [categoryForm, setCategoryForm] = useState({ name: "" });
  
  // Uploads
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState("");
  const [uploadingImage, setUploadingImage] = useState(false);
  
  const [videoFile, setVideoFile] = useState(null);
  const [videoPreview, setVideoPreview] = useState("");
  const [uploadingVideo, setUploadingVideo] = useState(false);
  
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    const loadData = async () => {
      setInitialLoading(true);
      try {
        await Promise.all([
          fetchCollection('categories', 'categories'),
          fetchCollection('books', 'books')
        ]);
      } catch (error) {
        console.error('Failed to load initial data');
      } finally {
        setInitialLoading(false);
      }
    };
    loadData();
  }, [fetchCollection]);

  const uploadMedia = async (file, folder, setUploading) => {
    try {
      setUploading(true);
      const fileName = `${Date.now()}_${file.name.replace(/[^a-zA-Z0-9.]/g, "_")}`;
      const storageRef = ref(storage, `${folder}/${fileName}`);
      const snapshot = await uploadBytes(storageRef, file);
      return await getDownloadURL(snapshot.ref);
    } catch (error) {
      alert(`Failed to upload to ${folder}. Please check permissions.`);
      throw error;
    } finally {
      setUploading(false);
    }
  };

  const handleImageFileChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) return alert("Image size should be less than 5MB");
      setImageFile(file);
      setBookForm({ ...bookForm, book_image_url: "" });
      const reader = new FileReader();
      reader.onloadend = () => setImagePreview(reader.result);
      reader.readAsDataURL(file);
    }
  };

  const handleVideoFileChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      setVideoFile(file);
      setBookForm({ ...bookForm, promo_video_url: "" });
      const reader = new FileReader();
      reader.onloadend = () => setVideoPreview(reader.result);
      reader.readAsDataURL(file);
    }
  };

  const updateNewsTicker = async (newBook) => {
    try {
      const tickerDocRef = doc(db, "news_ticker", "latest");
      const tickerSnapshot = await getDoc(tickerDocRef);
      let tickerData = { latest_book_title: "", latest_book_url: "", second_book_title: "", second_book_url: "", ...tickerSnapshot.data() };
      
      tickerData.second_book_title = tickerData.latest_book_title;
      tickerData.second_book_url = tickerData.latest_book_url;
      tickerData.latest_book_title = newBook.title;
      tickerData.latest_book_url = newBook.book_url || "";
      
      await setDoc(tickerDocRef, tickerData);
    } catch (error) {
      console.error("Error updating news ticker:", error);
    }
  };

  // Book Handlers
  const openBookModal = (book = null) => {
    if (book) {
      setEditingBook(book);
      setBookForm({ title: book.title, description: book.description, book_category: book.book_category, book_url: book.book_url || "", promo_video_url: book.promo_video_url || "", book_image_url: book.book_image_url });
      setImagePreview(book.book_image_url);
      setVideoPreview(book.promo_video_url || "");
    } else {
      setEditingBook(null);
      setBookForm({ title: "", description: "", book_category: "", book_url: "", promo_video_url: "", book_image_url: "" });
      setImagePreview("");
      setVideoPreview("");
    }
    setImageFile(null);
    setVideoFile(null);
    setIsBookModalOpen(true);
  };

  const saveBook = async () => {
    if (!bookForm.title || !bookForm.description || !bookForm.book_category) {
      return alert("Please fill in all required fields");
    }
    setIsSaving(true);
    try {
      let imageUrl = bookForm.book_image_url;
      if (imageFile) imageUrl = await uploadMedia(imageFile, "book-images", setUploadingImage);
      if (!imageUrl) return alert("Please provide a preview image");

      let videoUrl = bookForm.promo_video_url;
      if (videoFile) videoUrl = await uploadMedia(videoFile, "book-videos", setUploadingVideo);

      const data = {
        title: bookForm.title,
        description: bookForm.description,
        book_category: bookForm.book_category,
        book_url: bookForm.book_url || "",
        promo_video_url: videoUrl || "",
        book_image_url: imageUrl,
        [editingBook ? 'updated_at' : 'created_at']: new Date().toISOString(),
      };

      if (editingBook) {
        await updateDocument('books', editingBook.id, data, 'books');
        await updateNewsTicker({ ...data, id: editingBook.id });
      } else {
        const newBook = await addDocument('books', data, 'books');
        await updateNewsTicker(newBook);
      }
      setIsBookModalOpen(false);
    } catch (error) {
      console.error(error);
    } finally {
      setIsSaving(false);
    }
  };

  const deleteBook = async (id) => {
    if (window.confirm("Are you sure you want to delete this book?")) {
      await deleteDocument('books', id, 'books');
    }
  };

  // Category Handlers
  const openCategoryModal = (category = null) => {
    if (category) {
      setEditingCategory(category);
      setCategoryForm({ name: category.name });
    } else {
      setEditingCategory(null);
      setCategoryForm({ name: "" });
    }
    setIsCategoryModalOpen(true);
  };

  const saveCategory = async () => {
    if (!categoryForm.name.trim()) return alert("Please enter a category name");
    
    const isDuplicate = categories.some(cat => 
      cat.id !== editingCategory?.id && cat.name.toLowerCase() === categoryForm.name.trim().toLowerCase()
    );
    if (isDuplicate) return alert("Category exists");

    setIsSaving(true);
    try {
      const data = { name: categoryForm.name.trim(), [editingCategory ? 'updated_at' : 'created_at']: new Date().toISOString() };
      
      if (editingCategory) {
        await updateDocument('categories', editingCategory.id, data, 'categories');
        const related = books.filter(b => b.book_category === editingCategory.name);
        for (const book of related) {
          await updateDocument('books', book.id, { book_category: data.name }, 'books');
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
    const related = books.filter(b => b.book_category === cat?.name);
    if (related.length > 0) return alert("Cannot delete category with active books");
    
    if (window.confirm("Are you sure you want to delete this category?")) {
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

  const bookColumns = [
    { header: "Image", accessor: "book_image_url", render: (item) => (
      <div className="w-12 h-16 rounded shadow-sm overflow-hidden">
        <img src={item.book_image_url} alt="" className="w-full h-full object-cover" />
      </div>
    )},
    { header: "Title", accessor: "title", render: (item) => <div className="font-bold text-gray-900">{item.title}</div> },
    { header: "Category", accessor: "book_category", render: (item) => (
      <span className="px-3 py-1 bg-gray-100 text-gray-700 text-xs font-bold rounded-full">{item.book_category}</span>
    )},
    { header: "Created", accessor: "created_at", render: (item) => (
      <div className="text-gray-500 text-sm">{new Date(item.created_at).toLocaleDateString()}</div>
    )}
  ];

  const categoryColumns = [
    { header: "Name", accessor: "name", render: (item) => <div className="font-bold text-gray-900">{item.name}</div> },
    { header: "Books Count", accessor: "count", render: (item) => (
      <div className="text-gray-500 font-medium">{books.filter(b => b.book_category === item.name).length} books</div>
    )}
  ];

  return (
    <div className="min-h-screen">
      <div className={`bg-gradient-to-r ${theme.gradients.primary} py-8 px-8 rounded-3xl shadow-lg mb-8`}>
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-black text-white mb-2">Books Management</h1>
            <p className="text-orange-100 font-medium">Manage your books and categories</p>
          </div>
          <BookOpen className="w-16 h-16 text-white opacity-20" />
        </div>
      </div>

      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-900">All Books</h2>
        <div className="flex items-center gap-3">
          <button
            onClick={() => setIsManageCategoriesModalOpen(true)}
            className="px-5 py-3 bg-gray-100 text-gray-700 font-bold rounded-xl hover:bg-gray-200 transition-all shadow-sm"
          >
            Manage Categories
          </button>
          <button
            onClick={() => openBookModal()}
            className={`inline-flex items-center gap-2 ${getButton("primary")}`}
          >
            <Plus className="w-5 h-5" />
            Add New Book
          </button>
        </div>
      </div>

      <AdminTable
        items={books}
        columns={bookColumns}
        currentPage={currentPage}
        itemsPerPage={itemsPerPage}
        onPageChange={setPagination}
        onEdit={openBookModal}
        onDelete={deleteBook}
        onViewImage={setViewingImage}
      />

      {/* Modals */}
      <AdminModal
        isOpen={isBookModalOpen}
        onClose={() => setIsBookModalOpen(false)}
        title={editingBook ? "Edit Book" : "Add Book"}
        onSave={saveBook}
        isSaving={isSaving}
        size="lg"
      >
        <div className="grid md:grid-cols-2 gap-6">
          <div className="md:col-span-2">
            <label className="block text-sm font-bold text-gray-700 mb-2">Title *</label>
            <input type="text" value={bookForm.title} onChange={e => setBookForm({...bookForm, title: e.target.value})} className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-orange-500 outline-none transition-all text-black" />
          </div>
          <div className="md:col-span-2">
            <label className="block text-sm font-bold text-gray-700 mb-2">Category *</label>
            <div className="flex gap-2">
              <select value={bookForm.book_category} onChange={e => setBookForm({...bookForm, book_category: e.target.value})} className="flex-1 px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-orange-500 outline-none transition-all text-black">
                <option value="">Select Category</option>
                {categories.map(c => <option key={c.id} value={c.name}>{c.name}</option>)}
              </select>
              <button type="button" onClick={() => openCategoryModal()} className="px-4 py-3 bg-orange-100 text-orange-600 font-bold rounded-xl hover:bg-orange-200 transition-colors whitespace-nowrap">
                + New
              </button>
            </div>
          </div>
          <div className="md:col-span-2">
            <label className="block text-sm font-bold text-gray-700 mb-2">Buy URL (Optional)</label>
            <input type="url" value={bookForm.book_url} onChange={e => setBookForm({...bookForm, book_url: e.target.value})} className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-orange-500 outline-none transition-all text-black" />
          </div>
          <div className="md:col-span-2">
            <label className="block text-sm font-bold text-gray-700 mb-2">Description *</label>
            <textarea value={bookForm.description} onChange={e => setBookForm({...bookForm, description: e.target.value})} rows={4} className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-orange-500 outline-none transition-all resize-none text-black" />
          </div>

          {/* Image Upload */}
          <div className="md:col-span-2">
            <label className="block text-sm font-bold text-gray-700 mb-2">Cover Image *</label>
            <div className="flex gap-4">
              <label className="flex-1 cursor-pointer border-2 border-dashed border-gray-300 rounded-xl p-6 hover:border-orange-500 transition-colors flex flex-col items-center">
                <Upload className="w-8 h-8 text-gray-400 mb-2" />
                <span className="text-sm font-medium text-gray-600">{uploadingImage ? 'Uploading...' : 'Upload Image'}</span>
                <input type="file" className="hidden" accept="image/*" onChange={handleImageFileChange} disabled={uploadingImage} />
              </label>
              <div className="flex items-center justify-center px-4 text-gray-400 font-bold">OR</div>
              <input type="url" value={bookForm.book_image_url} onChange={e => {setBookForm({...bookForm, book_image_url: e.target.value}); setImagePreview(e.target.value); setImageFile(null);}} placeholder="Image URL" className="flex-1 px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-orange-500 outline-none transition-all text-black h-fit my-auto" />
            </div>
            {imagePreview && (
              <img src={imagePreview} alt="Preview" className="mt-4 h-48 w-auto object-cover rounded-xl border border-gray-200" />
            )}
          </div>

          {/* Video Upload */}
          <div className="md:col-span-2">
            <label className="block text-sm font-bold text-gray-700 mb-2">Promo Video (Optional)</label>
            <div className="flex gap-4">
              <label className="flex-1 cursor-pointer border-2 border-dashed border-gray-300 rounded-xl p-6 hover:border-orange-500 transition-colors flex flex-col items-center">
                <Video className="w-8 h-8 text-gray-400 mb-2" />
                <span className="text-sm font-medium text-gray-600">{uploadingVideo ? 'Uploading...' : 'Upload Video'}</span>
                <input type="file" className="hidden" accept="video/*" onChange={handleVideoFileChange} disabled={uploadingVideo} />
              </label>
              <div className="flex items-center justify-center px-4 text-gray-400 font-bold">OR</div>
              <input type="url" value={bookForm.promo_video_url} onChange={e => {setBookForm({...bookForm, promo_video_url: e.target.value}); setVideoPreview(e.target.value); setVideoFile(null);}} placeholder="Video URL" className="flex-1 px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-orange-500 outline-none transition-all text-black h-fit my-auto" />
            </div>
            {videoPreview && (
              <video src={videoPreview} controls className="mt-4 h-48 w-auto rounded-xl border border-gray-200" />
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
