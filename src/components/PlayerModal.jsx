import React, { useEffect, useRef, useState } from 'react'
import {
  FiAlertTriangle,
  FiExternalLink,
  FiMaximize2,
  FiPause,
  FiPlay,
  FiRotateCcw,
  FiRotateCw,
  FiVolume2,
  FiX,
} from 'react-icons/fi'
import { useStore } from '../store/useStore'

export default function PlayerModal() {
  const {
    selectedMovie,
    showPlayer,
    setShowPlayer,
    playerTime,
    setPlayerTime,
    setWatchProgress,
  } = useStore()

  const videoRef = useRef(null)
  const containerRef = useRef(null)

  const API_URL = import.meta.env.PROD
    ? 'https://steam-x.onrender.com'
    : 'http://localhost:5000'

  const [resolvedMovie, setResolvedMovie] = useState(null)
  const [streamCandidates, setStreamCandidates] = useState([])
  const [currentSourceIndex, setCurrentSourceIndex] = useState(0)
  const [providers, setProviders] = useState([])
  const [isLoadingSource, setIsLoadingSource] = useState(false)
  const [sourceError, setSourceError] = useState('')

  const [isPlaying, setIsPlaying] = useState(false)
  const [isBuffering, setIsBuffering] = useState(false)
  const [isMuted, setIsMuted] = useState(false)
  const [volume, setVolume] = useState(80)
  const [duration, setDuration] = useState(selectedMovie?.duration * 60 || 0)
  const [bufferedPercent, setBufferedPercent] = useState(0)
  const [playbackRate, setPlaybackRate] = useState(1)
  const [showControls, setShowControls] = useState(true)
  const [isFullscreen, setIsFullscreen] = useState(false)

  const movie = resolvedMovie || selectedMovie
  const streamUrl = streamCandidates[currentSourceIndex] || ''

  const currentYear = new Date().getFullYear()
  const isFutureMovie = movie?.year > currentYear

  useEffect(() => {
    if (!showPlayer || !selectedMovie) return

    const loadPlayback = async () => {
      setIsLoadingSource(true)
      setSourceError('')
      setResolvedMovie(null)
      setProviders([])
      setStreamCandidates([])
      setCurrentSourceIndex(0)
      setDuration((selectedMovie?.duration || 0) * 60)
      setBufferedPercent(0)

      try {
        const id = selectedMovie._id || selectedMovie.id || selectedMovie.tmdbId
        const res = await fetch(`${API_URL}/api/movies/${id}`)
        const data = await res.json()

        if (!res.ok || data?.error) {
          throw new Error(data?.error || 'Could not load playback source')
        }

        setResolvedMovie(data)

        const availableProviders = Array.isArray(data.streamingOptions)
          ? data.streamingOptions
          : []
        setProviders(availableProviders)

        const rawCandidates = Array.isArray(data?.playback?.streamCandidates)
          ? data.playback.streamCandidates
          : data?.playback?.streamUrl
            ? [data.playback.streamUrl]
            : []

        const normalizedCandidates = rawCandidates
          .filter(Boolean)
          .map((candidate) => {
            if (candidate.startsWith('http')) return candidate
            return `${API_URL}${candidate}`
          })

        if (normalizedCandidates.length > 0) {
          setStreamCandidates(normalizedCandidates)
        } else {
          setSourceError('No ad-free archive stream found for this title yet. Use official providers below.')
        }
      } catch (error) {
        setSourceError(error.message || 'Playback loading failed')
      } finally {
        setIsLoadingSource(false)
      }
    }

    loadPlayback()
  }, [showPlayer, selectedMovie, API_URL])

  useEffect(() => {
    if (!videoRef.current) return

    videoRef.current.volume = volume / 100
    videoRef.current.muted = isMuted
    videoRef.current.playbackRate = playbackRate
  }, [volume, isMuted, playbackRate])

  useEffect(() => {
    const onFullscreenChange = () => setIsFullscreen(Boolean(document.fullscreenElement))
    document.addEventListener('fullscreenchange', onFullscreenChange)
    return () => document.removeEventListener('fullscreenchange', onFullscreenChange)
  }, [])

  useEffect(() => {
    if (!videoRef.current || !streamUrl) return

    setIsBuffering(true)
    setSourceError('')
    videoRef.current.load()
  }, [streamUrl])

  const handleClose = () => {
    if (selectedMovie && playerTime > 0 && duration > 0) {
      const progress = Math.min((playerTime / duration) * 100, 100)
      setWatchProgress(selectedMovie.id || selectedMovie._id, progress)
    }

    setIsPlaying(false)
    setStreamCandidates([])
    setCurrentSourceIndex(0)
    setResolvedMovie(null)
    setProviders([])
    setShowPlayer(false)
  }

  const handleLoadedMetadata = () => {
    if (!videoRef.current) return

    const nextDuration = Math.floor(videoRef.current.duration || duration || 0)
    setDuration(nextDuration)

    if (playerTime > 0 && playerTime < (videoRef.current.duration || 0)) {
      videoRef.current.currentTime = playerTime
    }
  }

  const togglePlay = async () => {
    if (!videoRef.current || !streamUrl) return

    try {
      if (videoRef.current.paused) {
        await videoRef.current.play()
        setIsPlaying(true)
      } else {
        videoRef.current.pause()
        setIsPlaying(false)
      }
    } catch (e) {
      setSourceError('Autoplay blocked. Press Play to start manually.')
    }
  }

  const seekBy = (seconds) => {
    if (!videoRef.current) return

    const total = duration || videoRef.current.duration || 0
    const next = Math.max(0, Math.min(videoRef.current.currentTime + seconds, total))
    videoRef.current.currentTime = next
    setPlayerTime(Math.floor(next))
  }

  const onTimeUpdate = () => {
    if (!videoRef.current) return

    setPlayerTime(Math.floor(videoRef.current.currentTime || 0))

    if (videoRef.current.buffered?.length) {
      const end = videoRef.current.buffered.end(videoRef.current.buffered.length - 1)
      const total = videoRef.current.duration || duration || 0
      if (total > 0) {
        setBufferedPercent(Math.min((end / total) * 100, 100))
      }
    }
  }

  const handleVideoError = () => {
    if (currentSourceIndex < streamCandidates.length - 1) {
      setSourceError('Playback source failed. Switching source...')
      setCurrentSourceIndex((prev) => prev + 1)
      return
    }

    setSourceError('All playback sources failed. Please use official providers below.')
  }

  const toggleFullscreen = () => {
    const el = containerRef.current
    if (!el) return

    if (!document.fullscreenElement) {
      el.requestFullscreen().catch(() => {})
    } else {
      document.exitFullscreen?.()
    }
  }

  const formatTime = (seconds) => {
    if (!seconds || Number.isNaN(seconds)) return '00:00'

    const hrs = Math.floor(seconds / 3600)
    const mins = Math.floor((seconds % 3600) / 60)
    const secs = Math.floor(seconds % 60)

    return `${hrs > 0 ? `${hrs}:` : ''}${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
  }

  if (!showPlayer || !selectedMovie) return null

  return (
    <div className="fixed inset-0 z-50 bg-black flex items-center justify-center">
      <div className="absolute inset-0 pointer-events-none bg-[radial-gradient(ellipse_at_top,rgba(16,185,129,0.22),transparent_45%),radial-gradient(ellipse_at_bottom,rgba(59,130,246,0.20),transparent_40%)]" />

      {isFutureMovie && (
        <div className="absolute top-24 left-1/2 -translate-x-1/2 z-[60] bg-yellow-500/90 text-black px-6 py-3 rounded-full font-bold flex items-center gap-3 animate-bounce">
          <FiAlertTriangle className="text-xl" />
          <span>Unreleased content ({movie.year}). Stream may be unavailable.</span>
        </div>
      )}

      <div
        ref={containerRef}
        className="relative w-full h-[100dvh] bg-black group"
        onMouseMove={() => setShowControls(true)}
        onMouseLeave={() => setShowControls(false)}
        onTouchStart={() => setShowControls(true)}
      >
        <div className="w-full h-full flex items-center justify-center bg-black">
          {streamUrl ? (
            <video
              key={`${movie?.id || movie?._id || movie?.tmdbId || 'movie'}-${currentSourceIndex}`}
              ref={videoRef}
              src={streamUrl}
              className="w-full h-full object-contain bg-black"
              playsInline
              onLoadedMetadata={handleLoadedMetadata}
              onTimeUpdate={onTimeUpdate}
              onPlay={() => setIsPlaying(true)}
              onPause={() => setIsPlaying(false)}
              onWaiting={() => setIsBuffering(true)}
              onPlaying={() => setIsBuffering(false)}
              onEnded={() => setIsPlaying(false)}
              onError={handleVideoError}
              autoPlay
            />
          ) : (
            <div className="relative w-full h-full max-w-7xl max-h-[100dvh] mx-auto aspect-video flex items-center justify-center overflow-hidden">
              <img
                src={movie.backdrop || movie.poster}
                alt={movie.title}
                className="w-full h-full object-cover opacity-50"
              />
              <div className="absolute inset-0 bg-black/55 flex items-center justify-center p-6 text-center">
                <div>
                  {isLoadingSource ? (
                    <>
                      <p className="text-white font-semibold text-lg animate-pulse">Loading playback options...</p>
                      <p className="text-gray-400 text-sm mt-2">Finding sources</p>
                    </>
                  ) : sourceError ? (
                    <>
                      <p className="text-white font-semibold text-lg">{sourceError}</p>
                      <p className="text-gray-400 text-sm mt-2">Please refresh or use official providers below</p>
                    </>
                  ) : (
                    <>
                      <p className="text-white font-semibold text-lg">Playback source unavailable</p>
                      <p className="text-gray-300 text-sm mt-2">Try refreshing or check official providers.</p>
                    </>
                  )}
                </div>
              </div>
            </div>
          )}

          {(isLoadingSource || isBuffering) && (
            <div className="absolute inset-0 flex items-center justify-center bg-black/30 pointer-events-none">
              <div className="px-4 py-2 rounded-lg bg-black/70 text-white text-sm border border-white/15">
                Buffering stream...
              </div>
            </div>
          )}

          {sourceError && (
            <div className="absolute bottom-24 left-1/2 -translate-x-1/2 text-xs md:text-sm bg-red-600/20 border border-red-500/50 text-red-200 px-4 py-2 rounded-lg max-w-[90vw] text-center z-50">
              {sourceError}
            </div>
          )}

          {streamCandidates.length > 1 && streamUrl && (
            <div className="absolute top-20 right-4 z-50 bg-black/55 border border-white/20 rounded-lg px-3 py-2 text-xs text-gray-200">
              Source {currentSourceIndex + 1}/{streamCandidates.length}
            </div>
          )}

          {providers.length > 0 && !streamUrl && (
            <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-50 w-[92vw] max-w-3xl bg-black/70 border border-white/15 rounded-xl p-4">
              <p className="text-xs uppercase tracking-wide text-gray-300 mb-2">Official Providers</p>
              <div className="flex flex-wrap gap-2">
                {providers.slice(0, 8).map((provider, idx) => (
                  <button
                    key={`${provider.name}-${idx}`}
                    onClick={() => provider.webUrl && window.open(provider.webUrl, '_blank', 'noopener,noreferrer')}
                    className="px-3 py-1.5 rounded-md bg-white/10 hover:bg-white/20 text-white text-xs border border-white/10 flex items-center gap-1"
                    disabled={!provider.webUrl}
                  >
                    {provider.name}
                    <FiExternalLink size={12} />
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        <div className={`absolute top-0 left-0 right-0 p-4 bg-gradient-to-b from-black/80 to-transparent transition-opacity duration-300 ${showControls ? 'opacity-100' : 'opacity-0'} pointer-events-none z-50`}>
          <div className="flex justify-between items-center max-w-7xl mx-auto pointer-events-auto">
            <h3 className="text-white font-medium text-lg truncate shadow-black drop-shadow-md">
              {movie.title} ({movie.year})
            </h3>
            <button
              onClick={handleClose}
              className="p-2 bg-white/10 hover:bg-white/20 rounded-full text-white backdrop-blur-md transition-all"
            >
              <FiX className="text-xl" />
            </button>
          </div>
        </div>

        {streamUrl && (
          <div
            className={`absolute inset-x-0 bottom-0 bg-gradient-to-t from-black via-black/80 to-transparent p-4 md:p-6 transition-opacity duration-300 ${
              showControls ? 'opacity-100' : 'opacity-0'
            } pointer-events-none z-50`}
          >
            <div className="mb-4 flex items-center gap-3 pointer-events-auto">
              <span className="text-xs font-mono text-gray-300 w-10">{formatTime(playerTime)}</span>
              <div
                className="relative flex-1 h-1.5 bg-gray-700/50 rounded-full cursor-pointer group"
                onClick={(e) => {
                  if (!videoRef.current || !duration) return
                  const rect = e.currentTarget.getBoundingClientRect()
                  const pct = (e.clientX - rect.left) / rect.width
                  const nextTime = Math.max(0, Math.min(duration * pct, duration))
                  videoRef.current.currentTime = nextTime
                  setPlayerTime(Math.floor(nextTime))
                }}
              >
                <div className="absolute inset-0 bg-gray-600 rounded-full" />
                <div className="absolute top-0 left-0 bg-white/20 h-full rounded-full" style={{ width: `${bufferedPercent}%` }} />
                <div
                  className="absolute top-0 left-0 bg-gradient-to-r from-blue-500 to-indigo-500 h-full rounded-full transition-all group-hover:h-2 -mt-0.5 group-hover:mt-[-1px] shadow-[0_0_10px_rgba(59,130,246,0.5)]"
                  style={{ width: `${duration ? (playerTime / duration) * 100 : 0}%` }}
                >
                  <div className="absolute right-0 top-1/2 -translate-y-1/2 w-3 h-3 bg-white rounded-full shadow-md scale-0 group-hover:scale-100 transition-transform" />
                </div>
              </div>
              <span className="text-xs font-mono text-gray-400 w-12">{formatTime(duration)}</span>
            </div>

            <div className="flex flex-wrap items-center justify-between gap-y-3 pointer-events-auto">
              <div className="flex items-center gap-4 md:gap-6">
                <button onClick={togglePlay} className="p-2 hover:bg-white/10 rounded-full transition-all text-white">
                  {isPlaying ? <FiPause className="text-2xl md:text-3xl" /> : <FiPlay className="text-2xl md:text-3xl" />}
                </button>

                <button
                  onClick={() => seekBy(-10)}
                  className="p-2 hover:bg-white/10 rounded-full transition-all text-gray-300 hover:text-white"
                  title="Back 10s"
                >
                  <FiRotateCcw className="text-xl" />
                </button>

                <button
                  onClick={() => seekBy(10)}
                  className="p-2 hover:bg-white/10 rounded-full transition-all text-gray-300 hover:text-white"
                  title="Forward 10s"
                >
                  <FiRotateCw className="text-xl" />
                </button>

                <div className="flex items-center gap-2 group/vol">
                  <button onClick={() => setIsMuted((prev) => !prev)}>
                    <FiVolume2 className="text-white text-xl" />
                  </button>
                  <div className="w-0 overflow-hidden group-hover/vol:w-20 transition-all duration-300 ease-in-out md:w-24">
                    <input
                      type="range"
                      min="0"
                      max="100"
                      value={volume}
                      onChange={(e) => setVolume(Number(e.target.value))}
                      className="w-full h-1 bg-gray-600 rounded-full appearance-none cursor-pointer accent-blue-500"
                    />
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-3 md:gap-4">
                <select
                  value={playbackRate}
                  onChange={(e) => setPlaybackRate(Number(e.target.value))}
                  className="bg-black/60 text-white text-xs border border-white/20 rounded-md px-2 py-1"
                  title="Playback speed"
                >
                  <option value={0.75}>0.75x</option>
                  <option value={1}>1x</option>
                  <option value={1.25}>1.25x</option>
                  <option value={1.5}>1.5x</option>
                  <option value={2}>2x</option>
                </select>

                <button
                  onClick={toggleFullscreen}
                  className="p-2 hover:bg-white/10 rounded-full transition-all text-gray-300 hover:text-white"
                  title={isFullscreen ? 'Exit fullscreen' : 'Fullscreen'}
                >
                  <FiMaximize2 className="text-xl" />
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
