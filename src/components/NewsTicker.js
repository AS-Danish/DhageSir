import React, { useState, useEffect } from 'react';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../firebase/firebaseConfig';

const NewsTicker = ({ homepageData }) => {
  const [newsItems, setNewsItems] = useState([]);
  const [loading, setLoading] = useState(true);

  // --- Cache helpers (Unchanged) ---
  const getCachedData = (key, maxAge) => {
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


  useEffect(() => {
    if (!homepageData) {
      setLoading(true);
      return;
    }

    try {
      let items = [];
      const newsTickerItems = homepageData.news_ticker || [];

      // 1. Add Video/News Items
      newsTickerItems.forEach(item => {
        if (item.title && item.title.trim() !== '' && item.video_url && item.video_url.trim() !== '') {
          items.push({
            text: `🎥 ${item.title}`,
            link: item.video_url
          });
        }
      });

      // 2. Add Static Text Items
      const staticTexts = [
        'Military Leader',
        'Mentor',
        'Medical Expert',
        "Media",
        "Disaster Management Expert",
        "Defence Expert",
        "Motivational Speaker",
        "International Affairs Expert"
      ];

      staticTexts.forEach(text => {
        items.push({
          text: `⭐ ${text}`, 
          link: '#' 
        });
      });
      
      setNewsItems(items);
      setLoading(false);
    } catch (error) {
      console.error('Error processing ticker data:', error);
      setNewsItems([]);
      setLoading(false);
    }
  }, [homepageData]);

  if (loading) {
    return (
      <div className="bg-gradient-to-r from-orange-500 via-red-500 to-pink-500 text-white py-4">
        <div className="flex items-center justify-center">
          <div className="animate-pulse">Loading latest updates...</div>
        </div>
      </div>
    );
  }

  if (newsItems.length === 0) {
    return null; // Don't show ticker if no items
  }

  return (
    <div className="bg-gradient-to-r from-orange-500 via-red-500 to-pink-500 text-white py-4 overflow-hidden shadow-lg relative">
      <div className="flex items-center">
        {/* Breaking News Badge */}
        <div className="px-4 md:px-6 font-bold text-xs md:text-sm uppercase tracking-wider flex-shrink-0 bg-red-600 py-2 rounded-r-full flex items-center gap-2 relative z-10">
          <div className="w-2 h-2 bg-white rounded-full animate-pulse"></div>
          <span className="hidden sm:inline">Latest Updates</span>
          <span className="sm:hidden">News</span>
        </div>

        {/* Scrolling News Container */}
        <div className="flex-1 overflow-hidden ml-2 md:ml-4 relative">
          <div className="ticker-wrapper">
            {/* Duplicating the array multiple times to ensure seamless scrolling */}
            {newsItems.concat(newsItems).concat(newsItems).concat(newsItems).concat(newsItems).map((news, index) => (
              <a
                key={index}
                href={news.link}
                target={news.link.startsWith('http') ? "_blank" : "_self"}
                rel={news.link.startsWith('http') ? "noopener noreferrer" : ""}
                className="ticker-item"
              >
                {news.text}
              </a>
            ))}
          </div>
        </div>
      </div>

      <style jsx>{`
        .ticker-wrapper {
          display: inline-flex;
          white-space: nowrap;
          will-change: transform;
          animation: scroll-ticker 100s linear infinite;
        }

        .ticker-item {
          display: inline-block;
          padding: 0 3rem;
          font-size: 1rem;
          font-weight: 500;
          text-decoration: none;
          color: white;
          transition: all 0.2s ease;
          flex-shrink: 0;
          line-height: 1.5;
        }

        .ticker-item:hover {
          text-decoration: underline;
          transform: scale(1.05);
        }

        .ticker-wrapper:hover {
          animation-play-state: paused;
        }

        @keyframes scroll-ticker {
          from {
            transform: translateX(0);
          }
          to {
            transform: translateX(-50%);
          }
        }

        /* Mobile specific styles */
        @media (max-width: 768px) {
          .ticker-wrapper {
            animation: scroll-ticker 50s linear infinite;
          }

          .ticker-item {
            padding: 0 2.5rem;
            font-size: 0.95rem;
          }
        }

        /* Extra small mobile */
        @media (max-width: 480px) {
          .ticker-wrapper {
            animation: scroll-ticker 60s linear infinite;
          }

          .ticker-item {
            padding: 0 2rem;
            font-size: 0.9rem;
          }
        }
      `}</style>
    </div>
  );
};

export default NewsTicker;