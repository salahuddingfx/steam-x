import React, { useState } from 'react'
import axios from 'axios'
import { FiRefreshCw, FiArrowLeft, FiDownload, FiCheckCircle, FiAlertCircle, FiSettings, FiPlay, FiCloud } from 'react-icons/fi'
import { useStore } from '../store/useStore'

export default function MovieExtractorScreen() {
  const { setCurrentScreen } = useStore()
  
  // Tabs: 'extractor' | 'cloud'
  const [activeTab, setActiveTab] = useState('extractor')
  const [streamUrl, setStreamUrl] = useState('')
  const [finalStreamLink, setFinalStreamLink] = useState('')

  // Extractor State
  const [extracting, setExtracting] = useState(false)
  const [extractedCount, setExtractedCount] = useState(0)
  const [extractLog, setExtractLog] = useState([])
  const [sourceSelected, setSourceSelected] = useState('tmdb')

  const sources = [
    {
      id: 'imdb',
      name: 'IMDb Top',
      emoji: '⭐',
      status: 'connected',
      movies: 1250,
      color: 'text-yellow-400'
    },
    {
      id: 'tmdb',
      name: 'TMDB Popular',
      emoji: '🔥',
      status: 'connected',
      movies: 2180,
      color: 'text-blue-400'
    },
    {
      id: 'netflix',
      name: 'Netflix',
      emoji: '📺',
      status: 'connected',
      movies: 890,
      color: 'text-red-400'
    },
    {
      id: 'amazon',
      name: 'Amazon Prime',
      emoji: '📦',
      status: 'ready',
      movies: 540,
      color: 'text-cyan-400'
    },
  ]

  const handleCloudStream = () => {
    if(!streamUrl) return alert("Please enter a valid link!");
    
    const API_URL = import.meta.env.PROD 
        ? 'https://steam-x.onrender.com/api' 
        : 'http://localhost:5000/api';

    // Generates a proxy link that the browser can stream directly
    const proxyLink = `${API_URL}/proxy/stream?url=${encodeURIComponent(streamUrl)}`;
    setFinalStreamLink(proxyLink);
  }

  const handleExtract = async () => {
    setExtracting(true)
    setExtractLog([])
    
    try {
      // Step 1: Connection Log
      setExtractLog(prev => [...prev, { step: `Connecting to ${sourceSelected.toUpperCase()} API...`, status: 'processing' }])
      
      // Artificial delay for UX (to show the connecting state)
      await new Promise(r => setTimeout(r, 800))

      // Step 2: Sending Request
      setExtractLog(prev => [
        ...prev.slice(0, -1),
        { step: `Connected to ${sourceSelected.toUpperCase()}`, status: 'completed' },
        { step: 'Fetching metadata & posters...', status: 'processing' }
      ])

      // 🚀 REAL API CALL
      const API_URL = import.meta.env.PROD 
        ? 'https://steam-x.onrender.com/api' 
        : 'http://localhost:5000/api';

      const response = await axios.post(`${API_URL}/movies/extract`, {
        source: sourceSelected,
        limit: 20 // Can be dynamic based on input
      })

      const { count, message, source } = response.data

      // Step 3: Success Logs
      setExtractLog(prev => [
        ...prev.slice(0, -1), // Remove 'processing'
        { step: 'Metadata parsing & validation', status: 'completed' },
        { step: `Generating stream links for ${count} items`, status: 'completed' },
        { step: `Success! ${count} new movies added from ${source}`, status: 'success' }
      ])

      setExtractedCount(prev => prev + count)
      setLastExtracted(new Date().toLocaleDateString())

    } catch (error) {
      console.error(error)
      setExtractLog(prev => [
        ...prev,
        { step: `Error: ${error.response?.data?.error || error.message}`, status: 'error' }
      ])
    } finally {
      setExtracting(false)
    }
  }

  return (
    <div className="min-h-screen">
      <button
        onClick={() => setCurrentScreen('developer')}
        className="fixed top-24 left-4 z-40 flex items-center gap-2 text-neon-blue hover:gap-4 transition-all"
      >
        <FiArrowLeft /> Back
      </button>

      <div className="max-w-6xl mx-auto p-4 pt-20">
        {/* Header */}
        <div className="mb-12">
          <h1 className="text-5xl font-black mb-4 text-transparent bg-clip-text bg-gradient-to-r from-neon-blue to-neon-purple">
            🎬 Movie Extractor
          </h1>
          <p className="text-gray-400 text-lg">
            Automatically extract and manage movies from multiple sources
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-12">
          {[
            { label: 'Total Movies', value: extractedCount + 1523, icon: '🎥' },
            { label: 'Last Extracted', value: lastExtracted, icon: '📅' },
            { label: 'Active Sources', value: 'TMDB + Archive', icon: '🔗' },
            { label: 'System Status', value: 'Online', icon: '✅' },
          ].map((stat, idx) => (
            <div key={idx} className="glass-effect p-6 rounded-xl hover-glow transition-all">
              <div className="text-3xl mb-2">{stat.icon}</div>
              <p className="text-gray-400 text-sm">{stat.label}</p>
              <p className="text-2xl font-bold text-neon-blue">{stat.value}</p>
            </div>
          ))}
        </div>

        {/* Sources Grid */}
        <div className="mb-12">
          <h2 className="text-2xl font-bold mb-6 text-neon-blue">Select Data Source</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {sources.map((source) => (
              <div
                key={source.id}
                onClick={() => setSourceSelected(source.id)}
                className={`glass-effect p-6 rounded-xl cursor-pointer transition-all ${
                  sourceSelected === source.id ? 'ring-2 ring-neon-blue hover-glow' : 'hover:bg-opacity-60'
                }`}
              >
                <div className="text-5xl mb-4">{source.emoji}</div>
                <h3 className="font-bold text-lg mb-2 text-neon-blue">{source.name}</h3>
                <div className="flex items-center gap-2 mb-3">
                  <div className={`w-2 h-2 rounded-full ${source.status === 'connected' ? 'bg-green-400' : 'bg-yellow-400'}`}></div>
                  <span className="text-xs text-gray-400 capitalize">{source.status}</span>
                </div>
                <p className="text-sm text-gray-300">{source.movies}+ available</p>
              </div>
            ))}
          </div>
        </div>

        {/* Extraction Control */}
        <div className="glass-effect p-8 rounded-xl mb-12">
          <h2 className="text-2xl font-bold mb-6 text-neon-purple flex items-center gap-3">
            <FiSettings /> Extraction Settings
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            <div>
              <label className="block text-neon-blue font-semibold mb-2">Target Source</label>
              <select
                value={sourceSelected}
                onChange={(e) => setSourceSelected(e.target.value)}
                className="w-full bg-dark-card border border-neon-blue border-opacity-30 rounded-lg p-3 text-gray-300 focus:outline-none focus:border-neon-blue"
              >
                {sources.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.emoji} {s.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-neon-blue font-semibold mb-2">Auto Update Interval</label>
              <select className="w-full bg-dark-card border border-neon-blue border-opacity-30 rounded-lg p-3 text-gray-300 focus:outline-none focus:border-neon-blue">
                <option>Every 6 hours</option>
                <option>Every 12 hours</option>
                <option>Every 24 hours</option>
                <option>Manual only</option>
              </select>
            </div>

            <div>
              <label className="block text-neon-blue font-semibold mb-2">Batch Limit</label>
              <input
                type="number"
                defaultValue="20"
                className="w-full bg-dark-card border border-neon-blue border-opacity-30 rounded-lg p-3 text-gray-300 focus:outline-none focus:border-neon-blue"
              />
            </div>

            <div>
              <label className="block text-neon-blue font-semibold mb-2">Quality Threshold</label>
              <select className="w-full bg-dark-card border border-neon-blue border-opacity-30 rounded-lg p-3 text-gray-300 focus:outline-none focus:border-neon-blue">
                <option>All Qualities</option>
                <option>1080p Only</option>
                <option>4K Only</option>
              </select>
            </div>
          </div>

          {/* Extract Button */}
          <button
            onClick={handleExtract}
            disabled={extracting}
            className="w-full flex items-center justify-center gap-3 px-8 py-4 bg-gradient-to-r from-neon-blue to-neon-purple text-white font-bold rounded-lg disabled:opacity-50 transition-all hover:shadow-glow-intense"
          >
            <FiDownload size={20} />
            {extracting ? 'Extracting Data...' : 'Start Cloud Extraction'}
          </button>
        </div>

        {/* Extraction Progress Log */}
        {extractLog.length > 0 && (
          <div className="glass-effect p-8 rounded-xl mb-12">
            <h2 className="text-2xl font-bold mb-6 text-neon-blue">Live Terminal</h2>
            <div className="space-y-3 max-h-96 overflow-y-auto font-mono text-sm">
              {extractLog.map((log, idx) => (
                <div
                  key={idx}
                  className={`flex items-center gap-4 p-4 rounded-lg border-l-4 ${
                    log.status === 'completed'
                      ? 'bg-green-500 bg-opacity-10 border-green-500'
                      : log.status === 'success'
                      ? 'bg-blue-500 bg-opacity-10 border-blue-500'
                      : log.status === 'error'
                      ? 'bg-red-500 bg-opacity-10 border-red-500'
                      : 'bg-yellow-500 bg-opacity-10 border-yellow-500 loading-pulse'
                  }`}
                >
                  {log.status === 'completed' || log.status === 'success' ? (
                    <FiCheckCircle className="text-green-400 flex-shrink-0" size={20} />
                  ) : log.status === 'error' ? (
                    <FiAlertCircle className="text-red-400 flex-shrink-0" size={20} />
                  ) : (
                    <FiRefreshCw className="text-yellow-400 flex-shrink-0 animate-spin" size={20} />
                  )}
                  <span className="text-gray-300">{log.step}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}