"use client";
import React, { useState } from 'react';
import { BookOpen, Search, ShoppingBag, ArrowRight } from 'lucide-react';

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

const BooksPage = () => {
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');

  const books = [
    {
      id: 1,
      image: "https://images.unsplash.com/photo-1589998059171-988d887df646?w=400&h=500&fit=crop",
      title: "Strategic Combat Leadership",
      description: "A comprehensive guide to tactical decision-making and leadership principles derived from 25 years of military experience.",
      category: "Military Strategy",
    },
    {
      id: 2,
      image: "https://images.unsplash.com/photo-1544947950-fa07a98d237f?w=400&h=500&fit=crop",
      title: "The Warrior's Mindset",
      description: "Discover the mental frameworks and discipline techniques that transform ordinary individuals into extraordinary leaders.",
      category: "Leadership",
    },
    {
      id: 3,
      image: "https://images.unsplash.com/photo-1532012197267-da84d127e765?w=400&h=500&fit=crop",
      title: "Defense Exam Mastery",
      description: "Complete preparation strategy for NDA, CDS, and AFCAT exams with proven techniques for success.",
      category: "Exam Preparation",
    },
    {
      id: 4,
      image: "https://images.unsplash.com/photo-1543002588-bfa74002ed7e?w=400&h=500&fit=crop",
      title: "Fitness for Warriors",
      description: "Medical insights and fitness protocols specifically designed for defense personnel and aspirants.",
      category: "Health & Fitness",
    },
    {
      id: 5,
      image: "https://images.unsplash.com/photo-1456513080510-7bf3a84b82f8?w=400&h=500&fit=crop",
      title: "Advanced Tactical Operations",
      description: "Deep dive into special operations tactics, counter-insurgency strategies, and asymmetric warfare principles.",
      category: "Military Strategy",
    },
    {
      id: 6,
      image: "https://images.unsplash.com/photo-1481627834876-b7833e8f5570?w=400&h=500&fit=crop",
      title: "Leadership Under Fire",
      description: "Real-world case studies of decision-making in high-pressure situations from combat zones to corporate boardrooms.",
      category: "Leadership",
    },
    {
      id: 7,
      image: "https://images.unsplash.com/photo-1519682337058-a94d519337bc?w=400&h=500&fit=crop",
      title: "SSB Interview Success",
      description: "Complete guide to cracking the Services Selection Board interview with psychology insights and practical tips.",
      category: "Exam Preparation",
    },
    {
      id: 8,
      image: "https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?w=400&h=500&fit=crop",
      title: "Mental Resilience Training",
      description: "Build unbreakable mental strength through proven psychological techniques and resilience frameworks.",
      category: "Health & Fitness",
    },
  ];

  const categories = ['All', 'Military Strategy', 'Leadership', 'Exam Preparation', 'Health & Fitness'];

  const filteredBooks = books.filter(book => {
    const matchesCategory = selectedCategory === 'All' || book.category === selectedCategory;
    const matchesSearch = book.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         book.description.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  return (
    <div className="min-h-screen bg-gray-50 pt-15">
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
                      src={book.image}
                      alt={book.title}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                    />
                    <div className={`absolute inset-0 bg-gradient-to-t ${theme.gradients.overlay} opacity-0 group-hover:opacity-100 transition-opacity`}></div>
                    
                    {/* Category Badge */}
                    <div className="absolute top-4 left-4">
                      <span className={`px-3 py-1 ${theme.backgrounds.white} backdrop-blur-sm ${theme.text.primary} text-xs font-bold rounded-full ${theme.shadows.lg}`}>
                        {book.category}
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
                    <button className={`w-full inline-flex items-center justify-center gap-2 ${getButton('primary')} py-3`}>
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

export default BooksPage;