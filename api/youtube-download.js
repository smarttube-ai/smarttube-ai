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
    const wantsAudioOnly = format === 'mp3' || audioOnly === 'true';
    res.setHeader('Cache-Control', 'no-store');
    const info = await ytdl.getInfo(url);
    const formats = info.formats || [];

    // Map UI quality labels (e.g. "720p") to an actual downloadable format.
    let chosenFormat;
    if (wantsAudioOnly) {
      const audioFormats = formats.filter((f) => f.hasAudio && !f.hasVideo);
      chosenFormat = ytdl.chooseFormat(audioFormats, { quality: 'highestaudio' });
    } else {
      const progressiveMp4 = formats.filter(
        (f) => f.hasAudio && f.hasVideo && f.container === 'mp4'
      );

      if (quality && quality !== 'highest') {
        chosenFormat = progressiveMp4.find((f) => (f.qualityLabel || '').toLowerCase() === String(quality).toLowerCase());
      }

      // Fallback to highest progressive MP4 if exact quality is unavailable.
      if (!chosenFormat) {
        chosenFormat = ytdl.chooseFormat(progressiveMp4, { quality: 'highest' });
      }
    }

    if (!chosenFormat) {
      res.status(404).json({ error: 'No downloadable format found for the selected options' });
      return;
    }

    const ext = wantsAudioOnly ? (chosenFormat.container || 'mp3') : 'mp4';
    res.setHeader('Content-Disposition', `attachment; filename="${safeName}.${ext}"`);
    res.setHeader('Content-Type', wantsAudioOnly ? 'audio/mpeg' : 'video/mp4');

    const stream = ytdl.downloadFromInfo(info, { format: chosenFormat });
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
