import { useState } from 'react';
import { Copy, Tag, AlertCircle } from 'lucide-react';
import { VideoData } from '../../types/youtube';

interface Props {
  videoData: VideoData | null;
}

export default function VideoTags({ videoData }: Props) {
  const [copied, setCopied] = useState<boolean>(false);

  const handleCopy = async (tags: string[]) => {
    try {
      await navigator.clipboard.writeText(tags.join(', '));
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy tags:', err);
    }
  };

  if (!videoData) {
    return null;
  }

  return (
    <div className="space-y-6">
      <div className="card p-6">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold">Video Tags</h3>
          <button 
            className="button button-secondary button-icon group relative"
            onClick={() => handleCopy(videoData.tags)}
            disabled={!videoData.tags.length}
          >
            <Copy className="w-4 h-4" />
            {copied && (
              <span className="absolute -top-8 right-0 bg-black text-white text-xs py-1 px-2 rounded">
                Copied!
              </span>
            )}
          </button>
        </div>
        
        {videoData.tags.length > 0 ? (
          <div className="flex flex-wrap gap-2">
            {videoData.tags.map((tag) => (
              <span key={tag} className="px-2 py-1 bg-accent rounded-md text-sm flex items-center gap-1">
                <Tag className="w-3 h-3" />
                {tag}
              </span>
            ))}
          </div>
        ) : (
          <div className="flex items-center justify-center p-8 text-muted-foreground">
            <AlertCircle className="w-5 h-5 mr-2" />
            <span>No tags found for this video</span>
          </div>
        )}
        
        <div className="mt-6">
          <h4 className="text-md font-medium mb-3">Tag Statistics</h4>
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-accent/30 p-3 rounded-lg">
              <p className="text-sm text-muted-foreground">Total Tags</p>
              <p className="text-xl font-semibold">{videoData.tags.length}</p>
            </div>
            <div className="bg-accent/30 p-3 rounded-lg">
              <p className="text-sm text-muted-foreground">Avg. Length</p>
              <p className="text-xl font-semibold">
                {videoData.tags.length 
                  ? Math.round(videoData.tags.join('').length / videoData.tags.length) 
                  : 0}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
