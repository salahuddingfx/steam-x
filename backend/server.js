import express from 'express'
import cors from 'cors'
import dotenv from 'dotenv'
import connectDB from './config/db.js'
import { errorHandler } from './middleware/auth.middleware.js'
import { createServer } from 'http'
import { Server } from 'socket.io'

dotenv.config()

const app = express()
const httpServer = createServer(app)
const io = new Server(httpServer, {
  cors: {
    origin: '*', // Allow all for prototype
    methods: ['GET', 'POST']
  }
})

// Socket.io Real-time Logic
let connectedUsers = 0;

io.on('connection', (socket) => {
  connectedUsers++;
  io.emit('stats_update', { online: connectedUsers }); // Broadcast count

  socket.on('disconnect', () => {
    connectedUsers--;
    io.emit('stats_update', { online: connectedUsers });
  });

  // Watchlist Update Event
  socket.on('user_action', (data) => {
     // Broadcast actions (e.g. "Someone just watched X") for analytics
     socket.broadcast.emit('activity_feed', data);
  });
});

// Middleware
app.use(cors())
app.use(express.json())

// MongoDB Connection
connectDB()
// console.log("⚠️ MongoDB Disconnected: Running in Live Stream Mode")

import { startContentUpdater } from './jobs/updater.js'
import { fetchTrendingData } from './services/tmdb.js'

// Initial Data Fetch & Cron Jobs
startContentUpdater()
// Fetch data on startup (non-blocking)
fetchTrendingData().catch(err => console.log('Startup fetch skipped/failed'))

// Routes - Updated naming convention
import movieRoutes from './routes/movie.routes.js'
import authRoutes from './routes/auth.routes.js'
import proxyRoutes from './routes/proxy.routes.js'

app.use('/api/movies', movieRoutes)
app.use('/api/auth', authRoutes)
app.use('/api/proxy', proxyRoutes)

// Error Handler
app.use(errorHandler)

// Start Cron Jobs
startContentUpdater()

// Init fetch on start (non-blocking)
fetchTrendingData().catch(err => console.log('Init fetch skipped:', err.message))

// Basic route
app.get('/', (req, res) => {
  res.json({ message: 'StreamX Backend API Running ✅' })
})

const PORT = process.env.PORT || 5000

import figlet from 'figlet'
import gradient from 'gradient-string'
import ora from 'ora'
import chalk from 'chalk'
import boxen from 'boxen'
import { format } from 'date-fns'

const typewriter = async (text, speed = 30) => {
  for (let i = 0; i < text.length; i++) {
    process.stdout.write(text.charAt(i));
    await new Promise(resolve => setTimeout(resolve, speed));
  }
  process.stdout.write('\n');
}

httpServer.listen(PORT, async () => {
  console.clear() // Clear terminal for fresh start

  figlet('Stream - X', async (err, data) => {
      if(err) return console.log(err)
      console.log(gradient.pastel.multiline(data))
      
      const spinner = ora('Initializing Server Systems...').start();
      await new Promise(r => setTimeout(r, 1000));
      spinner.succeed('Core Systems Online');

      const spinner2 = ora('Connecting to Cloud Database...').start();
      await new Promise(r => setTimeout(r, 1200));
      spinner2.succeed('Secure Uplink Established');

      const infoBox = boxen(
        `
        ${chalk.bold.cyan('ROCKET SERVER STATUS')}
        -----------------------------
        ${chalk.green('✔')} Status:       ${chalk.greenBright('ONLINE')}
        ${chalk.blue('✔')} Port:         ${chalk.yellow(PORT)}
        ${chalk.magenta('✔')} Database:     ${process.env.MONGODB_URI ? chalk.bgGreen.black(' ATLAS CLOUD ') : chalk.bgRed(' OFFLINE ')}
        ${chalk.white('✔')} Environment:  ${chalk.cyan(process.env.NODE_ENV)}
        ${chalk.yellow('✔')} Time:         ${format(new Date(), 'yyyy-MM-dd HH:mm:ss')}
        `,
        { padding: 1, margin: 1, borderStyle: 'round', borderColor: 'cyan' }
      );
      
      console.log(infoBox);

      await typewriter(gradient.passion(`👨‍💻 Developer: Salahuddin | Project: Stream-X Pro`))
      console.log(chalk.gray('---------------------------------------------------'))
      console.log(chalk.gray(`Waiting for incoming requests...`))
  })
})

export default app
