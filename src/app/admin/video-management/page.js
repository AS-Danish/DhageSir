"use client";
import React, { useState, useEffect } from 'react';
import { Video, Edit2, Trash2, X, Save, RefreshCw, Youtube, Loader, Link, AlertCircle, ChevronDown } from 'lucide-react';
import { db } from '../../../firebase/firebaseConfig';
import { collection, getDocs, addDoc, updateDoc, deleteDoc, doc, query, orderBy, limit, startAfter, where, enableIndexedDbPersistence } from 'firebase/firestore';

// 🎯 HARDCODED CHANNELS
const HARDCODED_CHANNELS = [
  {
    name: "Dr Satish Dhage",
    channel_id: "UCgXrITZ6XnP_thbBey-enOA",
  },
  {
    name: "The Mentors Forum",
    channel_id: "UC6hqtj38jmIqhx1e3POVu8w",
  }
];

// Pagination config
const VIDEOS_PER_PAGE = 9;

const theme = {
  gradients: {
    primary: 'from-orange-500 to-orange-600',
  },
  cards: {
    elevated: 'bg-white shadow-xl',
  },
};

const getButton = (variant = 'primary') => {
  const variants = {
    primary: 'bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white rounded-xl py-3 px-6 font-bold transition-all hover:scale-105 hover:shadow-2xl',
    secondary: 'bg-gray-100 hover:bg-gray-200 text-gray-900 rounded-xl py-3 px-6 font-bold transition-all',
    danger: 'bg-orange-500 hover:bg-orange-600 text-white rounded-xl py-3 px-6 font-bold transition-all',
    success: 'bg-green-500 hover:bg-green-600 text-white rounded-xl py-3 px-6 font-bold transition-all',
  };
  return variants[variant];
};

