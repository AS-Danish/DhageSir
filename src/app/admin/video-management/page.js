"use client";
import React, { useState, useEffect } from 'react';
import { Video, Plus, Edit2, Trash2, X, Save, RefreshCw, Youtube, Loader, Link as LinkIcon, Star } from 'lucide-react';
import { db } from '@/firebase/firebaseConfig';
import { collection, query, where, getDocs, doc, getDoc, setDoc } from 'firebase/firestore';
import { useAdminStore } from '@/store/useAdminStore';
import AdminModal from '@/components/admin/ui/AdminModal';
import Pagination from '@/components/admin/ui/Pagination';

const HARDCODED_CATEGORIES = [
  { category_name: "International Affairs", category_id: "PLuhKcyouEj89HXq_64Ffinu5U7y6P8aLA", channel_name: "Dr Satish Dhage", channel_id: "UCgXrITZ6XnP_thbBey-enOA" },
  { category_name: "Military and Defence", category_id: "PLuhKcyouEj89kDJLw1VG0GBezUHDqfNId", channel_name: "Dr Satish Dhage", channel_id: "UCgXrITZ6XnP_thbBey-enOA" },
  { category_name: "Competetive Exam and Current Affairs", category_id: "PLuhKcyouEj8-3G1vad65NcGYCZtroUv3A", channel_name: "Dr Satish Dhage", channel_id: "UCgXrITZ6XnP_thbBey-enOA" },
  { category_name: "Disaster", category_id: "PLqB5N9NDPhbJfrao7Z7f90OU5S7nyBu39", channel_name: "The Mentors Forum", channel_id: "UC6hqtj38jmIqhx1e3POVu8w" },
  { category_name: "Military and Defence", category_id: "PLqB5N9NDPhbJDNP7qA0mDgfzVHQWeywSF", channel_name: "The Mentors Forum", channel_id: "UC6hqtj38jmIqhx1e3POVu8w" }
];

const STATIC_CATEGORIES = ["Competetive Exams and Current Affairs", "Disaster", "International Affairs", "Military and Defence", "Uncategorized", "Mentorship"];

const theme = { gradients: { primary: 'from-orange-500 to-orange-600' } };

const getButton = (variant = 'primary') => {
  const variants = {
    primary: 'bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white rounded-xl py-3 px-6 font-bold transition-all shadow-md hover:shadow-lg',
    secondary: 'bg-gray-100 hover:bg-gray-200 text-gray-900 rounded-xl py-3 px-6 font-bold transition-all',
    success: 'bg-green-500 hover:bg-green-600 text-white rounded-xl py-3 px-6 font-bold transition-all',
  };
  return variants[variant];
};

const extractVideoDetails = async (videoUrl) => {
  let videoId = null;
  const patterns = [ /(?:youtube\.com\/watch\?v=)([^&\s]+)/, /(?:youtu\.be\/)([^&\s?]+)/, /(?:youtube\.com\/shorts\/)([^&\s?]+)/, /(?:youtube\.com\/embed\/)([^&\s?]+)/, /(?:youtube\.com\/v\/)([^&\s?]+)/ ];
  for (const pattern of patterns) {
    const match = videoUrl.match(pattern);
    if (match && match[1]) { videoId = match[1]; break; }
  }
  if (!videoId) throw new Error('Invalid YouTube URL.');
  let publishedDate = new Date().toISOString();
  try {
    const res = await fetch(`https://www.youtube.com/oembed?url=https://www.youtube.com/watch?v=${videoId}&format=json`);
    if (res.ok) {
      const data = await res.json();
      return { video_id: videoId, title: data.title, thumbnail_url: data.thumbnail_url || `https://i.ytimg.com/vi/${videoId}/hqdefault.jpg`, channel_name: data.author_name, description: '', published_at_iso: publishedDate };
    }
  } catch (e) {}
  return { video_id: videoId, title: 'Untitled Video', thumbnail_url: `https://i.ytimg.com/vi/${videoId}/hqdefault.jpg`, channel_name: '', description: '', published_at_iso: publishedDate };
};

