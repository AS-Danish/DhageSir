import React, { useState, useEffect } from 'react';
import { collection, query, orderBy, limit, getDocs } from 'firebase/firestore';
import { db } from '../firebase/firebaseConfig';

const NewsTicker = () => {
  const [newsItems, setNewsItems] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchLatestContent();
  }, []);

  const fetchLatestContent = async () => {
    try {
      // Fetch from all collections in parallel
      const [articles, videos, books, podcasts] = await Promise.all([
        fetchFromFirebase('articles', 2),
        fetchFromFirebase('videos', 3),
        fetchFromFirebase('books', 2),
        fetchFromFirebase('podcasts', 2)
      ]);

      // Combine all items with their respective types and icons
      const allItems = [
        ...articles.map(item => ({ 
          ...item, 
          type: 'article', 
          icon: '📰',
          link: `/articles/${item.id}`, // Adjust the link pattern as needed
          timestamp: item.created_at ? new Date(item.created_at).getTime() : 0
        })),
        ...videos.map(item => ({ 
          ...item, 
          type: 'video', 
          icon: '🎥',
          link: item.video_url || `/videos/${item.id}`,
          timestamp: item.created_at ? new Date(item.created_at).getTime() : 0
        })),
        ...books.map(item => ({ 
          ...item, 
          type: 'book', 
          icon: '📚',
          link: item.book_url || `/books/${item.id}`,
          timestamp: item.created_at ? new Date(item.created_at).getTime() : 0
        })),
        ...podcasts.map(item => ({ 
          ...item, 
          type: 'podcast', 
          icon: '🎙️',
          link: item.youtube_url || `/podcasts/${item.id}`,
          timestamp: item.created_at ? new Date(item.created_at).getTime() : 0
        }))
      ];

      // Sort by timestamp (most recent first) and take top 7
      const sortedItems = allItems
        .sort((a, b) => b.timestamp - a.timestamp)
        .slice(0, 7);

      // Format for ticker - only show title and link
      const formattedNews = sortedItems.map(item => ({
        text: `${item.icon} ${item.title}`,
        link: item.link
      }));

      setNewsItems(formattedNews);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching ticker content:', error);
      // Fallback to static content
      setNewsItems([
        { text: "🎉 Welcome to our platform!", link: "#" },
        { text: "📚 Check out our latest content", link: "#" }
      ]);
      setLoading(false);
    }
  };

  const fetchFromFirebase = async (collectionName, limitCount) => {
    try {
      // Create query to fetch latest items
      const q = query(
        collection(db, collectionName),
        orderBy('created_at', 'desc'),
        limit(limitCount)
      );

      const querySnapshot = await getDocs(q);
      const items = [];

      querySnapshot.forEach((doc) => {
        items.push({
          id: doc.id,
          ...doc.data()
        });
      });

      return items;
    } catch (error) {
      console.error(`Error fetching ${collectionName}:`, error);
      return [];
    }
  };

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
        <div className="px-6 font-bold text-sm uppercase tracking-wider flex-shrink-0 bg-red-600 py-2 rounded-r-full flex items-center gap-2 relative z-10">
          <div className="w-2 h-2 bg-white rounded-full animate-pulse"></div>
          Latest Updates
        </div>
        
        {/* Scrolling News Container */}
        <div className="flex-1 overflow-hidden ml-4 relative">
          <div className="flex animate-scroll-infinite whitespace-nowrap">
            {/* First set of news items */}
            {newsItems.map((news, index) => (
              <a 
                key={`first-${index}`}
                href={news.link}
                target={news.link.startsWith('http') ? "_blank" : "_self"}
                rel={news.link.startsWith('http') ? "noopener noreferrer" : ""}
                className="mx-12 text-base font-medium inline-block hover:underline hover:scale-105 transition-transform cursor-pointer"
              >
                {news.text}
              </a>
            ))}
            {/* Duplicate set for seamless loop */}
            {newsItems.map((news, index) => (
              <a 
                key={`second-${index}`}
                href={news.link}
                target={news.link.startsWith('http') ? "_blank" : "_self"}
                rel={news.link.startsWith('http') ? "noopener noreferrer" : ""}
                className="mx-12 text-base font-medium inline-block hover:underline hover:scale-105 transition-transform cursor-pointer"
              >
                {news.text}
              </a>
            ))}
            {/* Third set to ensure no gaps */}
            {newsItems.map((news, index) => (
              <a 
                key={`third-${index}`}
                href={news.link}
                target={news.link.startsWith('http') ? "_blank" : "_self"}
                rel={news.link.startsWith('http') ? "noopener noreferrer" : ""}
                className="mx-12 text-base font-medium inline-block hover:underline hover:scale-105 transition-transform cursor-pointer"
              >
                {news.text}
              </a>
            ))}
          </div>
        </div>
      </div>

      <style jsx>{`
        @keyframes scroll-infinite {
          0% {
            transform: translateX(0);
          }
          100% {
            transform: translateX(-33.333%);
          }
        }

        .animate-scroll-infinite {
          animation: scroll-infinite 25s linear infinite;
        }

        .animate-scroll-infinite:hover {
          animation-play-state: paused;
        }
      `}</style>
    </div>
  );
};

export default NewsTicker;  