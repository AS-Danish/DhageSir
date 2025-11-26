"use client";

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  LayoutDashboard,
  FileText, 
  BookOpen, 
  Video, 
  FolderOpen, 
  Image,
  X,
  ChevronRight,
  LogOut,
  Settings,
  ChevronLeft
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';

export default function Sidebar({ sidebarOpen, setSidebarOpen, collapsed, setCollapsed }) {
  const pathname = usePathname();
  const { signOut } = useAuth(); // ✅ Move this INSIDE the component

  const menuItems = [
    { 
      name: 'Dashboard', 
      icon: LayoutDashboard, 
      href: '/admin',
      color: 'text-orange-600'
    },
    { 
      name: 'Articles', 
      icon: FileText, 
      href: '/admin/article-management',
      color: 'text-blue-600'
    },
    { 
      name: 'Books', 
      icon: BookOpen, 
      href: '/admin/books-management',
      color: 'text-green-600'
    },
    { 
      name: 'Videos', 
      icon: Video, 
      href: '/admin/video-management',
      color: 'text-purple-600'
    },
    { 
      name: 'Podcasts', 
      icon: Video, 
      href: '/admin/podcast-management',
      color: 'text-purple-600'
    },
    { 
      name: 'Study Materials', 
      icon: FolderOpen, 
      href: '/admin/study-materials-management',
      color: 'text-orange-600'
    },
    { 
      name: 'Images', 
      icon: Image, 
      href: '/admin/gallery-management',
      color: 'text-pink-600'
    },
  ];

  const isActive = (href) => {
    if (href === '/admin') {
      return pathname === href;
    }
    return pathname.startsWith(href);
  };

  const handleSignOut = async () => {
    try {
      await signOut();
      // Optional: You can add a redirect here if needed
      // router.push('/login');
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  return (
    <>
      {/* Overlay for mobile */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 bg-gray-900/50 z-40 transition-opacity lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside className={`
        fixed top-0 left-0 h-screen bg-white border-r-2 border-gray-100 z-50
        transform transition-all duration-300 ease-in-out
        ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}
        lg:translate-x-0
        ${collapsed ? 'lg:w-20 w-64' : 'w-64'}
      `}>
        <div className="flex flex-col h-full">
          {/* Logo & Close/Collapse Button */}
          <div className={`h-20 px-4 border-b-2 border-gray-100 flex items-center ${collapsed ? 'justify-center' : 'justify-between'} flex-shrink-0`}>
            {/* Logo - Hidden when collapsed */}
            <div className={`transition-all duration-300 ${collapsed ? 'opacity-0 w-0 overflow-hidden' : 'opacity-100'}`}>
              <h1 className="text-xl font-black whitespace-nowrap">
                Defense <span className="bg-gradient-to-r from-orange-500 to-orange-600 bg-clip-text text-transparent">Admin</span>
              </h1>
            </div>
            
            {/* Mobile Close Button */}
            <button
              onClick={() => setSidebarOpen(false)}
              className="lg:hidden p-2 hover:bg-gray-100 rounded-lg transition-colors flex-shrink-0"
            >
              <X className="w-5 h-5 text-gray-600" />
            </button>

            {/* Desktop Collapse/Expand Button */}
            <button
              onClick={() => setCollapsed(!collapsed)}
              className="hidden lg:flex p-2 hover:bg-orange-50 rounded-lg transition-colors flex-shrink-0"
            >
              {collapsed ? (
                <ChevronRight className="w-5 h-5 text-orange-600" />
              ) : (
                <ChevronLeft className="w-5 h-5 text-orange-600" />
              )}
            </button>
          </div>

          {/* Navigation */}
          <nav className="flex-1 p-3 overflow-y-auto">
            <div className="space-y-1">
              {menuItems.map((item) => {
                const Icon = item.icon;
                const active = isActive(item.href);
                
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setSidebarOpen(false)}
                    className={`
                      flex items-center rounded-xl font-semibold text-sm
                      transition-all duration-300 group relative overflow-hidden
                      ${collapsed ? 'justify-center px-3 py-3' : 'gap-3 px-4 py-3'}
                      ${active 
                        ? 'bg-gradient-to-r from-orange-500 to-orange-600 text-white shadow-lg scale-105' 
                        : 'text-gray-700 hover:bg-gray-100 hover:scale-105 hover:shadow-md'
                      }
                    `}
                  >
                    {/* Active indicator - left bar */}
                    {active && !collapsed && (
                      <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-8 bg-white rounded-r-full" />
                    )}
                    
                    {/* Icon */}
                    <div className={`flex-shrink-0 transition-transform duration-300 ${active ? '' : 'group-hover:scale-110'}`}>
                      <Icon className={`w-5 h-5 ${active ? 'text-white' : item.color}`} />
                    </div>
                    
                    {/* Text - Hidden when collapsed */}
                    <span className={`transition-all duration-300 whitespace-nowrap ${collapsed ? 'opacity-0 w-0 overflow-hidden' : 'opacity-100 flex-1'}`}>
                      {item.name}
                    </span>
                    
                    {/* Arrow for active item */}
                    {active && !collapsed && (
                      <ChevronRight className="w-4 h-4 flex-shrink-0" />
                    )}

                    {/* Tooltip for collapsed state - Desktop only */}
                    {collapsed && (
                      <div className="hidden lg:block absolute left-full ml-4 px-3 py-2 bg-gray-900 text-white text-xs font-semibold rounded-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all whitespace-nowrap z-[60] pointer-events-none">
                        {item.name}
                        <div className="absolute left-0 top-1/2 -translate-x-1.5 -translate-y-1/2 w-2 h-2 bg-gray-900 rotate-45"></div>
                      </div>
                    )}
                  </Link>
                );
              })}
            </div>

            {/* Settings Section */}
            <div className={`mt-4 pt-4 border-t-2 border-gray-100 ${collapsed ? '' : ''}`}>
              <Link
                href="/admin/settings"
                className={`
                  flex items-center rounded-xl font-semibold text-sm text-gray-700 
                  transition-all duration-300 group relative overflow-hidden
                  hover:bg-gray-100 hover:scale-105 hover:shadow-md
                  ${collapsed ? 'justify-center px-3 py-3' : 'gap-3 px-4 py-3'}
                `}
              >
                <div className="flex-shrink-0 transition-transform duration-300 group-hover:scale-110">
                  <Settings className="w-5 h-5 text-gray-500" />
                </div>
                <span className={`transition-all duration-300 whitespace-nowrap ${collapsed ? 'opacity-0 w-0 overflow-hidden' : 'opacity-100'}`}>
                  Settings
                </span>

                {/* Tooltip for collapsed state */}
                {collapsed && (
                  <div className="hidden lg:block absolute left-full ml-4 px-3 py-2 bg-gray-900 text-white text-xs font-semibold rounded-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all whitespace-nowrap z-[60] pointer-events-none">
                    Settings
                    <div className="absolute left-0 top-1/2 -translate-x-1.5 -translate-y-1/2 w-2 h-2 bg-gray-900 rotate-45"></div>
                  </div>
                )}
              </Link>
            </div>
          </nav>

          {/* Footer - Logout */}
          <div className="p-3 border-t-2 border-gray-100 flex-shrink-0">
            <button 
              onClick={handleSignOut}
              className={`
                w-full flex items-center rounded-xl font-semibold text-sm text-red-600 
                transition-all duration-300 group relative overflow-hidden
                hover:bg-red-50 hover:scale-105 hover:shadow-md
                ${collapsed ? 'justify-center px-3 py-3' : 'gap-3 px-4 py-3'}
              `}
            >
              <div className="flex-shrink-0 transition-transform duration-300 group-hover:scale-110">
                <LogOut className="w-5 h-5" />
              </div>
              <span className={`transition-all duration-300 whitespace-nowrap ${collapsed ? 'opacity-0 w-0 overflow-hidden' : 'opacity-100'}`}>
                Logout
              </span>

              {/* Tooltip for collapsed state */}
              {collapsed && (
                <div className="hidden lg:block absolute left-full ml-4 px-3 py-2 bg-gray-900 text-white text-xs font-semibold rounded-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all whitespace-nowrap z-[60] pointer-events-none">
                  Logout
                  <div className="absolute left-0 top-1/2 -translate-x-1.5 -translate-y-1/2 w-2 h-2 bg-gray-900 rotate-45"></div>
                </div>
              )}
            </button>
          </div>
        </div>
      </aside>
    </>
  );
}