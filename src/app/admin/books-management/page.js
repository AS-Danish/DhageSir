"use client";
import React, { useState, useEffect } from "react";
import {
  BookOpen,
  Plus,
  Edit2,
  Trash2,
  X,
  Save,
  Upload,
  Link,
  FolderPlus,
  Tag,
  Loader,
  Star,
  Video,
} from "lucide-react";
import { db, storage } from "../../../firebase/firebaseConfig";
import {
  collection,
  getDocs,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
  query,
  orderBy,
  setDoc,
  getDoc,
} from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";

// Theme configuration
const theme = {
  gradients: {
    primary: "from-orange-500 to-orange-600",
  },
  cards: {
    elevated: "bg-white shadow-xl",
  },
};

const getButton = (variant = "primary") => {
  const variants = {
    primary:
      "bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white rounded-xl py-3 px-6 font-bold transition-all hover:scale-105 hover:shadow-2xl",
    secondary:
      "bg-gray-100 hover:bg-gray-200 text-gray-900 rounded-xl py-3 px-6 font-bold transition-all",
    danger:
      "bg-red-500 hover:bg-red-600 text-white rounded-xl py-3 px-6 font-bold transition-all",
    success:
      "bg-green-500 hover:bg-green-600 text-white rounded-xl py-3 px-6 font-bold transition-all",
  };
  return variants[variant];
};

