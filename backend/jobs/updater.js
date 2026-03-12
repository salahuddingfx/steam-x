import cron from 'node-cron'
import axios from 'axios'
import { fetchTrendingData, deepSyncTMDB } from '../services/tmdb.js'

// ─────────────────────────────────────────────
// Deep Sync State (advances page each cycle)
// TMDB has up to 500 pages per endpoint.
// We crawl 2 pages per cron run (40 movies) across all categories.
// ─────────────────────────────────────────────
let deepSyncPage = 1
const MAX_TMDB_PAGES = 500

// ─────────────────────────────────────────────
// Render Free Tier – Self Keep-Alive
// Render shuts down after ~15 min of inactivity.
// We ping ourselves every 14 minutes to stay warm.
// NOTE: Also pair with UptimeRobot (free) for 100% uptime.
// ─────────────────────────────────────────────
export const startKeepAlive = () => {
  const selfUrl =
    process.env.RENDER_EXTERNAL_URL ||
    process.env.RENDER_URL ||
    'https://steam-x.onrender.com'

  console.log(`💓 Keep-alive → pinging ${selfUrl}/api/ping every 14 min`)

  setInterval(async () => {
    try {
      const res = await axios.get(`${selfUrl}/api/ping`, { timeout: 8000 })
      console.log(`💓 Keep-alive OK [${new Date().toISOString()}] status=${res.status}`)
    } catch (e) {
      console.warn(`💔 Keep-alive failed: ${e.message}`)
    }
  }, 14 * 60 * 1000) // 14 minutes
}

// ─────────────────────────────────────────────
// Content Updater Jobs
// ─────────────────────────────────────────────
export const startContentUpdater = () => {
  console.log('⏰ Auto-updater scheduled')

  // Every 15 minutes: deep-sync 2 pages (advance through ALL of TMDB)
  cron.schedule('*/15 * * * *', async () => {
    console.log(`📡 Deep sync page batch ${deepSyncPage}-${deepSyncPage + 1} ...`)
    await deepSyncTMDB(deepSyncPage)
    deepSyncPage = (deepSyncPage % MAX_TMDB_PAGES) + 1 // cycle 1 → 500 → 1
  })

  // Every 6 hours: trending refresh (popular/new/top)
  cron.schedule('0 */6 * * *', async () => {
    console.log('🔄 6h trending refresh...')
    deepSyncPage = 1 // restart deep sync from page 1
    await fetchTrendingData()
  })
}
