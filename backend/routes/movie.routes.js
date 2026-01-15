import express from 'express'
import mongoose from 'mongoose'
import Movie from '../models/Movie.js'

// ✅ Import Services
import { getDirectMovies, fetchAndSaveMovies } from '../services/tmdb.js' 
import { findArchiveMovie } from '../services/archive.js'
import { getWatchLinks } from '../services/watchmode.js'

const router = express.Router()

// 🔥 Route 1: Movie Extractor (Heavy Lifting)
router.post('/extract', async (req, res) => {
  try {
    const { source, limit } = req.body;
    
    // Call the Service function from tmdb.js
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

// Route 2: Get All Movies (Home Page)
router.get('/', async (req, res) => {
  try {
    const { search, genre, sort } = req.query
    let movies = []

    try {
        if (mongoose.connection.readyState === 1) {
             let query = {}
             if (search) query.title = { $regex: search, $options: 'i' }
             if (genre) query.genres = genre

             let dbQuery = Movie.find(query)
             if (sort === 'rating') dbQuery.sort({ rating: -1 })
             else if (sort === 'newest') dbQuery.sort({ createdAt: -1 })
             else dbQuery.sort({ views: -1 })
             
             movies = await dbQuery.limit(50)
        }
    } catch (e) {
        console.log("DB Query failed, using fallback")
    }

    // Fallback if DB empty
    if (!movies || movies.length === 0) {
        const allMovies = await getDirectMovies()
        movies = allMovies.filter(m => {
            if (search && !m.title.toLowerCase().includes(search.toLowerCase())) return false;
            return true;
        })
        if (sort === 'rating') movies.sort((a,b) => b.rating - a.rating)
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

// 🔥 Route 4: Get Movie Details (Optimized for Zero Latency)
router.get('/:id', async (req, res) => {
  try {
    let movie = await Movie.findById(req.params.id)
    if (!movie) {
         movie = await Movie.findOne({ tmdbId: req.params.id })
    }
    
    if (!movie) return res.status(404).json({ error: 'Movie not found' })

    const responseData = movie.toObject()

    // 1. Check Archive.org (ONLY if no videoUrl is present)
    // Optimization: If we have a 'vidsrc' link, we SKIP Archive search to make it faster.
    const hasPremiumLink = responseData.videoUrl && responseData.videoUrl.includes('vidsrc');
    
    if (!hasPremiumLink) {
        try {
            const archiveUrl = await findArchiveMovie(movie.title)
            if (archiveUrl) {
                responseData.streamUrl = archiveUrl
                responseData.isLiveStream = true
                responseData.legalSource = 'Archive.org'
            }
        } catch (err) {
            console.log('Archive search skipped')
        }
    }

    // 2. Check Watchmode (Async - Optional)
    // We wrap this so it doesn't crash the request if API fails
    if (movie.tmdbId) {
        getWatchLinks(movie.tmdbId)
            .then(links => {
                 // Note: In a real heavy app, we might socket this. 
                 // Here we await it or just return what we have if it's slow.
                 // For now, let's assume it's fast enough or handled by frontend separately.
                 // But strictly for the route, we return what we found.
                 responseData.watchLinks = links;
            })
            .catch(() => {}); 
        
        // Await strictly if you want the data definitely, 
        // but removing await here speeds up response if you don't care about links immediately.
        // For safety, let's keep the await from your original code but protected:
        try {
             const links = await getWatchLinks(movie.tmdbId)
             responseData.watchLinks = links
        } catch(e) {}
    }

    // Increment Views (Background)
    movie.views += 1
    await movie.save()
    
    res.json(responseData)
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
})

// Route 5: Create Movie Manually
router.post('/', async (req, res) => {
  try {
    const movie = new Movie(req.body)
    await movie.save()
    res.status(201).json(movie)
  } catch (error) {
    res.status(400).json({ error: error.message })
  }
})

export default router