import React, { useEffect } from 'react'
import { motion } from 'framer-motion'
import { FiStar } from 'react-icons/fi'
import { useStore } from '../store/useStore'

export default React.memo(function MovieCard({ movie, index }) {
  const { setSelectedMovie, setShowMovieDetail, favorites, toggleFavorite, user } = useStore()
  const isFavorited = favorites.some(m => m.id === movie.id)
  
  const getBadgeType = (rating) => {
    if (rating >= 8.5) return { type: 'exclusive', label: '🔥 EXCLUSIVE' }
    if (rating >= 8.0) return { type: 'trending', label: '📈 TRENDING' }
    return { type: 'new', label: '✨ NEW' }
  }
  
  const badge = getBadgeType(movie.rating)

  const getProviderStyle = (provider) => {
    switch (provider?.toLowerCase()) {
      case 'netflix': return 'bg-red-600 text-white'
      case 'amazon prime': return 'bg-blue-500 text-white'
      case 'hulu': return 'bg-green-500 text-black'
      case 'disney+': return 'bg-blue-900 text-white'
      default: return 'bg-neon-blue text-black'
    }
  }

  const handleFavorite = (e) => {
    e.stopPropagation()
    if (!user) {
      alert('Please login to add to watchlist!')
      return
    }
    toggleFavorite(movie)
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '0px 0px -100px 0px' }}
      transition={{ duration: 0.4, delay: index * 0.05 }}
      whileHover={{ y: -8 }}
      className="glow-card group relative overflow-hidden rounded-xl cursor-pointer shadow-xl"
      onClick={() => {
        setSelectedMovie(movie)
        setShowMovieDetail(true)
      }}
    >
      {/* Poster */}
      <div className="relative w-full aspect-[2/3] overflow-hidden rounded-xl">
        <motion.img
          src={movie.poster || 'https://placehold.co/500x750/222/FFF?text=No+Poster'}
          alt={movie.title}
          onError={(e) => { e.target.onerror = null; e.target.src = 'https://placehold.co/500x750/333/FFF?text=Image+Unavailable'; }}
          whileHover={{ scale: 1.12 }}
          transition={{ duration: 0.4 }}
          className="w-full h-full object-cover"
        />
        <motion.div
          initial={{ opacity: 0.6 }}
          whileHover={{ opacity: 0.8 }}
          transition={{ duration: 0.3 }}
          className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent"
        />

        {/* Overlay Info */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileHover={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.2 }}
          className="absolute inset-0 p-4 flex flex-col justify-end"
        >
          <motion.div
            initial={{ scale: 0.95 }}
            whileHover={{ scale: 1 }}
            className="glass-effect-dark p-3 rounded-lg backdrop-blur-md hover-glow"
          >
            <h3 className="text-sm font-bold mb-2 line-clamp-2 glow-text-blue">{movie.title}</h3>
            
            {/* Tags Row */}
            <div className="flex flex-wrap gap-2 mb-2">
               <span className="text-[10px] px-2 py-0.5 rounded-full bg-dark-bg border border-gray-600 text-gray-200">
                 {movie.year}
               </span>
               <span className="text-[10px] px-2 py-0.5 rounded-full bg-dark-bg border border-gray-600 text-gray-200">
                 {movie.genres?.[0] || 'Movie'}
               </span>
            </div>

            <div className="flex items-center justify-between mb-3">
              <span className="text-xs text-neon-blue font-semibold flex items-center gap-1">
                ⭐ {movie.rating}
              </span>
              <motion.button
                onClick={handleFavorite}
                whileHover={{ scale: 1.3, rotate: 15 }}
                whileTap={{ scale: 0.85 }}
                className={`p-1 rounded transition-all hover-glow ${
                  isFavorited ? 'text-neon-purple' : 'text-gray-400'
                }`}
              >
                <FiStar size={16} fill={isFavorited ? 'currentColor' : 'none'} />
              </motion.button>
            </div>
          </motion.div>
        </motion.div>

        {/* Provider Badge (Top Left) */}
        {movie.provider && (
           <motion.div
             initial={{ opacity: 0, x: -10 }}
             whileHover={{ opacity: 1, x: 0 }}
             className={`absolute top-2 left-2 text-[10px] font-bold px-2 py-1 rounded shadow-md z-10 ${getProviderStyle(movie.provider)}`}
           >
             {movie.provider}
           </motion.div>
        )}

        {/* Badge */}
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.2 }}
          className={`absolute bottom-2 right-2 text-[10px] font-bold px-2 py-1 rounded shadow-lg z-10 ${
            badge.type === 'exclusive'
              ? 'bg-gradient-to-r from-neon-purple to-neon-blue text-white'
              : badge.type === 'trending'
              ? 'bg-orange-500 text-white'
              : 'bg-emerald-500 text-black'
          }`}
        >
          {badge.label}
        </motion.div>
      </div>
    </motion.div>
  )
})
