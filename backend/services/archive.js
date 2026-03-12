import axios from 'axios';

// Simple In-Memory Cache to speed up repeated requests
const archiveCache = new Map();

// The Internet Archive Advanced Search API
const ARCHIVE_API_URL = 'https://archive.org/advancedsearch.php';
const NEGATIVE_CACHE_TTL = 10 * 60 * 1000;
const POSITIVE_CACHE_TTL = 60 * 60 * 1000;

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
    const safeTitle = title.replace(/[^\w\s]/gi, '').replace(/\s+/g, ' ').trim();
    if (!safeTitle) return null;

    const queries = [
      `title:("${safeTitle}") AND mediatype:(movies)`,
      `(title:("${safeTitle}") OR subject:("${safeTitle}")) AND mediatype:(movies)`
    ];

    for (const q of queries) {
      const params = {
        q,
        fl: ['identifier', 'title', 'downloads'],
        sort: ['downloads desc'],
        rows: 3,
        page: 1,
        output: 'json'
      };

      let response;
      try {
        response = await axios.get(ARCHIVE_API_URL, { params, timeout: 5000 });
      } catch (e) {
        continue; // Skip this query variant on timeout/error
      }
      const docs = response.data?.response?.docs || [];

      for (const doc of docs) {
        const identifier = doc.identifier;
        const directLink = await getMp4ValidLink(identifier);

        if (directLink) {
          archiveCache.set(cacheKey, directLink);
          setTimeout(() => archiveCache.delete(cacheKey), POSITIVE_CACHE_TTL);
          return directLink;
        }
      }
    }

    archiveCache.set(cacheKey, null);
    setTimeout(() => archiveCache.delete(cacheKey), NEGATIVE_CACHE_TTL);
    return null;
  } catch (error) {
    // Silent failure - Archive.org is optional, VidSrc is the primary source
    return null;
  }
};

const getMp4ValidLink = async (identifier) => {
    try {
        const metadataUrl = `https://archive.org/metadata/${identifier}`;
        const metaRes = await axios.get(metadataUrl, { timeout: 7000 });
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