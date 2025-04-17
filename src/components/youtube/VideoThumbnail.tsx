import { useState, useEffect } from 'react';
import { Download, AlertCircle } from 'lucide-react';

interface VideoThumbnailProps {
  videoId: string;
}

export default function VideoThumbnail({ videoId }: VideoThumbnailProps) {
  const [thumbnailUrl, setThumbnailUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [thumbnailQuality, setThumbnailQuality] = useState('maxresdefault');

  useEffect(() => {
    if (!videoId) return;
    
    const checkThumbnailExists = async (quality: string) => {
      const url = `https://img.youtube.com/vi/${videoId}/${quality}.jpg`;
      try {
        const response = await fetch(url, { method: 'HEAD' });
        return response.ok;
      } catch (error) {
        return false;
      }
    };

    const loadThumbnail = async () => {
      setLoading(true);
      setError(null);
      
      try {
        // Try maxresdefault first
        if (await checkThumbnailExists('maxresdefault')) {
          setThumbnailUrl(`https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`);
          setThumbnailQuality('maxresdefault');
        } 
        // Fall back to hqdefault
        else if (await checkThumbnailExists('hqdefault')) {
          setThumbnailUrl(`https://img.youtube.com/vi/${videoId}/hqdefault.jpg`);
          setThumbnailQuality('hqdefault');
        } 
        // Fall back to mqdefault as last resort
        else if (await checkThumbnailExists('mqdefault')) {
          setThumbnailUrl(`https://img.youtube.com/vi/${videoId}/mqdefault.jpg`);
          setThumbnailQuality('mqdefault');
        } 
        else {
          throw new Error('No thumbnail available for this video');
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load thumbnail');
      } finally {
        setLoading(false);
      }
    };

    loadThumbnail();
  }, [videoId]);

  const downloadImage = (url: string, filename: string) => {
    // Create a temporary canvas to convert the image to a blob
    fetch(url)
      .then(response => response.blob())
      .then(blob => {
        // Create a blob URL
        const blobUrl = URL.createObjectURL(blob);
        
        // Create a link element
        const link = document.createElement('a');
        link.href = blobUrl;
        link.download = filename;
        
        // Append to body, click and remove
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        
        // Clean up the blob URL
        setTimeout(() => URL.revokeObjectURL(blobUrl), 100);
      })
      .catch(error => {
        console.error('Error downloading image:', error);
      });
  };

  const handleDownload = () => {
    if (thumbnailUrl) {
      downloadImage(thumbnailUrl, `SmartTube AI - Video Thumbnail.jpg`);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center gap-2 text-red-500 bg-red-500/10 p-4 rounded-lg">
        <AlertCircle className="w-5 h-5" />
        <p>{error}</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="bg-card border border-border rounded-lg p-4">
        {thumbnailUrl && (
          <div className="space-y-4">
            <div className="rounded-lg overflow-hidden border border-border">
              <img 
                src={thumbnailUrl} 
                alt="Video Thumbnail" 
                className="w-full h-auto"
              />
            </div>
            
            <button
              onClick={handleDownload}
              className="button button-primary w-full flex items-center justify-center gap-2"
            >
              <Download className="w-4 h-4" />
              Download Thumbnail
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
