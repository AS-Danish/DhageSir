"use client"
import React, { useState } from 'react';
import { Mail, Phone, MapPin, Clock, Send, MessageCircle } from 'lucide-react';

// Global Theme Colors
const theme = {
  gradients: {
    primary: 'from-orange-500 to-orange-600',
    secondary: 'from-blue-600 to-cyan-600',
    warm: 'from-amber-500 to-orange-600',
  },
  iconGradients: {
    phone: 'from-green-400 to-emerald-600',
    email: 'from-orange-400 to-orange-600',
    location: 'from-red-500 to-orange-500',
    time: 'from-amber-500 to-orange-600',
  }
};

const ContactSection = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    message: ''
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log('Form submitted:', formData);
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const contactDetails = [
    {
      icon: Phone,
      label: "Phone Number",
      value: "+91 98765 43210",
      link: "tel:+919876543210",
      gradient: theme.iconGradients.phone
    },
    {
      icon: Mail,
      label: "Email Address",
      value: "contact@colonel.com",
      link: "mailto:contact@colonel.com",
      gradient: theme.iconGradients.email
    },
    {
      icon: MapPin,
      label: "Office Location",
      value: "New Delhi, India 110001",
      link: "#",
      gradient: theme.iconGradients.location
    },
    {
      icon: Clock,
      label: "Working Hours",
      value: "Mon - Sat: 9:00 AM - 6:00 PM",
      link: "#",
      gradient: theme.iconGradients.time
    }
  ];

  const socialLinks = [
    {
      name: "Instagram",
      icon: "📷",
      url: "https://instagram.com/yourprofile",
      color: "from-pink-600 to-purple-600",
    },
    {
      name: "Facebook",
      icon: "👤",
      url: "https://facebook.com/yourpage",
      color: "from-blue-600 to-blue-700",
    },
    {
      name: "Twitter",
      icon: "🐦",
      url: "https://twitter.com/yourhandle",
      color: "from-sky-500 to-blue-600",
    },
    {
      name: "WhatsApp",
      icon: "💬",
      url: "https://wa.me/919876543210",
      color: "from-green-500 to-green-600",
    },
    {
      name: "YouTube 1",
      icon: "▶️",
      url: "https://youtube.com/@channel1",
      color: "from-red-600 to-red-700",
    },
    {
      name: "YouTube 2",
      icon: "🎬",
      url: "https://youtube.com/@channel2",
      color: "from-orange-500 to-red-600",
    }
  ];

  return (
    <section className="py-16 md:py-20 bg-white relative overflow-hidden">
      {/* Background Decorative Elements */}
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-orange-50 rounded-full filter blur-3xl opacity-20"></div>
      <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-amber-50 rounded-full filter blur-3xl opacity-20"></div>
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-gradient-to-r from-orange-50 to-amber-50 rounded-full filter blur-3xl opacity-10"></div>
      
      <div className="container mx-auto px-4 max-w-7xl relative z-10">
        {/* Section Header */}
        <div className="text-center mb-12">
          <div className={`inline-flex items-center gap-2 px-5 py-2 bg-gradient-to-r ${theme.gradients.primary} text-white rounded-full text-sm font-semibold mb-4 shadow-lg`}>
            <MessageCircle className="w-4 h-4" />
            Get In Touch
          </div>
          <h2 className="text-4xl md:text-5xl font-black text-gray-900 mb-3">
            Contact <span className={`bg-gradient-to-r ${theme.gradients.primary} bg-clip-text text-transparent`}>Us</span>
          </h2>
          <p className="text-gray-600 text-lg max-w-2xl mx-auto">
            Have questions? We'd love to hear from you. Send us a message and we'll respond as soon as possible.
          </p>
        </div>

        {/* Main Contact Grid */}
        <div className="grid lg:grid-cols-2 gap-12 mb-12">
          {/* Left Side - Contact Details */}
          <div>
            <h3 className="text-2xl font-black text-gray-900 mb-6">Contact Information</h3>
            <div className="space-y-5">
              {contactDetails.map((detail, index) => {
                const Icon = detail.icon;
                return (
                  <a
                    key={index}
                    href={detail.link}
                    className="flex items-start gap-5 p-6 bg-white rounded-2xl border-2 border-gray-100 hover:border-orange-200 shadow-sm hover:shadow-2xl transition-all group hover:-translate-y-2"
                  >
                    <div className={`w-16 h-16 bg-gradient-to-br ${detail.gradient} rounded-2xl flex items-center justify-center flex-shrink-0 group-hover:scale-110 group-hover:rotate-3 transition-all shadow-lg`}>
                      <Icon className="w-8 h-8 text-white" />
                    </div>
                    <div className="flex-1 pt-1">
                      <div className="text-sm font-semibold text-gray-500 mb-1">{detail.label}</div>
                      <div className="text-lg font-bold text-gray-900 group-hover:text-orange-600 transition-colors">
                        {detail.value}
                      </div>
                    </div>
                  </a>
                );
              })}
            </div>
          </div>

          {/* Right Side - Quick Contact Form */}
          <div>
            <h3 className="text-2xl font-black text-gray-900 mb-6">Send a Message</h3>
            <div className="bg-white rounded-3xl shadow-2xl p-8 border-2 border-gray-100">
              <div className="space-y-5">
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">Your Name</label>
                  <input 
                    type="text" 
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    placeholder="Enter your full name"
                    className="w-full px-5 py-4 bg-gray-50 border-2 border-gray-100 rounded-xl focus:border-orange-500 focus:bg-white focus:outline-none transition-all"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">Email Address</label>
                  <input 
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="your.email@example.com"
                    className="w-full px-5 py-4 bg-gray-50 border-2 border-gray-100 rounded-xl focus:border-orange-500 focus:bg-white focus:outline-none transition-all"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">Phone Number</label>
                  <input 
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    placeholder="+91 98765 43210"
                    className="w-full px-5 py-4 bg-gray-50 border-2 border-gray-100 rounded-xl focus:border-orange-500 focus:bg-white focus:outline-none transition-all"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">Your Message</label>
                  <textarea 
                    name="message"
                    value={formData.message}
                    onChange={handleChange}
                    rows="4"
                    placeholder="Tell us how we can help you..."
                    className="w-full px-5 py-4 bg-gray-50 border-2 border-gray-100 rounded-xl focus:border-orange-500 focus:bg-white focus:outline-none transition-all resize-none"
                  ></textarea>
                </div>
                
                <button 
                  onClick={handleSubmit}
                  className={`w-full bg-gradient-to-r ${theme.gradients.primary} hover:from-orange-600 hover:to-orange-700 text-white rounded-xl py-4 px-6 font-bold hover:shadow-2xl hover:scale-105 transition-all flex items-center justify-center gap-2 group shadow-lg shadow-orange-500/20`}
                >
                  <Send className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                  Send Message
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Social Media Section */}
        <div className="bg-white rounded-3xl p-10 md:p-12 shadow-2xl relative overflow-hidden border-2 border-gray-100">
          {/* Decorative Background - Subtle */}
          <div className="absolute top-0 right-0 w-80 h-80 bg-gradient-to-bl from-orange-50 to-transparent rounded-full opacity-50"></div>
          <div className="absolute bottom-0 left-0 w-80 h-80 bg-gradient-to-tr from-amber-50 to-transparent rounded-full opacity-50"></div>
          
          <div className="relative z-10">
            <div className="text-center mb-10">
              <h3 className="text-3xl md:text-4xl font-black text-gray-900 mb-3">Connect With Us</h3>
              <p className="text-gray-600 text-lg">Follow us on social media for daily updates, tips, and inspiration</p>
            </div>

            {/* Social Links Grid */}
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-5">
              {socialLinks.map((social, index) => (
                <a
                  key={index}
                  href={social.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={`group relative bg-gradient-to-br ${social.color} rounded-2xl p-8 flex flex-col items-center justify-center gap-3 shadow-lg hover:shadow-2xl hover:scale-110 transition-all`}
                >
                  <div className="text-5xl transform group-hover:scale-125 transition-transform">{social.icon}</div>
                  <span className="text-sm font-bold text-white text-center">{social.name}</span>
                  
                  {/* Shine Effect */}
                  <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity rounded-2xl"></div>
                </a>
              ))}
            </div>

            {/* Quick Action Buttons */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-5 mt-12 pt-10 border-t-2 border-gray-100">
              <a
                href="https://wa.me/919876543210"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-3 px-10 py-5 bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white rounded-xl font-bold shadow-xl hover:shadow-2xl hover:scale-105 transition-all"
              >
                💬 Chat on WhatsApp
              </a>
              <a
                href="tel:+919876543210"
                className={`inline-flex items-center gap-3 px-10 py-5 bg-gradient-to-r ${theme.gradients.primary} hover:from-orange-600 hover:to-orange-700 text-white rounded-xl font-bold shadow-xl shadow-orange-500/20 hover:shadow-2xl hover:scale-105 transition-all`}
              >
                📞 Call Now
              </a>
            </div>
          </div>
        </div>

        {/* Bottom Trust Bar */}
        <div className="mt-12 flex flex-wrap items-center justify-center gap-8 text-center">
          <div className="flex items-center gap-2 text-gray-600">
            <div className="w-2 h-2 bg-orange-500 rounded-full animate-pulse"></div>
            <span className="font-semibold">Available Now</span>
          </div>
          <div className="flex items-center gap-2 text-gray-600">
            <span className="text-xl">⚡</span>
            <span className="font-semibold">Quick Response Time</span>
          </div>
          <div className="flex items-center gap-2 text-gray-600">
            <span className="text-xl">✓</span>
            <span className="font-semibold">Trusted by 5000+ Clients</span>
          </div>
        </div>
      </div>
    </section>
  );
};

export default ContactSection;