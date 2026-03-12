import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { FiSearch, FiUser, FiMenu, FiX, FiCode, FiBell } from 'react-icons/fi'
import { useStore } from '../store/useStore'
import DeveloperModal from './DeveloperModal'

const NAV_LINKS = [
  { label: 'Home',      screen: 'home' },
  { label: 'Continue',  screen: 'continue' },
  { label: 'Favorites', screen: 'favorites' },
]

export default function Navbar() {
  const { setCurrentScreen, handleSearch, searchQuery, currentScreen, user, setShowAuthModal, logout } = useStore()
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const [showDeveloper, setShowDeveloper] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const [searchOpen, setSearchOpen] = useState(false)

  // Darken navbar on scroll
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20)
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  const goTo = (screen) => {
    setCurrentScreen(screen)
    setIsMobileMenuOpen(false)
  }

  return (
    <>
      {/* ─── NAVBAR ─────────────────────────────────────────── */}
      <motion.nav
        initial={{ y: -80, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.5, ease: 'easeOut' }}
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
          scrolled
            ? 'bg-[#060c14]/95 shadow-[0_4px_32px_rgba(0,0,0,0.6)] backdrop-blur-xl border-b border-neon-blue/20'
            : 'bg-gradient-to-b from-[#060c14]/90 to-transparent backdrop-blur-sm'
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16 gap-4">

            {/* ── Logo ── */}
            <motion.div
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.97 }}
              className="flex-shrink-0 flex items-center gap-2 cursor-pointer select-none"
              onClick={() => goTo('home')}
            >
              <span className="text-2xl font-black text-transparent bg-clip-text bg-gradient-to-r from-neon-blue to-purple-500 tracking-tight">
                STREAM-X
              </span>
              <motion.div
                whileHover={{ rotate: 20, scale: 1.2 }}
                transition={{ type: 'spring', stiffness: 300 }}
                className="p-1 bg-white/10 rounded-full cursor-help"
                title="Developer Profile"
                onClick={(e) => { e.stopPropagation(); setShowDeveloper(true) }}
              >
                <FiCode className="text-neon-blue text-xs" />
              </motion.div>
            </motion.div>

            {/* ── Desktop Nav Links ── */}
            <div className="hidden md:flex items-center gap-1">
              {NAV_LINKS.map(({ label, screen }) => (
                <motion.button
                  key={screen}
                  onClick={() => goTo(screen)}
                  whileHover={{ scale: 1.08 }}
                  whileTap={{ scale: 0.93 }}
                  className={`relative px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
                    currentScreen === screen
                      ? 'text-neon-blue'
                      : 'text-gray-400 hover:text-white'
                  }`}
                >
                  {label}
                  {currentScreen === screen && (
                    <motion.span
                      layoutId="nav-pill"
                      className="absolute inset-0 rounded-lg bg-neon-blue/10 border border-neon-blue/30"
                      transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                    />
                  )}
                </motion.button>
              ))}
            </div>

            {/* ── Desktop Search + Icons ── */}
            <div className="hidden md:flex items-center gap-3 flex-1 justify-end max-w-xs">
              <AnimatePresence>
                {searchOpen ? (
                  <motion.div
                    key="search-box"
                    initial={{ width: 0, opacity: 0 }}
                    animate={{ width: 220, opacity: 1 }}
                    exit={{ width: 0, opacity: 0 }}
                    transition={{ duration: 0.25, ease: 'easeInOut' }}
                    className="relative overflow-hidden"
                  >
                    <input
                      autoFocus
                      type="text"
                      placeholder="Search movies..."
                      className="w-full bg-dark-card/80 border border-neon-blue/30 rounded-lg py-2 pl-4 pr-9 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-neon-blue focus:ring-1 focus:ring-neon-blue"
                      value={searchQuery}
                      onChange={(e) => handleSearch(e.target.value)}
                      onBlur={() => { if (!searchQuery) setSearchOpen(false) }}
                    />
                    <FiSearch className="absolute right-3 top-2.5 text-neon-blue/60 text-sm" />
                  </motion.div>
                ) : (
                  <motion.button
                    key="search-icon"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    whileHover={{ scale: 1.15 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={() => setSearchOpen(true)}
                    className="p-2 text-gray-400 hover:text-neon-blue rounded-lg hover:bg-white/5 transition-colors"
                  >
                    <FiSearch size={18} />
                  </motion.button>
                )}
              </AnimatePresence>

              <motion.button
                whileHover={{ scale: 1.15 }}
                whileTap={{ scale: 0.9 }}
                onClick={() => goTo('profile')}
                className="p-2 text-gray-400 hover:text-neon-blue rounded-lg hover:bg-white/5 transition-colors"
              >
                <FiUser size={18} />
              </motion.button>

              {user ? (
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={logout}
                  className="text-xs px-3 py-1.5 rounded-lg border border-red-500/40 text-red-400 hover:bg-red-500/10 transition-colors"
                >
                  Logout
                </motion.button>
              ) : (
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setShowAuthModal(true)}
                  className="text-xs px-4 py-1.5 rounded-lg bg-gradient-to-r from-neon-blue to-purple-500 text-white font-semibold hover:opacity-90 transition-opacity shadow-md shadow-neon-blue/20"
                >
                  Sign In
                </motion.button>
              )}
            </div>

            {/* ── Mobile: search + hamburger ── */}
            <div className="md:hidden flex items-center gap-2">
              <motion.button
                whileTap={{ scale: 0.85 }}
                onClick={() => setSearchOpen((p) => !p)}
                className="p-2 text-gray-400 hover:text-neon-blue"
              >
                <FiSearch size={20} />
              </motion.button>
              <motion.button
                whileTap={{ scale: 0.85 }}
                onClick={() => setIsMobileMenuOpen((p) => !p)}
                className="p-2 text-neon-blue"
              >
                <AnimatePresence mode="wait" initial={false}>
                  {isMobileMenuOpen ? (
                    <motion.span key="x" initial={{ rotate: -90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: 90, opacity: 0 }} transition={{ duration: 0.18 }}>
                      <FiX size={22} />
                    </motion.span>
                  ) : (
                    <motion.span key="menu" initial={{ rotate: 90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: -90, opacity: 0 }} transition={{ duration: 0.18 }}>
                      <FiMenu size={22} />
                    </motion.span>
                  )}
                </AnimatePresence>
              </motion.button>
            </div>
          </div>

          {/* ── Mobile Search Bar ── */}
          <AnimatePresence>
            {searchOpen && (
              <motion.div
                key="mobile-search"
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.2 }}
                className="md:hidden overflow-hidden pb-3"
              >
                <input
                  autoFocus
                  type="text"
                  placeholder="Search movies, genres..."
                  className="w-full bg-dark-card/70 border border-neon-blue/20 rounded-lg py-2 px-4 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-neon-blue"
                  value={searchQuery}
                  onChange={(e) => handleSearch(e.target.value)}
                />
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* ── Mobile Dropdown Menu ── */}
        <AnimatePresence>
          {isMobileMenuOpen && (
            <motion.div
              key="mobile-menu"
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.25, ease: 'easeInOut' }}
              className="md:hidden overflow-hidden bg-[#060c14]/98 border-t border-neon-blue/10"
            >
              <div className="px-4 py-3 space-y-1">
                {NAV_LINKS.map(({ label, screen }, i) => (
                  <motion.button
                    key={screen}
                    initial={{ x: -20, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    transition={{ delay: i * 0.06 }}
                    onClick={() => goTo(screen)}
                    className={`block w-full text-left px-4 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                      currentScreen === screen
                        ? 'text-neon-blue bg-neon-blue/10'
                        : 'text-gray-300 hover:text-white hover:bg-white/5'
                    }`}
                  >
                    {label}
                  </motion.button>
                ))}
                <motion.button
                  initial={{ x: -20, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  transition={{ delay: 0.18 }}
                  onClick={() => goTo('profile')}
                  className="block w-full text-left px-4 py-2.5 rounded-lg text-sm font-medium text-gray-300 hover:text-white hover:bg-white/5 transition-colors"
                >
                  Profile
                </motion.button>
                <div className="pt-2 border-t border-white/5">
                  {user ? (
                    <motion.button
                      initial={{ x: -20, opacity: 0 }}
                      animate={{ x: 0, opacity: 1 }}
                      transition={{ delay: 0.24 }}
                      onClick={() => { logout(); setIsMobileMenuOpen(false) }}
                      className="w-full text-sm px-4 py-2.5 rounded-lg text-red-400 hover:bg-red-500/10 text-left transition-colors"
                    >
                      Logout
                    </motion.button>
                  ) : (
                    <motion.button
                      initial={{ x: -20, opacity: 0 }}
                      animate={{ x: 0, opacity: 1 }}
                      transition={{ delay: 0.24 }}
                      onClick={() => { setShowAuthModal(true); setIsMobileMenuOpen(false) }}
                      className="w-full text-sm px-4 py-2.5 rounded-lg bg-gradient-to-r from-neon-blue to-purple-500 text-white font-semibold"
                    >
                      Sign In
                    </motion.button>
                  )}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.nav>

      {showDeveloper && <DeveloperModal onClose={() => setShowDeveloper(false)} />}
    </>
  )
}
