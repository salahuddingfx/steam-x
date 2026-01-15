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
export const getWatchLinks = async (tmdbId, movieTitle) => {
    try {
        const apiKey = getWatchmodeKey();
        if (!apiKey) return { success: false, providers: [] };

        // Step 1: Get Watchmode ID from TMDB ID
        const searchUrl = `${WATCHMODE_BASE_URL}/search/?query=${encodeURIComponent(movieTitle)}&apiKey=${apiKey}`;
        const searchRes = await axios.get(searchUrl);

        if (!searchRes.data.results || searchRes.data.results.length === 0) {
            return { success: false, providers: [] };
        }

        const watchmodeId = searchRes.data.results[0].id;

        // Step 2: Get Streaming Details
        const detailsUrl = `${WATCHMODE_BASE_URL}/title/${watchmodeId}/streaming/?apiKey=${apiKey}&regions=US`;
        const detailsRes = await axios.get(detailsUrl);

        if (!detailsRes.data.streaming_options) {
            return { success: false, providers: [] };
        }

        // Parse and format streaming options
        const providers = detailsRes.data.streaming_options.map((option) => ({
            name: option.source_name,
            type: option.type, // subscription, buy, rent
            region: 'US',
            logoUrl: option.logo_url,
        }));

        console.log(`✅ Watchmode: Found ${providers.length} streaming options for "${movieTitle}"`);

        return {
            success: true,
            providers: providers,
            tmdbId: tmdbId,
            watchmodeId: watchmodeId,
        };
    } catch (error) {
        console.error('Watchmode Error:', error.message);
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