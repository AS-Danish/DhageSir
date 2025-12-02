// LanguageContext.js
import React, { createContext, useContext, useState } from 'react';

// Complete translations object
export const translations = {
  en: {
    // Navbar
    home: "Home",
    about: "About",
    military: "Military",
    militaryBooks: "Military Books",
    militaryArticles: "Military Articles",
    podcast: "Podcast",
    mentor: "Mentor",
    mentorBooks: "Mentor Books",
    mentorArticles: "Mentor Articles",
    download: "Download",
    images: "Images",
    videos: "Videos",
    studyMaterials: "Study Materials",
    language: "Language",
    
    // About Section
    aboutMe: "About Lt Col (Dr) Satish Dhage",
    leadingWith: "Inspiring with",
    excellence: "Purpose",
    keyAchievements: "Key Achievements & Expertise",
    downloadCV: "Download CV",
    
    // Badge
    badgeLine1: "Best All Rounder",
    badgeLine2: "Indian Army Officer",
    
    // About Description
    aboutDescription: "Lt Col (Dr) Satish Dhage brings a unique blend of military leadership, medical expertise, mentoring skill and business acumen to inspire excellence in individuals and organizations. A dynamic polymath with vast knowledge and extensive experience from varied sectors, he has dedicated his post-military career to mentoring the next generation of leaders.",
    
    // Achievements
    achievement1: "Lt Gen Bilimoria Trophy winner for 'Best All Rounder Officer' Indian Army; National Award for Best AFMRC Research Project on 'Stress in Counter-Insurgency Ops'",
    achievement2: "'Military-Medical-Media-Mentoring — One Man, Many Dimensions, Shattering the Stereotypes and Shaping the Future Leaders'",
    achievement3: "Founder 'The Mentors Forum'",
    achievement4: "Founder Director - MGM ICE; Consultant DDA, Atma Malik Defence Academy; Hon. Member Govt of Maharashtra Committee on Soldiers' Welfare",

    //Hero Section
    heroTitle: "Inspiring with Purpose",
    heroSubtitle: "4M - Power Matrix",
    heroDescription: "A Strategic & Thought Leader Shattering Stereotypes with the 4-M Power Matrix of 'Military-Medical-Media-Mentoring'. Blending Uniform, Healing, Voice, and Vision — A New Archetype of Leadership. A dynamic polymath and a distinguished military leader turned influential speaker and media analyst, bringing vast knowledge and battlefield wisdom to boardrooms and broadcast platforms. Driven by integrity, purpose, and the power to inspire action through experience and insight.",
    heroCTA: "Start Your Journey",
    heroVideoButton: "Introduction Video",

    //Stats Section
    mediaInterviews: "Media Interviews",
    newspaperArticles: "Newspaper Articles",
    motivationalSessions: "Motivational Sessions",
    publishedBooks: "Published Books",
  },
  mr: {
    // Navbar
    home: "मुख्यपृष्ठ",
    about: "आमच्याबद्दल",
    military: "लष्करी",
    militaryBooks: "लष्करी पुस्तके",
    militaryArticles: "लष्करी लेख",
    mentor: "मार्गदर्शक",
    mentorBooks: "मार्गदर्शक पुस्तके",
    mentorArticles: "मार्गदर्शक लेख",
    podcast: "पॉडकास्ट",
    download: "डाउनलोड",
    images: "प्रतिमा",
    videos: "व्हिडिओ",
    studyMaterials: "अभ्यास साहित्य",
    language: "भाषा",
    
    // About Section
    aboutMe: "लेफ्टनंट कर्नल (डॉ) सतीश धागे यांच्याबद्दल",
    leadingWith: "प्रेरणा",
    excellence: "उद्देशाने",
    keyAchievements: "प्रमुख साधने आणि कौशल्य",
    downloadCV: "सीव्ही डाउनलोड करा",
    
    // Badge
    badgeLine1: "सर्वोत्कृष्ट सर्वांगीण",
    badgeLine2: "भारतीय लष्कर अधिकारी",
    
    // About Description
    aboutDescription: "लेफ्टनंट कर्नल (डॉ) सतीश धागे हे लष्करी नेतृत्व, वैद्यकीय कौशल्य, मार्गदर्शन कौशल्य आणि व्यावसायिक कुशाग्रतेचे अनोखे मिश्रण आणून व्यक्ती आणि संस्थांमध्ये उत्कृष्टतेची प्रेरणा देतात. विविध क्षेत्रांतील विस्तृत ज्ञान आणि अनुभव असलेले एक गतिमान बहुज्ञ म्हणून, त्यांनी आपले लष्करोत्तर कारकीर्द पुढील पिढीच्या नेत्यांना मार्गदर्शन करण्यासाठी समर्पित केले आहे.",
    
    // Achievements
    achievement1: "लेफ्टनंट जनरल बिलिमोरिया ट्रॉफी विजेते 'सर्वोत्कृष्ट सर्वांगीण अधिकारी' भारतीय लष्कर; 'काउंटर-इन्सर्जन्सी ऑपरेशन्समधील तणाव' या विषयावरील सर्वोत्कृष्ट AFMRC संशोधन प्रकल्पासाठी राष्ट्रीय पुरस्कार",
    achievement2: "'सैन्य-वैद्यकीय-माध्यम-मार्गदर्शन — एक माणूस, अनेक परिमाण, रूढींचा नाश करून भविष्यातील नेत्यांना आकार देणारा'",
    achievement3: "'द मेंटर्स फोरम' चे संस्थापक",
    achievement4: "संस्थापक संचालक - MGM ICE; सल्लागार DDA, आत्मा मलिक डिफेन्स अकादमी; महाराष्ट्र शासनाच्या सैनिक कल्याण समितीचे मानद सदस्य",

    //Hero Section
    heroTitle: "उद्देशाने प्रेरणा",
    heroSubtitle: "4M - पॉवर मॅट्रिक्स",
    heroDescription: "'सैन्य-वैद्यकीय-माध्यम-मार्गदर्शन' च्या 4-M पॉवर मॅट्रिक्ससह रूढी तोडणारे एक धोरणात्मक आणि विचार नेते. गणवेश, उपचार, आवाज आणि दृष्टी यांचे मिश्रण — नेतृत्वाचा एक नवीन आदर्श. एक गतिमान बहुज्ञ आणि प्रतिष्ठित लष्करी नेते जे प्रभावी वक्ते आणि मीडिया विश्लेषक बनले आहेत, विस्तृत ज्ञान आणि युद्धभूमीची शहाणपण बोर्डरूम आणि प्रसारण मंचावर आणत आहेत. प्रामाणिकपणा, उद्देश आणि अनुभव व अंतर्दृष्टीद्वारे कृती करण्यास प्रेरित करण्याच्या शक्तीने प्रेरित.",
    heroCTA: "आपला प्रवास सुरू करा",
    heroVideoButton: "परिचय व्हिडिओ",

    //Stats Section
    mediaInterviews: "मीडिया मुलाखती",
    newspaperArticles: "वृत्तपत्र लेख",
    motivationalSessions: "प्रेरक सत्रे",
    publishedBooks: "प्रकाशित पुस्तके",
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