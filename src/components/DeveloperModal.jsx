import React from 'react';
import { FiX, FiGithub, FiTwitter, FiLinkedin, FiCode } from 'react-icons/fi';

export default function DeveloperModal({ onClose }) {
  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in"
      onClick={onClose}
    >
      <div 
        className="relative w-full max-w-md bg-gradient-to-br from-gray-900 via-black to-gray-900 border border-white/10 rounded-2xl shadow-[0_0_50px_rgba(79,70,229,0.3)] overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        
        {/* Animated Background Elements */}
        <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/20 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2"></div>
        <div className="absolute bottom-0 left-0 w-32 h-32 bg-purple-500/20 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2"></div>

        {/* Close Button */}
        <button 
          onClick={onClose}
          className="absolute top-4 right-4 p-2 text-gray-400 hover:text-white bg-white/5 hover:bg-white/10 rounded-full transition-all"
        >
          <FiX size={20} />
        </button>

        <div className="p-8 text-center relative z-10">
          {/* Avatar / Icon */}
          <div className="w-24 h-24 mx-auto mb-6 relative group">
            <div className="absolute inset-0 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full animate-spin-slow blur-md opacity-75 group-hover:opacity-100 transition-opacity"></div>
            <div className="relative w-full h-full bg-black rounded-full border-2 border-white/20 flex items-center justify-center overflow-hidden">
               <img 
                 src="https://avatars.githubusercontent.com/salahuddingfx" // Replace with actual avatar if available 
                 alt="Developer" 
                 className="w-full h-full object-cover"
                 onError={(e) => { e.target.onerror = null; e.target.src = 'https://cdn-icons-png.flaticon.com/512/2111/2111432.png' }}
               />
            </div>
            <div className="absolute bottom-0 right-0 w-8 h-8 bg-green-500 rounded-full border-4 border-black flex items-center justify-center text-xs font-bold text-white">
                <FiCode />
            </div>
          </div>

          <h2 className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-400 mb-2">
            Salah Uddin Kader
          </h2>
          <p className="text-gray-400 text-sm mb-6 font-medium">
            Full Stack Developer | Creator of Stream-X
          </p>

          <p className="text-gray-300 mb-8 text-sm leading-relaxed">
            Passionately building modern web experiences with the latest tech stack. 
            Stream-X is a demonstration of MERN stack power with real-time capabilities.
          </p>

          {/* Social Links */}
          <div className="flex justify-center gap-4 mb-8">
            <a href="https://twitter.com/salahuddingfx" className="p-3 bg-white/5 hover:bg-blue-500/20 text-gray-400 hover:text-blue-400 rounded-xl transition-all hover:-translate-y-1">
              <FiTwitter size={20} />
            </a>
            <a href="https://github.com/salahuddingfx" className="p-3 bg-white/5 hover:bg-gray-700/50 text-gray-400 hover:text-white rounded-xl transition-all hover:-translate-y-1">
              <FiGithub size={20} />
            </a>
            <a href="https://www.linkedin.com/in/salahuddingfx" className="p-3 bg-white/5 hover:bg-blue-600/20 text-gray-400 hover:text-blue-500 rounded-xl transition-all hover:-translate-y-1">
              <FiLinkedin size={20} />
            </a>
          </div>

          <div className="text-xs text-gray-500 font-mono border-t border-white/10 pt-4">
             v1.0.0 • Made with ❤️ & ☕
          </div>
        </div>
      </div>
    </div>
  );
}
