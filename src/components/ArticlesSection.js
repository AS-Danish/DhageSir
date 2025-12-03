"use client";
import React, { useState, useEffect } from 'react';
import { FileText, Calendar, ArrowRight, Clock, Library, TrendingUp, Loader, X } from 'lucide-react';
import { db } from '../firebase/firebaseConfig';
import { doc, getDoc } from 'firebase/firestore'; // Changed imports for getDoc and doc

const theme = {
    backgrounds: {
        primary: 'bg-orange-500',
        white: 'bg-white'
    },
    text: {
        primary: 'text-gray-900',
        secondary: 'text-gray-600',
        light: 'text-gray-500',
        brand: 'text-orange-600'
    },
    badges: {
        primary: 'bg-gradient-to-r from-orange-500 to-orange-600 text-white'
    },
    gradients: {
        primary: 'from-orange-500 to-orange-600',
        light: 'from-orange-50 to-orange-100',
        overlay: 'from-transparent via-gray-900/20 to-gray-900/80'
    },
    cards: {
        elevated: 'bg-white shadow-xl hover:shadow-2xl'
    },
    shadows: {
        lg: 'shadow-lg'
    }
};

const getButton = (variant = 'primary') => {
    const variants = {
        primary: 'bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white rounded-xl py-3 px-6 font-bold transition-all hover:scale-105 hover:shadow-2xl'
    };
    return variants[variant];
};

