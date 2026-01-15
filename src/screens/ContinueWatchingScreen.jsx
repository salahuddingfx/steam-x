import React from 'react'
import MovieCard from '../components/MovieCard'
import { useStore } from '../store/useStore'

export default function ContinueWatchingScreen() {
  const { continueWatching, setSelectedMovie, setShowMovieDetail, watchProgress } = useStore()

  if (continueWatching.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center min-h-96 py-12">
        <div className="text-6xl mb-4">📽️</div>
        <h2 className="text-2xl font-bold mb-2">No movies in progress</h2>
        <p className="text-gray-400">Start watching a movie to see it here</p>
      </div>
    )
  }

  return (
    <div>
      <h1 className="text-3xl md:text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-neon-blue to-neon-purple mb-8">
        Continue Watching
      </h1>

      <div className="space-y-6">
        {continueWatching.map((movie) => (
          <div
            key={movie.id}
            className="group glass-effect p-4 rounded-xl hover:bg-opacity-60 transition-all cursor-pointer"
            onClick={() => {
              setSelectedMovie(movie)
              setShowMovieDetail(true)
            }}
          >
            <div className="flex gap-4">
              {/* Thumbnail */}
              <div className="flex-shrink-0 w-32 h-48 rounded-lg overflow-hidden">
                <img
                  src={movie.poster}
                  alt={movie.title}
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                />
              </div>

              {/* Info */}
              <div className="flex-1 flex flex-col justify-between">
                <div>
                  <h3 className="text-xl font-bold mb-2">{movie.title}</h3>
                  <p className="text-gray-400 text-sm mb-4 line-clamp-3">{movie.description}</p>
                  <div className="flex items-center gap-4 text-sm text-gray-400">
                    <span>⭐ {movie.rating}/10</span>
                    <span>•</span>
                    <span>{movie.duration} min</span>
                  </div>
                </div>

                {/* Progress bar */}
                <div className="mt-4">
                  <div className="text-xs text-gray-400 mb-2">{Math.round(movie.progress)}% watched</div>
                  <div className="w-full h-2 bg-dark-card rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-neon-blue to-neon-purple transition-all"
                      style={{ width: `${movie.progress}%` }}
                    ></div>
                  </div>
                </div>
              </div>

              {/* Play Button */}
              <div className="flex items-center justify-center">
                <button className="w-14 h-14 rounded-full bg-gradient-to-r from-neon-blue to-neon-purple flex items-center justify-center hover:shadow-glow-intense transition-all group-hover:scale-110">
                  <span className="text-dark-bg text-2xl">▶</span>
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
