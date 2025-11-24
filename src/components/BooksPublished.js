import React, { useState, useEffect } from 'react';
import { BookOpen, Star, ArrowRight, Library, Loader } from 'lucide-react';
import { db } from '../firebase/firebaseConfig';
import { collection, getDocs, query, orderBy, limit } from 'firebase/firestore';

// Theme configuration
const theme = {
  gradients: {
    light: 'from-orange-50 to-white',
    primary: 'from-orange-500 to-orange-600',
    overlay: 'from-transparent via-orange-900/20 to-orange-900/80'
  },
  backgrounds: {
    primary: 'bg-orange-500',
    white: 'bg-white/90'
  },
  text: {
    primary: 'text-gray-900',
    secondary: 'text-gray-600',
    brand: 'text-orange-600'
  },
  cards: {
    elevated: 'bg-white shadow-xl'
  },
  shadows: {
    lg: 'shadow-lg'
  },
  badges: {
    primary: 'bg-orange-100 text-orange-600'
  }
};

const getButton = (variant = 'primary') => {
  const variants = {
    primary: 'bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white rounded-xl py-3 px-6 font-bold transition-all hover:scale-105 hover:shadow-2xl'
  };
  return variants[variant];
};

const BooksSection = () => {
  const [books, setBooks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Truncate description to specified word count
  const truncateDescription = (text, wordLimit = 20) => {
    if (!text) return '';
    const words = text.split(' ');
    if (words.length <= wordLimit) return text;
    return words.slice(0, wordLimit).join(' ') + '...';
  };

  // Fetch books from Firebase with caching
  const fetchBooksFromFirebase = async () => {
    try {
      // Check cache first
      const cachedBooks = localStorage.getItem('books_section_cache');
      const cacheTimestamp = localStorage.getItem('books_section_cache_timestamp');
      
      // Use cache if it's less than 5 minutes old
      if (cachedBooks && cacheTimestamp) {
        const cacheAge = Date.now() - parseInt(cacheTimestamp);
        if (cacheAge < 5 * 60 * 1000) { // 5 minutes
          console.log('Loading books from cache');
          setBooks(JSON.parse(cachedBooks));
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
      // Query latest 4 books
      const booksQuery = query(
        collection(db, "books"),
        orderBy("created_at", "desc"),
        limit(4)
      );
      
      const querySnapshot = await getDocs(booksQuery);
      const booksData = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));

      // Update state
      setBooks(booksData);
      setLoading(false);

      // Cache the data
      localStorage.setItem('books_section_cache', JSON.stringify(booksData));
      localStorage.setItem('books_section_cache_timestamp', Date.now().toString());
      
      console.log('Books fetched and cached successfully');
    } catch (err) {
      console.error('Error fetching books from Firebase:', err);
      setError('Failed to load books from database.');
      setLoading(false);
    }
  };

  // Handle book click - redirect to purchase URL
  const handleBookClick = (book) => {
    if (book.book_url) {
      window.open(book.book_url, '_blank', 'noopener,noreferrer');
    } else {
      alert('Purchase link not available for this book.');
    }
  };

  useEffect(() => {
    fetchBooksFromFirebase();
  }, []);

  // Loading state
  if (loading) {
    return (
      <section className={`py-16 md:py-20 bg-gradient-to-br ${theme.gradients.light}`}>
        <div className="container mx-auto px-4 max-w-7xl">
          <div className="flex flex-col items-center justify-center py-20">
            <Loader className="w-12 h-12 text-orange-500 animate-spin mb-4" />
            <p className="text-gray-600 font-semibold">Loading books...</p>
          </div>
        </div>
      </section>
    );
  }

  // Error state
  if (error) {
    return (
      <section className={`py-16 md:py-20 bg-gradient-to-br ${theme.gradients.light}`}>
        <div className="container mx-auto px-4 max-w-7xl">
          <div className="flex flex-col items-center justify-center py-20">
            <BookOpen className="w-16 h-16 text-gray-300 mb-4" />
            <p className="text-red-600 font-semibold mb-2">{error}</p>
            <button 
              onClick={fetchBooksFromFirebase}
              className={`mt-4 ${getButton('primary')}`}
            >
              Try Again
            </button>
          </div>
        </div>
      </section>
    );
  }

  // Empty state
  if (books.length === 0) {
    return (
      <section className={`py-16 md:py-20 bg-gradient-to-br ${theme.gradients.light}`}>
        <div className="container mx-auto px-4 max-w-7xl">
          <div className="flex flex-col items-center justify-center py-20">
            <BookOpen className="w-16 h-16 text-gray-300 mb-4" />
            <h3 className="text-2xl font-bold text-gray-900 mb-2">No books available</h3>
            <p className="text-gray-600">Check back soon for new publications!</p>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className={`py-16 md:py-20 bg-gradient-to-br ${theme.gradients.light} relative overflow-hidden`}>
      {/* Background Decorative Elements */}
      <div className={`absolute top-20 left-0 w-80 h-80 ${theme.backgrounds.primary} rounded-full filter blur-3xl opacity-30`}></div>
      <div className={`absolute bottom-20 right-0 w-80 h-80 ${theme.backgrounds.primary} rounded-full filter blur-3xl opacity-30`}></div>
      
      <div className="container mx-auto px-4 max-w-7xl relative z-10">
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-12 gap-6">
          <div>
            <div className={`inline-flex items-center gap-2 px-5 py-2 ${theme.badges.primary} rounded-full text-sm font-semibold mb-4 ${theme.shadows.lg}`}>
              <BookOpen className="w-4 h-4" />
              Published Works
            </div>
            <h2 className={`text-4xl md:text-5xl font-black ${theme.text.primary} mb-3`}>
              Books <span className={`bg-gradient-to-r ${theme.gradients.primary} bg-clip-text text-transparent`}>Published</span>
            </h2>
            <p className={`${theme.text.secondary} text-lg max-w-2xl`}>
              Comprehensive guides on military strategy, leadership, and defense preparation
            </p>
          </div>
          
          {/* View All Button - Desktop */}
          <button 
            onClick={() => window.location.href = '/AllBooks'}
            className={`hidden md:inline-flex items-center gap-2 ${getButton('primary')} group`}
          >
            <Library className="w-5 h-5" />
            View All Books
            <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
          </button>
        </div>

        {/* Books Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8 mb-10">
          {books.map((book) => (
            <div key={book.id} className="group relative">
              {/* Card Container */}
              <div className={`${theme.cards.elevated} rounded-2xl overflow-hidden transition-all duration-300 hover:-translate-y-2`}>
                {/* Book Image */}
                <div className="relative overflow-hidden h-64">
                  <img 
                    src={book.book_image_url || 'https://images.unsplash.com/photo-1589998059171-988d887df646?w=400&h=500&fit=crop'}
                    alt={book.title}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                    onError={(e) => {
                      e.target.src = 'https://images.unsplash.com/photo-1589998059171-988d887df646?w=400&h=500&fit=crop';
                    }}
                  />
                  {/* Gradient Overlay */}
                  <div className={`absolute inset-0 bg-gradient-to-t ${theme.gradients.overlay} opacity-0 group-hover:opacity-100 transition-opacity`}></div>
                  
                  {/* Category Badge */}
                  <div className="absolute top-4 left-4">
                    <span className={`px-3 py-1 ${theme.backgrounds.white} backdrop-blur-sm ${theme.text.primary} text-xs font-bold rounded-full ${theme.shadows.lg}`}>
                      {book.book_category || 'General'}
                    </span>
                  </div>

                  {/* Rating */}
                  <div className={`absolute top-4 right-4 flex items-center gap-1 bg-yellow-400 px-2 py-1 rounded-full ${theme.shadows.lg}`}>
                    <Star className="w-3 h-3 fill-yellow-900 text-yellow-900" />
                    <span className="text-xs font-bold text-yellow-900">4.8</span>
                  </div>
                </div>

                {/* Book Info */}
                <div className="p-6">
                  <h3 className={`text-xl font-bold ${theme.text.primary} mb-3 group-hover:${theme.text.brand} transition-colors line-clamp-2`}>
                    {book.title}
                  </h3>
                  <p className={`${theme.text.secondary} text-sm leading-relaxed mb-5`}>
                    {truncateDescription(book.description, 20)}
                  </p>
                  
                  {/* Read More Button */}
                  <button 
                    onClick={() => handleBookClick(book)}
                    className={`inline-flex items-center gap-2 ${theme.text.brand} font-bold text-sm group-hover:gap-3 transition-all`}
                  >
                    Read More
                    <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  </button>
                </div>

                {/* Decorative Corner */}
                <div className="absolute bottom-0 right-0 w-20 h-20 bg-gradient-to-tl from-orange-600/10 to-transparent rounded-tl-full opacity-0 group-hover:opacity-100 transition-opacity"></div>
              </div>
            </div>
          ))}
        </div>

        {/* View All Button - Mobile */}
        <div className="flex justify-center md:hidden">
          <button 
            onClick={() => window.location.href = '/AllBooks'}
            className={`inline-flex items-center gap-2 ${getButton('primary')} group w-full md:w-auto justify-center`}
          >
            <Library className="w-5 h-5" />
            View All Books
            <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
          </button>
        </div>
      </div>
    </section>
  );
};

export default BooksSection;