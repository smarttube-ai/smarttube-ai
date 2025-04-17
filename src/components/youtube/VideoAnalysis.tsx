import { useState } from 'react';
import { Eye, ThumbsUp, MessageSquare, Share2, Copy } from 'lucide-react';
import { VideoData } from '../../types/youtube';

interface Props {
  videoData: VideoData | null;
}

export default function VideoAnalysis({ videoData }: Props) {
  const [copied, setCopied] = useState<string | null>(null);

  const handleCopy = async (text: string, type: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(type);
      setTimeout(() => setCopied(null), 2000);
    } catch (err) {
      console.error('Failed to copy text:', err);
    }
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="card p-4">
          <div className="flex items-center gap-2 text-muted-foreground mb-2">
            <Eye className="w-4 h-4" />
            <span>Views</span>
          </div>
          <span className="text-xl font-semibold">
            {videoData ? parseInt(videoData.views).toLocaleString() : '-'}
          </span>
        </div>
        <div className="card p-4">
          <div className="flex items-center gap-2 text-muted-foreground mb-2">
            <ThumbsUp className="w-4 h-4" />
            <span>Likes</span>
          </div>
          <span className="text-xl font-semibold">
            {videoData ? parseInt(videoData.likes).toLocaleString() : '-'}
          </span>
        </div>
        <div className="card p-4">
          <div className="flex items-center gap-2 text-muted-foreground mb-2">
            <MessageSquare className="w-4 h-4" />
            <span>Comments</span>
          </div>
          <span className="text-xl font-semibold">
            {videoData ? parseInt(videoData.comments).toLocaleString() : '-'}
          </span>
        </div>
        <div className="card p-4">
          <div className="flex items-center gap-2 text-muted-foreground mb-2">
            <Share2 className="w-4 h-4" />
            <span>Engagement Rate</span>
          </div>
          <span className="text-xl font-semibold">
            {videoData
              ? ((parseInt(videoData.likes) + parseInt(videoData.comments)) /
                  parseInt(videoData.views) *
                  100).toFixed(2) + '%'
              : '-'}
          </span>
        </div>
      </div>

      {videoData && (
        <div className="grid grid-cols-1 gap-6">
          <div className="card p-6">
            <h3 className="text-lg font-semibold mb-4">Video Details</h3>
            <div className="space-y-6">
              <div>
                <div className="flex justify-between items-center mb-2">
                  <label className="text-sm text-muted-foreground">Title</label>
                  <button 
                    className="button button-secondary button-icon group relative"
                    onClick={() => handleCopy(videoData.title, 'title')}
                  >
                    <Copy className="w-4 h-4" />
                    {copied === 'title' && (
                      <span className="absolute -top-8 right-0 bg-black text-white text-xs py-1 px-2 rounded">
                        Copied!
                      </span>
                    )}
                  </button>
                </div>
                <p className="font-medium">{videoData.title}</p>
              </div>
              <div className="mt-6">
                <div className="flex justify-between items-center mb-2">
                  <label className="text-sm text-muted-foreground">Description</label>
                  <button 
                    className="button button-secondary button-icon group relative"
                    onClick={() => handleCopy(videoData.description, 'description')}
                  >
                    <Copy className="w-4 h-4" />
                    {copied === 'description' && (
                      <span className="absolute -top-8 right-0 bg-black text-white text-xs py-1 px-2 rounded">
                        Copied!
                      </span>
                    )}
                  </button>
                </div>
                <p className="text-sm whitespace-pre-wrap">{videoData.description || 'No description available'}</p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}