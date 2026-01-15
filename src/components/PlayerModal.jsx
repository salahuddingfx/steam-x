import React, { useState, useEffect } from 'react'
import { FiPlay, FiPause, FiX, FiMaximize2, FiVolume2, FiSettings, FiAlertTriangle } from 'react-icons/fi'
import { useStore } from '../store/useStore'

export default function PlayerModal() {
  const {
    selectedMovie,
    showPlayer,
    setShowPlayer,
    playerTime,
    setPlayerTime,
    currentSubtitle,
    setCurrentSubtitle,
    setWatchProgress,
  } = useStore()

  const [isPlaying, setIsPlaying] = useState(true)
  const [isBuffering, setIsBuffering] = useState(false)
  const [volume, setVolume] = useState(80)
  const [duration] = useState(selectedMovie?.duration * 60 || 5400) // Default 90 mins if missing
  const [showSubtitles, setShowSubtitles] = useState(true)
  const [showControls, setShowControls] = useState(true)
  
  // Extractor / Server State
  // SWITCHED DEFAULT TO SERVER 2 (VidSrc VIP) or 4 for better Mobile experience and fewer popups
  const [server, setServer] = useState('server2') 
  
  // Extract ID at top level for usage in Render and logic
  const tmdbId = selectedMovie?.tmdbId || selectedMovie?.id; 
  const currentYear = new Date().getFullYear();
  const isFutureMovie = selectedMovie?.year > currentYear;

  // Generate Embed URL based on TMDB ID or fallback
  const getEmbedUrl = () => {
      const type = selectedMovie?.type || 'movie'; // Default to movie

      // If we don't have a numeric ID, fall back to the direct videoUrl or a demo
      if (!tmdbId || isNaN(tmdbId)) return selectedMovie?.videoUrl || 'https://www.w3schools.com/html/mov_bbb.mp4';
      
      const endpoint = type === 'tv' || type === 'series' 
        ? `tv/${tmdbId}/1/1` // Default to S1 E1 for series
        : `movie/${tmdbId}`;

      switch(server) {
          case 'server1': return `https://vidsrc.xyz/embed/${endpoint}`; // VidSrc.xyz
          case 'server2': return `https://vidsrc.to/embed/${endpoint}`; // VidSrc.to (Premium Free)
          case 'server3': return `https://2embed.cc/embed/${tmdbId}`; // 2Embed
          case 'server4': return type === 'movie' ? `https://autoembed.co/movie/tmdb/${tmdbId}` : `https://autoembed.co/tv/tmdb/${tmdbId}-1-1`; // AutoEmbed
          case 'server5': return `https://superembed.stream/embed/${endpoint}`; // SuperEmbed
          default: return `https://vidsrc.to/embed/${endpoint}`;
      }
  }

  // Helper to determine if we are in "Iframe Mode" (Streaming from Server)
  // FIX: Assuming ALL streams are currently iframes and need native controls
  const isExternalStream = true; 

  useEffect(() => {
    if (!isPlaying) return

    const interval = setInterval(() => {
      setPlayerTime((prev) => {
        // Only auto-stop if we control the player (NOT external stream)
        if (!isExternalStream && prev >= duration) {
          setIsPlaying(false)
          return duration
        }
        // If external stream, just update time but don't force stop
        // (Note: This time will be inaccurate if user pauses the iframe video)
        return prev + 1
      })
    }, 1000)

    return () => clearInterval(interval)
  }, [isPlaying, duration])

  const handleClose = () => {
    if (selectedMovie && playerTime > 0) {
      setWatchProgress(selectedMovie.id, (playerTime / duration) * 100)
    }
    setShowPlayer(false)
  }
  
  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
        document.documentElement.requestFullscreen().catch(err => {
            console.log(`Error attempting to enable fullscreen: ${err.message}`);
        });
    } else {
        if (document.exitFullscreen) {
            document.exitFullscreen();
        }
    }
  }

  const formatTime = (seconds) => {
    if (!seconds || isNaN(seconds)) return "00:00"
    const hrs = Math.floor(seconds / 3600)
    const mins = Math.floor((seconds % 3600) / 60)
    const secs = Math.floor(seconds % 60)
    return `${hrs > 0 ? hrs + ':' : ''}${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
  }


  if (!showPlayer || !selectedMovie) return null

  return (
    <div className="fixed inset-0 z-50 bg-black flex items-center justify-center">
      
      {/* Future Content Warning Overlay */}
      {isFutureMovie && (
          <div className="absolute top-24 left-1/2 -translate-x-1/2 z-[60] bg-yellow-500/90 text-black px-6 py-3 rounded-full font-bold flex items-center gap-3 animate-bounce">
              <FiAlertTriangle className="text-xl" />
              <span>Unreleased Content ({selectedMovie.year}). Stream likely unavailable.</span>
          </div>
      )}

      {/* Video Container - Responsive Fix */}
      <div 
        className="relative w-full h-[100dvh] bg-black group"
        onMouseMove={() => setShowControls(true)}
        onMouseLeave={() => setShowControls(false)}
        onTouchStart={() => setShowControls(true)} 
      >
        {/* Video Background */}
        <div className="w-full h-full flex items-center justify-center bg-black">
         {/* Real Video Element (Multi-Server Iframe) */}
         {isPlaying ? (
            <div className="w-full h-full relative z-0"> 
            {/* z-0 ensures iframe is at base level */}
                <iframe 
                    key={server} // Force reload on server change
                    src={getEmbedUrl()} 
                    title={selectedMovie.title}
                    className="w-full h-full border-0 bg-black"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                    onLoad={() => setIsBuffering(false)}
                ></iframe>
                
                {/* Server Selector (Top Right Overlay) - INCREASED Z-INDEX & POINTER EVENTS */}
                {/* Pointer events AUTO is essential for clicking buttons */}
                <div className={`absolute top-20 right-4 flex flex-col gap-2 transition-opacity duration-300 ${showControls ? 'opacity-100' : 'opacity-0'} z-50 pointer-events-auto`}>
                    <div className="bg-black/90 backdrop-blur-md p-3 rounded-xl border border-gray-800 shadow-2xl">
                        <p className="text-[10px] text-gray-400 mb-2 font-bold uppercase tracking-wider text-center">Video Server (Switch if buffering)</p>
                        <div className="flex flex-col gap-1.5 min-w-[150px]">
                            {[
                                {id: 'server2', name: 'Server 1 (VidSrc Pro)'}, 
                                {id: 'server4', name: 'Server 2 (AutoEmbed Fast)'}, 
                                {id: 'server1', name: 'Server 3 (VidSrc Backup)'},
                                {id: 'server5', name: 'Server 4 (Alternative)'},
                            ].map((srv) => (
                                <button
                                    key={srv.id}
                                    onClick={(e) => { 
                                        e.stopPropagation(); 
                                        setIsBuffering(true); 
                                        setServer(srv.id); 
                                    }}
                                    className={`text-xs px-3 py-3 md:py-2 rounded-lg text-left transition-all font-medium border ${
                                        server === srv.id 
                                        ? 'bg-blue-600 border-blue-500 text-white shadow-lg shadow-blue-500/20' 
                                        : 'bg-white/5 border-transparent hover:bg-white/10 text-gray-300'
                                    }`}
                                >
                                    {srv.name}
                                </button>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
         ) : (
          <div className="relative w-full h-full max-w-7xl max-h-[100dvh] mx-auto aspect-video flex items-center justify-center overflow-hidden">
             <img
              src={selectedMovie.backdrop}
              alt={selectedMovie.title}
              className="w-full h-full object-cover opacity-60"
            />
            
            {/* Play Button Overlay */}
            <div 
               className="absolute inset-0 flex items-center justify-center cursor-pointer"
               onClick={() => setIsPlaying(true)}
            >
              <div className="w-20 h-20 bg-black/50 backdrop-blur-sm rounded-full flex items-center justify-center hover:scale-110 transition-transform">
                  <FiPlay className="text-4xl text-white ml-2" />
               </div>
            </div>
          </div>
         )}
        </div>

        {/* Top Bar Controls (Back/Close) - ALWAYS Visible when controls are active */}
        <div className={`absolute top-0 left-0 right-0 p-4 bg-gradient-to-b from-black/80 to-transparent transition-opacity duration-300 ${showControls ? 'opacity-100' : 'opacity-0'} pointer-events-none z-50`}>
          <div className="flex justify-between items-center max-w-7xl mx-auto pointer-events-auto">
             <h3 className="text-white font-medium text-lg truncate shadow-black drop-shadow-md">{selectedMovie.title} ({selectedMovie.year})</h3>
             <button
              onClick={handleClose}
              className="p-2 bg-white/10 hover:bg-white/20 rounded-full text-white backdrop-blur-md transition-all"
            >
              <FiX className="text-xl" />
            </button>
          </div>
        </div>

        {/* Subtitles Placeholder - Only show if playing */}
        {showSubtitles && isPlaying && (
          <div className="absolute bottom-32 left-0 right-0 text-center text-white font-semibold text-lg hover:opacity-0 transition-opacity">
            <p className="bg-black/50 backdrop-blur-sm inline-block px-3 py-1 rounded">
               {isExternalStream ? 'Use player controls for subs' : formatTime(playerTime)}
            </p>
          </div>
        )}

        {/* Controls - Show on hover */}
        {/* LOGIC CHANGE: Completely HIDE bottom controls if external stream (iframe) is active */}
        { !isExternalStream && (
        <div
          className={`absolute inset-x-0 bottom-0 bg-gradient-to-t from-black via-black/80 to-transparent p-4 md:p-6 transition-opacity duration-300 ${
            showControls ? 'opacity-100' : 'opacity-0'
          } pointer-events-none z-50`}
        >
          {/* Progress Bar */}
          <div className="mb-4 flex items-center gap-3 pointer-events-auto">
            <span className="text-xs font-mono text-gray-300 w-10">{formatTime(playerTime)}</span>
            <div className="relative flex-1 h-1.5 bg-gray-700/50 rounded-full cursor-pointer group">
               <div className="absolute inset-0 bg-gray-600 rounded-full"></div>
               <div
                className="absolute top-0 left-0 bg-gradient-to-r from-blue-500 to-indigo-500 h-full rounded-full transition-all group-hover:h-2 -mt-0.5 group-hover:mt-[-1px] shadow-[0_0_10px_rgba(59,130,246,0.5)]"
                style={{ width: `${(playerTime / duration) * 100}%` }}
              >
                 <div className="absolute right-0 top-1/2 -translate-y-1/2 w-3 h-3 bg-white rounded-full shadow-md scale-0 group-hover:scale-100 transition-transform"></div>
              </div>
            </div>
            <span className="text-xs font-mono text-gray-400 w-10">{formatTime(duration)}</span>
          </div>

          {/* Control Buttons Container - Responsive Grid */}
          <div className="flex flex-wrap items-center justify-between gap-y-3 pointer-events-auto">
            
            <div className="flex items-center gap-4 md:gap-6">
              {/* Play/Pause */}
              <button
                onClick={() => setIsPlaying(!isPlaying)}
                className="p-2 hover:bg-white/10 rounded-full transition-all text-white"
              >
                {isPlaying ? (
                  <FiPause className="text-2xl md:text-3xl" />
                ) : (
                  <FiPlay className="text-2xl md:text-3xl" />
                )}
              </button>

              {/* Volume - Hide slider on mobile to save space if needed, or make smaller */}
              <div className="flex items-center gap-2 group/vol">
                <button onClick={() => setVolume(volume === 0 ? 80 : 0)}>
                   <FiVolume2 className="text-white text-xl" />
                </button>
                <div className="w-0 overflow-hidden group-hover/vol:w-20 transition-all duration-300 ease-in-out md:w-24">
                   <input
                    type="range"
                    min="0"
                    max="100"
                    value={volume}
                    onChange={(e) => setVolume(e.target.value)}
                    className="w-full h-1 bg-gray-600 rounded-full appearance-none cursor-pointer accent-blue-500"
                  />
                </div>
              </div>
            </div>

            <div className="flex items-center gap-3 md:gap-4">
              {/* Subtitle Control */}
              <div className="relative group/subs">
                <button
                    onClick={() => setShowSubtitles(!showSubtitles)}
                    className={`p-1.5 rounded text-sm font-bold border ${showSubtitles ? 'border-blue-500 text-blue-500' : 'border-gray-500 text-gray-500'}`}
                >
                    CC
                </button>
                 {/* Popup Menu for Subs on Hover (Desktop) or Click (Mobile logic needed usually, simplified here) */}
                <div className="absolute bottom-full right-0 mb-2 bg-black/90 rounded-lg p-2 hidden group-hover/subs:block min-w-[120px]">
                     {['English', 'Spanish', 'French'].map(lang => (
                         <div 
                           key={lang} 
                           onClick={() => setCurrentSubtitle(lang)}
                           className={`px-3 py-1.5 text-sm hover:bg-white/10 cursor-pointer rounded ${currentSubtitle === lang ? 'text-blue-400' : 'text-gray-300'}`}
                         >
                            {lang}
                         </div>
                     ))}
                </div>
              </div>

              {/* Settings */}
              <button className="p-2 hover:bg-white/10 rounded-full transition-all text-gray-300 hover:text-white">
                <FiSettings className="text-xl" />
              </button>

              {/* Fullscreen */}
              <button 
                 onClick={toggleFullscreen}
                 className="p-2 hover:bg-white/10 rounded-full transition-all text-gray-300 hover:text-white"
              >
                <FiMaximize2 className="text-xl" />
              </button>
            </div>
          </div>
        </div>
        )}

      </div>

      {/* Streaming Options - Only Show when NOT playing or paused explicitly? Actually just hide during playback to avoid blocking controls */}
      {!isPlaying && selectedMovie.streamingOptions && selectedMovie.streamingOptions.length > 0 && (
        <div className="absolute bottom-0 left-0 right-0 p-4 bg-black/80 backdrop-blur-md border-t border-gray-700 z-50">
          <h3 className="text-sm font-bold text-white mb-2">Available On:</h3>
          <div className="flex flex-wrap gap-2">
            {selectedMovie.streamingOptions.map((option, i) => (
              <div key={i} className="flex items-center gap-2 bg-blue-600/20 px-3 py-1.5 rounded-lg border border-blue-500">
                {option.logoUrl && <img src={option.logoUrl} alt={option.name} className="w-5 h-5" />}
                <span className="text-white text-sm font-medium">{option.name}</span>
                {option.type && <span className="text-xs text-gray-300">({option.type})</span>}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
