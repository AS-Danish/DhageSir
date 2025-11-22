import React from 'react';
import { CheckCircle, Shield, Stethoscope, GraduationCap, TrendingUp, Download, Star, Award, Users, Target } from 'lucide-react';

const AboutSection = () => {

  const achievements = [
    { icon: Award, text: "Decorated military officer with 25+ years of distinguished service in the Indian Armed Forces" },
    { icon: Users, text: "Successfully mentored over 5,000 defense aspirants, with 98% success rate in clearing competitive exams" },
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
    <section className="py-16 md:py-20 bg-white relative overflow-hidden">
      {/* Subtle Background Elements */}
      <div className="absolute top-10 right-0 w-96 h-96 bg-blue-50 rounded-full filter blur-3xl opacity-40"></div>
      <div className="absolute bottom-0 left-0 w-96 h-96 bg-purple-50 rounded-full filter blur-3xl opacity-40"></div>
      
      <div className="container mx-auto px-4 max-w-7xl relative z-10">
        {/* Section Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 px-5 py-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-full text-sm font-semibold mb-4 shadow-lg">
            <Star className="w-4 h-4 fill-white" />
            About Colonel
          </div>
          <h2 className="text-4xl md:text-5xl font-black text-gray-900 mb-3">
            Leading With <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">Excellence</span>
          </h2>
        </div>

        {/* Main Content Grid */}
        <div className="grid lg:grid-cols-2 gap-12 items-start">
          {/* Left Side - Image */}
          <div className="relative">
            <div className="relative group">
              {/* Decorative Background */}
              <div className="absolute -inset-4 bg-gradient-to-br from-blue-100 to-purple-100 rounded-3xl opacity-50 group-hover:opacity-70 transition-opacity"></div>
              
              <div className="relative rounded-2xl overflow-hidden shadow-2xl">
                <img 
                  src="https://images.unsplash.com/photo-1556157382-97eda2d62296?w=700&h=850&fit=crop"
                  alt="Colonel Profile"
                  className="w-full h-auto object-cover"
                />
                
                {/* Overlay Stats */}
                <div className="absolute inset-0 bg-gradient-to-t from-gray-900/80 via-gray-900/20 to-transparent"></div>
                
                {/* Bottom Stats Card */}
                <div className="absolute bottom-6 left-6 right-6">
                  <div className="bg-white/95 backdrop-blur-md rounded-2xl p-5 shadow-2xl">
                    <div className="grid grid-cols-3 gap-4 text-center">
                      {stats.map((stat, index) => (
                        <div key={index} className={index < 2 ? "border-r border-gray-200" : ""}>
                          <div className="text-2xl md:text-3xl font-black bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">{stat.value}</div>
                          <div className="text-xs text-gray-600 font-semibold mt-1">{stat.label}</div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              {/* Floating Badge */}
              <div className="absolute -top-3 -right-3 w-20 h-20 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-2xl flex items-center justify-center shadow-xl animate-pulse">
                <span className="text-3xl">🎖️</span>
              </div>
            </div>
          </div>

          {/* Right Side - Content */}
          <div className="space-y-6">

            {/* Achievements List */}
            <div className="space-y-4 pt-2">
              <h3 className="text-xl font-bold text-gray-900 mb-4">Key Achievements & Expertise</h3>
              {achievements.map((item, index) => {
                const Icon = item.icon;
                return (
                  <div key={index} className="flex items-start gap-4 group">
                    <div className="w-10 h-10 bg-gradient-to-br from-green-400 to-emerald-600 rounded-xl flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform shadow-md">
                      <Icon className="w-5 h-5 text-white" />
                    </div>
                    <span className="text-gray-700 leading-relaxed pt-1.5">{item.text}</span>
                  </div>
                );
              })}
            </div>

            {/* CTA Buttons */}
            <div className="flex flex-wrap gap-4 pt-4">
              <button className="inline-flex items-center gap-3 px-8 py-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl font-bold hover:shadow-2xl hover:scale-105 transition-all shadow-xl group">
                <Download className="w-5 h-5 group-hover:animate-bounce" />
                Download Complete Profile
              </button>
              <button className="inline-flex items-center gap-2 px-8 py-4 bg-white border-2 border-gray-900 text-gray-900 rounded-xl font-bold hover:bg-gray-900 hover:text-white transition-all shadow-lg">
                Book Consultation
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default AboutSection;