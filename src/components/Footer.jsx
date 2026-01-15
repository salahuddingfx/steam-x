import React, { useState, useEffect } from 'react'
import { useStore } from '../store/useStore'
import { FaUserFriends, FaCircle } from 'react-icons/fa'
import { SiReact, SiTailwindcss, SiVite, SiJavascript, SiNodedotjs } from 'react-icons/si'

export default function Footer() {
  const [currentTime, setCurrentTime] = useState(new Date())
  const { onlineUsers, initSocket } = useStore() // Use Socket Store

  useEffect(() => {
    initSocket(); // Start listening for stats
    
    const timer = setInterval(() => {
      setCurrentTime(new Date())
    }, 1000)
    return () => clearInterval(timer)
  }, [])

  const formatTime = (date) => {
    return date.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: true,
    })
  }

  const formatDate = (date) => {
    return date.toLocaleDateString('en-US', {
      weekday: 'short',
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    })
  }

  return (
    <footer className="fixed bottom-0 left-0 right-0 glass-effect-dark border-t border-neon-blue border-opacity-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          {/* Left - Clock and Date */}
          <div className="flex items-center gap-6">
            <div className="text-sm font-mono">
              <div className="text-neon-blue text-lg font-bold">{formatTime(currentTime)}</div>
              <div className="text-gray-400 text-xs">{formatDate(currentTime)}</div>
            </div>
          </div>

          {/* Center - Developer Info */}
          <div className="text-center text-xs md:text-sm text-gray-400 flex flex-col items-center">
            <p className="font-medium">Developed by <span className="text-neon-purple">Salah Uddin Kader</span></p>
             {/* Socket Stats */}
            <div className="flex items-center gap-2 mt-1 px-3 py-0.5 rounded-full bg-white/5 border border-white/5">
                <FaCircle size={8} className={`${onlineUsers > 0 ? 'text-green-500 animate-pulse' : 'text-gray-600'}`} />
                <span className="text-[10px] font-mono">{onlineUsers} Online</span>
            </div>
          </div>

          {/* Right - Tech Stack */}
          <div className="flex items-center gap-3 flex-wrap justify-center md:justify-end">
            <span className="text-xs text-gray-500">Built with:</span>
            <div className="flex gap-3 text-lg">
              <span title="React" className="text-blue-400 hover:-translate-y-1 transition-transform"><SiReact /></span>
              <span title="Tailwind CSS" className="text-cyan-400 hover:-translate-y-1 transition-transform"><SiTailwindcss /></span>
              <span title="JavaScript" className="text-yellow-400 hover:-translate-y-1 transition-transform"><SiJavascript /></span>
              <span title="Vite" className="text-purple-400 hover:-translate-y-1 transition-transform"><SiVite /></span>
              <span title="Node.js" className="text-green-500 hover:-translate-y-1 transition-transform"><SiNodedotjs /></span>
            </div>
          </div>
        </div>
      </div>
    </footer>
  )
}
