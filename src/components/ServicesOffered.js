"use client"
import React, { useState } from 'react';
import { Presentation, Users, Target, CheckCircle, ArrowRight, Star, Sparkles, TrendingUp, X, Send, Calendar, AlertCircle } from 'lucide-react';

const theme = {
  gradients: {
    primary: 'from-orange-500 to-orange-600',
    primaryLight: 'from-orange-400 to-orange-500',
    warm: 'from-amber-500 to-orange-600',
    dark: 'from-gray-800 to-gray-900',
  },
  backgrounds: {
    primary: 'bg-orange-50',
    white: 'bg-white',
  },
  text: {
    primary: 'text-gray-900',
    secondary: 'text-gray-600',
    white: 'text-white',
    brand: 'text-orange-600',
  },
  shadows: {
    lg: 'shadow-lg',
    xl: 'shadow-xl',
  },
  borders: {
    light: 'border-gray-100',
  }
};

const ServicesSection = () => {
  const [selectedService, setSelectedService] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    organization: '',
    preferredDate: '',
    message: ''
  });
  const [status, setStatus] = useState({
    loading: false,
    success: false,
    error: null
  });

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

  const openBookingModal = (service) => {
    setSelectedService(service);
    setFormData({
      name: '',
      email: '',
      phone: '',
      organization: '',
      preferredDate: '',
      message: ''
    });
    setStatus({ loading: false, success: false, error: null });
  };

  const closeBookingModal = () => {
    setSelectedService(null);
    setFormData({
      name: '',
      email: '',
      phone: '',
      organization: '',
      preferredDate: '',
      message: ''
    });
    setStatus({ loading: false, success: false, error: null });
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setStatus({ loading: true, success: false, error: null });

    try {
      const response = await fetch('/api/book-service', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...formData,
          serviceName: selectedService.title,
          serviceId: selectedService.id
        }),
      });

      const data = await response.json();

      if (response.ok) {
        setStatus({ loading: false, success: true, error: null });
        setTimeout(() => {
          closeBookingModal();
        }, 3000);
      } else {
        throw new Error(data.error || 'Failed to book service');
      }
    } catch (error) {
      setStatus({ 
        loading: false, 
        success: false, 
        error: error.message || 'Failed to book service. Please try again.' 
      });
    }
  };

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
                    <h3 className={`text-2xl font-black ${theme.text.primary} mb-3`}>
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
                    <button 
                      onClick={() => openBookingModal(service)}
                      className={`w-full bg-gradient-to-r ${service.gradient} ${theme.text.white} rounded-xl py-4 px-6 font-bold hover:shadow-2xl hover:scale-105 transition-all flex items-center justify-center gap-2 group-hover:gap-3`}
                    >
                      Book Now
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

      {/* Booking Modal */}
      {selectedService && (
        <div className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            {/* Modal Header */}
            <div className={`bg-gradient-to-r ${selectedService.gradient} p-6 relative`}>
              <button 
                onClick={closeBookingModal}
                className="absolute top-4 right-4 w-10 h-10 bg-white bg-opacity-20 hover:bg-opacity-30 rounded-full flex items-center justify-center transition-all"
              >
                <X className="w-6 h-6 text-white" />
              </button>
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 bg-white bg-opacity-20 rounded-2xl flex items-center justify-center">
                  {React.createElement(selectedService.icon, { className: "w-8 h-8 text-white" })}
                </div>
                <div>
                  <h3 className="text-2xl font-black text-white">Book Service</h3>
                  <p className="text-orange-100">{selectedService.title}</p>
                </div>
              </div>
            </div>

            {/* Modal Body */}
            <div className="p-8">
              {status.success ? (
                <div className="text-center py-8">
                  <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <CheckCircle className="w-10 h-10 text-green-600" />
                  </div>
                  <h4 className="text-2xl font-bold text-gray-900 mb-2">Booking Submitted!</h4>
                  <p className="text-gray-600">We'll get back to you shortly to confirm your booking.</p>
                </div>
              ) : (
                <div className="space-y-5">
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2">Your Name *</label>
                    <input 
                      type="text" 
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      placeholder="Enter your full name"
                      required
                      className="w-full px-5 py-4 bg-gray-50 border-2 border-gray-100 rounded-xl focus:border-orange-500 focus:bg-white focus:outline-none transition-all"
                    />
                  </div>
                  
                  <div className="grid md:grid-cols-2 gap-5">
                    <div>
                      <label className="block text-sm font-bold text-gray-700 mb-2">Email Address *</label>
                      <input 
                        type="email"
                        name="email"
                        value={formData.email}
                        onChange={handleChange}
                        placeholder="your.email@example.com"
                        required
                        className="w-full px-5 py-4 bg-gray-50 border-2 border-gray-100 rounded-xl focus:border-orange-500 focus:bg-white focus:outline-none transition-all"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-bold text-gray-700 mb-2">Phone Number *</label>
                      <input 
                        type="tel"
                        name="phone"
                        value={formData.phone}
                        onChange={handleChange}
                        placeholder="+91 98765 43210"
                        required
                        className="w-full px-5 py-4 bg-gray-50 border-2 border-gray-100 rounded-xl focus:border-orange-500 focus:bg-white focus:outline-none transition-all"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2">Organization/Institution</label>
                    <input 
                      type="text"
                      name="organization"
                      value={formData.organization}
                      onChange={handleChange}
                      placeholder="Your company or institution name"
                      className="w-full px-5 py-4 bg-gray-50 border-2 border-gray-100 rounded-xl focus:border-orange-500 focus:bg-white focus:outline-none transition-all"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2">Preferred Date</label>
                    <div className="relative">
                      <input 
                        type="date"
                        name="preferredDate"
                        value={formData.preferredDate}
                        onChange={handleChange}
                        className="w-full px-5 py-4 bg-gray-50 border-2 border-gray-100 rounded-xl focus:border-orange-500 focus:bg-white focus:outline-none transition-all"
                      />
                      <Calendar className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" />
                    </div>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2">Additional Details *</label>
                    <textarea 
                      name="message"
                      value={formData.message}
                      onChange={handleChange}
                      rows="4"
                      placeholder="Tell us about your requirements, audience size, event type, etc."
                      required
                      className="w-full px-5 py-4 bg-gray-50 border-2 border-gray-100 rounded-xl focus:border-orange-500 focus:bg-white focus:outline-none transition-all resize-none"
                    ></textarea>
                  </div>

                  {status.error && (
                    <div className="flex items-center gap-2 p-4 bg-red-50 border-2 border-red-200 rounded-xl text-red-700">
                      <AlertCircle className="w-5 h-5 flex-shrink-0" />
                      <span className="font-semibold">{status.error}</span>
                    </div>
                  )}
                  
                  <div className="flex gap-4 pt-4">
                    <button 
                      type="button"
                      onClick={closeBookingModal}
                      className="flex-1 px-6 py-4 bg-gray-100 text-gray-700 rounded-xl font-bold hover:bg-gray-200 transition-all"
                    >
                      Cancel
                    </button>
                    <button 
                      type="button"
                      onClick={handleSubmit}
                      disabled={status.loading}
                      className={`flex-1 bg-gradient-to-r ${selectedService.gradient} text-white rounded-xl py-4 px-6 font-bold hover:shadow-2xl hover:scale-105 transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100`}
                    >
                      {status.loading ? (
                        <>
                          <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                          Submitting...
                        </>
                      ) : (
                        <>
                          <Send className="w-5 h-5" />
                          Submit Booking
                        </>
                      )}
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </section>
  );
};

export default ServicesSection;