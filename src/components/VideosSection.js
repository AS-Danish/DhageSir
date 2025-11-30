import React, { useState, useEffect } from 'react';
import { Play, Youtube, Filter, ArrowRight, Loader, ChevronDown } from 'lucide-react';
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

const VIDEOS_PER_PAGE = 6;

const VideosSection = () => {
  const [activeCategory, setActiveCategory] = useState('All');
  const [videos, setVideos] = useState([]);
  const [filteredVideos, setFilteredVideos] = useState([]);
  const [categories, setCategories] = useState(['All']);
  const [playingVideo, setPlayingVideo] = useState(null);
  const [loading, setLoading] = useState(true);
  const [displayCount, setDisplayCount] = useState(VIDEOS_PER_PAGE);
  const [error, setError] = useState(null);
  const [channels, setChannels] = useState([]);

  // Cache helpers
  const CACHE_KEY = 'videos_section_cache';
  const CACHE_TIMESTAMP_KEY = 'videos_section_cache_timestamp';
  const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

  const getCachedData = () => {
    try {
      const cached = localStorage.getItem(CACHE_KEY);
      const timestamp = localStorage.getItem(CACHE_TIMESTAMP_KEY);
      
      if (cached && timestamp) {
        const age = Date.now() - parseInt(timestamp);
        if (age < CACHE_DURATION) {
          return JSON.parse(cached);
        }
      }
    } catch (error) {
      console.error('Cache read error:', error);
    }
    return null;
  };

  const setCachedData = (data) => {
    try {
      localStorage.setItem(CACHE_KEY, JSON.stringify(data));
      localStorage.setItem(CACHE_TIMESTAMP_KEY, Date.now().toString());
    } catch (error) {
      console.error('Cache write error:', error);
    }
  };

  // Extract video ID from YouTube URL
  const extractVideoId = (url) => {
    if (!url) return null;
    const match = url.match(/(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/);
    return match ? match[1] : null;
  };

  // Get embed URL from video URL
  const getEmbedUrl = (url) => {
    const videoId = extractVideoId(url);
    return videoId ? `https://www.youtube.com/embed/${videoId}?autoplay=1` : null;
  };

  // Auto-assign categories based on video title/description
  const assignCategory = (video) => {
    const text = `${video.title} ${video.description}`.toLowerCase();
    
    if (text.match(/exam|nda|preparation|strategy|test|study/i)) return 'Exam Preparation';
    if (text.match(/motivat|inspir|discipline|success/i)) return 'Motivational';
    if (text.match(/fitness|health|physical|exercise|workout/i)) return 'Fitness & Health';
    if (text.match(/leadership|leader|command|management/i)) return 'Leadership';
    if (text.match(/military|combat|defense|forces|strategy|tactical/i)) return 'Military Strategy';
    if (text.match(/success story|journey|achievement|selection/i)) return 'Success Stories';
    
    return 'General';
  };

  // Extract categories and channels from videos
  const extractCategoriesAndChannels = (videosList) => {
    // Extract unique categories
    const uniqueCategories = ['All', ...new Set(videosList.map(v => v.category))];
    
    // Extract unique channels
    const uniqueChannels = Array.from(
      new Map(
        videosList.map(v => [v.channel_id, { name: v.channel, channel_id: v.channel_id }])
      ).values()
    );
    
    return { categories: uniqueCategories, channels: uniqueChannels };
  };

  // Load videos from Firebase
  const loadVideos = async (useCache = true) => {
    try {
      setLoading(true);
      setError(null);

      // Try cache first
      if (useCache) {
        const cached = getCachedData();
        if (cached) {
          console.log('📦 Loading videos from cache');
          setVideos(cached.videos);
          setChannels(cached.channels);
          
          // CRITICAL FIX: Extract and set categories from cached videos
          const { categories: extractedCategories } = extractCategoriesAndChannels(cached.videos);
          setCategories(extractedCategories);
          
          setLoading(false);
          return;
        }
      }

      // Fetch from Firebase
      console.log('🔄 Fetching videos from Firebase');
      const q = query(
        collection(db, "videos"),
        orderBy("created_at", "desc")
      );

      const snapshot = await getDocs(q);
      const fetchedVideos = snapshot.docs.map(doc => {
        const data = doc.data();
        const videoId = extractVideoId(data.video_url);
        const category = assignCategory(data);
        
        return {
          id: doc.id,
          title: data.title,
          description: data.description,
          thumbnail: data.thumbnail_url || `https://i.ytimg.com/vi/${videoId}/hqdefault.jpg`,
          videoUrl: data.video_url,
          embedUrl: getEmbedUrl(data.video_url),
          category: category,
          channel: data.channel_name,
          channel_id: data.channel_id
        };
      });

      // Extract categories and channels
      const { categories: extractedCategories, channels: extractedChannels } = extractCategoriesAndChannels(fetchedVideos);
      
      setCategories(extractedCategories);
      setChannels(extractedChannels);
      setVideos(fetchedVideos);
      
      // Cache the data with categories and channels
      setCachedData({ 
        videos: fetchedVideos, 
        channels: extractedChannels,
        categories: extractedCategories // Also cache categories for consistency
      });
      
      console.log('✅ Videos loaded and cached successfully');
    } catch (error) {
      console.error('Error loading videos:', error);
      setError('Failed to load videos. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  // Filter videos by category
  useEffect(() => {
    if (activeCategory === 'All') {
      setFilteredVideos(videos);
    } else {
      setFilteredVideos(videos.filter(video => video.category === activeCategory));
    }
    setDisplayCount(VIDEOS_PER_PAGE); // Reset pagination when category changes
  }, [activeCategory, videos]);

  // Initial load
  useEffect(() => {
    loadVideos();
  }, []);

  const handleLoadMore = () => {
    setDisplayCount(prev => prev + VIDEOS_PER_PAGE);
  };

  const displayedVideos = filteredVideos.slice(0, displayCount);
  const hasMore = displayCount < filteredVideos.length;

  return (
    <section className={`py-16 md:py-20 ${theme.backgrounds.white} relative overflow-hidden`}>
      {/* Background Elements */}
      <div className={`absolute top-0 right-0 w-96 h-96 ${theme.backgrounds.primary} rounded-full filter blur-3xl opacity-40`}></div>
      <div className={`absolute bottom-0 left-0 w-96 h-96 ${theme.backgrounds.primary} rounded-full filter blur-3xl opacity-40`}></div>
      
      <div className="container mx-auto px-4 max-w-7xl relative z-10">
        {/* Section Header */}
        <div className="text-center mb-10">
          <div className={`inline-flex items-center gap-2 px-5 py-2 ${theme.badges.primary} rounded-full text-sm font-semibold mb-4 ${theme.shadows.lg}`}>
            <Play className="w-4 h-4 fill-white" />
            Video Library
          </div>
          <h2 className={`text-4xl md:text-5xl font-black ${theme.text.primary} mb-3`}>
            Educational <span className={`bg-gradient-to-r ${theme.gradients.primary} bg-clip-text text-transparent`}>Videos</span>
          </h2>
          <p className={`${theme.text.secondary} text-lg max-w-2xl mx-auto`}>
            Watch expert guidance, strategies, and motivational content from our YouTube channels
          </p>
        </div>

        {/* Loading State */}
        {loading && (
          <div className="text-center py-20">
            <Loader className="w-12 h-12 text-orange-500 animate-spin mx-auto mb-4" />
            <p className={`${theme.text.secondary} font-semibold`}>Loading videos...</p>
          </div>
        )}

        {/* Error State */}
        {error && (
          <div className="text-center py-20">
            <div className="bg-red-50 border-2 border-red-200 rounded-2xl p-8 max-w-md mx-auto">
              <p className="text-red-600 font-semibold mb-4">{error}</p>
              <button 
                onClick={() => loadVideos(false)}
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
            {/* Category Filters - ALWAYS SHOW when videos exist */}
            {videos.length > 0 && categories.length > 1 && (
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

            {/* Videos Grid */}
            {displayedVideos.length > 0 ? (
              <>
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 mb-12">
                  {displayedVideos.map((video) => (
                    <div key={video.id} className="group">
                      <div className={`${theme.cards.elevated} rounded-2xl overflow-hidden transition-all duration-300`}>
                        {/* Video Thumbnail/Embed */}
                        <div className={`relative aspect-video ${theme.backgrounds.dark}`}>
                          {playingVideo === video.id ? (
                            <iframe
                              className="w-full h-full"
                              src={video.embedUrl}
                              title={video.title}
                              frameBorder="0"
                              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                              allowFullScreen
                            ></iframe>
                          ) : (
                            <>
                              <img 
                                src={video.thumbnail}
                                alt={video.title}
                                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                                onError={(e) => {
                                  e.target.src = 'https://via.placeholder.com/480x360?text=Video+Thumbnail';
                                }}
                              />
                              {/* Overlay */}
                              <div className={`absolute inset-0 bg-gradient-to-t ${theme.gradients.overlay}`}></div>
                              
                              {/* Play Button */}
                              <button 
                                onClick={() => setPlayingVideo(video.id)}
                                className="absolute inset-0 flex items-center justify-center group-hover:scale-110 transition-transform"
                                aria-label={`Play ${video.title}`}
                              >
                                <div className={`w-20 h-20 bg-gradient-to-br ${theme.gradients.primary} rounded-full flex items-center justify-center ${theme.shadows.xl} hover:scale-110 transition-all`}>
                                  <Play className={`w-8 h-8 ${theme.text.white} fill-white ml-1`} />
                                </div>
                              </button>

                              {/* Channel Badge */}
                              <div className={`absolute top-3 left-3 px-3 py-1 bg-gradient-to-r ${theme.gradients.primary} ${theme.text.white} text-xs font-bold rounded-full ${theme.shadows.lg}`}>
                                {video.channel}
                              </div>
                            </>
                          )}
                        </div>

                        {/* Video Info */}
                        <div className="p-5">
                          <div className="mb-3">
                            <span className={`inline-block px-3 py-1 ${theme.badges.light} text-xs font-bold rounded-full`}>
                              {video.category}
                            </span>
                          </div>
                          <h3 className={`text-lg font-bold ${theme.text.primary} mb-3 line-clamp-2 group-hover:${theme.text.brand} transition-colors`}>
                            {video.title}
                          </h3>
                          <p className={`text-sm ${theme.text.secondary} line-clamp-2`}>
                            {video.description}
                          </p>
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
                      Load More Videos ({filteredVideos.length - displayCount} more)
                    </button>
                  </div>
                )}
              </>
            ) : (
              <div className="text-center py-20">
                <Play className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-2xl font-bold text-gray-900 mb-2">No videos found</h3>
                <p className={`${theme.text.secondary}`}>
                  {activeCategory === 'All' 
                    ? 'No videos available at the moment.'
                    : `No videos found in the "${activeCategory}" category.`}
                </p>
              </div>
            )}

            {/* YouTube Channels */}
            {videos.length > 0 && channels.length > 0 && (
              <div className={`bg-gradient-to-br ${theme.gradients.light} rounded-3xl p-8 md:p-10 ${theme.shadows.xl} ${theme.borders.light} border`}>
                <div className="flex flex-col lg:flex-row items-center justify-between gap-6">
                  {/* Left Side - Channels */}
                  <div className="flex-1">
                    <h3 className={`text-2xl font-black ${theme.text.primary} mb-2 flex items-center gap-3`}>
                      <Youtube className={`w-8 h-8 ${theme.text.brand}`} />
                      Subscribe to Our Channels
                    </h3>
                    <p className={`${theme.text.secondary} mb-5`}>Get notified about new educational content and live sessions</p>
                    
                    <div className="flex flex-col sm:flex-row gap-4">
                      {channels.map((channel, idx) => (
                        <a 
                          key={channel.channel_id}
                          href={`https://www.youtube.com/channel/${channel.channel_id}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className={`inline-flex items-center justify-center gap-3 ${getButton(idx === 0 ? 'primary' : 'outline')} group`}
                        >
                          <Youtube className="w-5 h-5" />
                          {channel.name}
                          <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                        </a>
                      ))}
                    </div>
                  </div>

                  {/* Right Side - View All Button */}
                  <div className={`lg:border-l ${theme.borders.dark} lg:pl-8`}>
                    <a
                      href={channels.length > 0 ? `https://www.youtube.com/channel/${channels[0].channel_id}` : '#'}
                      target="_blank"
                      rel="noopener noreferrer"
                      className={`inline-flex items-center gap-3 ${getButton('dark')} group whitespace-nowrap`}
                    >
                      <Play className="w-6 h-6" />
                      View All Videos
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

export default VideosSection;