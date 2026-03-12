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

    let parsedUrl;
    try {
        parsedUrl = new URL(url);
    } catch (e) {
        return res.status(400).send('Invalid URL');
    }

    const allowedHosts = ['archive.org', 'www.archive.org', 'ia600000.us.archive.org', 'ia800000.us.archive.org'];
    const isArchiveHost = parsedUrl.hostname === 'archive.org'
        || parsedUrl.hostname.endsWith('.archive.org')
        || allowedHosts.includes(parsedUrl.hostname);

    if (!isArchiveHost) {
        return res.status(403).send('Streaming host is not allowed');
    }

    try {
        // Create an agent to handle https
        const agent = new https.Agent({  
          rejectUnauthorized: false
        });

        const range = req.headers.range;
        let upstream;
        let retries = 2;
        while (retries > 0) {
          try {
            upstream = await axios({
              method: 'get',
              url: parsedUrl.toString(),
              responseType: 'stream',
              headers: range ? { Range: range } : {},
              httpsAgent: agent,
              timeout: 20000,
              validateStatus: (status) => status >= 200 && status < 400,
            });
            break;
          } catch (e) {
            retries--;
            if (retries === 0) {
              throw new Error(`Stream source unavailable after retries: ${e.message}`);
            }
            await new Promise(resolve => setTimeout(resolve, 1500));
          }
        }

        if (upstream.headers['content-type']) {
            res.setHeader('Content-Type', upstream.headers['content-type']);
        }
        if (upstream.headers['content-length']) {
            res.setHeader('Content-Length', upstream.headers['content-length']);
        }
        if (upstream.headers['content-range']) {
            res.setHeader('Content-Range', upstream.headers['content-range']);
        }
        res.setHeader('Accept-Ranges', upstream.headers['accept-ranges'] || 'bytes');

        res.status(upstream.status === 206 ? 206 : 200);
        upstream.data.pipe(res);

    } catch (error) {
        console.error('Proxy Error:', error.message);
        res.status(500).send('Error streaming file');
    }
});

export default router;