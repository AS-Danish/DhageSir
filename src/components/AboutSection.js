import React from 'react';
import { CheckCircle, Download, Star } from 'lucide-react';
import { theme, getButton } from '../app/theme/theme';
import { useLanguage } from '../context/LanguageContext';

const AboutSection = () => {
  const { t } = useLanguage();
  const [showVideo, setShowVideo] = React.useState(false);

  const achievements = [
    { icon: Star, text: t.achievement1 },
    { icon: CheckCircle, text: t.achievement2 },
    { icon: CheckCircle, text: t.achievement3 },
    { icon: CheckCircle, text: t.achievement4 }
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
              
              {/* Badge */}
              <div className="absolute -top-4 -right-4 z-10">
                <div className={`bg-gradient-to-r ${theme.gradients.primary} ${theme.text.white} px-4 py-2 rounded-full ${theme.shadows.xl} text-center`}>
                  <div className="text-xs font-bold uppercase tracking-wide">{t.badgeLine1}</div>
                  <div className="text-[10px] font-semibold uppercase tracking-wider">{t.badgeLine2}</div>
                </div>
              </div>
              
              <div className={`relative rounded-2xl overflow-hidden ${theme.shadows.xl}`}>
                <div className="relative w-full" style={{ paddingBottom: '56.25%' }}>
                  {!showVideo ? (
                    <div 
                      className="absolute top-0 left-0 w-full h-full cursor-pointer group/thumb"
                      onClick={() => setShowVideo(true)}
                    >
                      {/* Thumbnail Image */}
                      <img
                        src="/ThumbnailImage.jpg"
                        alt="Video Thumbnail"
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          e.target.onerror = null;
                          e.target.src = "https://img.youtube.com/vi/D85gYG54AUk/maxresdefault.jpg";
                        }}
                      />
                      
                      {/* Play Button Overlay */}
                      <div className="absolute inset-0 flex items-center justify-center bg-opacity-30 group-hover/thumb:bg-opacity-40 transition-all">
                        <div className={`w-20 h-20 rounded-full flex items-center justify-center group-hover/thumb:scale-110 transition-transform bg-gradient-to-r ${theme.gradients.primary} ${theme.shadows.xl}`}>
                          <div className="w-0 h-0 border-l-[20px] border-l-white border-t-[12px] border-t-transparent border-b-[12px] border-b-transparent ml-1" />
                        </div>
                      </div>
                    </div>
                  ) : (
                    <iframe
                      className="absolute top-0 left-0 w-full h-full"
                      src="https://www.youtube.com/embed/D85gYG54AUk?si=aWGQgYngWQuPfHno&autoplay=1"
                      title="YouTube video player"
                      frameBorder="0"
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                      allowFullScreen
                    />
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Right Side - Content */}
          <div className="space-y-6">
            {/* Description */}
            <div className="pt-2">
              <p className={`text-lg ${theme.text.secondary} leading-relaxed`}>
                {t.aboutDescription}
              </p>
            </div>

            {/* Achievements List */}
            <div className="space-y-4">
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
              <button className={`${getButton('primary')} inline-flex items-center gap-3 group`}
                onClick={() => window.location.href = 'https://firebasestorage.googleapis.com/v0/b/mentorsforum-58af4.firebasestorage.app/o/Lt%20Col%20(Dr)%20Satish%20Dhage%20%20Brief%20Resume.docx?alt=media&token=ee225bfd-3ade-4587-aa29-e2a2394181cf'}>
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