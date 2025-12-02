"use client"
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

export default function Home() {
  return (
    <div className="min-h-screen">
      <main id="home">
        <HeroSection/>
        <NewsTicker/>
        <AboutSection/>
        <StatsSection/>
        <BooksSection/>
        <VideosSection/>
        <PodcastsSection />
        <ArticlesSection/>
        <ServicesSection/>
        <ContactSection/>
      </main>
    </div>
  );
}