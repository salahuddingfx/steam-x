import mongoose from 'mongoose'
import dotenv from 'dotenv'
import Movie from '../models/Movie.js'

dotenv.config()

const sampleMovies = [
  // ==========================================
  // 🔥 TRENDING NOW (LATEST HITS)
  // ==========================================
  {
    title: 'Dune: Part Two',
    description: 'Paul Atreides unites with Chani and the Fremen while on a warpath of revenge against the conspirators who destroyed his family.',
    poster: 'https://image.tmdb.org/t/p/w500/1pdfLvkbY9ohJlCjQH2CZjjYVvJ.jpg',
    rating: 8.3,
    year: 2024,
    director: ['Denis Villeneuve'],
    genres: ['Sci-Fi', 'Adventure'],
    videoUrl: 'https://vidsrc.to/embed/movie/693134',
    provider: 'Cinema',
    isTrending: true,
    views: 950000
  },
  {
    title: 'Kung Fu Panda 4',
    description: 'Po is gearing up to become the spiritual leader of his Valley of Peace, but also needs someone to take his place as Dragon Warrior.',
    poster: 'https://image.tmdb.org/t/p/w500/kDp1vUBnMpe8ak4rjgl3cLELqjU.jpg',
    rating: 7.1,
    year: 2024,
    genres: ['Animation', 'Action'],
    videoUrl: 'https://vidsrc.to/embed/movie/1011985',
    provider: 'DreamWorks',
    isTrending: true,
    views: 880000
  },
  {
    title: 'Godzilla x Kong: The New Empire',
    description: 'Explores the origins of Hollow Earth and the ancient battle Titans.',
    poster: 'https://image.tmdb.org/t/p/w500/tMefBSflR6PGQLv7WvFPpKLZkyk.jpg',
    rating: 7.2,
    year: 2024,
    genres: ['Action', 'Sci-Fi'],
    videoUrl: 'https://vidsrc.to/embed/movie/823464',
    provider: 'HBO Max',
    isTrending: true,
    views: 760000
  },
  {
    title: 'Oppenheimer',
    description: 'The story of J. Robert Oppenheimer’s role in the development of the atomic bomb.',
    poster: 'https://image.tmdb.org/t/p/w500/8Gxv8gSFCU0XGDykEGv7zR1n2ua.jpg',
    rating: 8.1,
    year: 2023,
    director: ['Christopher Nolan'],
    genres: ['Drama', 'History'],
    videoUrl: 'https://vidsrc.to/embed/movie/872585',
    provider: 'Cinema',
    isTrending: true,
    views: 920000
  },
  {
    title: 'Barbie',
    description: 'Barbie and Ken are having the time of their lives in the colorful and seemingly perfect world of Barbie Land.',
    poster: 'https://image.tmdb.org/t/p/w500/iuFNMS8U5cb6xfzi51Dbkovj7vM.jpg',
    rating: 7.2,
    year: 2023,
    genres: ['Comedy', 'Fantasy'],
    videoUrl: 'https://vidsrc.to/embed/movie/346698',
    provider: 'Cinema',
    isTrending: true,
    views: 890000
  },

  // ==========================================
  // 📺 POPULAR TV SERIES (NETFLIX / HBO / PRIME)
  // ==========================================
  {
    title: 'Stranger Things',
    description: 'When a young boy vanishes, a small town uncovers a mystery involving secret experiments and supernatural forces.',
    poster: 'https://image.tmdb.org/t/p/w500/49WJfeN0moxb9IPfGn8AIqMGskD.jpg',
    rating: 8.7,
    year: 2016,
    genres: ['Sci-Fi', 'Horror'],
    videoUrl: 'https://vidsrc.to/embed/tv/66732',
    provider: 'Netflix',
    isTrending: true,
    views: 1200000
  },
  {
    title: 'Breaking Bad',
    description: 'A high school chemistry teacher turned methamphetamine manufacturing drug dealer.',
    poster: 'https://image.tmdb.org/t/p/w500/ggFHVNu6YYI5L9pCfOacjizRGt.jpg',
    rating: 9.5,
    year: 2008,
    genres: ['Crime', 'Drama'],
    videoUrl: 'https://vidsrc.to/embed/tv/1396',
    provider: 'Netflix',
    isTrending: true,
    views: 1500000
  },
  {
    title: 'Game of Thrones',
    description: 'Nine noble families fight for control over the lands of Westeros.',
    poster: 'https://image.tmdb.org/t/p/w500/1XS1oqL89opfnbLl8WnZY1O1uJx.jpg',
    rating: 8.4,
    year: 2011,
    genres: ['Action', 'Fantasy'],
    videoUrl: 'https://vidsrc.to/embed/tv/1399',
    provider: 'HBO',
    views: 1400000
  },
  {
    title: 'The Mandalorian',
    description: 'The travels of a lone bounty hunter in the outer reaches of the galaxy.',
    poster: 'https://image.tmdb.org/t/p/w500/eU1i6eHXlzMOlEq0ku1Rzq7Y4wA.jpg',
    rating: 8.5,
    year: 2019,
    genres: ['Sci-Fi', 'Action'],
    videoUrl: 'https://vidsrc.to/embed/tv/82856',
    provider: 'Disney+',
    views: 950000
  },
  {
    title: 'The Boys',
    description: 'A group of vigilantes set out to take down corrupt superheroes.',
    poster: 'https://image.tmdb.org/t/p/w500/stTEycfG9928HYGEISBFaG1ngjM.jpg',
    rating: 8.5,
    year: 2019,
    genres: ['Action', 'Comedy'],
    videoUrl: 'https://vidsrc.to/embed/tv/76479',
    provider: 'Amazon Prime',
    views: 980000
  },
  {
    title: 'Squid Game',
    description: 'Hundreds of cash-strapped players accept a strange invitation to compete in children\'s games.',
    poster: 'https://image.tmdb.org/t/p/w500/dDlEmu3EZ0Pgg93K2SVNLCjCSvE.jpg',
    rating: 8.4,
    year: 2021,
    genres: ['Thriller', 'Drama'],
    videoUrl: 'https://vidsrc.to/embed/tv/93405',
    provider: 'Netflix',
    views: 1100000
  },
  {
    title: 'Wednesday',
    description: 'Follows Wednesday Addams\' years as a student, attempting to master her emerging psychic ability.',
    poster: 'https://image.tmdb.org/t/p/w500/9PFonBhy4cQy7Jz20NpMygczOkv.jpg',
    rating: 8.5,
    year: 2022,
    genres: ['Fantasy', 'Comedy'],
    videoUrl: 'https://vidsrc.to/embed/tv/119051',
    provider: 'Netflix',
    views: 1050000
  },
  {
    title: 'Money Heist',
    description: 'An unusual group of robbers attempt to carry out the most perfect robbery in Spanish history.',
    poster: 'https://image.tmdb.org/t/p/w500/reEMJA1uzscCbkpeRJeTT2bjqUp.jpg',
    rating: 8.2,
    year: 2017,
    genres: ['Crime', 'Thriller'],
    videoUrl: 'https://vidsrc.to/embed/tv/71446',
    provider: 'Netflix',
    views: 1000000
  },

  // ==========================================
  // 🎌 ANIME & ANIMATION
  // ==========================================
  {
    title: 'Demon Slayer: Kimetsu no Yaiba',
    description: 'A family is attacked by demons and only two members survive.',
    poster: 'https://image.tmdb.org/t/p/w500/xUfRZu2mi8bZJKSe16ExCVPlKWU.jpg',
    rating: 8.7,
    year: 2019,
    genres: ['Anime', 'Action'],
    videoUrl: 'https://vidsrc.to/embed/tv/85937',
    provider: 'Crunchyroll',
    isTrending: true,
    views: 800000
  },
  {
    title: 'One Piece',
    description: 'Monkey D. Luffy sails with his crew of Straw Hat Pirates in search of the One Piece treasure.',
    poster: 'https://image.tmdb.org/t/p/w500/cMD9Ygz11yjJNZ1lFB5QQeHWDn3.jpg',
    rating: 8.9,
    year: 1999,
    genres: ['Anime', 'Adventure'],
    videoUrl: 'https://vidsrc.to/embed/tv/37854',
    provider: 'Crunchyroll',
    views: 2000000
  },
  {
    title: 'Naruto Shippuden',
    description: 'Naruto Uzumaki, is a loud, hyperactive, adolescent ninja who constantly searches for approval.',
    poster: 'https://image.tmdb.org/t/p/w500/kV27j3Cz4TSazF5X5qE5V65e8aE.jpg',
    rating: 8.6,
    year: 2007,
    genres: ['Anime', 'Action'],
    videoUrl: 'https://vidsrc.to/embed/tv/46261',
    provider: 'Crunchyroll',
    views: 1800000
  },
  {
    title: 'Jujutsu Kaisen',
    description: 'A boy swallows a cursed talisman - the finger of a demon - and becomes cursed himself.',
    poster: 'https://image.tmdb.org/t/p/w500/hD8yEwdAwLjjcOeqGY7SVn1LQ36.jpg',
    rating: 8.5,
    year: 2020,
    genres: ['Anime', 'Supernatural'],
    videoUrl: 'https://vidsrc.to/embed/tv/95479',
    provider: 'Crunchyroll',
    views: 900000
  },
  {
    title: 'Spider-Man: Across the Spider-Verse',
    description: 'Miles Morales catapults across the Multiverse to protect its existence.',
    poster: 'https://image.tmdb.org/t/p/w500/8Vt6mWEReuy4Of61Lnj5Xj704m8.jpg',
    rating: 8.4,
    year: 2023,
    genres: ['Animation', 'Action'],
    videoUrl: 'https://vidsrc.to/embed/movie/569094',
    provider: 'Sony',
    views: 700000
  },
  {
    title: 'Rick and Morty',
    description: 'An animated series that follows the exploits of a super scientist and his not-so-bright grandson.',
    poster: 'https://image.tmdb.org/t/p/w500/cvhNj9eoRBe5SxjCbQTkh05UP5K.jpg',
    rating: 8.7,
    year: 2013,
    genres: ['Animation', 'Comedy'],
    videoUrl: 'https://vidsrc.to/embed/tv/60625',
    provider: 'Adult Swim',
    views: 1100000
  },
  {
    title: 'Arcane',
    description: 'Set in Utopian Piltover and the oppressed underground of Zaun.',
    poster: 'https://image.tmdb.org/t/p/w500/fqldf2t8ztc9aiwn3k6mlX3tvRT.jpg',
    rating: 9.0,
    year: 2021,
    genres: ['Animation', 'Sci-Fi'],
    videoUrl: 'https://vidsrc.to/embed/tv/94605',
    provider: 'Netflix',
    views: 850000
  },

  // ==========================================
  // 🎬 MARVEL & DC UNIVERSE
  // ==========================================
  {
    title: 'Avengers: Endgame',
    description: 'The Avengers assemble once more to reverse Thanos\' actions.',
    poster: 'https://image.tmdb.org/t/p/w500/or06FN3Dka5tukK1e9sl16pB3iy.jpg',
    rating: 8.3,
    year: 2019,
    genres: ['Action', 'Sci-Fi'],
    videoUrl: 'https://vidsrc.to/embed/movie/299534',
    provider: 'Disney+',
    views: 2500000
  },
  {
    title: 'Spider-Man: No Way Home',
    description: 'Peter Parker asks Doctor Strange for help to make people forget he is Spider-Man.',
    poster: 'https://image.tmdb.org/t/p/w500/1g0dhYtq4irTY1GPXvft6k4GY0d.jpg',
    rating: 8.0,
    year: 2021,
    genres: ['Action', 'Adventure'],
    videoUrl: 'https://vidsrc.to/embed/movie/634649',
    provider: 'Sony',
    views: 2100000
  },
  {
    title: 'The Batman',
    description: 'Batman ventures into Gotham City\'s underworld when a sadistic killer leaves behind a trail of cryptic clues.',
    poster: 'https://image.tmdb.org/t/p/w500/74xTEgt7R36Fpooo50x9Tfd669x.jpg',
    rating: 7.7,
    year: 2022,
    genres: ['Crime', 'Action'],
    videoUrl: 'https://vidsrc.to/embed/movie/414906',
    provider: 'HBO Max',
    views: 1300000
  },
  {
    title: 'Joker',
    description: 'During the 1980s, a failed stand-up comedian is driven insane and turns to a life of crime.',
    poster: 'https://image.tmdb.org/t/p/w500/udDclJoHjfjb8Ekgsd4FDteOkCU.jpg',
    rating: 8.2,
    year: 2019,
    genres: ['Crime', 'Drama'],
    videoUrl: 'https://vidsrc.to/embed/movie/475557',
    provider: 'Warner Bros',
    views: 1600000
  },
  {
    title: 'Guardians of the Galaxy Vol. 3',
    description: 'Peter Quill rallies his team to defend the universe and one of their own.',
    poster: 'https://image.tmdb.org/t/p/w500/r2J02Z2OpNTctfOSN1Ydgii51I3.jpg',
    rating: 8.0,
    year: 2023,
    genres: ['Action', 'Sci-Fi'],
    videoUrl: 'https://vidsrc.to/embed/movie/447365',
    provider: 'Disney+',
    views: 900000
  },
  {
    title: 'Deadpool',
    description: 'A wisecracking mercenary gets accelerated healing powers and a twisted sense of humor.',
    poster: 'https://image.tmdb.org/t/p/w500/fSRb7vyIP8rQpL0I47P3qUsEKX3.jpg',
    rating: 7.6,
    year: 2016,
    genres: ['Action', 'Comedy'],
    videoUrl: 'https://vidsrc.to/embed/movie/293660',
    provider: 'Disney+',
    views: 1400000
  },

  // ==========================================
  // 🍿 BLOCKBUSTER MOVIES
  // ==========================================
  {
    title: 'John Wick: Chapter 4',
    description: 'John Wick uncovers a path to defeating The High Table.',
    poster: 'https://image.tmdb.org/t/p/w500/vZloFAK7NmvMGKE7VkF5UHaz0I.jpg',
    rating: 7.8,
    year: 2023,
    genres: ['Action', 'Thriller'],
    videoUrl: 'https://vidsrc.to/embed/movie/603692',
    provider: 'Cinema',
    views: 950000
  },
  {
    title: 'Top Gun: Maverick',
    description: 'After thirty years, Maverick is still pushing the envelope as a top naval aviator.',
    poster: 'https://image.tmdb.org/t/p/w500/62HCnUTziyWcpDaBO2i1DX17ljH.jpg',
    rating: 8.3,
    year: 2022,
    genres: ['Action', 'Drama'],
    videoUrl: 'https://vidsrc.to/embed/movie/361743',
    provider: 'Paramount',
    views: 1250000
  },
  {
    title: 'Avatar: The Way of Water',
    description: 'Jake Sully lives with his newfound family formed on the extrasolar moon Pandora.',
    poster: 'https://image.tmdb.org/t/p/w500/t6HIqrRAclMCA60NsSmeqe9RmNV.jpg',
    rating: 7.7,
    year: 2022,
    genres: ['Sci-Fi', 'Adventure'],
    videoUrl: 'https://vidsrc.to/embed/movie/76600',
    provider: 'Disney+',
    views: 1800000
  },
  {
    title: 'Inception',
    description: 'A skilled thief steals corporate secrets while dreaming.',
    poster: 'https://image.tmdb.org/t/p/w500/oYuLEt3zVCKqNSZVYsF4POraIN.jpg',
    rating: 8.8,
    year: 2010,
    genres: ['Sci-Fi', 'Thriller'],
    videoUrl: 'https://vidsrc.to/embed/movie/27205',
    provider: 'Warner Bros',
    views: 1500000
  },
  {
    title: 'Interstellar',
    description: 'Explorers travel through a wormhole to save humanity.',
    poster: 'https://image.tmdb.org/t/p/w500/gEU2QniE6E77NI6lCU6MxlNBvIx.jpg',
    rating: 8.6,
    year: 2014,
    genres: ['Sci-Fi', 'Adventure'],
    videoUrl: 'https://vidsrc.to/embed/movie/157336',
    provider: 'Warner Bros',
    views: 1600000
  },
  {
    title: 'The Dark Knight',
    description: 'Batman faces his greatest enemy, the Joker.',
    poster: 'https://image.tmdb.org/t/p/w500/qJ2tW6WMUDux911r6m7haRef0WH.jpg',
    rating: 9.0,
    year: 2008,
    genres: ['Action', 'Crime'],
    videoUrl: 'https://vidsrc.to/embed/movie/155',
    provider: 'Warner Bros',
    views: 2200000
  },
  {
    title: 'Fight Club',
    description: 'An insomniac office worker and a devil-may-care soap maker form an underground fight club.',
    poster: 'https://image.tmdb.org/t/p/w500/pB8BM7pdSp6B6Ih7QZ4DrQ3PmJK.jpg',
    rating: 8.4,
    year: 1999,
    genres: ['Drama'],
    videoUrl: 'https://vidsrc.to/embed/movie/550',
    provider: 'Classic',
    views: 1300000
  },
  {
    title: 'Pulp Fiction',
    description: 'The lives of two mob hitmen, a boxer, a gangster and his wife intertwine.',
    poster: 'https://image.tmdb.org/t/p/w500/d5iIlFn5s0ImszYzBPb8JPIfbXD.jpg',
    rating: 8.5,
    year: 1994,
    genres: ['Crime', 'Drama'],
    videoUrl: 'https://vidsrc.to/embed/movie/680',
    provider: 'Classic',
    views: 1250000
  },
  {
    title: 'The Matrix',
    description: 'A computer hacker learns the truth about his reality.',
    poster: 'https://image.tmdb.org/t/p/w500/f89U3ADr1oiB1s9GkdPOEpXUk5H.jpg',
    rating: 8.7,
    year: 1999,
    genres: ['Sci-Fi', 'Action'],
    videoUrl: 'https://vidsrc.to/embed/movie/603',
    provider: 'Classic',
    views: 1700000
  }
]

async function seedDatabase() {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/streamx')
    console.log('📦 Connected to MongoDB')
    
    await Movie.deleteMany({})
    console.log('🗑️  Cleared existing movies')
    
    // Insert all movies from the list
    await Movie.insertMany(sampleMovies)
    console.log(`✅ ${sampleMovies.length} movies & series added successfully!`)
    
    process.exit(0)
  } catch (error) {
    console.error('❌ Error:', error)
    process.exit(1)
  }
}

seedDatabase()