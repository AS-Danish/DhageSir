"use client";
import React, { useState, useEffect } from 'react';
import { ChevronDown, Menu, X, Globe } from 'lucide-react';

const translations = {
  en: {
    home: "Home",
    about: "About",
    military: "Military",
    mentor: "Mentor",
    download: "Download",
    images: "Images",
    videos: "Videos",
    studyMaterials: "Study Materials",
    language: "Language"
  },
  mr: {
    home: "मुख्यपृष्ठ",
    about: "आमच्याबद्दल",
    military: "लष्करी",
    mentor: "मार्गदर्शक",
    download: "डाउनलोड",
    images: "प्रतिमा",
    videos: "व्हिडिओ",
    studyMaterials: "अभ्यास साहित्य",
    language: "भाषा"
  }
};

const ImprovedNavbar = () => {
  const [language, setLanguage] = useState('en');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [downloadOpen, setDownloadOpen] = useState(false);
  const [languageOpen, setLanguageOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  const t = translations[language];

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Close mobile menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (mobileMenuOpen && !e.target.closest('.mobile-menu') && !e.target.closest('.mobile-menu-button')) {
        setMobileMenuOpen(false);
      }
    };
    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, [mobileMenuOpen]);

  const handleLanguageChange = (lang) => {
    setLanguage(lang);
    setLanguageOpen(false);
  };

  return (
    <header 
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
        scrolled 
          ? 'bg-white/95 backdrop-blur-xl shadow-lg py-3' 
          : 'bg-white py-4'
      }`}
    >
      <nav className="container mx-auto px-4">
        <div className="flex items-center justify-between">
          {/* Logo - Left Aligned */}
          <div className="flex-shrink-0">
            <div className="relative group cursor-pointer">
              <div className="absolute inset-0 bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 rounded-xl blur-md opacity-70 group-hover:opacity-100 transition-opacity duration-300"></div>
              <div className="relative w-12 h-12 bg-gradient-to-br from-blue-600 via-purple-600 to-pink-600 rounded-xl flex items-center justify-center shadow-lg transform group-hover:scale-110 group-hover:rotate-6 transition-all duration-300">
                <span className="text-white font-black text-xl">DA</span>
              </div>
            </div>
          </div>

          {/* Desktop Navigation - Center Aligned */}
          <div className="hidden lg:flex items-center space-x-2 absolute left-1/2 transform -translate-x-1/2">
            <a 
              href="#home" 
              className="relative px-4 py-2 text-gray-700 hover:text-blue-600 font-semibold transition-colors duration-300 group"
            >
              {t.home}
              <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-gradient-to-r from-blue-600 to-purple-600 group-hover:w-full transition-all duration-300"></span>
            </a>
            
            <a 
              href="#about" 
              className="relative px-4 py-2 text-gray-700 hover:text-blue-600 font-semibold transition-colors duration-300 group"
            >
              {t.about}
              <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-gradient-to-r from-blue-600 to-purple-600 group-hover:w-full transition-all duration-300"></span>
            </a>
            
            <a 
              href="#military" 
              className="relative px-4 py-2 text-gray-700 hover:text-blue-600 font-semibold transition-colors duration-300 group"
            >
              {t.military}
              <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-gradient-to-r from-blue-600 to-purple-600 group-hover:w-full transition-all duration-300"></span>
            </a>
            
            <a 
              href="#mentor" 
              className="relative px-4 py-2 text-gray-700 hover:text-blue-600 font-semibold transition-colors duration-300 group"
            >
              {t.mentor}
              <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-gradient-to-r from-blue-600 to-purple-600 group-hover:w-full transition-all duration-300"></span>
            </a>
            
            {/* Download Dropdown */}
            <div className="relative">
              <button 
                onClick={() => setDownloadOpen(!downloadOpen)}
                onMouseEnter={() => setDownloadOpen(true)}
                onMouseLeave={() => setDownloadOpen(false)}
                className="relative px-4 py-2 text-gray-700 hover:text-blue-600 font-semibold transition-colors duration-300 flex items-center gap-1 group"
              >
                {t.download}
                <ChevronDown className={`w-4 h-4 transition-all duration-300 ${downloadOpen ? 'rotate-180' : ''}`} />
                <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-gradient-to-r from-blue-600 to-purple-600 group-hover:w-full transition-all duration-300"></span>
              </button>
              
              <div 
                onMouseEnter={() => setDownloadOpen(true)}
                onMouseLeave={() => setDownloadOpen(false)}
                className={`absolute top-full left-1/2 -translate-x-1/2 mt-2 bg-white shadow-2xl rounded-2xl py-3 w-64 border border-gray-100 transition-all duration-300 origin-top ${
                  downloadOpen 
                    ? 'opacity-100 scale-100 translate-y-0' 
                    : 'opacity-0 scale-95 -translate-y-2 pointer-events-none'
                }`}
              >
                <a 
                  href="#images" 
                  className="flex items-center gap-3 px-4 py-3 text-gray-700 hover:bg-gradient-to-r hover:from-blue-50 hover:to-purple-50 transition-all duration-300 group"
                >
                  <div className="w-10 h-10 bg-gradient-to-br from-blue-100 to-blue-200 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300 shadow-sm">
                    <span className="text-xl">📸</span>
                  </div>
                  <span className="font-medium">{t.images}</span>
                </a>
                
                <a 
                  href="#videos" 
                  className="flex items-center gap-3 px-4 py-3 text-gray-700 hover:bg-gradient-to-r hover:from-blue-50 hover:to-purple-50 transition-all duration-300 group"
                >
                  <div className="w-10 h-10 bg-gradient-to-br from-purple-100 to-purple-200 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300 shadow-sm">
                    <span className="text-xl">🎥</span>
                  </div>
                  <span className="font-medium">{t.videos}</span>
                </a>
                
                <a 
                  href="#study" 
                  className="flex items-center gap-3 px-4 py-3 text-gray-700 hover:bg-gradient-to-r hover:from-blue-50 hover:to-purple-50 transition-all duration-300 group"
                >
                  <div className="w-10 h-10 bg-gradient-to-br from-pink-100 to-pink-200 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300 shadow-sm">
                    <span className="text-xl">📚</span>
                  </div>
                  <span className="font-medium">{t.studyMaterials}</span>
                </a>
              </div>
            </div>
          </div>

          {/* Right Side - Language Selector */}
          <div className="hidden lg:flex items-center">
            <div className="relative">
              <button 
                onClick={() => setLanguageOpen(!languageOpen)}
                className="flex items-center gap-2 px-4 py-2 border-2 border-gray-200 rounded-xl hover:border-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white font-medium cursor-pointer transition-all duration-300 hover:shadow-lg group"
              >
                <Globe className="w-5 h-5 text-blue-600 group-hover:rotate-12 transition-transform duration-300" />
                <span className="text-gray-700">{language === 'en' ? '🇬🇧 English' : '🇮🇳 मराठी'}</span>
                <ChevronDown className={`w-4 h-4 text-gray-500 transition-transform duration-300 ${languageOpen ? 'rotate-180' : ''}`} />
              </button>
              
              <div 
                className={`absolute top-full right-0 mt-2 bg-white shadow-2xl rounded-xl py-2 w-48 border border-gray-100 transition-all duration-300 origin-top-right ${
                  languageOpen 
                    ? 'opacity-100 scale-100 translate-y-0' 
                    : 'opacity-0 scale-95 -translate-y-2 pointer-events-none'
                }`}
              >
                <button
                  onClick={() => handleLanguageChange('en')}
                  className={`w-full flex items-center gap-3 px-4 py-3 text-left transition-all duration-300 ${
                    language === 'en' 
                      ? 'bg-gradient-to-r from-blue-50 to-purple-50 text-blue-700 font-semibold' 
                      : 'text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  <span className="text-2xl">🇬🇧</span>
                  <span>English</span>
                  {language === 'en' && <span className="ml-auto text-blue-600">✓</span>}
                </button>
                
                <button
                  onClick={() => handleLanguageChange('mr')}
                  className={`w-full flex items-center gap-3 px-4 py-3 text-left transition-all duration-300 ${
                    language === 'mr' 
                      ? 'bg-gradient-to-r from-blue-50 to-purple-50 text-blue-700 font-semibold' 
                      : 'text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  <span className="text-2xl">🇮🇳</span>
                  <span>मराठी</span>
                  {language === 'mr' && <span className="ml-auto text-blue-600">✓</span>}
                </button>
              </div>
            </div>
          </div>

          {/* Mobile Menu Button */}
          <button 
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="lg:hidden mobile-menu-button text-gray-700 p-2 hover:bg-gray-100 rounded-xl transition-all duration-300 transform hover:scale-110"
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>

        {/* Mobile Menu */}
        <div 
          className={`lg:hidden mobile-menu overflow-hidden transition-all duration-500 ease-in-out ${
            mobileMenuOpen 
              ? 'max-h-screen opacity-100 mt-4' 
              : 'max-h-0 opacity-0'
          }`}
        >
          <div className="pb-4 border-t border-gray-100 pt-4 space-y-1">
            <a 
              href="#home" 
              className="block px-4 py-3 text-gray-700 hover:bg-gradient-to-r hover:from-blue-50 hover:to-purple-50 rounded-xl font-medium transition-all duration-300 hover:translate-x-2"
            >
              {t.home}
            </a>
            
            <a 
              href="#about" 
              className="block px-4 py-3 text-gray-700 hover:bg-gradient-to-r hover:from-blue-50 hover:to-purple-50 rounded-xl font-medium transition-all duration-300 hover:translate-x-2"
            >
              {t.about}
            </a>
            
            <a 
              href="#military" 
              className="block px-4 py-3 text-gray-700 hover:bg-gradient-to-r hover:from-blue-50 hover:to-purple-50 rounded-xl font-medium transition-all duration-300 hover:translate-x-2"
            >
              {t.military}
            </a>
            
            <a 
              href="#mentor" 
              className="block px-4 py-3 text-gray-700 hover:bg-gradient-to-r hover:from-blue-50 hover:to-purple-50 rounded-xl font-medium transition-all duration-300 hover:translate-x-2"
            >
              {t.mentor}
            </a>

            {/* Mobile Download Section */}
            <div className="pl-4 space-y-1 pt-2 border-t border-gray-100 mt-2">
              <div className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2 px-4">
                {t.download}
              </div>
              <a 
                href="#images" 
                className="flex items-center gap-3 px-4 py-3 text-gray-700 hover:bg-gradient-to-r hover:from-blue-50 hover:to-purple-50 rounded-xl transition-all duration-300 hover:translate-x-2"
              >
                <span className="text-xl">📸</span>
                <span className="font-medium">{t.images}</span>
              </a>
              <a 
                href="#videos" 
                className="flex items-center gap-3 px-4 py-3 text-gray-700 hover:bg-gradient-to-r hover:from-blue-50 hover:to-purple-50 rounded-xl transition-all duration-300 hover:translate-x-2"
              >
                <span className="text-xl">🎥</span>
                <span className="font-medium">{t.videos}</span>
              </a>
              <a 
                href="#study" 
                className="flex items-center gap-3 px-4 py-3 text-gray-700 hover:bg-gradient-to-r hover:from-blue-50 hover:to-purple-50 rounded-xl transition-all duration-300 hover:translate-x-2"
              >
                <span className="text-xl">📚</span>
                <span className="font-medium">{t.studyMaterials}</span>
              </a>
            </div>

            {/* Mobile Language Selector */}
            <div className="pt-4 border-t border-gray-100 mt-2">
              <div className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2 px-4">
                {t.language}
              </div>
              <button
                onClick={() => handleLanguageChange('en')}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-300 ${
                  language === 'en' 
                    ? 'bg-gradient-to-r from-blue-50 to-purple-50 text-blue-700 font-semibold' 
                    : 'text-gray-700 hover:bg-gray-50'
                }`}
              >
                <span className="text-2xl">🇬🇧</span>
                <span>English</span>
                {language === 'en' && <span className="ml-auto text-blue-600">✓</span>}
              </button>
              
              <button
                onClick={() => handleLanguageChange('mr')}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-300 mt-1 ${
                  language === 'mr' 
                    ? 'bg-gradient-to-r from-blue-50 to-purple-50 text-blue-700 font-semibold' 
                    : 'text-gray-700 hover:bg-gray-50'
                }`}
              >
                <span className="text-2xl">🇮🇳</span>
                <span>मराठी</span>
                {language === 'mr' && <span className="ml-auto text-blue-600">✓</span>}
              </button>
            </div>
          </div>
        </div>
      </nav>

      <style jsx>{`
        @keyframes scroll {
          0% {
            transform: translateX(0);
          }
          100% {
            transform: translateX(-50%);
          }
        }
        .animate-scroll {
          animation: scroll 30s linear infinite;
        }
      `}</style>
    </header>
  );
};

export default ImprovedNavbar;