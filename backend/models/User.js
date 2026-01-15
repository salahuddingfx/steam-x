import mongoose from 'mongoose'
import bcrypt from 'bcryptjs'

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true, lowercase: true },
  password: { type: String, required: true, select: false },
  // Storing simplified movie objects from TMDB directly to avoid complex relation management for this prototype
  favorites: [{
    id: Number, // TMDB ID
    tmdbId: Number, // Alternate TMDB ID key
    title: String,
    name: String, // For TV shows
    poster_path: String,
    backdrop_path: String,
    overview: String,
    vote_average: Number,
    media_type: String
  }],
  // Continue watching history
  watchlist: [{
    id: Number, // TMDB ID
    tmdbId: Number, 
    title: String,
    name: String,
    poster_path: String,
    progress: { type: Number, default: 0 }, // Seconds watched
    duration: Number, // Total duration
    lastWatched: { type: Date, default: Date.now }
  }],
  createdAt: { type: Date, default: Date.now }
})

userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next()
  this.password = await bcrypt.hash(this.password, 10)
})

export default mongoose.model('User', userSchema)
