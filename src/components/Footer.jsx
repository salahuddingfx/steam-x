import React, { useEffect, useMemo, useState } from 'react'
import { useStore } from '../store/useStore'
import { SiJavascript, SiNodedotjs, SiReact, SiTailwindcss, SiVite } from 'react-icons/si'

export default function Footer() {
  const [currentTime, setCurrentTime] = useState(new Date())
  const { onlineUsers } = useStore()

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000)
    return () => clearInterval(timer)
  }, [])

  const timeString = useMemo(() => (
    currentTime.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: true,
    })
  ), [currentTime])

  const dateString = useMemo(() => (
    currentTime.toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: '2-digit',
      year: 'numeric',
    })
  ), [currentTime])

  return (
    <footer className="fixed bottom-0 left-0 right-0 z-30 border-t border-emerald-400/20 bg-[linear-gradient(120deg,rgba(6,18,28,0.97),rgba(8,28,32,0.96),rgba(21,16,34,0.96))] backdrop-blur-md shadow-[0_-4px_24px_rgba(0,0,0,0.5)]">
      <div className="absolute inset-0 pointer-events-none bg-[radial-gradient(circle_at_10%_20%,rgba(16,185,129,0.12),transparent_36%),radial-gradient(circle_at_90%_40%,rgba(14,165,233,0.12),transparent_40%)]" />

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6 items-center text-center md:text-left">
          <div>
            <div className="text-emerald-300 font-mono font-semibold tracking-wide">{timeString}</div>
            <div className="text-slate-300 text-xs mt-1">{dateString}</div>
          </div>

          <div className="text-sm text-slate-200">
            <span className="text-slate-400">Built by </span>
            <span className="font-semibold text-cyan-300">Salah Uddin Kader</span>
            <div className="mt-2 text-xs text-slate-300 inline-flex items-center justify-center md:justify-start gap-2">
              <span className="inline-block w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              {onlineUsers || 1} online now
            </div>
          </div>

          <div className="flex items-center justify-center md:justify-end gap-3 text-lg">
            <SiReact className="text-sky-400" title="React" />
            <SiTailwindcss className="text-cyan-300" title="Tailwind" />
            <SiVite className="text-amber-300" title="Vite" />
            <SiJavascript className="text-yellow-300" title="JavaScript" />
            <SiNodedotjs className="text-green-400" title="Node.js" />
          </div>
        </div>
      </div>
    </footer>
  )
}
