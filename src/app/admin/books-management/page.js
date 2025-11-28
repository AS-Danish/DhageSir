"use client";
import React, { useState, useEffect } from 'react';
import { BookOpen, Plus, Edit2, Trash2, X, Save, Upload, Link, FolderPlus, Tag, Loader } from 'lucide-react';
import { db, storage } from '../../../firebase/firebaseConfig';
import { collection, getDocs, addDoc, updateDoc, deleteDoc, doc, query, orderBy } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';

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

const AdminBooksPage = () => {
  const [activeTab, setActiveTab] = useState('books');
  const [showAddBook, setShowAddBook] = useState(false);
  const [showAddCategory, setShowAddCategory] = useState(false);
  const [editingBook, setEditingBook] = useState(null);
  const [editingCategory, setEditingCategory] = useState(null);
  const [loading, setLoading] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);

  // Books State
  const [books, setBooks] = useState([]);
  const [categories, setCategories] = useState([]);

  // Form State
  const [bookForm, setBookForm] = useState({
    title: '',
    description: '',
    book_category: '',
    book_url: '',
    book_image_url: '',
  });

  const [categoryForm, setCategoryForm] = useState({
    name: '',
  });

  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState('');

  // Helper to invalidate cache
  const invalidateCache = (type) => {
    if (type === 'books' || type === 'all') {
      localStorage.removeItem('books_cache');
      localStorage.removeItem('books_cache_timestamp');
    }
    if (type === 'categories' || type === 'all') {
      localStorage.removeItem('categories_cache');
      localStorage.removeItem('categories_cache_timestamp');
    }
  };

  // Fetch and cache categories
  const fetchAndCacheCategories = async () => {
    const q = query(collection(db, "categories"), orderBy("created_at", "desc"));
    const querySnapshot = await getDocs(q);
    const categoriesData = querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
    
    setCategories(categoriesData);
    
    // Cache the data
    localStorage.setItem('categories_cache', JSON.stringify(categoriesData));
    localStorage.setItem('categories_cache_timestamp', Date.now().toString());
  };

  // Load categories from Firestore with caching
  const loadCategories = async () => {
    try {
      // Try to load from cache first
      const cachedCategories = localStorage.getItem('categories_cache');
      const cacheTimestamp = localStorage.getItem('categories_cache_timestamp');
      
      // Use cache if it's less than 5 minutes old
      if (cachedCategories && cacheTimestamp) {
        const cacheAge = Date.now() - parseInt(cacheTimestamp);
        if (cacheAge < 5 * 60 * 1000) { // 5 minutes
          setCategories(JSON.parse(cachedCategories));
          // Still fetch in background to update
          fetchAndCacheCategories();
          return;
        }
      }
      
      // Fetch fresh data
      await fetchAndCacheCategories();
    } catch (error) {
      console.error('Error loading categories:', error);
      alert('Failed to load categories: ' + error.message);
    }
  };

  // Fetch and cache books
  const fetchAndCacheBooks = async () => {
    const q = query(collection(db, "books"), orderBy("created_at", "desc"));
    const querySnapshot = await getDocs(q);
    const booksData = querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
    
    setBooks(booksData);
    
    // Cache the data
    localStorage.setItem('books_cache', JSON.stringify(booksData));
    localStorage.setItem('books_cache_timestamp', Date.now().toString());
  };

  // Load books from Firestore with caching
  const loadBooks = async () => {
    try {
      // Try to load from cache first
      const cachedBooks = localStorage.getItem('books_cache');
      const cacheTimestamp = localStorage.getItem('books_cache_timestamp');
      
      // Use cache if it's less than 5 minutes old
      if (cachedBooks && cacheTimestamp) {
        const cacheAge = Date.now() - parseInt(cacheTimestamp);
        if (cacheAge < 5 * 60 * 1000) { // 5 minutes
          setBooks(JSON.parse(cachedBooks));
          // Still fetch in background to update
          fetchAndCacheBooks();
          return;
        }
      }
      
      // Fetch fresh data
      await fetchAndCacheBooks();
    } catch (error) {
      console.error('Error loading books:', error);
      alert('Failed to load books: ' + error.message);
    }
  };

  // Upload image to Firebase Storage
  const uploadImage = async (file) => {
    try {
      setUploadingImage(true);
      
      // Create a unique filename with sanitized name
      const timestamp = Date.now();
      const sanitizedFileName = file.name.replace(/[^a-zA-Z0-9.]/g, '_');
      const fileName = `${timestamp}_${sanitizedFileName}`;
      const storageRef = ref(storage, `book-images/${fileName}`);
      
      // Upload file
      const snapshot = await uploadBytes(storageRef, file);
      
      // Get download URL
      const downloadURL = await getDownloadURL(snapshot.ref);
      
      return downloadURL;
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

  // Add book to Firestore
  const handleAddBook = async () => {
    if (!bookForm.title || !bookForm.description || !bookForm.book_category) {
      alert('Please fill in all required fields (Title, Description, Category)');
      return;
    }

    try {
      setLoading(true);
      
      let imageUrl = bookForm.book_image_url;
      
      // Upload image if file is selected
      if (imageFile) {
        imageUrl = await uploadImage(imageFile);
      }

      if (!imageUrl) {
        alert('Please provide a book cover image (upload or URL)');
        setLoading(false);
        return;
      }

      const bookData = {
        title: bookForm.title,
        description: bookForm.description,
        book_category: bookForm.book_category,
        book_url: bookForm.book_url || '',
        book_image_url: imageUrl,
        created_at: new Date().toISOString(),
      };

      const docRef = await addDoc(collection(db, "books"), bookData);
      const newBook = { id: docRef.id, ...bookData };
      
      setBooks([newBook, ...books]);
      invalidateCache('books');

      resetBookForm();
      setShowAddBook(false);
      alert('Book added successfully!');
    } catch (error) {
      console.error('Error adding book:', error);
      alert('Failed to add book: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  // Update book in Firestore
  const handleUpdateBook = async () => {
    if (!bookForm.title || !bookForm.description || !bookForm.book_category) {
      alert('Please fill in all required fields (Title, Description, Category)');
      return;
    }

    try {
      setLoading(true);
      
      let imageUrl = bookForm.book_image_url;
      
      // Upload new image if file is selected
      if (imageFile) {
        imageUrl = await uploadImage(imageFile);
      }

      const bookData = {
        title: bookForm.title,
        description: bookForm.description,
        book_category: bookForm.book_category,
        book_url: bookForm.book_url || '',
        book_image_url: imageUrl,
        updated_at: new Date().toISOString(),
      };

      await updateDoc(doc(db, "books", editingBook.id), bookData);
      
      setBooks(books.map(book => 
        book.id === editingBook.id ? { ...book, ...bookData } : book
      ));
      invalidateCache('books');

      resetBookForm();
      setEditingBook(null);
      alert('Book updated successfully!');
    } catch (error) {
      console.error('Error updating book:', error);
      alert('Failed to update book: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  // Delete book from Firestore
  const handleDeleteBook = async (id) => {
    if (!window.confirm('Are you sure you want to delete this book?')) {
      return;
    }

    try {
      setLoading(true);
      
      await deleteDoc(doc(db, "books", id));
      
      setBooks(books.filter(book => book.id !== id));
      invalidateCache('books');
      
      alert('Book deleted successfully!');
    } catch (error) {
      console.error('Error deleting book:', error);
      alert('Failed to delete book: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  // Add category to Firestore
  const handleAddCategory = async () => {
    if (!categoryForm.name.trim()) {
      alert('Please enter a category name');
      return;
    }

    // Check for duplicate category names
    const isDuplicate = categories.some(
      cat => cat.name.toLowerCase() === categoryForm.name.trim().toLowerCase()
    );
    
    if (isDuplicate) {
      alert('A category with this name already exists');
      return;
    }

    try {
      setLoading(true);
      
      const categoryData = {
        name: categoryForm.name.trim(),
        created_at: new Date().toISOString(),
      };

      const docRef = await addDoc(collection(db, "categories"), categoryData);
      const newCategory = { id: docRef.id, ...categoryData };
      
      setCategories([newCategory, ...categories]);
      invalidateCache('categories');

      resetCategoryForm();
      setShowAddCategory(false);
      alert('Category added successfully!');
    } catch (error) {
      console.error('Error adding category:', error);
      alert('Failed to add category: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  // Update category in Firestore
  const handleUpdateCategory = async () => {
    if (!categoryForm.name.trim()) {
      alert('Please enter a category name');
      return;
    }

    // Check for duplicate category names (excluding current)
    const isDuplicate = categories.some(
      cat => cat.id !== editingCategory.id && 
      cat.name.toLowerCase() === categoryForm.name.trim().toLowerCase()
    );
    
    if (isDuplicate) {
      alert('A category with this name already exists');
      return;
    }

    try {
      setLoading(true);
      
      const oldCategoryName = editingCategory.name;
      const newCategoryName = categoryForm.name.trim();
      
      const categoryData = {
        name: newCategoryName,
        updated_at: new Date().toISOString(),
      };

      await updateDoc(doc(db, "categories", editingCategory.id), categoryData);
      
      // Update category name in all books that use this category
      const booksToUpdate = books.filter(book => book.book_category === oldCategoryName);
      
      for (const book of booksToUpdate) {
        await updateDoc(doc(db, "books", book.id), {
          book_category: newCategoryName,
          updated_at: new Date().toISOString(),
        });
      }
      
      // Update local state
      setCategories(categories.map(cat => 
        cat.id === editingCategory.id ? { ...cat, ...categoryData } : cat
      ));
      
      setBooks(books.map(book => 
        book.book_category === oldCategoryName 
          ? { ...book, book_category: newCategoryName } 
          : book
      ));
      invalidateCache('all');

      resetCategoryForm();
      setEditingCategory(null);
      alert('Category updated successfully!');
    } catch (error) {
      console.error('Error updating category:', error);
      alert('Failed to update category: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  // Delete category from Firestore
  const handleDeleteCategory = async (id) => {
    if (!window.confirm('Are you sure you want to delete this category?')) {
      return;
    }

    try {
      setLoading(true);
      
      // Check if any books use this category
      const categoryToDelete = categories.find(c => c.id === id);
      const booksWithCategory = books.filter(book => book.book_category === categoryToDelete?.name);
      
      if (booksWithCategory.length > 0) {
        alert(`Cannot delete category. ${booksWithCategory.length} book(s) are using this category. Please reassign or delete those books first.`);
        setLoading(false);
        return;
      }

      await deleteDoc(doc(db, "categories", id));
      
      setCategories(categories.filter(cat => cat.id !== id));
      invalidateCache('categories');
      
      alert('Category deleted successfully!');
    } catch (error) {
      console.error('Error deleting category:', error);
      alert('Failed to delete category: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  // Handle image file selection
  const handleImageFileChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      // Validate file type
      if (!file.type.startsWith('image/')) {
        alert('Please select a valid image file');
        return;
      }
      
      // Validate file size (5MB)
      if (file.size > 5 * 1024 * 1024) {
        alert('Image size should be less than 5MB');
        return;
      }
      
      setImageFile(file);
      setBookForm({ ...bookForm, book_image_url: '' }); // Clear URL if file is selected
      
      // Create preview
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const startEditBook = (book) => {
    setEditingBook(book);
    setBookForm({
      title: book.title,
      description: book.description,
      book_category: book.book_category,
      book_url: book.book_url || '',
      book_image_url: book.book_image_url,
    });
    setImagePreview(book.book_image_url);
    setImageFile(null);
  };

  const resetBookForm = () => {
    setBookForm({
      title: '',
      description: '',
      book_category: '',
      book_url: '',
      book_image_url: '',
    });
    setEditingBook(null);
    setShowAddBook(false);
    setImageFile(null);
    setImagePreview('');
  };

  const startEditCategory = (category) => {
    setEditingCategory(category);
    setCategoryForm({ name: category.name });
  };

  const resetCategoryForm = () => {
    setCategoryForm({ name: '' });
    setEditingCategory(null);
    setShowAddCategory(false);
  };

  // Load data on mount
  useEffect(() => {
    const loadData = async () => {
      setInitialLoading(true);
      try {
        await Promise.all([loadCategories(), loadBooks()]);
      } catch (error) {
        console.error('Error loading data:', error);
      } finally {
        setInitialLoading(false);
      }
    };
    
    loadData();
  }, []);

  // Calculate books count for each category
  const getCategoryBooksCount = (categoryName) => {
    return books.filter(book => book.book_category === categoryName).length;
  };

  if (initialLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Loader className="w-12 h-12 text-orange-500 animate-spin mx-auto mb-4" />
          <p className="text-gray-600 font-semibold">Loading books and categories...</p>
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
              <h1 className="text-4xl font-black text-white mb-2">Books Management</h1>
              <p className="text-orange-100">Manage your books and categories with Firebase</p>
            </div>
            <BookOpen className="w-16 h-16 text-white opacity-50" />
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white border-b-2 border-gray-100 shadow-lg sticky top-0 z-40">
        <div className="container mx-auto px-4 max-w-7xl">
          <div className="flex gap-4">
            <button
              onClick={() => setActiveTab('books')}
              className={`px-6 py-4 font-bold border-b-4 transition-all ${
                activeTab === 'books'
                  ? 'border-orange-500 text-orange-600'
                  : 'border-transparent text-gray-600 hover:text-gray-900'
              }`}
            >
              Books ({books.length})
            </button>
            <button
              onClick={() => setActiveTab('categories')}
              className={`px-6 py-4 font-bold border-b-4 transition-all ${
                activeTab === 'categories'
                  ? 'border-orange-500 text-orange-600'
                  : 'border-transparent text-gray-600 hover:text-gray-900'
              }`}
            >
              Categories ({categories.length})
            </button>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 max-w-7xl py-8">
        {/* Books Tab */}
        {activeTab === 'books' && (
          <div>
            {/* Add Book Button */}
            <div className="flex justify-between items-center mb-8">
              <h2 className="text-3xl font-black text-gray-900">All Books</h2>
              <button
                onClick={() => setShowAddBook(true)}
                className={`inline-flex items-center gap-2 ${getButton('primary')} ${categories.length === 0 ? 'opacity-50 cursor-not-allowed' : ''}`}
                disabled={categories.length === 0}
              >
                <Plus className="w-5 h-5" />
                Add New Book
              </button>
            </div>

            {categories.length === 0 && (
              <div className="bg-yellow-50 border-2 border-yellow-300 rounded-xl p-4 mb-8">
                <p className="text-yellow-800 font-semibold">
                  ⚠️ Please add at least one category before adding books
                </p>
              </div>
            )}

            {/* Add/Edit Book Form */}
            {(showAddBook || editingBook) && (
              <div className={`${theme.cards.elevated} rounded-2xl p-8 mb-8`}>
                <div className="flex justify-between items-center mb-6">
                  <h3 className="text-2xl font-bold text-gray-900">
                    {editingBook ? 'Edit Book' : 'Add New Book'}
                  </h3>
                  <button
                    onClick={resetBookForm}
                    className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                  >
                    <X className="w-6 h-6" />
                  </button>
                </div>

                <div className="grid md:grid-cols-2 gap-6">
                  {/* Title */}
                  <div>
                    <label className="block text-sm font-bold text-gray-900 mb-2">
                      Book Title *
                    </label>
                    <input
                      type="text"
                      value={bookForm.title}
                      onChange={(e) => setBookForm({ ...bookForm, title: e.target.value })}
                      placeholder="Enter book title"
                      className="text-black w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-orange-500 focus:outline-none transition-colors"
                    />
                  </div>

                  {/* Category */}
                  <div>
                    <label className="block text-sm font-bold text-gray-900 mb-2">
                      Category *
                    </label>
                    <select
                      value={bookForm.book_category}
                      onChange={(e) => setBookForm({ ...bookForm, book_category: e.target.value })}
                      className="text-black w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-orange-500 focus:outline-none transition-colors"
                    >
                      <option value="">Select a category</option>
                      {categories.map(cat => (
                        <option key={cat.id} value={cat.name}>{cat.name}</option>
                      ))}
                    </select>
                  </div>

                  {/* Purchase URL */}
                  <div className="md:col-span-2">
                    <label className="block text-sm font-bold text-gray-900 mb-2">
                      Purchase URL (Optional)
                    </label>
                    <div className="relative">
                      <Link className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                      <input
                        type="url"
                        value={bookForm.book_url}
                        onChange={(e) => setBookForm({ ...bookForm, book_url: e.target.value })}
                        placeholder="https://example.com/purchase"
                        className="text-black w-full pl-12 pr-4 py-3 border-2 border-gray-200 rounded-xl focus:border-orange-500 focus:outline-none transition-colors"
                      />
                    </div>
                  </div>

                  {/* Description */}
                  <div className="md:col-span-2">
                    <label className="block text-sm font-bold text-gray-900 mb-2">
                      Description *
                    </label>
                    <textarea
                      value={bookForm.description}
                      onChange={(e) => setBookForm({ ...bookForm, description: e.target.value })}
                      placeholder="Enter book description"
                      rows={4}
                      className="text-black w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-orange-500 focus:outline-none transition-colors resize-none"
                    />
                  </div>

                  {/* Image Upload */}
                  <div className="md:col-span-2">
                    <label className="block text-sm font-bold text-gray-900 mb-2">
                      Book Cover Image *
                    </label>
                    
                    <div className="flex flex-col md:flex-row gap-4 items-start">
                      {/* File Upload */}
                      <div className="flex-1 w-full">
                        <label className="block w-full cursor-pointer">
                          <div className="border-2 border-dashed border-gray-300 rounded-xl p-6 hover:border-orange-500 transition-colors">
                            <div className="flex flex-col items-center">
                              <Upload className="w-10 h-10 text-gray-400 mb-2" />
                              <p className="text-sm font-bold text-gray-900 mb-1">
                                {uploadingImage ? 'Uploading...' : imageFile ? imageFile.name : 'Click to upload image'}
                              </p>
                              <p className="text-xs text-gray-500">PNG, JPG up to 5MB</p>
                            </div>
                          </div>
                          <input
                            type="file"
                            accept="image/*"
                            onChange={handleImageFileChange}
                            className="hidden"
                            disabled={uploadingImage}
                          />
                        </label>
                      </div>

                      {/* OR Divider */}
                      <div className="flex items-center justify-center">
                        <span className="text-gray-400 font-bold">OR</span>
                      </div>

                      {/* URL Input */}
                      <div className="flex-1 w-full">
                        <input
                          type="url"
                          value={bookForm.book_image_url}
                          onChange={(e) => {
                            setBookForm({ ...bookForm, book_image_url: e.target.value });
                            setImagePreview(e.target.value);
                            setImageFile(null);
                          }}
                          placeholder="Enter image URL"
                          disabled={!!imageFile}
                          className="text-black w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-orange-500 focus:outline-none transition-colors disabled:bg-gray-100 disabled:cursor-not-allowed"
                        />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Image Preview */}
                {imagePreview && (
                  <div className="mt-6">
                    <label className="block text-sm font-bold text-gray-900 mb-2">Preview</label>
                    <img
                      src={imagePreview}
                      alt="Preview"
                      className="w-48 h-64 object-cover rounded-xl shadow-lg"
                      onError={(e) => {
                        e.target.style.display = 'none';
                      }}
                    />
                  </div>
                )}

                {/* Action Buttons */}
                <div className="flex gap-4 mt-6">
                  <button
                    onClick={editingBook ? handleUpdateBook : handleAddBook}
                    disabled={loading || uploadingImage}
                    className={`inline-flex items-center gap-2 ${getButton('primary')} disabled:opacity-50 disabled:cursor-not-allowed`}
                  >
                    {loading || uploadingImage ? (
                      <Loader className="w-5 h-5 animate-spin" />
                    ) : (
                      <Save className="w-5 h-5" />
                    )}
                    {editingBook ? 'Update Book' : 'Add Book'}
                  </button>
                  <button
                    onClick={resetBookForm}
                    className={getButton('secondary')}
                  >
                    Cancel
                  </button>
                </div>
              </div>
            )}

            {/* Books Grid */}
            {books.length > 0 ? (
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {books.map((book) => (
                  <div key={book.id} className={`${theme.cards.elevated} rounded-2xl overflow-hidden hover:shadow-2xl transition-shadow`}>
                    <div className="relative h-64">
                      <img
                        src={book.book_image_url || 'https://via.placeholder.com/400x500?text=No+Image'}
                        alt={book.title}
                        className="text-black w-full h-full object-cover"
                      />
                      <div className="absolute top-4 left-4">
                        <span className="px-3 py-1 bg-white backdrop-blur-sm text-gray-900 text-xs font-bold rounded-full shadow-xl">
                          {book.book_category}
                        </span>
                      </div>
                    </div>

                    <div className="p-6">
                      <h3 className="text-xl font-bold text-gray-900 mb-2 line-clamp-2">
                        {book.title}
                      </h3>
                      <p className="text-gray-600 text-sm mb-4 line-clamp-3">
                        {book.description}
                      </p>
                      {book.book_url && (
                        <a 
                          href={book.book_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-xs text-orange-600 hover:text-orange-700 mb-4 block truncate"
                        >
                          🔗 Purchase Link
                        </a>
                      )}

                      <div className="flex gap-2 mt-4">
                        <button
                          onClick={() => startEditBook(book)}
                          className="flex-1 inline-flex items-center justify-center gap-2 bg-blue-500 hover:bg-blue-600 text-white rounded-xl py-2 px-4 font-bold transition-all"
                        >
                          <Edit2 className="w-4 h-4" />
                          Edit
                        </button>
                        <button
                          onClick={() => handleDeleteBook(book.id)}
                          className="flex-1 inline-flex items-center justify-center gap-2 bg-red-500 hover:bg-red-600 text-white rounded-xl py-2 px-4 font-bold transition-all"
                        >
                          <Trash2 className="w-4 h-4" />
                          Delete
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-20">
                <BookOpen className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-2xl font-bold text-gray-900 mb-2">No books yet</h3>
                <p className="text-gray-600 mb-6">Start by adding your first book to the collection</p>
                {categories.length > 0 && (
                  <button
                    onClick={() => setShowAddBook(true)}
                    className={`inline-flex items-center gap-2 ${getButton('primary')}`}
                  >
                    <Plus className="w-5 h-5" />
                    Add Your First Book
                  </button>
                )}
              </div>
            )}
          </div>
        )}

        {/* Categories Tab */}
        {activeTab === 'categories' && (
          <div>
            {/* Add Category Button */}
            <div className="flex justify-between items-center mb-8">
              <h2 className="text-3xl font-black text-gray-900">Manage Categories</h2>
              <button
                onClick={() => setShowAddCategory(true)}
                className={`inline-flex items-center gap-2 ${getButton('primary')}`}
              >
                <FolderPlus className="w-5 h-5" />
                Add New Category
              </button>
            </div>

            {/* Add/Edit Category Form */}
            {(showAddCategory || editingCategory) && (
              <div className={`${theme.cards.elevated} rounded-2xl p-8 mb-8`}>
                <div className="flex justify-between items-center mb-6">
                  <h3 className="text-2xl font-bold text-gray-900">
                    {editingCategory ? 'Edit Category' : 'Add New Category'}
                  </h3>
                  <button
                    onClick={resetCategoryForm}
                    className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                  >
                    <X className="w-6 h-6" />
                  </button>
                </div>

                <div className="max-w-md">
                  <label className="block text-sm font-bold text-gray-900 mb-2">
                    Category Name *
                  </label>
                  <input
                    type="text"
                    value={categoryForm.name}
                    onChange={(e) => setCategoryForm({ name: e.target.value })}
                    placeholder="Enter category name"
                    className="text-black w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-orange-500 focus:outline-none transition-colors mb-4"
                  />

                  <div className="flex gap-4">
                    <button
                      onClick={editingCategory ? handleUpdateCategory : handleAddCategory}
                      disabled={loading}
                      className={`inline-flex items-center gap-2 ${getButton('primary')} disabled:opacity-50 disabled:cursor-not-allowed`}
                    >
                      {loading ? (
                        <Loader className="w-5 h-5 animate-spin" />
                      ) : (
                        <Save className="w-5 h-5" />
                      )}
                      {editingCategory ? 'Update Category' : 'Add Category'}
                    </button>
                    <button
                      onClick={resetCategoryForm}
                      className={getButton('secondary')}
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Categories List */}
            {categories.length > 0 ? (
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {categories.map((category) => (
                  <div key={category.id} className={`${theme.cards.elevated} rounded-2xl p-6 hover:shadow-2xl transition-shadow`}>
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 bg-gradient-to-br from-orange-400 to-orange-600 rounded-xl flex items-center justify-center">
                          <Tag className="w-6 h-6 text-white" />
                        </div>
                        <div>
                          <h3 className="text-xl font-bold text-gray-900">
                            {category.name}
                          </h3>
                          <p className="text-sm text-gray-600">
                            {getCategoryBooksCount(category.name)} {getCategoryBooksCount(category.name) === 1 ? 'book' : 'books'}
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className="flex gap-2">
                      <button
                        onClick={() => startEditCategory(category)}
                        className="flex-1 inline-flex items-center justify-center gap-2 bg-blue-500 hover:bg-blue-600 text-white rounded-xl py-2 px-4 font-bold transition-all"
                      >
                        <Edit2 className="w-4 h-4" />
                        Edit
                      </button>
                      <button
                        onClick={() => handleDeleteCategory(category.id)}
                        className="flex-1 inline-flex items-center justify-center gap-2 bg-red-500 hover:bg-red-600 text-white rounded-xl py-2 px-4 font-bold transition-all"
                      >
                        <Trash2 className="w-4 h-4" />
                        Delete
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-20">
                <Tag className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-2xl font-bold text-gray-900 mb-2">No categories yet</h3>
                <p className="text-gray-600 mb-6">Start by adding your first category to organize your books</p>
                <button
                  onClick={() => setShowAddCategory(true)}
                  className={`inline-flex items-center gap-2 ${getButton('primary')}`}
                >
                  <FolderPlus className="w-5 h-5" />
                  Add Your First Category
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminBooksPage;