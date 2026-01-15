import React, { useState } from 'react'
import { useStore } from '../store/useStore'
import { authAPI } from '../services/api'
import { FaTimes, FaUser, FaEnvelope, FaLock, FaSignInAlt, FaUserPlus, FaGoogle, FaFacebook } from 'react-icons/fa'

export default function AuthModal() {
  const { showAuthModal, setShowAuthModal, login } = useStore()
  const [isLogin, setIsLogin] = useState(true)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  
  // Form State
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: ''
  })

  if (!showAuthModal) return null

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    
    try {
      let data
      if (isLogin) {
        data = await authAPI.login(formData.email, formData.password)
      } else {
         data = await authAPI.register(formData.name, formData.email, formData.password)
      }
      
      // Success
      login(data.user)
      localStorage.setItem('token', data.token) // JWT persistence
      setShowAuthModal(false)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-fadeIn">
      <div className="relative w-full max-w-md bg-[#1a1a2e] border border-white/10 rounded-2xl shadow-[0_0_50px_rgba(100,50,255,0.2)] overflow-hidden">
        
        {/* Close Button */}
        <button 
          onClick={() => setShowAuthModal(false)}
          className="absolute top-4 right-4 text-gray-400 hover:text-white transition-colors"
        >
          <FaTimes size={20} />
        </button>

        {/* Decor: Top Gradient Line */}
        <div className="h-1 w-full bg-gradient-to-r from-cyan-500 via-blue-500 to-purple-600"></div>

        <div className="p-8">
          
          {/* Header */}
          <div className="text-center mb-8">
             <h2 className="text-3xl font-bold bg-gradient-to-r from-white to-gray-400 bg-clip-text text-transparent mb-2">
                 {isLogin ? 'Welcome Back' : 'Join StreamX'}
             </h2>
             <p className="text-gray-400 text-sm">
                 {isLogin ? 'Enter your details to access your account' : 'Create an account to start your journey'}
             </p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
             {error && (
               <div className="bg-red-500/10 border border-red-500/50 text-red-500 px-4 py-2 rounded-lg text-sm text-center">
                 {error}
               </div>
             )}

             {!isLogin && (
               <div className="relative group">
                 <FaUser className="absolute left-3 top-3.5 text-gray-500 group-focus-within:text-blue-400 transition-colors" />
                 <input 
                   type="text" 
                   name="name"
                   placeholder="Full Name"
                   value={formData.name}
                   onChange={handleChange}
                   className="w-full bg-[#0f0f1a] border border-gray-700 rounded-xl py-3 pl-10 pr-4 text-white focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all"
                   required
                 />
               </div>
             )}

             <div className="relative group">
               <FaEnvelope className="absolute left-3 top-3.5 text-gray-500 group-focus-within:text-blue-400 transition-colors" />
               <input 
                 type="email" 
                 name="email"
                 placeholder="Email Address"
                 value={formData.email}
                 onChange={handleChange}
                 className="w-full bg-[#0f0f1a] border border-gray-700 rounded-xl py-3 pl-10 pr-4 text-white focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all"
                 required
               />
             </div>

             <div className="relative group">
               <FaLock className="absolute left-3 top-3.5 text-gray-500 group-focus-within:text-blue-400 transition-colors" />
               <input 
                 type="password" 
                 name="password"
                 placeholder="Password"
                 value={formData.password}
                 onChange={handleChange}
                 className="w-full bg-[#0f0f1a] border border-gray-700 rounded-xl py-3 pl-10 pr-4 text-white focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all"
                 required
               />
             </div>

             <button 
               type="submit"
               disabled={loading}
               className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 text-white font-bold py-3 rounded-xl shadow-lg transform hover:scale-[1.02] transition-all flex items-center justify-center gap-2"
             >
               {loading ? (
                 <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
               ) : (
                 <>
                   {isLogin ? <FaSignInAlt /> : <FaUserPlus />}
                   {isLogin ? 'Sign In' : 'Create Account'}
                 </>
               )}
             </button>
          </form>

          {/* Social / Divider */}
          <div className="mt-6">
            <div className="relative flex py-2 items-center">
                <div className="flex-grow border-t border-gray-700"></div>
                <span className="flex-shrink mx-4 text-gray-500 text-xs uppercase">Or continue with</span>
                <div className="flex-grow border-t border-gray-700"></div>
            </div>
            
            <div className="flex gap-4 mt-4">
               <button className="flex-1 bg-[#2a2a3e] hover:bg-[#3a3a4e] p-2 rounded-lg flex items-center justify-center text-white transition-colors">
                  <FaGoogle className="text-red-500" />
               </button>
               <button className="flex-1 bg-[#2a2a3e] hover:bg-[#3a3a4e] p-2 rounded-lg flex items-center justify-center text-white transition-colors">
                  <FaFacebook className="text-blue-500" />
               </button>
            </div>
          </div>

          {/* Toggle */}
          <div className="mt-8 text-center">
            <p className="text-gray-400">
              {isLogin ? "Don't have an account?" : "Already have an account?"}
              <button 
                onClick={() => setIsLogin(!isLogin)}
                className="ml-2 text-blue-400 hover:text-blue-300 font-bold underline decoration-2 decoration-transparent hover:decoration-blue-400 transition-all"
              >
                {isLogin ? 'Sign Up' : 'Login'}
              </button>
            </p>
          </div>

        </div>
      </div>
    </div>
  )
}
