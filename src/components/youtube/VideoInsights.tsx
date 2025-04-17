import { useState, useEffect } from 'react';
import { 
  Calendar, 
  Clock, 
  User, 
  Tag, 
  BarChart2, 
  Heart, 
  MessageSquare, 
  DollarSign,
  Copy,
  ExternalLink,
  Info
} from 'lucide-react';
import { VideoData } from '../../types/youtube';
import { youtubeConfig } from '../../config/youtube';

interface VideoInsightsProps {
  videoData: VideoData | null;
  videoId: string | null;
}

// Map YouTube category IDs to names
const categoryMap: Record<string, string> = {
  '1': 'Film & Animation',
  '2': 'Autos & Vehicles',
  '10': 'Music',
  '15': 'Pets & Animals',
  '17': 'Sports',
  '18': 'Short Movies',
  '19': 'Travel & Events',
  '20': 'Gaming',
  '21': 'Videoblogging',
  '22': 'People & Blogs',
  '23': 'Comedy',
  '24': 'Entertainment',
  '25': 'News & Politics',
  '26': 'Howto & Style',
  '27': 'Education',
  '28': 'Science & Technology',
  '29': 'Nonprofit & Activism',
  '30': 'Movies',
  '31': 'Anime/Animation',
  '32': 'Action/Adventure',
  '33': 'Classics',
  '34': 'Comedy',
  '35': 'Documentary',
  '36': 'Drama',
  '37': 'Family',
  '38': 'Foreign',
  '39': 'Horror',
  '40': 'Sci-Fi/Fantasy',
  '41': 'Thriller',
  '42': 'Shorts',
  '43': 'Shows',
  '44': 'Trailers'
};

