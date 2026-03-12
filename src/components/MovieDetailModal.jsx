import React, { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { FiStar, FiPlay, FiX, FiExternalLink, FiCheckCircle } from 'react-icons/fi'
import { useStore } from '../store/useStore'

export default function MovieDetailModal() {
  const {
    selectedMovie,
    showMovieDetail,
    setShowMovieDetail,
    setShowPlayer,
    favorites,
    toggleFavorite,
    user
  } = useStore()

  const [detailedMovie, setDetailedMovie] = useState(null)
  const [loadingLinks, setLoadingLinks] = useState(false)

  // Fetch full details (Legal Links & Archive) when modal opens
  useEffect(() => {
    if (showMovieDetail && selectedMovie) {
        setDetailedMovie(null)
        setLoadingLinks(true)
        
        // Determine ID to use (Mongo ID or TMDB ID)
        const id = selectedMovie._id || selectedMovie.id || selectedMovie.tmdbId;
        
        // Dynamically import API URL
        const API_URL = import.meta.env.PROD 
            ? 'https://steam-x.onrender.com'
            : 'http://localhost:5000';

        fetch(`${API_URL}/api/movies/${id}`)
            .then(async res => {
                // Check if response is OK and is JSON
                if (!res.ok) {
                    throw new Error(`API error: ${res.status} ${res.statusText}`)
                }
                const contentType = res.headers.get('content-type')
                if (!contentType?.includes('application/json')) {
                    throw new Error(`Invalid response type: ${contentType}`)
                }
                return res.json()
            })
            .then(data => {
                if (data && !data.error) {
                    setDetailedMovie(data)
                } else {
                    console.warn('API returned error:', data?.error)
                }
                setLoadingLinks(false)
            })
            .catch(err => {
                console.error("Failed to fetch details:", err.message || err)
                // Still close loading state even on error - fallback to selectedMovie
                setLoadingLinks(false)
            })
    }
  }, [showMovieDetail, selectedMovie])

  if (!showMovieDetail || !selectedMovie) return null

  // Use detailed movie if available, otherwise fallback to store data
  const movie = detailedMovie || selectedMovie;

  const isFavorited = favorites.some(m => m.id === movie.id)

  const handleFavoriteAction = () => {
    if (!user) {
       alert('Please log in to add to your watchlist!')
       return 
    }
    toggleFavorite(movie)
  }

  return (
    <AnimatePresence>
      {showMovieDetail && selectedMovie && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm"
            onClick={() => setShowMovieDetail(false)}
          />
          
          <motion.div
            initial={{ y: 200, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 200, opacity: 0 }}
            transition={{ type: 'spring', stiffness: 300, damping: 30 }}
            className="fixed inset-0 z-50 flex items-end md:items-center justify-center pointer-events-none"
          >
            <motion.div
              className="bg-dark-bg/95 backdrop-blur-xl border border-white/10 w-full md:w-2xl max-h-screen md:max-h-[85vh] md:rounded-2xl overflow-y-auto overflow-x-hidden no-scrollbar shadow-2xl pointer-events-auto"
            >
              {/* Header with Close */}
              <motion.div
                className="relative h-64 md:h-80 w-full overflow-hidden"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.1 }}
              >
                <motion.img
                  src={movie.backdrop || movie.poster}
                  alt={movie.title}
                  className="w-full h-full object-cover"
                  initial={{ scale: 1.1 }}
                  animate={{ scale: 1 }}
                  transition={{ duration: 0.4 }}
                />
                <motion.div
                  className="absolute inset-0 bg-gradient-to-b from-transparent to-dark-card"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.15 }}
                />

                <motion.button
                  onClick={() => setShowMovieDetail(false)}
                  whileHover={{ scale: 1.1, rotate: 90 }}
                  whileTap={{ scale: 0.9 }}
                  className="absolute top-4 right-4 bg-black/60 hover:bg-black/90 p-2 rounded-full transition-all z-10 backdrop-blur-sm"
                >
                  <FiX className="text-2xl text-white" />
                </motion.button>
              </motion.div>

              {/* Content */}
              <motion.div
                className="p-6 md:p-8 bg-dark-bg relative"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.2 }}
              >
                
                {/* Title & Metadata Row */}
                <motion.div
                  className="mb-6"
                  initial={{ y: 10, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.25 }}
                >
                  <motion.h2
                    className="text-3xl md:text-4xl font-bold mb-3 text-white"
                    whileHover={{ scale: 1.02 }}
                  >
                    {movie.title}
                  </motion.h2>
            
            <div className="flex flex-wrap items-center gap-3 text-sm font-medium">
               {/* Rating Badge */}
               <span className="flex items-center gap-1 bg-[#1f1f1f] text-yellow-400 px-3 py-1 rounded-full border border-gray-700">
                 <FiStar className="fill-current" size={14} /> {movie.rating}
               </span>

               {/* Genre Badge */}
               {movie.genres?.map(g => (
                 <span key={g} className="bg-blue-900/30 text-blue-400 px-3 py-1 rounded-full border border-blue-900/50">
                   {g}
                 </span>
               ))}
               
               {/* Year Badge */}
               <span className="bg-[#1f1f1f] text-gray-300 px-3 py-1 rounded-full border border-gray-700">
                 {movie.year}
               </span>

               {/* Legal Source Badge (Archive.org) */}
               {movie.legalSource && (
                  <span className="flex items-center gap-1 bg-green-900/30 text-green-400 px-3 py-1 rounded-full border border-green-900/50">
                    <FiCheckCircle /> {movie.legalSource}
                  </span>
               )}
                  </div>\n                </motion.div>\n\n                {/* Description */}
          <p className="text-gray-400 mb-8 leading-relaxed text-sm md:text-base">
            {movie.description}
          </p>

          {/* Legal Streaming Options (Watchmode) */}
          {movie.watchLinks && (movie.watchLinks.rent_buy?.length > 0 || movie.watchLinks.subscription?.length > 0) && (
              <div className="mb-8 p-4 rounded-xl bg-white/5 border border-white/10">
                  <h3 className="text-white font-semibold mb-3 flex items-center gap-2">
                      <FiExternalLink className="text-blue-400"/> Official Streaming Sources
                  </h3>
                  
                  {/* Subscription Services */}
                  {movie.watchLinks.subscription && (
                      <div className="flex flex-wrap gap-2 mb-3">
                          {movie.watchLinks.subscription.map(link => (
                              <a 
                                key={link.name} 
                                href={link.web_url} 
                                target="_blank" 
                                rel="noreferrer"
                                className="px-4 py-2 bg-[#141414] hover:bg-[#202020] text-gray-200 text-xs rounded-lg border border-gray-700 transition-colors flex items-center gap-2"
                              >
                                  Stream on {link.name}
                              </a>
                          ))}
                      </div>
                  )}

                  {/* Rent/Buy Services */}
                  {movie.watchLinks.rent_buy && (
                      <div className="flex flex-wrap gap-2">
                          <span className="text-xs text-gray-500 py-2 mr-1">Rent/Buy:</span>
                          {movie.watchLinks.rent_buy.map(link => (
                              <a 
                                key={link.name} 
                                href={link.web_url} 
                                target="_blank" 
                                rel="noreferrer"
                                className="px-3 py-1.5 bg-blue-900/20 hover:bg-blue-900/40 text-blue-300 text-xs rounded-md border border-blue-800/30 transition-colors"
                              >
                                  {link.name}
                              </a>
                          ))}
                      </div>
                  )}
                  
                  <p className="text-[10px] text-gray-500 mt-2 text-right">Powered by Watchmode</p>
              </div>
          )}

                  {/* Actions */}
                  <motion.div
                    className="flex items-center gap-4"
                    initial={{ y: 10, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 0.35 }}
                  >
                    <motion.button
                      onClick={() => {
                        setShowPlayer(true)
                        setShowMovieDetail(false)
                      }}
                      whileHover={{ scale: 1.05, boxShadow: '0 0 20px rgba(59, 130, 246, 0.5)' }}
                      whileTap={{ scale: 0.95 }}
                      className="flex-1 bg-gradient-to-r from-blue-600 to-violet-600 hover:from-blue-500 hover:to-violet-500 text-white font-bold py-3.5 rounded-xl transition-all flex items-center justify-center gap-2 shadow-lg shadow-blue-900/20"
                    >
                      <span className="bg-white text-blue-600 rounded-full p-1"><FiPlay size={12} className="ml-0.5" fill="currentColor"/></span>
                      {movie.legalSource ? 'Watch Free (Legal)' : 'Watch Now'}
                    </motion.button>
                    
                     <motion.button
                      onClick={handleFavoriteAction}
                      whileHover={{ scale: 1.08 }}
                      whileTap={{ scale: 0.9 }}
                      className={`px-4 py-3.5 rounded-xl border-2 transition-all font-semibold flex items-center gap-2 ${
                        isFavorited
                          ? 'border-yellow-500/50 text-yellow-500 bg-yellow-500/10'
                          : 'border-gray-700 text-gray-300 hover:border-gray-500 hover:bg-gray-800'
                      }`}
                    >
                      <motion.div
                        animate={{ rotate: isFavorited ? 360 : 0 }}
                        transition={{ duration: 0.4 }}
                      >
                        <FiStar className={isFavorited ? 'fill-current' : ''} />
                      </motion.div>
                      {isFavorited ? 'Added' : 'My List'}
                    </motion.button>
                  </motion.div>
                </motion.div>
            </motion.div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}
