'use client';

import React, { useState, useEffect } from 'react';
import { Play, Youtube, ArrowRight, Loader } from 'lucide-react';
import { db } from '../firebase/firebaseConfig';
import { doc, getDoc } from 'firebase/firestore';
import Link from 'next/link';

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

// 🎯 CONFIGURE YOUR "VIEW ALL VIDEOS" URL HERE
const VIEW_ALL_VIDEOS_URL = '/AllVideos';

const VideosSection = ({ homepageData }) => {
  const [videos, setVideos] = useState([]);
  const [playingVideo, setPlayingVideo] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [channels, setChannels] = useState([]);

  // Extract video ID from YouTube URL
  const extractVideoId = (url) => {
    if (!url) return null;
    const match = url.match(/(?:youtu\.be\/|youtube\.com\/(?:embed\/|v\/|watch\?v=|watch\?.+&v=|shorts\/))([^"&?\/\s]{11})/);
    return match ? match[1] : null;
  };

  // Get embed URL from video URL
  const getEmbedUrl = (url) => {
    const videoId = extractVideoId(url);
    return videoId ? `https://www.youtube.com/embed/${videoId}?autoplay=1` : null;
  };

  // Extract unique channels from videos
  const extractChannels = (videosList) => {
    const uniqueChannels = Array.from(
      new Map(
        videosList
          .filter(v => v.channel_name && v.channel_id)
          .map(v => [v.channel_id, { name: v.channel_name, channel_id: v.channel_id }])
      ).values()
    );
    return uniqueChannels;
  };

  // Initial load
  useEffect(() => {
    if (!homepageData) {
      setLoading(true);
      return;
    }

    try {
      const videosArray = homepageData.videos || [];

      const transformedVideos = videosArray.map((video, index) => {
        const videoId = extractVideoId(video.video_url);

        return {
          id: video.video_id || `video-${index}`,
          title: video.title || 'Untitled Video',
          description: video.description || '', // ✅ ADD DESCRIPTION
          thumbnail: video.thumbnail_url || `https://i.ytimg.com/vi/${videoId}/hqdefault.jpg`,
          videoUrl: video.video_url,
          embedUrl: getEmbedUrl(video.video_url),
          category: video.category || 'Uncategorized',
          channel_name: video.channel_name,
          channel_id: video.channel_id
        };
      });

      const extractedChannels = extractChannels(transformedVideos);

      setVideos(transformedVideos);
      setChannels(extractedChannels);
      setLoading(false);
    } catch (error) {
      console.error('Error processing videos:', error);
      setError('Failed to load videos.');
      setLoading(false);
    }
  }, [homepageData]);

  // Determine if the URL is external
  const isExternalUrl = (url) => {
    return url.startsWith('http://') || url.startsWith('https://');
  };

  // --- JSX Rendering ---
  return (
    <section className={`py-16 md:py-20 ${theme.backgrounds.white} relative overflow-hidden`}>
      {/* Background Elements */}
      <div className={`absolute top-0 right-0 w-96 h-96 ${theme.backgrounds.primary} rounded-full filter blur-3xl opacity-40`}></div>
      <div className={`absolute bottom-0 left-0 w-96 h-96 ${theme.backgrounds.primary} rounded-full filter blur-3xl opacity-40`}></div>

      <div className="container mx-auto px-4 max-w-7xl relative z-10">
        {/* Section Header with View All Button */}
        <div className="flex flex-col md:flex-row items-center justify-between mb-10 gap-6">
          {/* Left Side - Header Content */}
          <div className="text-center md:text-left flex-1">
            <div className={`inline-flex items-center gap-2 px-5 py-2 ${theme.badges.primary} rounded-full text-sm font-semibold mb-4 ${theme.shadows.lg}`}>
              <Play className="w-4 h-4 fill-white" />
              Featured Videos
            </div>
            <h2 className={`text-4xl md:text-5xl font-black ${theme.text.primary} mb-3`}>
              Trusted Voice in <span className={`bg-gradient-to-r ${theme.gradients.primary} bg-clip-text text-transparent`}>National Discourse</span>
            </h2>
            <p className={`${theme.text.secondary} text-lg max-w-2xl ${!loading && !error && videos.length > 0 ? 'md:mx-0' : 'mx-auto'}`}>
              Regular expert commentary on leading news channels and platforms, providing insights on defence, geopolitics, international affairs, leadership, disaster management and current affairs.
            </p>
          </div>

          {/* Right Side - View All Videos Button */}
          {!loading && !error && videos.length > 0 && (
            <div className="flex-shrink-0">
              {isExternalUrl(VIEW_ALL_VIDEOS_URL) ? (
                <a
                  href={VIEW_ALL_VIDEOS_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={`inline-flex items-center gap-3 ${getButton('primary')} group whitespace-nowrap`}
                >
                  <Play className="w-5 h-5" />
                  View All Videos
                  <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </a>
              ) : (
                <Link
                  href={VIEW_ALL_VIDEOS_URL}
                  className={`inline-flex items-center gap-3 ${getButton('primary')} group whitespace-nowrap`}
                >
                  <Play className="w-5 h-5" />
                  View All Videos
                  <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </Link>
              )}
            </div>
          )}
        </div>

        {/* Loading State */}
        {loading && (
          <div className="text-center py-20">
            <Loader className="w-12 h-12 text-orange-500 animate-spin mx-auto mb-4" />
            <p className={`${theme.text.secondary} font-semibold`}>Loading featured videos...</p>
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
            {/* Videos Grid */}
            {videos.length > 0 ? (
              <>
                <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8 mb-12">
                  {videos.map((video) => (
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

                              {/* Category Badge (Top Right) */}
                              <div className={`absolute top-3 right-3 px-3 py-1 bg-gradient-to-r ${theme.gradients.primary} ${theme.text.white} text-xs font-bold rounded-full ${theme.shadows.lg}`}>
                                {video.category}
                              </div>
                            </>
                          )}
                        </div>

                        {/* Video Info */}
                        {/* Video Info */}
                        <div className="p-5">
                          {/* Channel Name */}
                          {video.channel_name && (
                            <div className="mb-3">
                              <span className={`inline-block px-3 py-1 ${theme.badges.light} text-xs font-bold rounded-full`}>
                                {video.channel_name}
                              </span>
                            </div>
                          )}

                          <h3 className={`text-lg font-bold ${theme.text.primary} mb-2 line-clamp-2 group-hover:${theme.text.brand} transition-colors`}>
                            {video.title}
                          </h3>

                          {/* ✅ ADD DESCRIPTION */}
                          {video.description && (
                            <p className={`${theme.text.secondary} text-sm line-clamp-3 leading-relaxed`}>
                              {video.description}
                            </p>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {/* YouTube Channels Section */}
                {channels.length > 0 && (
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
                    </div>
                  </div>
                )}
              </>
            ) : (
              <div className="text-center py-20">
                <Play className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-2xl font-bold text-gray-900 mb-2">No featured videos</h3>
                <p className={`${theme.text.secondary}`}>
                  No videos have been added to the homepage yet.
                </p>
              </div>
            )}
          </>
        )}

        {/* YouTube Channels & View All */}
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
                <a
                  href="https://www.youtube.com/@drsatishdhage"
                  target="_blank"
                  rel="noopener noreferrer"
                  className={`inline-flex items-center justify-center gap-3 ${getButton('primary')} group`}
                >
                  <Youtube className="w-5 h-5" />
                  Dr Satish Dhage
                  <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </a>

                <a
                  href="https://www.youtube.com/@TheMentorsForum"
                  target="_blank"
                  rel="noopener noreferrer"
                  className={`inline-flex items-center justify-center gap-3 ${getButton('outline')} group`}
                >
                  <Youtube className="w-5 h-5" />
                  The Mentors Forum
                  <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </a>
              </div>
            </div>

            {/* Right Side - View All Button */}
            <div className={`lg:border-l ${theme.borders.dark} lg:pl-8`}>
              <a
                href="https://www.youtube.com/@drsatishdhage"
                target="_blank" // Recommended: Opens the link in a new tab
                rel="noopener noreferrer" // Recommended: Security measure for target="_blank"
                className={`inline-flex items-center justify-center gap-3 ${getButton('dark')} group whitespace-nowrap`}
              >
                <Play className="w-6 h-6" />
                View All Videos
                <ArrowRight className="w-6 h-6 group-hover:translate-x-1 transition-transform" />
              </a>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default VideosSection;