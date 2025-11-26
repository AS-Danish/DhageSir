'use client';

import React, { useState, useEffect } from 'react';
import { Mic, Podcast, Filter, ArrowRight, Loader, ChevronDown, Headphones, Play } from 'lucide-react';
import { db } from '../firebase/firebaseConfig';
import { collection, getDocs, query, orderBy } from 'firebase/firestore';

const theme = {
  backgrounds: {
    white: 'bg-white',
    primary: 'bg-orange-500',
    dark: 'bg-gray-900/80'
  },
  text: {
    primary: 'text-gray-900',
    secondary: 'text-gray-600',
    white: 'text-white',
    brand: 'text-orange-600'
  },
  badges: {
    primary: 'bg-gradient-to-r from-orange-500 to-orange-600 text-white',
    light: 'bg-orange-100 text-orange-600'
  },
  gradients: {
    primary: 'from-orange-500 to-orange-600',
    light: 'from-orange-50 to-orange-100',
    overlay: 'from-transparent via-gray-900/20 to-gray-900/80'
  },
  cards: {
    elevated: 'bg-white shadow-xl hover:shadow-2xl'
  },
  borders: {
    default: 'border-gray-200',
    primary: 'border-orange-500',
    dark: 'border-gray-300',
    light: 'border-orange-200'
  },
  shadows: {
    default: 'shadow-md',
    lg: 'shadow-lg',
    xl: 'shadow-xl'
  }
};

const getButton = (variant = 'primary') => {
  const variants = {
    primary: 'bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white rounded-xl py-3 px-6 font-bold transition-all hover:scale-105 hover:shadow-2xl',
    outline: 'bg-white hover:bg-orange-50 text-orange-600 border-2 border-orange-500 rounded-xl py-3 px-6 font-bold transition-all hover:scale-105 hover:shadow-xl',
    dark: 'bg-gray-900 hover:bg-gray-800 text-white rounded-xl py-3 px-6 font-bold transition-all hover:scale-105 hover:shadow-xl'
  };
  return variants[variant];
};

const PODCASTS_PER_PAGE = 6;
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

