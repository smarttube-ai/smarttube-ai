import { youtubeConfig } from '../config/youtube';

const API_KEY = youtubeConfig.apiKey;
const BASE_URL = youtubeConfig.baseUrl;

async function fetchYouTubeAPI(endpoint: string, params: Record<string, string>) {
  const searchParams = new URLSearchParams({
    key: API_KEY,
    ...params
  });

  const response = await fetch(`${BASE_URL}/${endpoint}?${searchParams}`);
  if (!response.ok) {
    throw new Error('YouTube API request failed');
  }
  return response.json();
}

export async function getVideoData(videoId: string) {
  try {
    const response = await fetchYouTubeAPI('videos', {
      part: 'snippet,statistics,contentDetails',
      id: videoId
    });

    if (!response.items?.length) {
      throw new Error('Video not found');
    }

    const video = response.items[0];
    const { snippet, statistics, contentDetails } = video;

    // Get video data
    const videoData = {
      title: snippet.title,
      description: snippet.description,
      views: statistics.viewCount,
      likes: statistics.likeCount,
      comments: statistics.commentCount,
      tags: snippet.tags || [],
      thumbnails: snippet.thumbnails,
      duration: contentDetails.duration,
      snippet: {
        publishedAt: snippet.publishedAt,
        channelTitle: snippet.channelTitle,
        channelId: snippet.channelId,
        categoryId: snippet.categoryId || '0',
      },
      analytics: {
        dailyData: generateDailyData(statistics),
        totals: {
          views: parseInt(statistics.viewCount) || 0,
          watchTime: Math.floor((parseInt(statistics.viewCount) || 0) * 2.5),
          avgViewDuration: 150,
          likes: parseInt(statistics.likeCount) || 0,
          comments: parseInt(statistics.commentCount) || 0,
        },
      },
    };

    return videoData;
  } catch (error) {
    console.error('Error fetching video data:', error);
    throw error;
  }
}

function generateDailyData(statistics: any) {
  const totalViews = parseInt(statistics.viewCount) || 0;
  const totalLikes = parseInt(statistics.likeCount) || 0;
  const totalComments = parseInt(statistics.commentCount) || 0;

  return Array.from({ length: 7 }, (_, i) => {
    const date = new Date();
    date.setDate(date.getDate() - (6 - i));
    
    const dayFactor = (i + 1) / 28;
    const views = Math.floor(totalViews * dayFactor / 7);
    const likes = Math.floor(totalLikes * dayFactor / 7);
    const comments = Math.floor(totalComments * dayFactor / 7);
    
    return {
      date: date.toISOString().split('T')[0],
      views,
      watchTime: Math.floor(views * 2.5),
      avgViewDuration: 150,
      likes,
      comments,
    };
  });
}

export function extractVideoId(url: string) {
  const regex = /(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/;
  const match = url.match(regex);
  return match ? match[1] : null;
}