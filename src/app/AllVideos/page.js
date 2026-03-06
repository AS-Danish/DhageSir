"use client";
import React, { useState, useEffect } from 'react';
import { Video, Search, Youtube, Loader, Play, ChevronDown } from 'lucide-react';
import { db } from '../../firebase/firebaseConfig';
import { collection, getDocs, query, orderBy, limit, startAfter, enableIndexedDbPersistence } from 'firebase/firestore';

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

const VIDEOS_PER_PAGE = 12;

// Channel tabs
const CHANNEL_TABS = [
  { id: 'all', name: 'All Videos', channel_id: null },
  { id: 'dhage', name: 'Dr Satish Dhage', channel_id: 'UCgXrITZ6XnP_thbBey-enOA' },
  { id: 'mentors', name: 'The Mentors Forum', channel_id: 'UC6hqtj38jmIqhx1e3POVu8w' }
];

const VideosPage = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedChannel, setSelectedChannel] = useState('all');
  const [videos, setVideos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState(null);
  const [lastDoc, setLastDoc] = useState(null);
  const [hasMore, setHasMore] = useState(true);
  const [totalCount, setTotalCount] = useState(0);

  // Extract YouTube video ID from URL
  const getYouTubeVideoId = (url) => {
    if (!url) return null;
    const match = url.match(/(?:youtu\.be\/|youtube\.com\/(?:embed\/|v\/|watch\?v=|watch\?.+&v=|shorts\/))([^"&?\/\s]{11})/);
    return match ? match[1] : null;
  };

  // Fetch initial videos from Firebase with caching
  const fetchVideosFromFirebase = async () => {
    try {
      // Check cache first
      const cachedVideos = localStorage.getItem('all_videos_cache');
      const cacheTimestamp = localStorage.getItem('all_videos_cache_timestamp');

      // Use cache if it's less than 5 minutes old
      if (cachedVideos && cacheTimestamp) {
        const cacheAge = Date.now() - parseInt(cacheTimestamp);
        if (cacheAge < 5 * 60 * 1000) { // 5 minutes
          console.log('Loading videos from cache');
          const cachedData = JSON.parse(cachedVideos);
          setVideos(cachedData.videos);
          setTotalCount(cachedData.totalCount);
          setLastDoc(cachedData.lastDoc);
          setHasMore(cachedData.hasMore);
          setLoading(false);
          return;
        }
      }

      // No valid cache, fetch from Firebase
      await fetchAndCacheVideos();
    } catch (err) {
      console.error('Error loading videos:', err);
      setError('Failed to load videos. Please try again later.');
      setLoading(false);
    }
  };

  // Fetch and cache videos from Firebase
  const fetchAndCacheVideos = async () => {
    try {
      // Get total count first (with persistence, this will use cache when offline)
      const countSnapshot = await getDocs(collection(db, "videos"));
      const total = countSnapshot.size;
      setTotalCount(total);

      // Query videos with pagination - sorting by published_at_iso for actual video date
      // Using "desc" to show LATEST videos first (newest to oldest)
      const videosQuery = query(
        collection(db, "videos"),
        orderBy("published_at_iso", "desc"),
        limit(VIDEOS_PER_PAGE)
      );

      const querySnapshot = await getDocs(videosQuery);

      // Check if data came from cache or server
      const source = querySnapshot.metadata.fromCache ? 'cache' : 'server';
      console.log(`📦 Videos loaded from ${source}`);

      const videosData = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));

      const lastVisible = querySnapshot.docs[querySnapshot.docs.length - 1];

      // Update state
      setVideos(videosData);
      setLastDoc(lastVisible);
      setHasMore(videosData.length === VIDEOS_PER_PAGE && videosData.length < total);
      setLoading(false);

      // Also cache in localStorage as backup
      const cacheData = {
        videos: videosData,
        totalCount: total,
        hasMore: videosData.length === VIDEOS_PER_PAGE && videosData.length < total,
        lastDoc: lastVisible ? lastVisible.id : null
      };
      localStorage.setItem('all_videos_cache', JSON.stringify(cacheData));
      localStorage.setItem('all_videos_cache_timestamp', Date.now().toString());

      console.log('✅ Videos fetched and cached successfully');
    } catch (err) {
      console.error('Error fetching videos from Firebase:', err);
      setError('Failed to load videos from database.');
      setLoading(false);
    }
  };

  // Load more videos
  const loadMoreVideos = async () => {
    if (!hasMore || loadingMore || !lastDoc) return;

    try {
      setLoadingMore(true);

      const videosQuery = query(
        collection(db, "videos"),
        orderBy("published_at_iso", "desc"),
        startAfter(lastDoc),
        limit(VIDEOS_PER_PAGE)
      );

      const querySnapshot = await getDocs(videosQuery);

      // Check if data came from cache or server
      const source = querySnapshot.metadata.fromCache ? 'cache' : 'server';
      console.log(`📦 More videos loaded from ${source}`);

      const newVideos = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));

      const lastVisible = querySnapshot.docs[querySnapshot.docs.length - 1];

      setVideos(prev => [...prev, ...newVideos]);
      setLastDoc(lastVisible);
      setHasMore(newVideos.length === VIDEOS_PER_PAGE && (videos.length + newVideos.length) < totalCount);
    } catch (err) {
      console.error('Error loading more videos:', err);
    } finally {
      setLoadingMore(false);
    }
  };

  useEffect(() => {
    fetchVideosFromFirebase();
  }, []);

  const filteredVideos = videos.filter(video => {
    const matchesSearch = video.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      video.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (video.channel_name && video.channel_name.toLowerCase().includes(searchQuery.toLowerCase()));

    const selectedTab = CHANNEL_TABS.find(tab => tab.id === selectedChannel);
    const matchesChannel = selectedChannel === 'all' ||
      (selectedTab && video.channel_id === selectedTab.channel_id);

    return matchesSearch && matchesChannel;
  });

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 pt-20">
        <div className="flex flex-col items-center justify-center py-40">
          <Loader className="w-16 h-16 text-orange-500 animate-spin mb-4" />
          <p className="text-gray-600 font-semibold text-lg">Loading videos...</p>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 pt-20">
        <div className="flex flex-col items-center justify-center py-40">
          <Video className="w-16 h-16 text-gray-300 mb-4" />
          <p className="text-red-600 font-semibold mb-4 text-lg">{error}</p>
          <button
            onClick={fetchVideosFromFirebase}
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
                  placeholder="Search videos..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-12 pr-4 py-3 border-2 border-gray-200 rounded-xl focus:border-orange-500 focus:outline-none transition-colors text-black"
                />
              </div>

              {/* Video Count */}
              <div className="flex items-center gap-2">
                <Youtube className="w-6 h-6 text-orange-600" />
                <span className="text-gray-600 font-semibold">
                  Total: <span className="text-orange-600 font-bold">{totalCount}</span> videos
                </span>
              </div>
            </div>

            {/* Channel Tabs */}
            <div className="flex gap-2 overflow-x-auto pb-2 md:pb-0">
              {CHANNEL_TABS.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setSelectedChannel(tab.id)}
                  className={`px-6 py-3 rounded-xl font-bold whitespace-nowrap transition-all ${selectedChannel === tab.id
                      ? 'bg-gradient-to-r from-orange-500 to-orange-600 text-white shadow-xl'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                >
                  {tab.name}
                </button>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Videos Grid */}
      <section className="py-16 md:py-20">
        <div className="container mx-auto px-4 max-w-7xl">
          <div className="flex items-center justify-between mb-8">
            <h2 className={`text-3xl md:text-4xl font-black ${theme.text.primary}`}>
              All Videos
              <span className={`${theme.text.brand} ml-2`}>({filteredVideos.length})</span>
            </h2>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredVideos.map((video, index) => {
              const videoId = getYouTubeVideoId(video.video_url);
              // Use combination of video.id and index to ensure unique keys
              const uniqueKey = `${video.id}-${index}`;

              return (
                <div key={uniqueKey} className="group relative">
                  <div className={`${theme.cards.elevated} rounded-2xl overflow-hidden transition-all duration-300 hover:-translate-y-2`}>
                    {/* Video Embed */}
                    <div className="relative overflow-hidden aspect-video bg-gray-900">
                      {videoId ? (
                        <iframe
                          src={`https://www.youtube.com/embed/${videoId}`}
                          title={video.title}
                          frameBorder="0"
                          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                          allowFullScreen
                          className="w-full h-full"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <img
                            src={video.thumbnail_url || 'https://via.placeholder.com/640x360?text=Video'}
                            alt={video.title}
                            className="w-full h-full object-cover"
                            onError={(e) => {
                              e.target.src = 'https://via.placeholder.com/640x360?text=Video';
                            }}
                          />
                          <div className="absolute inset-0 flex items-center justify-center bg-black/30">
                            <Play className="w-16 h-16 text-white opacity-70" />
                          </div>
                        </div>
                      )}

                      {/* Channel Badge */}
                      {video.channel_name && (
                        <div className="absolute top-4 left-4">
                          <span className={`px-3 py-1 ${theme.backgrounds.white} backdrop-blur-sm ${theme.text.primary} text-xs font-bold rounded-full ${theme.shadows.lg} flex items-center gap-1`}>
                            <Youtube className="w-3 h-3 text-orange-600" />
                            {video.channel_name}
                          </span>
                        </div>
                      )}
                    </div>

                    {/* Video Info */}
                    <div className="p-6">
                      <h3 className={`text-xl font-bold ${theme.text.primary} mb-3 line-clamp-2 min-h-[56px]`}>
                        {video.title}
                      </h3>
                      <p className={`${theme.text.secondary} text-sm leading-relaxed mb-5 line-clamp-3`}>
                        {video.description || ''}
                      </p>

                      {/* Watch Button */}
                      {video.video_url && (
                        <a
                          href={video.video_url}
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
          {hasMore && !searchQuery && (
            <div className="text-center mt-12">
              <button
                onClick={loadMoreVideos}
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
                    Load More Videos ({totalCount - videos.length} remaining)
                  </>
                )}
              </button>
            </div>
          )}

          {/* Empty State */}
          {filteredVideos.length === 0 && (
            <div className="text-center py-20">
              <Video className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-2xl font-bold text-gray-900 mb-2">No videos found</h3>
              <p className="text-gray-600">Try adjusting your search criteria</p>
            </div>
          )}
        </div>
      </section>
    </div>
  );
};

export default VideosPage;