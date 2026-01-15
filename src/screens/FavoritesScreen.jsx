import React from 'react'
import MovieCard from '../components/MovieCard'
import { useStore } from '../store/useStore'

export default function FavoritesScreen() {
  const { favorites } = useStore()

  if (favorites.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center min-h-96 py-12">
        <div className="text-6xl mb-4">❤️</div>
        <h2 className="text-2xl font-bold mb-2">No favorites yet</h2>
        <p className="text-gray-400">Add movies to your favorites to see them here</p>
      </div>
    )
  }

  return (
    <div>
      <h1 className="text-3xl md:text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-neon-blue to-neon-purple mb-2">
        Your Favorites
      </h1>
      <p className="text-gray-400 mb-8">{favorites.length} movie{favorites.length !== 1 ? 's' : ''} saved</p>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
        {favorites.map((movie) => (
          <MovieCard key={movie.id} movie={movie} />
        ))}
      </div>
    </div>
  )
}
