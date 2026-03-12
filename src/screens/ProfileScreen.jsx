import React from 'react'
import { FiLogOut, FiSettings, FiUser } from 'react-icons/fi'
import { useStore } from '../store/useStore'

export default function ProfileScreen() {
  const { user, setCurrentScreen, setShowAuthModal, logout } = useStore()

  if (!user) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] text-center px-4">
        <div className="w-24 h-24 bg-dark-card rounded-full flex items-center justify-center mb-6 border-2 border-dashed border-gray-600">
           <FiUser className="text-4xl text-gray-500" />
        </div>
        <h2 className="text-3xl font-bold mb-3">Not Logged In</h2>
        <p className="text-gray-400 mb-8 max-w-md">
          Log in to sync your watchlist, track your watching history across devices, and unlock premium features.
        </p>
        <button
          onClick={() => setShowAuthModal(true)}
          className="bg-neon-blue hover:bg-blue-600 text-black font-bold py-3 px-10 rounded-xl transition-all shadow-lg shadow-blue-500/20"
        >
          Login / Register
        </button>
      </div>
    )
  }

  // Fallback for avatar/stats if not present
  const avatar = user.avatar || `https://ui-avatars.com/api/?name=${user.name}&background=0D8ABC&color=fff`
  const stats = {
     watched: user.watchedCount || 0,
     hours: user.totalHours || 0,
     favorites: user.favoriteCount || 0
  }

  return (
    <div className="max-w-3xl mx-auto">
      {/* Profile Header */}
      <div className="glass-effect p-8 rounded-2xl mb-8">
        <div className="flex flex-col md:flex-row items-center gap-8 mb-8">
          <div className="flex-shrink-0">
            <img
              src={avatar}
              alt={user.name}
              className="w-32 h-32 rounded-full border-4 border-neon-blue object-cover"
            />
          </div>
          <div className="flex-1 text-center md:text-left">
             <h1 className="text-4xl font-bold mb-2">{user.name}</h1>
            <p className="text-gray-400 mb-4">Member</p>
            <div className="flex flex-col md:flex-row gap-6 justify-center md:justify-start">
              <div>
                <p className="text-2xl font-bold text-neon-blue">{stats.watched}</p>
                <p className="text-gray-400 text-sm">Movies Watched</p>
              </div>
              <div>
                <p className="text-2xl font-bold text-neon-purple">{stats.favorites}</p>
                <p className="text-gray-400 text-sm">Favorites</p>
              </div>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
           {/* Settings - Placeholder */}
           <button className="flex items-center justify-center gap-2 p-4 bg-dark-card rounded-xl hover:bg-gray-700 transition-all font-medium">
             <FiSettings /> Settings
           </button>
           
           {/* Logout */}
           <button 
             onClick={logout}
             className="flex items-center justify-center gap-2 p-4 bg-red-500/10 text-red-500 rounded-xl hover:bg-red-500 hover:text-white transition-all font-bold border border-red-500/20"
           >
             <FiLogOut /> Sign Out
           </button>
        </div>
      </div>
    </div>
  )
}

