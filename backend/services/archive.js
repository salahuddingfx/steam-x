import axios from 'axios';

// The Internet Archive Advanced Search API
// We prefer:
// 1. Media Type: movies
// 2. Format: h.264 or similar playable video
// 3. Collection: feature_films or community_video

const ARCHIVE_API_URL = 'https://archive.org/advancedsearch.php';

export const findArchiveMovie = async (title) => {
  try {
    if (!title) return null;

    // Sanitize title for search query
    const safeTitle = title.replace(/[^\w\s]/gi, '').trim(); 
    
    // Construct simplified query
    // q = (title:${safeTitle}) AND mediatype:(movies)
    const params = {
      q: `title:("${safeTitle}") AND mediatype:(movies)`,
      fl: ['identifier', 'title', 'downloads'],
      sort: ['downloads desc'],
      rows: 1,
      page: 1,
      output: 'json'
    };

    const response = await axios.get(ARCHIVE_API_URL, { params });
    const docs = response.data?.response?.docs;

    if (docs && docs.length > 0) {
      const bestMatch = docs[0];
      const identifier = bestMatch.identifier;
      
      // To get the actual file, we technically need to query metadata,
      // but Archive.org follows a standard pattern:
      // https://archive.org/download/<identifier>/<identifier>.mp4
      
      // However, to be safe, let's just return the 'details' page or a speculative mp4.
      // A more robust way is to fetch metadata: https://archive.org/metadata/<identifier>
      // Let's do that quickly to find an mp4.
      
      return await getMp4ValidLink(identifier);
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
        const metaRes = await axios.get(metadataUrl);
        const files = metaRes.data?.files;

        if (files) {
            // Find .mp4 file
            const mp4File = files.find(f => f.name.endsWith('.mp4'));
            if (mp4File) {
                return `https://archive.org/download/${identifier}/${mp4File.name}`;
            }
        }
        // Fallback
        return `https://archive.org/download/${identifier}/${identifier}.mp4`;
    } catch (e) {
        return null;
    }
}
