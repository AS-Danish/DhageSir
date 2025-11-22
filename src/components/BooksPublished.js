import React from 'react';
import { BookOpen, Star, ArrowRight, Library } from 'lucide-react';

const BooksSection = () => {
  const books = [
    {
      id: 1,
      image: "https://images.unsplash.com/photo-1589998059171-988d887df646?w=400&h=500&fit=crop",
      title: "Strategic Combat Leadership",
      description: "A comprehensive guide to tactical decision-making and leadership principles derived from 25 years of military experience.",
      category: "Military Strategy"
    },
    {
      id: 2,
      image: "https://images.unsplash.com/photo-1544947950-fa07a98d237f?w=400&h=500&fit=crop",
      title: "The Warrior's Mindset",
      description: "Discover the mental frameworks and discipline techniques that transform ordinary individuals into extraordinary leaders.",
      category: "Leadership"
    },
    {
      id: 3,
      image: "https://images.unsplash.com/photo-1532012197267-da84d127e765?w=400&h=500&fit=crop",
      title: "Defense Exam Mastery",
      description: "Complete preparation strategy for NDA, CDS, and AFCAT exams with proven techniques for success.",
      category: "Exam Preparation"
    },
    {
      id: 4,
      image: "https://images.unsplash.com/photo-1543002588-bfa74002ed7e?w=400&h=500&fit=crop",
      title: "Fitness for Warriors",
      description: "Medical insights and fitness protocols specifically designed for defense personnel and aspirants.",
      category: "Health & Fitness"
    }
  ];

  return (
    <section className="py-16 md:py-20 bg-gradient-to-br from-gray-50 via-white to-blue-50 relative overflow-hidden">
      {/* Background Decorative Elements */}
      <div className="absolute top-20 left-0 w-80 h-80 bg-purple-100 rounded-full filter blur-3xl opacity-30"></div>
      <div className="absolute bottom-20 right-0 w-80 h-80 bg-blue-100 rounded-full filter blur-3xl opacity-30"></div>
      
      <div className="container mx-auto px-4 max-w-7xl relative z-10">
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-12 gap-6">
          <div>
            <div className="inline-flex items-center gap-2 px-5 py-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-full text-sm font-semibold mb-4 shadow-lg">
              <BookOpen className="w-4 h-4" />
              Published Works
            </div>
            <h2 className="text-4xl md:text-5xl font-black text-gray-900 mb-3">
              Books <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">Published</span>
            </h2>
            <p className="text-gray-600 text-lg max-w-2xl">
              Comprehensive guides on military strategy, leadership, and defense preparation
            </p>
          </div>
          
          {/* View All Button - Desktop */}
          <button className="hidden md:inline-flex items-center gap-2 px-8 py-4 bg-gray-900 text-white rounded-xl font-bold hover:bg-gradient-to-r hover:from-blue-600 hover:to-purple-600 transition-all shadow-xl hover:shadow-2xl hover:scale-105 group">
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
              <div className="bg-white rounded-2xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-300 hover:-translate-y-2">
                {/* Book Image */}
                <div className="relative overflow-hidden h-64">
                  <img 
                    src={book.image}
                    alt={book.title}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                  />
                  {/* Gradient Overlay */}
                  <div className="absolute inset-0 bg-gradient-to-t from-gray-900/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
                  
                  {/* Category Badge */}
                  <div className="absolute top-4 left-4">
                    <span className="px-3 py-1 bg-white/95 backdrop-blur-sm text-gray-900 text-xs font-bold rounded-full shadow-lg">
                      {book.category}
                    </span>
                  </div>

                  {/* Rating */}
                  <div className="absolute top-4 right-4 flex items-center gap-1 bg-yellow-400 px-2 py-1 rounded-full shadow-lg">
                    <Star className="w-3 h-3 fill-yellow-900 text-yellow-900" />
                    <span className="text-xs font-bold text-yellow-900">4.8</span>
                  </div>
                </div>

                {/* Book Info */}
                <div className="p-6">
                  <h3 className="text-xl font-bold text-gray-900 mb-3 group-hover:text-blue-600 transition-colors">
                    {book.title}
                  </h3>
                  <p className="text-gray-600 text-sm leading-relaxed mb-5 line-clamp-3">
                    {book.description}
                  </p>
                  
                  {/* Read More Button */}
                  <button className="inline-flex items-center gap-2 text-blue-600 font-bold text-sm group-hover:gap-3 transition-all">
                    Read More
                    <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  </button>
                </div>

                {/* Decorative Corner */}
                <div className="absolute bottom-0 right-0 w-20 h-20 bg-gradient-to-tl from-blue-600/10 to-transparent rounded-tl-full opacity-0 group-hover:opacity-100 transition-opacity"></div>
              </div>
            </div>
          ))}
        </div>

        {/* View All Button - Mobile */}
        <div className="flex justify-center md:hidden">
          <button className="inline-flex items-center gap-2 px-8 py-4 bg-gray-900 text-white rounded-xl font-bold hover:bg-gradient-to-r hover:from-blue-600 hover:to-purple-600 transition-all shadow-xl hover:shadow-2xl hover:scale-105 group w-full md:w-auto justify-center">
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