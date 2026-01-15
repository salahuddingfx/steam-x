import axios from 'axios';

const WATCHMODE_API_KEY = process.env.WATCHMODE_KEY; 
const BASE_URL = 'https://api.watchmode.com/v1';

// ✅ Cache to save API credits & speed up loading (Zero Latency)
const watchmodeCache = new Map();

export const getWatchLinks = async (tmdbId) => {
  // Check if API Key exists
  if (!tmdbId || !WATCHMODE_API_KEY) {
      if (!WATCHMODE_API_KEY) console.warn("⚠️ Watchmode API Key missing");
      return null;
  }

  // 1️⃣ Check Cache First
  if (watchmodeCache.has(tmdbId)) {
      console.log(`🚀 Watchmode Cache Hit for TMDB ID: ${tmdbId}`);
      return watchmodeCache.get(tmdbId);
  }

  try {
    // ---------------------------------------------------------
    // STEP 1: Get Watchmode ID using TMDB ID
    // ---------------------------------------------------------
    const searchUrl = `${BASE_URL}/search/?apiKey=${WATCHMODE_API_KEY}&search_field=tmdb_movie_id&search_value=${tmdbId}`;
    const searchRes = await axios.get(searchUrl);
    
    // Check if we found the movie
    const searchResults = searchRes.data?.title_results || [];
    if (searchResults.length === 0) return [];
    
    const watchmodeId = searchResults[0].id; // Get the internal ID

    // ---------------------------------------------------------
    // STEP 2: Get Streaming Sources using Watchmode ID
    // ---------------------------------------------------------
    const sourceUrl = `${BASE_URL}/title/${watchmodeId}/sources/?apiKey=${WATCHMODE_API_KEY}&regions=US`;
    const sourceRes = await axios.get(sourceUrl);
    const sources = sourceRes.data;

    // Filter for major platforms
    const majorPlatforms = ['Netflix', 'Amazon Prime', 'Disney+', 'Hulu', 'HBO Max', 'Apple TV', 'Peacock'];
    
    const links = sources
        .filter(s => majorPlatforms.some(p => s.name.includes(p)) || s.type === 'sub')
        .map(s => ({
            name: s.name,
            url: s.web_url,
            price: s.price || null,
            type: s.type, // 'sub', 'rent', 'buy'
            quality: s.format // 'HD', '4K'
        }));
        
    // Remove duplicates
    const uniqueLinks = [];
    const map = new Map();
    for (const item of links) {
        if(!map.has(item.name)) {
            map.set(item.name, true);
            uniqueLinks.push(item);
        }
    }

    // ✅ Save to Cache (Expires in 1 Hour)
    watchmodeCache.set(tmdbId, uniqueLinks);
    setTimeout(() => watchmodeCache.delete(tmdbId), 3600000);

    return uniqueLinks;

  } catch (error) {
    // Handle 404 quietly
    if (error.response && error.response.status === 404) {
         return [];
    }
    console.error('Watchmode API Error:', error.message);
    return [];
  }
};