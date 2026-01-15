import React, { useState, useEffect } from 'react'
import { useStore } from '../store/useStore'
import { SiReact, SiTailwindcss, SiVite, SiJavascript, SiNodedotjs } from 'react-icons/si'

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
        setOpacity(0.4)
      } else {
        setOpacity(1)
      }
    }

    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  const timeString = currentTime.toLocaleTimeString('en-US', { 
    hour: '2-digit', 
    minute: '2-digit', 
    second: '2-digit', 
    hour12: true 
  })

  const dateString = currentTime.toLocaleDateString('en-US', {
    weekday: 'short',
    month: 'short',
    day: '2-digit',
    year: 'numeric'
  })

  return (
    <footer 
      className="fixed bottom-0 left-0 right-0 w-full bg-dark-bg/90 border-t border-neon-blue/20 backdrop-blur-sm z-40 transition-opacity duration-300"
      style={{ opacity: opacity }}
    >
      <div className="max-w-full mx-auto px-4 sm:px-6 lg:px-8 py-3">
        <div className="flex items-center justify-between gap-4">
          
          {/* Left - Time & Date */}
          <div className="flex items-center gap-3">
            <div className="text-left">
              <div className="text-neon-blue font-mono font-bold text-base">{timeString}</div>
              <div className="text-gray-400 text-xs">{dateString}</div>
            </div>
          </div>

          {/* Center - Developer Info */}
          <div className="text-center flex-1">
            <span className="text-gray-400 text-xs">Developed by </span>
            <span className="text-neon-purple font-bold">{`Salah Uddin Kader`}</span>
            <span className="text-gray-400 text-xs ml-2">• </span>
            <span className="text-green-400 text-xs ml-2 inline-flex items-center gap-1">
              <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></span>
              {onlineUsers || 1} Online
            </span>
          </div>

          {/* Right - Built With Icons */}
          <div className="flex items-center gap-3">
            <span className="text-gray-400 text-xs">Built with:</span>
            <div className="flex gap-2">
              <SiReact className="text-blue-400 text-lg hover:scale-110 transition-transform" title="React" />
              <SiTailwindcss className="text-cyan-400 text-lg hover:scale-110 transition-transform" title="Tailwind" />
              <SiVite className="text-purple-400 text-lg hover:scale-110 transition-transform" title="Vite" />
              <SiJavascript className="text-yellow-400 text-lg hover:scale-110 transition-transform" title="JavaScript" />
              <SiNodedotjs className="text-green-500 text-lg hover:scale-110 transition-transform" title="Node.js" />
            </div>
          </div>
        </div>
      </div>
    </footer>
  )
}
