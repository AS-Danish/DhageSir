import React from 'react';
import { Presentation, Users, Target, CheckCircle, ArrowRight, Star, Sparkles, TrendingUp } from 'lucide-react';
import { theme, getButton } from '../app/theme/theme';

const ServicesSection = () => {
  const services = [
    {
      id: 1,
      icon: Presentation,
      title: "Book a Talk or Seminar",
      description: "Inspire and motivate your team, institution, or organization with powerful talks on leadership, discipline, and success.",
      features: [
        "Keynote speeches for corporate events",
        "Educational institution seminars",
        "Defense career guidance sessions",
        "Motivational workshops for teams",
        "Customized content for your audience"
      ],
      gradient: theme.gradients.primary,
      bgGradient: theme.backgrounds.primary,
      accentColor: "orange",
      stats: { label: "Events Delivered", value: "100+" }
    },
    {
      id: 2,
      icon: Users,
      title: "Mentorship",
      description: "One-on-one personalized guidance to help defense aspirants and professionals achieve their goals with proven strategies.",
      features: [
        "Personal career roadmap development",
        "Exam preparation strategy planning",
        "Regular progress tracking sessions",
        "Interview preparation & SSB guidance",
        "Lifetime access to mentor support"
      ],
      gradient: theme.gradients.primaryLight,
      bgGradient: theme.backgrounds.primary,
      accentColor: "orange",
      stats: { label: "Success Rate", value: "98%" }
    },
    {
      id: 3,
      icon: Target,
      title: "Strategic Consultation",
      description: "Expert consultation for organizations seeking military-grade strategic planning, leadership development, and operational excellence.",
      features: [
        "Leadership development programs",
        "Strategic planning & execution",
        "Team building & cohesion training",
        "Crisis management protocols",
        "Performance optimization frameworks"
      ],
      gradient: theme.gradients.warm,
      bgGradient: theme.backgrounds.primary,
      accentColor: "orange",
      stats: { label: "Organizations Served", value: "50+" }
    }
  ];

  return (
    <section className={`py-16 md:py-20 ${theme.backgrounds.white} relative overflow-hidden`}>
      {/* Animated Background Elements */}
      <div className={`absolute top-0 left-1/4 w-96 h-96 ${theme.backgrounds.primary} rounded-full filter blur-3xl opacity-30 animate-pulse`}></div>
      <div className={`absolute bottom-0 right-1/4 w-96 h-96 ${theme.backgrounds.primary} rounded-full filter blur-3xl opacity-30 animate-pulse`}></div>
      
      <div className="container mx-auto px-4 max-w-7xl relative z-10">
        {/* Section Header */}
        <div className="text-center mb-16">
          <div className={`inline-flex items-center gap-2 px-5 py-2 bg-gradient-to-r ${theme.gradients.dark} ${theme.text.white} rounded-full text-sm font-semibold mb-4 ${theme.shadows.lg}`}>
            <Sparkles className="w-4 h-4" />
            Services Offered
          </div>
          <h2 className={`text-4xl md:text-5xl font-black ${theme.text.primary} mb-4`}>
            Transformative <span className={`bg-gradient-to-r ${theme.gradients.primary} bg-clip-text text-transparent`}>Services</span>
          </h2>
          <p className={`${theme.text.secondary} text-lg max-w-3xl mx-auto`}>
            Choose from our specialized services designed to elevate your career, leadership skills, and strategic thinking
          </p>
        </div>

        {/* Services Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {services.map((service, index) => {
            const Icon = service.icon;
            return (
              <div 
                key={service.id} 
                className="group relative"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                {/* Card Container */}
                <div className={`relative ${theme.backgrounds.white} rounded-3xl overflow-hidden ${theme.shadows.xl} hover:shadow-2xl transition-all duration-500 hover:-translate-y-2 ${theme.borders.light} border h-full flex flex-col`}>
                  {/* Top Gradient Bar */}
                  <div className={`h-2 bg-gradient-to-r ${service.gradient}`}></div>
                  
                  {/* Card Content */}
                  <div className="p-8 flex-1 flex flex-col">
                    {/* Icon Container */}
                    <div className="relative mb-6">
                      <div className={`absolute inset-0 ${service.bgGradient} rounded-2xl blur-xl opacity-50 group-hover:opacity-70 transition-opacity`}></div>
                      <div className={`relative w-20 h-20 bg-gradient-to-br ${service.gradient} rounded-2xl flex items-center justify-center ${theme.shadows.lg} group-hover:scale-110 transition-transform`}>
                        <Icon className={`w-10 h-10 ${theme.text.white}`} />
                      </div>
                      
                      {/* Floating Badge */}
                      <div className={`absolute -top-2 -right-2 w-8 h-8 bg-yellow-400 rounded-full flex items-center justify-center ${theme.shadows.lg}`}>
                        <Star className="w-4 h-4 text-yellow-900 fill-yellow-900" />
                      </div>
                    </div>

                    {/* Service Title */}
                    <h3 className={`text-2xl font-black ${theme.text.primary} mb-3 group-hover:text-transparent group-hover:bg-gradient-to-r group-hover:bg-clip-text group-hover:${service.gradient} transition-all`}>
                      {service.title}
                    </h3>

                    {/* Description */}
                    <p className={`${theme.text.secondary} leading-relaxed mb-6`}>
                      {service.description}
                    </p>

                    {/* Features List */}
                    <div className="space-y-3 mb-6 flex-1">
                      {service.features.map((feature, idx) => (
                        <div key={idx} className="flex items-start gap-3 group/item">
                          <div className={`w-5 h-5 bg-gradient-to-br ${service.gradient} rounded-full flex items-center justify-center flex-shrink-0 mt-0.5 group-hover/item:scale-110 transition-transform`}>
                            <CheckCircle className={`w-3 h-3 ${theme.text.white}`} />
                          </div>
                          <span className={`text-sm ${theme.text.secondary} leading-relaxed`}>{feature}</span>
                        </div>
                      ))}
                    </div>

                    {/* Stats Badge */}
                    <div className={`${service.bgGradient} rounded-xl p-4 mb-6 ${theme.borders.light} border`}>
                      <div className="flex items-center justify-between">
                        <div>
                          <div className={`text-xs ${theme.text.secondary} font-semibold mb-1`}>{service.stats.label}</div>
                          <div className={`text-2xl font-black bg-gradient-to-r ${service.gradient} bg-clip-text text-transparent`}>
                            {service.stats.value}
                          </div>
                        </div>
                        <TrendingUp className={`w-8 h-8 ${theme.text.brand} opacity-50`} />
                      </div>
                    </div>

                    {/* CTA Button */}
                    <button className={`w-full bg-gradient-to-r ${service.gradient} ${theme.text.white} rounded-xl py-4 px-6 font-bold hover:shadow-2xl hover:scale-105 transition-all flex items-center justify-center gap-2 group-hover:gap-3`}>
                      Get Started
                      <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                    </button>
                  </div>

                  {/* Decorative Corner Element */}
                  <div className={`absolute top-0 right-0 w-32 h-32 ${service.bgGradient} opacity-0 group-hover:opacity-100 transition-opacity rounded-bl-full`}></div>
                </div>

                {/* Glow Effect on Hover */}
                <div className={`absolute inset-0 bg-gradient-to-r ${service.gradient} opacity-0 group-hover:opacity-20 blur-2xl transition-opacity rounded-3xl -z-10`}></div>
              </div>
            );
          })}
        </div>

        {/* Bottom CTA Section */}
        <div className={`mt-16 bg-gradient-to-r ${theme.gradients.dark} rounded-3xl p-8 md:p-12 ${theme.text.white} ${theme.shadows.xl} relative overflow-hidden`}>
          {/* Decorative Elements */}
          <div className={`absolute top-0 right-0 w-64 h-64 ${theme.backgrounds.primary} rounded-full filter blur-3xl opacity-20`}></div>
          <div className={`absolute bottom-0 left-0 w-64 h-64 ${theme.backgrounds.primary} rounded-full filter blur-3xl opacity-20`}></div>
          
          <div className="relative z-10">
            <div className="flex flex-col lg:flex-row items-center justify-between gap-8">
              {/* Left Content */}
              <div className="flex-1 text-center lg:text-left">
                <h3 className="text-3xl md:text-4xl font-black mb-3">
                  Ready to Start Your Journey?
                </h3>
                <p className="text-orange-200 text-lg mb-6 lg:mb-0">
                  Book a free consultation call to discuss how we can help you achieve your goals
                </p>
              </div>

              {/* Right Buttons */}
              <div className="flex flex-col sm:flex-row gap-4">
                <button className={`px-8 py-4 ${theme.backgrounds.white} ${theme.text.primary} rounded-xl font-bold hover:bg-gray-100 transition-all ${theme.shadows.xl} hover:shadow-2xl hover:scale-105 whitespace-nowrap`}>
                  Schedule Free Call
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default ServicesSection;