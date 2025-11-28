
import React, { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight, Play, ArrowRight } from 'lucide-react';

const heroSlides = [
  {
    id: 1,
    title: "Transform Your Future",
    subtitle: "Join 50,000+ Success Stories",
    description: "Expert guidance for defense services preparation with proven results and personalized mentorship",
    image: "2 Raisoni.jpeg",
    cta: "Start Your Journey",
    stats: { students: "50K+", success: "95%" }
  },
  {
    id: 2,
    title: "Military Excellence Program",
    subtitle: "Build Discipline & Leadership",
    description: "Comprehensive training designed by veterans for NDA, CDS, and AFCAT aspirants",
    image: "https://images.unsplash.com/photo-1553531384-cc64ac80f931?w=1200&h=800&fit=crop",
    cta: "Explore Programs",
    stats: { courses: "25+", mentors: "100+" }
  },
  {
    id: 3,
    title: "One-on-One Mentorship",
    subtitle: "Personalized Success Path",
    description: "Get direct guidance from experienced mentors who have walked the path to success",
    image: "https://images.unsplash.com/photo-1552664730-d307ca884978?w=1200&h=800&fit=crop",
    cta: "Meet Mentors",
    stats: { sessions: "10K+", rating: "4.9★" }
  }
];

const HeroSection = () => {
  const [currentSlide, setCurrentSlide] = useState(0);

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
      <div className="h-20"></div>

      {/* Background Image with Dark Overlay - Changes with slides */}
      {heroSlides.map((slide, index) => (
        <div
          key={`bg-${slide.id}`}
          className={`absolute inset-0 transition-opacity duration-700 ${
            index === currentSlide ? 'opacity-100' : 'opacity-0'
          }`}
        >
          <img 
            src={slide.image}
            alt=""
            className="w-full h-full object-cover"
          />
          {/* Dark Overlay */}
          <div className="absolute inset-0 bg-black/70"></div>
        </div>
      ))}

      {/* Main Content */}
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="min-h-[calc(100vh-5rem)] flex items-center py-12 pb-24">
          <div className="w-full grid lg:grid-cols-2 gap-12 items-center">
            
            {/* Left Side - Text Content */}
            <div className="text-white relative min-h-[400px]">
              {heroSlides.map((slide, index) => (
                <div
                  key={slide.id}
                  className={`absolute inset-0 space-y-8 transition-opacity duration-700 ${
                    index === currentSlide
                      ? 'opacity-100 z-10'
                      : 'opacity-0 z-0 pointer-events-none'
                  }`}
                >
                  {/* Subtitle Badge */}
                  <div className="inline-block px-5 py-2 bg-white/10 backdrop-blur-sm rounded-full text-sm font-medium border border-white/20">
                    {slide.subtitle}
                  </div>

                  {/* Main Title */}
                  <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold leading-tight">
                    {slide.title}
                  </h1>

                  {/* Description */}
                  <p className="text-xl text-gray-200 leading-relaxed max-w-xl">
                    {slide.description}
                  </p>

                  {/* Stats */}
                  <div className="flex gap-8 pt-2">
                    {Object.entries(slide.stats).map(([key, value]) => (
                      <div key={key}>
                        <div className="text-4xl font-bold">{value}</div>
                        <div className="text-sm text-gray-300 uppercase mt-1">{key}</div>
                      </div>
                    ))}
                  </div>

                  {/* CTA Buttons */}
                  <div className="flex flex-wrap gap-4 pt-4">
                    <button className="group px-8 py-4 bg-white text-blue-900 rounded-lg font-semibold hover:shadow-xl transition transform hover:scale-105 flex items-center gap-2">
                      {slide.cta}
                      <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                    </button>
                    <button className="px-8 py-4 border-2 border-white/30 text-white rounded-lg font-semibold hover:bg-white/10 transition flex items-center gap-2">
                      <Play className="w-5 h-5" />
                      Watch Demo
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {/* Right Side - Clear Image without overlay */}
            <div className="relative h-[400px] md:h-[500px] lg:h-[600px]">
              {heroSlides.map((slide, index) => (
                <div
                  key={`img-${slide.id}`}
                  className={`absolute inset-0 rounded-2xl overflow-hidden shadow-2xl transition-opacity duration-700 ${
                    index === currentSlide
                      ? 'opacity-100 z-10'
                      : 'opacity-0 z-0'
                  }`}
                >
                  <img 
                    src={slide.image} 
                    alt={slide.title}
                    className="w-full h-full object-cover"
                  />
                </div>
              ))}
            </div>

          </div>
        </div>
      </div>

      {/* Navigation Arrows */}
      <button 
        onClick={handlePrevSlide}
        className="absolute left-4 md:left-8 top-1/2 -translate-y-1/2 w-12 h-12 bg-white/10 backdrop-blur-sm rounded-full flex items-center justify-center hover:bg-white/30 transition border border-white/30 z-20"
      >
        <ChevronLeft className="w-6 h-6 text-white" />
      </button>
      
      <button 
        onClick={handleNextSlide}
        className="absolute right-4 md:right-8 top-1/2 -translate-y-1/2 w-12 h-12 bg-white/10 backdrop-blur-sm rounded-full flex items-center justify-center hover:bg-white/30 transition border border-white/30 z-20"
      >
        <ChevronRight className="w-6 h-6 text-white" />
      </button>

      {/* Slide Dots */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex gap-2 z-20">
        {heroSlides.map((_, index) => (
          <button
            key={index}
            onClick={() => handleDotClick(index)}
            className={`h-2 rounded-full transition-all ${
              index === currentSlide ? 'bg-white w-8' : 'bg-white/50 w-2 hover:bg-white/70'
            }`}
          />
        ))}
      </div>
    </section>
  );
};

export default HeroSection;