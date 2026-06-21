import { useEffect } from 'react';
import { useAppStore } from '../store/useAppStore';

export const useHomepageData = () => {
  const { homepageData, loading, error, fetchHomepageData } = useAppStore();

  useEffect(() => {
    // Only fetch if data is not already loaded
    if (!homepageData && !loading) {
      fetchHomepageData();
    }
  }, [homepageData, loading, fetchHomepageData]);

  return { 
    homepageData, 
    loading, 
    error, 
    refetch: () => fetchHomepageData(true) 
  };
};