import { create } from 'zustand';
import { doc, getDoc, collection, query, orderBy, limit, getDocs } from 'firebase/firestore';
import { db } from '@/firebase/firebaseConfig';

export const useAppStore = create((set, get) => ({
  homepageData: null,
  loading: false,
  error: null,
  lastFetched: null,

  // Global collections state
  articles: [],
  books: [],
  gallery: [],
  podcasts: [],
  studyMaterials: [],
  videos: [],
  lastFetchedCollections: {},

  fetchHomepageData: async (forceRefetch = false) => {
    const { homepageData, lastFetched, loading } = get();
    
    // Prevent multiple simultaneous fetches
    if (loading) return;

    // Cache for 5 minutes (300000 ms) unless forced
    const now = Date.now();
    if (!forceRefetch && homepageData && lastFetched && (now - lastFetched < 300000)) {
      console.log('📦 Loading homepage data from Zustand cache');
      return homepageData;
    }

    set({ loading: true, error: null });
    
    try {
      console.log('🔄 Fetching homepage data from Firebase');
      const homepageDocRef = doc(db, "homepage", "homepage");
      const homepageDoc = await getDoc(homepageDocRef);

      if (!homepageDoc.exists()) {
        console.log('No homepage document found');
        set({ homepageData: null, loading: false, lastFetched: Date.now() });
        return null;
      }

      const data = homepageDoc.data();
      set({ homepageData: data, loading: false, lastFetched: Date.now() });
      return data;
      
    } catch (error) {
      console.error('Error fetching homepage data:', error);
      set({ error: 'Failed to load homepage data', loading: false });
      return null;
    }
  },

  // Generic function to fetch collections for public pages
  fetchCollection: async (collectionName, stateKey, forceRefetch = false) => {
    const state = get();
    const existingData = state[stateKey];
    const lastFetched = state.lastFetchedCollections[stateKey];
    
    // Cache for 5 minutes
    const now = Date.now();
    if (!forceRefetch && existingData.length > 0 && lastFetched && (now - lastFetched < 300000)) {
      console.log(`📦 Loading ${collectionName} from Zustand cache`);
      return existingData;
    }

    set({ loading: true, error: null });

    try {
      console.log(`🔄 Fetching ${collectionName} from Firebase`);
      const q = query(collection(db, collectionName), orderBy('created_at', 'desc'), limit(100)); // limit to 100 for public pages for performance
      const snapshot = await getDocs(q);
      const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

      set((state) => ({
        [stateKey]: data,
        lastFetchedCollections: { ...state.lastFetchedCollections, [stateKey]: Date.now() },
        loading: false
      }));

      return data;
    } catch (error) {
      console.error(`Error fetching ${collectionName}:`, error);
      set({ error: `Failed to load ${collectionName}`, loading: false });
      return [];
    }
  }
}));
