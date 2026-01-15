import React from 'react'
import { FiChevronLeft, FiChevronRight } from 'react-icons/fi'
import MovieCard from './MovieCard'

export default function MovieSlider({ title, movies }) {
  const sliderRef = React.useRef(null)

  const scroll = (direction) => {
    if (sliderRef.current) {
      const scrollAmount = 320
      sliderRef.current.scrollBy({
        left: direction === 'left' ? -scrollAmount : scrollAmount,
        behavior: 'smooth',
      })
    }
  }

  return (
    <div className="mb-12">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl md:text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-neon-blue to-neon-purple">
          {title}
        </h2>
        <div className="flex gap-2">
          <button
            onClick={() => scroll('left')}
            className="p-2 hover:bg-dark-card rounded-full transition-all text-neon-blue"
          >
            <FiChevronLeft size={24} />
          </button>
          <button
            onClick={() => scroll('right')}
            className="p-2 hover:bg-dark-card rounded-full transition-all text-neon-blue"
          >
            <FiChevronRight size={24} />
          </button>
        </div>
      </div>

      <div
        ref={sliderRef}
        className="flex gap-4 overflow-x-hidden scroll-smooth pb-2"
      >
        {movies.map((movie) => (
          <div key={movie.id} className="flex-shrink-0 w-40 md:w-48">
            <MovieCard movie={movie} />
          </div>
        ))}
      </div>
    </div>
  )
}
