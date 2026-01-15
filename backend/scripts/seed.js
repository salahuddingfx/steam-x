import mongoose from 'mongoose'
import dotenv from 'dotenv'
import Movie from '../models/Movie.js'

dotenv.config()

const sampleMovies = [
  {
    title: 'Inception',
    description: 'A skilled thief steals corporate secrets while dreaming.',
    poster: 'https://via.placeholder.com/300x450?text=Inception',
    rating: 8.8,
    year: 2010,
    director: ['Christopher Nolan'],
    cast: ['Leonardo DiCaprio', 'Ellen Page'],
    genres: ['Sci-Fi', 'Thriller'],
    duration: 148,
    videoUrl: 'https://www.w3schools.com/html/mov_bbb.mp4',
    views: 150000
  },
  {
    title: 'The Dark Knight',
    description: 'Batman faces his greatest enemy, the Joker.',
    poster: 'https://via.placeholder.com/300x450?text=The+Dark+Knight',
    rating: 9.0,
    year: 2008,
    director: ['Christopher Nolan'],
    cast: ['Christian Bale', 'Heath Ledger'],
    genres: ['Action', 'Crime'],
    duration: 152,
    videoUrl: 'https://www.w3schools.com/html/mov_bbb.mp4',
    views: 200000
  },
  {
    title: 'Interstellar',
    description: 'Explorers travel through a wormhole to save humanity.',
    poster: 'https://via.placeholder.com/300x450?text=Interstellar',
    rating: 8.6,
    year: 2014,
    director: ['Christopher Nolan'],
    cast: ['Matthew McConaughey', 'Anne Hathaway'],
    genres: ['Sci-Fi', 'Adventure'],
    duration: 169,
    videoUrl: 'https://www.w3schools.com/html/mov_bbb.mp4',
    views: 180000
  },
  {
    title: 'Pulp Fiction',
    description: 'Multiple intertwining stories of gangsters and hitmen.',
    poster: 'https://via.placeholder.com/300x450?text=Pulp+Fiction',
    rating: 8.9,
    year: 1994,
    director: ['Quentin Tarantino'],
    cast: ['John Travolta', 'Samuel L. Jackson'],
    genres: ['Crime', 'Drama'],
    duration: 154,
    videoUrl: 'https://www.w3schools.com/html/mov_bbb.mp4',
    views: 120000
  },
  {
    title: 'The Matrix',
    description: 'A computer hacker learns the truth about reality.',
    poster: 'https://via.placeholder.com/300x450?text=The+Matrix',
    rating: 8.7,
    year: 1999,
    director: ['Lana Wachowski', 'Lilly Wachowski'],
    cast: ['Keanu Reeves', 'Laurence Fishburne'],
    genres: ['Sci-Fi', 'Action'],
    duration: 136,
    videoUrl: 'https://www.w3schools.com/html/mov_bbb.mp4',
    views: 160000
  },
  {
    title: 'Forrest Gump',
    description: 'A man with low IQ witnesses major events in American history.',
    poster: 'https://via.placeholder.com/300x450?text=Forrest+Gump',
    rating: 8.8,
    year: 1994,
    director: ['Robert Zemeckis'],
    cast: ['Tom Hanks', 'Sally Field'],
    genres: ['Drama', 'Romance'],
    duration: 142,
    videoUrl: 'https://www.w3schools.com/html/mov_bbb.mp4',
    views: 140000
  },
  {
    title: 'The Shawshank Redemption',
    description: 'A banker wrongly convicted bonds with a fellow inmate.',
    poster: 'https://via.placeholder.com/300x450?text=Shawshank',
    rating: 9.3,
    year: 1994,
    director: ['Frank Darabont'],
    cast: ['Tim Robbins', 'Morgan Freeman'],
    genres: ['Drama'],
    duration: 142,
    videoUrl: 'https://www.w3schools.com/html/mov_bbb.mp4',
    views: 190000
  },
  {
    title: 'Avatar',
    description: 'A paraplegic Marine infiltrates a mining operation on an alien moon.',
    poster: 'https://via.placeholder.com/300x450?text=Avatar',
    rating: 7.8,
    year: 2009,
    director: ['James Cameron'],
    cast: ['Sam Worthington', 'Zoe Saldana'],
    genres: ['Sci-Fi', 'Adventure'],
    duration: 162,
    videoUrl: 'https://www.w3schools.com/html/mov_bbb.mp4',
    views: 210000
  },
  {
    title: 'Titanic',
    description: 'A romance blooms between two passengers on the ill-fated ship.',
    poster: 'https://via.placeholder.com/300x450?text=Titanic',
    rating: 7.8,
    year: 1997,
    director: ['James Cameron'],
    cast: ['Leonardo DiCaprio', 'Kate Winslet'],
    genres: ['Drama', 'Romance'],
    duration: 194,
    videoUrl: 'https://www.w3schools.com/html/mov_bbb.mp4',
    views: 170000
  },
  {
    title: 'Gladiator',
    description: 'A former Roman General seeks vengeance as a slave fighter.',
    poster: 'https://via.placeholder.com/300x450?text=Gladiator',
    rating: 8.5,
    year: 2000,
    director: ['Ridley Scott'],
    cast: ['Russell Crowe', 'Joaquin Phoenix'],
    genres: ['Action', 'Drama'],
    duration: 155,
    videoUrl: 'https://www.w3schools.com/html/mov_bbb.mp4',
    views: 130000
  }
]

async function seedDatabase() {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/streamx')
    console.log('📦 Connected to MongoDB')
    
    await Movie.deleteMany({})
    console.log('🗑️  Cleared existing movies')
    
    await Movie.insertMany(sampleMovies)
    console.log('✅ 10 sample movies added!')
    
    process.exit(0)
  } catch (error) {
    console.error('❌ Error:', error)
    process.exit(1)
  }
}

seedDatabase()
