import axios from 'axios'

const WATCHMODE_API_KEY = process.env.WATCHMODE_API_KEY;
const WATCHMODE_BASE_URL = 'https://api.watchmode.com/v1';

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

        let watchmodeId = null;

        // Step 1a: Prefer direct TMDB ID lookup (accurate, no name-match issues)
        if (tmdbId) {
            const searchField = type === 'tv' ? 'tmdb_tv_id' : 'tmdb_movie_id';
            const idUrl = `${WATCHMODE_BASE_URL}/search/?apiKey=${apiKey}&search_field=${searchField}&search_value=${tmdbId}`;
            const idRes = await axios.get(idUrl);
            const idResults = idRes.data.title_results || [];
            if (idResults.length > 0) watchmodeId = idResults[0].id;
        }

        // Step 1b: Fall back to name search (no 'types' param — it's invalid on /search/)
        if (!watchmodeId && movieTitle) {
            const nameUrl = `${WATCHMODE_BASE_URL}/search/?apiKey=${apiKey}&search_field=name&search_value=${encodeURIComponent(movieTitle)}`;
            const nameRes = await axios.get(nameUrl);
            const nameResults = nameRes.data.title_results || [];
            if (nameResults.length > 0) watchmodeId = nameResults[0].id;
        }

        if (!watchmodeId) {
            return { success: false, providers: [] };
        }

        // Step 2: Get Streaming Sources (returns array directly)
        const detailsUrl = `${WATCHMODE_BASE_URL}/title/${watchmodeId}/sources/?apiKey=${apiKey}&regions=US`;
        const detailsRes = await axios.get(detailsUrl);

        const rawOptions = Array.isArray(detailsRes.data) ? detailsRes.data : [];

        if (rawOptions.length === 0) {
            return { success: false, providers: [] };
        }

        // Parse and format streaming options
        const providers = rawOptions.map((option) => ({
            name: option.name,
            type: option.type, // sub, free, buy, rent
            region: option.region || 'US',
            logoUrl: option.logo_url,
            webUrl: option.web_url || null,
        }));

        console.log(`✅ Watchmode: Found ${providers.length} streaming options for "${movieTitle}"`);

        return {
            success: true,
            providers: providers,
            tmdbId: tmdbId,
            watchmodeId: watchmodeId,
        };
    } catch (error) {
        const detail = error.response?.data ? JSON.stringify(error.response.data) : error.message;
        console.error('Watchmode Error:', detail);
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