// Cron job to run every day at Midnight
import cron from 'node-cron'
import { fetchTrendingData } from '../services/tmdb.js'

export const startContentUpdater = () => {
  console.log('⏰ Auto-updater scheduled (Runs daily at midnight)')
  
  // Schedule task to run every 6 hours
  cron.schedule('0 */6 * * *', async () => {
    console.log('⏰ Running scheduled content update (Every 6h)...')
    await fetchTrendingData()
  })
}
