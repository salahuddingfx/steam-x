import axios from 'axios';

// Simple In-Memory Cache to speed up repeated requests
const archiveCache = new Map();

// The Internet Archive Advanced Search API
const ARCHIVE_API_URL = 'https://archive.org/advancedsearch.php';

export const findArchiveMovie = async (title) => {
  try {
    if (!title) return null;

    // 1. Check Cache first (Zero Latency hit)
    const cacheKey = title.toLowerCase().trim();
    if (archiveCache.has(cacheKey)) {
        console.log(`🚀 Archive Cache Hit for: ${title}`);
        return archiveCache.get(cacheKey);
    }

    // Sanitize title (Remove special chars)
    const safeTitle = title.replace(/[^\w\s]/gi, '').trim(); 
    
    // Construct simplified query for Movies
    const params = {
      q: `title:("${safeTitle}") AND mediatype:(movies)`,
      fl: ['identifier', 'title', 'downloads'],
      sort: ['downloads desc'], // Most popular first
      rows: 1,
      page: 1,
      output: 'json'
    };

    // Timeout added to prevent server hanging
    const response = await axios.get(ARCHIVE_API_URL, { params, timeout: 5000 });
    const docs = response.data?.response?.docs;

    if (docs && docs.length > 0) {
      const bestMatch = docs[0];
      const identifier = bestMatch.identifier;
      
      // Get the actual MP4 link
      const directLink = await getMp4ValidLink(identifier);
      
      if (directLink) {
          // Save to Cache for 1 hour
          archiveCache.set(cacheKey, directLink);
          setTimeout(() => archiveCache.delete(cacheKey), 3600000); 
          
          return directLink;
      }
    }

    return null;
  } catch (error) {
    console.error('ArchiveAPISearch Error:', error.message);
    return null;
  }
};

const getMp4ValidLink = async (identifier) => {
    try {
        const metadataUrl = `https://archive.org/metadata/${identifier}`;
        const metaRes = await axios.get(metadataUrl, { timeout: 4000 });
        const files = metaRes.data?.files;

        if (files) {
            // Priority 1: .mp4 file
            const mp4File = files.find(f => f.name.toLowerCase().endsWith('.mp4'));
            if (mp4File) {
                return `https://archive.org/download/${identifier}/${mp4File.name}`;
            }
            // Priority 2: .mkv file (Browser might not play, but good fallback)
            const mkvFile = files.find(f => f.name.toLowerCase().endsWith('.mkv'));
            if (mkvFile) {
                return `https://archive.org/download/${identifier}/${mkvFile.name}`;
            }
        }
        
        // Fallback: Guessing the path
        return `https://archive.org/download/${identifier}/${identifier}.mp4`;
    } catch (e) {
        return null;
    }
}