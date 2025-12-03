'use client';

import React, { useState, useEffect } from 'react';
import { Mic, Podcast, ArrowRight, Loader, Play } from 'lucide-react';
import { db } from '../firebase/firebaseConfig';
import { doc, getDoc } from 'firebase/firestore'; 

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
    primary: 'bg-gradient-to-r from-orange-500 to-orange-600 text-white'
  },
  gradients: {
    primary: 'from-orange-500 to-orange-600',
    overlay: 'from-transparent via-gray-900/20 to-gray-900/80'
  },
  cards: {
    elevated: 'bg-white shadow-xl hover:shadow-2xl'
  },
  shadows: {
    lg: 'shadow-lg',
    xl: 'shadow-xl'
  }
};

const PODCASTS_TO_DISPLAY = 4;
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
  const [podcasts, setPodcasts] = useState([]);
  const [playingPodcast, setPlayingPodcast] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [cache, setCache] = useState(null);

  // Load podcasts from Firebase 'homepage/homepage' document
  const loadPodcasts = async (useCache = true) => {
    try {
      setLoading(true);
      setError(null);

      // Check cache first
      if (useCache && cache && Date.now() - cache.timestamp < CACHE_DURATION) {
        setPodcasts(cache.podcasts);
        setLoading(false);
        return;
      }

      // Fetch from homepage/homepage document
      const homepageDocRef = doc(db, "homepage", "homepage");
      const homepageDoc = await getDoc(homepageDocRef);

      if (!homepageDoc.exists()) {
        console.log('No homepage document found');
        setPodcasts([]);
        setLoading(false);
        return;
      }

      const homepageData = homepageDoc.data();
      const rawPodcastsArray = homepageData.podcasts || [];
      
      // Sort by 'added_at' in descending order (latest first)
      const sortedRawPodcasts = rawPodcastsArray.sort((a, b) => {
        const dateA = new Date(a.added_at || '1970-01-01');
        const dateB = new Date(b.added_at || '1970-01-01');
        return dateB - dateA;
      });

      const fetchedPodcasts = sortedRawPodcasts.map((data, index) => {
        const videoId = data.video_id || extractYouTubeID(data.youtube_url);
        const thumbnail = videoId 
            ? getYouTubeThumbnail(videoId) 
            : data.thumbnail_url || 'https://via.placeholder.com/640x360?text=Podcast+Cover';
        
        return {
          id: data.video_id || `podcast-${index}`,
          title: data.title || 'Untitled Podcast',
          description: data.description || '',
          thumbnail: thumbnail,
          youtubeUrl: data.youtube_url || '',
          videoId: videoId,
          platform: data.platform || 'YouTube',
          guest: data.guest_name || ''
        };
      });

      setPodcasts(fetchedPodcasts);
      
      // Update cache
      setCache({
        podcasts: fetchedPodcasts,
        timestamp: Date.now()
      });
    } catch (error) {
      console.error('Error loading podcasts:', error);
      setError('Failed to load podcasts. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadPodcasts();
  }, []);

  const displayedPodcasts = podcasts.slice(0, PODCASTS_TO_DISPLAY);

  return (
    <section className={`py-16 md:py-20 ${theme.backgrounds.white} relative overflow-hidden`}>
      {/* Background Elements */}
      <div className={`absolute top-0 right-0 w-96 h-96 ${theme.backgrounds.primary} rounded-full filter blur-3xl opacity-40`}></div>
      <div className={`absolute bottom-0 left-0 w-96 h-96 ${theme.backgrounds.primary} rounded-full filter blur-3xl opacity-40`}></div>
      
      <div className="container mx-auto px-4 max-w-7xl relative z-10">
        {/* Section Header */}
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-10 gap-4">
          <div className="text-left flex-1">
            <div className={`inline-flex items-center gap-2 px-5 py-2 ${theme.badges.primary} rounded-full text-sm font-semibold mb-4 ${theme.shadows.lg}`}>
              <Mic className="w-4 h-4 fill-white" />
              Podcast Library
            </div>
            <h2 className={`text-4xl md:text-5xl font-black ${theme.text.primary} mb-3`}>
              Listen & <span className={`bg-gradient-to-r ${theme.gradients.primary} bg-clip-text text-transparent`}>Learn</span>
            </h2>
            <p className={`${theme.text.secondary} text-lg max-w-2xl`}>
              In-depth conversations, expert interviews, and motivational content in video format
            </p>
          </div>
          <a 
            href="/AllPodcasts" 
            className={`inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r ${theme.gradients.primary} ${theme.text.white} rounded-xl font-bold transition-all hover:scale-105 ${theme.shadows.lg} hover:shadow-xl whitespace-nowrap`}
          >
            View All
            <ArrowRight className="w-5 h-5" />
          </a>
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
                className={`px-6 py-3 bg-gradient-to-r ${theme.gradients.primary} ${theme.text.white} rounded-xl font-bold transition-all hover:scale-105`}
              >
                Try Again
              </button>
            </div>
          </div>
        )}

        {/* Podcasts Grid - 4 in a row */}
        {!loading && !error && (
          <>
            {displayedPodcasts.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
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
                              <div className={`w-16 h-16 bg-gradient-to-br ${theme.gradients.primary} rounded-full flex items-center justify-center ${theme.shadows.xl} hover:scale-110 transition-all`}>
                                <Play className={`w-7 h-7 ${theme.text.white} ml-1`} fill="white" />
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
                      <div className="p-4">
                        {podcast.guest && (
                          <span className={`inline-block text-xs ${theme.text.secondary} font-semibold mb-2`}>
                            with {podcast.guest}
                          </span>
                        )}
                        <h3 className={`text-base font-bold ${theme.text.primary} mb-2 line-clamp-2 group-hover:${theme.text.brand} transition-colors`}>
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
            ) : (
              <div className="text-center py-20">
                <Podcast className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-2xl font-bold text-gray-900 mb-2">No podcasts found</h3>
                <p className={`${theme.text.secondary}`}>
                  No podcasts available at the moment.
                </p>
              </div>
            )}
          </>
        )}
      </div>
    </section>
  );
};

export default PodcastsSection;