"use client";
import React, { useState, useEffect } from 'react';
import { Video, Plus, Youtube, RefreshCw, Loader } from 'lucide-react';
import { useAdminStore } from '@/store/useAdminStore';
import AdminTable from '@/components/admin/ui/AdminTable';
import AdminModal from '@/components/admin/ui/AdminModal';
import { collection, query, getDocs, where } from 'firebase/firestore';
import { db } from '@/firebase/firebaseConfig';

const theme = {
  gradients: { primary: 'from-orange-500 to-orange-600' },
};

const getButton = (variant = 'primary') => {
  const variants = {
    primary: 'bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white rounded-xl py-3 px-6 font-bold transition-all shadow-md hover:shadow-lg',
    secondary: 'bg-gray-100 hover:bg-gray-200 text-gray-900 rounded-xl py-3 px-6 font-bold transition-all',
  };
  return variants[variant];
};

// YouTube Utilities
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
const getYouTubeThumbnail = (videoId) => `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`;

const RSS_CONFIG = { youtube_playlist_id: 'PLuhKcyouEj88n3mjo1edgApbm4NzfgGI7' };

const parseYouTubePlaylistRSS = async (playlistId, retries = 3) => {
  const RSS_URL = `https://www.youtube.com/feeds/videos.xml?playlist_id=${playlistId}`;
  const CORS_PROXIES = ['https://api.allorigins.win/raw?url=', 'https://corsproxy.io/?', 'https://api.codetabs.com/v1/proxy?quest='];
  for (let attempt = 0; attempt <= retries; attempt++) {
    const CORS_PROXY = CORS_PROXIES[attempt % CORS_PROXIES.length];
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 15000);
      const response = await fetch(CORS_PROXY + encodeURIComponent(RSS_URL), { signal: controller, headers: { 'Accept': 'application/xml, text/xml, */*' } });
      clearTimeout(timeoutId);
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      const text = await response.text();
      const parser = new DOMParser();
      const xml = parser.parseFromString(text, 'text/xml');
      if (xml.querySelector('parsererror')) throw new Error('XML parsing error');
      const entries = xml.querySelectorAll('entry');
      const podcasts = [];
      entries.forEach((entry) => {
        const videoId = entry.querySelector('videoId')?.textContent || entry.querySelector('yt\\:videoId')?.textContent || '';
        const title = entry.querySelector('title')?.textContent || '';
        const thumbnailUrl = entry.querySelector('media\\:group media\\:thumbnail')?.getAttribute('url') || `https://i.ytimg.com/vi/${videoId}/hqdefault.jpg`;
        if (videoId && title) {
          podcasts.push({ title, youtube_url: `https://www.youtube.com/watch?v=${videoId}`, video_id: videoId, thumbnail_url: thumbnailUrl, platform: 'youtube' });
        }
      });
      return podcasts;
    } catch (error) {
      if (attempt === retries) return [];
      await new Promise(r => setTimeout(r, 1000 + (500 * attempt)));
    }
  }
  return [];
};

