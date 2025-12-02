import React from 'react';
import { Tv, Newspaper, Users, BookOpen, TrendingUp } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';

const StatsSection = () => {
  const { t } = useLanguage();
  
  const stats = [
    { 
      label: t.mediaInterviews || "Media Interviews", 
      value: "1500+", 
      icon: Tv 
    },
    { 
      label: t.newspaperArticles || "Newspaper Articles", 
      value: "300+", 
      icon: Newspaper 
    },
    { 
      label: t.motivationalSessions || "Motivational Sessions", 
      value: "150+", 
      icon: Users 
    },
    { 
      label: t.publishedBooks || "Published Books", 
      value: "4", 
      icon: BookOpen 
    }
  ];

  return (
    <section className="bg-white relative overflow-hidden">
      {/* Background Decorative Elements */}
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-orange-100 rounded-full filter blur-3xl opacity-20"></div>
      <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-blue-100 rounded-full filter blur-3xl opacity-20"></div>
      
      <div className="container mx-auto px-4 max-w-7xl relative z-10">
        {/* Stats Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 md:gap-8">
          {stats.map((stat, index) => {
            const Icon = stat.icon;
            return (
              <div key={index} className="group">
                <div className="bg-white rounded-2xl p-6 md:p-8 shadow-lg hover:shadow-2xl transition-all duration-300 border-2 border-gray-100 hover:border-orange-200 text-center h-full flex flex-col items-center justify-center">
                  {/* Icon Container */}
                  <div className="relative inline-block mb-6">
                    {/* Glow Effect */}
                    <div className="absolute inset-0 bg-gradient-to-br from-orange-500 to-orange-600 rounded-2xl blur-xl opacity-40 group-hover:opacity-60 transition-opacity"></div>
                    
                    {/* Icon */}
                    <div className="relative w-16 h-16 md:w-20 md:h-20 bg-gradient-to-br from-orange-500 to-orange-600 rounded-2xl flex items-center justify-center shadow-xl group-hover:scale-110 transition-transform">
                      <Icon className="w-8 h-8 md:w-10 md:h-10 text-white" />
                    </div>
                  </div>

                  {/* Value */}
                  <div className="text-4xl md:text-5xl font-black bg-gradient-to-r from-orange-500 to-orange-600 bg-clip-text text-transparent mb-3 group-hover:scale-105 transition-transform">
                    {stat.value}
                  </div>

                  {/* Label */}
                  <div className="text-gray-600 font-semibold text-sm md:text-base">
                    {stat.label}
                  </div>

                  {/* Decorative Bottom Accent */}
                  <div className="mt-6 h-1 w-12 bg-gradient-to-r from-orange-500 to-orange-600 rounded-full transform scale-x-0 group-hover:scale-x-100 transition-transform"></div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default StatsSection;