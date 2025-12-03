"use client";
import React, { useState, useEffect } from 'react';
import { Video, Plus, Edit2, Trash2, X, Save, Loader, ChevronLeft, ChevronRight, RefreshCw, Youtube, Star } from 'lucide-react';
import { collection, getDocs, addDoc, updateDoc, deleteDoc, doc, query, orderBy, limit, startAfter, endBefore, limitToLast, where, getDoc, setDoc } from 'firebase/firestore';
import { db } from '../../../firebase/firebaseConfig';

// Theme configuration
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
  };
  return variants[variant];
};

// Parse YouTube Playlist RSS
// Simple YouTube Playlist RSS Parser (No CORS Proxy needed)
// src/app/admin/podcast-management/page.js

// Parse YouTube Playlist RSS
// 🚀 MODIFIED: Uses multiple CORS Proxies for redundancy
const parseYouTubePlaylistRSS = async (playlistId, retries = 3) => {
  // This is the YouTube URL we need to fetch
  const RSS_URL = `https://www.youtube.com/feeds/videos.xml?playlist_id=${playlistId}`;

  // List of public CORS proxies to try
  const CORS_PROXIES = [
    'https://api.allorigins.win/raw?url=',
    'https://corsproxy.io/?',
    'https://api.codetabs.com/v1/proxy?quest=',
  ];

  // We try multiple times, cycling through the proxies
  for (let attempt = 0; attempt <= retries; attempt++) {
    // Rotate through proxies on each attempt
    const CORS_PROXY = CORS_PROXIES[attempt % CORS_PROXIES.length];

    try {
      // Set a timeout for the fetch operation (e.g., 15 seconds)
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 15000);

      // Fetch the external RSS URL using the chosen proxy
      const response = await fetch(CORS_PROXY + encodeURIComponent(RSS_URL), {
        signal: controller.signal,
        headers: {
          // Ask for XML content
          'Accept': 'application/xml, text/xml, */*',
        },
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }

      const text = await response.text();

      if (!text || text.trim().length === 0) {
        throw new Error('Empty response received');
      }

      // --- XML Parsing Logic (Original Code) ---
      const parser = new DOMParser();
      const xml = parser.parseFromString(text, 'text/xml');

      const parserError = xml.querySelector('parsererror');
      if (parserError) {
        throw new Error('XML parsing error');
      }

      const entries = xml.querySelectorAll('entry');
      if (entries.length === 0) {
        console.warn('No videos found in playlist');
        return [];
      }

      const podcasts = [];
      entries.forEach((entry) => {
        const videoId = entry.querySelector('videoId')?.textContent ||
          entry.querySelector('yt\\:videoId')?.textContent || '';
        const title = entry.querySelector('title')?.textContent || '';

        const thumbnailUrl = entry.querySelector('media\\:group media\\:thumbnail')?.getAttribute('url') ||
          `https://i.ytimg.com/vi/${videoId}/hqdefault.jpg`;

        const videoUrl = `https://www.youtube.com/watch?v=${videoId}`;

        if (videoId && title) {
          podcasts.push({
            title,
            youtube_url: videoUrl,
            video_id: videoId,
            thumbnail_url: thumbnailUrl,
            platform: 'youtube',
          });
        }
      });

      console.log(`✅ Fetched ${podcasts.length} podcasts from playlist using ${CORS_PROXY}`);
      return podcasts;

    } catch (error) {
      const errorMsg = error.name === 'AbortError' ? 'Request timeout' : error.message;
      console.warn(`Attempt ${attempt + 1}/${retries + 1} failed (${CORS_PROXY}): ${errorMsg}`);

      if (attempt === retries) {
        console.error(`❌ All proxy attempts failed for playlist ${playlistId}.`);
        return [];
      }

      // Wait a moment before trying the next proxy
      await new Promise(resolve => setTimeout(resolve, 1000 + (500 * attempt)));
    }
  }

  return [];
};


