"use client";
import React, { useState, useEffect } from 'react';
import { FileText, Search, Loader, ChevronDown, Download, File } from 'lucide-react';
import { db } from '../../firebase/firebaseConfig';
import { collection, getDocs, query, orderBy, limit, startAfter } from 'firebase/firestore';

// Theme configuration
const theme = {
  gradients: {
    primary: 'from-orange-500 to-orange-600',
  },
  backgrounds: {
    white: 'bg-white',
  },
  text: {
    primary: 'text-gray-900',
    secondary: 'text-gray-600',
    brand: 'text-orange-600',
  },
  cards: {
    elevated: 'bg-white shadow-xl hover:shadow-2xl',
  },
};

const getButton = (variant = 'primary') => {
  const variants = {
    primary: 'bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white rounded-xl py-4 px-8 font-bold transition-all hover:scale-105 hover:shadow-2xl',
    secondary: 'bg-gray-100 hover:bg-gray-200 text-gray-900 rounded-xl py-3 px-6 font-bold transition-all',
    download: 'bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white rounded-xl py-3 px-6 font-bold transition-all hover:scale-105',
  };
  return variants[variant];
};

const MATERIALS_PER_PAGE = 10;

const AllStudyMaterialsPage = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [materials, setMaterials] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState(null);
  const [lastDoc, setLastDoc] = useState(null);
  const [hasMore, setHasMore] = useState(true);
  const [totalCount, setTotalCount] = useState(0);

  // Format file size
  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
  };

  // Get file icon
  const getFileIcon = (fileType) => {
    if (fileType?.includes('pdf')) {
      return '📄';
    } else if (fileType?.includes('presentation') || fileType?.includes('powerpoint')) {
      return '📊';
    }
    return '📎';
  };

  // Get file type label
  const getFileTypeLabel = (fileType) => {
    if (fileType?.includes('pdf')) {
      return 'PDF';
    } else if (fileType?.includes('presentation') || fileType?.includes('powerpoint')) {
      return 'PowerPoint';
    }
    return 'Document';
  };

  // Fetch initial materials from Firebase with caching
  const fetchMaterialsFromFirebase = async () => {
    try {
      // Check localStorage cache first (5-minute TTL)
      const cachedMaterials = localStorage.getItem('all_materials_cache');
      const cacheTimestamp = localStorage.getItem('all_materials_cache_timestamp');
      
      // Use cache if it's less than 5 minutes old
      if (cachedMaterials && cacheTimestamp) {
        const cacheAge = Date.now() - parseInt(cacheTimestamp);
        if (cacheAge < 5 * 60 * 1000) { // 5 minutes
          console.log('📦 Loading materials from localStorage cache');
          const cachedData = JSON.parse(cachedMaterials);
          setMaterials(cachedData.materials);
          setTotalCount(cachedData.totalCount);
          setLastDoc(cachedData.lastDoc);
          setHasMore(cachedData.hasMore);
          setLoading(false);
          return;
        }
      }
      
      // No valid cache, fetch from Firebase
      await fetchAndCacheMaterials();
    } catch (err) {
      console.error('Error loading materials:', err);
      setError('Failed to load study materials. Please try again later.');
      setLoading(false);
    }
  };

  // Fetch and cache materials from Firebase
  const fetchAndCacheMaterials = async () => {
    try {
      // Get total count (Firebase will use IndexedDB cache when available)
      const countSnapshot = await getDocs(collection(db, "study_materials"));
      const total = countSnapshot.size;
      setTotalCount(total);

      // Query materials with pagination
      const materialsQuery = query(
        collection(db, "study_materials"),
        orderBy("created_at", "desc"),
        limit(MATERIALS_PER_PAGE)
      );
      
      const querySnapshot = await getDocs(materialsQuery);
      
      // Check if data came from Firebase cache or server
      const source = querySnapshot.metadata.fromCache ? 'cache' : 'server';
      console.log(`📦 Materials loaded from ${source}`);
      
      const materialsData = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));

      const lastVisible = querySnapshot.docs[querySnapshot.docs.length - 1];

      // Update state
      setMaterials(materialsData);
      setLastDoc(lastVisible);
      setHasMore(materialsData.length === MATERIALS_PER_PAGE && materialsData.length < total);
      setLoading(false);

      // Cache in localStorage as backup
      const cacheData = {
        materials: materialsData,
        totalCount: total,
        hasMore: materialsData.length === MATERIALS_PER_PAGE && materialsData.length < total,
        lastDoc: lastVisible ? lastVisible.id : null
      };
      localStorage.setItem('all_materials_cache', JSON.stringify(cacheData));
      localStorage.setItem('all_materials_cache_timestamp', Date.now().toString());
      
      console.log('✅ Materials fetched and cached successfully');
    } catch (err) {
      console.error('Error fetching materials from Firebase:', err);
      setError('Failed to load study materials from database.');
      setLoading(false);
    }
  };

  // Load more materials (pagination)
  const loadMoreMaterials = async () => {
    if (!hasMore || loadingMore || !lastDoc) return;

    try {
      setLoadingMore(true);

      const materialsQuery = query(
        collection(db, "study_materials"),
        orderBy("created_at", "desc"),
        startAfter(lastDoc),
        limit(MATERIALS_PER_PAGE)
      );

      const querySnapshot = await getDocs(materialsQuery);
      
      // Check if data came from cache or server
      const source = querySnapshot.metadata.fromCache ? 'cache' : 'server';
      console.log(`📦 More materials loaded from ${source}`);
      
      const newMaterials = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));

      const lastVisible = querySnapshot.docs[querySnapshot.docs.length - 1];

      setMaterials(prev => [...prev, ...newMaterials]);
      setLastDoc(lastVisible);
      setHasMore(newMaterials.length === MATERIALS_PER_PAGE && (materials.length + newMaterials.length) < totalCount);
    } catch (err) {
      console.error('Error loading more materials:', err);
    } finally {
      setLoadingMore(false);
    }
  };

  useEffect(() => {
    fetchMaterialsFromFirebase();
  }, []);

  // Filter materials based on search
  const filteredMaterials = materials.filter(material => {
    if (!searchQuery) return true;
    const search = searchQuery.toLowerCase();
    return (
      material.title?.toLowerCase().includes(search) ||
      material.file_name?.toLowerCase().includes(search)
    );
  });

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 pt-20">
        <div className="flex flex-col items-center justify-center py-40">
          <Loader className="w-16 h-16 text-orange-500 animate-spin mb-4" />
          <p className="text-gray-600 font-semibold text-lg">Loading study materials...</p>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 pt-20">
        <div className="flex flex-col items-center justify-center py-40">
          <FileText className="w-16 h-16 text-gray-300 mb-4" />
          <p className="text-red-600 font-semibold mb-4 text-lg">{error}</p>
          <button 
            onClick={fetchMaterialsFromFirebase}
            className={getButton('primary')}
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pt-20">
      {/* Search Section */}
      <section className="py-8 bg-white border-b-2 border-gray-100 sticky top-0 z-40 shadow-lg">
        <div className="container mx-auto px-4 max-w-7xl">
          <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
            {/* Search */}
            <div className="relative w-full md:w-96">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Search materials..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-12 pr-4 py-3 border-2 border-gray-200 rounded-xl focus:border-orange-500 focus:outline-none transition-colors text-black"
              />
            </div>

            {/* Material Count */}
            <div className="flex items-center gap-2">
              <FileText className="w-6 h-6 text-orange-600" />
              <span className="text-gray-600 font-semibold">
                Total: <span className="text-orange-600 font-bold">{totalCount}</span> materials
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* Materials List */}
      <section className="py-16 md:py-20">
        <div className="container mx-auto px-4 max-w-7xl">
          <div className="flex items-center justify-between mb-8">
            <h2 className={`text-3xl md:text-4xl font-black ${theme.text.primary}`}>
              Study Materials
              <span className={`${theme.text.brand} ml-2`}>({filteredMaterials.length})</span>
            </h2>
          </div>

          <div className="space-y-6">
            {filteredMaterials.map((material, index) => {
              const uniqueKey = `${material.id}-${index}`;
              
              return (
                <div key={uniqueKey} className="group">
                  <div className={`${theme.cards.elevated} rounded-2xl p-6 transition-all duration-300 hover:-translate-y-1`}>
                    <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
                      {/* Left: Icon + Info */}
                      <div className="flex items-start gap-4 flex-1 min-w-0">
                        {/* File Icon */}
                        <div className="w-16 h-16 md:w-20 md:h-20 bg-gradient-to-br from-orange-400 to-orange-600 rounded-2xl flex items-center justify-center text-3xl md:text-4xl flex-shrink-0 shadow-lg">
                          {getFileIcon(material.file_type)}
                        </div>

                        {/* Material Info */}
                        <div className="flex-1 min-w-0">
                          <h3 className="text-xl md:text-2xl font-bold text-gray-900 mb-2 line-clamp-2">
                            {material.title}
                          </h3>
                          <div className="flex flex-wrap items-center gap-2 md:gap-3 text-sm text-gray-600 mb-3">
                            <span className="inline-flex items-center gap-1 px-3 py-1 bg-orange-100 text-orange-700 rounded-full font-semibold text-xs">
                              <File className="w-3 h-3" />
                              {getFileTypeLabel(material.file_type)}
                            </span>
                            <span className="font-semibold text-gray-700">{material.file_name}</span>
                            <span className="hidden md:inline">•</span>
                            <span className="font-semibold text-orange-600">{formatFileSize(material.file_size)}</span>
                          </div>
                          <p className="text-xs text-gray-500">
                            Added on {new Date(material.created_at).toLocaleDateString('en-US', {
                              year: 'numeric',
                              month: 'long',
                              day: 'numeric'
                            })}
                          </p>
                        </div>
                      </div>

                      {/* Right: Download Button */}
                      <div className="w-full md:w-auto flex-shrink-0">
                        <a
                          href={material.file_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className={`w-full md:w-auto inline-flex items-center justify-center gap-2 ${getButton('download')}`}
                        >
                          <Download className="w-5 h-5" />
                          Download
                        </a>
                      </div>
                    </div>

                    {/* Decorative Corner */}
                    <div className="absolute bottom-0 right-0 w-24 h-24 bg-gradient-to-tl from-orange-600/5 to-transparent rounded-tl-full opacity-0 group-hover:opacity-100 transition-opacity"></div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Load More Button */}
          {hasMore && !searchQuery && (
            <div className="text-center mt-12">
              <button
                onClick={loadMoreMaterials}
                disabled={loadingMore}
                className={`inline-flex items-center gap-2 ${getButton('secondary')} disabled:opacity-50`}
              >
                {loadingMore ? (
                  <>
                    <Loader className="w-5 h-5 animate-spin" />
                    Loading...
                  </>
                ) : (
                  <>
                    <ChevronDown className="w-5 h-5" />
                    Load More Materials ({totalCount - materials.length} remaining)
                  </>
                )}
              </button>
            </div>
          )}

          {/* Empty State */}
          {filteredMaterials.length === 0 && (
            <div className="text-center py-20">
              <FileText className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-2xl font-bold text-gray-900 mb-2">No materials found</h3>
              <p className="text-gray-600">
                {searchQuery ? 'Try adjusting your search criteria' : 'No study materials available yet'}
              </p>
            </div>
          )}
        </div>
      </section>
    </div>
  );
};

export default AllStudyMaterialsPage;