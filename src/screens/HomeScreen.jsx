import React, { useEffect, useState } from 'react'
import MovieSlider from '../components/MovieSlider'
import { useStore } from '../store/useStore'
import { movieAPI } from '../services/api'
import { mockMovies } from '../data/mockData'

export default function HomeScreen() {
  const { continueWatching, favorites, setSelectedMovie, setShowPlayer, setShowMovieDetail } = useStore()
  const [movies, setMovies] = useState(mockMovies)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const loadMovies = async () => {
      try {
        const data = await movieAPI.getAll()
        if (data && data.length > 0) {
          setMovies(data)
        }
      } catch (error) {
        console.log('Using mock data')
      } finally {
        setLoading(false)
      }
    }
    loadMovies()
  }, [])
  
  // Categorize movies dynamically
  const featured = movies.filter(m => m.rating > 8).slice(0, 1) // Top rated
  const trending = movies.filter(m => m.isTrending).slice(0, 15)
  const newReleases = movies.filter(m => m.provider === 'Cinema' || m.year === 2024 || m.year === 2025).slice(0, 10)
  const netflixOriginals = movies.filter(m => m.provider === 'Netflix')
  const amazonHits = movies.filter(m => m.provider === 'Amazon Prime')
  const animeHits = movies.filter(m => m.provider === 'Anime Hits')
  const familyHits = movies.filter(m => m.provider === 'Family 3D')

  return (
    <div className="space-y-12 pb-20">
      {/* Featured Section */}
      {featured[0] && (
      <div className="relative h-[450px] md:h-[650px] rounded-3xl overflow-hidden group mb-12 shadow-[0_0_50px_rgba(0,0,0,0.5)]">
        <img
          src={featured[0]?.backdrop}
          alt={featured[0]?.title}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-1000"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-dark-bg via-transparent to-transparent"></div>
        <div className="absolute inset-0 bg-gradient-to-r from-dark-bg/90 via-dark-bg/30 to-transparent"></div>

        <div className="absolute inset-0 flex flex-col justify-end p-8 md:p-16">
          <div className="mb-8 animate-slide-up">
            <span className="inline-block px-3 py-1 mb-4 text-xs font-bold tracking-wider text-white uppercase bg-red-600 rounded-full">
               🔥 #1 in Trending
            </span>
            <h1 className="text-4xl md:text-7xl font-black mb-4 text-white drop-shadow-xl leading-tight">
              {featured[0]?.title}
            </h1>
            <p className="text-gray-200 max-w-2xl mb-6 text-sm md:text-lg line-clamp-3 font-medium shadow-black drop-shadow-md">
              {featured[0]?.description}
            </p>
            <div className="flex items-center gap-6 text-sm font-semibold text-gray-300">
              <span className="text-yellow-400 flex items-center gap-1">⭐ {featured[0]?.rating} Rating</span>
              <span>•</span>
              <span>{featured[0]?.year}</span>
              <span>•</span>
              <span>{featured[0]?.genres?.[0]}</span>
              <span>•</span>
              <span className="text-white px-2 py-0.5 border border-white/30 rounded">4K Ultra HD</span>
            </div>
          </div>
          <div className="flex gap-4 animate-slide-up" style={{ animationDelay: '0.2s' }}>
            <button 
              onClick={() => {
                setSelectedMovie(featured[0])
                setShowPlayer(true)
              }}
              className="bg-white text-black hover:bg-gray-200 font-bold px-10 py-4 rounded-xl transition-all flex items-center gap-2 text-lg">
              <span className="text-2xl">▶</span> Play Now
            </button>
            <button 
              onClick={() => {
                setSelectedMovie(featured[0])
                setShowMovieDetail(true)
              }}
              className="bg-gray-500/30 backdrop-blur-md border border-white/20 text-white font-bold px-10 py-4 rounded-xl hover:bg-white/10 transition-all">
              More Info
            </button>
          </div>
        </div>
      </div>
      )}

      {/* Categories */}
      <MovieSlider title="🔥 Trending Now" movies={trending} />
      
      {newReleases.length > 0 && (
         <MovieSlider title="🍿 New Cinema Releases" movies={newReleases} />
      )}
      
      {netflixOriginals.length > 0 && (
         <MovieSlider title="🔴 New on Netflix" movies={netflixOriginals} />
      )}

      {amazonHits.length > 0 && (
         <MovieSlider title="🔵 Amazon Prime Hits" movies={amazonHits} />
      )}
      
      {animeHits.length > 0 && (
         <MovieSlider title="⛩️ Anime & Animation Hits" movies={animeHits} />
      )}

      {familyHits.length > 0 && (
         <MovieSlider title="🎬 3D Animation & Family" movies={familyHits} />
      )}

      {/* Continue Watching */}
      {continueWatching.length > 0 && (
        <div>
          <h2 className="text-2xl md:text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-neon-blue to-neon-purple mb-6">
            Continue Watching
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {continueWatching.map((movie) => (
              <div key={movie.id} className="group cursor-pointer">
                <div className="relative h-40 rounded-lg overflow-hidden mb-3">
                  <img
                    src={movie.backdrop}
                    alt={movie.title}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black to-transparent"></div>
                  
                  {/* Progress bar */}
                  <div className="absolute bottom-0 left-0 right-0 h-1 bg-dark-card">
                    <div
                      className="h-full bg-gradient-to-r from-neon-blue to-neon-purple transition-all"
                      style={{ width: `${movie.progress}%` }}
                    ></div>
                  </div>

                  <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                    <div className="w-16 h-16 rounded-full bg-neon-blue bg-opacity-80 flex items-center justify-center">
                      <span className="text-dark-bg text-xl font-bold">▶</span>
                    </div>
                  </div>
                </div>
                <h3 className="font-semibold truncate">{movie.title}</h3>
                <p className="text-xs text-gray-400">{Math.round(movie.progress)}% watched</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Favorites Preview */}
      {favorites.length > 0 && (
        <MovieSlider title="Your Favorites" movies={favorites.slice(0, 6)} />
      )}
    </div>
  )
}
