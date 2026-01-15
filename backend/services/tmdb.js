import axios from 'axios'
import mongoose from 'mongoose'
import Movie from '../models/Movie.js'

const TMDB_API_KEY = process.env.TMDB_API_KEY;
const BASE_URL = 'https://api.themoviedb.org/3'

if (!TMDB_API_KEY) {
    console.warn("⚠️ TMDB_API_KEY is missing in .env file! Movie data fetching will fail.");
}

// Provider IDs
// 8: Netflix, 9: Amazon Prime, 15: Hulu, 337: Disney+
const PROVIDERS = [
  { id: 8, name: 'Netflix' },
  { id: 9, name: 'Amazon Prime' },
  { id: 15, name: 'Hulu' },
  { id: 337, name: 'Disney+' }
]

// Fallback manual movies if API fails
const FALLBACK_MOVIES = [
  {
    title: 'Extraction 2',
    description: 'Back from the brink of death, commando Tyler Rake embarks on a dangerous mission to save a ruthless gangster\'s imprisoned family.',
    poster: 'https://image.tmdb.org/t/p/w500/7gKI9hpEMcZUQpNgadiJL8W3Ryt.jpg',
    backdrop: 'https://image.tmdb.org/t/p/original/rM5Y0ziCtmpwIDNbC1CYQ8g7wr0.jpg',
    rating: 7.5,
    year: 2023,
    provider: 'Netflix',
    videoUrl: 'https://www.w3schools.com/html/mov_bbb.mp4'
  },
  {
    title: 'The Tomorrow War',
    description: 'The world is stunned when a group of time travelers arrive from the year 2051 to deliver an urgent message: Thirty years in the future mankind is losing a global war against a deadly alien species.',
    poster: 'https://image.tmdb.org/t/p/w500/34nDCQZwaEvsy4CFO5hkGRFDCVU.jpg',
    backdrop: 'https://image.tmdb.org/t/p/original/xXHZeb1yhJvnSHPzZDqee0zfQq6.jpg',
    rating: 8.0,
    year: 2021,
    provider: 'Amazon Prime',
    videoUrl: 'https://www.w3schools.com/html/mov_bbb.mp4'
  }
]

export const fetchTrendingData = async () => {
    try {
        console.log('🔄 Fetching new trending movies from TMDB...')
        
        // Fetch "Now Playing" (Real-time Cinema Releases)
        const nowPlayingRes = await axios.get(`${BASE_URL}/movie/now_playing?api_key=${TMDB_API_KEY}&language=en-US&page=1`)
        await processMovies(nowPlayingRes.data.results, 'Cinema', true) // Priority

        // Fetch generic trending
        const trendingRes = await axios.get(`${BASE_URL}/trending/movie/week?api_key=${TMDB_API_KEY}`)
        await processMovies(trendingRes.data.results, 'StreamX')

        // Fetch Netflix specifically
        const netflixRes = await axios.get(`${BASE_URL}/discover/movie?api_key=${TMDB_API_KEY}&with_watch_providers=8&watch_region=US&sort_by=popularity.desc`)
        await processMovies(netflixRes.data.results, 'Netflix')
        
        // Fetch Amazon Prime
        const amazonRes = await axios.get(`${BASE_URL}/discover/movie?api_key=${TMDB_API_KEY}&with_watch_providers=9&watch_region=US&sort_by=popularity.desc`)
        await processMovies(amazonRes.data.results, 'Amazon Prime')

        // Fetch Anime (Genre 16)
        const animeRes = await axios.get(`${BASE_URL}/discover/movie?api_key=${TMDB_API_KEY}&with_genres=16&sort_by=popularity.desc&with_original_language=ja`)
        await processMovies(animeRes.data.results, 'Anime Hits')

        // Fetch 3D Animation / Family (Genre 16 + 10751)
        // Kung Fu Panda et al usually fall here
        const familyRes = await axios.get(`${BASE_URL}/discover/movie?api_key=${TMDB_API_KEY}&with_genres=16,10751&sort_by=popularity.desc`)
        await processMovies(familyRes.data.results, 'Family 3D')

        console.log('✅ Auto-update complete: Database synced with latest hits')
        return true
    } catch (error) {
        console.error('⚠️ TMDB Fetch Error:', error.message)
        console.log('⚠️ Switching to fallback data mode...')
        await processMovies(FALLBACK_MOVIES, 'Mixed', true)
        return false
    }
}

