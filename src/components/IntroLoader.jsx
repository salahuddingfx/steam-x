import React, { useEffect, useState } from 'react'

export default function IntroLoader() {
  const [isVisible, setIsVisible] = useState(true)
  const [progress, setProgress] = useState(0)

  useEffect(() => {
    const progressInterval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          clearInterval(progressInterval)
          return 100
        }
        return prev + Math.random() * 30
      })
    }, 200)

    const hideTimer = setTimeout(() => {
      setIsVisible(false)
    }, 2500) // Slightly faster load

    // Safety timeout - Force remove loader after 5s no matter what
    const safetyTimer = setTimeout(() => {
       setIsVisible(false)
    }, 5000)

    return () => {
      clearInterval(progressInterval)
      clearTimeout(hideTimer)
      clearTimeout(safetyTimer)
    }
  }, [])

  if (!isVisible) return null

  return (
    <div className="fixed inset-0 bg-dark-bg z-50 flex items-center justify-center overflow-hidden">
      {/* Animated background */}
      <div className="absolute inset-0 opacity-30">
        <div className="absolute top-10 left-10 w-72 h-72 bg-neon-blue rounded-full filter blur-3xl opacity-20 animate-float"></div>
        <div className="absolute bottom-10 right-10 w-72 h-72 bg-neon-purple rounded-full filter blur-3xl opacity-20 animate-float" style={{animationDelay: '1s'}}></div>
      </div>

      {/* Content */}
      <div className="relative z-10 flex flex-col items-center justify-center">
        {/* Logo */}
        <div className="mb-8 animate-pulse-slow">
          <div className="text-6xl font-black text-transparent bg-clip-text bg-gradient-to-r from-neon-blue to-neon-purple">
            STREAMX
          </div>
        </div>

        {/* Typing animation text */}
        <div className="mb-12 h-8 flex items-center">
          <span className="text-xl text-neon-blue font-mono border-r-2 border-neon-blue pr-1">
            Initializing StreamX...
          </span>
        </div>

        {/* Loading bar */}
        <div className="w-64 h-1 bg-dark-card rounded-full overflow-hidden">
          <div 
            className="h-full bg-gradient-to-r from-neon-blue to-neon-purple transition-all duration-300"
            style={{ width: `${Math.min(progress, 100)}%` }}
          ></div>
        </div>

        {/* Progress text */}
        <div className="mt-4 text-sm text-gray-500 font-mono">
          {Math.floor(Math.min(progress, 100))}%
        </div>
      </div>
    </div>
  )
}
