import React from 'react';
import { CheckCircle, Target, Download, Star } from 'lucide-react';
import { theme, getButton } from '../app/theme/theme';
import { useLanguage } from '../context/LanguageContext'; // Import the hook

const AboutSection = () => {
  const { t } = useLanguage(); // Use the language context

  const achievements = [
    { icon: Target, text: t.achievement1 },
    { icon: CheckCircle, text: t.achievement2 },
    { icon: CheckCircle, text: t.achievement3 },
    { icon: CheckCircle, text: t.achievement4 }
  ];

  const stats = [
    { value: "25+", label: t.yearsExperience },
    { value: "5000+", label: t.studentsMentored },
    { value: "98%", label: t.successRate }
  ];

  return (
    <section className={`py-16 md:py-20 ${theme.backgrounds.white} relative overflow-hidden`} id="about">
      {/* Subtle Background Elements */}
      <div className="absolute top-10 right-0 w-96 h-96 bg-orange-50 rounded-full filter blur-3xl opacity-40"></div>
      <div className="absolute bottom-0 left-0 w-96 h-96 bg-blue-50 rounded-full filter blur-3xl opacity-40"></div>
      
      <div className="container mx-auto px-4 max-w-7xl relative z-10">
        {/* Section Header */}
        <div className="text-center mb-12">
          <div className={`inline-flex items-center gap-2 px-5 py-2 bg-gradient-to-r ${theme.gradients.primary} ${theme.text.white} rounded-full text-sm font-semibold mb-4 ${theme.shadows.lg}`}>
            <Star className="w-4 h-4 fill-white" />
            {t.aboutMe}
          </div>
          <h2 className={`text-4xl md:text-5xl font-black ${theme.text.primary} mb-3`}>
            {t.leadingWith} <span className={`bg-gradient-to-r ${theme.gradients.primary} bg-clip-text text-transparent`}>{t.excellence}</span>
          </h2>
        </div>

        {/* Main Content Grid */}
        <div className="grid lg:grid-cols-2 gap-12 items-start">
          {/* Left Side - Video */}
          <div className="relative">
            <div className="relative group">
              {/* Decorative Background */}
              <div className="absolute -inset-4 bg-gradient-to-br from-orange-100 to-orange-50 rounded-3xl opacity-50 group-hover:opacity-70 transition-opacity"></div>
              
              <div className={`relative rounded-2xl overflow-hidden ${theme.shadows.xl}`}>
                <div className="relative w-full" style={{ paddingBottom: '56.25%' }}>
                  <iframe
                    className="absolute top-0 left-0 w-full h-full"
                    src="https://www.youtube.com/embed/dQw4w9WgXcQ"
                    title="Colonel Introduction Video"
                    frameBorder="0"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                  ></iframe>
                </div>
              </div>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-3 gap-4 mt-6">
              {stats.map((stat, index) => (
                <div key={index} className={`${theme.backgrounds.white} rounded-xl p-4 ${theme.shadows.lg} text-center ${theme.borders.light} border`}>
                  <div className={`text-2xl md:text-3xl font-black ${theme.text.brand} mb-1`}>
                    {stat.value}
                  </div>
                  <div className={`text-xs ${theme.text.secondary} font-medium`}>
                    {stat.label}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Right Side - Content */}
          <div className="space-y-6">
            {/* Achievements List */}
            <div className="space-y-4 pt-2">
              <h3 className={`text-xl font-bold ${theme.text.primary} mb-4`}>
                {t.keyAchievements}
              </h3>
              {achievements.map((item, index) => {
                const Icon = item.icon;
                return (
                  <div key={index} className="flex items-start gap-4 group">
                    <div className={`w-10 h-10 ${theme.iconContainers.success} rounded-xl flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform ${theme.shadows.default}`}>
                      <Icon className={`w-5 h-5 ${theme.text.white}`} />
                    </div>
                    <span className={`${theme.text.secondary} leading-relaxed pt-1.5`}>
                      {item.text}
                    </span>
                  </div>
                );
              })}
            </div>

            {/* CTA Buttons */}
            <div className="flex flex-wrap gap-4 pt-4">
              <button className={`${getButton('primary')} inline-flex items-center gap-3 group`}>
                <Download className="w-5 h-5 group-hover:animate-bounce" />
                {t.downloadCV}
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default AboutSection;