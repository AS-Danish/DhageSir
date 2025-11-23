import React from 'react';
import { FileText, Calendar, ArrowRight, Clock, Library, TrendingUp } from 'lucide-react';
import { theme, getButton } from '../app/theme/theme';

const ArticlesSection = () => {
  const articles = [
    {
      id: 1,
      image: "https://images.unsplash.com/photo-1434030216411-0b793f4b4173?w=600&h=400&fit=crop",
      title: "10 Essential Tips for NDA Exam Preparation 2025",
      description: "Discover the most effective strategies and study techniques that helped thousands of aspirants clear the NDA exam with flying colors.",
      date: "Nov 18, 2025",
      readTime: "5 min read",
      category: "Exam Preparation"
    },
    {
      id: 2,
      image: "https://images.unsplash.com/photo-1552664730-d307ca884978?w=600&h=400&fit=crop",
      title: "Leadership in Crisis: Lessons from the Battlefield",
      description: "Learn how military leaders make critical decisions under pressure and apply these principles to your personal and professional life.",
      date: "Nov 15, 2025",
      readTime: "8 min read",
      category: "Leadership"
    },
    {
      id: 3,
      image: "https://images.unsplash.com/photo-1517836357463-d25dfeac3438?w=600&h=400&fit=crop",
      title: "Complete Physical Fitness Guide for Defense Aspirants",
      description: "A comprehensive breakdown of fitness standards, training routines, and nutrition plans to excel in defense physical tests.",
      date: "Nov 12, 2025",
      readTime: "10 min read",
      category: "Fitness"
    },
    {
      id: 4,
      image: "https://images.unsplash.com/photo-1504805572947-34fad45aed93?w=600&h=400&fit=crop",
      title: "The Psychology of Discipline and Success",
      description: "Understanding the mental frameworks that separate high achievers from the rest, and how to cultivate unwavering discipline.",
      date: "Nov 10, 2025",
      readTime: "6 min read",
      category: "Motivation"
    },
    {
      id: 5,
      image: "https://images.unsplash.com/photo-1589998059171-988d887df646?w=600&h=400&fit=crop",
      title: "Modern Warfare Tactics: Strategic Analysis",
      description: "An in-depth look at contemporary military strategies and how tactical thinking has evolved in the 21st century.",
      date: "Nov 8, 2025",
      readTime: "12 min read",
      category: "Military Strategy"
    },
    {
      id: 6,
      image: "https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=600&h=400&fit=crop",
      title: "Building Mental Resilience in High-Pressure Situations",
      description: "Proven techniques from military training to develop mental toughness and perform at your best when stakes are highest.",
      date: "Nov 5, 2025",
      readTime: "7 min read",
      category: "Mental Training"
    },
    {
      id: 7,
      image: "https://images.unsplash.com/photo-1513258496099-48168024aec0?w=600&h=400&fit=crop",
      title: "Career Opportunities in Indian Armed Forces 2025",
      description: "Explore various career paths, eligibility criteria, and growth opportunities available in the Army, Navy, and Air Force.",
      date: "Nov 3, 2025",
      readTime: "9 min read",
      category: "Career Guidance"
    },
    {
      id: 8,
      image: "https://images.unsplash.com/photo-1519389950473-47ba0277781c?w=600&h=400&fit=crop",
      title: "Time Management Strategies for Competitive Exams",
      description: "Master the art of effective time management with battle-tested techniques to maximize your study productivity and exam performance.",
      date: "Nov 1, 2025",
      readTime: "5 min read",
      category: "Study Tips"
    }
  ];

  return (
    <section className={`py-16 md:py-20 bg-gradient-to-br ${theme.gradients.light} relative overflow-hidden`}>
      {/* Background Decorative Elements */}
      <div className={`absolute top-10 right-0 w-96 h-96 ${theme.backgrounds.primary} rounded-full filter blur-3xl opacity-40`}></div>
      <div className={`absolute bottom-20 left-0 w-96 h-96 ${theme.backgrounds.primary} rounded-full filter blur-3xl opacity-40`}></div>
      
      <div className="container mx-auto px-4 max-w-7xl relative z-10">
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-12 gap-6">
          <div>
            <div className={`inline-flex items-center gap-2 px-5 py-2 ${theme.badges.primary} rounded-full text-sm font-semibold mb-4 ${theme.shadows.lg}`}>
              <FileText className="w-4 h-4" />
              Latest Articles
            </div>
            <h2 className={`text-4xl md:text-5xl font-black ${theme.text.primary} mb-3`}>
              Knowledge <span className={`bg-gradient-to-r ${theme.gradients.primary} bg-clip-text text-transparent`}>Hub</span>
            </h2>
            <p className={`${theme.text.secondary} text-lg max-w-2xl`}>
              Expert insights, strategies, and guidance on defense careers, exam preparation, and personal development
            </p>
          </div>
          
          {/* View All Button - Desktop */}
          <button className={`hidden md:inline-flex items-center gap-2 ${getButton('primary')} group`}>
            <Library className="w-5 h-5" />
            View All Articles
            <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
          </button>
        </div>

        {/* Articles Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
          {articles.map((article) => (
            <div key={article.id} className="group">
              {/* Card Container */}
              <div className={`${theme.cards.elevated} rounded-2xl overflow-hidden transition-all duration-300 h-full flex flex-col`}>
                {/* Article Image */}
                <div className="relative overflow-hidden h-48">
                  <img 
                    src={article.image}
                    alt={article.title}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                  />
                  {/* Gradient Overlay */}
                  <div className={`absolute inset-0 bg-gradient-to-t ${theme.gradients.overlay}`}></div>
                  
                  {/* Category Badge */}
                  <div className="absolute top-3 left-3">
                    <span className={`px-3 py-1 ${theme.badges.primary} text-xs font-bold rounded-full ${theme.shadows.lg}`}>
                      {article.category}
                    </span>
                  </div>

                  {/* Trending Icon */}
                  <div className={`absolute top-3 right-3 w-8 h-8 ${theme.backgrounds.white} backdrop-blur-sm rounded-full flex items-center justify-center ${theme.shadows.lg}`}>
                    <TrendingUp className={`w-4 h-4 ${theme.text.brand}`} />
                  </div>
                </div>

                {/* Article Content */}
                <div className="p-5 flex-1 flex flex-col">
                  {/* Date & Read Time */}
                  <div className={`flex items-center gap-4 text-xs ${theme.text.light} mb-3`}>
                    <div className="flex items-center gap-1">
                      <Calendar className="w-3 h-3" />
                      <span>{article.date}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      <span>{article.readTime}</span>
                    </div>
                  </div>

                  {/* Title */}
                  <h3 className={`text-lg font-bold ${theme.text.primary} mb-3 line-clamp-2 group-hover:${theme.text.brand} transition-colors`}>
                    {article.title}
                  </h3>

                  {/* Description */}
                  <p className={`${theme.text.secondary} text-sm leading-relaxed mb-4 line-clamp-3 flex-1`}>
                    {article.description}
                  </p>
                  
                  {/* Read Full Article Button */}
                  <button className={`inline-flex items-center gap-2 ${theme.text.brand} font-bold text-sm group-hover:gap-3 transition-all mt-auto`}>
                    Read Full Article
                    <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  </button>
                </div>

                {/* Decorative Bottom Accent */}
                <div className={`h-1 bg-gradient-to-r ${theme.gradients.primary} transform scale-x-0 group-hover:scale-x-100 transition-transform origin-left`}></div>
              </div>
            </div>
          ))}
        </div>

        {/* View All Button - Mobile */}
        <div className="flex justify-center md:hidden">
          <button className={`inline-flex items-center gap-2 ${getButton('primary')} group w-full md:w-auto justify-center`}>
            <Library className="w-5 h-5" />
            View All Articles
            <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
          </button>
        </div>
      </div>
    </section>
  );
};

export default ArticlesSection;