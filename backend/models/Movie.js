import mongoose from 'mongoose'

const movieSchema = new mongoose.Schema({
  title: { type: String, required: true, index: true },
  description: String,
  poster: String,
  backdrop: String,
  rating: { type: Number, min: 0, max: 10 },
  year: Number,
  director: [String],
  cast: [String],
  genres: [String],
  duration: Number,
  videoUrl: String,
  trailerUrl: String,
  provider: { type: String, default: 'StreamX' }, // Netflix, Hulu, Amazon etc.
  tmdbId: { type: Number, unique: true, sparse: true },
  isTrending: { type: Boolean, default: false },
  views: { type: Number, default: 0 },
  likes: { type: Number, default: 0 },
  type: { type: String, default: 'movie' }, // Added type
  createdAt: { type: Date, default: Date.now }
})

export default mongoose.model('Movie', movieSchema)
