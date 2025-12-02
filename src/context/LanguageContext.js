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

    // Services Section
    servicesOffered: "Services Offered",
    servicesTitle: "Transformative",
    servicesHighlight: "Services",
    servicesSubtitle: "Choose from our specialized services designed to elevate your career, leadership skills, and strategic thinking",
    
    // Service 1: Book a Talk or Seminar
    serviceTalkTitle: "Book a Talk or Seminar",
    serviceTalkDesc: "Inspire and motivate your team, institution, or organization with powerful talks on leadership, discipline, and success.",
    serviceTalkFeature1: "Keynote speeches for corporate events",
    serviceTalkFeature2: "Educational institution seminars",
    serviceTalkFeature3: "Defense career guidance sessions",
    serviceTalkFeature4: "Motivational workshops for teams",
    serviceTalkFeature5: "Customized content for your audience",
    serviceTalkStats: "Events Delivered",
    
    // Service 2: Mentorship
    serviceMentorshipTitle: "Mentorship",
    serviceMentorshipDesc: "One-on-one personalized guidance to help Defense aspirants, UPSC aspirants and professionals achieve their goals with proven strategies.",
    serviceMentorshipFeature1: "Personal career roadmap development",
    serviceMentorshipFeature2: "Exam preparation strategy planning",
    serviceMentorshipFeature3: "Regular progress tracking sessions",
    serviceMentorshipFeature4: "Interview preparation & SSB guidance",
    serviceMentorshipFeature5: "Lifetime access to mentor support",
    serviceMentorshipStats: "Hundreds of Successful Leaders",
    
    // Service 3: Strategic Consultation
    serviceConsultTitle: "Strategic Consultation",
    serviceConsultDesc: "Expert consultation for organizations seeking military-grade strategic planning, leadership development, and operational excellence.",
    serviceConsultFeature1: "Leadership development programs",
    serviceConsultFeature2: "Strategic planning & execution",
    serviceConsultFeature3: "Team building & cohesion training",
    serviceConsultFeature4: "Crisis management protocols",
    serviceConsultFeature5: "Performance optimization frameworks",
    serviceConsultStats: "Organizations Served",
    
    // Booking Form
    bookNow: "Book Now",
    bookService: "Book Service",
    bookingSuccess: "Booking Submitted!",
    bookingSuccessMsg: "We'll get back to you shortly to confirm your booking.",
    bookingError: "Failed to book service. Please try again.",
    
    // Form Fields
    formName: "Your Name",
    formNamePlaceholder: "Enter your full name",
    formEmail: "Email Address",
    formEmailPlaceholder: "your.email@example.com",
    formPhone: "Phone Number",
    formPhonePlaceholder: "+91 98765 43210",
    formOrganization: "Organization/Institution",
    formOrganizationPlaceholder: "Your company or institution name",
    formPreferredDate: "Preferred Date",
    formMessage: "Additional Details",
    formMessagePlaceholder: "Tell us about your requirements, audience size, event type, etc.",
    
    // Buttons
    cancel: "Cancel",
    submitBooking: "Submit Booking",
    submitting: "Submitting...",

    // Contact Section
    getInTouch: "Get In Touch",
    contactUs: "Contact Us",
    contactDescription: "Have questions? We'd love to hear from you. Send us a message and we'll respond as soon as possible.",
    contactInformation: "Contact Information",
    sendMessage: "Send a Message",
    
    // Contact Details
    phoneNumber: "Phone Number",
    emailAddress: "Email Address",
    
    // Contact Form Fields
    yourName: "Your Name",
    namePlaceholder: "Enter your full name",
    phoneLabel: "Phone Number",
    yourMessage: "Your Message",
    messagePlaceholder: "Tell us how we can help you...",
    
    // Contact Status Messages
    messageSent: "Message sent successfully! We'll get back to you soon.",
    messageFailed: "Failed to send message. Please try again.",
    
    // Contact Buttons
    sendMessageBtn: "Send Message",
    sending: "Sending...",
    
    // Social Section
    connectWithUs: "Connect With Us",
    followSocial: "Follow us on social media",
    
    // Social Links
    whatsapp: "WhatsApp",
    youtube1: "YouTube 1",
    youtube2: "YouTube 2",
    instagram: "Instagram",
    facebook: "Facebook",
    twitter: "X (Twitter)",
    linkedin: "LinkedIn",
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

    // Services Section
    servicesOffered: "सेवा",
    servicesTitle: "परिवर्तनकारी",
    servicesHighlight: "सेवा",
    servicesSubtitle: "आपली करिअर, नेतृत्व कौशल्ये आणि धोरणात्मक विचार वाढवण्यासाठी डिझाइन केलेल्या आमच्या विशेष सेवांमधून निवडा",
    
    // Service 1: Book a Talk or Seminar
    serviceTalkTitle: "व्याख्यान किंवा चर्चासत्र बुक करा",
    serviceTalkDesc: "नेतृत्व, शिस्त आणि यशावर सशक्त भाषणांसह आपल्या टीम, संस्था किंवा संस्थेला प्रेरणा आणि प्रोत्साहन द्या.",
    serviceTalkFeature1: "कॉर्पोरेट कार्यक्रमांसाठी मुख्य भाषणे",
    serviceTalkFeature2: "शैक्षणिक संस्था चर्चासत्रे",
    serviceTalkFeature3: "संरक्षण करिअर मार्गदर्शन सत्रे",
    serviceTalkFeature4: "टीमसाठी प्रेरक कार्यशाळा",
    serviceTalkFeature5: "आपल्या प्रेक्षकांसाठी सानुकूलित सामग्री",
    serviceTalkStats: "आयोजित कार्यक्रम",
    
    // Service 2: Mentorship
    serviceMentorshipTitle: "मार्गदर्शन",
    serviceMentorshipDesc: "संरक्षण इच्छुक, UPSC इच्छुक आणि व्यावसायिकांना सिद्ध धोरणांसह त्यांची उद्दिष्टे साध्य करण्यात मदत करण्यासाठी वैयक्तिक मार्गदर्शन.",
    serviceMentorshipFeature1: "वैयक्तिक करिअर रोडमॅप विकास",
    serviceMentorshipFeature2: "परीक्षा तयारी धोरण नियोजन",
    serviceMentorshipFeature3: "नियमित प्रगती ट्रॅकिंग सत्रे",
    serviceMentorshipFeature4: "मुलाखत तयारी आणि SSB मार्गदर्शन",
    serviceMentorshipFeature5: "मार्गदर्शक सहाय्यासाठी आजीवन प्रवेश",
    serviceMentorshipStats: "यशस्वी नेत्यांची शेकडो",
    
    // Service 3: Strategic Consultation
    serviceConsultTitle: "धोरणात्मक सल्ला",
    serviceConsultDesc: "लष्करी-दर्जाचे धोरणात्मक नियोजन, नेतृत्व विकास आणि परिचालन उत्कृष्टता शोधणाऱ्या संस्थांसाठी तज्ञ सल्ला.",
    serviceConsultFeature1: "नेतृत्व विकास कार्यक्रम",
    serviceConsultFeature2: "धोरणात्मक नियोजन आणि अंमलबजावणी",
    serviceConsultFeature3: "टीम बिल्डिंग आणि एकता प्रशिक्षण",
    serviceConsultFeature4: "संकट व्यवस्थापन प्रोटोकॉल",
    serviceConsultFeature5: "कार्यप्रदर्शन ऑप्टिमायझेशन फ्रेमवर्क",
    serviceConsultStats: "सेवा दिलेल्या संस्था",
    
    // Booking Form
    bookNow: "आता बुक करा",
    bookService: "सेवा बुक करा",
    bookingSuccess: "बुकिंग सबमिट केले!",
    bookingSuccessMsg: "आम्ही आपल्या बुकिंगची पुष्टी करण्यासाठी लवकरच आपल्याशी संपर्क साधू.",
    bookingError: "सेवा बुक करण्यात अयशस्वी. कृपया पुन्हा प्रयत्न करा.",
    
    // Form Fields
    formName: "आपले नाव",
    formNamePlaceholder: "आपले पूर्ण नाव प्रविष्ट करा",
    formEmail: "ईमेल पत्ता",
    formEmailPlaceholder: "your.email@example.com",
    formPhone: "फोन नंबर",
    formPhonePlaceholder: "+91 98765 43210",
    formOrganization: "संस्था/संस्था",
    formOrganizationPlaceholder: "आपल्या कंपनीचे किंवा संस्थेचे नाव",
    formPreferredDate: "पसंतीची तारीख",
    formMessage: "अतिरिक्त तपशील",
    formMessagePlaceholder: "आम्हाला आपल्या आवश्यकता, प्रेक्षक आकार, कार्यक्रम प्रकार इत्यादीबद्दल सांगा.",
    
    // Buttons
    cancel: "रद्द करा",
    submitBooking: "बुकिंग सबमिट करा",
    submitting: "सबमिट करत आहे...",

    // Contact Section
    getInTouch: "संपर्कात रहा",
    contactUs: "संपर्क करा",
    contactDescription: "प्रश्न आहेत? आम्ही तुमच्याकडून ऐकू इच्छितो. आम्हाला एक संदेश पाठवा आणि आम्ही शक्य तितक्या लवकर प्रतिसाद देऊ.",
    contactInformation: "संपर्क माहिती",
    sendMessage: "संदेश पाठवा",
    
    // Contact Details
    phoneNumber: "फोन नंबर",
    emailAddress: "ईमेल पत्ता",
    
    // Contact Form Fields
    yourName: "तुमचे नाव",
    namePlaceholder: "तुमचे पूर्ण नाव प्रविष्ट करा",
    phoneLabel: "फोन नंबर",
    yourMessage: "तुमचा संदेश",
    messagePlaceholder: "आम्ही तुम्हाला कशी मदत करू शकतो ते सांगा...",
    
    // Contact Status Messages
    messageSent: "संदेश यशस्वीरित्या पाठवला! आम्ही लवकरच तुमच्याशी संपर्क साधू.",
    messageFailed: "संदेश पाठवण्यात अयशस्वी. कृपया पुन्हा प्रयत्न करा.",
    
    // Contact Buttons
    sendMessageBtn: "संदेश पाठवा",
    sending: "पाठवत आहे...",
    
    // Social Section
    connectWithUs: "आमच्याशी जुडा",
    followSocial: "सोशल मीडियावर आमचे अनुसरण करा",
    
    // Social Links
    whatsapp: "व्हॉट्सअॅप",
    youtube1: "यूट्यूब 1",
    youtube2: "यूट्यूब 2",
    instagram: "इन्स्टाग्राम",
    facebook: "फेसबुक",
    twitter: "एक्स (ट्विटर)",
    linkedin: "लिंक्डइन",
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