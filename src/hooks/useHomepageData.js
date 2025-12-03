import { useState, useEffect } from 'react';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../firebase/firebaseConfig';

const CACHE_KEY = 'homepage_data_cache';
const CACHE_TIMESTAMP_KEY = 'homepage_data_cache_timestamp';
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

export const useHomepageData = () => {
  const [homepageData, setHomepageData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const getCachedData = () => {
    try {
      const cached = localStorage.getItem(CACHE_KEY);
      const timestamp = localStorage.getItem(CACHE_TIMESTAMP_KEY);

      if (cached && timestamp) {
        const age = Date.now() - parseInt(timestamp);
        if (age < CACHE_DURATION) {
          return JSON.parse(cached);
        }
      }
    } catch (error) {
      console.error('Cache read error:', error);
    }
    return null;
  };

  const setCachedData = (data) => {
    try {
      localStorage.setItem(CACHE_KEY, JSON.stringify(data));
      localStorage.setItem(CACHE_TIMESTAMP_KEY, Date.now().toString());
    } catch (error) {
      console.error('Cache write error:', error);
    }
  };

  const fetchHomepageData = async (useCache = true) => {
    try {
      setLoading(true);
      setError(null);

      // Check cache first
      if (useCache) {
        const cached = getCachedData();
        if (cached) {
          console.log('📦 Loading homepage data from cache');
          setHomepageData(cached);
          setLoading(false);
          return;
        }
      }

      // Fetch from Firebase
      console.log('🔄 Fetching homepage data from Firebase');
      const homepageDocRef = doc(db, "homepage", "homepage");
      const homepageDoc = await getDoc(homepageDocRef);

      if (!homepageDoc.exists()) {
        console.log('No homepage document found');
        setHomepageData(null);
        setLoading(false);
        return;
      }

      const data = homepageDoc.data();
      setHomepageData(data);
      setCachedData(data);
      
      console.log('✅ Homepage data loaded and cached successfully');
    } catch (err) {
      console.error('Error fetching homepage data:', err);
      setError('Failed to load homepage data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHomepageData();
  }, []);

  return { homepageData, loading, error, refetch: () => fetchHomepageData(false) };
};