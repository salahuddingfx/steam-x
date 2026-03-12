import axios from 'axios'

const WATCHMODE_API_KEY = process.env.WATCHMODE_API_KEY;
const WATCHMODE_BASE_URL = 'https://api.watchmode.com/v1';

// Simple cache to avoid repeated API calls for same movie
const watchmodeCache = new Map();
const CACHE_TTL = 3600000; // 1 hour

// Helper to get API key at runtime
const getWatchmodeKey = () => {
    const key = process.env.WATCHMODE_API_KEY;
    if (!key) {
        console.warn('⚠️ WATCHMODE_API_KEY is missing. Watchmode features disabled.');
    }
    return key;
}

// Get streaming links for a movie
export const getWatchLinks = async (tmdbId, movieTitle, type = 'movie') => {
    try {
        const apiKey = getWatchmodeKey();
        if (!apiKey) return { success: false, providers: [] };

        // Use TMDB ID as cache key (most reliable)
        const cacheKey = tmdbId || movieTitle;
        
        // Check cache first
        if (watchmodeCache.has(cacheKey)) {
            const cached = watchmodeCache.get(cacheKey);
            if (Date.now() - cached.timestamp < CACHE_TTL) {
                return cached.data;
            } else {
                watchmodeCache.delete(cacheKey);
            }
        }

        let watchmodeId = null;

        // Step 1a: Prefer direct TMDB ID lookup (accurate, no name-match issues)
        if (tmdbId) {
            try {
                const searchField = type === 'tv' ? 'tmdb_tv_id' : 'tmdb_movie_id';
                const idUrl = `${WATCHMODE_BASE_URL}/search/?apiKey=${apiKey}&search_field=${searchField}&search_value=${tmdbId}`;
                const idRes = await axios.get(idUrl, { timeout: 5000 });
                const idResults = idRes.data.title_results || [];
                if (idResults.length > 0) watchmodeId = idResults[0].id;
            } catch (err) {
                // Silently skip TMDB lookup on error
            }
        }

        // Step 1b: Fall back to name search (no 'types' param — it's invalid on /search/)
        if (!watchmodeId && movieTitle) {
            try {
                const nameUrl = `${WATCHMODE_BASE_URL}/search/?apiKey=${apiKey}&search_field=name&search_value=${encodeURIComponent(movieTitle)}`;
                const nameRes = await axios.get(nameUrl, { timeout: 5000 });
                const nameResults = nameRes.data.title_results || [];
                if (nameResults.length > 0) watchmodeId = nameResults[0].id;
            } catch (err) {
                // Silently skip name lookup on error
            }
        }

        if (!watchmodeId) {
            const result = { success: false, providers: [] };
            watchmodeCache.set(cacheKey, { data: result, timestamp: Date.now() });
            return result;
        }

        // Step 2: Get Streaming Sources
        try {
            const detailsUrl = `${WATCHMODE_BASE_URL}/title/${watchmodeId}/sources/?apiKey=${apiKey}&regions=US`;
            const detailsRes = await axios.get(detailsUrl, { timeout: 5000 });

            const rawOptions = Array.isArray(detailsRes.data) ? detailsRes.data : [];

            const providers = rawOptions.map((option) => ({
                name: option.name,
                type: option.type,
                region: option.region || 'US',
                logoUrl: option.logo_url,
                webUrl: option.web_url || null,
            }));

            const result = {
                success: providers.length > 0,
                providers: providers,
                tmdbId: tmdbId,
                watchmodeId: watchmodeId,
            };

            watchmodeCache.set(cacheKey, { data: result, timestamp: Date.now() });
            return result;
        } catch (err) {
            const result = { success: false, providers: [] };
            watchmodeCache.set(cacheKey, { data: result, timestamp: Date.now() });
            return result;
        }
    } catch (error) {
        // Final fallback - return empty result
        return { success: false, providers: [] };
    }
}

// Get multiple titles' availability
export const checkAvailability = async (movieTitles) => {
    try {
        const apiKey = getWatchmodeKey();
        if (!apiKey) return {};

        const results = {};

        for (const title of movieTitles) {
            const links = await getWatchLinks(null, title);
            results[title] = links;
        }

        return results;
    } catch (error) {
        console.error('Availability Check Error:', error.message);
        return {};
    }
}