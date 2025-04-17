import { useState, useEffect } from 'react';
import { 
  Download, 
  AlertCircle, 
  FileVideo, 
  Music, 
  Check, 
  ChevronDown,
  Loader
} from 'lucide-react';
import { VideoData } from '../../types/youtube';

interface VideoDownloadProps {
  videoData: VideoData | null;
  videoId: string | null;
}

type VideoQuality = '144p' | '240p' | '360p' | '480p' | '720p' | '1080p';
type VideoFormat = 'mp4' | 'mp3';

export default function VideoDownload({ videoData, videoId }: VideoDownloadProps) {
  const [loading, setLoading] = useState(false);
  const [downloading, setDownloading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedQuality, setSelectedQuality] = useState<VideoQuality>('720p');
  const [selectedFormat, setSelectedFormat] = useState<VideoFormat>('mp4');
  const [audioOnly, setAudioOnly] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [downloadUrl, setDownloadUrl] = useState<string | null>(null);
  const [downloadReady, setDownloadReady] = useState(false);
  const [videoReady, setVideoReady] = useState(false);

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
    setDownloadReady(false);
    setDownloadUrl(null);
    setVideoReady(false);
  }, [selectedQuality, selectedFormat, audioOnly]);

  // Function to create a larger dummy file for download simulation
  const createDummyFile = (videoTitle: string, format: VideoFormat): Blob => {
    // Create a base content
    let content = `SmartTube AI - Downloaded Video
    
Video ID: ${videoId}
Title: ${videoTitle}
Format: ${format.toUpperCase()}
Quality: ${selectedQuality}
Audio Only: ${audioOnly ? 'Yes' : 'No'}
Download Date: ${new Date().toLocaleString()}

This is a simulated download from SmartTube AI.
In a production environment, this would be the actual video content.
`;

    // Get the estimated size based on quality and format
    const estimatedSize = getEstimatedSizeInBytes(selectedQuality, format, audioOnly);
    
    // Pad the content to reach the estimated size
    // Each character is approximately 1 byte
    const paddingNeeded = Math.max(0, estimatedSize - content.length);
    
    // Add padding data to simulate actual file size
    if (paddingNeeded > 0) {
      // Create a buffer of random data to pad the file
      const padding = Array(paddingNeeded).fill(0).map(() => 
        String.fromCharCode(Math.floor(Math.random() * 26) + 97)
      ).join('');
      
      content += `\n\n${padding}`;
    }

    // Create a blob with the content and appropriate MIME type
    return new Blob([content], { 
      type: format === 'mp4' ? 'video/mp4' : 'audio/mpeg' 
    });
  };

  // Function to get estimated size in bytes based on quality and format
  const getEstimatedSizeInBytes = (quality: VideoQuality, format: VideoFormat, audioOnly: boolean): number => {
    // Sizes in MB
    const sizesMB: Record<VideoQuality, number> = {
      '144p': 5,
      '240p': 10,
      '360p': 20,
      '480p': 35,
      '720p': 70,
      '1080p': 120
    };

    let sizeMB = sizesMB[quality];
    
    if (format === 'mp3' || audioOnly) {
      sizeMB = Math.floor(sizeMB * 0.15);
    }
    
    // Convert MB to bytes (1 MB = 1,048,576 bytes)
    return sizeMB * 1048576;
  };

  const handleDownload = async () => {
    if (downloadReady && videoData) {
      try {
        setDownloading(true);
        
        // Create a dummy file for download simulation with appropriate size
        const blob = createDummyFile(videoData.title, selectedFormat);
        
        // Create a blob URL and trigger download
        const blobUrl = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = blobUrl;
        link.download = `SmartTube AI - Downloaded Video.${selectedFormat}`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        
        // Clean up the blob URL
        setTimeout(() => URL.revokeObjectURL(blobUrl), 100);
        setDownloading(false);
      } catch (err) {
        setError('Download failed. Please try again.');
        setDownloading(false);
      }
      return;
    }

    setLoading(true);
    setError(null);
    setDownloadReady(false);
    setVideoReady(false);

    try {
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Get the YouTube video embed URL for preview
      // Add autoplay=1 and other parameters to ensure video plays automatically
      const youtubeEmbedUrl = `https://www.youtube.com/embed/${videoId}?autoplay=1&mute=0&controls=1&origin=${window.location.origin}`;
      
      // Set the embed URL for preview
      setDownloadUrl(youtubeEmbedUrl);
      setDownloadReady(true);
      setVideoReady(true);
      setLoading(false);
    } catch (err) {
      setError('Failed to prepare download. Please try again.');
      setLoading(false);
    }
  };

  const formatFileSize = (quality: VideoQuality, format: VideoFormat, audioOnly: boolean): string => {
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
          <div className="w-full md:w-1/3">
            {videoData.thumbnails && (
              <img 
                src={videoData.thumbnails.medium?.url || videoData.thumbnails.default?.url} 
                alt={videoData.title} 
                className="w-full h-auto rounded-lg"
              />
            )}
          </div>
          
          <div className="w-full md:w-2/3 space-y-2">
            <h4 className="font-medium text-lg">{videoData.title}</h4>
            <p className="text-sm text-muted-foreground">
              {videoData.snippet?.channelTitle || 'Unknown Channel'}
            </p>
            <p className="text-sm text-muted-foreground">
              Duration: {formatDuration(videoData.duration)}
            </p>
          </div>
        </div>
      </div>
      
      {/* Video Player (shown when video is ready) */}
      {videoReady && downloadUrl && (
        <div className="bg-card border border-border rounded-lg overflow-hidden">
          <div className="relative">
            {selectedFormat === 'mp4' && !audioOnly ? (
              <iframe
                src={downloadUrl}
                className="w-full aspect-video"
                allowFullScreen
                title="YouTube video player"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                sandbox="allow-same-origin allow-scripts allow-forms allow-popups allow-popups-to-escape-sandbox allow-presentation"
              ></iframe>
            ) : (
              <div className="bg-black aspect-video flex items-center justify-center">
                <div className="text-center">
                  <Music className="w-16 h-16 mx-auto text-primary mb-4" />
                  <p className="text-white text-lg">Audio Preview</p>
                  <iframe
                    src={`${downloadUrl}&autoplay=1`}
                    className="hidden"
                    title="YouTube audio player"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    sandbox="allow-same-origin allow-scripts allow-forms allow-popups allow-popups-to-escape-sandbox allow-presentation"
                  ></iframe>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
      
      {/* Download Options */}
      <div className="bg-card border border-border rounded-lg p-4">
        <h3 className="text-lg font-semibold mb-4">Download Options</h3>
        
        <div className="space-y-4">
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
              Estimated size: {formatFileSize(selectedQuality, selectedFormat, audioOnly)}
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
          
          {/* Download Button */}
          <button
            onClick={handleDownload}
            disabled={loading || downloading}
            className="button button-primary w-full flex items-center justify-center gap-2"
          >
            {loading ? (
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
            ) : downloading ? (
              <>
                <Loader className="w-4 h-4 animate-spin" />
                <span>Downloading...</span>
              </>
            ) : (
              <>
                <Download className="w-4 h-4" />
                {videoReady ? 'Download Now' : `Prepare ${selectedFormat.toUpperCase()} Download`}
              </>
            )}
          </button>
          
          {videoReady && (
            <div className="flex items-center gap-2 text-green-500 bg-green-500/10 p-3 rounded-lg">
              <Check className="w-4 h-4" />
              <p className="text-sm">Video ready! You can play it above or download it now.</p>
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
