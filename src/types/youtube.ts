export interface VideoData {
  title: string;
  description: string;
  views: string;
  likes: string;
  comments: string;
  tags: string[];
  thumbnails: any;
  duration: string;
  snippet?: {
    publishedAt: string;
    channelTitle: string;
    channelId: string;
    categoryId: string;
  };
  analytics?: {
    dailyData: Array<{
      date: string;
      views: number;
      watchTime: number;
      avgViewDuration: number;
      likes: number;
      comments: number;
    }>;
    totals: {
      views: number;
      watchTime: number;
      avgViewDuration: number;
      likes: number;
      comments: number;
    };
  };
}