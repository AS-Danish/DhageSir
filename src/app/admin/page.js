"use client";

import React from 'react';
import { 
  FileText, 
  BookOpen, 
  Video, 
  FolderOpen, 
  Image, 
  Podcast
} from 'lucide-react';
import StatCard from '@/components/admin/ui/StatCard';
import { db } from '@/firebase/firebaseConfig';
import { collection, getCountFromServer } from 'firebase/firestore';
import Link from 'next/link';

export default function AdminDashboard() {
  const [counts, setCounts] = React.useState({
    articles: 0,
    books: 0,
    videos: 0,
    podcasts: 0,
    materials: 0,
    images: 0,
  });
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    const fetchCounts = async () => {
      try {
        const [
          articlesSnap, 
          booksSnap, 
          videosSnap, 
          podcastsSnap, 
          materialsSnap, 
          imagesSnap
        ] = await Promise.all([
          getCountFromServer(collection(db, 'articles')),
          getCountFromServer(collection(db, 'books')),
          getCountFromServer(collection(db, 'videos')),
          getCountFromServer(collection(db, 'podcasts')),
          getCountFromServer(collection(db, 'study_materials')),
          getCountFromServer(collection(db, 'gallery'))
        ]);

        setCounts({
          articles: articlesSnap.data().count,
          books: booksSnap.data().count,
          videos: videosSnap.data().count,
          podcasts: podcastsSnap.data().count,
          materials: materialsSnap.data().count,
          images: imagesSnap.data().count,
        });
      } catch (error) {
        console.error("Failed to fetch counts:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchCounts();
  }, []);
  const stats = [
    { 
      title: 'Total Articles', 
      value: loading ? '...' : counts.articles.toString(), 
      change: 'Active',
      trend: 'up',
      icon: FileText,
      color: 'from-blue-500 to-blue-600',
      bgColor: 'bg-blue-50',
      iconColor: 'text-blue-600'
    },
    { 
      title: 'Books Published', 
      value: loading ? '...' : counts.books.toString(), 
      change: 'Active',
      trend: 'up',
      icon: BookOpen,
      color: 'from-green-500 to-green-600',
      bgColor: 'bg-green-50',
      iconColor: 'text-green-600'
    },
    { 
      title: 'Videos', 
      value: loading ? '...' : counts.videos.toString(), 
      change: 'Active',
      trend: 'up',
      icon: Video,
      color: 'from-purple-500 to-purple-600',
      bgColor: 'bg-purple-50',
      iconColor: 'text-purple-600'
    },
    { 
      title: 'Podcasts', 
      value: loading ? '...' : counts.podcasts.toString(), 
      change: 'Active',
      trend: 'up',
      icon: Podcast,
      color: 'from-purple-500 to-purple-600',
      bgColor: 'bg-purple-50',
      iconColor: 'text-purple-600'
    },
    { 
      title: 'Study Materials', 
      value: loading ? '...' : counts.materials.toString(), 
      change: 'Active',
      trend: 'up',
      icon: FolderOpen,
      color: 'from-orange-500 to-orange-600',
      bgColor: 'bg-orange-50',
      iconColor: 'text-orange-600'
    },
    { 
      title: 'Gallery Images', 
      value: loading ? '...' : counts.images.toString(), 
      change: 'Active',
      trend: 'up',
      icon: Image,
      color: 'from-pink-500 to-pink-600',
      bgColor: 'bg-pink-50',
      iconColor: 'text-pink-600'
    },
  ];

  const quickActions = [
    { label: 'Manage Articles', icon: FileText, color: 'from-blue-500 to-blue-600', href: '/admin/article-management' },
    { label: 'Manage Books', icon: BookOpen, color: 'from-green-500 to-green-600', href: '/admin/books-management' },
    { label: 'Manage Videos', icon: Video, color: 'from-purple-500 to-purple-600', href: '/admin/video-management' },
    { label: 'Manage Materials', icon: FolderOpen, color: 'from-orange-500 to-orange-600', href: '/admin/study-materials-management' },
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
          <StatCard
            key={index}
            title={stat.title}
            value={stat.value}
            change={stat.change}
            trend={stat.trend}
            icon={stat.icon}
            colorClass={stat.color}
            bgColorClass={stat.bgColor}
            iconColorClass={stat.iconColor}
          />
        ))}
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {quickActions.map((action, index) => (
          <Link
            key={index}
            href={action.href}
            className="p-4 bg-white rounded-xl shadow-lg border-2 border-gray-100 hover:border-orange-200 hover:shadow-xl transition-all hover:scale-105 group"
          >
            <div className={`w-12 h-12 bg-gradient-to-br ${action.color} rounded-xl flex items-center justify-center mb-3 group-hover:scale-110 transition-transform mx-auto`}>
              <action.icon className="w-6 h-6 text-white" />
            </div>
            <p className="text-sm font-bold text-gray-900 text-center">{action.label}</p>
          </Link>
        ))}
      </div>
    </div>
  );
}