import React, { useState, useEffect } from 'react'
import IntroLoader from './components/IntroLoader'
import Navbar from './components/Navbar'
import Footer from './components/Footer'
import MovieDetailModal from './components/MovieDetailModal'
import PlayerModal from './components/PlayerModal'
import AuthModal from './components/AuthModal'

import HomeScreen from './screens/HomeScreen'
import SearchScreen from './screens/SearchScreen'
import ContinueWatchingScreen from './screens/ContinueWatchingScreen'
import FavoritesScreen from './screens/FavoritesScreen'
import ProfileScreen from './screens/ProfileScreen'
import SettingsScreen from './screens/SettingsScreen'
import DeveloperProfileScreen from './screens/DeveloperProfileScreen'
import MovieExtractorScreen from './screens/MovieExtractorScreen'

import { useStore } from './store/useStore'

export default function App() {
  const { currentScreen } = useStore()
  const [showLoader, setShowLoader] = useState(true)

  useEffect(() => {
    const timer = setTimeout(() => setShowLoader(false), 3000)
    return () => clearTimeout(timer)
  }, [])

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

      {/* Main Content - pb-64 এ বড় padding যাতে footer জায়গা না দখল করে */}
      <main className="pt-24 pb-20 px-4 md:px-6 lg:px-8 max-w-7xl mx-auto">
        {renderScreen()}
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
