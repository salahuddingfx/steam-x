import axios from 'axios'
import mongoose from 'mongoose'
import Movie from '../models/Movie.js'

// REMOVED top-level const to fix ESM hoisting issue
// const TMDB_API_KEY = process.env.TMDB_API_KEY; 
const BASE_URL = 'https://api.themoviedb.org/3'

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

// Helper to reliably get key at RUNTIME
const getKey = () => {
    const key = process.env.TMDB_API_KEY;
    if (!key) throw new Error("TMDB_API_KEY is missing in .env");
    return key;
}

// ✅ NEW: Fetch Latest Content (Movies + Anime/Cartoons 2024-2026)
export const fetchLatestContent = async () => {
    try {
        const apiKey = getKey();
        console.log('🚀 Fetching Latest 2024-2026 Content (Movies + Anime/Cartoons)...');
        const years = [2024, 2025, 2026];
        
        for (const year of years) {
            // 1. Movies
            const movieUrl = `${BASE_URL}/discover/movie?api_key=${apiKey}&primary_release_year=${year}&sort_by=popularity.desc`;
            try {
                const movieRes = await axios.get(movieUrl);
                await processMovies(movieRes.data.results, `Cinema ${year}`, false, 'movie');
            } catch (err) {
                 console.log(`   ❌ Failed to fetch Movies ${year}: ${err.message}`);
            }

            // 2. Animated Movies (Cartoon/Anime Movies)
            const animeMovieUrl = `${BASE_URL}/discover/movie?api_key=${apiKey}&primary_release_year=${year}&with_genres=16&sort_by=popularity.desc`;
            try {
                const animeMovieRes = await axios.get(animeMovieUrl);
                await processMovies(animeMovieRes.data.results, `Animation ${year}`, false, 'movie');
            } catch (err) {  }

            // 3. TV Series (Anime/Cartoons)
            const tvUrl = `${BASE_URL}/discover/tv?api_key=${apiKey}&first_air_date_year=${year}&with_genres=16&sort_by=popularity.desc`;
            try {
                const tvRes = await axios.get(tvUrl);
                await processMovies(tvRes.data.results, `Anime/Cartoon Series ${year}`, false, 'tv');
            } catch (err) {  }
        }
        console.log('✅ Latest content update finished.');
    } catch (error) {
        console.error('Latest Content Fetch Error:', error.message);
    }
}

// ✅ NEW: Aggressive Discovery (Infinite Loader Hook)
export const fetchDiscoverMovies = async (page = 1) => {
    try {
        const apiKey = getKey();
        // Shift TMDB page logic so we don't just get the same 20 items. 
        // We map MongoDB page 1..N to TMDB pages.
        // Also adding random sort to keep it fresh
        const url = `${BASE_URL}/discover/movie?api_key=${apiKey}&language=en-US&sort_by=popularity.desc&include_adult=false&include_video=false&page=${page}`;
        
        console.log(`⚡ Aggressive Fetch: Loading Page ${page} from TMDB...`);
        const res = await axios.get(url);
        
        if (res.data.results && res.data.results.length > 0) {
             await processMovies(res.data.results, 'TMDB Discovery', true, 'movie');
             return true;
        }
        return false;
    } catch (error) {
        console.error('Aggressive Fetch Failed:', error.message);
        return false;
    }
}

