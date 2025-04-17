import React, { useState } from 'react';
import {
  BarChart2,
  AlertCircle,
  Image,
  Tags,
  LineChart,
  Download,
} from 'lucide-react';
import { getVideoData, extractVideoId } from '../lib/youtube';
import { VideoData } from '../types/youtube';

// Import components
import VideoAnalysis from './youtube/VideoAnalysis';
import VideoThumbnail from './youtube/VideoThumbnail';
import VideoTags from './youtube/VideoTags';
import VideoInsights from './youtube/VideoInsights';
import VideoDownload from './youtube/VideoDownload';

export default function YouTubeTools() {
  const [videoUrl, setVideoUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [videoData, setVideoData] = useState<VideoData | null>(null);
  const [activeTab, setActiveTab] = useState('analysis');

  const handleVideoAnalysis = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const videoId = extractVideoId(videoUrl);
      if (!videoId) {
        throw new Error('Invalid YouTube URL');
      }

      const data = await getVideoData(videoId);
      setVideoData(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const tabs = [
    { id: 'analysis', label: 'Analysis', icon: BarChart2 },
    { id: 'tags', label: 'Video Tags', icon: Tags },
    { id: 'thumbnail', label: 'Video Thumbnail', icon: Image },
    { id: 'insights', label: 'Video Insights', icon: LineChart },
    { id: 'download', label: 'Download Video', icon: Download },
  ];

  const renderContent = () => {
    const videoId = videoData ? extractVideoId(videoUrl) : null;
    
    switch (activeTab) {
      case 'analysis':
        return <VideoAnalysis videoData={videoData} />;
      case 'tags':
        return <VideoTags videoData={videoData} />;
      case 'thumbnail':
        return videoId ? <VideoThumbnail videoId={videoId} /> : null;
      case 'insights':
        return <VideoInsights videoData={videoData} videoId={videoId} />;
      case 'download':
        return <VideoDownload videoData={videoData} videoId={videoId} />;
      default:
        return null;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <div className="flex-1">
          <input
            type="text"
            value={videoUrl}
            onChange={(e) => setVideoUrl(e.target.value)}
            placeholder="Enter YouTube video URL"
            className="input w-full"
          />
        </div>
        <button
          onClick={handleVideoAnalysis}
          disabled={loading}
          className="button button-primary"
        >
          {loading ? "Analyzing..." : "Analyze"}
        </button>
      </div>

      {error && (
        <div className="flex items-center gap-2 text-red-500 bg-red-500/10 p-4 rounded-lg">
          <AlertCircle className="w-5 h-5" />
          <p>{error}</p>
        </div>
      )}

      {videoData && (
        <>
          <div className="flex overflow-x-auto gap-2 pb-2">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`button ${
                  activeTab === tab.id ? 'button-primary' : 'button-secondary'
                } whitespace-nowrap`}
              >
                <tab.icon className="w-4 h-4 mr-2" />
                {tab.label}
              </button>
            ))}
          </div>

          {renderContent()}
        </>
      )}
    </div>
  );
}