import { create } from 'zustand';
import { collection, getDocs, query, orderBy, deleteDoc, doc, updateDoc, addDoc } from 'firebase/firestore';
import { db } from '@/firebase/firebaseConfig';

export const useAdminStore = create((set, get) => ({
  // Collections state
  articles: [],
  categories: [],
  books: [],
  gallery: [],
  podcasts: [],
  studyMaterials: [],
  videos: [],
  homepageArticles: [],
  
  // Loading states
  isLoading: false,
  error: null,
  
  // Global pagination & filter state (can be applied per component)
  currentPage: 1,
  itemsPerPage: 10,
  searchQuery: '',

  setPagination: (page, perPage) => set({ currentPage: page, itemsPerPage: perPage || get().itemsPerPage }),
  setSearchQuery: (query) => set({ searchQuery: query }),

  // Generic fetch collection
  fetchCollection: async (collectionName, stateKey) => {
    set({ isLoading: true, error: null });
    try {
      const q = query(collection(db, collectionName), orderBy("created_at", "desc"));
      const querySnapshot = await getDocs(q);
      const data = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      set({ [stateKey]: data, isLoading: false });
      return data;
    } catch (error) {
      console.error(`Error fetching ${collectionName}:`, error);
      set({ error: error.message, isLoading: false });
      throw error;
    }
  },

  // Generic delete document
  deleteDocument: async (collectionName, id, stateKey) => {
    set({ isLoading: true, error: null });
    try {
      await deleteDoc(doc(db, collectionName, id));
      // Optimistic update
      const currentData = get()[stateKey];
      set({ [stateKey]: currentData.filter(item => item.id !== id), isLoading: false });
    } catch (error) {
      console.error(`Error deleting from ${collectionName}:`, error);
      set({ error: error.message, isLoading: false });
      throw error;
    }
  },

  // Generic add document
  addDocument: async (collectionName, data, stateKey) => {
    set({ isLoading: true, error: null });
    try {
      const docRef = await addDoc(collection(db, collectionName), data);
      const newItem = { id: docRef.id, ...data };
      const currentData = get()[stateKey];
      set({ [stateKey]: [newItem, ...currentData], isLoading: false });
      return newItem;
    } catch (error) {
      console.error(`Error adding to ${collectionName}:`, error);
      set({ error: error.message, isLoading: false });
      throw error;
    }
  },

  // Generic update document
  updateDocument: async (collectionName, id, data, stateKey) => {
    set({ isLoading: true, error: null });
    try {
      await updateDoc(doc(db, collectionName, id), data);
      const currentData = get()[stateKey];
      set({
        [stateKey]: currentData.map(item => (item.id === id ? { ...item, ...data } : item)),
        isLoading: false
      });
    } catch (error) {
      console.error(`Error updating ${collectionName}:`, error);
      set({ error: error.message, isLoading: false });
      throw error;
    }
  },
}));
