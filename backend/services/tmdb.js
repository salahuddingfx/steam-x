import axios from 'axios'
import mongoose from 'mongoose'
import Movie from '../models/Movie.js'

const TMDB_API_KEY = process.env.TMDB_API_KEY;
const BASE_URL = 'https://api.themoviedb.org/3'

if (!TMDB_API_KEY) {
    console.warn("⚠️ TMDB_API_KEY is missing in .env file! Movie data fetching will fail.");
}

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
    videoUrl: 'https://vidsrc.to/embed/movie/385687' // Real ID
  },
  {
    title: 'The Tomorrow War',
    description: 'The world is stunned when a group of time travelers arrive from the year 2051.',
    poster: 'https://image.tmdb.org/t/p/w500/34nDCQZwaEvsy4CFO5hkGRFDCVU.jpg',
    backdrop: 'https://image.tmdb.org/t/p/original/xXHZeb1yhJvnSHPzZDqee0zfQq6.jpg',
    rating: 8.0,
    year: 2021,
    provider: 'Amazon Prime',
    videoUrl: 'https://vidsrc.to/embed/movie/588228' // Real ID
  }
]

// ✅ NEW: Extractor Function (Frontend Call)
export const fetchAndSaveMovies = async (source = 'tmdb', limit = 20) => {
    try {
        let url;
        let providerName = 'Custom Extract';

        // Source Logic
        switch (source) {
            case 'tmdb': 
                url = `${BASE_URL}/movie/popular?api_key=${TMDB_API_KEY}&page=1`;
                providerName = 'TMDB Popular';
                break;
            case 'netflix':
                url = `${BASE_URL}/discover/movie?api_key=${TMDB_API_KEY}&with_watch_providers=8&watch_region=US&sort_by=popularity.desc`;
                providerName = 'Netflix';
                break;
            case 'amazon':
                url = `${BASE_URL}/discover/movie?api_key=${TMDB_API_KEY}&with_watch_providers=9&watch_region=US&sort_by=popularity.desc`;
                providerName = 'Amazon Prime';
                break;
            case 'disney':
                url = `${BASE_URL}/discover/movie?api_key=${TMDB_API_KEY}&with_watch_providers=337&watch_region=US&sort_by=popularity.desc`;
                providerName = 'Disney+';
                break;
            case 'imdb': 
                url = `${BASE_URL}/movie/top_rated?api_key=${TMDB_API_KEY}&page=1`;
                providerName = 'IMDb Top';
                break;
            default:
                url = `${BASE_URL}/movie/now_playing?api_key=${TMDB_API_KEY}&page=1`;
                providerName = 'Cinema Release';
        }

        console.log(`🔌 Extracting from: ${providerName}...`);
        
        const res = await axios.get(url);
        const movies = res.data.results.slice(0, limit);

        // Process and Save
        const savedCount = await processMovies(movies, providerName);
        
        return { success: true, count: savedCount, source: providerName };

    } catch (error) {
        console.error('Extractor Service Error:', error.message);
        return { success: false, error: error.message };
    }
}

// ✅ Auto-Updater Function
export const fetchTrendingData = async () => {
    try {
        console.log('🔄 Auto-updating trending movies (Multi-Page)...')
        
        // Priority: Now Playing (Pages 1-3)
        for (let page = 1; page <= 3; page++) {
            const nowPlayingRes = await axios.get(`${BASE_URL}/movie/now_playing?api_key=${TMDB_API_KEY}&language=en-US&page=${page}`)
            await processMovies(nowPlayingRes.data.results, 'Cinema', true)
        }

        // Generic Trending (Pages 1-3)
        for (let page = 1; page <= 3; page++) {
            const trendingRes = await axios.get(`${BASE_URL}/trending/movie/week?api_key=${TMDB_API_KEY}&page=${page}`)
            await processMovies(trendingRes.data.results, 'StreamX Hit')
        }

        console.log('✅ Auto-update complete (Updated ~120 Movies)');
        return true
    } catch (error) {
        console.error('TMDB Auto-Update Error:', error.message)
        // Fallback
        await processMovies(FALLBACK_MOVIES, 'Mixed', true)
        return false
    }
}

// Direct Serving (In-Memory Fallback)
export const getDirectMovies = async () => {
    try {
        const res = await axios.get(`${BASE_URL}/movie/now_playing?api_key=${TMDB_API_KEY}&language=en-US&page=1`)
        return res.data.results.map(m => formatMovie(m, 'Cinema'))
    } catch (error) {
        return FALLBACK_MOVIES
    }
}

const formatMovie = (movie, providerName) => {
    return {
        id: movie.id, 
        tmdbId: movie.id,
        _id: movie.id,
        title: movie.title,
        description: movie.overview,
        poster: movie.poster_path ? `https://image.tmdb.org/t/p/w500${movie.poster_path}` : 'https://placehold.co/500x750/1a1a1a/FFF?text=No+Poster',
        backdrop: movie.backdrop_path ? `https://image.tmdb.org/t/p/original${movie.backdrop_path}` : 'https://placehold.co/1920x1080/1a1a1a/FFF?text=Stream-X',
        rating: movie.vote_average,
        year: new Date(movie.release_date || '2023-01-01').getFullYear(),
        genres: ['Action', 'Cinema'],
        duration: 120,
        // Using VidSrc.to as primary
        videoUrl: `https://vidsrc.to/embed/movie/${movie.id}`, 
        provider: providerName,
        isTrending: true
    }
}

// ✅ Main Processing Logic
const processMovies = async (movies, providerName, isFallback = false) => {
    try {
        if (mongoose.connection.readyState !== 1) return 0;
        let count = 0;

        for (const movie of movies) {
            if (!movie.title) continue

            // Check duplicate
            const exists = await Movie.findOne({ 
                 $or: [
                     { tmdbId: movie.id }, 
                     { title: movie.title }
                 ] 
            })
            
            if (exists) {
                exists.views += 1 
                if (isFallback) exists.isTrending = true
                // Ensure video URL is set to premium link if missing
                if (!exists.videoUrl || exists.videoUrl.includes('w3schools')) {
                     exists.videoUrl = `https://vidsrc.to/embed/movie/${movie.id}`;
                }
                await exists.save()
                continue
            }

            // Create New Movie
            const newMovie = new Movie({
                title: movie.title,
                description: movie.overview || movie.description,
                poster: isFallback ? movie.poster : (movie.poster_path ? `https://image.tmdb.org/t/p/w500${movie.poster_path}` : null),
                backdrop: isFallback ? movie.backdrop : (movie.backdrop_path ? `https://image.tmdb.org/t/p/original${movie.backdrop_path}` : null),
                rating: movie.vote_average || movie.rating,
                year: new Date(movie.release_date || '2023-01-01').getFullYear(),
                genres: ['Action', 'Drama'],
                duration: 120,
                // 🔥 PREMIUM FREE LINK (Zero Latency)
                videoUrl: `https://vidsrc.to/embed/movie/${movie.id}`, 
                provider: providerName,
                tmdbId: movie.id || Math.floor(Math.random() * 100000),
                isTrending: true
            })

            await newMovie.save()
            count++
        }
        
        console.log(`✨ Saved ${count} movies from ${providerName}`)
        return count;

    } catch (error) {
        console.error(`Error processing ${providerName}: ${error.message}`)
        return 0;
    }
}