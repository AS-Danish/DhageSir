"use client";
import React, { useState, useEffect, Suspense } from 'react';
import { BookOpen, Search, ShoppingBag, ArrowRight, Loader } from 'lucide-react';
import { db } from '../../firebase/firebaseConfig';
import { collection, getDocs, query, orderBy } from 'firebase/firestore';
import { useSearchParams } from 'next/navigation';

// Theme configuration
const theme = {
  gradients: {
    primary: 'from-orange-500 to-orange-600',
    light: 'from-gray-50 to-gray-100',
    overlay: 'from-gray-900/80 via-gray-900/40 to-transparent',
  },
  backgrounds: {
    white: 'bg-white',
  },
  text: {
    primary: 'text-gray-900',
    secondary: 'text-gray-600',
    brand: 'text-orange-600',
  },
  cards: {
    elevated: 'bg-white shadow-xl hover:shadow-2xl',
  },
  shadows: {
    lg: 'shadow-xl',
  },
};

const getButton = (variant = 'primary') => {
  const variants = {
    primary: 'bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white rounded-xl py-4 px-8 font-bold transition-all hover:scale-105 hover:shadow-2xl',
  };
  return variants[variant];
};

// Separate component that uses useSearchParams
const BooksContent = () => {
  const searchParams = useSearchParams();
  const defaultCategory = searchParams.get('category') || 'All';

  const [selectedCategory, setSelectedCategory] = useState(defaultCategory);
  const [searchQuery, setSearchQuery] = useState('');
  const [books, setBooks] = useState([]);
  const [categories, setCategories] = useState(['All']);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchBooksFromFirebase();
    const urlCategory = searchParams.get('category');
    if (urlCategory) {
      setSelectedCategory(urlCategory);
    }
  }, [searchParams]);

  // Fetch books from Firebase with caching
  const fetchBooksFromFirebase = async () => {
    try {
      // Check cache first
      const cachedBooks = localStorage.getItem('all_books_cache');
      const cacheTimestamp = localStorage.getItem('all_books_cache_timestamp');
      
      // Use cache if it's less than 5 minutes old
      if (cachedBooks && cacheTimestamp) {
        const cacheAge = Date.now() - parseInt(cacheTimestamp);
        if (cacheAge < 5 * 60 * 1000) { // 5 minutes
          console.log('Loading all books from cache');
          const cachedData = JSON.parse(cachedBooks);
          setBooks(cachedData);
          extractCategories(cachedData);
          setLoading(false);
          // Still fetch in background to update cache
          fetchAndCacheBooks();
          return;
        }
      }
      
      // No valid cache, fetch from Firebase
      await fetchAndCacheBooks();
    } catch (err) {
      console.error('Error loading books:', err);
      setError('Failed to load books. Please try again later.');
      setLoading(false);
    }
  };

  // Fetch and cache books from Firebase
  const fetchAndCacheBooks = async () => {
    try {
      // Query all books ordered by creation date
      const booksQuery = query(
        collection(db, "books"),
        orderBy("created_at", "desc")
      );
      
      const querySnapshot = await getDocs(booksQuery);
      const booksData = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));

      // Update state
      setBooks(booksData);
      extractCategories(booksData);
      setLoading(false);

      // Cache the data
      localStorage.setItem('all_books_cache', JSON.stringify(booksData));
      localStorage.setItem('all_books_cache_timestamp', Date.now().toString());
      
      console.log('All books fetched and cached successfully');
    } catch (err) {
      console.error('Error fetching books from Firebase:', err);
      setError('Failed to load books from database.');
      setLoading(false);
    }
  };

  // Extract unique categories from books
  const extractCategories = (booksData) => {
    const uniqueCategories = ['All'];
    booksData.forEach(book => {
      if (book.book_category && !uniqueCategories.includes(book.book_category)) {
        uniqueCategories.push(book.book_category);
      }
    });
    setCategories(uniqueCategories);
  };

  // Handle book purchase click
  const handlePurchaseClick = (book) => {
    if (book.book_url) {
      window.open(book.book_url, '_blank', 'noopener,noreferrer');
    } else {
      alert('Purchase link not available for this book.');
    }
  };

  const filteredBooks = books.filter(book => {
    const matchesCategory = selectedCategory === 'All' || book.book_category === selectedCategory;
    const matchesSearch = book.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         book.description.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 pt-20">
        <div className="flex flex-col items-center justify-center py-40">
          <Loader className="w-16 h-16 text-orange-500 animate-spin mb-4" />
          <p className="text-gray-600 font-semibold text-lg">Loading books...</p>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 pt-20">
        <div className="flex flex-col items-center justify-center py-40">
          <BookOpen className="w-16 h-16 text-gray-300 mb-4" />
          <p className="text-red-600 font-semibold mb-4 text-lg">{error}</p>
          <button 
            onClick={fetchBooksFromFirebase}
            className={getButton('primary')}
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pt-20">
      {/* Filter Section */}
      <section className="py-8 bg-white border-b-2 border-gray-100 sticky top-0 z-40 shadow-lg">
        <div className="container mx-auto px-4 max-w-7xl">
          <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
            {/* Search */}
            <div className="relative w-full md:w-96">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Search books..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-12 pr-4 py-3 border-2 border-gray-200 rounded-xl focus:border-orange-500 focus:outline-none transition-colors text-black"
              />
            </div>

            {/* Category Filter */}
            <div className="flex gap-2 overflow-x-auto w-full md:w-auto pb-2 md:pb-0">
              {categories.map((category) => (
                <button
                  key={category}
                  onClick={() => setSelectedCategory(category)}
                  className={`px-6 py-3 rounded-xl font-bold whitespace-nowrap transition-all ${
                    selectedCategory === category
                      ? 'bg-gradient-to-r from-orange-500 to-orange-600 text-white shadow-xl'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {category}
                </button>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Books Grid */}
      <section className="py-16 md:py-20">
        <div className="container mx-auto px-4 max-w-7xl">
          <div className="flex items-center justify-between mb-8">
            <h2 className={`text-3xl md:text-4xl font-black ${theme.text.primary}`}>
              {selectedCategory === 'All' ? 'All Books' : selectedCategory}
              <span className={`${theme.text.brand} ml-2`}>({filteredBooks.length})</span>
            </h2>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {filteredBooks.map((book) => (
              <div key={book.id} className="group relative">
                <div className={`${theme.cards.elevated} rounded-2xl overflow-hidden transition-all duration-300 hover:-translate-y-2`}>
                  {/* Book Image */}
                  <div className="relative overflow-hidden h-72">
                    <img 
                      src={book.book_image_url || 'https://images.unsplash.com/photo-1589998059171-988d887df646?w=400&h=500&fit=crop'}
                      alt={book.title}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                      onError={(e) => {
                        e.target.src = 'https://images.unsplash.com/photo-1589998059171-988d887df646?w=400&h=500&fit=crop';
                      }}
                    />
                    <div className={`absolute inset-0 bg-gradient-to-t ${theme.gradients.overlay} opacity-0 group-hover:opacity-100 transition-opacity`}></div>
                    
                    {/* Category Badge */}
                    <div className="absolute top-4 left-4">
                      <span className={`px-3 py-1 ${theme.backgrounds.white} backdrop-blur-sm ${theme.text.primary} text-xs font-bold rounded-full ${theme.shadows.lg}`}>
                        {book.book_category || 'General'}
                      </span>
                    </div>
                  </div>

                  {/* Book Info */}
                  <div className="p-6">
                    <h3 className={`text-xl font-bold ${theme.text.primary} mb-3 line-clamp-2 min-h-[56px]`}>
                      {book.title}
                    </h3>
                    <p className={`${theme.text.secondary} text-sm leading-relaxed mb-5 line-clamp-3`}>
                      {book.description}
                    </p>
                    
                    {/* Purchase Button */}
                    <button 
                      onClick={() => handlePurchaseClick(book)}
                      className={`w-full inline-flex items-center justify-center gap-2 ${getButton('primary')} py-3`}
                    >
                      <ShoppingBag className="w-5 h-5" />
                      Purchase Book
                      <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                    </button>
                  </div>

                  {/* Decorative Corner */}
                  <div className="absolute bottom-0 right-0 w-20 h-20 bg-gradient-to-tl from-orange-600/10 to-transparent rounded-tl-full opacity-0 group-hover:opacity-100 transition-opacity"></div>
                </div>
              </div>
            ))}
          </div>

          {/* Empty State */}
          {filteredBooks.length === 0 && (
            <div className="text-center py-20">
              <BookOpen className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-2xl font-bold text-gray-900 mb-2">No books found</h3>
              <p className="text-gray-600">Try adjusting your search or filter criteria</p>
            </div>
          )}
        </div>
      </section>
    </div>
  );
};

// Main component with Suspense boundary
const BooksPage = () => {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gray-50 pt-20">
        <div className="flex flex-col items-center justify-center py-40">
          <Loader className="w-16 h-16 text-orange-500 animate-spin mb-4" />
          <p className="text-gray-600 font-semibold text-lg">Loading books...</p>
        </div>
      </div>
    }>
      <BooksContent />
    </Suspense>
  );
};

export default BooksPage;