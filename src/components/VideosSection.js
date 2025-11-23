import React, { useState } from 'react';
import { Play, Youtube, Filter, Eye, Clock, ArrowRight } from 'lucide-react';
import { theme, getButton } from '../app/theme/theme';

const VideosSection = () => {
  const [activeCategory, setActiveCategory] = useState('All');

  const categories = [
    'All',
    'Military Strategy',
    'Exam Preparation',
    'Motivational',
    'Fitness & Health',
    'Leadership',
    'Success Stories'
  ];

  const videos = [
    {
      id: 1,
      title: "NDA Exam Strategy 2025 - Complete Roadmap",
      thumbnail: "https://images.unsplash.com/photo-1434030216411-0b793f4b4173?w=600&h=400&fit=crop",
      videoId: "dQw4w9WgXcQ",
      category: "Exam Preparation",
      duration: "24:15",
      views: "125K",
      channel: "Channel 1"
    },
    {
      id: 2,
      title: "Combat Leadership Principles from the Field",
      thumbnail: "https://images.unsplash.com/photo-1552664730-d307ca884978?w=600&h=400&fit=crop",
      videoId: "dQw4w9WgXcQ",
      category: "Military Strategy",
      duration: "18:42",
      views: "89K",
      channel: "Channel 1"
    },
    {
      id: 3,
      title: "Morning Motivation - Discipline Equals Freedom",
      thumbnail: "https://images.unsplash.com/photo-1504805572947-34fad45aed93?w=600&h=400&fit=crop",
      videoId: "dQw4w9WgXcQ",
      category: "Motivational",
      duration: "12:30",
      views: "256K",
      channel: "Channel 2"
    },
    {
      id: 4,
      title: "Physical Fitness Standards for Defense Forces",
      thumbnail: "https://images.unsplash.com/photo-1517836357463-d25dfeac3438?w=600&h=400&fit=crop",
      videoId: "dQw4w9WgXcQ",
      category: "Fitness & Health",
      duration: "15:20",
      views: "178K",
      channel: "Channel 2"
    },
    {
      id: 5,
      title: "Leadership Lessons from 25 Years in Service",
      thumbnail: "https://images.unsplash.com/photo-1519389950473-47ba0277781c?w=600&h=400&fit=crop",
      videoId: "dQw4w9WgXcQ",
      category: "Leadership",
      duration: "32:18",
      views: "312K",
      channel: "Channel 1"
    },
    {
      id: 6,
      title: "Success Story: From Failure to NDA Selection",
      thumbnail: "https://images.unsplash.com/photo-1523240795612-9a054b0db644?w=600&h=400&fit=crop",
      videoId: "dQw4w9WgXcQ",
      category: "Success Stories",
      duration: "21:45",
      views: "445K",
      channel: "Channel 2"
    }
  ];

  const filteredVideos = activeCategory === 'All' 
    ? videos 
    : videos.filter(video => video.category === activeCategory);

  const [playingVideo, setPlayingVideo] = useState(null);

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
            Watch expert guidance, strategies, and motivational content directly on our platform
          </p>
        </div>

        {/* Category Filters */}
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

        {/* Videos Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 mb-12">
          {filteredVideos.map((video) => (
            <div key={video.id} className="group">
              <div className={`${theme.cards.elevated} rounded-2xl overflow-hidden transition-all duration-300`}>
                {/* Video Thumbnail/Embed */}
                <div className={`relative aspect-video ${theme.backgrounds.dark}`}>
                  {playingVideo === video.id ? (
                    <iframe
                      className="w-full h-full"
                      src={`https://www.youtube.com/embed/${video.videoId}?autoplay=1`}
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
                      />
                      {/* Overlay */}
                      <div className={`absolute inset-0 bg-gradient-to-t ${theme.gradients.overlay}`}></div>
                      
                      {/* Play Button */}
                      <button 
                        onClick={() => setPlayingVideo(video.id)}
                        className="absolute inset-0 flex items-center justify-center group-hover:scale-110 transition-transform"
                      >
                        <div className={`w-20 h-20 bg-gradient-to-br ${theme.gradients.primary} rounded-full flex items-center justify-center ${theme.shadows.xl} hover:scale-110 transition-all`}>
                          <Play className={`w-8 h-8 ${theme.text.white} fill-white ml-1`} />
                        </div>
                      </button>

                      {/* Duration Badge */}
                      <div className={`absolute bottom-3 right-3 px-3 py-1 ${theme.backgrounds.dark} backdrop-blur-sm ${theme.text.white} text-xs font-bold rounded-lg flex items-center gap-1`}>
                        <Clock className="w-3 h-3" />
                        {video.duration}
                      </div>

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
                  <div className={`flex items-center gap-2 text-sm ${theme.text.secondary}`}>
                    <Eye className="w-4 h-4" />
                    <span className="font-semibold">{video.views} views</span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

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
                  href="https://www.youtube.com/@yourchannel1" 
                  target="_blank"
                  rel="noopener noreferrer"
                  className={`inline-flex items-center justify-center gap-3 ${getButton('primary')} group`}
                >
                  <Youtube className="w-5 h-5" />
                  YouTube Channel 1
                  <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </a>
                
                <a 
                  href="https://www.youtube.com/@yourchannel2" 
                  target="_blank"
                  rel="noopener noreferrer"
                  className={`inline-flex items-center justify-center gap-3 ${getButton('outline')} group`}
                >
                  <Youtube className="w-5 h-5" />
                  YouTube Channel 2
                  <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </a>
              </div>
            </div>

            {/* Right Side - View All Button */}
            <div className={`lg:border-l ${theme.borders.dark} lg:pl-8`}>
              <button className={`inline-flex items-center gap-3 ${getButton('dark')} group whitespace-nowrap`}>
                <Play className="w-6 h-6" />
                View All Videos
                <ArrowRight className="w-6 h-6 group-hover:translate-x-1 transition-transform" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default VideosSection;