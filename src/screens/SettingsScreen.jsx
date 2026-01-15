import React from 'react'
import { FiSettings, FiMoon, FiVolume2, FiArrowLeft } from 'react-icons/fi'
import { useStore } from '../store/useStore'

export default function SettingsScreen() {
  const { setCurrentScreen, isDarkMode } = useStore()
  const [settings, setSettings] = React.useState({
    autoplay: true,
    notifications: true,
    quality: '4K',
    language: 'English',
    subtitle: 'English',
  })

  const handleSettingChange = (key, value) => {
    setSettings((prev) => ({
      ...prev,
      [key]: value,
    }))
  }

  return (
    <div className="max-w-3xl mx-auto">
      <button
        onClick={() => setCurrentScreen('home')}
        className="flex items-center gap-2 text-neon-blue hover:text-neon-purple transition-colors mb-8"
      >
        <FiArrowLeft /> Back
      </button>

      <div className="glass-effect p-8 rounded-2xl">
        <h1 className="text-3xl md:text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-neon-blue to-neon-purple mb-8 flex items-center gap-3">
          <FiSettings /> Settings
        </h1>

        <div className="space-y-6">
          {/* Playback Settings */}
          <div className="border-b border-neon-blue border-opacity-20 pb-6">
            <h2 className="text-xl font-bold text-neon-blue mb-4">Playback</h2>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-semibold">Autoplay Next</p>
                  <p className="text-sm text-gray-400">Automatically play next episode</p>
                </div>
                <input
                  type="checkbox"
                  checked={settings.autoplay}
                  onChange={(e) => handleSettingChange('autoplay', e.target.checked)}
                  className="w-5 h-5 cursor-pointer"
                />
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-semibold">Video Quality</p>
                  <p className="text-sm text-gray-400">Choose streaming quality</p>
                </div>
                <select
                  value={settings.quality}
                  onChange={(e) => handleSettingChange('quality', e.target.value)}
                  className="bg-dark-card border border-neon-blue border-opacity-30 rounded px-3 py-1 text-neon-blue focus:outline-none"
                >
                  <option>480p</option>
                  <option>720p</option>
                  <option>1080p</option>
                  <option>4K</option>
                </select>
              </div>
            </div>
          </div>

          {/* Audio & Subtitles */}
          <div className="border-b border-neon-blue border-opacity-20 pb-6">
            <h2 className="text-xl font-bold text-neon-purple mb-4 flex items-center gap-2">
              <FiVolume2 /> Audio & Subtitles
            </h2>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-semibold">Language</p>
                  <p className="text-sm text-gray-400">Default language</p>
                </div>
                <select
                  value={settings.language}
                  onChange={(e) => handleSettingChange('language', e.target.value)}
                  className="bg-dark-card border border-neon-blue border-opacity-30 rounded px-3 py-1 text-neon-blue focus:outline-none"
                >
                  <option>English</option>
                  <option>Spanish</option>
                  <option>French</option>
                  <option>German</option>
                  <option>Japanese</option>
                </select>
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-semibold">Subtitles</p>
                  <p className="text-sm text-gray-400">Default subtitle language</p>
                </div>
                <select
                  value={settings.subtitle}
                  onChange={(e) => handleSettingChange('subtitle', e.target.value)}
                  className="bg-dark-card border border-neon-blue border-opacity-30 rounded px-3 py-1 text-neon-blue focus:outline-none"
                >
                  <option>English</option>
                  <option>Spanish</option>
                  <option>French</option>
                  <option>Off</option>
                </select>
              </div>
            </div>
          </div>

          {/* Notifications */}
          <div className="border-b border-neon-blue border-opacity-20 pb-6">
            <h2 className="text-xl font-bold text-neon-blue mb-4">Notifications</h2>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-semibold">Email Notifications</p>
                  <p className="text-sm text-gray-400">Get notified about new releases</p>
                </div>
                <input
                  type="checkbox"
                  checked={settings.notifications}
                  onChange={(e) => handleSettingChange('notifications', e.target.checked)}
                  className="w-5 h-5 cursor-pointer"
                />
              </div>
            </div>
          </div>

          {/* Theme */}
          <div className="pb-6">
            <h2 className="text-xl font-bold text-neon-purple mb-4 flex items-center gap-2">
              <FiMoon /> Theme
            </h2>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-semibold">Dark Mode</p>
                  <p className="text-sm text-gray-400">Always enabled for premium experience</p>
                </div>
                <input
                  type="checkbox"
                  checked={isDarkMode}
                  disabled
                  className="w-5 h-5 cursor-not-allowed opacity-50"
                />
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-4 pt-6">
            <button className="flex-1 bg-gradient-to-r from-neon-blue to-neon-purple hover:shadow-glow-intense text-white font-bold py-3 rounded-lg transition-all">
              Save Changes
            </button>
            <button
              onClick={() => setCurrentScreen('home')}
              className="flex-1 border border-neon-blue text-neon-blue font-bold py-3 rounded-lg hover:bg-neon-blue hover:text-dark-bg transition-all"
            >
              Cancel
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