const AdminBooksPage = () => {
  const [activeTab, setActiveTab] = useState("books");
  const [showAddBook, setShowAddBook] = useState(false);
  const [showAddCategory, setShowAddCategory] = useState(false);
  const [editingBook, setEditingBook] = useState(null);
  const [editingCategory, setEditingCategory] = useState(null);
  const [loading, setLoading] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);

  const [books, setBooks] = useState([]);
  const [categories, setCategories] = useState([]);

  const [homepageBooks, setHomepageBooks] = useState([]);

  const [bookForm, setBookForm] = useState({
    title: "",
    description: "",
    book_category: "",
    book_url: "",
    promo_video_url: "",
    book_image_url: "",
  });

  const [categoryForm, setCategoryForm] = useState({
    name: "",
  });

  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState("");

  const [videoFile, setVideoFile] = useState(null);
  const [uploadingVideo, setUploadingVideo] = useState(false);
  const [videoPreview, setVideoPreview] = useState("");

  const invalidateCache = (type) => {
    if (type === "books" || type === "all") {
      localStorage.removeItem("books_cache");
      localStorage.removeItem("books_cache_timestamp");
    }
    if (type === "categories" || type === "all") {
      localStorage.removeItem("categories_cache");
      localStorage.removeItem("categories_cache_timestamp");
    }
  };

  const fetchAndCacheCategories = async () => {
    const q = query(collection(db, "categories"), orderBy("created_at", "desc"));
    const querySnapshot = await getDocs(q);
    const categoriesData = querySnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));

    setCategories(categoriesData);

    localStorage.setItem("categories_cache", JSON.stringify(categoriesData));
    localStorage.setItem("categories_cache_timestamp", Date.now().toString());
  };

  const loadCategories = async () => {
    try {
      const cachedCategories = localStorage.getItem("categories_cache");
      const cacheTimestamp = localStorage.getItem("categories_cache_timestamp");

      if (cachedCategories && cacheTimestamp) {
        const cacheAge = Date.now() - parseInt(cacheTimestamp);
        if (cacheAge < 5 * 60 * 1000) {
          setCategories(JSON.parse(cachedCategories));
          fetchAndCacheCategories();
          return;
        }
      }

      await fetchAndCacheCategories();
    } catch (error) {
      console.error("Error loading categories:", error);
      alert("Failed to load categories: " + error.message);
    }
  };

  const fetchAndCacheBooks = async () => {
    const q = query(collection(db, "books"), orderBy("created_at", "desc"));
    const querySnapshot = await getDocs(q);
    const booksData = querySnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));

    setBooks(booksData);

    localStorage.setItem("books_cache", JSON.stringify(booksData));
    localStorage.setItem("books_cache_timestamp", Date.now().toString());
  };

  const loadBooks = async () => {
    try {
      const cachedBooks = localStorage.getItem("books_cache");
      const cacheTimestamp = localStorage.getItem("books_cache_timestamp");

      if (cachedBooks && cacheTimestamp) {
        const cacheAge = Date.now() - parseInt(cacheTimestamp);
        if (cacheAge < 5 * 60 * 1000) {
          setBooks(JSON.parse(cachedBooks));
          fetchAndCacheBooks();
          return;
        }
      }

      await fetchAndCacheBooks();
    } catch (error) {
      console.error("Error loading books:", error);
      alert("Failed to load books: " + error.message);
    }
  };

  const uploadImage = async (file) => {
    try {
      setUploadingImage(true);

      const timestamp = Date.now();
      const sanitizedFileName = file.name.replace(/[^a-zA-Z0-9.]/g, "_");
      const fileName = `${timestamp}_${sanitizedFileName}`;
      const storageRef = ref(storage, `book-images/${fileName}`);

      const snapshot = await uploadBytes(storageRef, file);
      const downloadURL = await getDownloadURL(snapshot.ref);

      return downloadURL;
    } catch (error) {
      console.error("Error uploading image:", error);
      alert("Failed to upload image: " + error.message);
      throw error;
    } finally {
      setUploadingImage(false);
    }
  };

  const uploadVideo = async (file) => {
    try {
      setUploadingVideo(true);

      const timestamp = Date.now();
      const sanitizedFileName = file.name.replace(/[^a-zA-Z0-9.]/g, "_");
      const fileName = `${timestamp}_${sanitizedFileName}`;
      const storageRef = ref(storage, `book-videos/${fileName}`);

      const snapshot = await uploadBytes(storageRef, file);
      const downloadURL = await getDownloadURL(snapshot.ref);

      return downloadURL;
    } catch (error) {
      console.error("Error uploading video:", error);
      alert("Failed to upload video: " + error.message);
      throw error;
    } finally {
      setUploadingVideo(false);
    }
  };

  const updateNewsTicker = async (newBook) => {
    try {
      const tickerDocRef = doc(db, "news_ticker", "latest");
      const tickerSnapshot = await getDoc(tickerDocRef);

      let tickerData = {
        latest_article_title: "",
        latest_article_url: "",
        second_article_title: "",
        second_article_url: "",
        latest_book_title: "",
        latest_book_url: "",
        second_book_title: "",
        second_book_url: "",
      };

      if (tickerSnapshot.exists()) {
        tickerData = { ...tickerData, ...tickerSnapshot.data() };
      }

      tickerData.second_book_title = tickerData.latest_book_title;
      tickerData.second_book_url = tickerData.latest_book_url;

      tickerData.latest_book_title = newBook.title;
      tickerData.latest_book_url = newBook.book_url || "";

      await setDoc(tickerDocRef, tickerData);
    } catch (error) {
      console.error("Error updating news ticker (books):", error);
    }
  };

  const handleAddBook = async () => {
    if (!bookForm.title || !bookForm.description || !bookForm.book_category) {
      alert("Please fill in all required fields (Title, Description, Category)");
      return;
    }

    try {
      setLoading(true);

      let imageUrl = bookForm.book_image_url;

      if (imageFile) {
        imageUrl = await uploadImage(imageFile);
      }

      if (!imageUrl) {
        alert("Please provide a book cover image (upload or URL)");
        setLoading(false);
        return;
      }

      let videoUrl = bookForm.promo_video_url;

      if (videoFile) {
        videoUrl = await uploadVideo(videoFile);
      }

      const bookData = {
        title: bookForm.title,
        description: bookForm.description,
        book_category: bookForm.book_category,
        book_url: bookForm.book_url || "",
        promo_video_url: videoUrl || "",
        book_image_url: imageUrl,
        created_at: new Date().toISOString(),
      };

      const docRef = await addDoc(collection(db, "books"), bookData);
      const newBook = { id: docRef.id, ...bookData };

      await updateNewsTicker(newBook);

      setBooks([newBook, ...books]);
      invalidateCache("books");

      resetBookForm();
      setShowAddBook(false);
      alert("Book added successfully!");
    } catch (error) {
      console.error("Error adding book:", error);
      alert("Failed to add book: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateBook = async () => {
    if (!bookForm.title || !bookForm.description || !bookForm.book_category) {
      alert("Please fill in all required fields (Title, Description, Category)");
      return;
    }

    try {
      setLoading(true);

      let imageUrl = bookForm.book_image_url;

      if (imageFile) {
        imageUrl = await uploadImage(imageFile);
      }

      let videoUrl = bookForm.promo_video_url;

      if (videoFile) {
        videoUrl = await uploadVideo(videoFile);
      }

      const bookData = {
        title: bookForm.title,
        description: bookForm.description,
        book_category: bookForm.book_category,
        book_url: bookForm.book_url || "",
        promo_video_url: videoUrl || "",
        book_image_url: imageUrl,
        updated_at: new Date().toISOString(),
      };

      await updateDoc(doc(db, "books", editingBook.id), bookData);

      const updatedBook = { id: editingBook.id, ...editingBook, ...bookData };

      await updateNewsTicker(updatedBook);

      setBooks(
        books.map((book) =>
          book.id === editingBook.id ? { ...book, ...bookData } : book
        )
      );
      invalidateCache("books");

      resetBookForm();
      setEditingBook(null);
      alert("Book updated successfully!");
    } catch (error) {
      console.error("Error updating book:", error);
      alert("Failed to update book: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteBook = async (id) => {
    if (!window.confirm("Are you sure you want to delete this book?")) {
      return;
    }

    try {
      setLoading(true);

      await deleteDoc(doc(db, "books", id));

      setBooks(books.filter((book) => book.id !== id));
      invalidateCache("books");

      alert("Book deleted successfully!");
    } catch (error) {
      console.error("Error deleting book:", error);
      alert("Failed to delete book: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleAddCategory = async () => {
    if (!categoryForm.name.trim()) {
      alert("Please enter a category name");
      return;
    }

    const isDuplicate = categories.some(
      (cat) =>
        cat.name.toLowerCase() === categoryForm.name.trim().toLowerCase()
    );

    if (isDuplicate) {
      alert("A category with this name already exists");
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
      invalidateCache("categories");

      resetCategoryForm();
      setShowAddCategory(false);
      alert("Category added successfully!");
    } catch (error) {
      console.error("Error adding category:", error);
      alert("Failed to add category: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateCategory = async () => {
    if (!categoryForm.name.trim()) {
      alert("Please enter a category name");
      return;
    }

    const isDuplicate = categories.some(
      (cat) =>
        cat.id !== editingCategory.id &&
        cat.name.toLowerCase() === categoryForm.name.trim().toLowerCase()
    );

    if (isDuplicate) {
      alert("A category with this name already exists");
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

      const booksToUpdate = books.filter(
        (book) => book.book_category === oldCategoryName
      );

      for (const book of booksToUpdate) {
        await updateDoc(doc(db, "books", book.id), {
          book_category: newCategoryName,
          updated_at: new Date().toISOString(),
        });
      }

      setCategories(
        categories.map((cat) =>
          cat.id === editingCategory.id ? { ...cat, ...categoryData } : cat
        )
      );

      setBooks(
        books.map((book) =>
          book.book_category === oldCategoryName
            ? { ...book, book_category: newCategoryName }
            : book
        )
      );

      invalidateCache("all");

      resetCategoryForm();
      setEditingCategory(null);
      alert("Category updated successfully!");
    } catch (error) {
      console.error("Error updating category:", error);
      alert("Failed to update category: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteCategory = async (id) => {
    if (!window.confirm("Are you sure you want to delete this category?")) {
      return;
    }

    try {
      setLoading(true);

      const categoryToDelete = categories.find((c) => c.id === id);
      const booksWithCategory = books.filter(
        (book) => book.book_category === categoryToDelete?.name
      );

      if (booksWithCategory.length > 0) {
        alert(
          `Cannot delete category. ${booksWithCategory.length} book(s) are using this category.`
        );
        setLoading(false);
        return;
      }

      await deleteDoc(doc(db, "categories", id));

      setCategories(categories.filter((cat) => cat.id !== id));
      invalidateCache("categories");

      alert("Category deleted successfully!");
    } catch (error) {
      console.error("Error deleting category:", error);
      alert("Failed to delete category: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleImageFileChange = (e) => {
    const file = e.target.files?.[0];

    if (file) {
      if (!file.type.startsWith("image/")) {
        alert("Please select a valid image file");
        return;
      }

      if (file.size > 5 * 1024 * 1024) {
        alert("Image size should be less than 5MB");
        return;
      }

      setImageFile(file);
      setBookForm({ ...bookForm, book_image_url: "" });

      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result.toString());
      };
      reader.readAsDataURL(file);
    }
  };

  const handleVideoFileChange = (e) => {
    const file = e.target.files?.[0];

    if (file) {
      if (!file.type.startsWith("video/")) {
        alert("Please select a valid video file");
        return;
      }

      setVideoFile(file);
      setBookForm({ ...bookForm, promo_video_url: "" });

      const reader = new FileReader();
      reader.onloadend = () => {
        setVideoPreview(reader.result.toString());
      };
      reader.readAsDataURL(file);
    }
  };

  const handleDisplayOnHomepage = async (book) => {
    const isOnHomepage = homepageBooks.some((b) => b.id === book.id);

    const confirmMessage = isOnHomepage
      ? "Remove this book from homepage promo display?"
      : "Display this book on the homepage for promotion?";

    if (!window.confirm(confirmMessage)) {
      return;
    }

    try {
      setLoading(true);

      const homepageDocRef = doc(db, "homepage", "homepage");
      const homepageSnapshot = await getDoc(homepageDocRef);
      const existingData = homepageSnapshot.exists()
        ? homepageSnapshot.data()
        : {};

      const currentHomepageBooks = existingData.books || [];
      let updatedBooks;

      if (isOnHomepage) {
        updatedBooks = currentHomepageBooks.filter((b) => b.id !== book.id);
      } else {
        const bookData = {
          id: book.id,
          title: book.title,
          book_url: book.book_url,
          promo_video_url: book.promo_video_url || "",
          book_category: book.book_category,
          book_image_url: book.book_image_url,
          description: book.description,
          added_at: new Date().toISOString(),
        };
        updatedBooks = [...currentHomepageBooks, bookData];
      }

      await setDoc(homepageDocRef, {
        ...existingData,
        books: updatedBooks,
        updated_at: new Date().toISOString(),
      });

      setHomepageBooks(updatedBooks);

      alert(
        isOnHomepage
          ? "Book removed from homepage promo!"
          : "Book added to homepage promo display!"
      );
    } catch (error) {
      console.error("Error updating homepage book:", error);
      alert("Failed to update homepage book: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  const startEditBook = (book) => {
    setEditingBook(book);
    setBookForm({
      title: book.title,
      description: book.description,
      book_category: book.book_category,
      book_url: book.book_url || "",
      promo_video_url: book.promo_video_url || "",
      book_image_url: book.book_image_url,
    });
    setImagePreview(book.book_image_url);
    setImageFile(null);
    setVideoFile(null);
    setVideoPreview(book.promo_video_url || "");
  };

  const resetBookForm = () => {
    setBookForm({
      title: "",
      description: "",
      book_category: "",
      book_url: "",
      promo_video_url: "",
      book_image_url: "",
    });
    setEditingBook(null);
    setShowAddBook(false);
    setImageFile(null);
    setImagePreview("");
    setVideoFile(null);
    setVideoPreview("");
  };

  const startEditCategory = (category) => {
    setEditingCategory(category);
    setCategoryForm({ name: category.name });
  };

  const resetCategoryForm = () => {
    setCategoryForm({ name: "" });
    setEditingCategory(null);
    setShowAddCategory(false);
  };

  useEffect(() => {
    const loadData = async () => {
      setInitialLoading(true);
      try {
        await Promise.all([loadCategories(), loadBooks()]);

        const homepageDoc = await getDoc(doc(db, "homepage", "homepage"));
        if (homepageDoc.exists()) {
          const data = homepageDoc.data();
          setHomepageBooks(data.books || []);
        }
      } catch (error) {
        console.error("Error loading data:", error);
      } finally {
        setInitialLoading(false);
      }
    };

    loadData();
  }, []);

  const getCategoryBooksCount = (categoryName) => {
    return books.filter((book) => book.book_category === categoryName).length;
  };

  if (initialLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Loader className="w-12 h-12 text-orange-500 animate-spin mx-auto mb-4" />
          <p className="text-gray-600 font-semibold">
            Loading books and categories...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {loading && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center">
          <div className="bg-white rounded-2xl p-8 flex flex-col items-center">
            <Loader className="w-12 h-12 text-orange-500 animate-spin mb-4" />
            <p className="text-gray-900 font-bold">Processing...</p>
          </div>
        </div>
      )}

      <div className={`bg-gradient-to-r ${theme.gradients.primary} py-8 shadow-xl`}>
        <div className="container mx-auto px-4 max-w-7xl">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-4xl font-black text-white mb-2">
                Books Management
              </h1>
              <p className="text-orange-100">
                Manage your books and categories with Firebase
              </p>
            </div>
            <BookOpen className="w-16 h-16 text-white opacity-50" />
          </div>
        </div>
      </div>

      <div className="bg-white border-b-2 border-gray-100 shadow-lg sticky top-0 z-40">
        <div className="container mx-auto px-4 max-w-7xl">
          <div className="flex gap-4">
            <button
              onClick={() => setActiveTab("books")}
              className={`px-6 py-4 font-bold border-b-4 transition-all ${activeTab === "books"
                ? "border-orange-500 text-orange-600"
                : "border-transparent text-gray-600 hover:text-gray-900"
                }`}
            >
              Books ({books.length})
            </button>
            <button
              onClick={() => setActiveTab("categories")}
              className={`px-6 py-4 font-bold border-b-4 transition-all ${activeTab === "categories"
                ? "border-orange-500 text-orange-600"
                : "border-transparent text-gray-600 hover:text-gray-900"
                }`}
            >
              Categories ({categories.length})
            </button>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 max-w-7xl py-8">
        {activeTab === "books" && (
          <div>
            <div className="flex justify-between items-center mb-8">
              <h2 className="text-3xl font-black text-gray-900">All Books</h2>
              <button
                onClick={() => setShowAddBook(true)}
                className={`inline-flex items-center gap-2 ${getButton(
                  "primary"
                )} ${categories.length === 0 ? "opacity-50 cursor-not-allowed" : ""}`}
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

            {(showAddBook || editingBook) && (
              <div className={`${theme.cards.elevated} rounded-2xl p-8 mb-8`}>
                <div className="flex justify-between items-center mb-6">
                  <h3 className="text-2xl font-bold text-gray-900">
                    {editingBook ? "Edit Book" : "Add New Book"}
                  </h3>
                  <button
                    onClick={resetBookForm}
                    className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                  >
                    <X className="w-6 h-6" />
                  </button>
                </div>

                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-bold text-gray-900 mb-2">
                      Book Title *
                    </label>
                    <input
                      type="text"
                      value={bookForm.title}
                      onChange={(e) =>
                        setBookForm({ ...bookForm, title: e.target.value })
                      }
                      placeholder="Enter book title"
                      className="text-black w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-orange-500 focus:outline-none transition-colors"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-bold text-gray-900 mb-2">
                      Category *
                    </label>
                    <select
                      value={bookForm.book_category}
                      onChange={(e) =>
                        setBookForm({ ...bookForm, book_category: e.target.value })
                      }
                      className="text-black w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-orange-500 focus:outline-none transition-colors"
                    >
                      <option value="">Select a category</option>
                      {categories.map((cat) => (
                        <option key={cat.id} value={cat.name}>
                          {cat.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="md:col-span-2">
                    <label className="block text-sm font-bold text-gray-900 mb-2">
                      Purchase URL (Optional)
                    </label>
                    <div className="relative">
                      <Link className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                      <input
                        type="url"
                        value={bookForm.book_url}
                        onChange={(e) =>
                          setBookForm({ ...bookForm, book_url: e.target.value })
                        }
                        placeholder="https://example.com/purchase"
                        className="text-black w-full pl-12 pr-4 py-3 border-2 border-gray-200 rounded-xl focus:border-orange-500 focus:outline-none transition-colors"
                      />
                    </div>
                  </div>

                  <div className="md:col-span-2">
                    <label className="block text-sm font-bold text-gray-900 mb-2">
                      Promo Video (Optional)
                    </label>

                    <div className="flex flex-col md:flex-row gap-4 items-start">
                      <div className="flex-1 w-full">
                        <label className="block w-full cursor-pointer">
                          <div className="border-2 border-dashed border-gray-300 rounded-xl p-6 hover:border-orange-500 transition-colors">
                            <div className="flex flex-col items-center">
                              <Upload className="w-10 h-10 text-gray-400 mb-2" />
                              <p className="text-sm font-bold text-gray-900 mb-1">
                                {uploadingVideo
                                  ? "Uploading video..."
                                  : videoFile
                                    ? videoFile.name
                                    : "Click to upload promo video"}
                              </p>
                              <p className="text-xs text-gray-500">MP4, MOV, AVI (any size)</p>
                            </div>
                          </div>
                          <input
                            type="file"
                            accept="video/*"
                            onChange={handleVideoFileChange}
                            className="hidden"
                            disabled={uploadingVideo || !!bookForm.promo_video_url}
                          />
                        </label>
                      </div>

                      <div className="flex items-center justify-center">
                        <span className="text-gray-400 font-bold">OR</span>
                      </div>

                      <div className="flex-1 w-full">
                        <input
                          type="url"
                          value={bookForm.promo_video_url}
                          onChange={(e) => {
                            setBookForm({ ...bookForm, promo_video_url: e.target.value });
                            setVideoPreview(e.target.value);
                            setVideoFile(null);
                          }}
                          placeholder="Enter video URL"
                          disabled={!!videoFile}
                          className="text-black w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-orange-500 focus:outline-none transition-colors disabled:bg-gray-100 disabled:cursor-not-allowed"
                        />
                      </div>
                    </div>

                    {(videoFile || bookForm.promo_video_url) && (
                      <button
                        onClick={() => {
                          setVideoFile(null);
                          setVideoPreview("");
                          setBookForm({ ...bookForm, promo_video_url: "" });
                        }}
                        className="mt-2 text-sm text-red-600 hover:text-red-700"
                      >
                        Remove video
                      </button>
                    )}
                  </div>

                  <div className="md:col-span-2">
                    <label className="block text-sm font-bold text-gray-900 mb-2">
                      Description *
                    </label>
                    <textarea
                      value={bookForm.description}
                      onChange={(e) =>
                        setBookForm({ ...bookForm, description: e.target.value })
                      }
                      placeholder="Enter book description"
                      rows={4}
                      className="text-black w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-orange-500 focus:outline-none transition-colors resize-none"
                    />
                  </div>

                  <div className="md:col-span-2">
                    <label className="block text-sm font-bold text-gray-900 mb-2">
                      Book Cover Image *
                    </label>

                    <div className="flex flex-col md:flex-row gap-4 items-start">
                      <div className="flex-1 w-full">
                        <label className="block w-full cursor-pointer">
                          <div className="border-2 border-dashed border-gray-300 rounded-xl p-6 hover:border-orange-500 transition-colors">
                            <div className="flex flex-col items-center">
                              <Upload className="w-10 h-10 text-gray-400 mb-2" />
                              <p className="text-sm font-bold text-gray-900 mb-1">
                                {uploadingImage
                                  ? "Uploading..."
                                  : imageFile
                                    ? imageFile.name
                                    : "Click to upload image"}
                              </p>
                              <p className="text-xs text-gray-500">
                                PNG, JPG up to 5MB
                              </p>
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

                      <div className="flex items-center justify-center">
                        <span className="text-gray-400 font-bold">OR</span>
                      </div>

                      <div className="flex-1 w-full">
                        <input
                          type="url"
                          value={bookForm.book_image_url}
                          onChange={(e) => {
                            setBookForm({
                              ...bookForm,
                              book_image_url: e.target.value,
                            });
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

                {imagePreview && (
                  <div className="mt-6">
                    <label className="block text-sm font-bold text-gray-900 mb-2">
                      Preview
                    </label>
                    <img
                      src={imagePreview}
                      alt="Preview"
                      className="w-48 h-64 object-cover rounded-xl shadow-lg"
                      onError={(e) => (e.currentTarget.style.display = "none")}
                    />
                  </div>
                )}

                <div className="flex gap-4 mt-6">
                  <button
                    onClick={editingBook ? handleUpdateBook : handleAddBook}
                    disabled={loading || uploadingImage || uploadingVideo}
                    className={`inline-flex items-center gap-2 ${getButton(
                      "primary"
                    )} disabled:opacity-50 disabled:cursor-not-allowed`}
                  >
                    {loading || uploadingImage || uploadingVideo ? (
                      <Loader className="w-5 h-5 animate-spin" />
                    ) : (
                      <Save className="w-5 h-5" />
                    )}
                    {editingBook ? "Update Book" : "Add Book"}
                  </button>
                  <button
                    onClick={resetBookForm}
                    className={getButton("secondary")}
                  >
                    Cancel
                  </button>
                </div>
              </div>
            )}

            {books.length > 0 ? (
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {books.map((book) => {
                  const isOnHomepage = homepageBooks.some(
                    (b) => b.id === book.id
                  );
                  return (
                    <div
                      key={book.id}
                      className={`${theme.cards.elevated} rounded-2xl overflow-hidden hover:shadow-2xl transition-shadow`}
                    >
                      <div className="relative h-64">
                        <img
                          src={
                            book.book_image_url ||
                            "https://via.placeholder.com/400x500?text=No+Image"
                          }
                          alt={book.title}
                          className="w-full h-full object-cover"
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
                            className="text-xs text-orange-600 hover:text-orange-700 mb-2 block truncate"
                          >
                            🔗 Purchase Link
                          </a>
                        )}

                        {book.promo_video_url && (
                          <a
                            href={book.promo_video_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-xs text-blue-600 hover:text-blue-700 mb-4 block truncate"
                          >
                            ▶️ Promo Video
                          </a>
                        )}

                        <div className="flex flex-wrap gap-2 mt-4">
                          <button
                            onClick={() => startEditBook(book)}
                            className="flex-1 min-w-[100px] inline-flex items-center justify-center gap-2 bg-blue-500 hover:bg-blue-600 text-white rounded-xl py-2 px-4 font-bold transition-all"
                          >
                            <Edit2 className="w-4 h-4" />
                            Edit
                          </button>

                          <button
                            onClick={() => handleDeleteBook(book.id)}
                            className="flex-1 min-w-[100px] inline-flex items-center justify-center gap-2 bg-red-500 hover:bg-red-600 text-white rounded-xl py-2 px-4 font-bold transition-all"
                          >
                            <Trash2 className="w-4 h-4" />
                            Delete
                          </button>

                          <button
                            onClick={() => handleDisplayOnHomepage(book)}
                            className={`flex-1 min-w-[100px] inline-flex items-center justify-center gap-2 ${isOnHomepage
                              ? "bg-red-500 hover:bg-red-600"
                              : "bg-green-500 hover:bg-green-600"
                              } text-white rounded-xl py-2 px-4 font-bold transition-all`}
                          >
                            {isOnHomepage ? (
                              <>
                                <X className="w-4 h-4" />
                                Remove
                              </>
                            ) : (
                              <>
                                <Star className="w-4 h-4" />
                                Display
                              </>
                            )}
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="text-center py-20">
                <BookOpen className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-2xl font-bold text-gray-900 mb-2">
                  No books yet
                </h3>
                <p className="text-gray-600 mb-6">
                  Start by adding your first book to the collection
                </p>
                {categories.length > 0 && (
                  <button
                    onClick={() => setShowAddBook(true)}
                    className={`inline-flex items-center gap-2 ${getButton(
                      "primary"
                    )}`}
                  >
                    <Plus className="w-5 h-5" />
                    Add Your First Book
                  </button>
                )}
              </div>
            )}
          </div>
        )}

        {activeTab === "categories" && (
          <div>
            <div className="flex justify-between items-center mb-8">
              <h2 className="text-3xl font-black text-gray-900">
                Manage Categories
              </h2>
              <button
                onClick={() => setShowAddCategory(true)}
                className={`inline-flex items-center gap-2 ${getButton(
                  "primary"
                )}`}
              >
                <FolderPlus className="w-5 h-5" />
                Add New Category
              </button>
            </div>

            {(showAddCategory || editingCategory) && (
              <div className={`${theme.cards.elevated} rounded-2xl p-8 mb-8`}>
                <div className="flex justify-between items-center mb-6">
                  <h3 className="text-2xl font-bold text-gray-900">
                    {editingCategory ? "Edit Category" : "Add New Category"}
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
                    onChange={(e) =>
                      setCategoryForm({ name: e.target.value })
                    }
                    placeholder="Enter category name"
                    className="text-black w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-orange-500 focus:outline-none transition-colors mb-4"
                  />

                  <div className="flex gap-4">
                    <button
                      onClick={
                        editingCategory ? handleUpdateCategory : handleAddCategory
                      }
                      disabled={loading}
                      className={`inline-flex items-center gap-2 ${getButton(
                        "primary"
                      )} disabled:opacity-50 disabled:cursor-not-allowed`}
                    >
                      {loading ? (
                        <Loader className="w-5 h-5 animate-spin" />
                      ) : (
                        <Save className="w-5 h-5" />
                      )}
                      {editingCategory ? "Update Category" : "Add Category"}
                    </button>
                    <button
                      onClick={resetCategoryForm}
                      className={getButton("secondary")}
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              </div>
            )}

            {categories.length > 0 ? (
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {categories.map((category) => (
                  <div
                    key={category.id}
                    className={`${theme.cards.elevated} rounded-2xl p-6 hover:shadow-2xl transition-shadow`}
                  >
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
                            {getCategoryBooksCount(category.name)}{" "}
                            {getCategoryBooksCount(category.name) === 1
                              ? "book"
                              : "books"}
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
                <h3 className="text-2xl font-bold text-gray-900 mb-2">
                  No categories yet
                </h3>
                <p className="text-gray-600 mb-6">
                  Start by adding your first category to organize your books
                </p>
                <button
                  onClick={() => setShowAddCategory(true)}
                  className={`inline-flex items-center gap-2 ${getButton(
                    "primary"
                  )}`}
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
