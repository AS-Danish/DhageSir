import React, { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight, Play, ArrowRight } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';

const HeroSection = () => {
  const { t } = useLanguage();
  const [currentSlide, setCurrentSlide] = useState(0);

  const heroSlides = [
    {
      id: 1,
      image: "FirstImage.JPG",
    },
    {
      id: 2,
      image: "Portrait.png",
    },
    {
      id: 3,
      image: "ThirdImage.jpeg",
    }
  ];

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % heroSlides.length);
    }, 6000);
    return () => clearInterval(timer);
  }, []);

  const handleNextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % heroSlides.length);
  };

  const handlePrevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + heroSlides.length) % heroSlides.length);
  };

  const handleDotClick = (index) => {
    setCurrentSlide(index);
  };

  return (
    <section className="relative w-full min-h-screen overflow-hidden">
      {/* Spacing for fixed navbar */}
      <div className="h-20 md:h-20"></div>

      {/* Background Image with Dark Overlay - Changes with slides */}
      {heroSlides.map((slide, index) => (
        <div
          key={`bg-${slide.id}`}
          className={`absolute inset-0 transition-opacity duration-700 ${index === currentSlide ? 'opacity-100' : 'opacity-0'
            }`}
        >
          <img
            src="Flag.jpg"
            alt=""
            className="w-full h-full object-cover"
          />
          {/* Dark Overlay */}
          <div className="absolute inset-0 bg-black/75"></div>
        </div>
      ))}

      {/* Main Content */}
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="min-h-[calc(100vh-4rem)] md:min-h-[calc(100vh-5rem)] flex items-center py-8 md:py-12 pb-20 md:pb-24">
          <div className="w-full grid lg:grid-cols-2 gap-8 md:gap-12 items-center">

            {/* Left Side - Text Content */}
            <div className="text-white order-2 lg:order-1">
              <div className="space-y-4 md:space-y-6 lg:space-y-8">
                {/* Subtitle Badge */}
                <div className="inline-block px-4 py-2 bg-white/10 backdrop-blur-sm rounded-full text-xs md:text-sm font-medium border border-white/20">
                  {t.heroSubtitle}
                </div>

                {/* Main Title */}
                <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-bold leading-tight">
                  {t.heroTitle}
                </h1>

                {/* Description */}
                <p className="text-sm sm:text-base md:text-lg lg:text-xl text-gray-200 leading-relaxed max-w-2xl">
                  {t.heroDescription}
                </p>

                {/* CTA Buttons */}
                <div className="flex flex-col sm:flex-row flex-wrap gap-3 md:gap-4 pt-2 md:pt-4">
                  <button className="group px-6 md:px-8 py-3 md:py-4 bg-white text-blue-900 rounded-lg font-semibold hover:shadow-xl transition transform hover:scale-105 flex items-center justify-center gap-2 text-sm md:text-base"
                    onClick={() => {
                      document.getElementById("services").scrollIntoView({
                        behavior: "smooth"
                      });
                    }}
                  >
                    {t.heroCTA}
                    <ArrowRight className="w-4 h-4 md:w-5 md:h-5 group-hover:translate-x-1 transition-transform" />
                  </button>
                  <button className="px-6 md:px-8 py-3 md:py-4 border-2 border-white/30 text-white rounded-lg font-semibold hover:bg-white/10 transition flex items-center justify-center gap-2 text-sm md:text-base"
                   onClick={() => window.open("https://www.youtube.com/watch?v=0svFF1TDKdU", "_blank")}
                   >
                    <Play className="w-4 h-4 md:w-5 md:h-5" />
                    {t.heroVideoButton}
                  </button>
                </div>
              </div>
            </div>

            {/* Right Side - Clear Image without overlay */}
            <div className="relative h-[300px] sm:h-[400px] md:h-[500px] lg:h-[600px] order-1 lg:order-2">
              {heroSlides.map((slide, index) => (
                <div
                  key={`img-${slide.id}`}
                  className={`absolute inset-0 rounded-2xl overflow-hidden shadow-2xl transition-opacity duration-700 ${index === currentSlide
                      ? 'opacity-100 z-10'
                      : 'opacity-0 z-0'
                    }`}
                >
                  <img
                    src={slide.image}
                    alt={t.heroTitle}
                    className="w-full h-full object-cover"
                  />
                </div>
              ))}
            </div>

          </div>
        </div>
      </div>

      {/* Navigation Arrows - Hidden on mobile */}
      <button
        onClick={handlePrevSlide}
        className="hidden md:flex absolute left-4 lg:left-8 top-1/2 -translate-y-1/2 w-10 h-10 md:w-12 md:h-12 bg-white/10 rounded-full items-center justify-center hover:bg-white/30 transition border border-white/30 z-20"
      >
        <ChevronLeft className="w-5 h-5 md:w-6 md:h-6 text-white" />
      </button>

      <button
        onClick={handleNextSlide}
        className="hidden md:flex absolute right-4 lg:right-8 top-1/2 -translate-y-1/2 w-10 h-10 md:w-12 md:h-12 bg-white/10  rounded-full items-center justify-center hover:bg-white/30 transition border border-white/30 z-20"
      >
        <ChevronRight className="w-5 h-5 md:w-6 md:h-6 text-white" />
      </button>

      {/* Slide Dots */}
      <div className="absolute bottom-6 md:bottom-8 left-1/2 -translate-x-1/2 flex gap-2 z-20">
        {heroSlides.map((_, index) => (
          <button
            key={index}
            onClick={() => handleDotClick(index)}
            className={`h-1.5 md:h-2 rounded-full transition-all ${index === currentSlide ? 'bg-white w-6 md:w-8' : 'bg-white/50 w-1.5 md:w-2 hover:bg-white/70'
              }`}
          />
        ))}
      </div>
    </section>
  );
};

export default HeroSection;