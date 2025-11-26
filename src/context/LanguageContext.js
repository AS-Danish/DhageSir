// LanguageContext.js
import React, { createContext, useContext, useState } from 'react';

// Complete translations object
export const translations = {
  en: {
    // Navbar
    home: "Home",
    about: "About",
    military: "Military",
    mentor: "Mentor",
    download: "Download",
    images: "Images",
    videos: "Videos",
    studyMaterials: "Study Materials",
    language: "Language",
    
    // About Section
    aboutMe: "About Me",
    leadingWith: "Leading With",
    excellence: "Excellence",
    keyAchievements: "Key Achievements & Expertise",
    downloadCV: "Download CV",
    yearsExperience: "Years Experience",
    studentsMentored: "Students Mentored",
    successRate: "Success Rate",
    
    // Achievements
    achievement1: "Expert in strategic planning, leadership development, and combat readiness training",
    achievement2: "Published author on military tactics and defense strategies, featured in national publications",
    achievement3: "Renowned motivational speaker delivering 100+ seminars on discipline and success mindset",
    achievement4: "Medical professional specializing in defense personnel healthcare and fitness protocols"
  },
  mr: {
    // Navbar
    home: "मुख्यपृष्ठ",
    about: "आमच्याबद्दल",
    military: "लष्करी",
    mentor: "मार्गदर्शक",
    download: "डाउनलोड",
    images: "प्रतिमा",
    videos: "व्हिडिओ",
    studyMaterials: "अभ्यास साहित्य",
    language: "भाषा",
    
    // About Section
    aboutMe: "माझ्याबद्दल",
    leadingWith: "नेतृत्व",
    excellence: "उत्कृष्टतेसह",
    keyAchievements: "प्रमुख साधने आणि कौशल्य",
    downloadCV: "सीव्ही डाउनलोड करा",
    yearsExperience: "वर्षांचा अनुभव",
    studentsMentored: "विद्यार्थी मार्गदर्शित",
    successRate: "यश दर",
    
    // Achievements
    achievement1: "धोरणात्मक नियोजन, नेतृत्व विकास आणि युद्ध तयारी प्रशिक्षणात तज्ञ",
    achievement2: "लष्करी रणनीती आणि संरक्षण धोरणांवर प्रकाशित लेखक, राष्ट्रीय प्रकाशनांमध्ये वैशिष्ट्यीकृत",
    achievement3: "प्रसिद्ध प्रेरक वक्ता, शिस्त आणि यश मानसिकतेवर 100+ चर्चासत्रे आयोजित",
    achievement4: "संरक्षण कर्मचार्‍यांच्या आरोग्यसेवा आणि तंदुरुस्ती प्रोटोकॉलमध्ये विशेष वैद्यकीय व्यावसायिक"
  }
};

// Language Context
const LanguageContext = createContext();

// Language Provider Component
export const LanguageProvider = ({ children }) => {
  const [language, setLanguage] = useState('en');
  
  const value = {
    language,
    setLanguage,
    t: translations[language]
  };
  
  return (
    <LanguageContext.Provider value={value}>
      {children}
    </LanguageContext.Provider>
  );
};

// Custom hook to use language context
export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within LanguageProvider');
  }
  return context;
};