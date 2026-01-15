import axios from 'axios';

const WATCHMODE_API_KEY = process.env.WATCHMODE_KEY;
const BASE_URL = 'https://api.watchmode.com/v1';

export const getWatchLinks = async (tmdbId) => {
  if (!tmdbId || !WATCHMODE_API_KEY) return null;

  try {
    // Watchmode uses its own IDs but supports looking up by TMDB ID
    // Endpoint: /search/?search_field=tmdb_id&search_value=ID
    
    // BUT! Most direct way for sources is:
    // /title/{title_id}/sources/
    // We first need the Title ID from TMDB ID.
    // Or we can try using the 'search_field' param in title details if supported, 
    // but the doc usually says: /title/movie-{tmdb_id}/sources/ (if they support external ID paths)
    // Actually Watchmode supports: /title/movie-{ID}/details/ or /title/movie-{ID}/sources/ since v1.
    // Let's use that pattern.

    const url = `${BASE_URL}/title/movie-${tmdbId}/sources/?apiKey=${process.env.WATCHMODE_KEY}&regions=US`;
    
    const response = await axios.get(url);
    const sources = response.data;

    // Filter for major platforms
    const majorPlatforms = ['Netflix', 'Amazon Prime', 'Disney+', 'Hulu', 'HBO Max'];
    
    const links = sources
        .filter(s => majorPlatforms.some(p => s.name.includes(p)) || s.type === 'sub')
        .map(s => ({
            name: s.name,
            url: s.web_url,
            price: s.price || null,
            type: s.type
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

    return uniqueLinks;

  } catch (error) {
    if (error.response && error.response.status === 404) {
         // Movie not found in Watchmode
         return [];
    }
    console.error('Watchmode API Error:', error.message);
    return [];
  }
};
