import React, { useState, useEffect, Suspense, lazy } from 'react'
import IntroLoader from './components/IntroLoader'
import Navbar from './components/Navbar'
import Footer from './components/Footer'
import MovieDetailModal from './components/MovieDetailModal'
import PlayerModal from './components/PlayerModal'
import AuthModal from './components/AuthModal'

import HomeScreen from './screens/HomeScreen'

// Lazy load non-critical screens for code splitting
const SearchScreen = lazy(() => import('./screens/SearchScreen'))
const ContinueWatchingScreen = lazy(() => import('./screens/ContinueWatchingScreen'))
const FavoritesScreen = lazy(() => import('./screens/FavoritesScreen'))
const ProfileScreen = lazy(() => import('./screens/ProfileScreen'))
const SettingsScreen = lazy(() => import('./screens/SettingsScreen'))
const DeveloperProfileScreen = lazy(() => import('./screens/DeveloperProfileScreen'))
const MovieExtractorScreen = lazy(() => import('./screens/MovieExtractorScreen'))

// Loading fallback component
const ScreenLoader = () => (
  <div className="flex items-center justify-center min-h-screen">
    <div className="w-8 h-8 border-4 border-neon-blue/20 border-t-neon-blue rounded-full animate-spin" />
  </div>
)

import { useStore } from './store/useStore'

export default function App() {
  const { currentScreen, hydrateAuth, initSocket } = useStore()
  const [showLoader, setShowLoader] = useState(true)

  useEffect(() => {
    initSocket()
    hydrateAuth()

    const timer = setTimeout(() => setShowLoader(false), 3000)

    // Keep backend alive on Render free tier.
    // Render shuts down after 15 min inactivity — we ping every 55s.
    const API_URL = import.meta.env.PROD
      ? 'https://steam-x.onrender.com'
      : 'http://localhost:5000'

    const keepAlive = setInterval(() => {
      fetch(`${API_URL}/api/ping`).catch(() => {})
    }, 55 * 1000)

    return () => {
      clearTimeout(timer)
      clearInterval(keepAlive)
    }
  }, [hydrateAuth, initSocket])

  const renderScreen = () => {
    switch (currentScreen) {
      case 'home':
        return <HomeScreen />
      case 'search':
        return <SearchScreen />
      case 'continue':
        return <ContinueWatchingScreen />
      case 'favorites':
        return <FavoritesScreen />
      case 'profile':
        return <ProfileScreen />
      case 'settings':
        return <SettingsScreen />
      case 'developer':
        return <DeveloperProfileScreen />
      case 'extractor':
        return <MovieExtractorScreen />
      default:
        return <HomeScreen />
    }
  }

  return (
    <div className="min-h-screen bg-dark-bg text-white overflow-x-hidden">
      {showLoader && <IntroLoader />}

      <Navbar />

      {/* Main Content */}
      <main className="pt-24 pb-32 px-4 md:px-6 lg:px-8 max-w-7xl mx-auto">
        <Suspense fallback={<ScreenLoader />}>
          {renderScreen()}
        </Suspense>
      </main>

      {/* Modals */}
      <MovieDetailModal />
      <PlayerModal />
      <AuthModal />

      {/* Fixed Footer */}
      <Footer />
    </div>
  )
}
