"use client";
import React, { useState, useEffect } from 'react';
import { Video, Edit2, Trash2, X, Save, RefreshCw, Youtube, Loader, Link, AlertCircle, ChevronDown, BookOpen, Star } from 'lucide-react';
import { db } from '../../../firebase/firebaseConfig';
import { collection, getDocs, addDoc, updateDoc, deleteDoc, doc, query, orderBy, limit, startAfter, where, getDoc, setDoc } from 'firebase/firestore';

// 🎯 HARDCODED PLAYLISTS/CATEGORIES
// IMPORTANT: Replace the placeholder category_id (which is your YouTube Playlist ID) with your actual playlist IDs.
const HARDCODED_CATEGORIES = [
  {
    category_name: "International Affairs", // The user's requested category name
    category_id: "PLuhKcyouEj89HXq_64Ffinu5U7y6P8aLA", // <<<--- YOUR YOUTUBE PLAYLIST ID HERE
    channel_name: "Dr Satish Dhage",
    channel_id: "UCgXrITZ6XnP_thbBey-enOA",
  },
  {
    category_name: "Military and Defence", // The user's requested category name
    category_id: "PLuhKcyouEj89kDJLw1VG0GBezUHDqfNId", // <<<--- YOUR YOUTUBE PLAYLIST ID HERE
    channel_name: "Dr Satish Dhage",
    channel_id: "UCgXrITZ6XnP_thbBey-enOA",
  },
  {
    category_name: "Competetive Exam and Current Affairs", // The user's requested category name
    category_id: "PLuhKcyouEj8-3G1vad65NcGYCZtroUv3A", // <<<--- YOUR YOUTUBE PLAYLIST ID HERE
    channel_name: "Dr Satish Dhage",
    channel_id: "UCgXrITZ6XnP_thbBey-enOA",
  },
  {
    category_name: "Disaster", // A second category name
    category_id: "PLqB5N9NDPhbJfrao7Z7f90OU5S7nyBu39", // <<<--- YOUR YOUTUBE PLAYLIST ID HERE
    channel_name: "The Mentors Forum",
    channel_id: "UC6hqtj38jmIqhx1e3POVu8w",
  },
  {
    category_name: "Military and Defence", // A second category name
    category_id: "PLqB5N9NDPhbJDNP7qA0mDgfzVHQWeywSF", // <<<--- YOUR YOUTUBE PLAYLIST ID HERE
    channel_name: "The Mentors Forum",
    channel_id: "UC6hqtj38jmIqhx1e3POVu8w",
  }
  // Add as many playlists/categories as you need here
];