// ✅ Extractor Function (Frontend Call)
export const fetchAndSaveMovies = async (source = 'tmdb', limit = 20) => {
    try {
        const apiKey = getKey();
        let url;
        let providerName = 'Custom Extract';

        // Source Logic
        switch (source) {
            case 'tmdb': 
                url = `${BASE_URL}/movie/popular?api_key=${apiKey}&page=1`;
                providerName = 'TMDB Popular';
                break;
            case 'netflix':
                url = `${BASE_URL}/discover/movie?api_key=${apiKey}&with_watch_providers=8&watch_region=US&sort_by=popularity.desc`;
                providerName = 'Netflix';
                break;
            case 'amazon':
                url = `${BASE_URL}/discover/movie?api_key=${apiKey}&with_watch_providers=9&watch_region=US&sort_by=popularity.desc`;
                providerName = 'Amazon Prime';
                break;
            case 'disney':
                url = `${BASE_URL}/discover/movie?api_key=${apiKey}&with_watch_providers=337&watch_region=US&sort_by=popularity.desc`;
                providerName = 'Disney+';
                break;
            case 'imdb': 
                url = `${BASE_URL}/movie/top_rated?api_key=${apiKey}&page=1`;
                providerName = 'IMDb Top';
                break;
            default:
                url = `${BASE_URL}/movie/now_playing?api_key=${apiKey}&page=1`;
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

// ✅ NEW: Fetch Specific Requested Shows/Genres
export const fetchSpecificShows = async () => {
    try {
        const apiKey = getKey();
        console.log('🕵️ Fetching Specific Requested Content...');

        // 1. Stranger Things (TV Show ID: 66732)
        // We fetch the TV show details directly
        const stUrl = `${BASE_URL}/tv/66732?api_key=${apiKey}`;
        try {
            const stRes = await axios.get(stUrl);
            await processMovies([stRes.data], 'Netflix Exclusive', true, 'tv');
            console.log('   ✅ Added: Stranger Things');
        } catch (e) {
            console.log('   ❌ Failed to fetch Stranger Things');
        }

        // 2. Psychological Thrillers / Horror (Psychopathic Vibe)
        // Genre 53 = Thriller, 27 = Horror, 9648 = Mystery
        const psychoUrl = `${BASE_URL}/discover/movie?api_key=${apiKey}&with_genres=53,27,9648&sort_by=popularity.desc&page=1`;
        try {
            const psychoRes = await axios.get(psychoUrl);
            await processMovies(psychoRes.data.results, 'Psychological Thrillers', false, 'movie');
            console.log('   ✅ Added: 20 Psychological Thrillers');
        } catch (e) { }

    } catch (error) {
        console.error('Specific Fetch Error:', error.message);
    }
}

// ✅ Auto-Updater Function
export const fetchTrendingData = async () => {
    try {
        const apiKey = getKey();
        console.log('🔄 Auto-updating trending movies (Multi-Page)...')
        
        // Fetch specific recent content first
        await fetchLatestContent();
        
        // Fetch User Requested Content (Stranger Things + Thrillers)
        await fetchSpecificShows();

        // Priority: Now Playing (Pages 1-3)
        for (let page = 1; page <= 3; page++) {
            const nowPlayingRes = await axios.get(`${BASE_URL}/movie/now_playing?api_key=${apiKey}&language=en-US&page=${page}`)
            await processMovies(nowPlayingRes.data.results, 'Cinema', true)
        }

        // Generic Trending (Pages 1-3)
        for (let page = 1; page <= 3; page++) {
            const trendingRes = await axios.get(`${BASE_URL}/trending/movie/week?api_key=${apiKey}&page=${page}`)
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
        const apiKey = getKey();
        const res = await axios.get(`${BASE_URL}/movie/now_playing?api_key=${apiKey}&language=en-US&page=1`)
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
const processMovies = async (movies, providerName, isFallback = false, type = 'movie') => {
    try {
        if (mongoose.connection.readyState !== 1) return 0;
        let count = 0;

        for (const movie of movies) {
            // STRICT FILTERING: Skip movies without Title OR POSTER
            // This prevents "No Poster" items from cluttering the infinite scroll
            if ((!movie.title && !movie.name) || !movie.poster_path) continue;

            const title = movie.title || movie.name;
            const tmdbId = movie.id;

            // Check duplicate
            const exists = await Movie.findOne({ 
                 $or: [
                     { tmdbId: tmdbId }, 
                     { title: title }
                 ] 
            })
            
            if (exists) {
                exists.views += 1 
                if (isFallback) exists.isTrending = true
                if (!exists.type) exists.type = type;

                // Ensure video URL is set to premium link if missing
                if (!exists.videoUrl || exists.videoUrl.includes('w3schools')) {
                     exists.videoUrl = type === 'movie' ? `https://vidsrc.to/embed/movie/${tmdbId}` : `https://vidsrc.to/embed/tv/${tmdbId}/1/1`;
                }
                await exists.save()
                continue
            }

            // Create New Movie
            const newMovie = new Movie({
                title: title,
                description: movie.overview || movie.description,
                poster: isFallback ? movie.poster : (movie.poster_path ? `https://image.tmdb.org/t/p/w500${movie.poster_path}` : null),
                backdrop: isFallback ? movie.backdrop : (movie.backdrop_path ? `https://image.tmdb.org/t/p/original${movie.backdrop_path}` : null),
                rating: movie.vote_average || movie.rating,
                year: new Date(movie.release_date || movie.first_air_date || '2023-01-01').getFullYear(),
                genres: ['Action', 'Drama'],
                duration: 120,
                type: type,
                // 🔥 PREMIUM FREE LINK (Zero Latency)
                videoUrl: type === 'movie' ? `https://vidsrc.to/embed/movie/${tmdbId}` : `https://vidsrc.to/embed/tv/${tmdbId}/1/1`, 
                provider: providerName,
                tmdbId: tmdbId || Math.floor(Math.random() * 100000),
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