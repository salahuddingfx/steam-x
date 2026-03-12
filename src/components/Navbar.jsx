import React, { useState, useEffect } from 'react'
import { FiSearch, FiUser, FiMenu, FiX, FiCode } from 'react-icons/fi'
import { useStore } from '../store/useStore'
import { mockMovies } from '../data/mockData'
import DeveloperModal from './DeveloperModal'

export default function Navbar() {
  const { setCurrentScreen, handleSearch, searchQuery, user, showAuthModal, setShowAuthModal, logout } = useStore()
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const [isSearchActive, setIsSearchActive] = useState(false)
  const [showDeveloper, setShowDeveloper] = useState(false)

  const onSearchChange = (query) => {
     handleSearch(query)
  }

  return (
    <>
    <nav className="sticky top-0 left-0 right-0 bg-gradient-to-b from-dark-bg to-dark-bg/80 backdrop-blur-md border-b border-neon-blue/20 z-40 shadow-lg shadow-black/30">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <div 
            className="flex-shrink-0 cursor-pointer flex items-center gap-2"
            onClick={() => setCurrentScreen('home')}
          >
            <span className="text-2xl font-black text-transparent bg-clip-text bg-gradient-to-r from-neon-blue to-purple-600">
               STREAM-X
            </span>
            <div 
               className="p-1 bg-white/10 rounded-full hover:bg-white/20 transition-all cursor-help" 
               title="Developer Profile"
               onClick={(e) => { e.stopPropagation(); setShowDeveloper(true); }}
            >
                <FiCode className="text-neon-blue text-xs" />
            </div>
          </div>

          {/* Desktop Search */}
          <div className="hidden md:flex flex-1 max-w-xs mx-8">
            <div className="relative w-full">
              <input
                type="text"
                placeholder="Search movies, genres..."
                className="w-full bg-dark-card bg-opacity-50 border border-neon-blue border-opacity-30 rounded-lg py-2 px-4 text-sm text-white placeholder-gray-400 focus:outline-none focus:border-neon-blue focus:ring-1 focus:ring-neon-blue transition-all"
                value={searchQuery}
                onChange={(e) => onSearchChange(e.target.value)}
              />
              <FiSearch className="absolute right-3 top-2.5 text-neon-blue opacity-50" />
            </div>
          </div>

          {/* Desktop Nav */}
          <div className="hidden md:flex items-center gap-6">
            <button
              onClick={() => setCurrentScreen('home')}
              className="text-gray-300 hover:text-neon-blue transition-colors text-sm font-medium"
            >
              Home
            </button>
            <button
              onClick={() => setCurrentScreen('continue')}
              className="text-gray-300 hover:text-neon-blue transition-colors text-sm font-medium"
            >
              Continue
            </button>
            <button
              onClick={() => setCurrentScreen('favorites')}
              className="text-gray-300 hover:text-neon-blue transition-colors text-sm font-medium"
            >
              Favorites
            </button>
            <button
              onClick={() => setCurrentScreen('profile')}
              className="p-2 hover:bg-dark-card rounded-lg transition-all"
            >
              <FiUser className="text-xl text-neon-blue" />
            </button>
          </div>

          {/* Mobile Menu Button */}
          <div className="md:hidden">
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="p-2 text-neon-blue"
            >
              {isMobileMenuOpen ? <FiX size={24} /> : <FiMenu size={24} />}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {isMobileMenuOpen && (
          <div className="md:hidden pb-4 border-t border-neon-blue border-opacity-20 mt-2">
            <div className="mb-4">
              <input
                type="text"
                placeholder="Search movies..."
                className="w-full bg-dark-card bg-opacity-50 border border-neon-blue border-opacity-30 rounded-lg py-2 px-4 text-sm text-white placeholder-gray-400 focus:outline-none"
                value={searchQuery}
                onChange={(e) => handleSearch(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <button
                onClick={() => {
                  setCurrentScreen('home')
                  setIsMobileMenuOpen(false)
                }}
                className="block w-full text-left px-4 py-2 text-gray-300 hover:text-neon-blue hover:bg-dark-card rounded transition-all"
              >
                Home
              </button>
              <button
                onClick={() => {
                  setCurrentScreen('continue')
                  setIsMobileMenuOpen(false)
                }}
                className="block w-full text-left px-4 py-2 text-gray-300 hover:text-neon-blue hover:bg-dark-card rounded transition-all"
              >
                Continue Watching
              </button>
              <button
                onClick={() => {
                  setCurrentScreen('favorites')
                  setIsMobileMenuOpen(false)
                }}
                className="block w-full text-left px-4 py-2 text-gray-300 hover:text-neon-blue hover:bg-dark-card rounded transition-all"
              >
                Favorites
              </button>
              <button
                onClick={() => {
                  setCurrentScreen('profile')
                  setIsMobileMenuOpen(false)
                }}
                className="block w-full text-left px-4 py-2 text-gray-300 hover:text-neon-blue hover:bg-dark-card rounded transition-all"
              >
                Profile
              </button>
            </div>
          </div>
        )}
      </div>
    </nav>
    {showDeveloper && <DeveloperModal onClose={() => setShowDeveloper(false)} />}
    </>
  )
}
