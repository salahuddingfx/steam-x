import express from 'express';
import axios from 'axios';
import https from 'https';

const router = express.Router();

// Cloud Stream Proxy with Buffering
router.get('/stream', async (req, res) => {
    const { url } = req.query;

    if (!url) {
        return res.status(400).send('URL is required');
    }

    try {
        // Create an agent to handle https
        const agent = new https.Agent({  
          rejectUnauthorized: false
        });

        // 1. Head request to get file size and types
        const headResponse = await axios.head(url, { httpsAgent: agent });
        const fileSize = headResponse.headers['content-length'];
        const contentType = headResponse.headers['content-type'];

        // 2. Handle Range Requests (Critical for Skipping/Buffering)
        const range = req.headers.range;

        if (range) {
            const parts = range.replace(/bytes=/, "").split("-");
            const start = parseInt(parts[0], 10);
            const end = parts[1] ? parseInt(parts[1], 10) : fileSize - 1;
            const chunksize = (end - start) + 1;

            const file = await axios({
                method: 'get',
                url: url,
                responseType: 'stream',
                headers: { 'Range': `bytes=${start}-${end}` },
                httpsAgent: agent
            });

            const head = {
                'Content-Range': `bytes ${start}-${end}/${fileSize}`,
                'Accept-Ranges': 'bytes',
                'Content-Length': chunksize,
                'Content-Type': contentType,
            };

            res.writeHead(206, head);
            file.data.pipe(res);
        } else {
            const head = {
                'Content-Length': fileSize,
                'Content-Type': contentType,
            };
            res.writeHead(200, head);
            
            const file = await axios({
                method: 'get',
                url: url,
                responseType: 'stream',
                httpsAgent: agent
            });
            file.data.pipe(res);
        }

    } catch (error) {
        console.error('Proxy Error:', error.message);
        res.status(500).send('Error streaming file');
    }
});

export default router;