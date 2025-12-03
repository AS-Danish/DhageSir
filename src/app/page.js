"use client"
import { useHomepageData } from "@/hooks/useHomepageData";
import HeroSection from "@/components/HeroSection";
import NewsTicker from "@/components/NewsTicker";
import StatsSection from "@/components/StatsSection";
import BooksSection from "@/components/BooksPublished";
import VideosSection from "@/components/VideosSection";
import ArticlesSection from "@/components/ArticlesSection";
import ServicesSection from "@/components/ServicesOffered";
import ContactSection from "@/components/ContactUs";
import AboutSection from "@/components/AboutSection";
import PodcastsSection from "@/components/PodcastsSection";
import { Loader } from 'lucide-react';

export default function Home() {
  const { homepageData, loading, error } = useHomepageData();

  // Show loading state
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Loader className="w-12 h-12 text-orange-500 animate-spin mx-auto mb-4" />
          <p className="text-gray-600 font-semibold">Loading content...</p>
        </div>
      </div>
    );
  }

  // Show error state
  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center bg-red-50 border-2 border-red-200 rounded-2xl p-8 max-w-md">
          <p className="text-red-600 font-semibold mb-4">{error}</p>
          <button 
            onClick={() => window.location.reload()}
            className="px-6 py-3 bg-gradient-to-r from-orange-500 to-orange-600 text-white rounded-xl font-bold transition-all hover:scale-105"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <main id="home">
        <HeroSection/>
        <NewsTicker homepageData={homepageData} />
        <AboutSection/>
        <StatsSection/>
        <BooksSection homepageData={homepageData} />
        <VideosSection homepageData={homepageData} />
        <PodcastsSection homepageData={homepageData} />
        <ArticlesSection homepageData={homepageData} />
        <ServicesSection/>
        <ContactSection/>
      </main>
    </div>
  );
}