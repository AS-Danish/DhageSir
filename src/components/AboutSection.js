import React from 'react';
import { CheckCircle, Shield, Stethoscope, GraduationCap, TrendingUp, Download, Star, Award, Users, Target } from 'lucide-react';
import { theme, getGradient, getButton } from '../app/theme/theme';

const AboutSection = () => {

  const achievements = [
    { icon: Target, text: "Expert in strategic planning, leadership development, and combat readiness training" },
    { icon: CheckCircle, text: "Published author on military tactics and defense strategies, featured in national publications" },
    { icon: CheckCircle, text: "Renowned motivational speaker delivering 100+ seminars on discipline and success mindset" },
    { icon: CheckCircle, text: "Medical professional specializing in defense personnel healthcare and fitness protocols" }
  ];

  const stats = [
    { value: "25+", label: "Years Experience" },
    { value: "5000+", label: "Students Mentored" },
    { value: "98%", label: "Success Rate" }
  ];

  return (
    <section className={`py-16 md:py-20 ${theme.backgrounds.white} relative overflow-hidden`}>
      {/* Subtle Background Elements */}
      <div className="absolute top-10 right-0 w-96 h-96 bg-orange-50 rounded-full filter blur-3xl opacity-40"></div>
      <div className="absolute bottom-0 left-0 w-96 h-96 bg-blue-50 rounded-full filter blur-3xl opacity-40"></div>
      
      <div className="container mx-auto px-4 max-w-7xl relative z-10">
        {/* Section Header */}
        <div className="text-center mb-12">
          <div className={`inline-flex items-center gap-2 px-5 py-2 bg-gradient-to-r ${theme.gradients.primary} ${theme.text.white} rounded-full text-sm font-semibold mb-4 ${theme.shadows.lg}`}>
            <Star className="w-4 h-4 fill-white" />
            About Me
          </div>
          <h2 className={`text-4xl md:text-5xl font-black ${theme.text.primary} mb-3`}>
            Leading With <span className={`bg-gradient-to-r ${theme.gradients.primary} bg-clip-text text-transparent`}>Excellence</span>
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
          </div>

          {/* Right Side - Content */}
          <div className="space-y-6">

            {/* Achievements List */}
            <div className="space-y-4 pt-2">
              <h3 className={`text-xl font-bold ${theme.text.primary} mb-4`}>
                Key Achievements & Expertise
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
                Download CV
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default AboutSection;