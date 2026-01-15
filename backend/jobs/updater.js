// Cron job to run every day at Midnight
import cron from 'node-cron'
import { fetchTrendingData } from '../services/tmdb.js'

export const startContentUpdater = () => {
  console.log('⏰ Auto-updater scheduled (Runs daily at midnight)')
  
  // Schedule task to run at 00:00
  cron.schedule('0 0 * * *', async () => {
    console.log('⏰ Running daily content update...')
    await fetchTrendingData()
  })
}
