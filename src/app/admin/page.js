"use client";

import React from 'react';
import { 
  FileText, 
  BookOpen, 
  Video, 
  FolderOpen, 
  Image, 
  Eye,
  ArrowUp,
  ArrowDown
} from 'lucide-react';

export default function AdminDashboard() {
  const stats = [
    { 
      title: 'Total Articles', 
      value: '124', 
      change: '+12%',
      trend: 'up',
      icon: FileText,
      color: 'from-blue-500 to-blue-600',
      bgColor: 'bg-blue-50',
      iconColor: 'text-blue-600'
    },
    { 
      title: 'Books Published', 
      value: '45', 
      change: '+5%',
      trend: 'up',
      icon: BookOpen,
      color: 'from-green-500 to-green-600',
      bgColor: 'bg-green-50',
      iconColor: 'text-green-600'
    },
    { 
      title: 'Video Tutorials', 
      value: '89', 
      change: '+18%',
      trend: 'up',
      icon: Video,
      color: 'from-purple-500 to-purple-600',
      bgColor: 'bg-purple-50',
      iconColor: 'text-purple-600'
    },
    { 
      title: 'Study Materials', 
      value: '256', 
      change: '+23%',
      trend: 'up',
      icon: FolderOpen,
      color: 'from-orange-500 to-orange-600',
      bgColor: 'bg-orange-50',
      iconColor: 'text-orange-600'
    },
    { 
      title: 'Total Images', 
      value: '1,234', 
      change: '+45%',
      trend: 'up',
      icon: Image,
      color: 'from-pink-500 to-pink-600',
      bgColor: 'bg-pink-50',
      iconColor: 'text-pink-600'
    },
    { 
      title: 'Total Views', 
      value: '45.2K', 
      change: '-2%',
      trend: 'down',
      icon: Eye,
      color: 'from-cyan-500 to-cyan-600',
      bgColor: 'bg-cyan-50',
      iconColor: 'text-cyan-600'
    },
  ];

  const quickActions = [
    { label: 'Add Article', icon: FileText, color: 'from-blue-500 to-blue-600', href: '/admin/articles' },
    { label: 'Add Book', icon: BookOpen, color: 'from-green-500 to-green-600', href: '/admin/books' },
    { label: 'Upload Video', icon: Video, color: 'from-purple-500 to-purple-600', href: '/admin/videos' },
    { label: 'Add Material', icon: FolderOpen, color: 'from-orange-500 to-orange-600', href: '/admin/study-materials' },
  ];

  return (
    <div>
      {/* Page Header */}
      <div className="mb-8">
        <h1 className="text-3xl md:text-4xl font-black text-gray-900 mb-2">
          Dashboard <span className="bg-gradient-to-r from-orange-500 to-orange-600 bg-clip-text text-transparent">Overview</span>
        </h1>
        <p className="text-gray-600">Welcome back! Here's what's happening with your content.</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
        {stats.map((stat, index) => (
          <div
            key={index}
            className="bg-white rounded-2xl shadow-lg border-2 border-gray-100 p-6 hover:shadow-xl hover:border-orange-200 transition-all hover:scale-105"
          >
            <div className="flex items-start justify-between mb-4">
              <div className={`w-12 h-12 ${stat.bgColor} rounded-xl flex items-center justify-center`}>
                <stat.icon className={`w-6 h-6 ${stat.iconColor}`} />
              </div>
              <span className={`flex items-center gap-1 text-sm font-bold px-3 py-1 rounded-full ${
                stat.trend === 'up' ? 'bg-green-50 text-green-600' : 'bg-red-50 text-red-600'
              }`}>
                {stat.trend === 'up' ? <ArrowUp className="w-4 h-4" /> : <ArrowDown className="w-4 h-4" />}
                {stat.change}
              </span>
            </div>
            <h3 className="text-gray-600 text-sm font-semibold mb-1">{stat.title}</h3>
            <p className="text-3xl font-black text-gray-900">{stat.value}</p>
          </div>
        ))}
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {quickActions.map((action, index) => (
          <button
            key={index}
            className="p-4 bg-white rounded-xl shadow-lg border-2 border-gray-100 hover:border-orange-200 hover:shadow-xl transition-all hover:scale-105 group"
          >
            <div className={`w-12 h-12 bg-gradient-to-br ${action.color} rounded-xl flex items-center justify-center mb-3 group-hover:scale-110 transition-transform mx-auto`}>
              <action.icon className="w-6 h-6 text-white" />
            </div>
            <p className="text-sm font-bold text-gray-900 text-center">{action.label}</p>
          </button>
        ))}
      </div>
    </div>
  );
}