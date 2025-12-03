"use client";
import React, { useState, useEffect } from 'react';
import { ChevronDown, Menu, X, Globe } from 'lucide-react';
import { theme } from '../app/theme/theme';
import { useLanguage } from '../context/LanguageContext';

const ImprovedNavbar = () => {
  const { language, setLanguage, t } = useLanguage();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [downloadOpen, setDownloadOpen] = useState(false);
  const [militaryOpen, setMilitaryOpen] = useState(false);
  const [mentorOpen, setMentorOpen] = useState(false);
  const [languageOpen, setLanguageOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  // Navigation structure - Easy to modify!
  const navLinks = [
    {
      label: t.home,
      href: "/",
      type: "link"
    },
    {
      label: t.about,
      href: "/#about",
      type: "link"
    },
    {
      label: t.military,
      type: "dropdown",
      state: militaryOpen,
      setState: setMilitaryOpen,
      items: [
        {
          label: t.militaryBooks,
          href: "/AllBooks?category=Military",
          icon: "📚"
        },
        {
          label: t.militaryArticles,
          href: "/AllArticles?category=Military",
          icon: "📰"
        }
      ]
    },
    {
      label: t.mentor,
      type: "dropdown",
      state: mentorOpen,
      setState: setMentorOpen,
      items: [
        {
          label: t.mentorBooks || "Mentor Books",
          href: "/AllBooks?category=Mentor",
          icon: "📚"
        },
        {
          label: t.mentorArticles || "Mentor Articles",
          href: "/AllArticles?category=Mentor",
          icon: "📰"
        },
        {
          label: t.studyMaterials,
          href: "/AllStudyMaterials",
          icon: "📖"
        }
      ]
    },
    {
      label: t.podcast || 'Podcast',
      href: "/#podcasts",
      type: "link"
    },
    {
      label: t.download,
      type: "dropdown",
      state: downloadOpen,
      setState: setDownloadOpen,
      items: [
        {
          label: t.images,
          href: "/AllImages",
          icon: "📸"
        },
        {
          label: t.videos,
          href: "/AllVideos",
          icon: "🎥"
        },
        {
          label: t.studyMaterials,
          href: "/AllStudyMaterials",
          icon: "📚"
        }
      ]
    }
  ];

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

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
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${scrolled
        ? `${theme.backgrounds.white} backdrop-blur-xl ${theme.shadows.lg} py-3`
        : `${theme.backgrounds.white} py-4`
        }`}
    >
      <nav className="container mx-auto px-4">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <div className="flex-shrink-0">
            <a href="/" className="relative group cursor-pointer block">
              <div className={`relative w-18 h-18 rounded-xl flex items-center justify-center transform group-hover:scale-110 transition-all duration-300 overflow-hidden`}>
                <img
                  src="/logo.jpeg"
                  alt="Logo"
                  className="w-full h-full object-contain"
                />
              </div>
            </a>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden lg:flex items-center space-x-2 absolute left-1/2 transform -translate-x-1/2">
            {navLinks.map((navItem, index) => (
              navItem.type === "link" ? (
                <a
                  key={index}
                  href={navItem.href}
                  className={`relative px-4 py-2 ${theme.text.secondary} hover:${theme.text.brand} font-semibold transition-colors duration-300 group`}
                >
                  {navItem.label}
                  <span className={`absolute bottom-0 left-0 w-0 h-0.5 bg-gradient-to-r ${theme.gradients.primary} group-hover:w-full transition-all duration-300`}></span>
                </a>
              ) : (
                <div
                  key={index}
                  className="relative"
                  onMouseEnter={() => navItem.setState(true)}
                  onMouseLeave={() => navItem.setState(false)}
                >
                  <button
                    onClick={() => navItem.setState(!navItem.state)}
                    className={`relative px-4 py-2 ${theme.text.secondary} hover:${theme.text.brand} font-semibold transition-colors duration-300 flex items-center gap-1 group`}
                  >
                    {navItem.label}
                    <ChevronDown className={`w-4 h-4 transition-all duration-300 ${navItem.state ? 'rotate-180' : ''}`} />
                    <span className={`absolute bottom-0 left-0 w-0 h-0.5 bg-gradient-to-r ${theme.gradients.primary} group-hover:w-full transition-all duration-300`}></span>
                  </button>

                  <div
                    className={`absolute top-full left-1/2 -translate-x-1/2 pt-2 transition-all duration-300 ${navItem.state
                        ? 'opacity-100 visible'
                        : 'opacity-0 invisible'
                      }`}
                  >
                    <div className={`${theme.backgrounds.white} ${theme.shadows.xl} rounded-2xl py-3 w-64 ${theme.borders.light} border transition-all duration-300 origin-top ${navItem.state
                        ? 'scale-100 translate-y-0'
                        : 'scale-95 -translate-y-2'
                      }`}>
                      {navItem.items.map((item, itemIndex) => (
                        <a
                          key={itemIndex}
                          href={item.href}
                          className={`flex items-center gap-3 px-4 py-3 ${theme.text.secondary} hover:${theme.backgrounds.primary} transition-all duration-300 group`}
                        >
                          <div className={`w-10 h-10 ${theme.backgrounds.primary} rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300 ${theme.shadows.sm}`}>
                            <span className="text-xl">{item.icon}</span>
                          </div>
                          <span className="font-medium">{item.label}</span>
                        </a>
                      ))}
                    </div>
                  </div>
                </div>
              )
            ))}
          </div>

          {/* Language Selector */}
          <div className="hidden lg:flex items-center">
            <div className="relative">
              <button
                onClick={() => setLanguageOpen(!languageOpen)}
                className={`flex items-center gap-2 px-4 py-2 ${theme.borders.default} border-2 rounded-xl hover:${theme.borders.primary} focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent ${theme.backgrounds.white} font-medium cursor-pointer transition-all duration-300 hover:${theme.shadows.lg} group`}
              >
                <Globe className={`w-5 h-5 ${theme.text.brand} group-hover:rotate-12 transition-transform duration-300`} />
                <span className={theme.text.secondary}>{language === 'en' ? '🇬🇧 English' : '🇮🇳 मराठी'}</span>
                <ChevronDown className={`w-4 h-4 ${theme.text.light} transition-transform duration-300 ${languageOpen ? 'rotate-180' : ''}`} />
              </button>

              <div
                className={`absolute top-full right-0 mt-2 ${theme.backgrounds.white} ${theme.shadows.xl} rounded-xl py-2 w-48 ${theme.borders.light} border transition-all duration-300 origin-top-right ${languageOpen
                  ? 'opacity-100 scale-100 translate-y-0'
                  : 'opacity-0 scale-95 -translate-y-2 pointer-events-none'
                  }`}
              >
                <button
                  onClick={() => handleLanguageChange('en')}
                  className={`w-full flex items-center gap-3 px-4 py-3 text-left transition-all duration-300 ${language === 'en'
                    ? `${theme.backgrounds.primary} ${theme.text.brand} font-semibold`
                    : `${theme.text.secondary} hover:${theme.backgrounds.light}`
                    }`}
                >
                  <span className="text-2xl">🇬🇧</span>
                  <span>English</span>
                  {language === 'en' && <span className={`ml-auto ${theme.text.brand}`}>✓</span>}
                </button>

                <button
                  onClick={() => handleLanguageChange('mr')}
                  className={`w-full flex items-center gap-3 px-4 py-3 text-left transition-all duration-300 ${language === 'mr'
                    ? `${theme.backgrounds.primary} ${theme.text.brand} font-semibold`
                    : `${theme.text.secondary} hover:${theme.backgrounds.light}`
                    }`}
                >
                  <span className="text-2xl">🇮🇳</span>
                  <span>मराठी</span>
                  {language === 'mr' && <span className={`ml-auto ${theme.text.brand}`}>✓</span>}
                </button>
              </div>
            </div>
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className={`lg:hidden mobile-menu-button ${theme.text.secondary} p-2 hover:${theme.backgrounds.light} rounded-xl transition-all duration-300 transform hover:scale-110`}
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>

        {/* Mobile Menu */}
        <div
          className={`lg:hidden mobile-menu transition-all duration-500 ease-in-out ${mobileMenuOpen
            ? 'max-h-[80vh] opacity-100 mt-4 overflow-y-auto'
            : 'max-h-0 opacity-0 overflow-hidden'
            }`}
        >
          <div className={`pb-4 ${theme.borders.light} border-t pt-4 space-y-1`}>
            {navLinks.map((navItem, index) => (
              navItem.type === "link" ? (
                <a
                  key={index}
                  href={navItem.href}
                  className={`block px-4 py-3 ${theme.text.secondary} hover:${theme.backgrounds.primary} rounded-xl font-medium transition-all duration-300 hover:translate-x-2`}
                >
                  {navItem.label}
                </a>
              ) : (
                <div key={index} className={`pl-4 space-y-1 pt-2 ${theme.borders.light} border-t mt-2`}>
                  <div className={`text-xs font-bold ${theme.text.light} uppercase tracking-wider mb-2 px-4`}>
                    {navItem.label}
                  </div>
                  {navItem.items.map((item, itemIndex) => (
                    <a
                      key={itemIndex}
                      href={item.href}
                      className={`flex items-center gap-3 px-4 py-3 ${theme.text.secondary} hover:${theme.backgrounds.primary} rounded-xl transition-all duration-300 hover:translate-x-2`}
                    >
                      <span className="text-xl">{item.icon}</span>
                      <span className="font-medium">{item.label}</span>
                    </a>
                  ))}
                </div>
              )
            ))}

            {/* Mobile Language Selector */}
            <div className={`pt-4 ${theme.borders.light} border-t mt-2`}>
              <div className={`text-xs font-bold ${theme.text.light} uppercase tracking-wider mb-2 px-4`}>
                {t.language}
              </div>
              <button
                onClick={() => handleLanguageChange('en')}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-300 ${language === 'en'
                  ? `${theme.backgrounds.primary} ${theme.text.brand} font-semibold`
                  : `${theme.text.secondary} hover:${theme.backgrounds.light}`
                  }`}
              >
                <span className="text-2xl flex-shrink-0">🇬🇧</span>
                <span className="flex-1 text-left">English</span>
                {language === 'en' && <span className={`${theme.text.brand} flex-shrink-0`}>✓</span>}
              </button>

              <button
                onClick={() => handleLanguageChange('mr')}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-300 mt-1 ${language === 'mr'
                  ? `${theme.backgrounds.primary} ${theme.text.brand} font-semibold`
                  : `${theme.text.secondary} hover:${theme.backgrounds.light}`
                  }`}
              >
                <span className="text-2xl flex-shrink-0">🇮🇳</span>
                <span className="flex-1 text-left">मराठी</span>
                {language === 'mr' && <span className={`${theme.text.brand} flex-shrink-0`}>✓</span>}
              </button>
            </div>
          </div>
        </div>
      </nav>
    </header>
  );
};

export default ImprovedNavbar;