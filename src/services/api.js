// Dynamic API URL for both Dev and Production
const API_URL = import.meta.env.PROD 
  ? 'https://steam-x.onrender.com'
  : 'http://localhost:5000'

export const authAPI = {
  login: async (email, password) => {
    const res = await fetch(`${API_URL}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    })
    const data = await res.json()
    if (!res.ok) throw new Error(data.error || 'Login failed')
    return data
  },
  
  register: async (name, email, password) => {
    const res = await fetch(`${API_URL}/api/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, email, password }),
    })
    const data = await res.json()
    if (!res.ok) throw new Error(data.error || 'Registration failed')
    return data
  },
  
  getProfile: async (token) => {
    const res = await fetch(`${API_URL}/api/auth/me`, {
       headers: { 
           'Authorization': `Bearer ${token}` 
       }
    })
    const data = await res.json()
    if (!res.ok) throw new Error(data.error || 'Fetch user failed')
    return data
  },

  updateProfile: async (token, userData) => {
    const res = await fetch(`${API_URL}/api/auth/profile`, {
      method: 'PUT',
      headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(userData),
    })
    const data = await res.json()
    if (!res.ok) throw new Error(data.error || 'Update failed')
    return data
  }
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
  }
}