// Extract YouTube Video ID from URL
const extractYouTubeID = (url) => {
  const patterns = [
    /(?:youtube\.com\/watch\?v=)([^&\n?#]+)/,
    /(?:youtu\.be\/)([^&\s?]+)/,
    /(?:youtube\.com\/shorts\/)([^&\s?]+)/,
    /(?:youtube\.com\/embed\/)([^&\s?]+)/,
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
  return `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`;
};

// Get YouTube embed URL
const getYouTubeEmbedURL = (videoId) => {
  return `https://www.youtube.com/embed/${videoId}`;
};

const AdminPodcastsPage = () => {
  const [showAddPodcast, setShowAddPodcast] = useState(false);
  const [editingPodcast, setEditingPodcast] = useState(null);
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  const [validatingUrl, setValidatingUrl] = useState(false);

  const [homepagePodcasts, setHomepagePodcasts] = useState([]);
  const [showAddForm, setShowAddForm] = useState(false);
  const [addingPodcast, setAddingPodcast] = useState(false);
  const [fetchingPodcasts, setFetchingPodcasts] = useState(false);
  const [lastFetchTime, setLastFetchTime] = useState(null);
  const [manualPodcastForm, setManualPodcastForm] = useState({
    url: '',
    title: '', // Add this to allow manual title input
  });

  // RSS Feed Configuration for auto-fetching
  const RSS_CONFIG = {
    youtube_playlist_id: 'PLuhKcyouEj88n3mjo1edgApbm4NzfgGI7',
  };

  // Podcasts State
  const [podcasts, setPodcasts] = useState([]);
  const [allPodcastIds, setAllPodcastIds] = useState([]);

  // Pagination State
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(6);
  const [totalPages, setTotalPages] = useState(1);
  const [firstVisible, setFirstVisible] = useState(null);
  const [lastVisible, setLastVisible] = useState(null);

  // Form State
  const [podcastForm, setPodcastForm] = useState({
    title: '',
    youtube_url: '',
    video_id: '',
    thumbnail_url: '',
  });

  const [urlError, setUrlError] = useState('');

  // Helper to invalidate cache
  const invalidateCache = () => {
    localStorage.removeItem('podcasts_cache');
    localStorage.removeItem('podcasts_cache_timestamp');
    localStorage.removeItem('podcasts_ids_cache');
  };

  // Validate and extract YouTube URL
  const validateYouTubeUrl = async (url) => {
    setValidatingUrl(true);
    setUrlError('');

    try {
      const videoId = extractYouTubeID(url);

      if (!videoId) {
        setUrlError('Invalid YouTube URL. Please enter a valid YouTube video URL.');
        setPodcastForm(prev => ({
          ...prev,
          video_id: '',
          thumbnail_url: '',
        }));
        setValidatingUrl(false);
        return false;
      }

      // Check if thumbnail exists (validates video exists)
      const thumbnailUrl = getYouTubeThumbnail(videoId);
      const img = new Image();

      return new Promise((resolve) => {
        img.onload = () => {
          setPodcastForm(prev => ({
            ...prev,
            video_id: videoId,
            thumbnail_url: thumbnailUrl,
          }));
          setUrlError('');
          setValidatingUrl(false);
          resolve(true);
        };

        img.onerror = () => {
          setUrlError('Could not load video thumbnail. Please check if the video exists and is public.');
          setPodcastForm(prev => ({
            ...prev,
            video_id: '',
            thumbnail_url: '',
          }));
          setValidatingUrl(false);
          resolve(false);
        };

        img.src = thumbnailUrl;
      });
    } catch (error) {
      setUrlError('Error validating YouTube URL.');
      setValidatingUrl(false);
      return false;
    }
  };

  // Fetch total count of podcasts
  const fetchPodcastIds = async () => {
    try {
      const q = query(collection(db, "podcasts"), orderBy("created_at", "desc"));
      const querySnapshot = await getDocs(q);
      const ids = querySnapshot.docs.map(doc => doc.id);
      setAllPodcastIds(ids);
      setTotalPages(Math.ceil(ids.length / itemsPerPage));

      // Cache the IDs
      localStorage.setItem('podcasts_ids_cache', JSON.stringify(ids));

      return ids;
    } catch (error) {
      console.error('Error fetching podcast IDs:', error);
      return [];
    }
  };

  // Fetch and cache podcasts with pagination
  const fetchAndCachePodcasts = async (pageNum = 1) => {
    try {
      let q;

      if (pageNum === 1) {
        // First page
        q = query(
          collection(db, "podcasts"),
          orderBy("created_at", "desc"),
          limit(itemsPerPage)
        );
      } else {
        // Calculate which documents to fetch based on page number
        const skipCount = (pageNum - 1) * itemsPerPage;

        // First, get all documents up to the start of our page
        const skipQuery = query(
          collection(db, "podcasts"),
          orderBy("created_at", "desc"),
          limit(skipCount)
        );
        const skipSnapshot = await getDocs(skipQuery);

        if (skipSnapshot.docs.length > 0) {
          const lastDoc = skipSnapshot.docs[skipSnapshot.docs.length - 1];

          // Then get the page we want
          q = query(
            collection(db, "podcasts"),
            orderBy("created_at", "desc"),
            startAfter(lastDoc),
            limit(itemsPerPage)
          );
        } else {
          // Fallback to first page if something went wrong
          q = query(
            collection(db, "podcasts"),
            orderBy("created_at", "desc"),
            limit(itemsPerPage)
          );
        }
      }

      const querySnapshot = await getDocs(q);
      const podcastsData = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));

      setPodcasts(podcastsData);

      // Set pagination markers
      if (querySnapshot.docs.length > 0) {
        setFirstVisible(querySnapshot.docs[0]);
        setLastVisible(querySnapshot.docs[querySnapshot.docs.length - 1]);
      }

      // Cache the data with page number
      const cacheKey = `podcasts_page_${pageNum}`;
      localStorage.setItem(cacheKey, JSON.stringify(podcastsData));
      localStorage.setItem(`${cacheKey}_timestamp`, Date.now().toString());

      return podcastsData;
    } catch (error) {
      console.error('Error fetching podcasts:', error);
      return [];
    }
  };

  // Load podcasts with caching
  const loadPodcasts = async (pageNum = 1) => {
    try {
      setLoading(true);

      // Try to load from cache first
      const cacheKey = `podcasts_page_${pageNum}`;
      const cachedPodcasts = localStorage.getItem(cacheKey);
      const cacheTimestamp = localStorage.getItem(`${cacheKey}_timestamp`);

      // Use cache if it's less than 5 minutes old
      if (cachedPodcasts && cacheTimestamp) {
        const cacheAge = Date.now() - parseInt(cacheTimestamp);
        if (cacheAge < 5 * 60 * 1000) { // 5 minutes
          setPodcasts(JSON.parse(cachedPodcasts));
          setCurrentPage(pageNum);
          // Still fetch in background to update
          fetchAndCachePodcasts(pageNum);
          setLoading(false);
          return;
        }
      }

      // Fetch fresh data
      await fetchAndCachePodcasts(pageNum);
      setCurrentPage(pageNum);
    } catch (error) {
      console.error('Error loading podcasts:', error);
      alert('Failed to load podcasts: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  // Auto-fetch podcasts from YouTube playlist
  // Auto-fetch podcasts from YouTube playlist
  const autoFetchPodcasts = async () => {
    if (!RSS_CONFIG.youtube_playlist_id) {
      alert('Please configure YouTube Playlist ID in RSS_CONFIG');
      return;
    }

    try {
      setFetchingPodcasts(true);

      const fetchedPodcasts = await parseYouTubePlaylistRSS(RSS_CONFIG.youtube_playlist_id);

      // Get existing podcasts to avoid duplicates
      const existingQuery = query(collection(db, "podcasts"));
      const existingSnapshot = await getDocs(existingQuery);
      const existingUrls = new Set(existingSnapshot.docs.map(doc => doc.data().youtube_url));
      const existingVideoIds = new Set(existingSnapshot.docs.map(doc => doc.data().video_id));

      let addedCount = 0;
      let skippedCount = 0;

      for (const podcast of fetchedPodcasts) {
        if (!existingUrls.has(podcast.youtube_url) && !existingVideoIds.has(podcast.video_id)) {
          const podcastData = {
            ...podcast,
            created_at: new Date().toISOString(),
          };

          // ✅ ADD THE addDoc CALL HERE to save the podcast
          await addDoc(collection(db, "podcasts"), podcastData);

          addedCount++;
        } else {
          skippedCount++;
        }
      }

      invalidateCache();
      await fetchPodcastIds();
      await loadPodcasts(1);

      const now = new Date().toISOString();
      localStorage.setItem('podcasts_last_fetch', now);
      setLastFetchTime(now);

      alert(`✅ Fetch complete!\nAdded: ${addedCount}\nSkipped: ${skippedCount}`);

    } catch (error) {
      console.error('Error auto-fetching podcasts:', error);
      alert('Failed to fetch podcasts: ' + error.message);
    } finally {
      setFetchingPodcasts(false);
    }
  };

  // Add manual podcast (YouTube or Twitter)
  // Add manual podcast - extracts video ID and fetches metadata
  const handleAddManualPodcast = async () => {
    if (!manualPodcastForm.url) {
      alert('Please provide a YouTube URL');
      return;
    }

    try {
      setAddingPodcast(true);

      // Extract video ID
      const videoId = extractYouTubeID(manualPodcastForm.url);
      if (!videoId) {
        throw new Error('Invalid YouTube URL');
      }

      // Validate thumbnail exists (validates video exists)
      const thumbnailUrl = getYouTubeThumbnail(videoId);
      const img = new Image();

      await new Promise((resolve, reject) => {
        img.onload = resolve;
        img.onerror = () => reject(new Error('Video not found or not public'));
        img.src = thumbnailUrl;
      });

      // Try to fetch video title using oEmbed API
      let videoTitle = manualPodcastForm.title || 'Untitled Podcast';

      try {
        const oEmbedUrl = `https://www.youtube.com/oembed?url=https://www.youtube.com/watch?v=${videoId}&format=json`;
        const response = await fetch(oEmbedUrl);
        if (response.ok) {
          const data = await response.json();
          videoTitle = data.title || videoTitle;
        }
      } catch (error) {
        console.warn('Could not fetch video title, using manual input');
      }

      const podcastDetails = {
        title: videoTitle,
        youtube_url: manualPodcastForm.url,
        video_id: videoId,
        thumbnail_url: thumbnailUrl,
        platform: 'youtube',
      };

      // Check for duplicates
      const existingQuery = query(
        collection(db, "podcasts"),
        where("video_id", "==", videoId)
      );
      const existingSnapshot = await getDocs(existingQuery);

      if (!existingSnapshot.empty) {
        alert('This podcast already exists in the database');
        setAddingPodcast(false);
        return;
      }

      const podcastData = {
        ...podcastDetails,
        created_at: new Date().toISOString(),
      };

      // ✅ ADD THE addDoc CALL HERE to save the podcast
      await addDoc(collection(db, "podcasts"), podcastData);

      invalidateCache();
      await fetchPodcastIds();
      await loadPodcasts(1);

      setManualPodcastForm({ url: '', title: '' });
      setShowAddForm(false);

      alert('✅ Podcast added successfully!');

    } catch (error) {
      console.error('Error adding manual podcast:', error);
      alert('Failed to add podcast: ' + error.message);
    } finally {
      setAddingPodcast(false);
    }
  };

  // Add podcast to Firestore
  const handleAddPodcast = async () => {
    if (!podcastForm.title || !podcastForm.youtube_url) {
      alert('Please fill in all required fields (Title, YouTube URL)');
      return;
    }

    if (!podcastForm.video_id) {
      alert('Please enter a valid YouTube URL');
      return;
    }

    try {
      setLoading(true);

      const podcastData = {
        title: podcastForm.title,
        youtube_url: podcastForm.youtube_url,
        video_id: podcastForm.video_id,
        thumbnail_url: podcastForm.thumbnail_url,
        created_at: new Date().toISOString(),
      };

      await addDoc(collection(db, "podcasts"), podcastData);

      invalidateCache();

      // Reload first page to show new podcast
      await fetchPodcastIds();
      await loadPodcasts(1);

      resetPodcastForm();
      setShowAddPodcast(false);
      alert('Podcast added successfully!');
    } catch (error) {
      console.error('Error adding podcast:', error);
      alert('Failed to add podcast: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  // Update podcast in Firestore
  const handleUpdatePodcast = async () => {
    if (!podcastForm.title || !podcastForm.youtube_url) {
      alert('Please fill in all required fields (Title, YouTube URL)');
      return;
    }

    if (!podcastForm.video_id) {
      alert('Please enter a valid YouTube URL');
      return;
    }

    try {
      setLoading(true);

      const podcastData = {
        title: podcastForm.title,
        youtube_url: podcastForm.youtube_url,
        video_id: podcastForm.video_id,
        thumbnail_url: podcastForm.thumbnail_url,
        updated_at: new Date().toISOString(),
      };

      await updateDoc(doc(db, "podcasts", editingPodcast.id), podcastData);

      invalidateCache();
      await loadPodcasts(currentPage);

      resetPodcastForm();
      setEditingPodcast(null);
      alert('Podcast updated successfully!');
    } catch (error) {
      console.error('Error updating podcast:', error);
      alert('Failed to update podcast: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  // Toggle homepage display
  const handleDisplayOnHomepage = async (podcast) => {
    const isOnHomepage = homepagePodcasts.some(p => p.video_id === podcast.video_id);

    const confirmMessage = isOnHomepage
      ? 'Remove this podcast from homepage display?'
      : 'Display this podcast on the homepage?';

    if (!window.confirm(confirmMessage)) return;

    try {
      setLoading(true);

      const homepageDocRef = doc(db, "homepage", "homepage");
      const homepageDoc = await getDoc(homepageDocRef);

      let existingData = {};
      if (homepageDoc.exists()) {
        existingData = homepageDoc.data();
      }

      let updatedPodcasts;

      if (isOnHomepage) {
        updatedPodcasts = homepagePodcasts.filter(p => p.video_id !== podcast.video_id);
      } else {
        const podcastData = {
          video_id: podcast.video_id,
          title: podcast.title,
          youtube_url: podcast.youtube_url,
          thumbnail_url: podcast.thumbnail_url,
          platform: podcast.platform || 'youtube',
          added_at: new Date().toISOString(),
        };
        updatedPodcasts = [...homepagePodcasts, podcastData];
      }

      await setDoc(homepageDocRef, {
        ...existingData,
        podcasts: updatedPodcasts,
        updated_at: new Date().toISOString()
      });

      setHomepagePodcasts(updatedPodcasts);

      alert(isOnHomepage
        ? 'Podcast removed from homepage!'
        : 'Podcast added to homepage display!'
      );
    } catch (error) {
      console.error('Error updating homepage podcast:', error);
      alert('Failed to update homepage: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  // Delete podcast from Firestore
  const handleDeletePodcast = async (id) => {
    if (!window.confirm('Are you sure you want to delete this podcast?')) {
      return;
    }

    try {
      setLoading(true);

      await deleteDoc(doc(db, "podcasts", id));

      invalidateCache();

      // Reload current page or go to previous if current is empty
      await fetchPodcastIds();
      const newTotalPages = Math.ceil((allPodcastIds.length - 1) / itemsPerPage);
      const pageToLoad = currentPage > newTotalPages ? Math.max(1, newTotalPages) : currentPage;
      await loadPodcasts(pageToLoad);

      alert('Podcast deleted successfully!');
    } catch (error) {
      console.error('Error deleting podcast:', error);
      alert('Failed to delete podcast: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const startEditPodcast = (podcast) => {
    setEditingPodcast(podcast);
    setPodcastForm({
      title: podcast.title,
      youtube_url: podcast.youtube_url,
      video_id: podcast.video_id,
      thumbnail_url: podcast.thumbnail_url,
    });
    setUrlError('');
  };

  const resetPodcastForm = () => {
    setPodcastForm({
      title: '',
      youtube_url: '',
      video_id: '',
      thumbnail_url: '',
    });
    setEditingPodcast(null);
    setShowAddPodcast(false);
    setUrlError('');
  };

  // Pagination handlers
  const goToNextPage = () => {
    if (currentPage < totalPages) {
      loadPodcasts(currentPage + 1);
    }
  };

  const goToPreviousPage = () => {
    if (currentPage > 1) {
      loadPodcasts(currentPage - 1);
    }
  };

  const goToPage = (pageNum) => {
    if (pageNum >= 1 && pageNum <= totalPages) {
      loadPodcasts(pageNum);
    }
  };

  // Load data on mount
  useEffect(() => {
    const loadData = async () => {
      setInitialLoading(true);
      try {
        const cachedIds = localStorage.getItem('podcasts_ids_cache');
        if (cachedIds) {
          const ids = JSON.parse(cachedIds);
          setAllPodcastIds(ids);
          setTotalPages(Math.ceil(ids.length / itemsPerPage));
        }

        await fetchPodcastIds();
        await loadPodcasts(1);

        // Load homepage podcasts
        const homepageDoc = await getDoc(doc(db, "homepage", "homepage"));
        if (homepageDoc.exists()) {
          const data = homepageDoc.data();
          setHomepagePodcasts(data.podcasts || []);
        }

        // Load last fetch time
        const lastFetch = localStorage.getItem('podcasts_last_fetch');
        if (lastFetch) {
          setLastFetchTime(lastFetch);
        }

      } catch (error) {
        console.error('Error loading data:', error);
      } finally {
        setInitialLoading(false);
      }
    };

    loadData();
  }, []);

  if (initialLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Loader className="w-12 h-12 text-orange-500 animate-spin mx-auto mb-4" />
          <p className="text-gray-600 font-semibold">Loading podcasts...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Loading Overlay */}
      {loading && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center">
          <div className="bg-white rounded-2xl p-8 flex flex-col items-center">
            <Loader className="w-12 h-12 text-orange-500 animate-spin mb-4" />
            <p className="text-gray-900 font-bold">Processing...</p>
          </div>
        </div>
      )}

      {/* Header */}
      {/* Header */}
      <div className={`bg-gradient-to-r ${theme.gradients.primary} py-8 shadow-xl`}>
        <div className="container mx-auto px-4 max-w-7xl">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-4xl font-black text-white mb-2">Podcast Management</h1>
              <p className="text-orange-100">Manage your YouTube podcasts and videos</p>
              {lastFetchTime && (
                <p className="text-orange-200 text-sm mt-1">
                  Last synced: {new Date(lastFetchTime).toLocaleString()}
                </p>
              )}
            </div>
            <div className="flex items-center gap-4">
              <button
                onClick={() => setShowAddForm(!showAddForm)}
                className={`inline-flex items-center gap-2 ${getButton('primary')}`}
              >
                <Plus className="w-5 h-5" />
                Add Podcast
              </button>
              <button
                onClick={autoFetchPodcasts}
                disabled={fetchingPodcasts}
                className={`inline-flex items-center gap-2 ${getButton('secondary')} disabled:opacity-50`}
              >
                <RefreshCw className={`w-5 h-5 ${fetchingPodcasts ? 'animate-spin' : ''}`} />
                Sync Playlist
              </button>
              <Video className="w-16 h-16 text-white opacity-50" />
            </div>
          </div>
        </div>
      </div>

      {/* Manual Add Form */}
      {showAddForm && (
        <div className="container mx-auto px-4 max-w-7xl py-8">
          <div className={`${theme.cards.elevated} rounded-2xl p-8 mb-8`}>
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-2xl font-bold text-gray-900">Add New Podcast</h3>
              <button
                onClick={() => {
                  setShowAddForm(false);
                  setManualPodcastForm({ url: '', title: '' });
                }}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="space-y-6">
              <div>
                <label className="block text-sm font-bold text-gray-900 mb-2">
                  YouTube Video URL *
                </label>
                <div className="relative">
                  <Youtube className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <input
                    type="url"
                    value={manualPodcastForm.url}
                    onChange={(e) => setManualPodcastForm({ ...manualPodcastForm, url: e.target.value })}
                    placeholder="https://www.youtube.com/watch?v=..."
                    className="text-black w-full pl-12 pr-4 py-3 border-2 border-gray-200 rounded-xl focus:border-orange-500 focus:outline-none transition-colors"
                  />
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  Video title will be fetched automatically from YouTube
                </p>
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-900 mb-2">
                  Custom Title (Optional)
                </label>
                <input
                  type="text"
                  value={manualPodcastForm.title}
                  onChange={(e) => setManualPodcastForm({ ...manualPodcastForm, title: e.target.value })}
                  placeholder="Leave empty to use YouTube title"
                  className="text-black w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-orange-500 focus:outline-none transition-colors"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Only fill this if you want to override the YouTube title
                </p>
              </div>
            </div>

            <div className="flex gap-4 mt-6">
              <button
                onClick={handleAddManualPodcast}
                disabled={addingPodcast || !manualPodcastForm.url}
                className={`inline-flex items-center gap-2 ${getButton('primary')} disabled:opacity-50 disabled:cursor-not-allowed`}
              >
                {addingPodcast ? (
                  <Loader className="w-5 h-5 animate-spin" />
                ) : (
                  <Save className="w-5 h-5" />
                )}
                Add Podcast
              </button>
              <button
                onClick={() => {
                  setShowAddForm(false);
                  setManualPodcastForm({ url: '', title: '' });
                }}
                className={getButton('secondary')}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="container mx-auto px-4 max-w-7xl py-8">
        {/* Add Podcast Button */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h2 className="text-3xl font-black text-gray-900">All Podcasts</h2>
            <p className="text-gray-600 mt-1">
              Total: {allPodcastIds.length} podcasts | Page {currentPage} of {totalPages}
            </p>
          </div>
          <button
            onClick={() => setShowAddPodcast(true)}
            className={`inline-flex items-center gap-2 ${getButton('primary')}`}
          >
            <Plus className="w-5 h-5" />
            Add New Podcast
          </button>
        </div>

        {/* Add/Edit Podcast Form */}
        {(showAddPodcast || editingPodcast) && (
          <div className={`${theme.cards.elevated} rounded-2xl p-8 mb-8`}>
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-2xl font-bold text-gray-900">
                {editingPodcast ? 'Edit Podcast' : 'Add New Podcast'}
              </h3>
              <button
                onClick={resetPodcastForm}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="space-y-6">
              {/* YouTube URL */}
              <div>
                <label className="block text-sm font-bold text-gray-900 mb-2">
                  YouTube Video URL *
                </label>
                <input
                  type="url"
                  value={podcastForm.youtube_url}
                  onChange={(e) => {
                    setPodcastForm({ ...podcastForm, youtube_url: e.target.value });
                  }}
                  onBlur={(e) => {
                    if (e.target.value) {
                      validateYouTubeUrl(e.target.value);
                    }
                  }}
                  placeholder="https://www.youtube.com/watch?v=..."
                  className={`text-black w-full px-4 py-3 border-2 rounded-xl focus:outline-none transition-colors ${urlError ? 'border-orange-500' : 'border-gray-200 focus:border-orange-500'
                    }`}
                />
                {validatingUrl && (
                  <p className="text-sm text-gray-600 mt-2 flex items-center gap-2">
                    <Loader className="w-4 h-4 animate-spin" />
                    Validating YouTube URL...
                  </p>
                )}
                {urlError && (
                  <p className="text-sm text-orange-600 mt-2">{urlError}</p>
                )}
                {podcastForm.video_id && !urlError && (
                  <p className="text-sm text-green-600 mt-2 flex items-center gap-2">
                    ✓ Valid YouTube video
                  </p>
                )}
              </div>

              {/* Title */}
              <div>
                <label className="block text-sm font-bold text-gray-900 mb-2">
                  Podcast Title *
                </label>
                <input
                  type="text"
                  value={podcastForm.title}
                  onChange={(e) => setPodcastForm({ ...podcastForm, title: e.target.value })}
                  placeholder="Enter podcast title"
                  className="text-black w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-orange-500 focus:outline-none transition-colors"
                />
              </div>

              {/* Thumbnail Preview */}
              {podcastForm.thumbnail_url && (
                <div>
                  <label className="block text-sm font-bold text-gray-900 mb-2">Preview</label>
                  <img
                    src={podcastForm.thumbnail_url}
                    alt="Video thumbnail"
                    className="w-full max-w-2xl h-64 object-cover rounded-xl shadow-lg"
                  />
                </div>
              )}
            </div>

            {/* Action Buttons */}
            <div className="flex gap-4 mt-6">
              <button
                onClick={editingPodcast ? handleUpdatePodcast : handleAddPodcast}
                disabled={loading || validatingUrl || !podcastForm.video_id}
                className={`inline-flex items-center gap-2 ${getButton('primary')} disabled:opacity-50 disabled:cursor-not-allowed`}
              >
                {loading ? (
                  <Loader className="w-5 h-5 animate-spin" />
                ) : (
                  <Save className="w-5 h-5" />
                )}
                {editingPodcast ? 'Update Podcast' : 'Add Podcast'}
              </button>
              <button
                onClick={resetPodcastForm}
                className={getButton('secondary')}
              >
                Cancel
              </button>
            </div>
          </div>
        )}

        {/* Podcasts Grid */}
        {podcasts.length > 0 ? (
          <>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
              {podcasts.map((podcast) => (
                <div key={podcast.id} className={`${theme.cards.elevated} rounded-2xl overflow-hidden hover:shadow-2xl transition-shadow`}>
                  <div className="relative pb-[56.25%]">
                    <iframe
                      src={getYouTubeEmbedURL(podcast.video_id)}
                      title={podcast.title}
                      className="absolute top-0 left-0 w-full h-full"
                      frameBorder="0"
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                      allowFullScreen
                    />
                  </div>

                  <div className="p-6">
                    <h3 className="text-xl font-bold text-gray-900 mb-3 line-clamp-2">
                      {podcast.title}
                    </h3>

                    <a
                      href={podcast.youtube_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs text-orange-600 hover:text-orange-700 mb-4 block truncate"
                    >
                      🎥 Watch on YouTube
                    </a>

                    <div className="flex gap-2 mt-4">
                      <button
                        onClick={() => startEditPodcast(podcast)}
                        className="flex-1 inline-flex items-center justify-center gap-2 bg-orange-500 hover:bg-orange-600 text-white rounded-xl py-2 px-4 font-bold transition-all"
                      >
                        <Edit2 className="w-4 h-4" />
                        Edit
                      </button>
                      <button
                        onClick={() => handleDeletePodcast(podcast.id)}
                        className="flex-1 inline-flex items-center justify-center gap-2 bg-gray-700 hover:bg-gray-800 text-white rounded-xl py-2 px-4 font-bold transition-all"
                      >
                        <Trash2 className="w-4 h-4" />
                        Delete
                      </button>
                      {(() => {
                        const isOnHomepage = homepagePodcasts.some(p => p.video_id === podcast.video_id);
                        return (
                          <button
                            onClick={() => handleDisplayOnHomepage(podcast)}
                            className={`flex-1 inline-flex items-center justify-center gap-2 ${isOnHomepage
                              ? 'bg-red-500 hover:bg-red-600'
                              : 'bg-green-500 hover:bg-green-600'
                              } text-white rounded-xl py-2 px-4 font-bold transition-all`}
                          >
                            {isOnHomepage ? (
                              <>
                                <X className="w-4 h-4" />
                                Remove
                              </>
                            ) : (
                              <>
                                <Star className="w-4 h-4" />
                                Display
                              </>
                            )}
                          </button>
                        );
                      })()}
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Pagination Controls */}
            {totalPages > 1 && (
              <div className="flex items-center justify-center gap-2">
                <button
                  onClick={goToPreviousPage}
                  disabled={currentPage === 1}
                  className={`p-2 rounded-lg transition-colors ${currentPage === 1
                    ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                    : 'bg-white text-gray-900 hover:bg-gray-100 shadow-lg'
                    }`}
                >
                  <ChevronLeft className="w-6 h-6" />
                </button>

                <div className="flex gap-2">
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map((pageNum) => {
                    // Show first, last, current, and adjacent pages
                    if (
                      pageNum === 1 ||
                      pageNum === totalPages ||
                      (pageNum >= currentPage - 1 && pageNum <= currentPage + 1)
                    ) {
                      return (
                        <button
                          key={pageNum}
                          onClick={() => goToPage(pageNum)}
                          className={`w-10 h-10 rounded-lg font-bold transition-all ${pageNum === currentPage
                            ? 'bg-gradient-to-r from-orange-500 to-orange-600 text-white shadow-lg'
                            : 'bg-white text-gray-900 hover:bg-gray-100 shadow-lg'
                            }`}
                        >
                          {pageNum}
                        </button>
                      );
                    } else if (
                      pageNum === currentPage - 2 ||
                      pageNum === currentPage + 2
                    ) {
                      return (
                        <span key={pageNum} className="w-10 h-10 flex items-center justify-center text-gray-400">
                          ...
                        </span>
                      );
                    }
                    return null;
                  })}
                </div>

                <button
                  onClick={goToNextPage}
                  disabled={currentPage === totalPages}
                  className={`p-2 rounded-lg transition-colors ${currentPage === totalPages
                    ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                    : 'bg-white text-gray-900 hover:bg-gray-100 shadow-lg'
                    }`}
                >
                  <ChevronRight className="w-6 h-6" />
                </button>
              </div>
            )}
          </>
        ) : (
          <div className="text-center py-20">
            <Video className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-2xl font-bold text-gray-900 mb-2">No podcasts yet</h3>
            <p className="text-gray-600 mb-6">Start by adding your first podcast to the collection</p>
            <button
              onClick={() => setShowAddPodcast(true)}
              className={`inline-flex items-center gap-2 ${getButton('primary')}`}
            >
              <Plus className="w-5 h-5" />
              Add Your First Podcast
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminPodcastsPage;