"use client";

import React, { useState, useEffect, useCallback } from 'react';
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
  ChevronLeft,
  Upload,
  Download,
  Loader2,
  User
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { db, storage } from '@/firebase/firebaseConfig';

export default function Sidebar({ sidebarOpen, setSidebarOpen, collapsed, setCollapsed }) {
  const pathname = usePathname();
  const { signOut } = useAuth();
  const [showResumeModal, setShowResumeModal] = useState(false);
  // resumeUrl and resumeFileName are no longer needed for preview, but kept for upload state update
  const [resumeUrl, setResumeUrl] = useState(null); 
  const [resumeFileName, setResumeFileName] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [loading, setLoading] = useState(false);
  // State to determine if a resume exists, fetched only when modal opens 
  const [resumeExists, setResumeExists] = useState(false); 


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

  // Function to check if a resume exists (runs when modal opens)
  const checkResumeExistence = useCallback(async () => {
    setLoading(true);
    try {
      const resumeDoc = await getDoc(doc(db, 'resume', 'resume'));
      if (resumeDoc.exists()) {
        const data = resumeDoc.data();
        // Update states for display purposes (file name only)
        setResumeFileName(data.fileName || 'current_resume.pdf');
        setResumeUrl(data.url); // Keep URL in state for immediate use in download
        setResumeExists(true);
      } else {
        setResumeExists(false);
        setResumeFileName(null);
        setResumeUrl(null);
      }
    } catch (error) {
      console.error('Error checking resume existence:', error);
      setResumeExists(false);
    } finally {
      setLoading(false);
    }
  }, []);

  // ONLY Check for existence when modal opens, NOT fetch the file URL for iframe preview.
  // We keep the URL in state to make the DOWNLOAD button fast.
  useEffect(() => {
    if (showResumeModal) {
      checkResumeExistence();
    } else {
      // Reset state when modal closes
      setResumeExists(false);
      setResumeFileName(null);
      setResumeUrl(null);
      setLoading(false);
    }
  }, [showResumeModal, checkResumeExistence]);

  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Validation remains the same
    const validTypes = ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
    if (!validTypes.includes(file.type)) {
      alert('Please upload a PDF or Word document');
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      alert('File size should be less than 5MB');
      return;
    }

    setUploading(true);
    try {
      const storageRef = ref(storage, `resume/resume.${file.name.split('.').pop()}`);
      await uploadBytes(storageRef, file);
      const downloadURL = await getDownloadURL(storageRef);

      await setDoc(doc(db, 'resume', 'resume'), {
        url: downloadURL,
        uploadedAt: new Date().toISOString(),
        fileName: file.name
      });

      // Update states immediately after upload
      setResumeUrl(downloadURL);
      setResumeFileName(file.name);
      setResumeExists(true);
      alert('Resume uploaded successfully!');
    } catch (error) {
      console.error('Error uploading resume:', error);
      alert('Failed to upload resume. Please try again.');
    } finally {
      setUploading(false);
    }
  };

  // This is the ONLY function that now triggers the resume URL access/download
  const handleDownload = () => {
    if (resumeUrl) {
        // Open the URL in a new tab, which triggers the download prompt 
        // or a native PDF viewer, but only when this button is clicked.
        window.open(resumeUrl, '_blank'); 
    } else {
        alert('Resume URL not found. Please try reloading the modal or uploading a file.');
    }
  }

  const isActive = (href) => {
    if (href === '/admin') {
      return pathname === href;
    }
    return pathname.startsWith(href);
  };

  const handleSignOut = async () => {
    try {
      await signOut();
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

      {/* Resume Modal */}
      {showResumeModal && (
        <div className="fixed inset-0 bg-black/50 z-[100] flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] flex flex-col">
            {/* Modal Header */}
            <div className="flex items-center justify-between p-6 border-b">
              <h2 className="text-2xl font-bold text-gray-900">Resume Management</h2>
              <button
                onClick={() => setShowResumeModal(false)}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <X className="w-6 h-6 text-gray-600" />
              </button>
            </div>

            {/* Modal Content */}
            <div className="flex-1 overflow-y-auto p-6">
              {loading ? (
                <div className="flex items-center justify-center h-64">
                  <Loader2 className="w-8 h-8 animate-spin text-orange-600" />
                </div>
              ) : resumeExists && resumeFileName ? (
                <div className="space-y-6">
                  {/* Current Resume Download Section (NO PREVIEW IFRAME) */}
                  <div className="bg-gradient-to-br from-orange-50 to-orange-100 rounded-xl p-6 border-2 border-orange-200 flex flex-col items-center">
                    <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                      <FileText className="w-6 h-6 text-orange-600" />
                      Current Resume Available
                    </h3>
                    <p className="text-md font-medium text-gray-700 mb-4">File: {resumeFileName}</p>
                    
                    {/* Dedicated Download Button */}
                    <button
                        onClick={handleDownload}
                        className="flex items-center gap-2 px-6 py-3 bg-orange-600 text-white font-semibold rounded-lg hover:bg-orange-700 transition-colors shadow-lg"
                    >
                        <Download className="w-5 h-5" />
                        Download Current Resume
                    </button>
                    <p className="text-xs text-gray-500 mt-2">
                        *Note: Clicking download initiates the file transfer. No preview is shown.
                    </p>
                  </div>

                  {/* Upload New Resume */}
                  <div className="bg-gray-50 rounded-xl p-6 border-2 border-gray-200">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                      <Upload className="w-5 h-5 text-gray-600" />
                      Upload New Resume (will replace current file)
                    </h3>
                    <div className="space-y-3">
                      <input
                        type="file"
                        accept=".pdf,.doc,.docx"
                        onChange={handleFileUpload}
                        disabled={uploading}
                        className="block w-full text-sm text-gray-600 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-orange-50 file:text-orange-600 hover:file:bg-orange-100 file:cursor-pointer cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                      />
                      <p className="text-xs text-gray-500">
                        Accepted formats: PDF, DOC, DOCX (Max size: 5MB)
                      </p>
                      {uploading && (
                        <div className="flex items-center gap-2 text-sm text-orange-600">
                          <Loader2 className="w-4 h-4 animate-spin" />
                          Uploading resume...
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center h-64 space-y-4">
                  <User className="w-16 h-16 text-gray-300" />
                  <p className="text-gray-500 font-medium">No resume uploaded yet</p>
                  <div className="w-full max-w-md">
                    <label className="block">
                      <input
                        type="file"
                        accept=".pdf,.doc,.docx"
                        onChange={handleFileUpload}
                        disabled={uploading}
                        className="block w-full text-sm text-gray-600 file:mr-4 file:py-3 file:px-6 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-orange-600 file:text-white hover:file:bg-orange-700 file:cursor-pointer cursor-pointer disabled:opacity-50"
                      />
                    </label>
                    <p className="text-xs text-gray-500 mt-2 text-center">
                      Accepted formats: PDF, DOC, DOCX (Max size: 5MB)
                    </p>
                    {uploading && (
                      <div className="flex items-center justify-center gap-2 text-sm text-orange-600 mt-3">
                        <Loader2 className="w-4 h-4 animate-spin" />
                        Uploading resume...
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Sidebar (Remainder of the code remains identical) */}
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
                    {active && !collapsed && (
                      <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-8 bg-white rounded-r-full" />
                    )}
                    
                    <div className={`flex-shrink-0 transition-transform duration-300 ${active ? '' : 'group-hover:scale-110'}`}>
                      <Icon className={`w-5 h-5 ${active ? 'text-white' : item.color}`} />
                    </div>
                    
                    <span className={`transition-all duration-300 whitespace-nowrap ${collapsed ? 'opacity-0 w-0 overflow-hidden' : 'opacity-100 flex-1'}`}>
                      {item.name}
                    </span>
                    
                    {active && !collapsed && (
                      <ChevronRight className="w-4 h-4 flex-shrink-0" />
                    )}

                    {collapsed && (
                      <div className="hidden lg:block absolute left-full ml-4 px-3 py-2 bg-gray-900 text-white text-xs font-semibold rounded-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all whitespace-nowrap z-[60] pointer-events-none">
                        {item.name}
                        <div className="absolute left-0 top-1/2 -translate-x-1.5 -translate-y-1/2 w-2 h-2 bg-gray-900 rotate-45"></div>
                      </div>
                    )}
                  </Link>
                );
              })}

              {/* Resume Button */}
              <button
                onClick={() => {
                  setShowResumeModal(true);
                  setSidebarOpen(false);
                }}
                className={`
                  w-full flex rounded-xl font-semibold text-sm
                  transition-all duration-300 group relative overflow-hidden
                  text-gray-700 hover:bg-gray-100 hover:scale-105 hover:shadow-md
                  ${collapsed ? 'px-3 py-3' : 'gap-3 px-4 py-3'}
                `}
              >
                <div className="flex-shrink-0 transition-transform duration-300 group-hover:scale-110">
                  <User className="w-5 h-5 text-teal-600" />
                </div>
                
                <span className={`transition-all duration-300 whitespace-nowrap ${collapsed ? 'opacity-0 w-0 overflow-hidden' : 'opacity-100'}`}>
                  Resume
                </span>

                {collapsed && (
                  <div className="hidden lg:block absolute left-full ml-4 px-3 py-2 bg-gray-900 text-white text-xs font-semibold rounded-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all whitespace-nowrap z-[60] pointer-events-none">
                    Resume
                    <div className="absolute left-0 top-1/2 -translate-x-1.5 -translate-y-1/2 w-2 h-2 bg-gray-900 rotate-45"></div>
                  </div>
                )}
              </button>
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