"use client";
import React, { useState, useEffect } from 'react';
import { Image, Search, Loader, ChevronDown, ZoomIn, X } from 'lucide-react';
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
  };
  return variants[variant];
};

const IMAGES_PER_PAGE = 12;

const AllImagesPage = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [images, setImages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState(null);
  const [lastDoc, setLastDoc] = useState(null);
  const [hasMore, setHasMore] = useState(true);
  const [totalCount, setTotalCount] = useState(0);
  const [viewingImage, setViewingImage] = useState(null);

  // Fetch initial images from Firebase with caching
  const fetchImagesFromFirebase = async () => {
    try {
      // Check localStorage cache first (5-minute TTL)
      const cachedImages = localStorage.getItem('all_images_cache');
      const cacheTimestamp = localStorage.getItem('all_images_cache_timestamp');
      
      // Use cache if it's less than 5 minutes old
      if (cachedImages && cacheTimestamp) {
        const cacheAge = Date.now() - parseInt(cacheTimestamp);
        if (cacheAge < 5 * 60 * 1000) { // 5 minutes
          console.log('📦 Loading images from localStorage cache');
          const cachedData = JSON.parse(cachedImages);
          setImages(cachedData.images);
          setTotalCount(cachedData.totalCount);
          setLastDoc(cachedData.lastDoc);
          setHasMore(cachedData.hasMore);
          setLoading(false);
          return;
        }
      }
      
      // No valid cache, fetch from Firebase
      await fetchAndCacheImages();
    } catch (err) {
      console.error('Error loading images:', err);
      setError('Failed to load images. Please try again later.');
      setLoading(false);
    }
  };

  // Fetch and cache images from Firebase
  const fetchAndCacheImages = async () => {
    try {
      // Get total count (Firebase will use IndexedDB cache when available)
      const countSnapshot = await getDocs(collection(db, "gallery"));
      const total = countSnapshot.size;
      setTotalCount(total);

      // Query images with pagination
      const imagesQuery = query(
        collection(db, "gallery"),
        orderBy("created_at", "desc"),
        limit(IMAGES_PER_PAGE)
      );
      
      const querySnapshot = await getDocs(imagesQuery);
      
      // Check if data came from Firebase cache or server
      const source = querySnapshot.metadata.fromCache ? 'cache' : 'server';
      console.log(`📦 Images loaded from ${source}`);
      
      const imagesData = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));

      const lastVisible = querySnapshot.docs[querySnapshot.docs.length - 1];

      // Update state
      setImages(imagesData);
      setLastDoc(lastVisible);
      setHasMore(imagesData.length === IMAGES_PER_PAGE && imagesData.length < total);
      setLoading(false);

      // Cache in localStorage as backup
      const cacheData = {
        images: imagesData,
        totalCount: total,
        hasMore: imagesData.length === IMAGES_PER_PAGE && imagesData.length < total,
        lastDoc: lastVisible ? lastVisible.id : null
      };
      localStorage.setItem('all_images_cache', JSON.stringify(cacheData));
      localStorage.setItem('all_images_cache_timestamp', Date.now().toString());
      
      console.log('✅ Images fetched and cached successfully');
    } catch (err) {
      console.error('Error fetching images from Firebase:', err);
      setError('Failed to load images from database.');
      setLoading(false);
    }
  };

  // Load more images (pagination)
  const loadMoreImages = async () => {
    if (!hasMore || loadingMore || !lastDoc) return;

    try {
      setLoadingMore(true);

      const imagesQuery = query(
        collection(db, "gallery"),
        orderBy("created_at", "desc"),
        startAfter(lastDoc),
        limit(IMAGES_PER_PAGE)
      );

      const querySnapshot = await getDocs(imagesQuery);
      
      // Check if data came from cache or server
      const source = querySnapshot.metadata.fromCache ? 'cache' : 'server';
      console.log(`📦 More images loaded from ${source}`);
      
      const newImages = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));

      const lastVisible = querySnapshot.docs[querySnapshot.docs.length - 1];

      setImages(prev => [...prev, ...newImages]);
      setLastDoc(lastVisible);
      setHasMore(newImages.length === IMAGES_PER_PAGE && (images.length + newImages.length) < totalCount);
    } catch (err) {
      console.error('Error loading more images:', err);
    } finally {
      setLoadingMore(false);
    }
  };

  useEffect(() => {
    fetchImagesFromFirebase();
  }, []);

  // Filter images based on search
  const filteredImages = images.filter(image => {
    if (!searchQuery) return true;
    const search = searchQuery.toLowerCase();
    return image.title?.toLowerCase().includes(search);
  });

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 pt-20">
        <div className="flex flex-col items-center justify-center py-40">
          <Loader className="w-16 h-16 text-orange-500 animate-spin mb-4" />
          <p className="text-gray-600 font-semibold text-lg">Loading gallery...</p>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 pt-20">
        <div className="flex flex-col items-center justify-center py-40">
          <Image className="w-16 h-16 text-gray-300 mb-4" />
          <p className="text-red-600 font-semibold mb-4 text-lg">{error}</p>
          <button 
            onClick={fetchImagesFromFirebase}
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
      {/* Image Viewer Modal */}
      {viewingImage && (
        <div 
          className="fixed inset-0 bg-black/80 backdrop-blur-sm bg-opacity-90 z-50 flex items-center justify-center p-4"
          onClick={() => setViewingImage(null)}
        >
          <div className="relative max-w-6xl max-h-[90vh]">
            <button
              onClick={() => setViewingImage(null)}
              className="absolute -top-12 right-0 text-white hover:text-orange-500 transition-colors"
            >
              <X className="w-8 h-8" />
            </button>
            <img
              src={viewingImage.image_url}
              alt={viewingImage.title}
              className="max-w-full max-h-[85vh] object-contain rounded-2xl"
              onClick={(e) => e.stopPropagation()}
              onError={(e) => {
                console.error('Failed to load image:', viewingImage.image_url);
                e.target.src = 'https://via.placeholder.com/800x600/f3f4f6/9ca3af?text=Image+Not+Found';
              }}
            />
            {viewingImage.title && viewingImage.title !== 'Untitled' && (
              <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black to-transparent p-6 rounded-b-2xl">
                <p className="text-white font-bold text-xl">{viewingImage.title}</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Search Section */}
      <section className="py-8 bg-white border-b-2 border-gray-100 sticky top-0 z-40 shadow-lg">
        <div className="container mx-auto px-4 max-w-7xl">
          <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
            {/* Search */}
            <div className="relative w-full md:w-96">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Search images by title..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-12 pr-4 py-3 border-2 border-gray-200 rounded-xl focus:border-orange-500 focus:outline-none transition-colors text-black"
              />
            </div>

            {/* Image Count */}
            <div className="flex items-center gap-2">
              <Image className="w-6 h-6 text-orange-600" />
              <span className="text-gray-600 font-semibold">
                Total: <span className="text-orange-600 font-bold">{totalCount}</span> images
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* Images Grid */}
      <section className="py-16 md:py-20">
        <div className="container mx-auto px-4 max-w-7xl">
          <div className="flex items-center justify-between mb-8">
            <h2 className={`text-3xl md:text-4xl font-black ${theme.text.primary}`}>
              Gallery
              <span className={`${theme.text.brand} ml-2`}>({filteredImages.length})</span>
            </h2>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {filteredImages.map((image, index) => {
              const uniqueKey = `${image.id}-${index}`;
              
              return (
                <div key={uniqueKey} className="group relative">
                  <div className={`${theme.cards.elevated} rounded-2xl overflow-hidden transition-all duration-300 hover:-translate-y-2`}>
                    {/* Image */}
                    <div 
                      className="relative w-full pb-[100%] overflow-hidden bg-gray-100 cursor-pointer"
                      onClick={() => setViewingImage(image)}
                    >
                      <img
                        src={image.image_url}
                        alt={image.title || 'Gallery image'}
                        className="absolute inset-0 w-full h-full object-cover transition-transform group-hover:scale-110"
                        loading="lazy"
                        onError={(e) => {
                          console.error('Failed to load thumbnail:', image.image_url);
                          e.target.style.display = 'none';
                        }}
                      />
                      
                      {/* Zoom overlay on hover */}
                      <div className="absolute inset-0 bg-opacity-0 group-hover:bg-opacity-40 transition-all flex items-center justify-center pointer-events-none">
                        <div className="opacity-0 group-hover:opacity-100 transition-opacity bg-white rounded-full p-3 pointer-events-auto">
                          <ZoomIn className="w-6 h-6 text-gray-900" />
                        </div>
                      </div>

                      {/* Title Badge */}
                      {image.title && image.title !== 'Untitled' && (
                        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black to-transparent p-3">
                          <p className="text-white text-sm font-bold truncate">{image.title}</p>
                        </div>
                      )}
                    </div>

                    {/* Decorative Corner */}
                    <div className="absolute bottom-0 right-0 w-20 h-20 bg-gradient-to-tl from-orange-600/10 to-transparent rounded-tl-full opacity-0 group-hover:opacity-100 transition-opacity"></div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Load More Button */}
          {hasMore && !searchQuery && (
            <div className="text-center mt-12">
              <button
                onClick={loadMoreImages}
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
                    Load More Images ({totalCount - images.length} remaining)
                  </>
                )}
              </button>
            </div>
          )}

          {/* Empty State */}
          {filteredImages.length === 0 && (
            <div className="text-center py-20">
              <Image className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-2xl font-bold text-gray-900 mb-2">No images found</h3>
              <p className="text-gray-600">
                {searchQuery ? 'Try adjusting your search criteria' : 'No images in the gallery yet'}
              </p>
            </div>
          )}
        </div>
      </section>
    </div>
  );
};

export default AllImagesPage;