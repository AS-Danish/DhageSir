import React from 'react';
import { 
  Mail, 
  Phone, 
  MapPin, 
  Facebook, 
  Twitter, 
  Instagram, 
  Linkedin, 
  Youtube,
  ArrowRight,
  Clock,
  Heart
} from 'lucide-react';

const Footer = () => {
  const quickLinks = [
    { name: 'Home', href: '#' },
    { name: 'About Us', href: '#' },
    { name: 'Courses', href: '#' },
    { name: 'Success Stories', href: '#' },
    { name: 'Blog & Articles', href: '#' },
    { name: 'Contact', href: '#' },
  ];

  const resources = [
    { name: 'Study Materials', href: '#' },
    { name: 'Mock Tests', href: '#' },
    { name: 'Previous Papers', href: '#' },
    { name: 'Video Lectures', href: '#' },
    { name: 'Career Guidance', href: '#' },
    { name: 'FAQ', href: '#' },
  ];

  const socialLinks = [
    { icon: Facebook, href: '#', label: 'Facebook', color: 'hover:bg-blue-600' },
    { icon: Twitter, href: '#', label: 'Twitter', color: 'hover:bg-sky-500' },
    { icon: Instagram, href: '#', label: 'Instagram', color: 'hover:bg-pink-600' },
    { icon: Linkedin, href: '#', label: 'LinkedIn', color: 'hover:bg-blue-700' },
    { icon: Youtube, href: '#', label: 'YouTube', color: 'hover:bg-red-600' },
  ];

  return (
    <footer className="bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 text-white relative overflow-hidden">
      {/* Background Decorative Elements */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-br from-orange-600/10 to-purple-600/10 rounded-full filter blur-3xl"></div>
      <div className="absolute bottom-0 left-0 w-96 h-96 bg-gradient-to-tr from-blue-600/10 to-cyan-600/10 rounded-full filter blur-3xl"></div>

      {/* Main Footer Content */}
      <div className="container mx-auto px-4 max-w-7xl py-16 relative z-10">
        <div className="grid md:grid-cols-2 lg:grid-cols-10 gap-12 mb-12">
          
          {/* About Section - Left */}
          <div className="lg:col-span-4">
            <div className="mb-6">
              <h3 className="text-3xl font-black mb-2">
                Defense <span className="bg-gradient-to-r from-orange-400 to-orange-600 bg-clip-text text-transparent">Academy</span>
              </h3>
              <div className="h-1 w-20 bg-gradient-to-r from-orange-500 to-orange-600 rounded-full"></div>
            </div>
            
            <p className="text-gray-300 leading-relaxed mb-6">
              Empowering aspirants to achieve their dreams of serving the nation. With over 15 years of excellence in defense exam preparation, we've helped thousands realize their ambitions.
            </p>

            {/* Contact Info */}
            <div className="space-y-3 mb-6">
              <div className="flex items-start gap-3 group cursor-pointer">
                <div className="w-10 h-10 bg-gradient-to-br from-orange-500/20 to-orange-600/20 rounded-lg flex items-center justify-center group-hover:from-orange-500 group-hover:to-orange-600 transition-all">
                  <MapPin className="w-5 h-5 text-orange-400 group-hover:text-white transition-colors" />
                </div>
                <div>
                  <div className="text-sm font-semibold text-gray-200">Location</div>
                  <div className="text-sm text-gray-400">Aurangabad, Maharashtra, IN</div>
                </div>
              </div>

              <div className="flex items-start gap-3 group cursor-pointer">
                <div className="w-10 h-10 bg-gradient-to-br from-orange-500/20 to-orange-600/20 rounded-lg flex items-center justify-center group-hover:from-orange-500 group-hover:to-orange-600 transition-all">
                  <Mail className="w-5 h-5 text-orange-400 group-hover:text-white transition-colors" />
                </div>
                <div>
                  <div className="text-sm font-semibold text-gray-200">Email</div>
                  <div className="text-sm text-gray-400">contact@defenseacademy.com</div>
                </div>
              </div>

              <div className="flex items-start gap-3 group cursor-pointer">
                <div className="w-10 h-10 bg-gradient-to-br from-orange-500/20 to-orange-600/20 rounded-lg flex items-center justify-center group-hover:from-orange-500 group-hover:to-orange-600 transition-all">
                  <Phone className="w-5 h-5 text-orange-400 group-hover:text-white transition-colors" />
                </div>
                <div>
                  <div className="text-sm font-semibold text-gray-200">Phone</div>
                  <div className="text-sm text-gray-400">+91 98765 43210</div>
                </div>
              </div>
            </div>
          </div>

          {/* Quick Links - Center */}
          <div className="lg:col-span-3">
            <h4 className="text-lg font-black text-white mb-6 flex items-center gap-2">
              <div className="w-1 h-6 bg-gradient-to-b from-orange-500 to-orange-600 rounded-full"></div>
              Quick Links
            </h4>
            <ul className="space-y-3">
              {quickLinks.map((link, index) => (
                <li key={index}>
                  <a 
                    href={link.href}
                    className="text-gray-400 hover:text-orange-400 transition-colors flex items-center gap-2 group"
                  >
                    <ArrowRight className="w-4 h-4 opacity-0 -ml-6 group-hover:opacity-100 group-hover:ml-0 transition-all" />
                    {link.name}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Resources */}
          <div className="lg:col-span-3">
            <h4 className="text-lg font-black text-white mb-6 flex items-center gap-2">
              <div className="w-1 h-6 bg-gradient-to-b from-orange-500 to-orange-600 rounded-full"></div>
              Resources
            </h4>
            <ul className="space-y-3">
              {resources.map((link, index) => (
                <li key={index}>
                  <a 
                    href={link.href}
                    className="text-gray-400 hover:text-orange-400 transition-colors flex items-center gap-2 group"
                  >
                    <ArrowRight className="w-4 h-4 opacity-0 -ml-6 group-hover:opacity-100 group-hover:ml-0 transition-all" />
                    {link.name}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Social Section - Full Width Below */}
        <div className="border-t border-gray-700/50 pt-12 mb-12">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-8">
            <div>
              <h4 className="text-lg font-black text-white mb-4 flex items-center gap-2">
                <div className="w-1 h-6 bg-gradient-to-b from-orange-500 to-orange-600 rounded-full"></div>
                Follow Us
              </h4>
              <p className="text-gray-400 text-sm mb-4 max-w-md">
                Stay updated with our latest courses, success stories, and defense exam preparation tips.
              </p>
            </div>

            {/* Social Links */}
            <div className="flex gap-3">
              {socialLinks.map((social, index) => (
                <a
                  key={index}
                  href={social.href}
                  aria-label={social.label}
                  className={`w-12 h-12 bg-gray-800/50 rounded-xl flex items-center justify-center ${social.color} transition-all hover:scale-110 shadow-lg group border border-gray-700/50`}
                >
                  <social.icon className="w-5 h-5 text-gray-400 group-hover:text-white transition-colors" />
                </a>
              ))}
            </div>

            {/* Office Hours */}
            <div className="p-4 bg-gradient-to-br from-orange-500/5 to-orange-600/5 rounded-xl border border-orange-500/10">
              <div className="flex items-start gap-3">
                <Clock className="w-5 h-5 text-orange-400 mt-1 flex-shrink-0" />
                <div>
                  <div className="text-sm font-bold text-white mb-1">Office Hours</div>
                  <div className="text-xs text-gray-400">Mon - Sat: 9:00 AM - 6:00 PM</div>
                  <div className="text-xs text-gray-400">Sunday: Closed</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-gray-700/50 pt-8">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="text-gray-400 text-sm text-center md:text-left">
              © 2025 Defense Academy. All rights reserved. Built with{' '}
              <Heart className="w-4 h-4 inline text-red-500" /> for our nation's defenders.
            </div>
            
            <div className="flex items-center gap-6 text-sm">
              <a href="#" className="text-gray-400 hover:text-orange-400 transition-colors">Privacy Policy</a>
              <span className="text-gray-700">|</span>
              <a href="#" className="text-gray-400 hover:text-orange-400 transition-colors">Terms of Service</a>
              <span className="text-gray-700">|</span>
              <a href="#" className="text-gray-400 hover:text-orange-400 transition-colors">Cookie Policy</a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;