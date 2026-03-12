import React, { useState } from 'react'
import axios from 'axios'
import { FiRefreshCw, FiArrowLeft, FiDownload, FiCheckCircle, FiAlertCircle, FiSettings, FiLink, FiPlay } from 'react-icons/fi'
import { useStore } from '../store/useStore'

export default function MovieExtractorScreen() {
  const { setCurrentScreen } = useStore()
  const [activeTab, setActiveTab] = useState('db') // 'db' or 'resolver'

  // DB Extractor State
  const [extracting, setExtracting] = useState(false)
  const [extractedCount, setExtractedCount] = useState(0)
  const [extractLog, setExtractLog] = useState([])
  const [sourceSelected, setSourceSelected] = useState('tmdb')

  // Resolver State
  const [resolveUrl, setResolveUrl] = useState('')
  const [resolvedLink, setResolvedLink] = useState(null)
  const [resolving, setResolving] = useState(false)

  const handleExtract = async () => {
    setExtracting(true)
    setExtractLog([])
    
    try {
      setExtractLog(prev => [...prev, { step: `Connecting to ${sourceSelected.toUpperCase()} API...`, status: 'processing' }])
      await new Promise(r => setTimeout(r, 800))

      const API_URL = import.meta.env.PROD 
        ? 'https://steam-x.onrender.com/api' 
        : 'http://localhost:5000/api';

      const response = await axios.post(`${API_URL}/movies/extract`, {
        source: sourceSelected,
        limit: 20
      })

      const { count } = response.data
      
      setExtractLog(prev => [
        ...prev,
        { step: `Successfully extracted ${count} movies`, status: 'completed' }
      ])
      setExtractedCount(prev => prev + count)
    } catch (err) {
      setExtractLog(prev => [...prev, { step: 'Extraction Failed', status: 'error' }])
    } finally {
      setExtracting(false)
    }
  }

  const handleResolve = () => {
      if (!resolveUrl) return;
      setResolving(true);
      
      // Simulate resolving time or backend check if needed
      setTimeout(() => {
          const API_URL = import.meta.env.PROD 
            ? 'https://steam-x.onrender.com/api' 
            : 'http://localhost:5000/api';
            
          // Construct the proxy stream URL
          const streamUrl = `${API_URL}/proxy/stream?url=${encodeURIComponent(resolveUrl)}`;
          setResolvedLink(streamUrl);
          setResolving(false);
      }, 1500);
  }

  return (
    <div className="pt-24 px-4 md:px-12 pb-12 min-h-screen bg-dark-bg text-white animate-fade-in">
      <div className="max-w-4xl mx-auto">
        
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <button 
              onClick={() => setCurrentScreen('settings')}
              className="p-2 rounded-full bg-white/5 hover:bg-white/10 transition-all group"
            >
              <FiArrowLeft className="group-hover:-translate-x-1 transition-transform" />
            </button>
            <div>
              <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-purple-500">
                Tools & Utilities
              </h1>
              <p className="text-gray-400 text-sm">Advanced system controls</p>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-4 mb-8 border-b border-gray-800">
            <button 
                onClick={() => setActiveTab('db')}
                className={`pb-3 px-4 text-sm font-medium transition-colors border-b-2 ${activeTab === 'db' ? 'border-blue-500 text-blue-400' : 'border-transparent text-gray-500 hover:text-gray-300'}`}
            >
                <FiRefreshCw className="inline mr-2" /> Content Extractor
            </button>
            <button 
                onClick={() => setActiveTab('resolver')}
                className={`pb-3 px-4 text-sm font-medium transition-colors border-b-2 ${activeTab === 'resolver' ? 'border-purple-500 text-purple-400' : 'border-transparent text-gray-500 hover:text-gray-300'}`}
            >
                <FiLink className="inline mr-2" /> Cloud Link Resolver
            </button>
        </div>

        {/* Content Area */}
        {activeTab === 'db' ? (
            <div className="bg-[#16161a] border border-white/5 rounded-2xl p-6 md:p-8 relative overflow-hidden">
                <h2 className="text-xl font-bold mb-4">Database Population</h2>
                <div className="flex gap-2 mb-6">
                    <select 
                        className="bg-black/30 border border-gray-700 rounded-lg px-4 py-2 text-sm focus:border-blue-500 outline-none"
                        value={sourceSelected}
                        onChange={(e) => setSourceSelected(e.target.value)}
                    >
                        <option value="tmdb">TMDB (Popular)</option>
                        <option value="netflix">Netflix</option>
                    </select>
                    <button 
                        onClick={handleExtract}
                        disabled={extracting}
                        className="bg-blue-600 hover:bg-blue-500 text-white px-6 py-2 rounded-lg text-sm font-bold disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                        {extracting ? 'Extracting...' : 'Start Extraction'}
                    </button>
                </div>

                 <div className="space-y-2 font-mono text-xs bg-black/50 p-4 rounded-xl h-48 overflow-y-auto w-full">
                    {extractLog.length === 0 ? <span className="text-gray-600">Waiting for command...</span> : 
                    extractLog.map((log, i) => (
                        <div key={i} className={`flex items-center gap-2 ${log.status === 'error' ? 'text-red-400' : 'text-green-400'}`}>
                            <span>{log.status === 'processing' ? '⟳' : '✓'}</span>
                            {log.step}
                        </div>
                    ))}
                </div>
            </div>
        ) : (
            <div className="bg-[#16161a] border border-white/5 rounded-2xl p-6 md:p-8">
                 <h2 className="text-xl font-bold mb-2">Universal Cloud Resolver</h2>
                 <p className="text-gray-400 text-sm mb-6">Paste any direct video link (MP4, MKV) to bypass CORS and stream directly in the secure cloud player.</p>

                 <div className="flex gap-2 mb-8">
                     <div className="flex-1 relative">
                         <FiLink className="absolute left-3 top-3.5 text-gray-500" />
                         <input 
                            type="text" 
                            placeholder="https://example.com/movie.mp4"
                            className="w-full bg-black/30 border border-gray-700 rounded-xl py-3 pl-10 pr-4 text-sm text-white focus:border-purple-500 outline-none transition-all placeholder-gray-600"
                            value={resolveUrl}
                            onChange={(e) => setResolveUrl(e.target.value)}
                         />
                     </div>
                     <button 
                        onClick={handleResolve}
                        disabled={resolving || !resolveUrl}
                        className="bg-purple-600 hover:bg-purple-500 text-white px-6 rounded-xl font-bold disabled:opacity-50 transition-all shadow-lg shadow-purple-900/20"
                     >
                        {resolving ? 'Resolving...' : 'Resolve'}
                     </button>
                 </div>

                 {resolvedLink && (
                     <div className="animate-fade-in">
                         <div className="aspect-video bg-black rounded-xl overflow-hidden mb-4 border border-white/10 relative group">
                             <video 
                                src={resolvedLink} 
                                controls 
                                className="w-full h-full object-contain"
                                autoPlay
                             />
                         </div>
                         <div className="flex items-center justify-between bg-green-900/20 border border-green-900/50 p-4 rounded-xl">
                             <div className="flex items-center gap-2">
                                 <FiCheckCircle className="text-green-400" />
                                 <span className="text-green-200 text-sm font-medium">Link Successfully Resolved</span>
                             </div>
                             <a 
                                href={resolvedLink} 
                                download 
                                target="_blank"
                                rel="noreferrer"
                                className="text-xs bg-green-800 hover:bg-green-700 text-white px-3 py-1.5 rounded-lg transition-colors flex items-center gap-2"
                             >
                                 <FiDownload /> Download Source
                             </a>
                         </div>
                     </div>
                 )}
            </div>
        )}
      </div>
    </div>
  )
}