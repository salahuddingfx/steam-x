import React from 'react'
import MovieCard from '../components/MovieCard'
import { useStore } from '../store/useStore'

export default function SearchScreen() {
  const { searchResults, searchQuery, setCurrentScreen } = useStore()

  if (searchResults.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center min-h-96 py-12">
        <div className="text-6xl mb-4">🔍</div>
        <h2 className="text-2xl font-bold mb-2">No results found</h2>
        <p className="text-gray-400 mb-6">
          {searchQuery ? `Try searching for something else` : 'Enter a search query'}
        </p>
        <button
          onClick={() => setCurrentScreen('home')}
          className="bg-neon-blue text-dark-bg font-bold px-6 py-2 rounded-lg hover:shadow-glow-intense transition-all"
        >
          Back to Home
        </button>
      </div>
    )
  }

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl md:text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-neon-blue to-neon-purple">
          Search Results
        </h1>
        <p className="text-gray-400 mt-2">Found {searchResults.length} result{searchResults.length !== 1 ? 's' : ''}</p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {searchResults.map((movie) => (
          <MovieCard key={movie.id} movie={movie} />
        ))}
      </div>
    </div>
  )
}
