"use client"
import React, { useState } from 'react';
import { 
    Mail, 
    Phone, 
    Send, 
    MessageCircle, 
    CheckCircle, 
    AlertCircle, 
    // --- NEW SOCIAL ICONS IMPORTED ---
    Facebook, 
    Instagram, 
    Twitter, 
    Linkedin,
    Youtube,
    // --- END NEW SOCIAL ICONS IMPORTED ---
} from 'lucide-react';
import { SiWhatsapp } from 'react-icons/si';
import { useLanguage } from '../context/LanguageContext';

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
    const { t } = useLanguage();
    
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        phone: '',
        message: ''
    });

    const [status, setStatus] = useState({
        loading: false,
        success: false,
        error: null
    });

    const handleSubmit = async (e) => {
        e.preventDefault();
        setStatus({ loading: true, success: false, error: null });

        try {
            const response = await fetch('/api/send-email', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(formData),
            });

            const data = await response.json();

            if (response.ok) {
                setStatus({ loading: false, success: true, error: null });
                setFormData({ name: '', email: '', phone: '', message: '' });
                
                setTimeout(() => {
                    setStatus({ loading: false, success: false, error: null });
                }, 5000);
            } else {
                throw new Error(data.error || 'Failed to send message');
            }
        } catch (error) {
            setStatus({ 
                loading: false, 
                success: false, 
                error: error.message || t.messageFailed || 'Failed to send message. Please try again.' 
            });
        }
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
            label: t.phoneNumber,
            value: "+91 98222 42782",
            link: "tel:+919822242782",
            gradient: theme.iconGradients.phone
        },
        {
            icon: Mail,
            label: t.emailAddress,
            value: "drsatishdhage@gmail.com",
            link: "mailto:drsatishdhage@gmail.com",
            gradient: theme.iconGradients.email
        },
    ];

    // UPDATED socialLinks array with Icon components
    const socialLinks = [
        {
            name: t.facebook,
            icon: Facebook, // Added Icon
            url: "https://www.facebook.com/satish.dhage.7/",
            bgColor: "bg-gradient-to-br from-blue-600 to-blue-700",
            hoverColor: "hover:from-blue-700 hover:to-blue-800",
        },
        {
            name: t.instagram,
            icon: Instagram, // Added Icon
            url: "https://www.instagram.com/drsatishdhage/?hl=en",
            bgColor: "bg-gradient-to-br from-pink-500 via-purple-500 to-orange-500",
            hoverColor: "hover:from-pink-600 hover:via-purple-600 hover:to-orange-600",
        },
        {
            name: t.twitter,
            icon: Twitter, // Added Icon
            url: "https://x.com/drsatishdhage",
            bgColor: "bg-gradient-to-br from-gray-800 to-gray-900",
            hoverColor: "hover:from-gray-900 hover:to-black",
        },
        {
            name: t.whatsapp,
            icon: SiWhatsapp, // Used Smartphone or MessageCircle
            url: "https://wa.me/918698340084",
            bgColor: "bg-gradient-to-br from-green-500 to-emerald-600",
            hoverColor: "hover:from-green-600 hover:to-emerald-700",
        },
        {
            name: t.youtube1,
            icon: Youtube, // Added Icon
            url: "https://www.youtube.com/@TheMentorsForum",
            bgColor: "bg-gradient-to-br from-red-600 to-red-700",
            hoverColor: "hover:from-red-700 hover:to-red-800",
        },
        {
            name: t.youtube2,
            icon: Youtube, // Added Icon
            url: "https://www.youtube.com/@drsatishdhage",
            bgColor: "bg-gradient-to-br from-red-600 to-red-700",
            hoverColor: "hover:from-red-700 hover:to-red-800",
        },
        {
            name: t.linkedin,
            icon: Linkedin, // Added Icon
            url: "https://www.linkedin.com/in/lt-col-dr-satish-dhage-2a9594110/",
            bgColor: "bg-gradient-to-br from-blue-700 to-blue-800",
            hoverColor: "hover:from-blue-800 hover:to-blue-900",
        }
    ];

    return (
        <section className="py-16 md:py-20 bg-white relative overflow-hidden" id='contact'>
            {/* Background Decorative Elements */}
            <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-orange-50 rounded-full filter blur-3xl opacity-20"></div>
            <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-amber-50 rounded-full filter blur-3xl opacity-20"></div>
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-gradient-to-r from-orange-50 to-amber-50 rounded-full filter blur-3xl opacity-10"></div>
            
            <div className="container mx-auto px-4 max-w-7xl relative z-10">
                {/* Section Header */}
                <div className="text-center mb-12">
                    <div className={`inline-flex items-center gap-2 px-5 py-2 bg-gradient-to-r ${theme.gradients.primary} text-white rounded-full text-sm font-semibold mb-4 shadow-lg`}>
                        <MessageCircle className="w-4 h-4" />
                        {t.getInTouch}
                    </div>
                    <h2 className="text-4xl md:text-5xl font-black text-gray-900 mb-3">
                        {t.contactUs.split(' ')[0]} <span className={`bg-gradient-to-r ${theme.gradients.primary} bg-clip-text text-transparent`}>{t.contactUs.split(' ').slice(1).join(' ') || 'Us'}</span>
                    </h2>
                    <p className="text-gray-600 text-lg max-w-2xl mx-auto">
                        {t.contactDescription}
                    </p>
                </div>

                {/* Main Contact Grid */}
                <div className="grid lg:grid-cols-2 gap-12 mb-12">
                    {/* Left Side - Contact Details */}
                    <div>
                        <h3 className="text-2xl font-black text-gray-900 mb-6">{t.contactInformation}</h3>
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
                        <h3 className="text-2xl font-black text-gray-900 mb-6">{t.sendMessage}</h3>
                        <div className="bg-white rounded-3xl shadow-2xl p-8 border-2 border-gray-100">
                            <div className="space-y-5">
                                <div>
                                    <label className="block text-sm font-bold text-gray-700 mb-2">{t.yourName}</label>
                                    <input 
                                        type="text" 
                                        name="name"
                                        value={formData.name}
                                        onChange={handleChange}
                                        placeholder={t.namePlaceholder}
                                        required
                                        className="text-black w-full px-5 py-4 bg-gray-50 border-2 border-gray-100 rounded-xl focus:border-orange-500 focus:bg-white focus:outline-none transition-all"
                                    />
                                </div>
                                
                                <div>
                                    <label className="block text-sm font-bold text-gray-700 mb-2">{t.emailAddress}</label>
                                    <input 
                                        type="email"
                                        name="email"
                                        value={formData.email}
                                        onChange={handleChange}
                                        placeholder={t.emailPlaceholder}
                                        required
                                        className="text-black w-full px-5 py-4 bg-gray-50 border-2 border-gray-100 rounded-xl focus:border-orange-500 focus:bg-white focus:outline-none transition-all"
                                    />
                                </div>
                                
                                <div>
                                    <label className="block text-sm font-bold text-gray-700 mb-2">{t.phoneLabel}</label>
                                    <input 
                                        type="tel"
                                        name="phone"
                                        value={formData.phone}
                                        onChange={handleChange}
                                        placeholder={t.phonePlaceholder}
                                        className="text-black w-full px-5 py-4 bg-gray-50 border-2 border-gray-100 rounded-xl focus:border-orange-500 focus:bg-white focus:outline-none transition-all"
                                    />
                                </div>
                                
                                <div>
                                    <label className="block text-sm font-bold text-gray-700 mb-2">{t.yourMessage}</label>
                                    <textarea 
                                        name="message"
                                        value={formData.message}
                                        onChange={handleChange}
                                        rows="4"
                                        placeholder={t.messagePlaceholder}
                                        required
                                        className="text-black w-full px-5 py-4 bg-gray-50 border-2 border-gray-100 rounded-xl focus:border-orange-500 focus:bg-white focus:outline-none transition-all resize-none"
                                    ></textarea>
                                </div>

                                {/* Status Messages */}
                                {status.success && (
                                    <div className="flex items-center gap-2 p-4 bg-green-50 border-2 border-green-200 rounded-xl text-green-700">
                                        <CheckCircle className="w-5 h-5 flex-shrink-0" />
                                        <span className="font-semibold">{t.messageSent}</span>
                                    </div>
                                )}

                                {status.error && (
                                    <div className="flex items-center gap-2 p-4 bg-red-50 border-2 border-red-200 rounded-xl text-red-700">
                                        <AlertCircle className="w-5 h-5 flex-shrink-0" />
                                        <span className="font-semibold">{status.error}</span>
                                    </div>
                                )}
                                
                                <button 
                                    type="button"
                                    onClick={handleSubmit}
                                    disabled={status.loading}
                                    className={`w-full bg-gradient-to-r ${theme.gradients.primary} hover:from-orange-600 hover:to-orange-700 text-white rounded-xl py-4 px-6 font-bold hover:shadow-2xl hover:scale-105 transition-all flex items-center justify-center gap-2 group shadow-lg shadow-orange-500/20 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100`}
                                >
                                    {status.loading ? (
                                        <>
                                            <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                            {t.sending}
                                        </>
                                    ) : (
                                        <>
                                            <Send className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                                            {t.sendMessageBtn}
                                        </>
                                    )}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Social Media Section */}
                <div className="bg-gradient-to-br from-gray-50 to-white rounded-2xl p-8 md:p-10 border border-gray-200">
                    <div className="text-center mb-8">
                        <h3 className="text-2xl font-bold text-gray-900 mb-2">{t.connectWithUs}</h3>
                        <p className="text-gray-600">{t.followSocial}</p>
                    </div>

                    {/* Social Links Grid */}
                    <div className="flex flex-wrap items-center justify-center gap-4">
                        {socialLinks.map((social, index) => {
                            const Icon = social.icon; // Get the Icon component
                            return (
                                <a
                                    key={index}
                                    href={social.url}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className={`
                                        ${social.bgColor} ${social.hoverColor} 
                                        rounded-xl px-5 py-3 text-white font-semibold 
                                        shadow-md hover:shadow-lg transition-all 
                                        flex items-center justify-center gap-2 
                                        group hover:scale-105
                                    `} // Added flex utility classes
                                >
                                    <Icon className="w-5 h-5" />
                                    <span className="sr-only">{social.name}</span> {/* Added screen reader only text */}
                                </a>
                            );
                        })}
                    </div>
                </div>
            </div>
        </section>
    );
};

export default ContactSection;