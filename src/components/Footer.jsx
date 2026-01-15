import React, { useState, useEffect } from 'react'
import { useStore } from '../store/useStore'

export default function Footer() {
  const [currentTime, setCurrentTime] = useState(new Date())
  const [opacity, setOpacity] = useState(1)
  const { onlineUsers } = useStore()

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date())
    }, 1000)
    return () => clearInterval(timer)
  }, [])

  useEffect(() => {
    const handleScroll = () => {
      const scrollPosition = window.scrollY
      const docHeight = document.documentElement.scrollHeight
      const windowHeight = window.innerHeight
      const distanceFromBottom = docHeight - (scrollPosition + windowHeight)
      
      if (distanceFromBottom < 200) {
        setOpacity(1)
      } else if (scrollPosition > 100) {
        setOpacity(0.3)
      } else {
        setOpacity(1)
      }
    }

    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  return (
    <footer 
      className="fixed bottom-0 left-0 right-0 w-full bg-dark-bg border-t border-neon-blue/20 backdrop-blur-sm z-30 transition-opacity duration-300"
      style={{ opacity: opacity }}
    >
      <div className="max-w-full mx-auto px-4 sm:px-6 lg:px-8 py-2">
        <div className="flex items-center justify-between gap-4 text-xs">
          {/* Time */}
          <div className="text-neon-blue font-mono font-bold">
            {currentTime.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: true })}
          </div>

          {/* Center Info */}
          <div className="text-gray-400 text-center">
            Stream-X Pro © 2026 • {onlineUsers || 1} Online Users
          </div>

          {/* Right Status */}
          <div className="text-green-400 text-xs font-bold flex items-center gap-1">
            <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></span>
            Live
          </div>
        </div>
      </div>
    </footer>
  )
}
