"use client";
import React, { useState, useEffect } from 'react';
import { Podcast, Search, Youtube, Loader, Play, ChevronDown } from 'lucide-react';
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
        secondary: 'bg-gray-100 hover:bg-gray-200 text-gray-900 rounded-xl py-3 px-6 font-bold transition-all',
    };
    return variants[variant];
};

const PODCASTS_PER_PAGE = 12;

const PodcastsPage = () => {
    const [searchQuery, setSearchQuery] = useState('');
    const [podcasts, setPodcasts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [loadingMore, setLoadingMore] = useState(false);
    const [error, setError] = useState(null);
    const [currentPage, setCurrentPage] = useState(1);
    const [totalCount, setTotalCount] = useState(0);

    const { podcasts: storePodcasts, loading: storeLoading, fetchCollection } = useAppStore();

    useEffect(() => {
        fetchCollection('podcasts', 'podcasts');
    }, [fetchCollection]);

    useEffect(() => {
        if (!storeLoading) {
            setPodcasts(storePodcasts);
            setTotalCount(storePodcasts.length);
            setLoading(false);
        }
    }, [storePodcasts, storeLoading]);

    const loadMorePodcasts = async () => {
        if (loadingMore) return;
        try {
            setLoadingMore(true);
            await new Promise(resolve => setTimeout(resolve, 500));
            setCurrentPage(prev => prev + 1);
        } catch (err) {
            console.error('Error loading more podcasts:', err);
        } finally {
            setLoadingMore(false);
        }
    };

    // Filter podcasts based on search
    const filteredPodcasts = podcasts.filter(podcast => {
        const matchesSearch = podcast.title.toLowerCase().includes(searchQuery.toLowerCase());
        return matchesSearch;
    });

    // Paginate filtered podcasts
    const paginatedPodcasts = filteredPodcasts.slice(0, currentPage * PODCASTS_PER_PAGE);
    const hasMore = paginatedPodcasts.length < filteredPodcasts.length;

    // Loading state
    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50 pt-20">
                <div className="flex flex-col items-center justify-center py-40">
                    <Loader className="w-16 h-16 text-orange-500 animate-spin mb-4" />
                    <p className="text-gray-600 font-semibold text-lg">Loading podcasts...</p>
                </div>
            </div>
        );
    }

    // Error state
    if (error) {
        return (
            <div className="min-h-screen bg-gray-50 pt-20">
                <div className="flex flex-col items-center justify-center py-40">
                    <Podcast className="w-16 h-16 text-gray-300 mb-4" />
                    <p className="text-red-600 font-semibold mb-4 text-lg">{error}</p>
                    <button
                        onClick={() => fetchCollection('podcasts', 'podcasts', true)}
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
            {/* Search Section */}
            <section className="py-8 bg-white border-b-2 border-gray-100 sticky top-0 z-40 shadow-lg">
                <div className="container mx-auto px-4 max-w-7xl">
                    <div className="flex flex-col gap-4">
                        {/* Search and Count Row */}
                        <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
                            {/* Search */}
                            <div className="relative w-full md:w-96">
                                <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                                <input
                                    type="text"
                                    placeholder="Search podcasts..."
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    className="w-full pl-12 pr-4 py-3 border-2 border-gray-200 rounded-xl focus:border-orange-500 focus:outline-none transition-colors text-black"
                                />
                            </div>

                            {/* Podcast Count */}
                            <div className="flex items-center gap-2">
                                <Podcast className="w-6 h-6 text-orange-600" />
                                <span className="text-gray-600 font-semibold">
                                    Total: <span className="text-orange-600 font-bold">{totalCount}</span> podcasts
                                </span>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Podcasts Grid */}
            <section className="py-16 md:py-20">
                <div className="container mx-auto px-4 max-w-7xl">
                    <div className="flex items-center justify-between mb-8">
                        <h2 className={`text-3xl md:text-4xl font-black ${theme.text.primary}`}>
                            All Podcasts
                            <span className={`${theme.text.brand} ml-2`}>({filteredPodcasts.length})</span>
                        </h2>
                    </div>

                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {paginatedPodcasts.map((podcast, index) => {
                            const getYouTubeVideoId = (url) => {
                                if (!url) return null;
                                const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
                                const match = url.match(regExp);
                                return (match && match[2].length === 11) ? match[2] : null;
                            };
                            const videoId = podcast.video_id || getYouTubeVideoId(podcast.youtube_url);
                            const uniqueKey = `${podcast.id}-${index}`;

                            return (
                                <div key={uniqueKey} className="group relative">
                                    <div className={`${theme.cards.elevated} rounded-2xl overflow-hidden transition-all duration-300 hover:-translate-y-2`}>
                                        {/* Podcast Embed */}
                                        <div className="relative overflow-hidden aspect-video bg-gray-900">
                                            {videoId ? (
                                                <iframe
                                                    src={`https://www.youtube.com/embed/${videoId}`}
                                                    title={podcast.title}
                                                    frameBorder="0"
                                                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                                    allowFullScreen
                                                    className="w-full h-full"
                                                />
                                            ) : (
                                                <div className="w-full h-full flex items-center justify-center">
                                                    <img
                                                        src={podcast.thumbnail_url || 'https://via.placeholder.com/640x360?text=Podcast'}
                                                        alt={podcast.title}
                                                        className="w-full h-full object-cover"
                                                        onError={(e) => {
                                                            e.target.src = 'https://via.placeholder.com/640x360?text=Podcast';
                                                        }}
                                                    />
                                                    <div className="absolute inset-0 flex items-center justify-center bg-black/30">
                                                        <Play className="w-16 h-16 text-white opacity-70" />
                                                    </div>
                                                </div>
                                            )}

                                            {/* Platform Badge */}
                                            {podcast.platform && (
                                                <div className="absolute top-4 left-4">
                                                    <span className={`px-3 py-1 ${theme.backgrounds.white} backdrop-blur-sm ${theme.text.primary} text-xs font-bold rounded-full ${theme.shadows.lg} flex items-center gap-1`}>
                                                        <Youtube className="w-3 h-3 text-orange-600" />
                                                        {podcast.platform.toUpperCase()}
                                                    </span>
                                                </div>
                                            )}
                                        </div>

                                        {/* Podcast Info */}
                                        <div className="p-6">
                                            <h3 className={`text-xl font-bold ${theme.text.primary} mb-3 line-clamp-2 min-h-[56px]`}>
                                                {podcast.title}
                                            </h3>

                                            {/* Watch Button */}
                                            {podcast.youtube_url && (
                                                <a
                                                    href={podcast.youtube_url}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className={`w-full inline-flex items-center justify-center gap-2 ${getButton('primary')} py-3`}
                                                >
                                                    <Youtube className="w-5 h-5" />
                                                    Watch on YouTube
                                                </a>
                                            )}
                                        </div>

                                        {/* Decorative Corner */}
                                        <div className="absolute bottom-0 right-0 w-20 h-20 bg-gradient-to-tl from-orange-600/10 to-transparent rounded-tl-full opacity-0 group-hover:opacity-100 transition-opacity"></div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>

                    {/* Load More Button */}
                    {hasMore && (
                        <div className="text-center mt-12">
                            <button
                                onClick={loadMorePodcasts}
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
                                        Load More Podcasts ({filteredPodcasts.length - paginatedPodcasts.length} remaining)
                                    </>
                                )}
                            </button>
                        </div>
                    )}

                    {/* Empty State */}
                    {filteredPodcasts.length === 0 && (
                        <div className="text-center py-20">
                            <Podcast className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                            <h3 className="text-2xl font-bold text-gray-900 mb-2">No podcasts found</h3>
                            <p className="text-gray-600">Try adjusting your search criteria</p>
                        </div>
                    )}
                </div>
            </section>
        </div>
    );
};

export default PodcastsPage;