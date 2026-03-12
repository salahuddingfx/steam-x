import React, { useMemo, useState } from 'react'
import { useStore } from '../store/useStore'
import { authAPI } from '../services/api'
import {
  FaEnvelope,
  FaEye,
  FaEyeSlash,
  FaLock,
  FaSignInAlt,
  FaTimes,
  FaUser,
  FaUserPlus,
} from 'react-icons/fa'

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

export default function AuthModal() {
  const { showAuthModal, setShowAuthModal, login } = useStore()

  const [isLogin, setIsLogin] = useState(true)
  const [loading, setLoading] = useState(false)
  const [wakingUp, setWakingUp] = useState(false)
  const [error, setError] = useState('')
  const [showPassword, setShowPassword] = useState(false)

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
  })

  // ⚠️ ALL hooks must be declared BEFORE any early return (Rules of Hooks)
  const passwordStrength = useMemo(() => {
    const pwd = formData.password || ''
    if (!pwd) return ''

    let score = 0
    if (pwd.length >= 8) score += 1
    if (/[A-Z]/.test(pwd)) score += 1
    if (/[0-9]/.test(pwd)) score += 1
    if (/[^A-Za-z0-9]/.test(pwd)) score += 1

    if (score <= 1) return 'Weak password'
    if (score <= 3) return 'Medium password'
    return 'Strong password'
  }, [formData.password])

  // Early return AFTER all hooks
  if (!showAuthModal) return null

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
    if (error) setError('')
  }

  const validateForm = () => {
    const email = formData.email.trim().toLowerCase()

    if (!EMAIL_REGEX.test(email)) {
      return 'Enter a valid email address.'
    }

    if (!isLogin) {
      if (!formData.name.trim() || formData.name.trim().length < 2) {
        return 'Name must be at least 2 characters.'
      }

      if (formData.password.length < 8) {
        return 'Password must be at least 8 characters.'
      }

      if (!/[A-Z]/.test(formData.password) || !/[0-9]/.test(formData.password)) {
        return 'Password must include at least 1 uppercase letter and 1 number.'
      }

      if (formData.password !== formData.confirmPassword) {
        return 'Confirm password does not match.'
      }
    }

    return ''
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setWakingUp(false)
    setError('')

    // After 3s of waiting, show server wake-up hint
    const wakeTimer = setTimeout(() => setWakingUp(true), 3000)

    const validationError = validateForm()
    if (validationError) {
      setError(validationError)
      setLoading(false)
      return
    }

    try {
      const email = formData.email.trim().toLowerCase()
      let data

      if (isLogin) {
        data = await authAPI.login(email, formData.password)
      } else {
        data = await authAPI.register(formData.name.trim(), email, formData.password)
      }

      login(data.user)
      localStorage.setItem('token', data.token)
      setShowAuthModal(false)
      setFormData({ name: '', email: '', password: '', confirmPassword: '' })
    } catch (err) {
      setError(err.message)
    } finally {
      clearTimeout(wakeTimer)
      setWakingUp(false)
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-fadeIn">
      <div className="relative w-full max-w-md bg-[#121928] border border-white/10 rounded-2xl shadow-[0_20px_60px_rgba(0,0,0,0.35)] overflow-hidden">
        <button
          onClick={() => setShowAuthModal(false)}
          className="absolute top-4 right-4 text-gray-400 hover:text-white transition-colors"
        >
          <FaTimes size={20} />
        </button>

        <div className="h-1 w-full bg-gradient-to-r from-emerald-500 via-cyan-500 to-blue-500" />

        <div className="p-8">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-black tracking-tight text-white mb-2">
              {isLogin ? 'Welcome Back' : 'Create Account'}
            </h2>
            <p className="text-gray-400 text-sm">
              {isLogin ? 'Log in to continue your watch history' : 'Sign up to save favorites and progress'}
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div className="bg-red-500/10 border border-red-500/50 text-red-300 px-4 py-2 rounded-lg text-sm text-center">
                {error}
              </div>
            )}

            {!isLogin && (
              <div className="relative group">
                <FaUser className="absolute left-3 top-3.5 text-gray-500 group-focus-within:text-emerald-400 transition-colors" />
                <input
                  type="text"
                  name="name"
                  placeholder="Full Name"
                  value={formData.name}
                  onChange={handleChange}
                  className="w-full bg-[#0e1320] border border-gray-700 rounded-xl py-3 pl-10 pr-4 text-white focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-all"
                  required
                />
              </div>
            )}

            <div className="relative group">
              <FaEnvelope className="absolute left-3 top-3.5 text-gray-500 group-focus-within:text-emerald-400 transition-colors" />
              <input
                type="email"
                name="email"
                placeholder="Email Address"
                value={formData.email}
                onChange={handleChange}
                className="w-full bg-[#0e1320] border border-gray-700 rounded-xl py-3 pl-10 pr-4 text-white focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-all"
                required
              />
            </div>

            <div className="relative group">
              <FaLock className="absolute left-3 top-3.5 text-gray-500 group-focus-within:text-emerald-400 transition-colors" />
              <input
                type={showPassword ? 'text' : 'password'}
                name="password"
                placeholder="Password"
                value={formData.password}
                onChange={handleChange}
                className="w-full bg-[#0e1320] border border-gray-700 rounded-xl py-3 pl-10 pr-11 text-white focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-all"
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword((prev) => !prev)}
                className="absolute right-3 top-3 text-gray-400 hover:text-white"
                aria-label="Toggle password visibility"
              >
                {showPassword ? <FaEyeSlash /> : <FaEye />}
              </button>
            </div>

            {!isLogin && (
              <>
                <div className="text-xs text-gray-400 px-1">{passwordStrength}</div>
                <div className="relative group">
                  <FaLock className="absolute left-3 top-3.5 text-gray-500 group-focus-within:text-emerald-400 transition-colors" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    name="confirmPassword"
                    placeholder="Confirm Password"
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    className="w-full bg-[#0e1320] border border-gray-700 rounded-xl py-3 pl-10 pr-4 text-white focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-all"
                    required
                  />
                </div>
              </>
            )}

            {wakingUp && (
              <div className="bg-amber-500/10 border border-amber-500/40 text-amber-300 px-4 py-2 rounded-lg text-xs text-center animate-pulse">
                ⏳ Server is starting up… this takes ~20s on first load
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-emerald-600 to-cyan-600 hover:from-emerald-500 hover:to-cyan-500 text-white font-bold py-3 rounded-xl shadow-lg transform hover:scale-[1.02] transition-all flex items-center justify-center gap-2 disabled:opacity-70 disabled:hover:scale-100"
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

          <div className="mt-8 text-center">
            <p className="text-gray-400 text-sm">
              {isLogin ? "Don't have an account?" : 'Already have an account?'}
              <button
                onClick={() => {
                  setIsLogin((prev) => !prev)
                  setError('')
                }}
                className="ml-2 text-emerald-300 hover:text-emerald-200 font-semibold underline decoration-transparent hover:decoration-emerald-300 transition-all"
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
