import React from 'react'
import { motion } from 'framer-motion'
import { FiChevronLeft, FiChevronRight } from 'react-icons/fi'
import MovieCard from './MovieCard'

export default React.memo(function MovieSlider({ title, movies }) {
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
    <motion.div
      initial={{ opacity: 0 }}
      whileInView={{ opacity: 1 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5 }}
      className="mb-12"
    >
      <motion.div
        initial={{ x: -20, opacity: 0 }}
        whileInView={{ x: 0, opacity: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 0.4 }}
        className="flex items-center justify-between mb-6"
      >
        <motion.h2
          className="text-2xl md:text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-neon-blue to-neon-purple"
          whileHover={{ scale: 1.05 }}
        >
          {title}
        </motion.h2>
        <div className="flex gap-2">
          <motion.button
            whileHover={{ scale: 1.15, backgroundColor: 'rgba(255,255,255,0.1)' }}
            whileTap={{ scale: 0.9 }}
            onClick={() => scroll('left')}
            className="p-2 rounded-full transition-all text-neon-blue"
          >
            <FiChevronLeft size={24} />
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.15, backgroundColor: 'rgba(255,255,255,0.1)' }}
            whileTap={{ scale: 0.9 }}
            onClick={() => scroll('right')}
            className="p-2 rounded-full transition-all text-neon-blue"
          >
            <FiChevronRight size={24} />
          </motion.button>
        </div>
      </motion.div>

      <div
        ref={sliderRef}
        className="flex gap-4 overflow-x-hidden scroll-smooth pb-2"
      >
        {movies.map((movie, index) => (
          <div key={movie._id || movie.tmdbId || index} className="flex-shrink-0 w-40 md:w-48">
            <MovieCard movie={movie} index={index} />
          </div>
        ))}
      </div>
    </motion.div>
  )
})
