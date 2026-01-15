import React, { useState } from 'react'
import { FiRefreshCw, FiArrowLeft, FiDownload, FiCheckCircle, FiAlertCircle, FiSettings } from 'react-icons/fi'
import { useStore } from '../store/useStore'

export default function MovieExtractorScreen() {
  const { setCurrentScreen } = useStore()
  const [extracting, setExtracting] = useState(false)
  const [extractedCount, setExtractedCount] = useState(0)
  const [lastExtracted, setLastExtracted] = useState('2024-01-15')
  const [extractLog, setExtractLog] = useState([])
  const [sourceSelected, setSourceSelected] = useState('imdb')

  const sources = [
    {
      id: 'imdb',
      name: 'IMDb',
      emoji: '🎬',
      status: 'connected',
      movies: 1250,
      color: 'text-yellow-400'
    },
    {
      id: 'tmdb',
      name: 'TMDB',
      emoji: '🎥',
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
      id: 'custom',
      name: 'Custom',
      emoji: '⚙️',
      status: 'ready',
      movies: 0,
      color: 'text-neon-purple'
    },
  ]

  const handleExtract = async () => {
    setExtracting(true)
    setExtractLog([])
    
    // Simulate extraction progress
    const steps = [
      'Connecting to IMDb...',
      'Fetching popular movies...',
      'Parsing movie data...',
      'Extracting cast & crew...',
      'Downloading posters...',
      'Validating data...',
      'Saving to database...',
      'Indexing for search...',
    ]

    for (let i = 0; i < steps.length; i++) {
      await new Promise(resolve => setTimeout(resolve, 500))
      setExtractLog(prev => [...prev, { step: steps[i], status: 'processing' }])
      
      await new Promise(resolve => setTimeout(resolve, 1000))
      setExtractLog(prev => [
        ...prev.slice(0, -1),
        { step: steps[i], status: 'completed' }
      ])
    }

    setExtractedCount(prevCount => prevCount + 156)
    setLastExtracted(new Date().toLocaleDateString())
    setExtracting(false)

    // Final log entry
    setExtractLog(prev => [...prev, { step: 'Extraction completed! 156 new movies added', status: 'success' }])
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
            { label: 'Sources', value: '4 Active', icon: '🔗' },
            { label: 'Update Status', value: 'Ready', icon: '✅' },
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
          <h2 className="text-2xl font-bold mb-6 text-neon-blue">Data Sources</h2>
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
                  <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                  <span className="text-xs text-gray-400 capitalize">{source.status}</span>
                </div>
                <p className="text-sm text-gray-300">{source.movies} movies</p>
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
              <label className="block text-neon-blue font-semibold mb-2">Select Source</label>
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
              <label className="block text-neon-blue font-semibold mb-2">Movie Limit</label>
              <input
                type="number"
                defaultValue="100"
                className="w-full bg-dark-card border border-neon-blue border-opacity-30 rounded-lg p-3 text-gray-300 focus:outline-none focus:border-neon-blue"
              />
            </div>

            <div>
              <label className="block text-neon-blue font-semibold mb-2">Quality Filter</label>
              <select className="w-full bg-dark-card border border-neon-blue border-opacity-30 rounded-lg p-3 text-gray-300 focus:outline-none focus:border-neon-blue">
                <option>All movies</option>
                <option>Rating 7.0+</option>
                <option>Rating 7.5+</option>
                <option>Rating 8.0+</option>
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
            {extracting ? 'Extracting...' : 'Start Extraction'}
          </button>
        </div>

        {/* Extraction Progress Log */}
        {extractLog.length > 0 && (
          <div className="glass-effect p-8 rounded-xl mb-12">
            <h2 className="text-2xl font-bold mb-6 text-neon-blue">Extraction Log</h2>
            <div className="space-y-3 max-h-96 overflow-y-auto">
              {extractLog.map((log, idx) => (
                <div
                  key={idx}
                  className={`flex items-center gap-4 p-4 rounded-lg border-l-4 ${
                    log.status === 'completed'
                      ? 'bg-green-500 bg-opacity-10 border-green-500'
                      : log.status === 'success'
                      ? 'bg-blue-500 bg-opacity-10 border-blue-500'
                      : log.status === 'processing'
                      ? 'bg-yellow-500 bg-opacity-10 border-yellow-500 loading-pulse'
                      : 'bg-gray-500 bg-opacity-10 border-gray-500'
                  }`}
                >
                  {log.status === 'completed' || log.status === 'success' ? (
                    <FiCheckCircle className="text-green-400 flex-shrink-0" size={20} />
                  ) : log.status === 'processing' ? (
                    <FiRefreshCw className="text-yellow-400 flex-shrink-0 animate-spin" size={20} />
                  ) : (
                    <FiAlertCircle className="text-gray-400 flex-shrink-0" size={20} />
                  )}
                  <span className="text-gray-300">{log.step}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Recent Extractions */}
        <div className="glass-effect p-8 rounded-xl">
          <h2 className="text-2xl font-bold mb-6 text-neon-blue">Recent Extractions</h2>
          <div className="space-y-4">
            {[
              { date: '2024-01-15', movies: 156, source: 'IMDb', status: 'completed' },
              { date: '2024-01-14', movies: 142, source: 'TMDB', status: 'completed' },
              { date: '2024-01-13', movies: 189, source: 'Netflix', status: 'completed' },
              { date: '2024-01-12', movies: 167, source: 'IMDb', status: 'completed' },
            ].map((extraction, idx) => (
              <div
                key={idx}
                className="flex items-center justify-between p-4 bg-dark-card rounded-lg hover:bg-opacity-60 transition-all"
              >
                <div className="flex items-center gap-4">
                  <FiCheckCircle className="text-green-400" size={20} />
                  <div>
                    <p className="font-semibold text-neon-blue">{extraction.source} Extraction</p>
                    <p className="text-sm text-gray-400">{extraction.date}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-bold text-neon-purple">{extraction.movies} movies</p>
                  <p className="text-xs text-gray-400 capitalize">{extraction.status}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
