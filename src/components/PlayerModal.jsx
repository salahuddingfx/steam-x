import React, { useCallback, useEffect, useRef, useState } from 'react'
import {
  FiAlertTriangle,
  FiExternalLink,
  FiMaximize2,
  FiMinimize2,
  FiPause,
  FiPlay,
  FiRotateCcw,
  FiRotateCw,
  FiVolume2,
  FiVolumeX,
  FiX,
} from 'react-icons/fi'
import { useStore } from '../store/useStore'

// Embed pages (VidSrc, 2embed, etc.) CANNOT go in <video> — needs <iframe>
const isEmbedUrl = (url = '') =>
  url.includes('/embed/') ||
  url.includes('vidsrc') ||
  url.includes('2embed') ||
  url.includes('autoembed') ||
  url.includes('multiembed') ||
  url.includes('player.php')

export default function PlayerModal() {
  const {
    selectedMovie,
    showPlayer,
    setShowPlayer,
    playerTime,
    setPlayerTime,
    setWatchProgress,
  } = useStore()

  const videoRef    = useRef(null)
  const containerRef = useRef(null)
  const hideTimer    = useRef(null)
  const seekBarRef   = useRef(null)

  const API_URL = import.meta.env.PROD
    ? 'https://steam-x.onrender.com'
    : 'http://localhost:5000'

  const [resolvedMovie,      setResolvedMovie]      = useState(null)
  const [streamCandidates,   setStreamCandidates]   = useState([])
  const [currentSourceIndex, setCurrentSourceIndex] = useState(0)
  const [providers,          setProviders]          = useState([])
  const [isLoadingSource,    setIsLoadingSource]    = useState(false)
  const [sourceError,        setSourceError]        = useState('')

  const [isPlaying,   setIsPlaying]   = useState(false)
  const [isBuffering, setIsBuffering] = useState(false)
  const [isMuted,     setIsMuted]     = useState(false)
  const [volume,      setVolume]      = useState(80)
  const [duration,    setDuration]    = useState(0)
  const [bufferedPercent, setBufferedPercent] = useState(0)
  const [playbackRate,    setPlaybackRate]    = useState(1)
  const [showControls,    setShowControls]    = useState(true)
  const [isFullscreen,    setIsFullscreen]    = useState(false)
  const [isDragging,      setIsDragging]      = useState(false)

  const movie     = resolvedMovie || selectedMovie
  const streamUrl = streamCandidates[currentSourceIndex] || ''
  const useIframe = isEmbedUrl(streamUrl)
  const playedPct = duration > 0 ? Math.min((playerTime / duration) * 100, 100) : 0

  const currentYear   = new Date().getFullYear()
  const isFutureMovie = movie?.year > currentYear

  const resetHideTimer = useCallback(() => {
    setShowControls(true)
    if (hideTimer.current) clearTimeout(hideTimer.current)
    if (!useIframe) {
      hideTimer.current = setTimeout(() => setShowControls(false), 3000)
    }
  }, [useIframe])

  useEffect(() => {
    if (!showPlayer || !selectedMovie) return
    const load = async () => {
      setIsLoadingSource(true)
      setSourceError('')
      setResolvedMovie(null)
      setProviders([])
      setStreamCandidates([])
      setCurrentSourceIndex(0)
      setDuration((selectedMovie?.duration || 0) * 60)
      setBufferedPercent(0)
      try {
        const id  = selectedMovie._id || selectedMovie.id || selectedMovie.tmdbId
        const res  = await fetch(`${API_URL}/api/movies/${id}`)
        const data = await res.json()
        if (!res.ok || data?.error) throw new Error(data?.error || 'Could not load source')
        setResolvedMovie(data)
        setProviders(Array.isArray(data.streamingOptions) ? data.streamingOptions : [])
        const raw = Array.isArray(data?.playback?.streamCandidates)
          ? data.playback.streamCandidates
          : data?.playback?.streamUrl ? [data.playback.streamUrl] : []
        const normalized = raw.filter(Boolean).map(c => c.startsWith('http') ? c : `${API_URL}${c}`)
        if (normalized.length > 0) {
          setStreamCandidates(normalized)
        } else {
          setSourceError('No stream source found. Use official providers below.')
        }
      } catch (err) {
        setSourceError(err.message || 'Playback loading failed')
      } finally {
        setIsLoadingSource(false)
      }
    }
    load()
  }, [showPlayer, selectedMovie, API_URL])

  useEffect(() => {
    if (!videoRef.current) return
    videoRef.current.volume       = volume / 100
    videoRef.current.muted        = isMuted
    videoRef.current.playbackRate = playbackRate
  }, [volume, isMuted, playbackRate])

  useEffect(() => {
    const onChange = () => setIsFullscreen(Boolean(document.fullscreenElement))
    document.addEventListener('fullscreenchange', onChange)
    return () => document.removeEventListener('fullscreenchange', onChange)
  }, [])

  useEffect(() => {
    if (!videoRef.current || !streamUrl || useIframe) return
    setIsBuffering(true)
    setSourceError('')
    videoRef.current.load()
  }, [streamUrl, useIframe])

  const handleClose = () => {
    if (selectedMovie && playerTime > 0 && duration > 0) {
      setWatchProgress(selectedMovie.id || selectedMovie._id, Math.min((playerTime / duration) * 100, 100))
    }
    if (hideTimer.current) clearTimeout(hideTimer.current)
    setIsPlaying(false)
    setStreamCandidates([])
    setCurrentSourceIndex(0)
    setResolvedMovie(null)
    setProviders([])
    setShowPlayer(false)
  }

  const handleLoadedMetadata = () => {
    if (!videoRef.current) return
    setDuration(Math.floor(videoRef.current.duration || 0) || duration)
    if (playerTime > 0 && playerTime < (videoRef.current.duration || 0)) {
      videoRef.current.currentTime = playerTime
    }
  }

  const togglePlay = async () => {
    if (!videoRef.current || !streamUrl || useIframe) return
    try {
      if (videoRef.current.paused) { await videoRef.current.play(); setIsPlaying(true) }
      else { videoRef.current.pause(); setIsPlaying(false) }
    } catch { setSourceError('Autoplay blocked — press Play.') }
  }

  const seekBy = (secs) => {
    if (!videoRef.current) return
    const total = duration || videoRef.current.duration || 0
    const next  = Math.max(0, Math.min(videoRef.current.currentTime + secs, total))
    videoRef.current.currentTime = next
    setPlayerTime(Math.floor(next))
  }

  const onTimeUpdate = () => {
    if (!videoRef.current || isDragging) return
    setPlayerTime(Math.floor(videoRef.current.currentTime || 0))
    if (videoRef.current.buffered?.length) {
      const end   = videoRef.current.buffered.end(videoRef.current.buffered.length - 1)
      const total = videoRef.current.duration || duration || 1
      if (total > 0) setBufferedPercent(Math.min((end / total) * 100, 100))
    }
  }

  const handleVideoError = () => {
    if (currentSourceIndex < streamCandidates.length - 1) {
      setSourceError(`Source ${currentSourceIndex + 1} failed — trying next…`)
      setCurrentSourceIndex(p => p + 1)
    } else {
      setSourceError('All sources failed. Please use official providers below.')
    }
  }

  const toggleFullscreen = () => {
    if (!containerRef.current) return
    if (!document.fullscreenElement) containerRef.current.requestFullscreen().catch(() => {})
    else document.exitFullscreen?.()
  }

  const seekTo = (e) => {
    if (!videoRef.current || !duration) return
    const rect = (seekBarRef.current || e.currentTarget).getBoundingClientRect()
    const pct  = Math.max(0, Math.min((e.clientX - rect.left) / rect.width, 1))
    videoRef.current.currentTime = pct * duration
    setPlayerTime(Math.floor(pct * duration))
  }

  const handleVolumeChange = (e) => {
    const v = Number(e.target.value)
    setVolume(v)
    setIsMuted(v === 0)
  }

  const VolumeIcon = (isMuted || volume === 0) ? FiVolumeX : FiVolume2

  // Keyboard shortcuts — defined after all handlers
  useEffect(() => {
    if (!showPlayer) return
    const onKey = (e) => {
      if (['INPUT', 'SELECT', 'TEXTAREA'].includes(e.target.tagName)) return
      switch (e.key) {
        case ' ': case 'k': e.preventDefault(); if (!useIframe) togglePlay(); break
        case 'ArrowRight': e.preventDefault(); if (!useIframe) seekBy(10); break
        case 'ArrowLeft':  e.preventDefault(); if (!useIframe) seekBy(-10); break
        case 'ArrowUp':    e.preventDefault(); if (!useIframe) setVolume(v => Math.min(100, v + 10)); break
        case 'ArrowDown':  e.preventDefault(); if (!useIframe) setVolume(v => Math.max(0, v - 10)); break
        case 'm': case 'M': if (!useIframe) setIsMuted(p => !p); break
        case 'f': case 'F': toggleFullscreen(); break
        case 'Escape': if (!document.fullscreenElement) handleClose(); break
        default: return
      }
      resetHideTimer()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [showPlayer, useIframe]) // eslint-disable-line react-hooks/exhaustive-deps

  const formatTime = (s) => {
    if (!s || Number.isNaN(s)) return '0:00'
    const h   = Math.floor(s / 3600)
    const m   = Math.floor((s % 3600) / 60)
    const sec = Math.floor(s % 60)
    return `${h > 0 ? `${h}:` : ''}${m.toString().padStart(2, '0')}:${sec.toString().padStart(2, '0')}`
  }

  if (!showPlayer || !selectedMovie) return null

  return (
    <div className="fixed inset-0 z-50 bg-black">
      <div className="absolute inset-0 pointer-events-none bg-[radial-gradient(ellipse_at_top,rgba(16,185,129,0.10),transparent_50%),radial-gradient(ellipse_at_bottom,rgba(59,130,246,0.08),transparent_45%)]" />

      {isFutureMovie && (
        <div className="absolute top-20 left-1/2 -translate-x-1/2 z-[60] bg-yellow-500/90 text-black px-5 py-2 rounded-full font-bold text-sm flex items-center gap-2 animate-bounce shadow-lg">
          <FiAlertTriangle /> Unreleased ({movie.year}) — stream may be unavailable
        </div>
      )}

      <div
        ref={containerRef}
        className={`relative w-full h-[100dvh] bg-black overflow-hidden ${!useIframe && isPlaying && !showControls ? 'cursor-none' : ''}`}
        onMouseMove={resetHideTimer}
        onMouseLeave={() => { if (!useIframe && isPlaying) setShowControls(false) }}
        onTouchStart={resetHideTimer}
        onClick={() => { if (!useIframe) { togglePlay(); resetHideTimer() } }}
      >
        {/* IFRAME MODE — VidSrc embed URLs */}
        {streamUrl && useIframe && (
          <iframe
            key={`iframe-${movie?._id || movie?.id || movie?.tmdbId}-${currentSourceIndex}`}
            src={streamUrl}
            className="w-full h-full border-0"
            allowFullScreen
            allow="autoplay; fullscreen; encrypted-media; picture-in-picture"
            referrerPolicy="no-referrer"
            title={movie?.title || 'Stream-X Player'}
          />
        )}

        {/* DIRECT VIDEO MODE — .mp4 / archive streams */}
        {streamUrl && !useIframe && (
          <video
            key={`video-${movie?._id || movie?.id || movie?.tmdbId}-${currentSourceIndex}`}
            ref={videoRef}
            src={streamUrl}
            className="w-full h-full object-contain bg-black"
            playsInline
            autoPlay
            onLoadedMetadata={handleLoadedMetadata}
            onTimeUpdate={onTimeUpdate}
            onPlay={() => { setIsPlaying(true); setIsBuffering(false) }}
            onPause={() => setIsPlaying(false)}
            onWaiting={() => setIsBuffering(true)}
            onStalled={() => setIsBuffering(true)}
            onPlaying={() => setIsBuffering(false)}
            onCanPlay={() => setIsBuffering(false)}
            onEnded={() => { setIsPlaying(false); setShowControls(true) }}
            onError={handleVideoError}
          />
        )}

        {/* EMPTY STATE */}
        {!streamUrl && (
          <div className="absolute inset-0 flex items-center justify-center">
            <img src={movie?.backdrop || movie?.poster} alt={movie?.title}
              className="absolute inset-0 w-full h-full object-cover opacity-20" />
            <div className="relative z-10 text-center px-6 flex flex-col items-center gap-5">
              {isLoadingSource ? (
                <>
                  <div className="relative w-16 h-16">
                    <div className="absolute inset-0 border-4 border-white/10 rounded-full" />
                    <div className="absolute inset-0 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
                  </div>
                  <p className="text-white font-semibold text-lg">Finding stream sources…</p>
                  <p className="text-gray-400 text-sm">Checking archive &amp; VidSrc providers</p>
                </>
              ) : (
                <>
                  <p className="text-white font-semibold text-xl max-w-md">{sourceError || 'No stream available'}</p>
                  <p className="text-gray-400 text-sm">Use the official providers below</p>
                </>
              )}
            </div>
          </div>
        )}

        {/* BUFFERING SPINNER */}
        {!useIframe && isBuffering && streamUrl && (
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-40 bg-black/20">
            <div className="flex flex-col items-center gap-3">
              <div className="relative w-14 h-14">
                <div className="absolute inset-0 border-[3px] border-white/10 rounded-full" />
                <div className="absolute inset-0 border-[3px] border-blue-400 border-t-transparent rounded-full animate-spin" />
              </div>
              <span className="text-xs text-white/80 bg-black/60 px-3 py-1 rounded-full">Buffering…</span>
            </div>
          </div>
        )}

        {/* BIG PLAY BUTTON when paused */}
        {!useIframe && !isPlaying && !isBuffering && streamUrl && showControls && (
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-30">
            <div
              className="w-20 h-20 rounded-full bg-white/15 backdrop-blur-md border border-white/20 flex items-center justify-center shadow-2xl pointer-events-auto cursor-pointer hover:bg-white/25 transition-all hover:scale-110"
              onClick={(e) => { e.stopPropagation(); togglePlay() }}
            >
              <FiPlay className="text-white text-4xl ml-1" />
            </div>
          </div>
        )}

        {/* Source badge */}
        {streamCandidates.length > 1 && streamUrl && (
          <div className="absolute top-20 right-4 z-50 bg-black/70 border border-white/15 rounded-lg px-3 py-1 text-xs text-gray-300 select-none">
            Source {currentSourceIndex + 1}/{streamCandidates.length}
          </div>
        )}

        {/* Error toast */}
        {sourceError && streamUrl && (
          <div className="absolute top-[4.5rem] left-1/2 -translate-x-1/2 z-50 bg-red-700/80 text-white text-xs px-4 py-2 rounded-lg max-w-[80vw] text-center backdrop-blur-sm">
            {sourceError}
          </div>
        )}

        {/* Official providers (no stream) */}
        {providers.length > 0 && !streamUrl && !isLoadingSource && (
          <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-50 w-[92vw] max-w-2xl bg-gray-900/90 border border-white/10 rounded-2xl p-5 backdrop-blur-md shadow-2xl">
            <p className="text-[10px] uppercase tracking-widest text-gray-400 mb-3 font-bold">Watch on Official Providers</p>
            <div className="flex flex-wrap gap-2">
              {providers.slice(0, 10).map((p, i) => (
                <button
                  key={`${p.name}-${i}`}
                  onClick={() => p.webUrl && window.open(p.webUrl, '_blank', 'noopener,noreferrer')}
                  disabled={!p.webUrl}
                  className="px-3 py-1.5 rounded-lg bg-white/10 hover:bg-white/20 disabled:opacity-40 text-white text-xs border border-white/10 flex items-center gap-1.5 transition-all"
                >
                  {p.name} <FiExternalLink size={11} />
                </button>
              ))}
            </div>
          </div>
        )}

        {/* TOP BAR */}
        <div
          className={`absolute top-0 left-0 right-0 z-50 bg-gradient-to-b from-black/90 via-black/40 to-transparent px-4 md:px-6 pt-4 pb-10 transition-opacity duration-300 ${
            showControls || !isPlaying || useIframe ? 'opacity-100' : 'opacity-0 pointer-events-none'
          }`}
          onClick={e => e.stopPropagation()}
        >
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-3 min-w-0">
              <span className="text-[10px] font-black text-red-500 bg-red-500/15 border border-red-500/30 px-2 py-0.5 rounded-md uppercase tracking-wider flex-shrink-0">
                STREAM-X
              </span>
              <h3 className="text-white font-semibold text-base md:text-lg truncate drop-shadow-lg">
                {movie?.title}{movie?.year ? ` (${movie.year})` : ''}
              </h3>
            </div>
            <button
              onClick={handleClose}
              className="flex-shrink-0 p-2 bg-white/10 hover:bg-red-600/70 border border-white/10 hover:border-red-500/50 rounded-full text-white transition-all hover:scale-110 backdrop-blur-md"
              title="Close (Esc)"
            >
              <FiX className="text-xl" />
            </button>
          </div>
        </div>

        {/* BOTTOM CONTROLS — video mode only */}
        {streamUrl && !useIframe && (
          <div
            className={`absolute inset-x-0 bottom-0 z-50 bg-gradient-to-t from-black via-black/70 to-transparent px-4 md:px-6 pt-16 pb-4 md:pb-5 transition-opacity duration-300 select-none ${
              showControls || !isPlaying ? 'opacity-100' : 'opacity-0 pointer-events-none'
            }`}
            onClick={e => e.stopPropagation()}
          >
            {/* Seek bar */}
            <div className="flex items-center gap-2 mb-3">
              <span className="text-[11px] font-mono text-gray-300 tabular-nums w-11 text-right">
                {formatTime(playerTime)}
              </span>
              <div
                ref={seekBarRef}
                className="relative flex-1 h-5 flex items-center cursor-pointer group/bar"
                onClick={seekTo}
                onMouseDown={e => { setIsDragging(true); seekTo(e) }}
                onMouseMove={e => { if (isDragging) seekTo(e) }}
                onMouseUp={() => setIsDragging(false)}
                onMouseLeave={() => setIsDragging(false)}
              >
                <div className="absolute inset-x-0 top-1/2 -translate-y-1/2 h-1 group-hover/bar:h-1.5 transition-all bg-white/15 rounded-full">
                  <div className="absolute top-0 left-0 h-full bg-white/25 rounded-full" style={{ width: `${bufferedPercent}%` }} />
                  <div className="absolute top-0 left-0 h-full bg-gradient-to-r from-blue-500 to-violet-500 rounded-full" style={{ width: `${playedPct}%` }} />
                  <div
                    className="absolute top-1/2 -translate-y-1/2 w-3.5 h-3.5 bg-white rounded-full shadow-lg opacity-0 group-hover/bar:opacity-100 transition-opacity"
                    style={{ left: `calc(${playedPct}% - 7px)` }}
                  />
                </div>
              </div>
              <span className="text-[11px] font-mono text-gray-500 tabular-nums w-11">
                {formatTime(duration)}
              </span>
            </div>

            {/* Controls row */}
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-0.5 md:gap-1">
                <button onClick={togglePlay}
                  className="p-2 hover:bg-white/15 rounded-full transition-all text-white active:scale-90"
                  title={isPlaying ? 'Pause (Space)' : 'Play (Space)'}>
                  {isPlaying ? <FiPause className="text-2xl md:text-3xl" /> : <FiPlay className="text-2xl md:text-3xl" />}
                </button>
                <button onClick={() => seekBy(-10)}
                  className="p-2 hover:bg-white/15 rounded-full transition-all text-gray-300 hover:text-white"
                  title="Back 10s (←)">
                  <FiRotateCcw className="text-lg md:text-xl" />
                </button>
                <button onClick={() => seekBy(10)}
                  className="p-2 hover:bg-white/15 rounded-full transition-all text-gray-300 hover:text-white"
                  title="Forward 10s (→)">
                  <FiRotateCw className="text-lg md:text-xl" />
                </button>

                <div className="flex items-center gap-1.5 ml-1">
                  <button onClick={() => setIsMuted(p => !p)}
                    className="p-2 hover:bg-white/15 rounded-full transition-all text-white flex-shrink-0"
                    title={isMuted ? 'Unmute (M)' : 'Mute (M)'}>
                    <VolumeIcon className="text-lg md:text-xl" />
                  </button>
                  <div className="relative w-16 md:w-24 h-4 flex items-center group/vol cursor-pointer">
                    <div className="absolute inset-x-0 top-1/2 -translate-y-1/2 h-1 bg-white/15 rounded-full pointer-events-none">
                      <div className="absolute top-0 left-0 h-full bg-gradient-to-r from-blue-400 to-blue-500 rounded-full"
                        style={{ width: `${isMuted ? 0 : volume}%` }} />
                      <div className="absolute top-1/2 -translate-y-1/2 w-3 h-3 bg-white rounded-full shadow-md opacity-0 group-hover/vol:opacity-100 transition-opacity"
                        style={{ left: `calc(${isMuted ? 0 : volume}% - 6px)` }} />
                    </div>
                    <input type="range" min="0" max="100" value={isMuted ? 0 : volume}
                      onChange={handleVolumeChange}
                      className="absolute inset-0 w-full opacity-0 cursor-pointer"
                      title={`Volume ${isMuted ? 0 : volume}% (↑/↓)`} />
                  </div>
                  <span className="text-[11px] text-gray-400 tabular-nums w-6 hidden md:block">
                    {isMuted ? '0' : volume}
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-2 md:gap-3">
                <select value={playbackRate} onChange={e => setPlaybackRate(Number(e.target.value))}
                  className="bg-black/70 text-white text-xs border border-white/15 rounded-md px-2 py-1 cursor-pointer hover:border-white/40 transition-all outline-none"
                  title="Playback speed">
                  <option value={0.5}>0.5×</option>
                  <option value={0.75}>0.75×</option>
                  <option value={1}>1×</option>
                  <option value={1.25}>1.25×</option>
                  <option value={1.5}>1.5×</option>
                  <option value={2}>2×</option>
                </select>
                <button onClick={toggleFullscreen}
                  className="p-2 hover:bg-white/15 rounded-full transition-all text-gray-300 hover:text-white"
                  title={isFullscreen ? 'Exit fullscreen (F)' : 'Fullscreen (F)'}>
                  {isFullscreen ? <FiMinimize2 className="text-xl" /> : <FiMaximize2 className="text-xl" />}
                </button>
              </div>
            </div>

            {!isPlaying && (
              <div className="flex justify-center gap-4 mt-2 text-[10px] text-gray-600 pointer-events-none">
                <span>Space — Play/Pause</span>
                <span>← → — Seek 10s</span>
                <span>↑ ↓ — Volume</span>
                <span>M — Mute</span>
                <span>F — Fullscreen</span>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
