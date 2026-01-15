import React, { useEffect, useState } from 'react'
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
            .then(res => res.json())
            .then(data => {
                if (data && !data.error) {
                    setDetailedMovie(data)
                }
                setLoadingLinks(false)
            })
            .catch(err => {
                console.error("Failed to fetch details", err)
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
    <div className="fixed inset-0 z-30 flex items-end md:items-center justify-center bg-black bg-opacity-60 backdrop-blur-sm animate-fade-in">
      <div className="glass-effect w-full md:w-2xl max-h-screen md:max-h-[85vh] md:rounded-2xl overflow-y-auto overflow-x-hidden animate-slide-up no-scrollbar">
        {/* Header with Close */}
        <div className="relative h-64 md:h-80 w-full">
          <img
            src={movie.backdrop || movie.poster}
            alt={movie.title}
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
            <h2 className="text-3xl md:text-4xl font-bold mb-3 text-white">{movie.title}</h2>
            
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
            </div>
          </div>

          {/* Description */}
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
          <div className="flex items-center gap-4">
            <button
              onClick={() => {
                setShowPlayer(true)
                setShowMovieDetail(false)
              }}
              className="flex-1 bg-gradient-to-r from-blue-600 to-violet-600 hover:from-blue-500 hover:to-violet-500 text-white font-bold py-3.5 rounded-xl transition-all flex items-center justify-center gap-2 shadow-lg shadow-blue-900/20"
            >
              <span className="bg-white text-blue-600 rounded-full p-1"><FiPlay size={12} className="ml-0.5" fill="currentColor"/></span>
              {movie.legalSource ? 'Watch Free (Legal)' : 'Watch Now'}
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
