import express from 'express'
import mongoose from 'mongoose'
import Movie from '../models/Movie.js'

// ✅ Import Services
import { getDirectMovies, fetchAndSaveMovies, fetchDiscoverMovies } from '../services/tmdb.js' 
import { getWatchLinks } from '../services/watchmode.js'

const router = express.Router()

// 🔥 Route 1: Movie Extractor (Heavy Lifting)
router.post('/extract', async (req, res) => {
  try {
    const { source, limit } = req.body;
    
    const result = await fetchAndSaveMovies(source || 'tmdb', limit || 20);

    if (result.success) {
      res.json({ 
        success: true,
        message: 'Extraction Successful',
        source: result.source,
        count: result.count
      });
    } else {
      res.status(500).json({ error: result.error || 'Extraction failed' });
    }
  } catch (error) {
    console.error('Route Error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Route 2: Get All Movies (Home Page - Infinite Scroll Optimized)
router.get('/', async (req, res) => {
  try {
    const { search, genre, sort, page = 1, limit = 24 } = req.query
    const skip = (page - 1) * limit;

    let movies = []

    try {
        if (mongoose.connection.readyState === 1) {
             let query = {}
             if (search) query.title = { $regex: search, $options: 'i' }
             if (genre) query.genres = genre

             let dbQuery = Movie.find(query)
             if (sort === 'rating') dbQuery.sort({ rating: -1 })
             else if (sort === 'newest') dbQuery.sort({ year: -1, createdAt: -1 })
             else dbQuery.sort({ views: -1 })
             
             movies = await dbQuery.skip(skip).limit(parseInt(limit));
             
             // 🔥 AGGRESSIVE MODE: If not enough movies, fetch LIVE from TMDB
             if (movies.length < limit && !search && !genre) {
                 console.log(`⚠️ Low Content on Page ${page}. Fetching more...`);
                 await fetchDiscoverMovies(page);
                 movies = await dbQuery.skip(skip).limit(parseInt(limit));
             }
        }
    } catch (e) {
        console.log("DB Query failed, using fallback", e)
    }

    if (!movies || movies.length === 0) {
        const allMovies = await getDirectMovies()
        movies = allMovies
    }

    res.json(movies)
  } catch (error) {
    res.status(500).json({ message: 'Server Error', error: error.message })
  }
})

// Route 3: Get Trending
router.get('/trending/all', async (req, res) => {
  try {
    const movies = await Movie.find().sort({ views: -1 }).limit(20)
    res.json(movies)
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
})

// 🔥 Route 4: Get Movie Details + Streaming Options (NEW)
router.get('/:id', async (req, res) => {
  try {
    let movie;
    
    // Check if valid Mongo ID first to avoid CastError
    if (mongoose.Types.ObjectId.isValid(req.params.id)) {
        movie = await Movie.findById(req.params.id);
    }

    // If not found by ID or invalid ID, try TMDB ID
    if (!movie) {
         movie = await Movie.findOne({ tmdbId: req.params.id });
    }
    
    if (!movie) return res.status(404).json({ error: 'Movie not found' });

    const responseData = movie.toObject();

    // Set default vidsrc link
    responseData.videoUrl = responseData.videoUrl || 
        `https://vidsrc.to/embed/${responseData.type === 'tv' ? 'tv' : 'movie'}/${responseData.tmdbId}`;

    // 🔥 NEW: Fetch Watchmode Streaming Options
    const watchmodeData = await getWatchLinks(movie.tmdbId, movie.title);
    
    if (watchmodeData.success) {
        responseData.streamingOptions = watchmodeData.providers;
        responseData.streamingProviders = watchmodeData.providers.map(p => p.name).join(', ');
    } else {
        responseData.streamingOptions = [];
        responseData.streamingProviders = 'Check VidSrc';
    }

    res.json(responseData)
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
})

export default router