const parseYouTubePlaylistRSS = async (playlistId) => {
  const RSS_URL = `https://www.youtube.com/feeds/videos.xml?playlist_id=${playlistId}`;
  const proxies = ['https://api.allorigins.win/raw?url=', 'https://corsproxy.io/?', 'https://api.codetabs.com/v1/proxy?quest='];
  for (let proxy of proxies) {
    try {
      const res = await fetch(proxy + encodeURIComponent(RSS_URL), { headers: { 'Accept': 'application/xml' }});
      if (!res.ok) continue;
      const text = await res.text();
      const parser = new DOMParser();
      const xml = parser.parseFromString(text, 'text/xml');
      const entries = xml.querySelectorAll('entry');
      const videos = [];
      entries.forEach((entry) => {
        const videoId = entry.querySelector('videoId')?.textContent || entry.querySelector('yt\\:videoId')?.textContent || '';
        const title = entry.querySelector('title')?.textContent || '';
        const description = entry.querySelector('media\\:group media\\:description')?.textContent || '';
        const thumbnailUrl = entry.querySelector('media\\:group media\\:thumbnail')?.getAttribute('url') || `https://i.ytimg.com/vi/${videoId}/hqdefault.jpg`;
        const publishedDate = entry.querySelector('published')?.textContent || new Date().toISOString();
        if (videoId && title) {
          videos.push({ title, description, video_url: `https://www.youtube.com/watch?v=${videoId}&list=${playlistId}`, thumbnail_url: thumbnailUrl, video_id: videoId, published_at_iso: publishedDate });
        }
      });
      return videos;
    } catch (e) {}
  }
  return [];
};

