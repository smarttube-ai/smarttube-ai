import { useState, useEffect, useCallback } from 'react';
import { 
  Download, 
  AlertCircle, 
  FileVideo, 
  Music, 
  Check, 
  ChevronDown,
  Loader,
  PlayCircle,
  ExternalLink
} from 'lucide-react';
import { VideoData } from '../../types/youtube';

interface VideoDownloadProps {
  videoData: VideoData | null;
  videoId: string | null;
}

type VideoQuality = '144p' | '240p' | '360p' | '480p' | '720p' | '1080p';
type VideoFormat = 'mp4' | 'mp3';

// URL of our hypothetical backend server that handles YouTube downloads
// In production this would be your actual backend service URL
const API_BASE_URL = 'http://localhost:3001/api/youtube-download';

export default function VideoDownload({ videoData, videoId }: VideoDownloadProps) {
  const [loading, setLoading] = useState(false);
  const [downloading, setDownloading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedQuality, setSelectedQuality] = useState<VideoQuality>('720p');
  const [selectedFormat, setSelectedFormat] = useState<VideoFormat>('mp4');
  const [audioOnly, setAudioOnly] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [downloadUrl, setDownloadUrl] = useState<string | null>(null);
  const [showPreview, setShowPreview] = useState(false);

  // Available qualities based on format
  const availableQualities: VideoQuality[] = selectedFormat === 'mp4' 
    ? ['144p', '240p', '360p', '480p', '720p', '1080p']
    : ['144p', '240p', '360p'];

  // Reset quality if not available in the current format
  useEffect(() => {
    if (selectedFormat === 'mp3') {
      setSelectedQuality('360p');
      setAudioOnly(true);
    } else if (!availableQualities.includes(selectedQuality)) {
      setSelectedQuality('720p');
    }
  }, [selectedFormat, selectedQuality, availableQualities]);

  // Reset download state when changing options
  useEffect(() => {
    setDownloadUrl(null);
    setShowPreview(false);
  }, [selectedQuality, selectedFormat, audioOnly]);

  // Prepare the YouTube embed URL
  const prepareEmbedUrl = useCallback(() => {
    if (!videoId) return null;
    return `https://www.youtube.com/embed/${videoId}?autoplay=0&mute=0&controls=1&origin=${window.location.origin}`;
  }, [videoId]);

  // Function to get estimated size based on quality and format
  const getEstimatedSize = (quality: VideoQuality, format: VideoFormat, audioOnly: boolean): string => {
    // Simulated file sizes based on quality and format
    const sizes: Record<VideoQuality, number> = {
      '144p': 5,
      '240p': 10,
      '360p': 20,
      '480p': 35,
      '720p': 70,
      '1080p': 120
    };

    const size = sizes[quality];
    
    if (format === 'mp3' || audioOnly) {
      return `~${Math.floor(size * 0.15)} MB`;
    }
    
    return `~${size} MB`;
  };

  const handlePlayPreview = () => {
    setShowPreview(true);
    const embedUrl = prepareEmbedUrl();
    if (embedUrl) {
      // Update the URL to autoplay when preview is shown
      setDownloadUrl(embedUrl.replace('autoplay=0', 'autoplay=1'));
    }
  };

  // Generate URL for downloading based on the current settings
  const getDownloadUrl = useCallback(() => {
    if (!videoId) return null;
    
    // In a real implementation, this would be your actual server endpoint
    // that processes the YouTube download
    const quality = selectedFormat === 'mp3' ? 'highestaudio' : selectedQuality === '1080p' ? 'highest' : selectedQuality;
    
    // Format the filename
    const filename = videoData?.title ? 
      videoData.title.replace(/[/\\?%*:|"<>]/g, '-') : 
      `YouTube-${videoId}`;
    
    // Build the download URL with query parameters
    return `${API_BASE_URL}?videoId=${videoId}&format=${selectedFormat}&quality=${quality}&audioOnly=${audioOnly}&filename=${encodeURIComponent(filename)}`;
  }, [videoId, selectedFormat, selectedQuality, audioOnly, videoData]);

  const handleDownload = async () => {
    try {
      setDownloading(true);
      setError(null);
      
      const downloadUrl = getDownloadUrl();
      
      if (!downloadUrl) {
        throw new Error('Cannot generate download URL');
      }

      // Redirect to the server for actual download
      window.location.href = downloadUrl;
      
      // Set downloading to false after a short delay
      setTimeout(() => {
        setDownloading(false);
      }, 1500);
      
    } catch (err) {
      console.error('Download error:', err);
      setError('Download failed. Please try again.');
      setDownloading(false);
    }
  };

  if (!videoData || !videoId) {
    return (
      <div className="flex items-center gap-2 text-yellow-500 bg-yellow-500/10 p-4 rounded-lg">
        <AlertCircle className="w-5 h-5" />
        <p>Please enter a valid YouTube URL and click Analyze to see download options.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Video Preview */}
      <div className="bg-card border border-border rounded-lg p-4">
        <h3 className="text-lg font-semibold mb-4">Video Preview</h3>
        
        <div className="flex flex-col md:flex-row gap-4">
          <div className="w-full md:w-1/3 relative group cursor-pointer" onClick={handlePlayPreview}>
            {videoData.thumbnails && (
              <>
              <img 
                src={videoData.thumbnails.medium?.url || videoData.thumbnails.default?.url} 
                alt={videoData.title} 
                className="w-full h-auto rounded-lg"
              />
                <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                  <div className="bg-black/50 rounded-full p-2">
                    <PlayCircle className="w-12 h-12 text-white" />
                  </div>
                </div>
                <div className="absolute bottom-2 right-2 bg-black/70 text-white text-xs px-2 py-1 rounded">
                  {formatDuration(videoData.duration)}
                </div>
              </>
            )}
          </div>
          
          <div className="w-full md:w-2/3 space-y-2">
            <h4 className="font-medium text-lg">{videoData.title}</h4>
            <p className="text-sm text-muted-foreground">
              {videoData.snippet?.channelTitle || 'Unknown Channel'}
            </p>

            <div className="flex gap-2 flex-wrap mt-3">
              <a 
                href={`https://www.youtube.com/watch?v=${videoId}`} 
                target="_blank" 
                rel="noopener noreferrer" 
                className="flex items-center gap-1 text-sm text-blue-500 hover:underline"
              >
                <ExternalLink className="w-4 h-4" />
                Watch on YouTube
              </a>
            </div>
            
            <div className="flex gap-2 flex-wrap mt-3">
              <button
                onClick={() => {
                  setSelectedFormat('mp4');
                  setAudioOnly(false);
                  handleDownload();
                }}
                className="button button-primary flex items-center gap-2 text-sm"
                disabled={downloading}
              >
                {downloading ? (
                  <Loader className="w-4 h-4 animate-spin" />
                ) : (
                  <FileVideo className="w-4 h-4" />
                )}
                {downloading ? 'Downloading...' : 'Download Video (MP4)'}
              </button>
              <button
                onClick={() => {
                  setSelectedFormat('mp3');
                  setAudioOnly(true);
                  handleDownload();
                }}
                className="button button-secondary flex items-center gap-2 text-sm"
                disabled={downloading}
              >
                {downloading ? (
                  <Loader className="w-4 h-4 animate-spin" />
                ) : (
                  <Music className="w-4 h-4" />
                )}
                {downloading ? 'Downloading...' : 'Download Audio (MP3)'}
              </button>
            </div>
          </div>
        </div>
      </div>
      
      {/* Video Player (shown when preview is requested) */}
      {showPreview && downloadUrl && (
        <div className="bg-card border border-border rounded-lg overflow-hidden">
          <div className="relative">
              <iframe
                src={downloadUrl}
                className="w-full aspect-video"
                allowFullScreen
                title="YouTube video player"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                sandbox="allow-same-origin allow-scripts allow-forms allow-popups allow-popups-to-escape-sandbox allow-presentation"
              ></iframe>
          </div>
        </div>
      )}
      
      {/* Advanced Download Options */}
      <div className="bg-card border border-border rounded-lg p-4">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold">Advanced Download Options</h3>
          <button
            onClick={handleDownload}
            disabled={downloading}
            className="button button-primary flex items-center gap-2"
          >
            {downloading ? (
              <Loader className="w-4 h-4 animate-spin" />
            ) : (
              <Download className="w-4 h-4" />
            )}
            {downloading ? 'Downloading...' : 'Download'}
          </button>
        </div>
        
        <div className="grid md:grid-cols-2 gap-4">
          {/* Format Selector */}
          <div>
            <label className="block text-sm font-medium mb-2">Format</label>
            <div className="flex gap-2">
              <button
                onClick={() => setSelectedFormat('mp4')}
                className={`button ${selectedFormat === 'mp4' ? 'button-primary' : 'button-secondary'} flex items-center gap-2`}
              >
                <FileVideo className="w-4 h-4" />
                MP4
              </button>
              <button
                onClick={() => setSelectedFormat('mp3')}
                className={`button ${selectedFormat === 'mp3' ? 'button-primary' : 'button-secondary'} flex items-center gap-2`}
              >
                <Music className="w-4 h-4" />
                MP3
              </button>
            </div>
          </div>
          
          {/* Quality Selector */}
          <div>
            <label className="block text-sm font-medium mb-2">Video Quality</label>
            <div className="relative">
              <button
                onClick={() => setDropdownOpen(!dropdownOpen)}
                className="button button-secondary w-full flex items-center justify-between"
              >
                <span>{selectedQuality}</span>
                <ChevronDown className="w-4 h-4" />
              </button>
              
              {dropdownOpen && (
                <div className="absolute z-10 w-full mt-1 bg-card border border-border rounded-lg shadow-lg">
                  {availableQualities.map((quality) => (
                    <button
                      key={quality}
                      onClick={() => {
                        setSelectedQuality(quality);
                        setDropdownOpen(false);
                      }}
                      className="w-full px-4 py-2 text-left hover:bg-accent/50 flex items-center justify-between"
                    >
                      <span>{quality}</span>
                      {quality === selectedQuality && <Check className="w-4 h-4" />}
                    </button>
                  ))}
                </div>
              )}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Estimated size: {getEstimatedSize(selectedQuality, selectedFormat, audioOnly)}
            </p>
          </div>
          
          {/* Audio Only Toggle */}
          {selectedFormat === 'mp4' && (
            <div className="flex items-center">
              <input
                type="checkbox"
                id="audioOnly"
                checked={audioOnly}
                onChange={(e) => setAudioOnly(e.target.checked)}
                className="mr-2"
              />
              <label htmlFor="audioOnly" className="text-sm">
                Download Audio Only
              </label>
            </div>
          )}
        </div>
      </div>
      
      {/* Legal Footer */}
      <div className="text-xs text-muted-foreground text-center p-2">
        Downloads are for personal use only. Respect copyright laws and YouTube's terms.
      </div>
      
      {error && (
        <div className="flex items-center gap-2 text-red-500 bg-red-500/10 p-4 rounded-lg">
          <AlertCircle className="w-5 h-5" />
          <p>{error}</p>
        </div>
      )}
    </div>
  );
}

// Helper function to format duration
function formatDuration(isoDuration: string): string {
  const match = isoDuration?.match(/PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?/);
  if (!match) return '00:00';
  
  const hours = match[1] ? match[1].padStart(2, '0') : '';
  const minutes = match[2] ? match[2].padStart(2, '0') : '00';
  const seconds = match[3] ? match[3].padStart(2, '0') : '00';
  
  return hours ? `${hours}:${minutes}:${seconds}` : `${minutes}:${seconds}`;
}
