import React from 'react';

const newsItems = [
  { text: "🎉 New Batch Starting December 2025 - Limited Seats Available!", link: "#batch" },
  { text: "🏆 95% Success Rate - Our Students Excel in Competitive Exams", link: "#success" },
  { text: "📚 Free Masterclass on Interview Techniques - Register Today", link: "#masterclass" },
  { text: "⭐ 1000+ Five Star Reviews from Successful Candidates", link: "#reviews" },
  { text: "💼 Career Guidance Workshop - Book Your Free Session Now", link: "#workshop" }
];

const NewsTicker = () => {
  return (
    <div className="bg-gradient-to-r from-orange-500 via-red-500 to-pink-500 text-white py-4 overflow-hidden shadow-lg relative">
      <div className="flex items-center">
        {/* Breaking News Badge */}
        <div className="px-6 font-bold text-sm uppercase tracking-wider flex-shrink-0 bg-red-600 py-2 rounded-r-full flex items-center gap-2 relative z-10">
          <div className="w-2 h-2 bg-white rounded-full animate-pulse"></div>
          Breaking News
        </div>
        
        {/* Scrolling News Container */}
        <div className="flex-1 overflow-hidden ml-4 relative">
          <div className="flex animate-scroll-infinite whitespace-nowrap">
            {/* First set of news items */}
            {newsItems.map((news, index) => (
              <a 
                key={`first-${index}`}
                href={news.link}
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
          animation: scroll-infinite 20s linear infinite;
        }

        .animate-scroll-infinite:hover {
          animation-play-state: paused;
        }
      `}</style>
    </div>
  );
};

export default NewsTicker;