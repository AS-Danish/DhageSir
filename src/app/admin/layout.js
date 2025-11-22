"use client";

import React, { useState } from 'react';
import Sidebar from '@/components/admin/Sidebar';
import { Menu } from 'lucide-react';
import ProtectedRoute from '@/components/admin/ProtectedRoutes';

export default function AdminLayout({ children }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [collapsed, setCollapsed] = useState(false);

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gray-50">
        <div className="flex">
          {/* Sidebar */}
          <Sidebar 
            sidebarOpen={sidebarOpen} 
            setSidebarOpen={setSidebarOpen}
            collapsed={collapsed}
            setCollapsed={setCollapsed}
          />
          
          {/* Main Content Area */}
          <div className={`
            flex-1 min-h-screen transition-all duration-300
            ${collapsed ? 'lg:ml-20' : 'lg:ml-64'}
          `}>
            {/* Mobile Header with Menu Button */}
            <header className="lg:hidden sticky top-0 z-30 bg-white border-b-2 border-gray-100 px-4 py-4 flex items-center justify-between">
              <h1 className="text-lg font-black">
                Defense <span className="bg-gradient-to-r from-orange-500 to-orange-600 bg-clip-text text-transparent">Admin</span>
              </h1>
              <button
                onClick={() => setSidebarOpen(true)}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <Menu className="w-6 h-6 text-gray-700" />
              </button>
            </header>

            {/* Main Content */}
            <main className="p-4 md:p-6 lg:p-8">
              {children}
            </main>
          </div>
        </div>
      </div>
    </ProtectedRoute>
  );
}