const ArticlesSection = ({ homepageData }) => {
    const [articles, setArticles] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [viewingImage, setViewingImage] = useState(null); // State for image modal

    // Format date
    const formatDate = (dateString) => {
        if (!dateString) return 'Recent';

        try {
            // Note: The homepage article data uses 'added_at' which is an ISO string, 
            // so we can use it here.
            const date = new Date(dateString); 
            const options = { month: 'short', day: 'numeric', year: 'numeric' };
            return date.toLocaleDateString('en-US', options);
        } catch (error) {
            return 'Recent';
        }
    };

    // Calculate read time based on description length
    const calculateReadTime = (description) => {
        if (!description) return '5 min read';

        const wordsPerMinute = 200;
        const wordCount = description.split(/\s+/).length;
        const minutes = Math.ceil(wordCount / wordsPerMinute);

        return `${Math.max(1, minutes)} min read`;
    };

    // Initial load
    useEffect(() => {
    if (!homepageData) {
      setLoading(true);
      return;
    }

    try {
      const homepageArticlesArray = homepageData.articles || [];
      
      homepageArticlesArray.sort((a, b) => new Date(b.added_at) - new Date(a.added_at));

      const fetchedArticles = homepageArticlesArray.slice(0, 8).map(article => ({
        id: article.id,
        title: article.title,
        description: article.description,
        image: article.preview_image_url || 'https://via.placeholder.com/600x400?text=No+Image',
        category: article.article_category || 'General',
        articleLink: article.preview_image_url,
        date: formatDate(article.added_at),
        readTime: calculateReadTime(article.description)
      }));
      
      setArticles(fetchedArticles);
      setLoading(false);
    } catch (error) {
      console.error('Error processing articles:', error);
      setError('Failed to load articles.');
      setLoading(false);
    }
  }, [homepageData]);

    // Handle article click - MODIFIED TO SHOW IMAGE PREVIEW
    const handleArticleClick = (imageUrl) => {
        if (imageUrl && imageUrl !== '#') {
            setViewingImage(imageUrl);
        } else {
            // Optional: Handle case where no image URL is present
            // alert("No image preview available.");
        }
    };

    return (
        <section className={`py-16 md:py-20 bg-gradient-to-br ${theme.gradients.light} relative overflow-hidden`}>
            {/* Background Decorative Elements */}
            <div className={`absolute top-10 right-0 w-96 h-96 ${theme.backgrounds.primary} rounded-full filter blur-3xl opacity-40`}></div>
            <div className={`absolute bottom-20 left-0 w-96 h-96 ${theme.backgrounds.primary} rounded-full filter blur-3xl opacity-40`}></div>

            <div className="container mx-auto px-4 max-w-7xl relative z-10">
                {/* Section Header */}
                <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-12 gap-6">
                    <div>
                        <div className={`inline-flex items-center gap-2 px-5 py-2 ${theme.badges.primary} rounded-full text-sm font-semibold mb-4 ${theme.shadows.lg}`}>
                            <FileText className="w-4 h-4" />
                            Latest Articles
                        </div>
                        <h2 className={`text-4xl md:text-5xl font-black ${theme.text.primary} mb-3`}>
                            Knowledge <span className={`bg-gradient-to-r ${theme.gradients.primary} bg-clip-text text-transparent`}>Hub</span>
                        </h2>
                        <p className={`${theme.text.secondary} text-lg max-w-2xl`}>
                            Expert insights, strategies, and guidance on defense careers, exam preparation, and personal development
                        </p>
                    </div>

                    {/* View All Button - Desktop */}
                    <a
                        href="/AllArticles"
                        className={`hidden md:inline-flex items-center gap-2 ${getButton('primary')} group`}
                    >
                        <Library className="w-5 h-5" />
                        View All Articles
                        <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                    </a>
                </div>

                {/* Loading State */}
                {loading && (
                    <div className="text-center py-20">
                        <Loader className="w-12 h-12 text-orange-500 animate-spin mx-auto mb-4" />
                        <p className={`${theme.text.secondary} font-semibold`}>Loading articles...</p>
                    </div>
                )}

                {/* Articles Grid */}
                {!loading && !error && (
                    <>
                        {articles.length > 0 ? (
                            <>
                                <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
                                    {articles.map((article) => (
                                        // Article container onClick now triggers the modal
                                        <div key={article.id} className="group cursor-pointer" onClick={() => handleArticleClick(article.articleLink)}>
                                            {/* Card Container */}
                                            <div className={`${theme.cards.elevated} rounded-2xl overflow-hidden transition-all duration-300 h-full flex flex-col`}>
                                                {/* Article Image */}
                                                <div className="relative overflow-hidden h-48">
                                                    <img
                                                        src={article.image}
                                                        alt={article.title}
                                                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                                                        onError={(e) => {
                                                            e.target.src = 'https://via.placeholder.com/600x400?text=Article+Image';
                                                        }}
                                                    />
                                                    {/* Gradient Overlay */}
                                                    <div className={`absolute inset-0 bg-gradient-to-t ${theme.gradients.overlay}`}></div>

                                                    {/* Category Badge */}
                                                    <div className="absolute top-3 left-3">
                                                        <span className={`px-3 py-1 ${theme.badges.primary} text-xs font-bold rounded-full ${theme.shadows.lg}`}>
                                                            {article.category}
                                                        </span>
                                                    </div>

                                                    {/* Trending Icon (Kept for design) */}
                                                    <div className={`absolute top-3 right-3 w-8 h-8 ${theme.backgrounds.white} backdrop-blur-sm rounded-full flex items-center justify-center ${theme.shadows.lg}`}>
                                                        <TrendingUp className={`w-4 h-4 ${theme.text.brand}`} />
                                                    </div>
                                                </div>

                                                {/* Article Content */}
                                                <div className="p-5 flex-1 flex flex-col">
                                                    {/* Date & Read Time */}
                                                    <div className={`flex items-center gap-4 text-xs ${theme.text.light} mb-3`}>
                                                        <div className="flex items-center gap-1">
                                                            <Calendar className="w-3 h-3" />
                                                            <span>{article.date}</span>
                                                        </div>
                                                        <div className="flex items-center gap-1">
                                                            <Clock className="w-3 h-3" />
                                                            <span>{article.readTime}</span>
                                                        </div>
                                                    </div>

                                                    {/* Title */}
                                                    <h3 className={`text-lg font-bold ${theme.text.primary} mb-3 line-clamp-2 group-hover:${theme.text.brand} transition-colors`}>
                                                        {article.title}
                                                    </h3>

                                                    {/* Description */}
                                                    <p className={`${theme.text.secondary} text-sm leading-relaxed mb-4 line-clamp-3 flex-1`}>
                                                        {article.description}
                                                    </p>

                                                    {/* Read Full Article Button - MODIFIED CLICK HANDLER */}
                                                    <button
                                                        onClick={(e) => {
                                                            e.stopPropagation(); // Prevent duplicate click from container
                                                            handleArticleClick(article.articleLink);
                                                        }}
                                                        className={`inline-flex items-center gap-2 ${theme.text.brand} font-bold text-sm group-hover:gap-3 transition-all mt-auto`}
                                                    >
                                                        Read Article
                                                        <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                                                    </button>
                                                </div>

                                                {/* Decorative Bottom Accent */}
                                                <div className={`h-1 bg-gradient-to-r ${theme.gradients.primary} transform scale-x-0 group-hover:scale-x-100 transition-transform origin-left`}></div>
                                            </div>
                                        </div>
                                    ))}
                                </div>

                                {/* View All Button - Mobile */}
                                <div className="flex justify-center md:hidden">
                                    <a
                                        href="/articles"
                                        className={`inline-flex items-center gap-2 ${getButton('primary')} group w-full md:w-auto justify-center`}
                                    >
                                        <Library className="w-5 h-5" />
                                        View All Articles
                                        <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                                    </a>
                                </div>
                            </>
                        ) : (
                            <div className="text-center py-20">
                                <FileText className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                                <h3 className="text-2xl font-bold text-gray-900 mb-2">No articles yet</h3>
                                <p className={`${theme.text.secondary}`}>
                                    Check back soon for expert insights and guidance articles.
                                </p>
                            </div>
                        )}
                    </>
                )}
            </div>

            {/* Image Viewing Modal - Copied from AdminArticlesPage */}
            {viewingImage && (
                <div
                    className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center p-4"
                    onClick={() => setViewingImage(null)}
                >
                    <button
                        onClick={() => setViewingImage(null)}
                        className="absolute top-4 right-4 text-white hover:text-gray-300 transition-colors"
                    >
                        <X className="w-8 h-8" />
                    </button>
                    <img
                        src={viewingImage}
                        alt="Article Preview"
                        className="max-w-full max-h-full object-contain rounded-xl"
                        onClick={(e) => e.stopPropagation()}
                    />
                </div>
            )}
        </section>
    );
};

export default ArticlesSection;