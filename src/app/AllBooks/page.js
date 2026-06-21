"use client";
import React, { useState, useEffect, Suspense } from 'react';
import { BookOpen, Search, ShoppingBag, ArrowRight, Loader, Tag } from 'lucide-react';
import { db } from '../../firebase/firebaseConfig';
import { useSearchParams } from 'next/navigation';
import { useAppStore } from '@/store/useAppStore';

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
  const urlCategory = searchParams?.get('category');

  const [selectedCategory, setSelectedCategory] = useState(urlCategory || 'all');
  const [searchQuery, setSearchQuery] = useState('');
  const [books, setBooks] = useState([]);
  const [allBookCategories, setAllBookCategories] = useState([]);
  const [categoryCounts, setCategoryCounts] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [totalCount, setTotalCount] = useState(0);

  const { books: storeBooks, loading: storeLoading, fetchCollection } = useAppStore();

  useEffect(() => {
    if (urlCategory && urlCategory !== selectedCategory) {
      setSelectedCategory(urlCategory);
    }
  }, [urlCategory]);

  useEffect(() => {
    fetchCollection('books', 'books');
  }, [fetchCollection]);

  useEffect(() => {
    if (!storeLoading) {
      setBooks(storeBooks);
      setTotalCount(storeBooks.length);
      
      const categoryCountMap = {};
      storeBooks.forEach(doc => {
        const category = doc.book_category;
        if (category && category.trim()) {
          const trimmed = category.trim();
          categoryCountMap[trimmed] = (categoryCountMap[trimmed] || 0) + 1;
        }
      });
      setAllBookCategories(Object.keys(categoryCountMap));
      setCategoryCounts(categoryCountMap);
      setLoading(false);
    }
  }, [storeBooks, storeLoading]);

  // Handle book purchase click
  const handlePurchaseClick = (book) => {
    if (book.book_url) {
      window.open(book.book_url, '_blank', 'noopener,noreferrer');
    } else {
      alert('Purchase link not available for this book.');
    }
  };

  // Get book count per category
  const getBookCountForCategory = (categoryName) => {
    // For military category, always show 2 since we're filtering to 2 specific books
    if (categoryName.trim().toLowerCase() === 'military') {
      return 2;
    }
    return categoryCounts[categoryName] || 0;
  };

  // Get all unique categories to display
  const categoriesWithBooks = allBookCategories
    .map(name => ({ name }))
    .sort((a, b) => a.name.localeCompare(b.name));

  const filteredBooks = books.filter(book => {
    const matchesSearch = !searchQuery ||
      book.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      book.description?.toLowerCase().includes(searchQuery.toLowerCase());
    
    // For military, filter by title, apply search
    if (selectedCategory.trim().toLowerCase() === 'military') {
      const allowedTitles = [
        'gkp disaster management in india for upsc',
        "india's dual defence book"
      ];
      const isMilitaryBook = book.title && allowedTitles.some(allowedTitle => 
        book.title.toLowerCase().trim() === allowedTitle.toLowerCase()
      );
      return matchesSearch && isMilitaryBook;
    }

    const matchesCategory = selectedCategory === 'all' ||
      (book.book_category && book.book_category.trim() === selectedCategory.trim());

    return matchesSearch && matchesCategory;
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
      {/* Hero Section */}
      <section className={`bg-gradient-to-r ${theme.gradients.primary} py-16 shadow-xl`}>
        <div className="container mx-auto px-4 max-w-7xl">
          <div className="text-center">
            <h1 className="text-5xl md:text-6xl font-black text-white mb-4">
              Book Collection
            </h1>
            <p className="text-xl text-orange-100 max-w-2xl mx-auto">
              Explore our collection of {totalCount} books across various categories
            </p>
            {urlCategory && urlCategory !== 'all' && (
              <div className="mt-4">
                <span className="inline-flex items-center gap-2 px-6 py-3 bg-white/20 backdrop-blur-sm text-white rounded-full font-bold">
                  <Tag className="w-5 h-5" />
                  Filtered by: {urlCategory}
                </span>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Filter Section */}
      <section className="sticky top-20 z-40 bg-white border-b-2 border-gray-100 shadow-lg">
        <div className="container mx-auto px-4 max-w-7xl py-6">
          {/* Search Bar */}
          <div className="mb-4">
            <div className="relative w-full max-w-2xl mx-auto md:mx-0">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Search books..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-12 pr-4 py-3 border-2 border-gray-200 rounded-xl focus:border-orange-500 focus:outline-none transition-colors text-black"
              />
            </div>
          </div>

          {/* Category Filter - Scrollable on all devices */}
          <div className="overflow-x-auto pb-2 -mx-4 px-4 scrollbar-hide">
            <div className="flex items-center gap-2 min-w-max">
              <button
                onClick={() => setSelectedCategory('all')}
                className={`px-4 py-2 rounded-xl font-bold transition-all whitespace-nowrap ${
                  selectedCategory === 'all'
                    ? 'bg-orange-500 text-white shadow-lg'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                All ({totalCount})
              </button>
              {categoriesWithBooks.map((category, idx) => {
                const count = getBookCountForCategory(category.name);

                return (
                  <button
                    key={`category-${idx}`}
                    onClick={() => setSelectedCategory(category.name)}
                    className={`px-4 py-2 rounded-xl font-bold transition-all whitespace-nowrap ${
                      selectedCategory === category.name
                        ? 'bg-orange-500 text-white shadow-lg'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    {category.name} ({count})
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Add custom scrollbar styles */}
        <style jsx>{`
          .scrollbar-hide::-webkit-scrollbar {
            display: none;
          }
          .scrollbar-hide {
            -ms-overflow-style: none;
            scrollbar-width: none;
          }
        `}</style>
      </section>

      {/* Books Grid */}
      <section className="py-16 md:py-20">
        <div className="container mx-auto px-4 max-w-7xl">
          <div className="flex items-center justify-between mb-8">
            <h2 className={`text-3xl md:text-4xl font-black ${theme.text.primary}`}>
              {selectedCategory === 'all' ? 'All Books' : selectedCategory}
              <span className={`${theme.text.brand} ml-2`}>({filteredBooks.length})</span>
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 md:gap-8">
            {filteredBooks.map((book) => (
              <div key={book.id} className="group relative">
                <div className={`${theme.cards.elevated} rounded-2xl overflow-hidden transition-all duration-300 hover:-translate-y-2`}>
                  {/* Book Image */}
                  <div className="relative overflow-hidden h-64 sm:h-72">
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
                    {book.book_category && (
                      <div className="absolute top-4 left-4">
                        <span className={`inline-flex items-center gap-1 px-3 py-1 ${theme.backgrounds.white} backdrop-blur-sm ${theme.text.primary} text-xs font-bold rounded-full ${theme.shadows.lg}`}>
                          <Tag className="w-3 h-3" />
                          {book.book_category}
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Book Info */}
                  <div className="p-4 sm:p-6">
                    <h3 className={`text-lg sm:text-xl font-bold ${theme.text.primary} mb-2 sm:mb-3 line-clamp-2 min-h-[48px] sm:min-h-[56px]`}>
                      {book.title}
                    </h3>
                    <p className={`${theme.text.secondary} text-sm leading-relaxed mb-4 sm:mb-5 line-clamp-3`}>
                      {book.description}
                    </p>
                    
                    {/* Purchase Button */}
                    <button 
                      onClick={() => handlePurchaseClick(book)}
                      className={`w-full inline-flex items-center justify-center gap-2 bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white rounded-xl py-2.5 sm:py-3 px-4 font-bold transition-all hover:scale-105 hover:shadow-2xl text-sm sm:text-base`}
                    >
                      <ShoppingBag className="w-4 h-4 sm:w-5 sm:h-5" />
                      Purchase Book
                      <ArrowRight className="w-3 h-3 sm:w-4 sm:h-4 group-hover:translate-x-1 transition-transform" />
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
              <p className="text-gray-600">
                {searchQuery || selectedCategory !== 'all'
                  ? 'Try adjusting your search or filter criteria'
                  : 'No books available yet'}
              </p>
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