import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'
import { mockMovies } from '../data/mockData'
import { authAPI } from '../services/api'
import { io } from 'socket.io-client'

// Socket.io Connection
const socket = io(import.meta.env.PROD 
  ? 'https://your-streamx-backend.onrender.com' // <--- PUT YOUR BACKEND URL HERE (No /api)
  : 'http://localhost:5000', 
  {
    autoConnect: true,
    reconnection: true,
  })

// Instant Listener Attachment (Fixes racing condition)
socket.on('connect', () => {
    console.log('🟢 Socket connected:', socket.id)
})

export const useStore = create(
  persist(
    (set, get) => {
      
      // Bind listeners immediately to store setter
      socket.on('stats_update', (data) => {
         set({ onlineUsers: data.online })
      })

      return {
      // --- Socket.io ---
      socket: socket,
      onlineUsers: 1, // Default to 1 (Me) until server updates
       
      initSocket: () => {
         // Check connection manual
         if (!socket.connected) socket.connect()
      },
      
      // --- Screens & Navigation ---
      currentScreen: 'home',
      setCurrentScreen: (screen) => set({ currentScreen: screen }),

      // --- Movie Selection & Modals ---
      selectedMovie: null,
      setSelectedMovie: (movie) => set({ selectedMovie: movie }),

      showMovieDetail: false,
      setShowMovieDetail: (show) => set({ showMovieDetail: show }),
      
      showAuthModal: false,
      setShowAuthModal: (show) => set({ showAuthModal: show }),

      showPlayer: false,
      setShowPlayer: (show) => set({ showPlayer: show }),

      showSearch: false,
      setShowSearch: (show) => set({ showSearch: show }),

      // --- Search State ---
      searchQuery: '',
      setSearchQuery: (query) => set({ searchQuery: query }),
      
      searchResults: [],
      setSearchResults: (results) => set({ searchResults: results }),
      
      handleSearch: async (query) => {
         const state = get()
         state.setSearchQuery(query)
         
         if (!query.trim()) {
            state.setSearchResults([])
            if(state.currentScreen === 'search') state.setCurrentScreen('home')
            return
         }

         // Search Logic (Local + Mock + API)
         // Filter mock data for instant results
         const mockResults = mockMovies.filter(m => 
            m.title.toLowerCase().includes(query.toLowerCase())
         )
         
         // In real app, you might also fetch from TMDB or backend here
         state.setSearchResults(mockResults)
         
         if (state.currentScreen !== 'search' && query.length > 2) {
             state.setCurrentScreen('search')
         }
      },

      // --- Player State ---
      playerTime: 0,
      setPlayerTime: (time) => set({ playerTime: time }),
      
      currentSubtitle: 'English',
      setCurrentSubtitle: (sub) => set({ currentSubtitle: sub }),
      
      // --- Watch Progress (History) ---
      watchProgress: {},
      setWatchProgress: (movieId, progress) => set((state) => ({
        watchProgress: {
          ...state.watchProgress,
          [movieId]: progress,
        },
      })),

      // --- Continue Watching List ---
      continueWatching: [], 
      addToContinueWatching: (movie) => {
         const state = get()
         // Avoid duplicates
         const existingId = movie.id || movie._id;
         const filtered = state.continueWatching.filter(m => (m.id || m._id) !== existingId);
         // Add to front, keep max 20
         const newHistory = [movie, ...filtered].slice(0, 20);
         
         set({ continueWatching: newHistory });

         // Sync
         const token = localStorage.getItem('token')
         if (state.user && token) {
            authAPI.updateProfile(token, { watchlist: newHistory }).catch(console.error)
         }
      },
      // Manual setter
      setContinueWatching: (movies) => set({ continueWatching: movies }),

      // --- Favorites (Whitelist) ---
      favorites: [],
      toggleFavorite: (movie) => {
         const state = get()
         const id = movie.id || movie._id;
         const isFavorited = state.favorites.some(m => (m.id || m._id) === id)
         
         let newFavorites
         if (isFavorited) {
            newFavorites = state.favorites.filter(m => (m.id || m._id) !== id) 
         } else {
            newFavorites = [...state.favorites, movie]
         }

         set({ favorites: newFavorites })

         // Sync
         const token = localStorage.getItem('token')
         if (state.user && token) {
            authAPI.updateProfile(token, { favorites: newFavorites }).catch(console.error)
         }
      },

      // --- User Profile (Local / Mock) ---
      // This supports the user's request for "no complicated auth but still features"
      user: null, // Default null for guests
      login: (userData) => {
        set({ 
            user: userData,
            favorites: userData.favorites || [],
            continueWatching: userData.watchlist || [] 
        })
      },
      logout: () => {
        localStorage.removeItem('token')
        set({ user: null, favorites: [], continueWatching: [] })
      },
      
      // Theme
      isDarkMode: true,
      toggleTheme: () => set((state) => ({ isDarkMode: !state.isDarkMode })),
    }},
    {
      name: 'streamx-storage-v2', // bumped version to clear old cache
      storage: createJSONStorage(() => localStorage), 
      // Persist these fields permanently
      partialize: (state) => ({ 
          favorites: state.favorites, 
          continueWatching: state.continueWatching,
          watchProgress: state.watchProgress,
          user: state.user 
      }), 
    }
  )
)
