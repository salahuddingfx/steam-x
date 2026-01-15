import React, { useEffect } from 'react'
import { FiStar } from 'react-icons/fi'
import { useStore } from '../store/useStore'
import AOS from 'aos'
import 'aos/dist/aos.css'

export default function MovieCard({ movie, index }) {
  const { setSelectedMovie, setShowMovieDetail, favorites, toggleFavorite, user } = useStore()
  const isFavorited = favorites.some(m => m.id === movie.id)
  
  useEffect(() => {
    AOS.init({ duration: 800, once: true })
  }, [])
  
  // Determine badge based on rating
  const getBadgeType = (rating) => {
    if (rating >= 8.5) return { type: 'exclusive', label: '🔥 EXCLUSIVE' }
    if (rating >= 8.0) return { type: 'trending', label: '📈 TRENDING' }
    return { type: 'new', label: '✨ NEW' }
  }
  
  const badge = getBadgeType(movie.rating)

  // Provider Styling
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
    <div
      data-aos="fade-up"
      data-aos-delay={index * 50} 
      className="glow-card group relative overflow-hidden rounded-xl cursor-pointer transition-transform hover:-translate-y-2 duration-300 shadow-xl"
      onClick={() => {
        setSelectedMovie(movie)
        setShowMovieDetail(true)
      }}
    >
      {/* Poster */}
      <div className="relative w-full aspect-[2/3] overflow-hidden rounded-xl">

        <img
          src={movie.poster || 'https://via.placeholder.com/500x750?text=No+Poster'}
          alt={movie.title}
          onError={(e) => { e.target.onerror = null; e.target.src = 'https://via.placeholder.com/500x750?text=Image+Unavailable'; }}
          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent opacity-60 group-hover:opacity-80 transition-opacity duration-300"></div>

        {/* Overlay Info */}
        <div className="absolute inset-0 p-4 flex flex-col justify-end opacity-0 group-hover:opacity-100 transition-all duration-300 slide-in">
          <div className="glass-effect-dark p-3 rounded-lg backdrop-blur-md hover-glow">
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
              <button
                onClick={handleFavorite}
                className={`p-1 rounded transition-all hover-glow ${
                  isFavorited ? 'text-neon-purple' : 'text-gray-400'
                }`}
              >
                <FiStar size={16} fill={isFavorited ? 'currentColor' : 'none'} />
              </button>
            </div>
          </div>
        </div>


        {/* Provider Badge (Top Left) */}
        {movie.provider && (
           <div className={`absolute top-2 left-2 text-[10px] font-bold px-2 py-1 rounded shadow-md z-10 ${getProviderStyle(movie.provider)}`}>
             {movie.provider}
           </div>
        )}

        {/* Rating Badge (Top Right) */}
        <div className={`absolute top-2 right-2 badge-${badge.type} hover-glow`}>
          {badge.label}
        </div>
      </div>


      {/* Title */}
      <div className="p-3 bg-dark-card">
        <h3 className="font-semibold text-sm truncate group-hover:text-neon-blue transition-colors">
          {movie.title}
        </h3>
        <p className="text-xs text-gray-400 mt-1">{movie.year}</p>
      </div>
    </div>
  )
}
