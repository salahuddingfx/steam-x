// Dynamic API URL for both dev and production
import { mockMovies } from '../data/mockData.js'

const API_URL = import.meta.env.PROD
  ? 'https://steam-x.onrender.com'
  : 'http://localhost:5000'

// Check if backend is reachable; cache result for 30s
let _backendAlive = null
let _lastCheck = 0
const isBackendAlive = async () => {
  const now = Date.now()
  if (_backendAlive !== null && now - _lastCheck < 30_000) return _backendAlive
  try {
    await fetch(`${API_URL}/api/ping`, { signal: AbortSignal.timeout(3000) })
    _backendAlive = true
  } catch {
    _backendAlive = false
  }
  _lastCheck = now
  return _backendAlive
}

const requestJSON = async (path, options = {}) => {
  // 15s timeout — Render free tier cold-start can take ~30s, warn user if slow
  const controller = new AbortController()
  const timeoutId = setTimeout(() => controller.abort(), 15000)

  try {
    const response = await fetch(`${API_URL}${path}`, {
      ...options,
      signal: controller.signal,
    })

    clearTimeout(timeoutId)

    let data = null
    try {
      data = await response.json()
    } catch (e) {
      data = null
    }

    if (!response.ok) {
      throw new Error(data?.error || data?.message || 'Request failed')
    }

    return data
  } catch (err) {
    clearTimeout(timeoutId)
    if (err.name === 'AbortError') {
      throw new Error('Server is starting up — please wait a few seconds and try again.')
    }
    if (err.message === 'Failed to fetch' || err.message.includes('NetworkError')) {
      throw new Error('Cannot reach server. Check your connection or try again shortly.')
    }
    throw err
  }
}

export const authAPI = {
  login: async (email, password) => (
    requestJSON('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    })
  ),

  register: async (name, email, password) => (
    requestJSON('/api/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, email, password }),
    })
  ),

  getProfile: async (token) => (
    requestJSON('/api/auth/me', {
      headers: { Authorization: `Bearer ${token}` },
    })
  ),

  updateProfile: async (token, userData) => (
    requestJSON('/api/auth/profile', {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(userData),
    })
  ),

  changePassword: async (token, currentPassword, newPassword) => (
    requestJSON('/api/auth/change-password', {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ currentPassword, newPassword }),
    })
  ),

  logout: async (token) => (
    requestJSON('/api/auth/logout', {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}` },
    })
  ),

  validateToken: async (token) => (
    requestJSON('/api/auth/validate-token', {
      headers: { Authorization: `Bearer ${token}` },
    })
  ),
}

export const movieAPI = {
  getAll: async (search = '', genre = '', sort = 'trending', page = 1, limit = 100) => {
    try {
      const alive = await isBackendAlive()
      if (!alive) {
        // backend offline → return mockData so UI is never blank
        let results = mockMovies
        if (search) results = results.filter(m => m.title.toLowerCase().includes(search.toLowerCase()))
        return results
      }

      const params = new URLSearchParams()
      if (search) params.append('search', search)
      if (genre) params.append('genre', genre)
      if (sort !== 'trending') params.append('sort', sort)
      params.append('page', page)
      params.append('limit', limit)

      const response = await fetch(`${API_URL}/api/movies?${params}`)
      const data = await response.json()
      // If backend returned empty, supplement with mock data
      if (!Array.isArray(data) || data.length === 0) {
        return mockMovies
      }
      return data
    } catch (error) {
      return mockMovies
    }
  },

  getById: async (id) => {
    try {
      const response = await fetch(`${API_URL}/api/movies/${id}`)
      const ct = response.headers.get('content-type') || ''
      if (!response.ok || !ct.includes('application/json')) return null
      return await response.json()
    } catch {
      return null
    }
  },

  getTrending: async () => {
    try {
      const response = await fetch(`${API_URL}/api/movies/trending/all`)
      const ct = response.headers.get('content-type') || ''
      if (!response.ok || !ct.includes('application/json')) {
        return mockMovies.slice(0, 10)
      }
      return await response.json()
    } catch {
      return mockMovies.slice(0, 10)
    }
  },
}

export { API_URL }
