// This is a backend server implementation for handling YouTube downloads
// To use this, you would need to:
// 1. Install Node.js
// 2. Install required packages: npm install express cors ytdl-core
// 3. Run this file: node youtube-downloader.js

import express from 'express';
import cors from 'cors';
import ytdl from 'ytdl-core';

const app = express();

// Enable CORS for client requests
app.use(cors());

// Set up the download endpoint
app.get('/api/youtube-download', async (req, res) => {
  try {
    // Get parameters from the request
    const { videoId, format, quality, audioOnly, filename } = req.query;
    
    if (!videoId) {
      return res.status(400).json({ error: 'Video ID is required' });
    }
    
    const url = `https://www.youtube.com/watch?v=${videoId}`;
    
    // Validate the YouTube URL
    if (!ytdl.validateURL(url)) {
      return res.status(400).json({ error: 'Invalid YouTube URL' });
    }
    
    console.log(`Processing download for video: ${videoId}`);
    console.log(`Format: ${format}, Quality: ${quality}, Audio Only: ${audioOnly}`);
    
    // Set content disposition header for the filename
    const sanitizedFilename = filename ? 
      filename.replace(/[/\\?%*:|"<>]/g, '-') : 
      `youtube-${videoId}`;
    
    res.header('Content-Disposition', `attachment; filename="${sanitizedFilename}.${format}"`);
    
    // Configure ytdl options based on the requested format and quality
    const ytdlOptions = {
      quality: quality || 'highest',
    };
    
    // Handle different format types
    if (format === 'mp3') {
      ytdlOptions.filter = 'audioonly';
      res.header('Content-Type', 'audio/mpeg');
    } else {
      // For MP4 format
      if (audioOnly === 'true') {
        ytdlOptions.filter = 'audioonly';
      } else {
        // Try to get both audio and video
        ytdlOptions.filter = 'audioandvideo';
        // If high quality formats don't include audio, might need additional handling
      }
      res.header('Content-Type', 'video/mp4');
    }
    
    // Download and pipe the stream directly to the response
    ytdl(url, ytdlOptions)
      .on('info', (info, format) => {
        console.log(`Starting download: ${info.videoDetails.title}`);
        console.log(`Selected format: ${format.qualityLabel || format.audioBitrate + 'kbps'}`);
      })
      .on('progress', (chunkLength, downloaded, total) => {
        const percent = downloaded / total;
        process.stdout.write(`Downloading: ${(percent * 100).toFixed(2)}% `);
        process.stdout.cursorTo(0);
      })
      .on('end', () => {
        console.log(`\nDownload completed for ${videoId}`);
      })
      .on('error', (err) => {
        console.error('Download error:', err);
        // The client might have already received a partial response,
        // so we can't send a new error response
      })
      .pipe(res);
      
  } catch (err) {
    console.error('Server error:', err);
    res.status(500).json({ error: 'An error occurred while processing your request' });
  }
});

// Start the server
const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`YouTube downloader server running on port ${PORT}`);
  console.log(`Download endpoint: http://localhost:${PORT}/api/youtube-download`);
});

// Handle graceful shutdown
process.on('SIGINT', () => {
  console.log('Server shutting down...');
  process.exit(0);
}); 