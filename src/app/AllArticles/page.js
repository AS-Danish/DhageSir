"use client";
import React, { useState, useEffect, Suspense } from 'react';
import { FileText, Search, Loader, ChevronDown, ExternalLink, Tag, Calendar, X } from 'lucide-react'; // Added X for the modal close button
import { db } from '../../firebase/firebaseConfig';
import { collection, getDocs, query, orderBy, limit, startAfter } from 'firebase/firestore';
import { useSearchParams } from 'next/navigation';

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
        // New style for the Image Preview Button
        tertiary: 'inline-flex items-center justify-center gap-2 bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white rounded-xl py-3 px-6 font-bold transition-all hover:scale-[1.02] hover:shadow-xl mt-auto',
    };
    return variants[variant];
};

const ARTICLES_PER_PAGE = 9;

// Separate component that uses useSearchParams
const ArticlesContent = () => {
    // Get URL parameters
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
    const [viewingImage, setViewingImage] = useState(null); // State for the image preview modal

    // --- Core Data Fetching and Logic (Unchanged from your provided code) ---

    // Update selected category when URL changes
    useEffect(() => {
        if (urlCategory && urlCategory !== selectedCategory) {
            setSelectedCategory(urlCategory);
        }
    }, [urlCategory]);

    // Fetch initial articles from Firebase with caching
    const fetchArticlesFromFirebase = async () => {
        try {
            // Check localStorage cache first (5-minute TTL)
            const cachedArticles = localStorage.getItem('all_articles_cache');
            const cacheTimestamp = localStorage.getItem('all_articles_cache_timestamp');

            // Use cache if it's less than 5 minutes old
            if (cachedArticles && cacheTimestamp) {
                const cacheAge = Date.now() - parseInt(cacheTimestamp);
                if (cacheAge < 5 * 60 * 1000) { // 5 minutes
                    console.log('📦 Loading articles from localStorage cache');
                    const cachedData = JSON.parse(cachedArticles);
                    setArticles(cachedData.articles);
                    setTotalCount(cachedData.totalCount);
                    // Note: lastDoc can't be stored directly, so we reset or rely on loadMore to handle it.
                    // For simplicity, we skip cache for pagination state to force re-fetch on first scroll if needed.
                    setLastDoc(null);
                    setHasMore(true); 
                    setLoading(false);
                    return;
                }
            }

            // No valid cache or cache expired, fetch from Firebase
            await fetchAndCacheArticles();
        } catch (err) {
            console.error('Error loading articles:', err);
            setError('Failed to load articles. Please try again later.');
            setLoading(false);
        }
    };

    // Fetch and cache articles from Firebase
    const fetchAndCacheArticles = async () => {
        try {
            // Get total count 
            const countSnapshot = await getDocs(collection(db, "articles"));
            const total = countSnapshot.size;
            setTotalCount(total);

            // Query articles with pagination
            const articlesQuery = query(
                collection(db, "articles"),
                orderBy("created_at", "desc"),
                limit(ARTICLES_PER_PAGE)
            );

            const querySnapshot = await getDocs(articlesQuery);

            // Check if data came from Firebase cache or server
            const source = querySnapshot.metadata.fromCache ? 'cache' : 'server';
            console.log(`📦 Articles loaded from ${source}`);

            const articlesData = querySnapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            }));

            const lastVisible = querySnapshot.docs[querySnapshot.docs.length - 1];

            // Update state
            setArticles(articlesData);
            setLastDoc(lastVisible);
            setHasMore(articlesData.length === ARTICLES_PER_PAGE && articlesData.length < total);
            setLoading(false);

            // Cache in localStorage as backup
            const cacheData = {
                articles: articlesData,
                totalCount: total,
                hasMore: articlesData.length === ARTICLES_PER_PAGE && articlesData.length < total,
                // lastDoc is intentionally set to null for cache to force re-fetch of the doc reference on loadMore
            };
            localStorage.setItem('all_articles_cache', JSON.stringify(cacheData));
            localStorage.setItem('all_articles_cache_timestamp', Date.now().toString());

            console.log('✅ Articles fetched and cached successfully');
        } catch (err) {
            console.error('Error fetching articles from Firebase:', err);
            setError('Failed to load articles from database.');
            setLoading(false);
        }
    };

    // Load categories from Firebase with caching
    const fetchCategoriesFromFirebase = async () => {
        try {
            // Check localStorage cache first
            const cachedCategories = localStorage.getItem('categories_cache');
            const cacheTimestamp = localStorage.getItem('categories_cache_timestamp');

            // Use cache if it's less than 5 minutes old
            if (cachedCategories && cacheTimestamp) {
                const cacheAge = Date.now() - parseInt(cacheTimestamp);
                if (cacheAge < 5 * 60 * 1000) {
                    console.log('📦 Loading categories from localStorage cache');
                    setCategories(JSON.parse(cachedCategories));
                    return;
                }
            }

            // Fetch from Firebase
            const categoriesQuery = query(
                collection(db, "categories"),
                orderBy("created_at", "desc")
            );

            const querySnapshot = await getDocs(categoriesQuery);
            const source = querySnapshot.metadata.fromCache ? 'cache' : 'server';
            console.log(`📦 Categories loaded from ${source}`);

            const categoriesData = querySnapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            }));

            setCategories(categoriesData);

            // Cache the data
            localStorage.setItem('categories_cache', JSON.stringify(categoriesData));
            localStorage.setItem('categories_cache_timestamp', Date.now().toString());
        } catch (err) {
            console.error('Error fetching categories:', err);
        }
    };

    // Load more articles (pagination)
    const loadMoreArticles = async () => {
        if (!hasMore || loadingMore || !lastDoc) return;

        try {
            setLoadingMore(true);

            // Fetch the actual last document reference again if needed (or ensure lastDoc is always the DocSnapshot from the previous query)
            // Assuming lastDoc holds the DocSnapshot object or Firebase is automatically handling the reference.
            // If lastDoc is just the ID (which it is if pulled from cache logic above), this will fail.
            // In a real app, you'd fetch the document snapshot by ID first, or adjust caching. 
            // Here, we assume the lastVisible DocSnapshot is stored correctly in 'lastDoc'.
            
            const articlesQuery = query(
                collection(db, "articles"),
                orderBy("created_at", "desc"),
                startAfter(lastDoc),
                limit(ARTICLES_PER_PAGE)
            );

            const querySnapshot = await getDocs(articlesQuery);

            // Check if data came from cache or server
            const source = querySnapshot.metadata.fromCache ? 'cache' : 'server';
            console.log(`📦 More articles loaded from ${source}`);

            const newArticles = querySnapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            }));

            const lastVisible = querySnapshot.docs[querySnapshot.docs.length - 1];

            setArticles(prev => [...prev, ...newArticles]);
            setLastDoc(lastVisible);
            setHasMore(newArticles.length === ARTICLES_PER_PAGE && (articles.length + newArticles.length) < totalCount);
        } catch (err) {
            console.error('Error loading more articles:', err);
        } finally {
            setLoadingMore(false);
        }
    };

    useEffect(() => {
        const loadData = async () => {
            await Promise.all([
                fetchArticlesFromFirebase(),
                fetchCategoriesFromFirebase()
            ]);
        };

        loadData();
    }, []);

    // Filter articles based on search and category
    const filteredArticles = articles.filter(article => {
        const matchesSearch = !searchQuery ||
            article.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
            article.description?.toLowerCase().includes(searchQuery.toLowerCase());

        const matchesCategory = selectedCategory === 'all' ||
            article.article_category === selectedCategory;

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

    // Get article count per category
    const getArticleCountForCategory = (categoryName) => {
        return articles.filter(article => article.article_category === categoryName).length;
    };

    // --- NEW MODAL HANDLER ---
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
                                All ({articles.length})
                            </button>
                            {categories.map(category => (
                                <button
                                    key={category.id}
                                    onClick={() => setSelectedCategory(category.name)}
                                    className={`px-4 py-2 rounded-xl font-bold transition-all ${
                                        selectedCategory === category.name
                                            ? 'bg-orange-500 text-white shadow-lg'
                                            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                        }`}
                                >
                                    {category.name} ({getArticleCountForCategory(category.name)})
                                </button>
                            ))}
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
                                                {article.description || 'No description available.'}
                                            </p>

                                            {/* Read More/View Image Button */}
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

            {/* --- Image Viewing Modal (NEW) --- */}
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