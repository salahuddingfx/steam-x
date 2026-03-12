// Dynamic API URL for both dev and production
const API_URL = import.meta.env.PROD
  ? 'https://steam-x.onrender.com'
  : 'http://localhost:5000'

const requestJSON = async (path, options = {}) => {
  const response = await fetch(`${API_URL}${path}`, options)

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
}

export const movieAPI = {
  getAll: async (search = '', genre = '', sort = 'trending', page = 1, limit = 100) => {
    try {
      const params = new URLSearchParams()
      if (search) params.append('search', search)
      if (genre) params.append('genre', genre)
      if (sort !== 'trending') params.append('sort', sort)
      params.append('page', page)
      params.append('limit', limit)

      const response = await fetch(`${API_URL}/api/movies?${params}`)
      return await response.json()
    } catch (error) {
      console.error('Error fetching movies:', error)
      return []
    }
  },

  getById: async (id) => {
    try {
      const response = await fetch(`${API_URL}/api/movies/${id}`)
      return await response.json()
    } catch (error) {
      console.error('Error fetching movie:', error)
      return null
    }
  },

  getTrending: async () => {
    try {
      const response = await fetch(`${API_URL}/api/movies/trending/all`)
      return await response.json()
    } catch (error) {
      console.error('Error fetching trending:', error)
      return []
    }
  },
}

export { API_URL }
