import React, { useState } from 'react';
import {
  Copy,
  Download,
  FileDown,
  Loader2,
  AlertCircle,
  Lightbulb,
} from 'lucide-react';
import { getApiKey } from '../lib/openrouter';

export default function IdeationSection() {
  const [channelUrl, setChannelUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [ideaResponse, setIdeaResponse] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  // Function to validate YouTube channel URL
  const isValidYouTubeUrl = (url: string): boolean => {
    // Basic validation for YouTube URLs
    return url.includes('youtube.com/') || 
           url.includes('youtu.be/') || 
           url.includes('@') || 
           url.includes('channel/') || 
           url.includes('c/');
  };
  
  const handleAnalyze = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!channelUrl) {
      setError('Please enter a YouTube channel URL');
      return;
    }
    
    if (!isValidYouTubeUrl(channelUrl)) {
      setError('Please enter a valid YouTube channel URL (e.g., https://www.youtube.com/@ChannelName)');
      return;
    }
    
    setLoading(true);
    setError(null);
    setIdeaResponse(null);

    try {
      // Check if API key is available
      const apiKey = await getApiKey();
      if (!apiKey) {
        throw new Error('OpenRouter API key not found. Please check your settings.');
      }
      
      // Prepare the request to OpenRouter API
      const userMessage = {
        role: 'user',
        content: `You are an expert YouTube strategist. Analyze the following YouTube channel based on its videos, titles, and descriptions. Then, generate 3 to 5 unique, fresh, and engaging video ideas for this channel.

Channel URL: ${channelUrl}

Instructions:
1. First, determine the overall niche and target audience of the channel.
2. Evaluate the tone, common themes, and style of content.
3. Based on this analysis, provide creative and relevant video ideas that the creator hasn't done before.

Each idea should include:
- Video Title
- A short 2–3 sentence summary of the video content (what it's about, how it helps or entertains the audience)

Format your output as:

---
🎯 **Video Idea 1**
Title: [Title]
Summary: [Short summary]

🎯 **Video Idea 2**
Title: [Title]
Summary: [Short summary]

(And so on up to 5 ideas)

Also, below each idea, add a simple call-to-action text:
→ Button: "Write Script for This Video"`
      };
      
      // Log the API key (first few characters only for security)
      console.log('API Key (first 10 chars):', apiKey.substring(0, 10) + '...');
      
      // Try with a different model that's known to work with OpenRouter
      // OpenRouter supports various models, let's use a reliable one
      const request = {
        model: "deepseek/deepseek-r1-zero:free",
        temperature: 0.7,
        messages: [userMessage],
        max_tokens: 1500
      };
      
      console.log('Sending request to OpenRouter API...');
      
      console.log('Sending request with payload:', JSON.stringify(request, null, 2));
      
      const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json',
          'HTTP-Referer': window.location.origin,
          'X-Title': 'SmartTube AI'
        },
        body: JSON.stringify(request)
      });
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error('Error from OpenRouter API:', errorText);
        console.error('Response status:', response.status);
        console.error('Response headers:', Object.fromEntries([...response.headers.entries()]));
        throw new Error(`API Error (${response.status}): ${errorText}`);
      }
      
      const data = await response.json();
      if (!data.choices || data.choices.length === 0) {
        throw new Error('No response received from the AI model');
      }
      
      // Get the content from the API response
      const content = data.choices[0].message.content;
      // Clean up the content by removing \boxed{, ---, and } characters
      const cleanContent = content
        .replace(/\\boxed\{/g, '')
        .replace(/^---/gm, '')
        .replace(/\}$/g, '')
        .trim();
      setIdeaResponse(cleanContent);
    } catch (err: any) {
      console.error('Error generating video idea:', err);
      
      // Check for specific error types
      if (err.message?.includes('401')) {
        setError('API Key is invalid or expired. Please check your OpenRouter API key in the .env file.');
      } else if (err.message?.includes('429')) {
        setError('Rate limit exceeded. Please try again later.');
      } else if (err.message?.includes('404')) {
        setError('API endpoint not found. Please check your network connection.');
      } else if (err.message?.includes('model_not_found')) {
        setError('The AI model is currently unavailable. Please try again later.');
      } else if (err.message?.toLowerCase().includes('timeout')) {
        setError('Request timed out. The server might be busy, please try again.');
      } else {
        // For debugging purposes, show more detailed error in console
        console.warn('Detailed error:', err);
        
        // Show a more helpful error message
        setError(`API Error: ${err.message || 'Unknown error'}. Please try again or check console for details.`);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = async () => {
    if (!ideaResponse) return;

    try {
      await navigator.clipboard.writeText(ideaResponse);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy text:', err);
    }
  };

  const handleDownload = () => {
    if (!ideaResponse) return;

    const blob = new Blob([ideaResponse], { type: 'text/plain' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'video-ideas.txt';
    document.body.appendChild(a);
    a.click();
    window.URL.revokeObjectURL(url);
    document.body.removeChild(a);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <div className="flex-1">
          <input
            type="text"
            value={channelUrl}
            onChange={(e) => setChannelUrl(e.target.value)}
            placeholder="Enter YouTube channel URL"
            className="input w-full"
          />
        </div>
        <button
          onClick={handleAnalyze}
          disabled={loading}
          className="button button-primary"
        >
          {loading ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Analyzing...
            </>
          ) : (
            "Generate Idea"
          )}
        </button>
      </div>

      {error && (
        <div className="flex items-center gap-2 text-red-500 bg-red-500/10 p-4 rounded-lg">
          <AlertCircle className="w-5 h-5" />
          <p>{error}</p>
        </div>
      )}

      {ideaResponse && (
        <div className="space-y-6">
          <div className="card p-6">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-semibold flex items-center gap-2">
                <Lightbulb className="w-5 h-5 text-primary" />
                Generated Video Ideas
              </h3>
              <div className="flex gap-2">
                <button 
                  className="button button-secondary group relative"
                  onClick={handleCopy}
                >
                  <Copy className="w-4 h-4 mr-2" />
                  {copied ? 'Copied!' : 'Copy'}
                  {copied && (
                    <span className="absolute -top-8 left-1/2 transform -translate-x-1/2 bg-black text-white text-xs py-1 px-2 rounded">
                      Copied!
                    </span>
                  )}
                </button>
                <button 
                  className="button button-secondary"
                  onClick={handleDownload}
                >
                  <FileDown className="w-4 h-4 mr-2" />
                  Download
                </button>
              </div>
            </div>

            <div className="space-y-6 idea-content">
              {ideaResponse.split('🎯').filter(idea => idea.trim()).map((idea, index) => (
                <div key={index} className="idea-card card p-6 bg-gray-800/50 rounded-lg hover:bg-gray-800/70 transition-colors">
                  <div 
                    className="prose max-w-none" 
                    dangerouslySetInnerHTML={{ 
                      __html: idea
                        .replace(/\n/g, '<br>')
                        .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
                        .replace(/Title: (.*?)\n/g, '<h4 class="text-lg font-semibold mb-1">$1</h4>')
                        .replace(/Summary: (.*?)(?=\n→|$)/gs, '<p class="mb-3">$1</p>')
                        .replace(/→ Button: "Write Script for This Video"/g, '')
                    }}
                  />
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}