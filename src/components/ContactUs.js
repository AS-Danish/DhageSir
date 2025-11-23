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
  ];

  const socialLinks = [
    {
      name: "Instagram",
      url: "https://instagram.com/yourprofile",
      bgColor: "bg-gradient-to-br from-pink-500 to-purple-600",
      hoverColor: "hover:from-pink-600 hover:to-purple-700",
    },
    {
      name: "Facebook",
      url: "https://facebook.com/yourpage",
      bgColor: "bg-gradient-to-br from-blue-600 to-blue-700",
      hoverColor: "hover:from-blue-700 hover:to-blue-800",
    },
    {
      name: "Twitter",
      url: "https://twitter.com/yourhandle",
      bgColor: "bg-gradient-to-br from-sky-400 to-blue-600",
      hoverColor: "hover:from-sky-500 hover:to-blue-700",
    },
    {
      name: "WhatsApp",
      url: "https://wa.me/919876543210",
      bgColor: "bg-gradient-to-br from-green-500 to-emerald-600",
      hoverColor: "hover:from-green-600 hover:to-emerald-700",
    },
    {
      name: "YouTube",
      url: "https://youtube.com/@channel1",
      bgColor: "bg-gradient-to-br from-red-600 to-red-700",
      hoverColor: "hover:from-red-700 hover:to-red-800",
    },
    {
      name: "LinkedIn",
      url: "https://linkedin.com/company/yourcompany",
      bgColor: "bg-gradient-to-br from-blue-700 to-blue-800",
      hoverColor: "hover:from-blue-800 hover:to-blue-900",
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
        <div className="bg-gradient-to-br from-gray-50 to-white rounded-2xl p-8 md:p-10 border border-gray-200">
          <div className="text-center mb-8">
            <h3 className="text-2xl font-bold text-gray-900 mb-2">Connect With Us</h3>
            <p className="text-gray-600">Follow us on social media</p>
          </div>

          {/* Social Links Grid */}
          <div className="flex flex-wrap items-center justify-center gap-4">
            {socialLinks.map((social, index) => (
              <a
                key={index}
                href={social.url}
                target="_blank"
                rel="noopener noreferrer"
                className={`${social.bgColor} ${social.hoverColor} rounded-xl px-6 py-3 text-white font-semibold shadow-md hover:shadow-lg transition-all`}
              >
                {social.name}
              </a>
            ))}
          </div>

          {/* Quick Action Buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mt-8 pt-8 border-t border-gray-200">
            <a
              href="https://wa.me/919876543210"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-8 py-3 bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white rounded-lg font-semibold shadow-md hover:shadow-lg transition-all"
            >
              Chat on WhatsApp
            </a>
            <a
              href="tel:+919876543210"
              className={`inline-flex items-center gap-2 px-8 py-3 bg-gradient-to-r ${theme.gradients.primary} hover:from-orange-600 hover:to-orange-700 text-white rounded-lg font-semibold shadow-md hover:shadow-lg transition-all`}
            >
              Call Now
            </a>
          </div>
        </div>
      </div>
    </section>
  );
};

export default ContactSection;