import React from 'react'
import { FiStar, FiPlay, FiX } from 'react-icons/fi'
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

  if (!showMovieDetail || !selectedMovie) return null

  const isFavorited = favorites.some(m => m.id === selectedMovie.id)

  const handleFavoriteAction = () => {
    if (!user) {
       alert('Please log in to add to your watchlist!')
       return 
    }
    toggleFavorite(selectedMovie)
  }

  return (
    <div className="fixed inset-0 z-30 flex items-end md:items-center justify-center bg-black bg-opacity-60 backdrop-blur-sm animate-fade-in">
      <div className="glass-effect w-full md:w-2xl max-h-screen md:max-h-[85vh] md:rounded-2xl overflow-y-auto overflow-x-hidden animate-slide-up no-scrollbar">
        {/* Header with Close */}
        <div className="relative h-64 md:h-80 w-full">
          <img
            src={selectedMovie.backdrop}
            alt={selectedMovie.title}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-transparent to-dark-card"></div>

          <button
            onClick={() => setShowMovieDetail(false)}
            className="absolute top-4 right-4 bg-black/60 hover:bg-black/90 p-2 rounded-full transition-all z-10 backdrop-blur-sm"
          >
            <FiX className="text-2xl text-white" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 md:p-8 bg-dark-bg relative">
          
          {/* Title & Metadata Row */}
          <div className="mb-6">
            <h2 className="text-3xl md:text-4xl font-bold mb-3 text-white">{selectedMovie.title}</h2>
            
            <div className="flex flex-wrap items-center gap-3 text-sm font-medium">
               {/* Rating Badge */}
               <span className="flex items-center gap-1 bg-[#1f1f1f] text-yellow-400 px-3 py-1 rounded-full border border-gray-700">
                 <FiStar className="fill-current" size={14} /> {selectedMovie.rating}
               </span>

               {/* Genre Badge */}
               {selectedMovie.genres?.map(g => (
                 <span key={g} className="bg-blue-900/30 text-blue-400 px-3 py-1 rounded-full border border-blue-900/50">
                   {g}
                 </span>
               ))}
               
               {/* Year Badge */}
               <span className="bg-[#1f1f1f] text-gray-300 px-3 py-1 rounded-full border border-gray-700">
                 {selectedMovie.year}
               </span>

               {/* Provider Badge */}
                {selectedMovie.provider && (
                  <span className="bg-gradient-to-r from-purple-900/50 to-pink-900/50 text-pink-200 px-3 py-1 rounded-full border border-purple-500/30">
                    On {selectedMovie.provider}
                  </span>
                )}
            </div>
          </div>

          {/* Description */}
          <p className="text-gray-400 mb-8 leading-relaxed text-sm md:text-base">
            {selectedMovie.description}
          </p>

          {/* Actions */}
          <div className="flex items-center gap-4">
            <button
              onClick={() => {
                setShowPlayer(true)
                setShowMovieDetail(false)
              }}
              className="flex-1 bg-gradient-to-r from-blue-600 to-violet-600 hover:from-blue-500 hover:to-violet-500 text-white font-bold py-3.5 rounded-xl transition-all flex items-center justify-center gap-2 shadow-lg shadow-blue-900/20"
            >
              <span className="bg-white text-blue-600 rounded-full p-1"><FiPlay size={12} className="ml-0.5" fill="currentColor"/></span>
              Watch Now
            </button>
            
             <button
              onClick={handleFavoriteAction}
              className={`px-4 py-3.5 rounded-xl border-2 transition-all font-semibold flex items-center gap-2 ${
                isFavorited
                  ? 'border-yellow-500/50 text-yellow-500 bg-yellow-500/10'
                  : 'border-gray-700 text-gray-300 hover:border-gray-500 hover:bg-gray-800'
              }`}
            >
              <FiStar className={isFavorited ? 'fill-current' : ''} />
              {isFavorited ? 'Added' : 'My List'}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