const STATIC_CATEGORIES = [
  "Competetive Exams and Current Affairs",
  "Disaster",
  "International Affairs",
  "Military and Defence",
  "Uncategorized"
  // Add more categories as needed
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

  const [homepageVideos, setHomepageVideos] = useState([]);

  const [allVideos, setAllVideos] = useState([]);
  const [allVideosPage, setAllVideosPage] = useState(1);
  const [allVideosTotal, setAllVideosTotal] = useState(0);
  const [loadingAllVideos, setLoadingAllVideos] = useState(false);

  const [dynamicCategories, setDynamicCategories] = useState([]);

  // Pagination state per category/playlist
  const [categoryPagination, setCategoryPagination] = useState({});
  const [loadingMore, setLoadingMore] = useState({});

  // Videos State - organized by category_id (Playlist ID)
  const [videosByCategory, setVideosByCategory] = useState({});
  const [totalCountsByCategory, setTotalCountsByCategory] = useState({});

  const [showAddForm, setShowAddForm] = useState(false);
  const [addingVideo, setAddingVideo] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState('all'); // New filter state
  const [manualVideoForm, setManualVideoForm] = useState({
    video_url: '',
    category: '',
    channel_name: '', // For dropdown fallback
  });

  // Form State
  const [videoForm, setVideoForm] = useState({
    title: '',
    description: '',
    video_url: '',
    thumbnail_url: '',
    channel_name: '',
    category: '', // New field
  });

  // Cache helpers
  const getCacheKey = (categoryId, page) => `videos_${categoryId}_page_${page}`;
  const getCountCacheKey = (categoryId) => `video_count_${categoryId}`;

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

  // Parse YouTube Playlist RSS (updated to use playlist_id)
  const parseYouTubePlaylistRSS = async (playlistId, retries = 3) => {
    // This is the key change to fetch videos from a specific playlist.
    const RSS_URL = `https://www.youtube.com/feeds/videos.xml?playlist_id=${playlistId}`;

    // Try multiple CORS proxies
    const CORS_PROXIES = [
      'https://api.allorigins.win/raw?url=',
      'https://corsproxy.io/?',
      'https://api.codetabs.com/v1/proxy?quest=',
    ];

    for (let attempt = 0; attempt <= retries; attempt++) {
      // Rotate through different proxies on each attempt
      const CORS_PROXY = CORS_PROXIES[attempt % CORS_PROXIES.length];

      try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 15000);

        const response = await fetch(CORS_PROXY + encodeURIComponent(RSS_URL), {
          signal: controller.signal,
          headers: {
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

        const parser = new DOMParser();
        const xml = parser.parseFromString(text, 'text/xml');

        const parserError = xml.querySelector('parsererror');
        if (parserError) {
          throw new Error('XML parsing error');
        }

        const entries = xml.querySelectorAll('entry');

        if (entries.length === 0) {
          console.warn(`No videos found for playlist ${playlistId}`);
          return [];
        }

        const videos = [];

        entries.forEach((entry) => {
          const videoId = entry.querySelector('videoId')?.textContent ||
            entry.querySelector('yt\\:videoId')?.textContent || '';
          const title = entry.querySelector('title')?.textContent || '';
          const description = entry.querySelector('media\\:group media\\:description')?.textContent ||
            entry.querySelector('media\\:description')?.textContent ||
            entry.querySelector('description')?.textContent || '';

          let thumbnailUrl = entry.querySelector('media\\:group media\\:thumbnail')?.getAttribute('url') ||
            entry.querySelector('media\\:thumbnail')?.getAttribute('url') ||
            entry.querySelector('thumbnail')?.getAttribute('url') ||
            `https://i.ytimg.com/vi/${videoId}/hqdefault.jpg`;

          // ✅ NEW: Extract published date from RSS feed
          const publishedDate = entry.querySelector('published')?.textContent ||
            entry.querySelector('pubDate')?.textContent ||
            new Date().toISOString();

          const videoUrl = `https://www.youtube.com/watch?v=${videoId}&list=${playlistId}`; // Include playlist ID in URL

          if (videoId && title) {
            videos.push({
              title,
              description: description || '',
              video_url: videoUrl,
              thumbnail_url: thumbnailUrl,
              video_id: videoId,
              published_at_iso: publishedDate,
            });
          }
        });

        console.log(`✅ Successfully fetched ${videos.length} videos from playlist ${playlistId} using ${CORS_PROXY}`);
        return videos;

      } catch (error) {
        const errorMsg = error.name === 'AbortError' ? 'Request timeout' : error.message;
        console.warn(`Attempt ${attempt + 1}/${retries + 1} failed for playlist ${playlistId} (${CORS_PROXY}): ${errorMsg}`);

        if (attempt === retries) {
          console.error(`❌ All attempts failed for playlist ${playlistId}. Returning empty array.`);
          return [];
        }

        await new Promise(resolve => setTimeout(resolve, 2000 + (1000 * attempt)));
      }
    }

    return [];
  };

  // Update news ticker collection (single document, videos only)
  const updateNewsTicker = async (newVideo) => {
    try {
      const tickerDocRef = doc(db, "news_ticker", "latest");
      const tickerSnapshot = await getDoc(tickerDocRef);

      let tickerData = {
        latest_article_title: '',
        latest_article_url: '',
        second_article_title: '',
        second_article_url: '',
        latest_book_title: '',
        latest_book_url: '',
        second_book_title: '',
        second_book_url: '',
        latest_video_title: '',
        latest_video_url: '',
        second_video_title: '',
        second_video_url: '',
      };

      if (tickerSnapshot.exists()) {
        tickerData = { ...tickerData, ...tickerSnapshot.data() };
      }

      // Check if the new video is actually newer/different
      if (tickerData.latest_video_url !== newVideo.video_url) {
        // Move current latest video to second position
        tickerData.second_video_title = tickerData.latest_video_title;
        tickerData.second_video_url = tickerData.latest_video_url;

        // Set new video as latest
        tickerData.latest_video_title = newVideo.title;
        tickerData.latest_video_url = newVideo.video_url || '';

        // Save updated record
        await setDoc(tickerDocRef, tickerData);
      }
    } catch (error) {
      console.error("Error updating news ticker (videos):", error);
    }
  };

  // Get total count for a category (using Playlist ID)
  const getCategoryVideoCount = async (categoryId) => {
    const cacheKey = getCountCacheKey(categoryId);
    const cached = getCachedData(cacheKey, 10 * 60 * 1000);

    if (cached !== null) {
      return cached;
    }

    const q = query(
      collection(db, "videos"),
      where("category_id", "==", categoryId) // Filter by category_id (Playlist ID)
    );
    const snapshot = await getDocs(q);
    const count = snapshot.size;

    setCachedData(cacheKey, count);
    return count;
  };

  const loadDynamicCategories = async () => {
    try {
      // Get all videos
      const allVideosQuery = query(collection(db, "videos"));
      const snapshot = await getDocs(allVideosQuery);

      // Extract unique categories by NAME (not ID) with their counts
      const categoriesMap = {};

      snapshot.docs.forEach(doc => {
        const data = doc.data();
        const categoryName = data.category || 'Uncategorized'; // Use category name

        if (categoryName) {
          if (!categoriesMap[categoryName]) {
            categoriesMap[categoryName] = {
              category_name: categoryName,
              count: 0
            };
          }
          categoriesMap[categoryName].count++;
        }
      });

      // Convert to array and sort by name
      const categoriesArray = Object.values(categoriesMap).sort((a, b) =>
        a.category_name.localeCompare(b.category_name)
      );

      console.log('📂 Dynamic categories loaded:', categoriesArray);
      return categoriesArray;
    } catch (error) {
      console.error('Error loading dynamic categories:', error);
      return [];
    }
  };

  // Load videos for a specific category (playlist) with pagination
  const loadCategoryVideos = async (categoryId, page = 1, useCache = true) => {
    try {
      const cacheKey = getCacheKey(categoryId, page);

      if (useCache && page === 1) {
        const cached = getCachedData(cacheKey);
        if (cached) {
          return cached;
        }
      }

      const q = query(
        collection(db, "videos"),
        where("category", "==", categoryId), // Filter by category_id (Playlist ID)
        orderBy("created_at_iso", "asc"),
        limit(VIDEOS_PER_PAGE)
      );

      const snapshot = await getDocs(q);
      const videos = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));

      const uniqueVideos = Array.from(
        new Map(videos.map(video => [video.id, video])).values()
      );

      if (page === 1) {
        setCachedData(cacheKey, uniqueVideos);
      }

      return uniqueVideos;
    } catch (error) {
      console.error(`Error loading videos for category ${categoryId}:`, error);
      return [];
    }
  };

  // Load ALL videos with pagination and optional category filter
  // Load ALL videos with pagination and optional category filter
  const loadAllVideos = async (page = 1, categoryFilter = 'all', useCache = true) => {
    try {
      const cacheKey = `all_videos_${categoryFilter}_page_${page}`;

      if (useCache && page === 1) {
        const cached = getCachedData(cacheKey);
        if (cached) {
          return cached;
        }
      }

      let q;

      if (categoryFilter === 'all') {
        // Get all videos
        q = query(
          collection(db, "videos"),
          orderBy("created_at_iso", "asc"),
          limit(VIDEOS_PER_PAGE)
        );
      } else {
        // Filter by specific category_id
        q = query(
          collection(db, "videos"),
          where("category", "==", categoryFilter),
          orderBy("created_at_iso", "asc"),
          limit(VIDEOS_PER_PAGE)
        );
      }

      const snapshot = await getDocs(q);

      const videos = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));

      const uniqueVideos = Array.from(
        new Map(videos.map(video => [video.id, video])).values()
      );

      if (page === 1) {
        setCachedData(cacheKey, uniqueVideos);
      }

      return uniqueVideos;
    } catch (error) {
      console.error('Error loading all videos:', error);
      return [];
    }
  };

  // Get total count for all videos or filtered by category
  const getAllVideosCount = async (categoryFilter = 'all') => {
    const cacheKey = `all_videos_count_${categoryFilter}`;
    const cached = getCachedData(cacheKey, 10 * 60 * 1000);

    if (cached !== null) {
      return cached;
    }

    let q;
    if (categoryFilter === 'all') {
      q = query(collection(db, "videos"));
    } else {
      q = query(
        collection(db, "videos"),
        where("category", "==", categoryFilter)
      );
    }

    const snapshot = await getDocs(q);
    const count = snapshot.size;

    setCachedData(cacheKey, count);
    return count;
  };

  // Load more for all videos view
  // Load more for all videos view
  const handleLoadMoreAllVideos = async () => {
    setLoadingAllVideos(true);

    try {
      if (allVideos.length === 0) {
        setLoadingAllVideos(false);
        return;
      }

      // Get the last document snapshot
      const lastDocRef = doc(db, "videos", allVideos[allVideos.length - 1].id);
      const lastDocSnap = await getDoc(lastDocRef);

      let q;

      if (selectedCategory === 'all') {
        q = query(
          collection(db, "videos"),
          orderBy("created_at_iso", "asc"),
          startAfter(lastDocSnap),
          limit(VIDEOS_PER_PAGE)
        );
      } else {
        q = query(
          collection(db, "videos"),
          where("category", "==", selectedCategory),
          orderBy("created_at_iso", "asc"),
          startAfter(lastDocSnap),
          limit(VIDEOS_PER_PAGE)
        );
      }

      const snapshot = await getDocs(q);
      const newVideos = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));

      const allLoadedVideos = [...allVideos, ...newVideos];
      const uniqueVideos = Array.from(
        new Map(allLoadedVideos.map(video => [video.id, video])).values()
      );

      setAllVideos(uniqueVideos);
      setAllVideosPage(prev => prev + 1);
    } catch (error) {
      console.error('Error loading more videos:', error);
    } finally {
      setLoadingAllVideos(false);
    }
  };

  // Load more videos for a category
  const handleLoadMore = async (categoryId) => {
    setLoadingMore(prev => ({ ...prev, [categoryId]: true }));

    try {
      const currentVideos = videosByCategory[categoryId] || [];
      const currentPage = categoryPagination[categoryId] || 1;

      const lastVideo = currentVideos[currentVideos.length - 1];

      const baseQuery = query(
        collection(db, "videos"),
        where("category_id", "==", categoryId), // Filter by category_id (Playlist ID)
        orderBy("created_at_iso", "asc"),
      );

      // Get the last document snapshot
      const lastDoc = await getDoc(doc(db, "videos", currentVideos[currentVideos.length - 1].id));

      const q = query(baseQuery, startAfter(lastDoc), limit(VIDEOS_PER_PAGE));

      const snapshot = await getDocs(q);
      const newVideos = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));

      const allVideos = [...currentVideos, ...newVideos];
      const uniqueVideos = Array.from(
        new Map(allVideos.map(video => [video.id, video])).values()
      );

      setVideosByCategory(prev => ({
        ...prev,
        [categoryId]: uniqueVideos
      }));

      setCategoryPagination(prev => ({
        ...prev,
        [categoryId]: currentPage + 1
      }));
    } catch (error) {
      console.error('Error loading more videos:', error);
    } finally {
      setLoadingMore(prev => ({ ...prev, [categoryId]: false }));
    }
  };

  // Add this function before autoFetchAllCategories
  // REPLACE the extractVideoDetails function (around line 540-580) with this enhanced version:

  const extractVideoDetails = async (videoUrl) => {
    try {
      // Extract video ID from various YouTube URL formats
      let videoId = null;

      // Pattern 1: Standard watch URL - https://www.youtube.com/watch?v=VIDEO_ID
      // Pattern 2: Short URL - https://youtu.be/VIDEO_ID
      // Pattern 3: YouTube Shorts - https://www.youtube.com/shorts/VIDEO_ID
      // Pattern 4: Mobile share link - https://youtube.com/watch?v=VIDEO_ID
      // Pattern 5: Embedded URL - https://www.youtube.com/embed/VIDEO_ID

      const patterns = [
        /(?:youtube\.com\/watch\?v=)([^&\s]+)/,           // Standard watch
        /(?:youtu\.be\/)([^&\s?]+)/,                       // Short URL
        /(?:youtube\.com\/shorts\/)([^&\s?]+)/,            // Shorts
        /(?:youtube\.com\/embed\/)([^&\s?]+)/,             // Embed
        /(?:youtube\.com\/v\/)([^&\s?]+)/,                 // Old embed
      ];

      for (const pattern of patterns) {
        const match = videoUrl.match(pattern);
        if (match && match[1]) {
          videoId = match[1];
          break;
        }
      }

      if (!videoId) {
        throw new Error('Invalid YouTube URL. Please provide a valid YouTube video, short, or share link.');
      }

      console.log(`📹 Extracted Video ID: ${videoId}`);

      // Try to fetch video details using oEmbed API (works for both regular videos and shorts)
      const oEmbedUrl = `https://www.youtube.com/oembed?url=https://www.youtube.com/watch?v=${videoId}&format=json`;

      try {
        const response = await fetch(oEmbedUrl);
        if (response.ok) {
          const data = await response.json();

          console.log(`✅ Successfully fetched details for video: ${data.title}`);

          return {
            video_id: videoId,
            title: data.title,
            thumbnail_url: data.thumbnail_url || `https://i.ytimg.com/vi/${videoId}/hqdefault.jpg`,
            channel_name: data.author_name,
            description: '', // oEmbed doesn't provide description
          };
        }
      } catch (error) {
        console.warn('⚠️ oEmbed fetch failed, using fallback method');
      }

      // Fallback: Try to get thumbnail from YouTube's image server
      // YouTube provides different thumbnail qualities
      const thumbnailOptions = [
        `https://i.ytimg.com/vi/${videoId}/maxresdefault.jpg`, // Best quality
        `https://i.ytimg.com/vi/${videoId}/sddefault.jpg`,     // Standard quality
        `https://i.ytimg.com/vi/${videoId}/hqdefault.jpg`,     // High quality (always available)
      ];

      // Test which thumbnail is available
      let thumbnailUrl = thumbnailOptions[2]; // Default to hqdefault

      for (const url of thumbnailOptions) {
        try {
          const imgResponse = await fetch(url, { method: 'HEAD' });
          if (imgResponse.ok) {
            thumbnailUrl = url;
            break;
          }
        } catch (e) {
          // Continue to next option
        }
      }

      console.log(`⚠️ Using fallback data for video ID: ${videoId}`);

      // Return basic video details with working thumbnail
      return {
        video_id: videoId,
        title: '', // Will need to be filled manually
        thumbnail_url: thumbnailUrl,
        channel_name: '', // Will need to be filled manually
        description: '',
      };
    } catch (error) {
      console.error('❌ Error extracting video details:', error);
      throw error;
    }
  };

  // Auto-fetch videos from all categories (Playlists)
  const autoFetchAllCategories = async () => {
    try {
      setFetchingVideos(true);
      setFetchError(null);

      let totalAdded = 0;
      let totalSkipped = 0;
      const errors = [];

      for (let i = 0; i < HARDCODED_CATEGORIES.length; i++) {
        const category = HARDCODED_CATEGORIES[i];

        try {
          console.log(`📥 Fetching videos from playlist/category ${category.category_name}...`);

          // Use the updated Playlist RSS parser
          const fetchedVideos = await parseYouTubePlaylistRSS(category.category_id);

          // Get existing videos to check for duplicates, filtering by the specific playlist
          const existingQuery = query(
            collection(db, "videos"),
            where("category_id", "==", category.category_id) // Use category_id (Playlist ID)
          );
          const existingSnapshot = await getDocs(existingQuery);
          const existingUrls = new Set(existingSnapshot.docs.map(doc => doc.data().video_url));
          const existingVideoIds = new Set(
            existingSnapshot.docs.map(doc => doc.data().video_id)
          );

          for (const video of fetchedVideos) {
            if (!existingUrls.has(video.video_url) && !existingVideoIds.has(video.video_id)) {
              const videoData = {
                ...video,
                channel_id: category.channel_id,
                channel_name: category.channel_name,
                category_id: category.category_id,
                category: category.category_name,
                created_at_iso: new Date().toISOString(),
                published_at_iso: video.published_at_iso || new Date().toISOString(),
              };

              const docRef = await addDoc(collection(db, "videos"), videoData);
              const newVideo = { id: docRef.id, ...videoData };
              await updateNewsTicker(newVideo);
              existingUrls.add(video.video_url);
              existingVideoIds.add(video.video_id);
              totalAdded++;
            } else {
              totalSkipped++;
            }
          }

          console.log(`✅ ${category.category_name}: ${fetchedVideos.length} videos fetched`);

          if (i < HARDCODED_CATEGORIES.length - 1) {
            await new Promise(resolve => setTimeout(resolve, 1000));
          }
        } catch (error) {
          console.error(`❌ Error fetching from ${category.category_name}:`, error);
          errors.push({ category: category.category_name, error: error.message });
        }
      }

      invalidateCache();
      await loadAllCategories(); // Reload data after fetch

      // Reload all videos view
      const videos = await loadAllVideos(1, selectedCategory, false);
      const count = await getAllVideosCount(selectedCategory);
      setAllVideos(videos);
      setAllVideosTotal(count);
      setAllVideosPage(1);

      const now = new Date().toISOString();
      localStorage.setItem('videos_last_fetch', now);
      setLastFetchTime(now);

      if (errors.length > 0) {
        const errorMsg = errors.map(e => `${e.category}: ${e.error}`).join('\n');
        setFetchError(`Some categories failed:\n${errorMsg}`);
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

  // Load all categories initial data
  const loadAllCategories = async () => {
    const categoryData = {};
    const counts = {};
    const pagination = {};

    // Load dynamic categories from database
    const dbCategories = await loadDynamicCategories();
    setDynamicCategories(dbCategories);

    for (const category of HARDCODED_CATEGORIES) {
      // Use category.category_id (which holds the Playlist ID) for fetching
      const videos = await loadCategoryVideos(category.category_id, 1);
      const count = await getCategoryVideoCount(category.category_id);

      // Key the state objects by category_id
      categoryData[category.category_id] = videos;
      counts[category.category_id] = count;
      pagination[category.category_id] = 1;
    }

    setVideosByCategory(categoryData);
    setTotalCountsByCategory(counts);
    setCategoryPagination(pagination);
  };

  // Manual refresh
  const handleManualRefresh = async () => {
    try {
      const result = await autoFetchAllCategories();

      if (result.errors.length > 0) {
        alert(`Videos refreshed with some errors:\n${result.errors.map(e => e.category).join(', ')} failed.\n\nAdded: ${result.totalAdded}, Skipped: ${result.totalSkipped}`);
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
        category: videoForm.category, // Save the editable category
        updated_at: new Date().toISOString(),
      };

      await updateDoc(doc(db, "videos", editingVideo.id), videoData);

      const updatedVideo = { id: editingVideo.id, ...editingVideo, ...videoData };
      await updateNewsTicker(updatedVideo);

      // Update local state - use the category_id from the original video to find the collection
      const categoryId = editingVideo.category_id;
      setVideosByCategory(prev => ({
        ...prev,
        [categoryId]: prev[categoryId].map(v =>
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

  // Add this function after handleUpdateVideo
  const handleAddManualVideo = async () => {
    if (!manualVideoForm.video_url || !manualVideoForm.category) {
      alert('Please provide video URL and select a category');
      return;
    }

    try {
      setAddingVideo(true);

      // Extract video details
      const videoDetails = await extractVideoDetails(manualVideoForm.video_url);

      // If channel name couldn't be fetched and user didn't select one
      if (!videoDetails.channel_name && !manualVideoForm.channel_name) {
        alert('Please select a channel name from the dropdown');
        setAddingVideo(false);
        return;
      }

      // Find the selected category config (if it exists in HARDCODED_CATEGORIES)
      let categoryConfig = HARDCODED_CATEGORIES.find(
        cat => cat.category_name === manualVideoForm.category
      );

      // If category doesn't exist in HARDCODED_CATEGORIES, create a generic one
      if (!categoryConfig) {
        categoryConfig = {
          category_name: manualVideoForm.category,
          category_id: manualVideoForm.category.toLowerCase().replace(/\s+/g, '_'), // Generate ID from name
          channel_name: videoDetails.channel_name || manualVideoForm.channel_name,
          channel_id: 'manual_entry',
        };
      }

      // Check for duplicates
      const existingQuery = query(
        collection(db, "videos"),
        where("video_id", "==", videoDetails.video_id)
      );
      const existingSnapshot = await getDocs(existingQuery);

      if (!existingSnapshot.empty) {
        alert('This video already exists in the database');
        setAddingVideo(false);
        return;
      }

      // Prepare video data
      const videoData = {
        title: videoDetails.title || 'Untitled Video',
        description: videoDetails.description || '',
        video_url: manualVideoForm.video_url,
        video_id: videoDetails.video_id,
        thumbnail_url: videoDetails.thumbnail_url,
        channel_name: videoDetails.channel_name || manualVideoForm.channel_name,
        channel_id: categoryConfig.channel_id,
        category: manualVideoForm.category,
        category_id: categoryConfig.category_id,
        created_at_iso: new Date().toISOString(), // Fixed: was created_at, should be created_at_iso
        published_at_iso: new Date().toISOString(),
      };

      // Add to Firestore
      const docRef = await addDoc(collection(db, "videos"), videoData);
      const newVideo = { id: docRef.id, ...videoData };

      // Update news ticker
      await updateNewsTicker(newVideo);

      // Invalidate cache and reload
      invalidateCache();

      // Reload all data to include the new category
      await loadAllCategories();

      // Reload all videos view
      const videos = await loadAllVideos(1, selectedCategory, false);
      const count = await getAllVideosCount(selectedCategory);
      setAllVideos(videos);
      setAllVideosTotal(count);

      // Reset form
      setManualVideoForm({
        video_url: '',
        category: '',
        channel_name: '',
      });
      setShowAddForm(false);

      alert('Video added successfully! New category will appear in the filter.');
    } catch (error) {
      console.error('Error adding manual video:', error);
      alert('Failed to add video: ' + error.message);
    } finally {
      setAddingVideo(false);
    }
  };

  // Delete video
  const handleDeleteVideo = async (id, categoryId) => { // categoryId is the Playlist ID
    if (!window.confirm('Are you sure you want to delete this video?')) {
      return;
    }

    try {
      setLoading(true);

      await deleteDoc(doc(db, "videos", id));

      setVideosByCategory(prev => ({
        ...prev,
        [categoryId]: prev[categoryId].filter(v => v.id !== id)
      }));

      setTotalCountsByCategory(prev => ({
        ...prev,
        [categoryId]: (prev[categoryId] || 1) - 1
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

  // REPLACE the handleDisplayOnHomepage function (around line 1025) with this fixed version:

  const handleDisplayOnHomepage = async (video) => {
    // Check if video is already on homepage
    const isOnHomepage = homepageVideos.some(v => v.video_id === video.video_id);

    const confirmMessage = isOnHomepage
      ? 'Remove this video from homepage display?'
      : 'Display this video on the homepage?';

    if (!window.confirm(confirmMessage)) {
      return;
    }

    try {
      setLoading(true);

      const homepageDocRef = doc(db, "homepage", "homepage");

      // First, get the existing document to preserve other fields
      const homepageDoc = await getDoc(homepageDocRef);
      let existingData = {};

      if (homepageDoc.exists()) {
        existingData = homepageDoc.data();
      }

      let updatedVideos;

      if (isOnHomepage) {
        // Remove video from array
        updatedVideos = homepageVideos.filter(v => v.video_id !== video.video_id);
      } else {
        // Add video to array
        const videoData = {
          video_id: video.video_id,
          title: video.title,
          video_url: video.video_url,
          category: video.category || video.category_name,
          thumbnail_url: video.thumbnail_url,
          channel_name: video.channel_name,
          description: video.description,
          added_at: new Date().toISOString(),
        };
        updatedVideos = [...homepageVideos, videoData];
      }

      // Update Firestore - preserve all existing fields, only update videos array
      await setDoc(homepageDocRef, {
        ...existingData, // Preserve all existing fields (articles, books, etc.)
        videos: updatedVideos, // Update only the videos array
        updated_at: new Date().toISOString()
      });

      // Update local state
      setHomepageVideos(updatedVideos);

      alert(isOnHomepage
        ? 'Video removed from homepage!'
        : 'Video added to homepage display!'
      );
    } catch (error) {
      console.error('Error updating homepage video:', error);
      alert('Failed to update homepage video: ' + error.message);
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
      category: video.category || '', // New field
    });
  };

  const resetVideoForm = () => {
    setVideoForm({
      title: '',
      description: '',
      video_url: '',
      thumbnail_url: '',
      channel_name: '',
      category: '', // New field
    });
    setEditingVideo(null);
  };

  // Initial load
  useEffect(() => {
    const loadData = async () => {
      setInitialLoading(true);
      try {
        // Load all videos first
        const videos = await loadAllVideos(1, 'all');
        const count = await getAllVideosCount('all');
        setAllVideos(videos);
        setAllVideosTotal(count);

        // Also load category data for the filter counts
        await loadAllCategories();

        const lastFetch = localStorage.getItem('videos_last_fetch');
        if (lastFetch) {
          setLastFetchTime(lastFetch);
        }

        // Load homepage videos
        const homepageDoc = await getDoc(doc(db, "homepage", "homepage"));
        if (homepageDoc.exists()) {
          const data = homepageDoc.data();
          setHomepageVideos(data.videos || []);
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

  const totalVideos = Object.values(totalCountsByCategory).reduce((sum, count) => sum + count, 0);

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
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-md">
          <div className="bg-white rounded-2xl p-8 flex flex-col items-center">
            <Loader className="w-12 h-12 text-orange-500 animate-spin mb-4" />
            <p className="text-gray-900 font-bold">
              {fetchingVideos ? 'Fetching videos from YouTube Playlists...' : 'Processing...'}
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
              <h1 className="text-4xl font-black text-white mb-2">Category Videos Management</h1>
              <p className="text-orange-100">Auto-synced with YouTube Playlists</p>
              {lastFetchTime && (
                <p className="text-orange-200 text-sm mt-1">
                  Last updated: {new Date(lastFetchTime).toLocaleString()}
                </p>
              )}
            </div>
            <div className="flex items-center gap-4">
              <button
                onClick={() => setShowAddForm(!showAddForm)}
                className={`inline-flex items-center gap-2 ${getButton('success')}`}
              >
                <Video className="w-5 h-5" />
                Add Video
              </button>
              <button
                onClick={handleManualRefresh}
                disabled={fetchingVideos}
                className={`inline-flex items-center gap-2 ${getButton('secondary')} disabled:opacity-50`}
              >
                <RefreshCw className={`w-5 h-5 ${fetchingVideos ? 'animate-spin' : ''}`} />
                Refresh Categories
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

      {/* Category Filter */}
      <div className="bg-white border-b-2 border-gray-100 shadow-sm">
        <div className="container mx-auto px-4 max-w-7xl py-4">
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div className="flex items-center gap-4">
              <label className="text-sm font-bold text-gray-900">View Category:</label>
              <select
                value={selectedCategory}
                onChange={async (e) => {
                  const newCategory = e.target.value;
                  setSelectedCategory(newCategory);

                  // Load videos for the selected category
                  setInitialLoading(true);
                  try {
                    const videos = await loadAllVideos(1, newCategory, false);
                    const count = await getAllVideosCount(newCategory);

                    setAllVideos(videos);
                    setAllVideosTotal(count);
                    setAllVideosPage(1);
                  } catch (error) {
                    console.error('Error loading filtered videos:', error);
                  } finally {
                    setInitialLoading(false);
                  }
                }}
                className="text-black px-4 py-2 border-2 border-gray-200 rounded-xl focus:border-orange-500 focus:outline-none transition-colors font-semibold"
              >
                <option value="all">All Categories ({allVideosTotal} videos)</option>

                {/* Show dynamic categories from database - no duplicates */}
                {dynamicCategories.length > 0 ? (
                  dynamicCategories.map((cat, idx) => (
                    <option key={`category-${cat.category_name}-${idx}`} value={cat.category_name}>
                      {cat.category_name} ({cat.count} videos)
                    </option>
                  ))
                ) : (
                  /* Fallback: Show unique categories from hardcoded list */
                  [...new Set(HARDCODED_CATEGORIES.map(cat => cat.category_name))].map((categoryName, idx) => (
                    <option key={`fallback-${idx}`} value={categoryName}>
                      {categoryName}
                    </option>
                  ))
                )}
              </select>
            </div>
            <div className="text-sm text-gray-600">
              Showing: <span className="font-bold text-gray-900">{allVideos.length}</span> of <span className="font-bold text-gray-900">{allVideosTotal}</span> videos
            </div>
          </div>
        </div>
      </div>

      {/* Manual Add Video Form */}
      {showAddForm && (
        <div className={`${theme.cards.elevated} rounded-2xl p-8 mb-8`}>
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-2xl font-bold text-gray-900">Add New Video</h3>
            <button
              onClick={() => {
                setShowAddForm(false);
                setManualVideoForm({ video_url: '', category: '', channel_name: '' });
              }}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            <div className="md:col-span-2">
              <label className="block text-sm font-bold text-gray-900 mb-2">
                YouTube Video URL *
              </label>
              <div className="relative">
                <Link className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="url"
                  value={manualVideoForm.video_url}
                  onChange={(e) => setManualVideoForm({ ...manualVideoForm, video_url: e.target.value })}
                  placeholder="https://www.youtube.com/watch?v=..."
                  className="text-black w-full pl-12 pr-4 py-3 border-2 border-gray-200 rounded-xl focus:border-orange-500 focus:outline-none transition-colors"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-bold text-gray-900 mb-2">
                Category *
              </label>
              <select
                value={manualVideoForm.category}
                onChange={(e) => setManualVideoForm({ ...manualVideoForm, category: e.target.value })}
                className="text-black w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-orange-500 focus:outline-none transition-colors"
              >
                <option value="">Select Category</option>
                {STATIC_CATEGORIES.map((cat, idx) => (
                  <option key={idx} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-bold text-gray-900 mb-2">
                Channel Name (Fallback)
              </label>
              <select
                value={manualVideoForm.channel_name}
                onChange={(e) => setManualVideoForm({ ...manualVideoForm, channel_name: e.target.value })}
                className="text-black w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-orange-500 focus:outline-none transition-colors"
              >
                <option value="">Auto-detect or select</option>
                {HARDCODED_CATEGORIES.map((cat, idx) => (
                  <option key={idx} value={cat.channel_name}>
                    {cat.channel_name}
                  </option>
                ))}
              </select>
              <p className="text-xs text-gray-500 mt-1">
                Only needed if channel name cannot be auto-detected
              </p>
            </div>
          </div>

          <div className="flex gap-4 mt-6">
            <button
              onClick={handleAddManualVideo}
              disabled={addingVideo}
              className={`inline-flex items-center gap-2 ${getButton('primary')} disabled:opacity-50 disabled:cursor-not-allowed`}
            >
              {addingVideo ? (
                <Loader className="w-5 h-5 animate-spin" />
              ) : (
                <Save className="w-5 h-5" />
              )}
              Add Video
            </button>
            <button
              onClick={() => {
                setShowAddForm(false);
                setManualVideoForm({ video_url: '', category: '', channel_name: '' });
              }}
              className={getButton('secondary')}
            >
              Cancel
            </button>
          </div>
        </div>
      )}

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
                  className="text-black w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-orange-500 focus:outline-none transition-colors"
                />
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-900 mb-2">
                  Category
                </label>
                <input
                  type="text"
                  value={videoForm.category}
                  onChange={(e) => setVideoForm({ ...videoForm, category: e.target.value })}
                  placeholder="Enter video category"
                  className="text-black w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-orange-500 focus:outline-none transition-colors"
                />
              </div>

              {/* Added Channel Name/ID for context */}
              <div className="md:col-span-1">
                <label className="block text-sm font-bold text-gray-900 mb-2">
                  Channel Source
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
                    className="text-black w-full pl-12 pr-4 py-3 border-2 border-gray-200 rounded-xl focus:border-orange-500 focus:outline-none transition-colors"
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
                  className="text-black w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-orange-500 focus:outline-none transition-colors"
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
                  className="text-black w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-orange-500 focus:outline-none transition-colors resize-none"
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

        {/* All Videos Display with Category Filter */}
        <div className="mb-12">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-12 h-12 bg-gradient-to-br from-orange-400 to-orange-600 rounded-xl flex items-center justify-center">
              <Video className="w-6 h-6 text-white" />
            </div>
            <div>
              <h2 className="text-3xl font-black text-gray-900">
                {selectedCategory === 'all'
                  ? 'All Videos'
                  : selectedCategory
                }
              </h2>
              <p className="text-gray-600">
                Showing {allVideos.length} of {allVideosTotal} videos
              </p>
            </div>
          </div>

          {allVideos.length > 0 ? (
            <>
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {allVideos.map((video) => (
                  <div key={video.id} className={`${theme.cards.elevated} rounded-2xl overflow-hidden hover:shadow-2xl transition-shadow`}>
                    <div className="relative h-48">
                      <img
                        src={video.thumbnail_url || 'https://via.placeholder.com/480x360?text=No+Thumbnail'}
                        alt={video.title}
                        className="text-black w-full h-full object-cover"
                      />
                      <div className="absolute top-4 right-4">
                        <span className="px-3 py-1 bg-blue-600 text-white text-xs font-bold rounded-full shadow-xl">
                          {video.category || 'Uncategorized'}
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
                          // FIX APPLIED HERE: The opening <a> tag was missing.
                          href={video.video_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-xs text-orange-600 hover:text-orange-700 mb-4 block truncate"
                        >
                          🔗 Watch Video
                        </a>
                      )}
                      <div className="flex gap-2 mt-4">
                        <button
                          onClick={() => startEditVideo(video)}
                          className="flex-1 inline-flex items-center justify-center gap-2 bg-blue-500 hover:bg-blue-600 text-white rounded-xl py-2 px-4 font-bold transition-all"
                        >
                          <Edit2 className="w-4 h-4" />
                          Edit
                        </button>
                        <button
                          onClick={() => handleDeleteVideo(video.id, video.category_id)}
                          className="flex-1 inline-flex items-center justify-center gap-2 bg-orange-500 hover:bg-orange-600 text-white rounded-xl py-2 px-4 font-bold transition-all"
                        >
                          <Trash2 className="w-4 h-4" />
                          Delete
                        </button>
                        {(() => {
                          const isOnHomepage = homepageVideos.some(v => v.video_id === video.video_id);
                          return (
                            <button
                              onClick={() => handleDisplayOnHomepage(video)}
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

              {/* Load More Button */}
              {allVideos.length < allVideosTotal && (
                <div className="text-center mt-8">
                  <button
                    onClick={handleLoadMoreAllVideos}
                    disabled={loadingAllVideos}
                    className={`inline-flex items-center gap-2 ${getButton('secondary')} disabled:opacity-50`}
                  >
                    {loadingAllVideos ? (
                      <>
                        <Loader className="w-5 h-5 animate-spin" />
                        Loading...
                      </>
                    ) : (
                      <>
                        <ChevronDown className="w-5 h-5" />
                        Load More ({allVideosTotal - allVideos.length} remaining)
                      </>
                    )}
                  </button>
                </div>
              )}
            </>
          ) : (
            <div className="text-center py-12 bg-gray-50 rounded-2xl">
              <Video className="w-12 h-12 text-gray-300 mx-auto mb-3" />
              <p className="text-gray-600">No videos found for this category yet</p>
              <p className="text-gray-500 text-sm mt-1">Videos will appear automatically when uploaded to the configured playlist.</p>
            </div>
          )}
        </div>

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