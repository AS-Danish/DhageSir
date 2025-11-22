import React, { useState } from 'react';
import { Play, Youtube, Filter, Eye, Clock, ArrowRight } from 'lucide-react';

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
    <section className="py-16 md:py-20 bg-white relative overflow-hidden">
      {/* Background Elements */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-red-50 rounded-full filter blur-3xl opacity-40"></div>
      <div className="absolute bottom-0 left-0 w-96 h-96 bg-blue-50 rounded-full filter blur-3xl opacity-40"></div>
      
      <div className="container mx-auto px-4 max-w-7xl relative z-10">
        {/* Section Header */}
        <div className="text-center mb-10">
          <div className="inline-flex items-center gap-2 px-5 py-2 bg-gradient-to-r from-red-600 to-pink-600 text-white rounded-full text-sm font-semibold mb-4 shadow-lg">
            <Play className="w-4 h-4 fill-white" />
            Video Library
          </div>
          <h2 className="text-4xl md:text-5xl font-black text-gray-900 mb-3">
            Educational <span className="bg-gradient-to-r from-red-600 to-pink-600 bg-clip-text text-transparent">Videos</span>
          </h2>
          <p className="text-gray-600 text-lg max-w-2xl mx-auto">
            Watch expert guidance, strategies, and motivational content directly on our platform
          </p>
        </div>

        {/* Category Filters */}
        <div className="mb-10">
          <div className="flex items-center gap-3 mb-4">
            <Filter className="w-5 h-5 text-gray-700" />
            <span className="font-bold text-gray-900">Filter by Category:</span>
          </div>
          <div className="flex flex-wrap gap-3">
            {categories.map((category) => (
              <button
                key={category}
                onClick={() => setActiveCategory(category)}
                className={`px-6 py-3 rounded-xl font-semibold transition-all shadow-md hover:shadow-xl hover:scale-105 ${
                  activeCategory === category
                    ? 'bg-gradient-to-r from-red-600 to-pink-600 text-white'
                    : 'bg-white text-gray-700 border-2 border-gray-200 hover:border-red-600'
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
              <div className="bg-white rounded-2xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-300">
                {/* Video Thumbnail/Embed */}
                <div className="relative aspect-video bg-gray-900">
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
                      <div className="absolute inset-0 bg-gradient-to-t from-gray-900/80 via-gray-900/40 to-transparent"></div>
                      
                      {/* Play Button */}
                      <button 
                        onClick={() => setPlayingVideo(video.id)}
                        className="absolute inset-0 flex items-center justify-center group-hover:scale-110 transition-transform"
                      >
                        <div className="w-20 h-20 bg-red-600 rounded-full flex items-center justify-center shadow-2xl group-hover:bg-red-700 transition-colors">
                          <Play className="w-8 h-8 text-white fill-white ml-1" />
                        </div>
                      </button>

                      {/* Duration Badge */}
                      <div className="absolute bottom-3 right-3 px-3 py-1 bg-gray-900/90 backdrop-blur-sm text-white text-xs font-bold rounded-lg flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {video.duration}
                      </div>

                      {/* Channel Badge */}
                      <div className="absolute top-3 left-3 px-3 py-1 bg-red-600 text-white text-xs font-bold rounded-full shadow-lg">
                        {video.channel}
                      </div>
                    </>
                  )}
                </div>

                {/* Video Info */}
                <div className="p-5">
                  <div className="mb-3">
                    <span className="inline-block px-3 py-1 bg-gradient-to-r from-red-100 to-pink-100 text-red-700 text-xs font-bold rounded-full">
                      {video.category}
                    </span>
                  </div>
                  <h3 className="text-lg font-bold text-gray-900 mb-3 line-clamp-2 group-hover:text-red-600 transition-colors">
                    {video.title}
                  </h3>
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <Eye className="w-4 h-4" />
                    <span className="font-semibold">{video.views} views</span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* YouTube Channels & View All */}
        <div className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-3xl p-8 md:p-10 shadow-xl border border-gray-200">
          <div className="flex flex-col lg:flex-row items-center justify-between gap-6">
            {/* Left Side - Channels */}
            <div className="flex-1">
              <h3 className="text-2xl font-black text-gray-900 mb-2 flex items-center gap-3">
                <Youtube className="w-8 h-8 text-red-600" />
                Subscribe to Our Channels
              </h3>
              <p className="text-gray-600 mb-5">Get notified about new educational content and live sessions</p>
              
              <div className="flex flex-col sm:flex-row gap-4">
                <a 
                  href="https://www.youtube.com/@yourchannel1" 
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center justify-center gap-3 px-8 py-4 bg-red-600 text-white rounded-xl font-bold hover:bg-red-700 hover:shadow-2xl hover:scale-105 transition-all shadow-xl group"
                >
                  <Youtube className="w-5 h-5" />
                  YouTube Channel 1
                  <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </a>
                
                <a 
                  href="https://www.youtube.com/@yourchannel2" 
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center justify-center gap-3 px-8 py-4 bg-white border-2 border-red-600 text-red-600 rounded-xl font-bold hover:bg-red-600 hover:text-white hover:shadow-2xl hover:scale-105 transition-all shadow-lg group"
                >
                  <Youtube className="w-5 h-5" />
                  YouTube Channel 2
                  <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </a>
              </div>
            </div>

            {/* Right Side - View All Button */}
            <div className="lg:border-l lg:border-gray-300 lg:pl-8">
              <button className="inline-flex items-center gap-3 px-10 py-5 bg-gradient-to-r from-gray-900 to-gray-800 text-white rounded-xl font-bold hover:from-red-600 hover:to-pink-600 hover:shadow-2xl hover:scale-105 transition-all shadow-xl group whitespace-nowrap">
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