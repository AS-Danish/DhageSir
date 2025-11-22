"use client"
import ImprovedNavbar from "@/components/Navbar";
import HeroSection from "@/components/HeroSection";
import NewsTicker from "@/components/NewsTicker";
import StatsSection from "@/components/StatsSection";
import BooksSection from "@/components/BooksPublished";
import VideosSection from "@/components/VideosSection";
import ArticlesSection from "@/components/ArticlesSection";
import ServicesSection from "@/components/ServicesOffered";
import ContactSection from "@/components/ContactUs";
import Footer from "@/components/Footer";
import AboutSection from "@/components/AboutSection";

export default function Home() {
  return (
    <div className="min-h-screen">
      <main id="home">
        <HeroSection/>
        <NewsTicker/>
        <StatsSection/>
        <AboutSection/>
        <BooksSection/>
        <VideosSection/>
        <ArticlesSection/>
        <ServicesSection/>
        <ContactSection/>
      </main>
    </div>
  );
}