export default function AdminPodcastsPage() {
  const { podcasts, fetchCollection, addDocument, updateDocument, deleteDocument, currentPage, itemsPerPage, setPagination } = useAdminStore();
  const [initialLoading, setInitialLoading] = useState(true);
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingPodcast, setEditingPodcast] = useState(null);
  const [podcastForm, setPodcastForm] = useState({ title: '', youtube_url: '' });
  
  const [isSaving, setIsSaving] = useState(false);
  const [fetchingPodcasts, setFetchingPodcasts] = useState(false);
  const [validatingUrl, setValidatingUrl] = useState(false);
  const [urlError, setUrlError] = useState('');

  useEffect(() => {
    const loadData = async () => {
      setInitialLoading(true);
      try {
        await fetchCollection('podcasts', 'podcasts');
      } catch (error) {
        console.error('Failed to load podcasts');
      } finally {
        setInitialLoading(false);
      }
    };
    loadData();
  }, [fetchCollection]);

  const autoFetchPodcasts = async () => {
    try {
      setFetchingPodcasts(true);
      const fetchedPodcasts = await parseYouTubePlaylistRSS(RSS_CONFIG.youtube_playlist_id);
      const existingUrls = new Set(podcasts.map(p => p.youtube_url));
      
      let addedCount = 0;
      for (const podcast of fetchedPodcasts) {
        if (!existingUrls.has(podcast.youtube_url)) {
          await addDocument('podcasts', { ...podcast, created_at: new Date().toISOString() }, 'podcasts');
          addedCount++;
        }
      }
      alert(`✅ Fetch complete! Added: ${addedCount}`);
    } catch (error) {
      alert('Failed to fetch podcasts: ' + error.message);
    } finally {
      setFetchingPodcasts(false);
    }
  };

  const openModal = (podcast = null) => {
    if (podcast) {
      setEditingPodcast(podcast);
      setPodcastForm({ title: podcast.title, youtube_url: podcast.youtube_url });
    } else {
      setEditingPodcast(null);
      setPodcastForm({ title: '', youtube_url: '' });
    }
    setUrlError('');
    setIsModalOpen(true);
  };

  const savePodcast = async () => {
    if (!podcastForm.youtube_url) return alert('Please provide a YouTube URL');
    setIsSaving(true);
    setValidatingUrl(true);
    try {
      const videoId = extractYouTubeID(podcastForm.youtube_url);
      if (!videoId) throw new Error('Invalid YouTube URL');
      const thumbnailUrl = getYouTubeThumbnail(videoId);

      let videoTitle = podcastForm.title;
      if (!videoTitle && !editingPodcast) {
        try {
          const res = await fetch(`https://www.youtube.com/oembed?url=https://www.youtube.com/watch?v=${videoId}&format=json`);
          if (res.ok) {
            const data = await res.json();
            videoTitle = data.title;
          }
        } catch (e) {
          videoTitle = 'Untitled Podcast';
        }
      }

      const data = {
        title: videoTitle,
        youtube_url: podcastForm.youtube_url,
        video_id: videoId,
        thumbnail_url: thumbnailUrl,
        platform: 'youtube',
        [editingPodcast ? 'updated_at' : 'created_at']: new Date().toISOString(),
      };

      if (!editingPodcast) {
        const q = query(collection(db, "podcasts"), where("video_id", "==", videoId));
        const snap = await getDocs(q);
        if (!snap.empty) throw new Error('Podcast already exists');
        await addDocument('podcasts', data, 'podcasts');
      } else {
        await updateDocument('podcasts', editingPodcast.id, data, 'podcasts');
      }

      setIsModalOpen(false);
    } catch (error) {
      setUrlError(error.message);
    } finally {
      setIsSaving(false);
      setValidatingUrl(false);
    }
  };

  const deletePodcast = async (id) => {
    if (window.confirm('Are you sure you want to delete this podcast?')) {
      await deleteDocument('podcasts', id, 'podcasts');
    }
  };

  if (initialLoading) {
    return (
      <div className="min-h-[80vh] flex items-center justify-center">
        <Loader className="w-12 h-12 text-orange-500 animate-spin" />
      </div>
    );
  }

  const columns = [
    { header: "Thumbnail", accessor: "thumbnail_url", render: (item) => (
      <div className="w-24 h-16 rounded overflow-hidden shadow">
        <img src={item.thumbnail_url} alt="" className="w-full h-full object-cover" />
      </div>
    )},
    { header: "Title", accessor: "title", render: (item) => <div className="font-bold text-gray-900">{item.title}</div> },
    { header: "URL", accessor: "youtube_url", render: (item) => (
      <a href={item.youtube_url} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline text-sm break-all">
        {item.youtube_url}
      </a>
    )},
    { header: "Added On", accessor: "created_at", render: (item) => (
      <div className="text-gray-500 text-sm">{new Date(item.created_at).toLocaleDateString()}</div>
    )}
  ];

  return (
    <div className="min-h-screen">
      <div className={`bg-gradient-to-r ${theme.gradients.primary} py-8 px-8 rounded-3xl shadow-lg mb-8`}>
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-black text-white mb-2">Podcast Management</h1>
            <p className="text-orange-100 font-medium">Manage YouTube podcasts and sync automatically</p>
          </div>
          <Video className="w-16 h-16 text-white opacity-20" />
        </div>
      </div>

      <div className="flex flex-col md:flex-row justify-between items-center mb-6 gap-4">
        <h2 className="text-2xl font-bold text-gray-900">All Podcasts ({podcasts.length})</h2>
        <div className="flex gap-4">
          <button
            onClick={autoFetchPodcasts}
            disabled={fetchingPodcasts}
            className={`inline-flex items-center gap-2 ${getButton('secondary')} bg-white border border-gray-200`}
          >
            <RefreshCw className={`w-5 h-5 ${fetchingPodcasts ? 'animate-spin text-orange-500' : 'text-gray-600'}`} />
            {fetchingPodcasts ? 'Syncing...' : 'Sync from YouTube'}
          </button>
          <button onClick={() => openModal()} className={`inline-flex items-center gap-2 ${getButton('primary')}`}>
            <Plus className="w-5 h-5" /> Add Manually
          </button>
        </div>
      </div>

      <AdminTable
        items={podcasts}
        columns={columns}
        currentPage={currentPage}
        itemsPerPage={itemsPerPage}
        onPageChange={setPagination}
        onEdit={openModal}
        onDelete={deletePodcast}
      />

      <AdminModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingPodcast ? "Edit Podcast" : "Add Podcast"}
        onSave={savePodcast}
        isSaving={isSaving || validatingUrl}
        size="md"
      >
        <div className="space-y-6">
          {urlError && (
            <div className="p-4 bg-red-50 text-red-600 rounded-xl border border-red-100 text-sm font-medium">
              {urlError}
            </div>
          )}
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-2">YouTube Video URL *</label>
            <div className="relative">
              <Youtube className="absolute left-4 top-3.5 w-5 h-5 text-gray-400" />
              <input type="url" value={podcastForm.youtube_url} onChange={e => setPodcastForm({...podcastForm, youtube_url: e.target.value})} className="w-full pl-12 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-orange-500 outline-none transition-all text-black" placeholder="https://youtube.com/watch?v=..." />
            </div>
          </div>
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-2">Title (Optional)</label>
            <input type="text" value={podcastForm.title} onChange={e => setPodcastForm({...podcastForm, title: e.target.value})} className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-orange-500 outline-none transition-all text-black" placeholder="Leave empty to fetch automatically" />
          </div>
        </div>
      </AdminModal>
    </div>
  );
}