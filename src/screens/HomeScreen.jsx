import React, { useEffect, useState, useRef } from 'react'
import MovieSlider from '../components/MovieSlider'
import MovieCard from '../components/MovieCard'
import { useStore } from '../store/useStore'
import { movieAPI } from '../services/api'
import { mockMovies } from '../data/mockData'
import { FiChevronLeft, FiChevronRight, FiPlay, FiInfo } from 'react-icons/fi'

export default function HomeScreen() {
  const { continueWatching, favorites, setSelectedMovie, setShowPlayer, setShowMovieDetail } = useStore()
  const [movies, setMovies] = useState(mockMovies)
  const [loading, setLoading] = useState(true)
  
  // Banner State
  const [bannerIndex, setBannerIndex] = useState(0)
  const [fadeKey, setFadeKey] = useState(0)

  // Infinite Scroll State
  const [extraMovies, setExtraMovies] = useState([])
  const [page, setPage] = useState(1)
  const [hasMore, setHasMore] = useState(true)
  const loaderRef = useRef(null)

  useEffect(() => {
    const loadMovies = async () => {
      try {
        const data = await movieAPI.getAll('', '', 'trending', 1, 100)
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
  const topTrending = movies.filter(m => m.isTrending).slice(0, 5) // Top 5 for banner
  const featuredMovie = topTrending[bannerIndex] || movies[0];

  const trending = movies.filter(m => m.isTrending).slice(0, 15)
  const newReleases = movies.filter(m => m.provider === 'Cinema' || m.year >= 2024).slice(0, 10)
  const netflixOriginals = movies.filter(m => m.provider === 'Netflix')
  const amazonHits = movies.filter(m => m.provider === 'Amazon Prime')
  const animeHits = movies.filter(m => m.provider === 'Anime Hits' || (m.genres && m.genres.includes('Animation')))
  const familyHits = movies.filter(m => m.provider === 'Family 3D')

  // Auto-Cycle Banner
  useEffect(() => {
      const interval = setInterval(() => {
          setBannerIndex(prev => (prev + 1) % Math.min(topTrending.length, 5));
          setFadeKey(prev => prev + 1);
      }, 8000);
      return () => clearInterval(interval);
  }, [topTrending.length]);

  const changeBanner = (direction) => {
      if (direction === 'next') {
          setBannerIndex(prev => (prev + 1) % Math.min(topTrending.length, 5));
      } else {
          setBannerIndex(prev => (prev - 1 + Math.min(topTrending.length, 5)) % Math.min(topTrending.length, 5));
      }
      setFadeKey(prev => prev + 1);
  }

  // Infinite Scroll Logic
  const handleObserver = async (entries) => {
      const target = entries[0];
      if (target.isIntersecting && !loading && hasMore) {
          try {
              const nextPage = page + 1; 
              console.log(`🚀 Loading More: Page ${nextPage}`);
              
              const newData = await movieAPI.getAll('', '', 'trending', nextPage, 24); 
              
              if (newData.length === 0) {
                  setHasMore(false);
              } else {
                  setExtraMovies(prev => {
                      const existingIds = new Set(prev.map(m => m._id));
                      const mainIds = new Set(movies.map(m => m._id));
                      const uniqueNew = newData.filter(m => !existingIds.has(m._id) && !mainIds.has(m._id));
                      return [...prev, ...uniqueNew];
                  });
                  setPage(nextPage); 
              }
          } catch (err) {
              setHasMore(false);
          }
      }
  }

  useEffect(() => {
      const observer = new IntersectionObserver(handleObserver, {
          root: null,
          rootMargin: "100px",
          threshold: 0.1
      });
      if (loaderRef.current) observer.observe(loaderRef.current);
      return () => {
          if (loaderRef.current) observer.unobserve(loaderRef.current);
      }
  }, [page, hasMore, loading, movies])

  return (
    <div className="space-y-12 pb-20">
      {/* IMPROVED BANNER SECTION */}
      {featuredMovie && (
      <div className="relative h-[550px] md:h-[750px] overflow-hidden group mb-[-50px] md:mb-[-100px]">
        
        {/* Animated Background Image */}
        <div key={fadeKey} className="absolute inset-0 bg-black animate-fade-in">
             <img
                src={featuredMovie.backdrop?.replace('w500', 'original')} // Use highest quality
                alt={featuredMovie.title}
                className="w-full h-full object-cover opacity-60 md:opacity-100 transition-transform duration-[10000ms] ease-linear scale-100 group-hover:scale-105"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-dark-bg via-dark-bg/60 to-transparent"></div>
            <div className="absolute inset-0 bg-gradient-to-r from-dark-bg via-dark-bg/40 to-transparent"></div>
        </div>

        {/* Content Container */}
        <div key={fadeKey + '_content'} className="absolute inset-x-0 bottom-0 top-0 flex flex-col justify-center px-6 md:px-16 pb-24 md:pb-32 animate-slide-up">
            <div className="max-w-3xl space-y-6">
                
                {/* Badge */}
                <div className="flex items-center gap-3">
                    <span className="bg-red-600 text-white text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider shadow-lg shadow-red-600/30">
                        🔥 Trending #{bannerIndex + 1}
                    </span>
                    {featuredMovie.year >= 2024 && (
                        <span className="bg-blue-500 text-white text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider shadow-lg shadow-blue-500/30">
                            New Release
                        </span>
                    )}
                </div>

                {/* Title */}
                <h1 className="text-4xl md:text-7xl font-black text-white drop-shadow-2xl leading-tight tracking-tight">
                    {featuredMovie.title}
                </h1>

                {/* Metadata */}
                <div className="flex items-center flex-wrap gap-4 text-sm md:text-base font-medium text-gray-200">
                    <span className="text-green-400 font-bold">{Math.round(featuredMovie.rating * 10)}% Match</span>
                    <span>{featuredMovie.year}</span>
                    <span className="border border-gray-500 px-2 rounded text-xs">HD</span>
                    <span>{featuredMovie.genres?.[0] || 'Action'}</span>
                </div>

                {/* Description */}
                <p className="text-gray-300 text-sm md:text-lg line-clamp-3 md:line-clamp-4 max-w-2xl leading-relaxed drop-shadow-md">
                    {featuredMovie.description}
                </p>

                {/* Buttons */}
                <div className="flex gap-4 pt-4">
                    <button 
                        onClick={() => {
                            setSelectedMovie(featuredMovie)
                            setShowPlayer(true)
                        }}
                        className="bg-white text-black hover:bg-gray-200 px-8 py-3.5 rounded-xl font-bold text-lg transition-all flex items-center gap-3 shadow-lg shadow-white/10 hover:scale-105"
                    >
                        <FiPlay className="text-2xl fill-current" /> Play Now
                    </button>
                    <button 
                        onClick={() => {
                            setSelectedMovie(featuredMovie)
                            setShowMovieDetail(true)
                        }}
                        className="bg-gray-600/40 hover:bg-gray-600/60 backdrop-blur-md text-white px-8 py-3.5 rounded-xl font-bold text-lg transition-all flex items-center gap-3 border border-white/10 hover:border-white/30"
                    >
                        <FiInfo className="text-2xl" /> More Info
                    </button>
                </div>
            </div>
        </div>

        {/* Carousel Arrows */}
        <button 
            onClick={() => changeBanner('prev')}
            className="absolute left-4 top-1/2 -translate-y-1/2 p-3 rounded-full bg-black/20 hover:bg-white/10 text-white/50 hover:text-white backdrop-blur-sm border border-white/5 transition-all opacity-0 group-hover:opacity-100 hidden md:block"
        >
            <FiChevronLeft size={32} />
        </button>
        
        <button 
            onClick={() => changeBanner('next')}
            className="absolute right-4 top-1/2 -translate-y-1/2 p-3 rounded-full bg-black/20 hover:bg-white/10 text-white/50 hover:text-white backdrop-blur-sm border border-white/5 transition-all opacity-0 group-hover:opacity-100 hidden md:block"
        >
            <FiChevronRight size={32} />
        </button>

         {/* Carousel Dots */}
         <div className="absolute bottom-8 right-8 flex gap-2 z-10">
            {topTrending.map((_, i) => (
                <div 
                    key={i} 
                    className={`h-1.5 rounded-full transition-all duration-300 ${i === bannerIndex ? 'w-8 bg-white' : 'w-2 bg-white/30'}`}
                ></div>
            ))}
        </div>
      </div>
      )}

      {/* Categories */}
      <div className="relative z-10 mt-0"> 
          <MovieSlider title="🔥 Trending Now" movies={trending} />
          
          {newReleases.length > 0 && (
             <MovieSlider title="🍿 New Cinema Releases (2024-2025)" movies={newReleases} />
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
          
          {/* Infinite Grid */}
          <div className="mt-20 pt-12 border-t border-gray-800">
               <h2 className="text-3xl font-bold text-white mb-8">🚀 Extended Library</h2>
               <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-6">
                   {extraMovies.map((movie, idx) => (
                       <div key={movie._id + idx} className="animate-fade-in">
                           <MovieCard movie={movie} />
                       </div>
                   ))}
               </div>
               
               <div ref={loaderRef} className="h-40 flex items-center justify-center w-full mt-8">
                   {hasMore ? (
                       <div className="flex flex-col items-center gap-4 animate-pulse">
                           <div className="w-10 h-10 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
                           <span className="text-sm text-gray-400 font-medium">Fetching more movies...</span>
                       </div>
                   ) : (
                       <span className="text-gray-500 text-sm">-- You've reached the end --</span>
                   )}
               </div>
          </div>
      </div>
    </div>
  )
}