export default function VideoInsights({ videoData, videoId }: VideoInsightsProps) {
  const [publishedDate, setPublishedDate] = useState<string>('');
  const [videoAge, setVideoAge] = useState<string>('');
  const [duration, setDuration] = useState<string>('');
  const [durationLabel, setDurationLabel] = useState<string>('');
  const [channelDetails, setChannelDetails] = useState<{ name: string; id: string }>({ name: '', id: '' });
  const [category, setCategory] = useState<string>('');
  const [engagementRate, setEngagementRate] = useState<string>('');
  const [likeToViewRatio, setLikeToViewRatio] = useState<string>('');
  const [commentCount, setCommentCount] = useState<number>(0);
  const [estimatedEarnings, setEstimatedEarnings] = useState<{ min: string; max: string }>({ min: '', max: '' });
  const [isLoadingComments, setIsLoadingComments] = useState<boolean>(false);
  const [comments, setComments] = useState<any[]>([]);
  const [tooltipVisible, setTooltipVisible] = useState<string | null>(null);
  const [copied, setCopied] = useState<string | null>(null);

  useEffect(() => {
    if (videoData && videoId) {
      // Process published date and video age
      const publishedAt = new Date(videoData.snippet?.publishedAt || '');
      setPublishedDate(publishedAt.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }));
      setVideoAge(calculateAge(publishedAt));

      // Process duration
      if (videoData.duration) {
        const formattedDuration = formatDuration(videoData.duration);
        setDuration(formattedDuration);
        
        // Determine duration label
        const durationInSeconds = parseDuration(videoData.duration);
        if (durationInSeconds < 60) {
          setDurationLabel('Short');
        } else if (durationInSeconds <= 600) {
          setDurationLabel('Mid');
        } else {
          setDurationLabel('Long');
        }
      }

      // Set channel details
      setChannelDetails({
        name: videoData.snippet?.channelTitle || '',
        id: videoData.snippet?.channelId || ''
      });

      // Set category
      const categoryId = videoData.snippet?.categoryId || '';
      setCategory(categoryMap[categoryId] || 'Uncategorized');

      // Calculate engagement rate
      const views = parseInt(videoData.views) || 0;
      const likes = parseInt(videoData.likes) || 0;
      const comments = parseInt(videoData.comments) || 0;
      
      if (views > 0) {
        const engagementRateValue = ((likes + comments) / views) * 100;
        setEngagementRate(engagementRateValue.toFixed(2));
        
        const likeRatio = (likes / views) * 100;
        setLikeToViewRatio(likeRatio.toFixed(2));
      }

      // Set comment count
      setCommentCount(comments);

      // Calculate estimated earnings
      const lowCPM = 1.5;
      const highCPM = 4.2;
      const minEarnings = (views / 1000) * lowCPM;
      const maxEarnings = (views / 1000) * highCPM;
      
      setEstimatedEarnings({
        min: minEarnings.toLocaleString('en-US', { style: 'currency', currency: 'USD', minimumFractionDigits: 0, maximumFractionDigits: 0 }),
        max: maxEarnings.toLocaleString('en-US', { style: 'currency', currency: 'USD', minimumFractionDigits: 0, maximumFractionDigits: 0 })
      });
    }
  }, [videoData, videoId]);

  const calculateAge = (publishedDate: Date): string => {
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - publishedDate.getTime());
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays < 1) return 'Today';
    if (diffDays === 1) return 'Yesterday';
    if (diffDays < 7) return `${diffDays} days ago`;
    if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks ago`;
    if (diffDays < 365) return `${Math.floor(diffDays / 30)} months ago`;
    return `${Math.floor(diffDays / 365)} years ago`;
  };

  const formatDuration = (isoDuration: string): string => {
    const match = isoDuration.match(/PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?/);
    if (!match) return '00:00:00';
    
    const hours = match[1] ? match[1].padStart(2, '0') : '00';
    const minutes = match[2] ? match[2].padStart(2, '0') : '00';
    const seconds = match[3] ? match[3].padStart(2, '0') : '00';
    
    return hours === '00' ? `${minutes}:${seconds}` : `${hours}:${minutes}:${seconds}`;
  };

  const parseDuration = (isoDuration: string): number => {
    const match = isoDuration.match(/PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?/);
    if (!match) return 0;
    
    const hours = parseInt(match[1] || '0');
    const minutes = parseInt(match[2] || '0');
    const seconds = parseInt(match[3] || '0');
    
    return hours * 3600 + minutes * 60 + seconds;
  };

  const handleCopy = async (text: string, type: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(type);
      setTimeout(() => setCopied(null), 2000);
    } catch (err) {
      console.error('Failed to copy text:', err);
    }
  };

  const fetchComments = async () => {
    if (!videoId) return;
    
    setIsLoadingComments(true);
    try {
      const API_KEY = youtubeConfig.apiKey;
      const response = await fetch(
        `https://www.googleapis.com/youtube/v3/commentThreads?part=snippet&videoId=${videoId}&maxResults=100&key=${API_KEY}`
      );
      
      if (!response.ok) {
        throw new Error('Failed to fetch comments');
      }
      
      const data = await response.json();
      setComments(data.items || []);
    } catch (error) {
      console.error('Error fetching comments:', error);
    } finally {
      setIsLoadingComments(false);
    }
  };

  const downloadComments = () => {
    if (comments.length === 0) {
      fetchComments().then(() => {
        if (comments.length > 0) {
          generateCSV();
        }
      });
    } else {
      generateCSV();
    }
  };

  const generateCSV = () => {
    if (comments.length === 0) return;
    
    // Create CSV content
    const headers = ['Username', 'Comment', 'Date'];
    const rows = comments.map(item => {
      const snippet = item.snippet.topLevelComment.snippet;
      return [
        snippet.authorDisplayName,
        snippet.textDisplay.replace(/"/g, '""'), // Escape quotes
        new Date(snippet.publishedAt).toLocaleDateString()
      ];
    });
    
    // Combine headers and rows
    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.map(cell => `"${cell}"`).join(','))
    ].join('\n');
    
    // Create and download the file
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `comments-${videoId}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const getDurationLabelColor = (label: string) => {
    switch (label) {
      case 'Short': return 'bg-blue-500/20 text-blue-500';
      case 'Mid': return 'bg-green-500/20 text-green-500';
      case 'Long': return 'bg-orange-500/20 text-orange-500';
      default: return 'bg-gray-500/20 text-gray-500';
    }
  };

  const renderTooltip = (id: string, content: string) => (
    <div 
      className="relative inline-block ml-1 cursor-help"
      onMouseEnter={() => setTooltipVisible(id)}
      onMouseLeave={() => setTooltipVisible(null)}
    >
      <Info className="w-4 h-4 text-muted-foreground" />
      {tooltipVisible === id && (
        <div className="absolute z-10 w-48 p-2 text-xs bg-black text-white rounded shadow-lg -right-2 bottom-6">
          {content}
        </div>
      )}
    </div>
  );

  if (!videoData || !videoId) return null;

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {/* 1. Published Date & Video Age */}
        <div className="card p-4">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-gradient-to-r from-[#2762EB] to-[#9333EA] flex items-center justify-center">
                <Calendar className="w-4 h-4 text-white" />
              </div>
              <h3 className="font-semibold">Published Date</h3>
            </div>
            {renderTooltip('published', "Shows when the video was uploaded to YouTube.")}
          </div>
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground">Published on:</span>
              <span className="font-medium">{publishedDate}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground">Video Age:</span>
              <span className="font-medium">{videoAge}</span>
            </div>
          </div>
        </div>

        {/* 2. Video Duration */}
        <div className="card p-4">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-gradient-to-r from-[#2762EB] to-[#9333EA] flex items-center justify-center">
                <Clock className="w-4 h-4 text-white" />
              </div>
              <h3 className="font-semibold">Video Duration</h3>
            </div>
          </div>
          <div className="flex flex-col items-center justify-center h-16">
            <div className="text-2xl font-bold mb-2">{duration}</div>
            <div className={`px-3 py-1 rounded-full text-xs font-medium ${getDurationLabelColor(durationLabel)}`}>
              {durationLabel}
            </div>
          </div>
        </div>

        {/* 3. Channel Name & ID */}
        <div className="card p-4">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-gradient-to-r from-[#2762EB] to-[#9333EA] flex items-center justify-center">
                <User className="w-4 h-4 text-white" />
              </div>
              <h3 className="font-semibold">Channel Details</h3>
            </div>
          </div>
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground">Channel:</span>
              <span className="font-medium">{channelDetails.name}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground">Channel ID:</span>
              <div className="flex items-center">
                <span className="text-sm mr-1 truncate max-w-[120px]">{channelDetails.id}</span>
                <button 
                  className="button button-secondary button-icon group relative"
                  onClick={() => handleCopy(channelDetails.id, 'channelId')}
                >
                  <Copy className="w-3 h-3" />
                  {copied === 'channelId' && (
                    <span className="absolute -top-8 right-0 bg-black text-white text-xs py-1 px-2 rounded">
                      Copied!
                    </span>
                  )}
                </button>
              </div>
            </div>
            <a 
              href={`https://www.youtube.com/channel/${channelDetails.id}`} 
              target="_blank" 
              rel="noopener noreferrer"
              className="button button-secondary w-full flex items-center justify-center gap-2 text-sm"
            >
              <ExternalLink className="w-3 h-3" />
              Visit Channel
            </a>
          </div>
        </div>

        {/* 4. Video Category */}
        <div className="card p-4">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-gradient-to-r from-[#2762EB] to-[#9333EA] flex items-center justify-center">
                <Tag className="w-4 h-4 text-white" />
              </div>
              <h3 className="font-semibold">Video Category</h3>
            </div>
            {renderTooltip('category', "Video category helps YouTube recommend similar content.")}
          </div>
          <div className="flex items-center justify-center h-16">
            <div className="px-4 py-2 bg-accent/30 rounded-lg flex items-center gap-2">
              <Tag className="w-4 h-4" />
              <span className="font-medium">{category}</span>
            </div>
          </div>
        </div>

        {/* 5. Engagement Rate */}
        <div className="card p-4">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-gradient-to-r from-[#2762EB] to-[#9333EA] flex items-center justify-center">
                <BarChart2 className="w-4 h-4 text-white" />
              </div>
              <h3 className="font-semibold">Engagement Rate</h3>
            </div>
            {renderTooltip('engagement', "Engagement rate measures how interactive your audience is.")}
          </div>
          <div className="flex flex-col items-center justify-center h-16">
            <div className="text-2xl font-bold mb-1">{engagementRate}%</div>
            <div className="text-xs text-muted-foreground">
              (Likes + Comments) / Views × 100
            </div>
          </div>
        </div>

        {/* 6. Like-to-View Ratio */}
        <div className="card p-4">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-gradient-to-r from-[#2762EB] to-[#9333EA] flex items-center justify-center">
                <Heart className="w-4 h-4 text-white" />
              </div>
              <h3 className="font-semibold">Like-to-View Ratio</h3>
            </div>
            {renderTooltip('likeratio', "Like ratio is a quick indicator of content quality.")}
          </div>
          <div className="flex flex-col items-center justify-center h-16">
            <div className="text-2xl font-bold mb-1">{likeToViewRatio}%</div>
            <div className="text-xs text-muted-foreground">
              Likes ÷ Views × 100
            </div>
          </div>
        </div>

        {/* 7. Comments Downloader */}
        <div className="card p-4">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-gradient-to-r from-[#2762EB] to-[#9333EA] flex items-center justify-center">
                <MessageSquare className="w-4 h-4 text-white" />
              </div>
              <h3 className="font-semibold">Comments Downloader</h3>
            </div>
            {renderTooltip('comments', "Download top YouTube comments for analysis.")}
          </div>
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground">Comment Count:</span>
              <span className="font-medium">{commentCount.toLocaleString()}</span>
            </div>
            <button
              onClick={downloadComments}
              disabled={isLoadingComments}
              className="button button-primary w-full flex items-center justify-center gap-2"
            >
              {isLoadingComments ? (
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
              ) : (
                <>
                  <MessageSquare className="w-4 h-4" />
                  Download Comments (.CSV)
                </>
              )}
            </button>
          </div>
        </div>

        {/* 8. Estimated Earnings */}
        <div className="card p-4">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-gradient-to-r from-[#2762EB] to-[#9333EA] flex items-center justify-center">
                <DollarSign className="w-4 h-4 text-white" />
              </div>
              <h3 className="font-semibold">Estimated Earnings</h3>
            </div>
            {renderTooltip('earnings', "This is just an estimate. Real earnings vary by region, niche, and ad types.")}
          </div>
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground">Estimated Range:</span>
              <span className="font-medium">{estimatedEarnings.min} – {estimatedEarnings.max}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground">CPM Assumption:</span>
              <span className="font-medium">$1.50 – $4.20</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