// Fetch raw data for direct serving (In-Memory Fallback)
export const getDirectMovies = async (category = 'all') => {
    try {
        const results = []
        if (category === 'all' || category === 'Cinema') {
             const res = await axios.get(`${BASE_URL}/movie/now_playing?api_key=${TMDB_API_KEY}&language=en-US&page=1`)
             results.push(...res.data.results.map(m => formatMovie(m, 'Cinema')))
        }
        if (category === 'all' || category === 'Netflix') {
             const res = await axios.get(`${BASE_URL}/discover/movie?api_key=${TMDB_API_KEY}&with_watch_providers=8&watch_region=US&sort_by=popularity.desc`)
             results.push(...res.data.results.map(m => formatMovie(m, 'Netflix')))
        }
        if (category === 'all' || category === 'Amazon Prime') {
             const res = await axios.get(`${BASE_URL}/discover/movie?api_key=${TMDB_API_KEY}&with_watch_providers=9&watch_region=US&sort_by=popularity.desc`)
             results.push(...res.data.results.map(m => formatMovie(m, 'Amazon Prime')))
        }
         if (category === 'all' || category === 'Anime Hits') {
             const res = await axios.get(`${BASE_URL}/discover/movie?api_key=${TMDB_API_KEY}&with_genres=16&sort_by=popularity.desc&with_original_language=ja`)
             results.push(...res.data.results.map(m => formatMovie(m, 'Anime Hits')))
        }
        if (category === 'all' || category === 'Family 3D') {
             const res = await axios.get(`${BASE_URL}/discover/movie?api_key=${TMDB_API_KEY}&with_genres=16,10751&sort_by=popularity.desc`)
             results.push(...res.data.results.map(m => formatMovie(m, 'Family 3D')))
        }
        return results
    } catch (error) {
        console.error('Direct Fetch Error:', error.message)
        return FALLBACK_MOVIES // Return static data if API and DB both fail
    }
}

const formatMovie = (movie, providerName) => {
    return {
        id: movie.id, // Frontend expects 'id'
        tmdbId: movie.id, // Player expects 'tmdbId'
        _id: movie.id, // Backend compatibility
        title: movie.title,
        description: movie.overview,
        poster: movie.poster_path ? `https://image.tmdb.org/t/p/w500${movie.poster_path}` : 'https://via.placeholder.com/500x750?text=No+Poster',
        backdrop: movie.backdrop_path ? `https://image.tmdb.org/t/p/original${movie.backdrop_path}` : 'https://via.placeholder.com/1920x1080?text=Stream-X',
        rating: movie.vote_average,
        year: new Date(movie.release_date || '2023-01-01').getFullYear(),
        genres: ['Action', 'Cinema'], // Placeholder
        duration: 120,
        videoUrl: `https://vidsrc.vip/embed/movie/${movie.id}`, 
        provider: providerName,
        tmdbId: movie.id,
        isTrending: true
    }
}

const processMovies = async (movies, providerName, isFallback = false) => {
    try {
        if (mongoose.connection.readyState !== 1) return; // Skip if no DB
        for (const movie of movies) {
        if (!movie.title) continue

        // Check if exists
        const exists = await Movie.findOne({ 
             $or: [
                 { tmdbId: movie.id }, 
                 { title: movie.title }
             ] 
        })
        
        if (exists) {
            // Update rating/popularity if needed
            exists.views += 1 // Simulate popularity
            exists.isTrending = true
            await exists.save()
            continue
        }

        // Add new movie
        const newMovie = new Movie({
            title: movie.title,
            description: movie.overview || movie.description,
            poster: isFallback ? movie.poster : `https://image.tmdb.org/t/p/w500${movie.poster_path}`,
            backdrop: isFallback ? movie.backdrop : `https://image.tmdb.org/t/p/original${movie.backdrop_path}`,
            rating: movie.vote_average || movie.rating,
            year: new Date(movie.release_date || '2023-01-01').getFullYear(),
            genres: ['Action', 'Drama'], // Simplified genre mapping
            duration: 120, // Placeholder
            // Using a free embed service for wider compatibility (SuperStream/VidSrc example pattern)
            // Ideally, you'd use a real paid provider's API for legal streaming.
            // This is a placeholder for the concept of "Real Streaming Link"
            videoUrl: `https://vidsrc.to/embed/movie/${movie.id}`, 
            provider: providerName,
            tmdbId: movie.id || Math.floor(Math.random() * 100000),
            isTrending: true
        })

        await newMovie.save()
        console.log(`✨ Added new hit: ${movie.title} [${providerName}]`)
    }
  } catch (error) {
    console.log(`Error processing movies for ${providerName}: ${error.message}`)
  }
}
