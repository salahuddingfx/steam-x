import express from 'express'
import mongoose from 'mongoose'
import Movie from '../models/Movie.js'

const router = express.Router()

import { getDirectMovies } from '../services/tmdb.js'
import { findArchiveMovie } from '../services/archive.js'
import { getWatchLinks } from '../services/watchmode.js'

// Get all movies
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

    // If DB returned nothing or failed, use Live Data
    if (!movies || movies.length === 0) {
        console.log("Using Live TMDB Data")
        const allMovies = await getDirectMovies()
        // Filter and Sort in Memory
        movies = allMovies.filter(m => {
            if (search && !m.title.toLowerCase().includes(search.toLowerCase())) return false;
            return true;
        })
        
        if (sort === 'rating') movies.sort((a,b) => b.rating - a.rating)
        // else ... (simplified)
    }

    res.json(movies)
  } catch (error) {
    res.status(500).json({ message: 'Server Error', error: error.message })
  }
})

// Get movie by ID
router.get('/:id', async (req, res) => {
  try {
    let movie = await Movie.findById(req.params.id)
    if (!movie) {
         // Allow lookup by TMDB ID if Mongo ID fails
         movie = await Movie.findOne({ tmdbId: req.params.id })
    }
    
    if (!movie) return res.status(404).json({ error: 'Movie not found' })

    const responseData = movie.toObject()

    // 1. Check Archive.org for Free Version
    // Only search if we don't have a specific videoUrl overridden manually
    try {
        const title = movie.title
        const archiveUrl = await findArchiveMovie(title)
        
        if (archiveUrl) {
            responseData.streamUrl = archiveUrl
            responseData.isLiveStream = true
            responseData.legalSource = 'Archive.org (Public Domain)'
        } 
    } catch (err) {
        console.log('Archive search skipped:', err.message)
    }

    // 2. If no free stream (or even if there is), fetch official Quick Links
    if (!responseData.streamUrl && movie.tmdbId) {
        try {
            const links = await getWatchLinks(movie.tmdbId)
            responseData.watchLinks = links
        } catch (err) {
            console.log('Watchmode fetch skipped')
        }
    }

    movie.views += 1
    await movie.save()
    res.json(responseData)
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
})

// Create movie
router.post('/', async (req, res) => {
  try {
    const movie = new Movie(req.body)
    await movie.save()
    res.status(201).json(movie)
  } catch (error) {
    res.status(400).json({ error: error.message })
  }
})

// Get trending
router.get('/trending/all', async (req, res) => {
  try {
    const movies = await Movie.find().sort({ views: -1 }).limit(20)
    res.json(movies)
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
})

export default router
