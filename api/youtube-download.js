import ytdl from 'ytdl-core';

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    res.status(405).json({ error: 'Method not allowed' });
    return;
  }

  try {
    const { videoId, format = 'mp4', quality = 'highest', audioOnly = 'false', filename } = req.query || {};

    if (!videoId) {
      res.status(400).json({ error: 'Video ID is required' });
      return;
    }

    const url = `https://www.youtube.com/watch?v=${videoId}`;
    if (!ytdl.validateURL(url)) {
      res.status(400).json({ error: 'Invalid YouTube URL' });
      return;
    }

    const safeName = (filename || `youtube-${videoId}`).replace(/[/\\?%*:|"<>]/g, '-');
    const ext = format === 'mp3' || audioOnly === 'true' ? 'mp3' : 'mp4';

    res.setHeader('Content-Disposition', `attachment; filename="${safeName}.${ext}"`);
    res.setHeader('Cache-Control', 'no-store');

    const options = {
      quality,
      filter: format === 'mp3' || audioOnly === 'true' ? 'audioonly' : 'audioandvideo'
    };

    res.setHeader('Content-Type', ext === 'mp3' ? 'audio/mpeg' : 'video/mp4');

    const stream = ytdl(url, options);
    stream.on('error', (err) => {
      if (!res.headersSent) {
        res.status(500).json({ error: `Download failed: ${err.message}` });
      } else {
        res.end();
      }
    });

    stream.pipe(res);
  } catch (err) {
    res.status(500).json({ error: `Server error: ${err.message}` });
  }
}
