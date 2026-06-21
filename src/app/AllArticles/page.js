"use client";
import React, { useState, useEffect, Suspense } from 'react';
import { FileText, Search, Loader, ChevronDown, ExternalLink, Tag, Calendar, X } from 'lucide-react';
import { db } from '../../firebase/firebaseConfig';
import { useSearchParams } from 'next/navigation';
import { useAppStore } from '@/store/useAppStore';

// Theme configuration
const theme = {
    gradients: {
        primary: 'from-orange-500 to-orange-600',
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
};

const getButton = (variant = 'primary') => {
    const variants = {
        primary: 'bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white rounded-xl py-4 px-8 font-bold transition-all hover:scale-105 hover:shadow-2xl',
        secondary: 'bg-gray-100 hover:bg-gray-200 text-gray-900 rounded-xl py-3 px-6 font-bold transition-all',
        tertiary: 'inline-flex items-center justify-center gap-2 bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white rounded-xl py-3 px-6 font-bold transition-all hover:scale-[1.02] hover:shadow-xl mt-auto',
    };
    return variants[variant];
};

const ARTICLES_PER_PAGE = 9;

// Separate component that uses useSearchParams
const ArticlesContent = () => {
    const searchParams = useSearchParams();
    const urlCategory = searchParams?.get('category');

    const [searchQuery, setSearchQuery] = useState('');
    const [selectedCategory, setSelectedCategory] = useState(urlCategory || 'all');
    const [articles, setArticles] = useState([]);
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(true);
    const [loadingMore, setLoadingMore] = useState(false);
    const [error, setError] = useState(null);
    const [lastDoc, setLastDoc] = useState(null);
    const [hasMore, setHasMore] = useState(true);
    const [totalCount, setTotalCount] = useState(0);
    const [viewingImage, setViewingImage] = useState(null);
    const [allArticleCategories, setAllArticleCategories] = useState([]);
    const [categoryCounts, setCategoryCounts] = useState({});

    const { articles: storeArticles, loading: storeLoading, fetchCollection } = useAppStore();

    useEffect(() => {
        if (urlCategory && urlCategory !== selectedCategory) {
            setSelectedCategory(urlCategory);
        }
    }, [urlCategory]);

    useEffect(() => {
        fetchCollection('articles', 'articles');
    }, [fetchCollection]);

    useEffect(() => {
        if (!storeLoading && storeArticles.length > 0) {
            setArticles(storeArticles.slice(0, ARTICLES_PER_PAGE));
            setTotalCount(storeArticles.length);
            
            const categoryCountMap = {};
            storeArticles.forEach(doc => {
                const category = doc.article_category;
                if (category && category.trim()) {
                    const trimmed = category.trim();
                    categoryCountMap[trimmed] = (categoryCountMap[trimmed] || 0) + 1;
                }
            });
            setAllArticleCategories(Object.keys(categoryCountMap));
            setCategoryCounts(categoryCountMap);
            setLoading(false);
            setHasMore(storeArticles.length > ARTICLES_PER_PAGE);
        } else if (!storeLoading && storeArticles.length === 0) {
            setLoading(false);
            setHasMore(false);
        }
    }, [storeArticles, storeLoading]);

    const loadMoreArticles = () => {
        if (!hasMore || loadingMore) return;
        setLoadingMore(true);
        const currentLength = articles.length;
        const nextBatch = storeArticles.slice(currentLength, currentLength + ARTICLES_PER_PAGE);
        setArticles(prev => [...prev, ...nextBatch]);
        setHasMore(currentLength + nextBatch.length < storeArticles.length);
        setLoadingMore(false);
    };

    const filteredArticles = storeArticles.filter(article => {
        const matchesSearch = !searchQuery ||
            article.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
            article.description?.toLowerCase().includes(searchQuery.toLowerCase());

        const matchesCategory = selectedCategory === 'all' ||
            (article.article_category && article.article_category.trim() === selectedCategory.trim());

        return matchesSearch && matchesCategory;
    });

    // Format date
    const formatDate = (dateString) => {
        if (!dateString) return 'No date';
        try {
            const date = new Date(dateString);
            return date.toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'short',
                day: 'numeric'
            });
        } catch {
            return 'Invalid date';
        }
    };

    // Get article count per category (use pre-calculated counts)
    const getArticleCountForCategory = (categoryName) => {
        return categoryCounts[categoryName] || 0;
    };

    // Get all unique categories to display
    const categoriesWithArticles = allArticleCategories
        .map(name => ({ name }))
        .sort((a, b) => a.name.localeCompare(b.name));

    // Image preview handler
    const handleImagePreviewClick = (imageUrl) => {
        setViewingImage(imageUrl);
    };

    // Loading state
    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50 pt-20">
                <div className="flex flex-col items-center justify-center py-40">
                    <Loader className="w-16 h-16 text-orange-500 animate-spin mb-4" />
                    <p className="text-gray-600 font-semibold text-lg">Loading articles...</p>
                </div>
            </div>
        );
    }

    // Error state
    if (error) {
        return (
            <div className="min-h-screen bg-gray-50 pt-20">
                <div className="flex flex-col items-center justify-center py-40">
                    <FileText className="w-16 h-16 text-gray-300 mb-4" />
                    <p className="text-red-600 font-semibold mb-4 text-lg">{error}</p>
                    <button
                        onClick={fetchArticlesFromFirebase}
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
                            Articles & Insights
                        </h1>
                        <p className="text-xl text-orange-100 max-w-2xl mx-auto">
                            Explore our collection of {totalCount} articles across various topics
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

            {/* Search and Filter Section */}
            <section className="py-8 bg-white border-b-2 border-gray-100 sticky top-0 z-40 shadow-lg">
                <div className="container mx-auto px-4 max-w-7xl">
                    <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
                        {/* Search */}
                        <div className="relative w-full md:w-96">
                            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                            <input
                                type="text"
                                placeholder="Search articles..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="w-full pl-12 pr-4 py-3 border-2 border-gray-200 rounded-xl focus:border-orange-500 focus:outline-none transition-colors text-black"
                            />
                        </div>

                        {/* Category Filter */}
                        <div className="flex items-center gap-2 flex-wrap">
                            <button
                                onClick={() => setSelectedCategory('all')}
                                className={`px-4 py-2 rounded-xl font-bold transition-all ${
                                    selectedCategory === 'all'
                                        ? 'bg-orange-500 text-white shadow-lg'
                                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                    }`}
                            >
                                All ({totalCount})
                            </button>
                            {categoriesWithArticles.map((category, idx) => {
                                const count = getArticleCountForCategory(category.name);

                                return (
                                    <button
                                        key={category.id || `category-${idx}`}
                                        onClick={() => setSelectedCategory(category.name)}
                                        className={`px-4 py-2 rounded-xl font-bold transition-all ${
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
            </section>

            {/* Articles Grid */}
            <section className="py-16 md:py-20">
                <div className="container mx-auto px-4 max-w-7xl">
                    <div className="flex items-center justify-between mb-8">
                        <h2 className={`text-3xl md:text-4xl font-black ${theme.text.primary}`}>
                            {selectedCategory === 'all' ? 'All Articles' : selectedCategory}
                            <span className={`${theme.text.brand} ml-2`}>({filteredArticles.length})</span>
                        </h2>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {filteredArticles.map((article, index) => {
                            const uniqueKey = `${article.id}-${index}`;

                            return (
                                <div key={uniqueKey} className="group">
                                    <div className={`${theme.cards.elevated} rounded-2xl overflow-hidden transition-all duration-300 hover:-translate-y-2 h-full flex flex-col`}>
                                        {/* Article Image */}
                                        <div className="relative w-full pb-[60%] overflow-hidden bg-gray-100">
                                            <img
                                                src={article.preview_image_url || 'https://via.placeholder.com/800x600/f3f4f6/9ca3af?text=No+Image'}
                                                alt={article.title || 'Article'}
                                                className="absolute inset-0 w-full h-full object-cover transition-transform group-hover:scale-110"
                                                loading="lazy"
                                                onError={(e) => {
                                                    console.error('Failed to load article image:', article.preview_image_url);
                                                    e.target.src = 'https://via.placeholder.com/800x600/f3f4f6/9ca3af?text=Image+Not+Found';
                                                }}
                                            />

                                            {/* Category Badge */}
                                            {article.article_category && (
                                                <div className="absolute top-4 left-4">
                                                    <span className="inline-flex items-center gap-1 px-3 py-1 bg-white/90 backdrop-blur-sm text-gray-900 text-xs font-bold rounded-full shadow-lg">
                                                        <Tag className="w-3 h-3" />
                                                        {article.article_category}
                                                    </span>
                                                </div>
                                            )}
                                        </div>

                                        {/* Article Content */}
                                        <div className="p-6 flex-1 flex flex-col">
                                            {/* Date */}
                                            {article.created_at && (
                                                <div className="flex items-center gap-2 text-gray-500 text-sm mb-3">
                                                    <Calendar className="w-4 h-4" />
                                                    <span>{formatDate(article.created_at)}</span>
                                                </div>
                                            )}

                                            {/* Title */}
                                            <h3 className="text-xl font-bold text-gray-900 mb-3 line-clamp-2 group-hover:text-orange-600 transition-colors">
                                                {article.title || 'Untitled Article'}
                                            </h3>

                                            {/* Description */}
                                            <p className="text-gray-600 text-sm mb-4 line-clamp-3 flex-1">
                                                {article.description || ''}
                                            </p>

                                            {/* View Image Button */}
                                            {article.preview_image_url ? (
                                                <button
                                                    onClick={() => handleImagePreviewClick(article.preview_image_url)}
                                                    className={getButton('tertiary')}
                                                >
                                                    View Article Image
                                                    <ExternalLink className="w-4 h-4" />
                                                </button>
                                            ) : (
                                                <div className="inline-flex items-center justify-center gap-2 bg-gray-200 text-gray-500 rounded-xl py-3 px-6 font-bold cursor-not-allowed mt-auto">
                                                    No Image Available
                                                </div>
                                            )}
                                        </div>

                                        {/* Decorative Corner */}
                                        <div className="absolute bottom-0 right-0 w-24 h-24 bg-gradient-to-tl from-orange-600/10 to-transparent rounded-tl-full opacity-0 group-hover:opacity-100 transition-opacity"></div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>

                    {/* Load More Button */}
                    {hasMore && !searchQuery && selectedCategory === 'all' && (
                        <div className="text-center mt-12">
                            <button
                                onClick={loadMoreArticles}
                                disabled={loadingMore}
                                className={`inline-flex items-center gap-2 ${getButton('secondary')} disabled:opacity-50`}
                            >
                                {loadingMore ? (
                                    <>
                                        <Loader className="w-5 h-5 animate-spin" />
                                        Loading...
                                    </>
                                ) : (
                                    <>
                                        <ChevronDown className="w-5 h-5" />
                                        Load More Articles ({totalCount - articles.length} remaining)
                                    </>
                                )}
                            </button>
                        </div>
                    )}

                    {/* Empty State */}
                    {filteredArticles.length === 0 && (
                        <div className="text-center py-20">
                            <FileText className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                            <h3 className="text-2xl font-bold text-gray-900 mb-2">No articles found</h3>
                            <p className="text-gray-600">
                                {searchQuery || selectedCategory !== 'all'
                                    ? 'Try adjusting your search or filter criteria'
                                    : 'No articles available yet'}
                            </p>
                        </div>
                    )}
                </div>
            </section>

            {/* Image Viewing Modal */}
            {viewingImage && (
                <div
                    className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center p-4"
                    onClick={() => setViewingImage(null)}
                >
                    <button
                        onClick={() => setViewingImage(null)}
                        className="absolute top-4 right-4 text-white hover:text-gray-300 transition-colors z-50 p-2 bg-black/50 rounded-full"
                        aria-label="Close image preview"
                    >
                        <X className="w-8 h-8" />
                    </button>
                    <img
                        src={viewingImage}
                        alt="Article Preview"
                        className="max-w-full max-h-full object-contain rounded-xl shadow-2xl"
                        onClick={(e) => e.stopPropagation()}
                    />
                </div>
            )}
        </div>
    );
};

// Main component with Suspense boundary
const AllArticlesPage = () => {
    return (
        <Suspense fallback={
            <div className="min-h-screen bg-gray-50 pt-20">
                <div className="flex flex-col items-center justify-center py-40">
                    <Loader className="w-16 h-16 text-orange-500 animate-spin mb-4" />
                    <p className="text-gray-600 font-semibold text-lg">Loading articles...</p>
                </div>
            </div>
        }>
            <ArticlesContent />
        </Suspense>
    );
};

export default AllArticlesPage;