// Extract YouTube Video ID from URL
const extractYouTubeID = (url) => {
  if (!url) return null;
  const patterns = [
    /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([^&\n?#]+)/,
    /^([a-zA-Z0-9_-]{11})$/
  ];
  
  for (const pattern of patterns) {
    const match = url.match(pattern);
    if (match) return match[1];
  }
  return null;
};

// Get YouTube thumbnail URL
const getYouTubeThumbnail = (videoId) => {
  if (!videoId) return 'https://via.placeholder.com/640x360?text=Podcast+Cover';
  return `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`;
};

// Get YouTube embed URL
const getYouTubeEmbedURL = (videoId) => {
  if (!videoId) return '';
  return `https://www.youtube.com/embed/${videoId}?autoplay=1`;
};

const PodcastsSection = () => {
  const [activeCategory, setActiveCategory] = useState('All');
  const [podcasts, setPodcasts] = useState([]);
  const [filteredPodcasts, setFilteredPodcasts] = useState([]);
  const [categories, setCategories] = useState(['All']);
  const [playingPodcast, setPlayingPodcast] = useState(null);
  const [loading, setLoading] = useState(true);
  const [displayCount, setDisplayCount] = useState(PODCASTS_PER_PAGE);
  const [error, setError] = useState(null);
  const [platforms, setPlatforms] = useState([]);
  const [cache, setCache] = useState(null);

  // Auto-assign categories based on podcast title
  const assignCategory = (podcast) => {
    const text = `${podcast.title || ''}`.toLowerCase();
    
    if (text.match(/exam|nda|preparation|strategy|test|study/i)) return 'Exam Preparation';
    if (text.match(/motivat|inspir|discipline|success/i)) return 'Motivational';
    if (text.match(/fitness|health|physical|exercise|workout/i)) return 'Fitness & Health';
    if (text.match(/leadership|leader|command|management/i)) return 'Leadership';
    if (text.match(/military|combat|defense|forces|strategy|tactical/i)) return 'Military Strategy';
    if (text.match(/success story|journey|achievement|selection|interview/i)) return 'Success Stories';
    if (text.match(/career|guidance|counseling|advice/i)) return 'Career Guidance';
    
    return 'General';
  };

  // Load podcasts from Firebase with caching
  const loadPodcasts = async (useCache = true) => {
    try {
      setLoading(true);
      setError(null);

      // Check cache first
      if (useCache && cache && Date.now() - cache.timestamp < CACHE_DURATION) {
        setPodcasts(cache.podcasts);
        setPlatforms(cache.platforms);
        setLoading(false);
        return;
      }

      // Fetch from Firebase
      const q = query(
        collection(db, "podcasts"),
        orderBy("created_at", "desc")
      );

      const snapshot = await getDocs(q);
      const fetchedPodcasts = snapshot.docs.map(doc => {
        const data = doc.data();
        
        // Extract video ID from the youtube_url field
        const videoId = data.video_id || extractYouTubeID(data.youtube_url);
        
        // Get thumbnail from video_id
        const thumbnail = videoId ? getYouTubeThumbnail(videoId) : data.thumbnail_url || 'https://via.placeholder.com/640x360?text=Podcast+Cover';
        
        // Assign category
        const category = assignCategory(data);
        
        return {
          id: doc.id,
          title: data.title || 'Untitled Podcast',
          description: data.description || '',
          thumbnail: thumbnail,
          youtubeUrl: data.youtube_url || '',
          videoId: videoId,
          duration: data.duration || 0,
          category: category,
          platform: data.platform_name || 'YouTube',
          platform_url: data.platform_url || data.youtube_url,
          guest: data.guest_name || '',
          published_date: data.published_date || data.created_at
        };
      });

      // Extract unique categories
      const uniqueCategories = ['All', ...new Set(fetchedPodcasts.map(p => p.category))];
      setCategories(uniqueCategories);

      // Extract unique platforms
      const uniquePlatforms = Array.from(
        new Map(
          fetchedPodcasts.map(p => [p.platform, { name: p.platform, url: p.platform_url }])
        ).values()
      );
      setPlatforms(uniquePlatforms);

      setPodcasts(fetchedPodcasts);
      
      // Update cache
      setCache({
        podcasts: fetchedPodcasts,
        platforms: uniquePlatforms,
        timestamp: Date.now()
      });
    } catch (error) {
      console.error('Error loading podcasts:', error);
      setError('Failed to load podcasts. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  // Filter podcasts by category
  useEffect(() => {
    if (activeCategory === 'All') {
      setFilteredPodcasts(podcasts);
    } else {
      setFilteredPodcasts(podcasts.filter(podcast => podcast.category === activeCategory));
    }
    setDisplayCount(PODCASTS_PER_PAGE);
  }, [activeCategory, podcasts]);

  // Initial load
  useEffect(() => {
    loadPodcasts();
  }, []);

  const handleLoadMore = () => {
    setDisplayCount(prev => prev + PODCASTS_PER_PAGE);
  };

  const displayedPodcasts = filteredPodcasts.slice(0, displayCount);
  const hasMore = displayCount < filteredPodcasts.length;

  return (
    <section className={`py-16 md:py-20 ${theme.backgrounds.white} relative overflow-hidden`}>
      {/* Background Elements */}
      <div className={`absolute top-0 right-0 w-96 h-96 ${theme.backgrounds.primary} rounded-full filter blur-3xl opacity-40`}></div>
      <div className={`absolute bottom-0 left-0 w-96 h-96 ${theme.backgrounds.primary} rounded-full filter blur-3xl opacity-40`}></div>
      
      <div className="container mx-auto px-4 max-w-7xl relative z-10">
        {/* Section Header */}
        <div className="text-center mb-10">
          <div className={`inline-flex items-center gap-2 px-5 py-2 ${theme.badges.primary} rounded-full text-sm font-semibold mb-4 ${theme.shadows.lg}`}>
            <Mic className="w-4 h-4 fill-white" />
            Podcast Library
          </div>
          <h2 className={`text-4xl md:text-5xl font-black ${theme.text.primary} mb-3`}>
            Listen & <span className={`bg-gradient-to-r ${theme.gradients.primary} bg-clip-text text-transparent`}>Learn</span>
          </h2>
          <p className={`${theme.text.secondary} text-lg max-w-2xl mx-auto`}>
            In-depth conversations, expert interviews, and motivational content in video format
          </p>
        </div>

        {/* Loading State */}
        {loading && (
          <div className="text-center py-20">
            <Loader className="w-12 h-12 text-orange-500 animate-spin mx-auto mb-4" />
            <p className={`${theme.text.secondary} font-semibold`}>Loading podcasts...</p>
          </div>
        )}

        {/* Error State */}
        {error && (
          <div className="text-center py-20">
            <div className="bg-red-50 border-2 border-red-200 rounded-2xl p-8 max-w-md mx-auto">
              <p className="text-red-600 font-semibold mb-4">{error}</p>
              <button 
                onClick={() => loadPodcasts(false)}
                className={getButton('primary')}
              >
                Try Again
              </button>
            </div>
          </div>
        )}

        {/* Content */}
        {!loading && !error && (
          <>
            {/* Category Filters */}
            {podcasts.length > 0 && (
              <div className="mb-10">
                <div className="flex items-center gap-3 mb-4">
                  <Filter className={`w-5 h-5 ${theme.text.secondary}`} />
                  <span className={`font-bold ${theme.text.primary}`}>Filter by Category:</span>
                </div>
                <div className="flex flex-wrap gap-3">
                  {categories.map((category) => (
                    <button
                      key={category}
                      onClick={() => setActiveCategory(category)}
                      className={`px-6 py-3 rounded-xl font-semibold transition-all ${theme.shadows.default} hover:shadow-xl hover:scale-105 ${
                        activeCategory === category
                          ? `bg-gradient-to-r ${theme.gradients.primary} ${theme.text.white}`
                          : `${theme.backgrounds.white} ${theme.text.secondary} ${theme.borders.default} border-2 hover:${theme.borders.primary}`
                      }`}
                    >
                      {category}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Podcasts Grid */}
            {displayedPodcasts.length > 0 ? (
              <>
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 mb-12">
                  {displayedPodcasts.map((podcast) => (
                    <div key={podcast.id} className="group">
                      <div className={`${theme.cards.elevated} rounded-2xl overflow-hidden transition-all duration-300`}>
                        {/* Podcast Thumbnail/Player */}
                        <div className={`relative aspect-video ${theme.backgrounds.dark}`}>
                          {playingPodcast === podcast.id && podcast.videoId ? (
                            <div className="w-full h-full">
                              <iframe
                                width="100%"
                                height="100%"
                                src={getYouTubeEmbedURL(podcast.videoId)}
                                title={podcast.title}
                                frameBorder="0"
                                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                allowFullScreen
                                className="w-full h-full"
                              ></iframe>
                            </div>
                          ) : (
                            <>
                              <img 
                                src={podcast.thumbnail}
                                alt={podcast.title}
                                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                                onError={(e) => {
                                  e.target.src = 'https://via.placeholder.com/640x360?text=Podcast+Cover';
                                }}
                              />
                              {/* Overlay */}
                              <div className={`absolute inset-0 bg-gradient-to-t ${theme.gradients.overlay}`}></div>
                              
                              {/* Play Button */}
                              <button 
                                onClick={() => setPlayingPodcast(podcast.id)}
                                className="absolute inset-0 flex items-center justify-center group-hover:scale-110 transition-transform"
                                aria-label={`Play ${podcast.title}`}
                              >
                                <div className={`w-20 h-20 bg-gradient-to-br ${theme.gradients.primary} rounded-full flex items-center justify-center ${theme.shadows.xl} hover:scale-110 transition-all`}>
                                  <Play className={`w-8 h-8 ${theme.text.white} ml-1`} fill="white" />
                                </div>
                              </button>

                              {/* Platform Badge */}
                              <div className={`absolute top-3 left-3 px-3 py-1 bg-gradient-to-r ${theme.gradients.primary} ${theme.text.white} text-xs font-bold rounded-full ${theme.shadows.lg}`}>
                                {podcast.platform}
                              </div>
                            </>
                          )}
                        </div>

                        {/* Podcast Info */}
                        <div className="p-5">
                          <div className="flex items-center gap-2 mb-3">
                            <span className={`inline-block px-3 py-1 ${theme.badges.light} text-xs font-bold rounded-full`}>
                              {podcast.category}
                            </span>
                            {podcast.guest && (
                              <span className={`text-xs ${theme.text.secondary} font-semibold`}>
                                with {podcast.guest}
                              </span>
                            )}
                          </div>
                          <h3 className={`text-lg font-bold ${theme.text.primary} mb-3 line-clamp-2 group-hover:${theme.text.brand} transition-colors`}>
                            {podcast.title}
                          </h3>
                          {podcast.description && (
                            <p className={`text-sm ${theme.text.secondary} line-clamp-2`}>
                              {podcast.description}
                            </p>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Load More Button */}
                {hasMore && (
                  <div className="text-center mb-12">
                    <button
                      onClick={handleLoadMore}
                      className={`inline-flex items-center gap-2 ${getButton('primary')}`}
                    >
                      <ChevronDown className="w-5 h-5" />
                      Load More Podcasts ({filteredPodcasts.length - displayCount} more)
                    </button>
                  </div>
                )}
              </>
            ) : (
              <div className="text-center py-20">
                <Podcast className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-2xl font-bold text-gray-900 mb-2">No podcasts found</h3>
                <p className={`${theme.text.secondary}`}>
                  {activeCategory === 'All' 
                    ? 'No podcasts available at the moment.'
                    : `No podcasts found in the "${activeCategory}" category.`}
                </p>
              </div>
            )}

            {/* Podcast Platforms */}
            {podcasts.length > 0 && platforms.length > 0 && (
              <div className={`bg-gradient-to-br ${theme.gradients.light} rounded-3xl p-8 md:p-10 ${theme.shadows.xl} ${theme.borders.light} border`}>
                <div className="flex flex-col lg:flex-row items-center justify-between gap-6">
                  {/* Left Side - Platforms */}
                  <div className="flex-1">
                    <h3 className={`text-2xl font-black ${theme.text.primary} mb-2 flex items-center gap-3`}>
                      <Podcast className={`w-8 h-8 ${theme.text.brand}`} />
                      Watch on Your Favorite Platform
                    </h3>
                    <p className={`${theme.text.secondary} mb-5`}>Subscribe to get notified about new episodes and exclusive content</p>
                    
                    <div className="flex flex-col sm:flex-row gap-4">
                      {platforms.slice(0, 2).map((platform, idx) => (
                        <a 
                          key={platform.name}
                          href={platform.url || '#'}
                          target="_blank"
                          rel="noopener noreferrer"
                          className={`inline-flex items-center justify-center gap-3 ${getButton(idx === 0 ? 'primary' : 'outline')} group`}
                        >
                          <Mic className="w-5 h-5" />
                          {platform.name}
                          <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                        </a>
                      ))}
                    </div>
                  </div>

                  {/* Right Side - View All Button */}
                  <div className={`lg:border-l ${theme.borders.dark} lg:pl-8`}>
                    <a
                      href={platforms.length > 0 ? platforms[0].url : '#'}
                      target="_blank"
                      rel="noopener noreferrer"
                      className={`inline-flex items-center gap-3 ${getButton('dark')} group whitespace-nowrap`}
                    >
                      <Headphones className="w-6 h-6" />
                      View All Episodes
                      <ArrowRight className="w-6 h-6 group-hover:translate-x-1 transition-transform" />
                    </a>
                  </div>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </section>
  );
};

export default PodcastsSection;