export default function AdminVideosPage() {
  const { videos, fetchCollection, addDocument, updateDocument, deleteDocument, currentPage, itemsPerPage, setPagination } = useAdminStore();
  const [initialLoading, setInitialLoading] = useState(true);
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingVideo, setEditingVideo] = useState(null);
  const [videoForm, setVideoForm] = useState({ title: '', description: '', video_url: '', thumbnail_url: '', channel_name: '', category: '' });
  
  const [isSaving, setIsSaving] = useState(false);
  const [fetchingVideos, setFetchingVideos] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState('all');

  useEffect(() => {
    const loadData = async () => {
      setInitialLoading(true);
      try {
        await fetchCollection('videos', 'videos');
      } catch (error) {
        console.error('Failed to load videos');
      } finally {
        setInitialLoading(false);
      }
    };
    loadData();
  }, [fetchCollection]);

  const autoFetchVideos = async () => {
    try {
      setFetchingVideos(true);
      let added = 0;
      const existingIds = new Set(videos.map(v => v.video_id));
      for (const cat of HARDCODED_CATEGORIES) {
        const fetched = await parseYouTubePlaylistRSS(cat.category_id);
        for (const v of fetched) {
          if (!existingIds.has(v.video_id)) {
            await addDocument('videos', { ...v, channel_id: cat.channel_id, channel_name: cat.channel_name, category_id: cat.category_id, category: cat.category_name, created_at_iso: new Date().toISOString() }, 'videos');
            existingIds.add(v.video_id);
            added++;
          }
        }
      }
      alert(`✅ Fetch complete! Added ${added} videos.`);
    } catch (error) {
      alert('Failed to fetch videos.');
    } finally {
      setFetchingVideos(false);
    }
  };

  const openModal = (video = null) => {
    if (video) {
      setEditingVideo(video);
      setVideoForm({ title: video.title, description: video.description, video_url: video.video_url, thumbnail_url: video.thumbnail_url, channel_name: video.channel_name, category: video.category });
    } else {
      setEditingVideo(null);
      setVideoForm({ title: '', description: '', video_url: '', thumbnail_url: '', channel_name: '', category: '' });
    }
    setIsModalOpen(true);
  };

  const saveVideo = async () => {
    if (!videoForm.video_url || !videoForm.category) return alert('Provide Video URL and Category');
    setIsSaving(true);
    try {
      let dataToSave = {};
      if (!editingVideo) {
        const details = await extractVideoDetails(videoForm.video_url);
        dataToSave = { title: details.title, description: details.description, video_url: videoForm.video_url, video_id: details.video_id, thumbnail_url: details.thumbnail_url, channel_name: videoForm.channel_name || details.channel_name, category: videoForm.category, created_at_iso: new Date().toISOString(), published_at_iso: details.published_at_iso };
        const q = query(collection(db, "videos"), where("video_id", "==", details.video_id));
        const snap = await getDocs(q);
        if (!snap.empty) throw new Error('Video exists');
        await addDocument('videos', dataToSave, 'videos');
      } else {
        dataToSave = { title: videoForm.title, description: videoForm.description, video_url: videoForm.video_url, thumbnail_url: videoForm.thumbnail_url, category: videoForm.category, updated_at: new Date().toISOString() };
        await updateDocument('videos', editingVideo.id, dataToSave, 'videos');
      }
      setIsModalOpen(false);
    } catch (error) {
      alert(error.message);
    } finally {
      setIsSaving(false);
    }
  };

  const deleteVideo = async (id) => {
    if (window.confirm('Are you sure you want to delete this video?')) {
      await deleteDocument('videos', id, 'videos');
    }
  };

  const toggleHomepage = async (video) => {
    try {
      const refDoc = doc(db, "homepage", "homepage");
      const snap = await getDoc(refDoc);
      let data = snap.exists() ? snap.data() : { videos: [] };
      let hVideos = data.videos || [];
      const isOnHomepage = hVideos.some(v => v.video_id === video.video_id);
      if (isOnHomepage) hVideos = hVideos.filter(v => v.video_id !== video.video_id);
      else hVideos.push({ video_id: video.video_id, title: video.title, video_url: video.video_url, category: video.category, thumbnail_url: video.thumbnail_url, added_at: new Date().toISOString() });
      await setDoc(refDoc, { ...data, videos: hVideos, updated_at: new Date().toISOString() });
      alert(isOnHomepage ? 'Removed from homepage' : 'Added to homepage');
    } catch (e) { alert('Failed'); }
  };

  if (initialLoading) {
    return <div className="min-h-[80vh] flex items-center justify-center"><Loader className="w-12 h-12 text-orange-500 animate-spin" /></div>;
  }

  const itemsPerGridPage = 9;
  const filteredVideos = selectedCategory === 'all' ? videos : videos.filter(v => v.category === selectedCategory);
  const startIndex = (currentPage - 1) * itemsPerGridPage;
  const paginatedVideos = filteredVideos.slice(startIndex, startIndex + itemsPerGridPage);
  const uniqueCategories = ["all", ...new Set(videos.map(v => v.category).filter(Boolean))];

  return (
    <div className="min-h-screen">
      <div className={`bg-gradient-to-r ${theme.gradients.primary} py-8 px-8 rounded-3xl shadow-lg mb-8`}>
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-black text-white mb-2">Category Videos Management</h1>
            <p className="text-orange-100 font-medium">Auto-synced with YouTube Playlists</p>
          </div>
          <Video className="w-16 h-16 text-white opacity-20" />
        </div>
      </div>

      <div className="flex flex-col md:flex-row justify-between items-center mb-6 gap-4">
        <div className="flex items-center gap-4">
          <label className="text-sm font-bold text-gray-900">Filter:</label>
          <select value={selectedCategory} onChange={(e) => {setSelectedCategory(e.target.value); setPagination(1);}} className="px-4 py-2 bg-white border border-gray-200 rounded-xl font-bold text-black">
            {uniqueCategories.map(c => <option key={c} value={c}>{c === 'all' ? `All Categories (${videos.length})` : c}</option>)}
          </select>
        </div>
        <div className="flex gap-4">
          <button onClick={autoFetchVideos} disabled={fetchingVideos} className={`inline-flex items-center gap-2 ${getButton('secondary')} bg-white border border-gray-200`}>
            <RefreshCw className={`w-5 h-5 ${fetchingVideos ? 'animate-spin text-orange-500' : 'text-gray-600'}`} /> Sync
          </button>
          <button onClick={() => openModal()} className={`inline-flex items-center gap-2 ${getButton('primary')}`}>
            <Plus className="w-5 h-5" /> Add Video
          </button>
        </div>
      </div>

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
        {paginatedVideos.map((video) => (
          <div key={video.id} className="bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-xl border border-gray-100 transition-all flex flex-col">
            <div className="relative h-48">
              <img src={video.thumbnail_url || 'https://via.placeholder.com/480x360?text=No+Thumbnail'} alt={video.title} className="w-full h-full object-cover" />
              <div className="absolute top-4 right-4">
                <span className="px-3 py-1 bg-blue-600 text-white text-xs font-bold rounded-full shadow-lg">{video.category || 'Uncategorized'}</span>
              </div>
            </div>
            <div className="p-6 flex flex-col flex-1">
              <h3 className="text-lg font-bold text-gray-900 mb-2 line-clamp-2">{video.title}</h3>
              <p className="text-gray-600 text-sm mb-4 line-clamp-2 flex-1">{video.description}</p>
              <div className="flex flex-wrap gap-2 mt-auto">
                <a href={video.video_url} target="_blank" rel="noopener noreferrer" className="flex-1 inline-flex justify-center items-center gap-2 bg-orange-100 hover:bg-orange-200 text-orange-700 rounded-lg py-2 text-sm font-bold transition-colors">
                  <Youtube className="w-4 h-4" /> Watch
                </a>
                <button onClick={() => toggleHomepage(video)} className="flex-1 inline-flex justify-center items-center gap-2 bg-yellow-100 hover:bg-yellow-200 text-yellow-700 rounded-lg py-2 text-sm font-bold transition-colors">
                  <Star className="w-4 h-4" /> Feature
                </button>
              </div>
              <div className="flex gap-2 mt-2">
                <button onClick={() => openModal(video)} className="flex-1 inline-flex justify-center items-center gap-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg py-2 text-sm font-bold transition-colors">
                  <Edit2 className="w-4 h-4" /> Edit
                </button>
                <button onClick={() => deleteVideo(video.id)} className="flex-1 inline-flex justify-center items-center gap-2 bg-red-50 hover:bg-red-100 text-red-600 rounded-lg py-2 text-sm font-bold transition-colors">
                  <Trash2 className="w-4 h-4" /> Delete
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
      
      {filteredVideos.length > 0 && (
        <Pagination currentPage={currentPage} totalItems={filteredVideos.length} itemsPerPage={itemsPerGridPage} onPageChange={setPagination} />
      )}

      <AdminModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title={editingVideo ? "Edit Video" : "Add Video"} onSave={saveVideo} isSaving={isSaving} size="md">
        <div className="space-y-6">
          {!editingVideo && (
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">YouTube URL *</label>
              <div className="relative">
                <LinkIcon className="absolute left-4 top-3.5 w-5 h-5 text-gray-400" />
                <input type="url" value={videoForm.video_url} onChange={e => setVideoForm({...videoForm, video_url: e.target.value})} className="w-full pl-12 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-orange-500 outline-none transition-all text-black" placeholder="https://youtube.com/watch?v=..." />
              </div>
            </div>
          )}
          {editingVideo && (
            <>
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">Title</label>
                <input type="text" value={videoForm.title} onChange={e => setVideoForm({...videoForm, title: e.target.value})} className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-orange-500 outline-none transition-all text-black" />
              </div>
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">Description</label>
                <textarea value={videoForm.description} onChange={e => setVideoForm({...videoForm, description: e.target.value})} rows={3} className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-orange-500 outline-none transition-all text-black resize-none" />
              </div>
            </>
          )}
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-2">Category *</label>
            <select value={videoForm.category} onChange={e => setVideoForm({...videoForm, category: e.target.value})} className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-orange-500 outline-none transition-all text-black">
              <option value="">Select Category</option>
              {STATIC_CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>
          {!editingVideo && (
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">Channel Name (Optional)</label>
              <input type="text" value={videoForm.channel_name} onChange={e => setVideoForm({...videoForm, channel_name: e.target.value})} className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-orange-500 outline-none transition-all text-black" placeholder="Leave empty to auto-detect" />
            </div>
          )}
        </div>
      </AdminModal>
    </div>
  );
}