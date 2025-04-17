// Using direct fetch API instead of googleapis
export const youtubeConfig = {
  apiKey: import.meta.env.VITE_YOUTUBE_API_KEY,
  baseUrl: 'https://www.googleapis.com/youtube/v3'
};