const AdminVideosPage = () => {
  const [editingVideo, setEditingVideo] = useState(null);
  const [loading, setLoading] = useState(false);
  const [fetchingVideos, setFetchingVideos] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  const [lastFetchTime, setLastFetchTime] = useState(null);
  const [fetchError, setFetchError] = useState(null);

  // Pagination state per channel
  const [channelPagination, setChannelPagination] = useState({});
  const [loadingMore, setLoadingMore] = useState({});

  // Videos State - organized by channel
  const [videosByChannel, setVideosByChannel] = useState({});
  const [totalCounts, setTotalCounts] = useState({});

  // Form State
  const [videoForm, setVideoForm] = useState({
    title: '',
    description: '',
    video_url: '',
    thumbnail_url: '',
    channel_name: '',
  });

  // Cache helpers
  const getCacheKey = (channelId, page) => `videos_${channelId}_page_${page}`;
  const getCountCacheKey = (channelId) => `video_count_${channelId}`;

  const getCachedData = (key, maxAge = 5 * 60 * 1000) => {
    try {
      const cached = localStorage.getItem(key);
      const timestamp = localStorage.getItem(`${key}_timestamp`);

      if (cached && timestamp) {
        const age = Date.now() - parseInt(timestamp);
        if (age < maxAge) {
          return JSON.parse(cached);
        }
      }
    } catch (error) {
      console.error('Cache read error:', error);
    }
    return null;
  };

  const setCachedData = (key, data) => {
    try {
      localStorage.setItem(key, JSON.stringify(data));
      localStorage.setItem(`${key}_timestamp`, Date.now().toString());
    } catch (error) {
      console.error('Cache write error:', error);
    }
  };

  const invalidateCache = () => {
    try {
      const keys = Object.keys(localStorage);
      keys.forEach(key => {
        if (key.startsWith('videos_') || key.startsWith('video_count_')) {
          localStorage.removeItem(key);
          localStorage.removeItem(`${key}_timestamp`);
        }
      });
    } catch (error) {
      console.error('Cache invalidation error:', error);
    }
  };

  // Parse YouTube RSS
  const parseYouTubeRSS = async (channelId, retries = 2) => {
    const RSS_URL = `https://www.youtube.com/feeds/videos.xml?channel_id=${channelId}`;
    const CORS_PROXY = 'https://api.allorigins.win/raw?url=';

    for (let attempt = 0; attempt <= retries; attempt++) {
      try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 10000);

        const response = await fetch(CORS_PROXY + encodeURIComponent(RSS_URL), {
          signal: controller.signal,
        });

        clearTimeout(timeoutId);

        if (!response.ok) {
          throw new Error(`HTTP ${response.status}`);
        }

        const text = await response.text();
        const parser = new DOMParser();
        const xml = parser.parseFromString(text, 'text/xml');

        const parserError = xml.querySelector('parsererror');
        if (parserError) {
          throw new Error('XML parsing error');
        }

        const entries = xml.querySelectorAll('entry');
        const videos = [];

        entries.forEach((entry) => {
          const videoId = entry.querySelector('videoId')?.textContent || '';
          const title = entry.querySelector('title')?.textContent || '';
          const description = entry.querySelector('group description')?.textContent ||
            entry.querySelector('media\\:description')?.textContent || '';

          let thumbnailUrl = entry.querySelector('media\\:thumbnail')?.getAttribute('url') ||
            entry.querySelector('thumbnail')?.getAttribute('url') ||
            `https://i.ytimg.com/vi/${videoId}/hqdefault.jpg`;

          const videoUrl = `https://www.youtube.com/watch?v=${videoId}`;

          if (videoId && title) {
            videos.push({
              title,
              description: description || 'No description available',
              video_url: videoUrl,
              thumbnail_url: thumbnailUrl,
              video_id: videoId,
            });
          }
        });

        return videos;
      } catch (error) {
        console.warn(`Attempt ${attempt + 1} failed for ${channelId}:`, error.message);

        if (attempt === retries) {
          throw new Error(`Failed after ${retries + 1} attempts: ${error.message}`);
        }

        await new Promise(resolve => setTimeout(resolve, 1000 * (attempt + 1)));
      }
    }
  };

  // Get total count for a channel
  const getChannelVideoCount = async (channelId) => {
    const cacheKey = getCountCacheKey(channelId);
    const cached = getCachedData(cacheKey, 10 * 60 * 1000); // 10 min cache

    if (cached !== null) {
      return cached;
    }

    const q = query(
      collection(db, "videos"),
      where("channel_id", "==", channelId)
    );
    const snapshot = await getDocs(q);
    const count = snapshot.size;

    setCachedData(cacheKey, count);
    return count;
  };

  // Load videos for a specific channel with pagination
  const loadChannelVideos = async (channelId, page = 1, useCache = true) => {
    try {
      const cacheKey = getCacheKey(channelId, page);

      if (useCache) {
        const cached = getCachedData(cacheKey);
        if (cached) {
          return cached;
        }
      }

      const q = query(
        collection(db, "videos"),
        where("channel_id", "==", channelId),
        orderBy("created_at", "desc"),
        limit(VIDEOS_PER_PAGE * page)
      );

      const snapshot = await getDocs(q);
      const videos = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));

      setCachedData(cacheKey, videos);
      return videos;
    } catch (error) {
      console.error(`Error loading videos for ${channelId}:`, error);
      return [];
    }
  };

  // Load more videos for a channel
  const handleLoadMore = async (channelId) => {
    setLoadingMore(prev => ({ ...prev, [channelId]: true }));

    try {
      const currentPage = channelPagination[channelId] || 1;
      const nextPage = currentPage + 1;

      const videos = await loadChannelVideos(channelId, nextPage, false);

      setVideosByChannel(prev => ({
        ...prev,
        [channelId]: videos
      }));

      setChannelPagination(prev => ({
        ...prev,
        [channelId]: nextPage
      }));
    } catch (error) {
      console.error('Error loading more videos:', error);
    } finally {
      setLoadingMore(prev => ({ ...prev, [channelId]: false }));
    }
  };

  // Auto-fetch videos from all channels
  const autoFetchAllChannels = async () => {
    try {
      setFetchingVideos(true);
      setFetchError(null);

      let totalAdded = 0;
      let totalSkipped = 0;
      const errors = [];

      for (let i = 0; i < HARDCODED_CHANNELS.length; i++) {
        const channel = HARDCODED_CHANNELS[i];

        try {
          console.log(`📥 Fetching videos from ${channel.name}...`);

          const fetchedVideos = await parseYouTubeRSS(channel.channel_id);

          // Get existing videos to check for duplicates
          const existingQuery = query(
            collection(db, "videos"),
            where("channel_id", "==", channel.channel_id)
          );
          const existingSnapshot = await getDocs(existingQuery);
          const existingUrls = new Set(existingSnapshot.docs.map(doc => doc.data().video_url));

          for (const video of fetchedVideos) {
            if (!existingUrls.has(video.video_url)) {
              const videoData = {
                ...video,
                channel_id: channel.channel_id,
                channel_name: channel.name,
                created_at: new Date().toISOString(),
              };

              await addDoc(collection(db, "videos"), videoData);
              totalAdded++;
            } else {
              totalSkipped++;
            }
          }

          console.log(`✅ ${channel.name}: ${fetchedVideos.length} videos fetched`);

          if (i < HARDCODED_CHANNELS.length - 1) {
            await new Promise(resolve => setTimeout(resolve, 1000));
          }
        } catch (error) {
          console.error(`❌ Error fetching from ${channel.name}:`, error);
          errors.push({ channel: channel.name, error: error.message });
        }
      }

      // Invalidate cache and reload
      invalidateCache();
      await loadAllChannels();

      const now = new Date().toISOString();
      localStorage.setItem('videos_last_fetch', now);
      setLastFetchTime(now);

      if (errors.length > 0) {
        const errorMsg = errors.map(e => `${e.channel}: ${e.error}`).join('\n');
        setFetchError(`Some channels failed:\n${errorMsg}`);
      }

      return { totalAdded, totalSkipped, errors };
    } catch (error) {
      console.error('Error auto-fetching videos:', error);
      setFetchError(error.message);
      throw error;
    } finally {
      setFetchingVideos(false);
    }
  };

  // Load all channels initial data
  const loadAllChannels = async () => {
    const channelData = {};
    const counts = {};
    const pagination = {};

    for (const channel of HARDCODED_CHANNELS) {
      const videos = await loadChannelVideos(channel.channel_id, 1);
      const count = await getChannelVideoCount(channel.channel_id);

      channelData[channel.channel_id] = videos;
      counts[channel.channel_id] = count;
      pagination[channel.channel_id] = 1;
    }

    setVideosByChannel(channelData);
    setTotalCounts(counts);
    setChannelPagination(pagination);
  };

  // Manual refresh
  const handleManualRefresh = async () => {
    try {
      const result = await autoFetchAllChannels();

      if (result.errors.length > 0) {
        alert(`Videos refreshed with some errors:\n${result.errors.map(e => e.channel).join(', ')} failed.\n\nAdded: ${result.totalAdded}, Skipped: ${result.totalSkipped}`);
      } else {
        alert(`Videos refreshed successfully!\nAdded: ${result.totalAdded}, Skipped: ${result.totalSkipped}`);
      }
    } catch (error) {
      alert('Failed to refresh videos. Please try again.');
    }
  };

  // Update video
  const handleUpdateVideo = async () => {
    if (!videoForm.title || !videoForm.video_url) {
      alert('Please fill in all required fields (Title, Video URL)');
      return;
    }

    try {
      setLoading(true);

      const videoData = {
        title: videoForm.title,
        description: videoForm.description,
        video_url: videoForm.video_url,
        thumbnail_url: videoForm.thumbnail_url || 'https://via.placeholder.com/480x360?text=No+Thumbnail',
        updated_at: new Date().toISOString(),
      };

      await updateDoc(doc(db, "videos", editingVideo.id), videoData);

      // Update local state
      const channelId = editingVideo.channel_id;
      setVideosByChannel(prev => ({
        ...prev,
        [channelId]: prev[channelId].map(v =>
          v.id === editingVideo.id ? { ...v, ...videoData } : v
        )
      }));

      invalidateCache();
      resetVideoForm();
      setEditingVideo(null);
      alert('Video updated successfully!');
    } catch (error) {
      console.error('Error updating video:', error);
      alert('Failed to update video: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  // Delete video
  const handleDeleteVideo = async (id, channelId) => {
    if (!window.confirm('Are you sure you want to delete this video?')) {
      return;
    }

    try {
      setLoading(true);

      await deleteDoc(doc(db, "videos", id));

      setVideosByChannel(prev => ({
        ...prev,
        [channelId]: prev[channelId].filter(v => v.id !== id)
      }));

      setTotalCounts(prev => ({
        ...prev,
        [channelId]: (prev[channelId] || 1) - 1
      }));

      invalidateCache();
      alert('Video deleted successfully!');
    } catch (error) {
      console.error('Error deleting video:', error);
      alert('Failed to delete video: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const startEditVideo = (video) => {
    setEditingVideo(video);
    setVideoForm({
      title: video.title,
      description: video.description,
      video_url: video.video_url,
      thumbnail_url: video.thumbnail_url,
      channel_name: video.channel_name,
    });
  };

  const resetVideoForm = () => {
    setVideoForm({
      title: '',
      description: '',
      video_url: '',
      thumbnail_url: '',
      channel_name: '',
    });
    setEditingVideo(null);
  };

  // Initial load
  useEffect(() => {
    const loadData = async () => {
      setInitialLoading(true);
      try {
        await loadAllChannels();

        const lastFetch = localStorage.getItem('videos_last_fetch');
        const shouldAutoFetch = !lastFetch ||
          (new Date() - new Date(lastFetch)) > 60 * 60 * 1000;

        if (shouldAutoFetch) {
          console.log('⏰ Auto-fetching latest videos...');
          setTimeout(() => {
            autoFetchAllChannels().catch(err => {
              console.error('Background fetch failed:', err);
              setFetchError('Failed to auto-fetch videos. Click Refresh to try again.');
            });
          }, 1000);
        } else {
          setLastFetchTime(lastFetch);
        }
      } catch (error) {
        console.error('Error loading data:', error);
        setFetchError('Failed to load videos from database');
      } finally {
        setInitialLoading(false);
      }
    };

    loadData();
  }, []);

  const totalVideos = Object.values(totalCounts).reduce((sum, count) => sum + count, 0);

  if (initialLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Loader className="w-12 h-12 text-orange-500 animate-spin mx-auto mb-4" />
          <p className="text-gray-600 font-semibold">Loading videos...</p>
          <p className="text-gray-500 text-sm mt-2">Please wait...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Loading Overlay */}
      {(loading || fetchingVideos) && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center">
          <div className="bg-white rounded-2xl p-8 flex flex-col items-center">
            <Loader className="w-12 h-12 text-orange-500 animate-spin mb-4" />
            <p className="text-gray-900 font-bold">
              {fetchingVideos ? 'Fetching videos from YouTube...' : 'Processing...'}
            </p>
            <p className="text-gray-600 text-sm mt-2">This may take a moment</p>
          </div>
        </div>
      )}

      {/* Header */}
      <div className={`bg-gradient-to-r ${theme.gradients.primary} py-8 shadow-xl`}>
        <div className="container mx-auto px-4 max-w-7xl">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-4xl font-black text-white mb-2">Videos Management</h1>
              <p className="text-orange-100">Auto-synced with YouTube channels</p>
              {lastFetchTime && (
                <p className="text-orange-200 text-sm mt-1">
                  Last updated: {new Date(lastFetchTime).toLocaleString()}
                </p>
              )}
            </div>
            <div className="flex items-center gap-4">
              <button
                onClick={handleManualRefresh}
                disabled={fetchingVideos}
                className={`inline-flex items-center gap-2 ${getButton('secondary')} disabled:opacity-50`}
              >
                <RefreshCw className={`w-5 h-5 ${fetchingVideos ? 'animate-spin' : ''}`} />
                Refresh Videos
              </button>
              <Video className="w-16 h-16 text-white opacity-50" />
            </div>
          </div>
        </div>
      </div>

      {/* Error Banner */}
      {fetchError && (
        <div className="bg-yellow-50 border-l-4 border-yellow-400">
          <div className="container mx-auto px-4 max-w-7xl py-3">
            <div className="flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" />
              <div className="flex-1">
                <p className="text-sm font-medium text-yellow-800">Warning</p>
                <p className="text-sm text-yellow-700 whitespace-pre-line">{fetchError}</p>
              </div>
              <button
                onClick={() => setFetchError(null)}
                className="text-yellow-600 hover:text-yellow-800"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Channel Info Banner */}
      <div className="bg-white border-b-2 border-gray-100 shadow-sm">
        <div className="container mx-auto px-4 max-w-7xl py-4">
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div className="flex items-center gap-6">
              {HARDCODED_CHANNELS.map((channel, idx) => (
                <div key={idx} className="flex items-center gap-2">
                  <Youtube className="w-5 h-5 text-orange-600" />
                  <span className="font-bold text-gray-900">{channel.name}</span>
                  <span className="text-sm text-gray-500">
                    ({totalCounts[channel.channel_id] || 0} videos)
                  </span>
                </div>
              ))}
            </div>
            <div className="text-sm text-gray-600">
              Total: <span className="font-bold text-gray-900">{totalVideos}</span> videos
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 max-w-7xl py-8">
        {/* Edit Video Form */}
        {editingVideo && (
          <div className={`${theme.cards.elevated} rounded-2xl p-8 mb-8`}>
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-2xl font-bold text-gray-900">Edit Video</h3>
              <button
                onClick={resetVideoForm}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-bold text-gray-900 mb-2">
                  Video Title *
                </label>
                <input
                  type="text"
                  value={videoForm.title}
                  onChange={(e) => setVideoForm({ ...videoForm, title: e.target.value })}
                  placeholder="Enter video title"
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-orange-500 focus:outline-none transition-colors"
                />
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-900 mb-2">
                  Channel
                </label>
                <input
                  type="text"
                  value={videoForm.channel_name}
                  disabled
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl bg-gray-100 text-gray-600"
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-bold text-gray-900 mb-2">
                  Video URL *
                </label>
                <div className="relative">
                  <Link className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <input
                    type="url"
                    value={videoForm.video_url}
                    onChange={(e) => setVideoForm({ ...videoForm, video_url: e.target.value })}
                    placeholder="https://www.youtube.com/watch?v=..."
                    className="w-full pl-12 pr-4 py-3 border-2 border-gray-200 rounded-xl focus:border-orange-500 focus:outline-none transition-colors"
                  />
                </div>
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-bold text-gray-900 mb-2">
                  Thumbnail URL
                </label>
                <input
                  type="url"
                  value={videoForm.thumbnail_url}
                  onChange={(e) => setVideoForm({ ...videoForm, thumbnail_url: e.target.value })}
                  placeholder="https://i.ytimg.com/vi/..."
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-orange-500 focus:outline-none transition-colors"
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-bold text-gray-900 mb-2">
                  Description
                </label>
                <textarea
                  value={videoForm.description}
                  onChange={(e) => setVideoForm({ ...videoForm, description: e.target.value })}
                  placeholder="Enter video description"
                  rows={4}
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-orange-500 focus:outline-none transition-colors resize-none"
                />
              </div>
            </div>

            {videoForm.thumbnail_url && (
              <div className="mt-6">
                <label className="block text-sm font-bold text-gray-900 mb-2">Preview</label>
                <img
                  src={videoForm.thumbnail_url}
                  alt="Thumbnail Preview"
                  className="w-full max-w-md h-auto rounded-xl shadow-lg"
                  onError={(e) => {
                    e.target.style.display = 'none';
                  }}
                />
              </div>
            )}

            <div className="flex gap-4 mt-6">
              <button
                onClick={handleUpdateVideo}
                disabled={loading}
                className={`inline-flex items-center gap-2 ${getButton('primary')} disabled:opacity-50 disabled:cursor-not-allowed`}
              >
                {loading ? (
                  <Loader className="w-5 h-5 animate-spin" />
                ) : (
                  <Save className="w-5 h-5" />
                )}
                Update Video
              </button>
              <button
                onClick={resetVideoForm}
                className={getButton('secondary')}
              >
                Cancel
              </button>
            </div>
          </div>
        )}

        {/* Videos by Channel */}
        {HARDCODED_CHANNELS.map((channel, idx) => {
          const channelVideos = videosByChannel[channel.channel_id] || [];
          const totalCount = totalCounts[channel.channel_id] || 0;
          const currentPage = channelPagination[channel.channel_id] || 1;
          const hasMore = channelVideos.length < totalCount;
          const isLoadingMore = loadingMore[channel.channel_id];

          return (
            <div key={idx} className="mb-12">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-12 h-12 bg-gradient-to-br from-orange-400 to-orange-600 rounded-xl flex items-center justify-center">
                  <Youtube className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h2 className="text-3xl font-black text-gray-900">{channel.name}</h2>
                  <p className="text-gray-600">
                    Showing {channelVideos.length} of {totalCount} videos
                  </p>
                </div>
              </div>

              {channelVideos.length > 0 ? (
                <>
                  <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {channelVideos.map((video) => (
                      <div key={video.id} className={`${theme.cards.elevated} rounded-2xl overflow-hidden hover:shadow-2xl transition-shadow`}>
                        <div className="relative h-48">
                          <img
                            src={video.thumbnail_url || 'https://via.placeholder.com/480x360?text=No+Thumbnail'}
                            alt={video.title}
                            className="w-full h-full object-cover"
                          />
                          <div className="absolute top-4 right-4">
                            <span className="px-3 py-1 bg-orange-600 text-white text-xs font-bold rounded-full shadow-xl">
                              YouTube
                            </span>
                          </div>
                        </div>

                        <div className="p-6">
                          <h3 className="text-xl font-bold text-gray-900 mb-2 line-clamp-2">
                            {video.title}
                          </h3>
                          <p className="text-gray-600 text-sm mb-4 line-clamp-3">
                            {video.description}
                          </p>
                          {video.video_url && (
                            <a
                              href={video.video_url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-xs text-orange-600 hover:text-orange-700 mb-4 block truncate"
                            >
                              🔗 Watch Video
                            </a>
                          )}<div className="flex gap-2 mt-4">
                            <button
                              onClick={() => startEditVideo(video)}
                              className="flex-1 inline-flex items-center justify-center gap-2 bg-blue-500 hover:bg-blue-600 text-white rounded-xl py-2 px-4 font-bold transition-all"
                            >
                              <Edit2 className="w-4 h-4" />
                              Edit
                            </button>
                            <button
                              onClick={() => handleDeleteVideo(video.id, channel.channel_id)}
                              className="flex-1 inline-flex items-center justify-center gap-2 bg-orange-500 hover:bg-orange-600 text-white rounded-xl py-2 px-4 font-bold transition-all"
                            >
                              <Trash2 className="w-4 h-4" />
                              Delete
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Load More Button */}
                  {hasMore && (
                    <div className="text-center mt-8">
                      <button
                        onClick={() => handleLoadMore(channel.channel_id)}
                        disabled={isLoadingMore}
                        className={`inline-flex items-center gap-2 ${getButton('secondary')} disabled:opacity-50`}
                      >
                        {isLoadingMore ? (
                          <>
                            <Loader className="w-5 h-5 animate-spin" />
                            Loading...
                          </>
                        ) : (
                          <>
                            <ChevronDown className="w-5 h-5" />
                            Load More ({totalCount - channelVideos.length} remaining)
                          </>
                        )}
                      </button>
                    </div>
                  )}
                </>
              ) : (
                <div className="text-center py-12 bg-gray-50 rounded-2xl">
                  <Video className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                  <p className="text-gray-600">No videos found for this channel yet</p>
                  <p className="text-gray-500 text-sm mt-1">Videos will appear automatically when uploaded</p>
                </div>
              )}
            </div>
          );
        })}

        {totalVideos === 0 && (
          <div className="text-center py-20">
            <Video className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-2xl font-bold text-gray-900 mb-2">No videos yet</h3>
            <p className="text-gray-600 mb-6">Click the button below to fetch videos from YouTube</p>
            <button
              onClick={handleManualRefresh}
              disabled={fetchingVideos}
              className={`inline-flex items-center gap-2 ${getButton('primary')} disabled:opacity-50`}
            >
              <RefreshCw className={`w-5 h-5 ${fetchingVideos ? 'animate-spin' : ''}`} />
              Fetch Videos Now
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
export default AdminVideosPage;