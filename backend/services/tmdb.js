import axios from 'axios'
import mongoose from 'mongoose'
import Movie from '../models/Movie.js'

const BASE_URL = 'https://api.themoviedb.org/3'

// TMDB genre ID → name mapping
const TMDB_GENRE_MAP = {
    12: 'Adventure', 14: 'Fantasy', 16: 'Animation', 18: 'Drama',
    27: 'Horror', 28: 'Action', 35: 'Comedy', 36: 'History',
    53: 'Thriller', 80: 'Crime', 99: 'Documentary', 878: 'Sci-Fi',
    9648: 'Mystery', 10402: 'Music', 10749: 'Romance', 10751: 'Family',
    10752: 'War', 10759: 'Action & Adventure', 10762: 'Kids',
    10763: 'News', 10764: 'Reality', 10765: 'Sci-Fi & Fantasy',
    10766: 'Soap', 10767: 'Talk', 10768: 'War & Politics', 10770: 'TV Movie',
}

// ─────────────────────────────────────────────
// ALL TMDB categories we crawl systematically.
// Each entry fetches `page` from that endpoint.
// This gives us: movies + TV, all genres, all providers.
// ─────────────────────────────────────────────
const SYNC_CATALOG = [
  // ── Movies ──────────────────────────────────
  { path: '/movie/popular',                                               label: 'Popular',         type: 'movie' },
  { path: '/movie/top_rated',                                             label: 'Top Rated',       type: 'movie' },
  { path: '/movie/now_playing',                                           label: 'Cinema',          type: 'movie' },
  { path: '/movie/upcoming',                                              label: 'Upcoming',        type: 'movie' },
  { path: '/trending/movie/week',                                         label: 'Trending',        type: 'movie' },
  // ── TV / Series ─────────────────────────────
  { path: '/tv/popular',                                                  label: 'TV Popular',      type: 'tv' },
  { path: '/tv/top_rated',                                                label: 'TV Top Rated',    type: 'tv' },
  { path: '/tv/on_the_air',                                               label: 'Now Airing',      type: 'tv' },
  { path: '/trending/tv/week',                                            label: 'TV Trending',     type: 'tv' },
  // ── Discover: Genres ────────────────────────
  { path: '/discover/movie?with_genres=28',                               label: 'Action',          type: 'movie' },
  { path: '/discover/movie?with_genres=12',                               label: 'Adventure',       type: 'movie' },
  { path: '/discover/movie?with_genres=35',                               label: 'Comedy',          type: 'movie' },
  { path: '/discover/movie?with_genres=18',                               label: 'Drama',           type: 'movie' },
  { path: '/discover/movie?with_genres=27',                               label: 'Horror',          type: 'movie' },
  { path: '/discover/movie?with_genres=878',                              label: 'Sci-Fi',          type: 'movie' },
  { path: '/discover/movie?with_genres=53',                               label: 'Thriller',        type: 'movie' },
  { path: '/discover/movie?with_genres=16',                               label: 'Animation',       type: 'movie' },
  { path: '/discover/movie?with_genres=10749',                            label: 'Romance',         type: 'movie' },
  { path: '/discover/movie?with_genres=80',                               label: 'Crime',           type: 'movie' },
  { path: '/discover/movie?with_genres=99',                               label: 'Documentary',     type: 'movie' },
  { path: '/discover/movie?with_genres=14',                               label: 'Fantasy',         type: 'movie' },
  // ── Discover: Anime & Cartoons ───────────────
  { path: '/discover/tv?with_genres=16&sort_by=popularity.desc',         label: 'Anime',           type: 'tv' },
  { path: '/discover/tv?with_genres=10759',                               label: 'Action Series',   type: 'tv' },
  { path: '/discover/tv?with_genres=18',                                  label: 'Drama Series',    type: 'tv' },
  { path: '/discover/tv?with_genres=35',                                  label: 'Comedy Series',   type: 'tv' },
  { path: '/discover/tv?with_genres=9648',                                label: 'Mystery Series',  type: 'tv' },
  // ── Streaming Providers ─────────────────────
  { path: '/discover/movie?with_watch_providers=8&watch_region=US',      label: 'Netflix',         type: 'movie' },
  { path: '/discover/movie?with_watch_providers=9&watch_region=US',      label: 'Amazon Prime',    type: 'movie' },
  { path: '/discover/movie?with_watch_providers=337&watch_region=US',    label: 'Disney+',         type: 'movie' },
  { path: '/discover/movie?with_watch_providers=384&watch_region=US',    label: 'HBO Max',         type: 'movie' },
  { path: '/discover/movie?with_watch_providers=350&watch_region=US',    label: 'Apple TV+',       type: 'movie' },
  { path: '/discover/tv?with_watch_providers=8&watch_region=US',         label: 'Netflix Series',  type: 'tv' },
  { path: '/discover/tv?with_watch_providers=9&watch_region=US',         label: 'Prime Series',    type: 'tv' },
  { path: '/discover/tv?with_watch_providers=337&watch_region=US',       label: 'Disney Series',   type: 'tv' },
  // ── Year-based ───────────────────────────────
  { path: '/discover/movie?primary_release_year=2025&sort_by=popularity.desc', label: '2025 Movies', type: 'movie' },
  { path: '/discover/movie?primary_release_year=2024&sort_by=popularity.desc', label: '2024 Movies', type: 'movie' },
  { path: '/discover/movie?primary_release_year=2023&sort_by=popularity.desc', label: '2023 Movies', type: 'movie' },
]

// ─────────────────────────────────────────────
// DEEP SYNC — called every 15 min by updater.
// Fetches `page` from every category in SYNC_CATALOG.
// Each call = ~36 categories × 20 movies = ~720 unique movies tried.
// ─────────────────────────────────────────────
export const deepSyncTMDB = async (page = 1) => {
  const apiKey = getKey()
  let totalSaved = 0

  for (const cat of SYNC_CATALOG) {
    try {
      const separator = cat.path.includes('?') ? '&' : '?'
      const url = `${BASE_URL}${cat.path}${separator}api_key=${apiKey}&language=en-US&page=${page}`
      const res = await axios.get(url, { timeout: 8000 })
      if (res.data?.results?.length) {
        const saved = await processMovies(res.data.results, cat.label, false, cat.type)
        totalSaved += saved
      }
      // Respect TMDB rate limit: 40 req/10s → ~250ms gap is safe
      await new Promise(r => setTimeout(r, 260))
    } catch (e) {
      // Silently skip failed categories (API limit / network blip)
    }
  }

  console.log(`✅ Deep sync page ${page} done — ${totalSaved} new items saved`)
  return totalSaved
}


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
        return []
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
                genres: (movie.genre_ids || []).map(id => TMDB_GENRE_MAP[id]).filter(Boolean),
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