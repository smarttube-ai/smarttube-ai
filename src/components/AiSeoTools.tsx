import React, { useState } from 'react';
import '../scrollbar.css'; // Import custom scrollbar styles
import {
  Copy,
  FileDown,
  Sparkles,
  Hash,
  Type,
  AlignLeft,
  Search,
  Zap,
  BarChart2,
  FileText
} from 'lucide-react';
import { getApiKey } from '../lib/openrouter';

function TitleGenerator() {
  const [input, setInput] = useState({
    title: '',
    keywords: '',
    audienceType: ''
  });
  const [loading, setLoading] = useState(false);
  const [titles, setTitles] = useState<string[]>([]);
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);
  const [copiedAll, setCopiedAll] = useState(false);

  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      const apiKey = await getApiKey();
      
      if (!apiKey) {
        throw new Error('OpenRouter API key not found');
      }
      
      const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json',
          'HTTP-Referer': window.location.origin,
          'X-Title': 'SmartTube AI'
        },
        body: JSON.stringify({
          model: 'deepseek/deepseek-r1-zero:free',
          temperature: 0.7,
          messages: [
            {
              role: 'user',
              content: `You are an expert SEO copywriter. Generate 5 SEO-optimized YouTube video titles based on the following info:

Base Title: ${input.title}
Keywords: ${input.keywords}
Target Audience: ${input.audienceType}

Instructions:
- Use a click-worthy format (how-to, numbers, curiosity, etc.)
- Integrate keywords naturally
- Keep titles under 70 characters if possible
- Make sure they match the tone/style for the audience

Respond with just the list of 5 unique titles.`
            }
          ]
        })
      });
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error('Error generating titles:', errorText);
        throw new Error('Failed to generate titles');
      }
      
      const data = await response.json();
      
      if (!data.choices || data.choices.length === 0) {
        throw new Error('No titles received from the AI model');
      }
      
      // Extract titles from the response
      let content = data.choices[0].message.content;
      
      // Remove JSON formatting characters if present
      content = content.replace(/^\\boxed\{|\}$/g, '');
      
      // Split the content by newlines and filter out empty lines
      const generatedTitles = content.split('\n')
        .filter((title: string) => title.trim().length > 0)
        .map((title: string) => {
          // Remove numbering and any other formatting characters
          return title.replace(/^\d+\.\s*|"|\\/g, '').trim();
        });
      
      setTitles(generatedTitles);
    } catch (error) {
      console.error('Failed to generate titles:', error);
      // Show a fallback message or the existing titles
      setTitles(['Couldn\'t generate titles. Please try again.']);
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = async (text: string, index?: number) => {
    try {
      await navigator.clipboard.writeText(text);
      if (index !== undefined) {
        setCopiedIndex(index);
        setTimeout(() => setCopiedIndex(null), 2000);
      } else {
        setCopiedAll(true);
        setTimeout(() => setCopiedAll(false), 2000);
      }
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  return (
    <div className="card p-4 sm:p-6 w-full max-w-full">
      <h2 className="text-xl font-semibold mb-6">Title Generator</h2>
      <form onSubmit={handleGenerate} className="space-y-4">
        <div>
          <label className="block text-sm font-medium mb-2">Base Title</label>
          <input
            type="text"
            value={input.title}
            onChange={(e) => setInput({ ...input, title: e.target.value })}
            className="input w-full max-w-full"
            placeholder="Enter your base title idea"
            required
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-2">Keywords</label>
          <input
            type="text"
            value={input.keywords}
            onChange={(e) => setInput({ ...input, keywords: e.target.value })}
            className="input w-full max-w-full"
            placeholder="Enter target keywords (comma separated)"
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-2">Target Audience</label>
          <input
            type="text"
            value={input.audienceType}
            onChange={(e) => setInput({ ...input, audienceType: e.target.value })}
            className="input w-full max-w-full"
            placeholder="Describe your target audience"
            required
          />
        </div>
        <button type="submit" className="button button-primary w-full" disabled={loading}>
          {loading ? 'Generating...' : 'Generate Titles'}
        </button>
      </form>

      {titles.length > 0 && (
        <div className="mt-6 space-y-4">
          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-2">
            <h3 className="text-lg font-semibold">Generated Titles</h3>
            <button 
              className="button button-secondary relative"
              onClick={() => handleCopy(titles.join('\n'))}
            >
              <Copy className="w-4 h-4 mr-2" />
              {copiedAll ? 'Copied!' : 'Copy All'}
              {copiedAll && (
                <span className="absolute -top-8 right-0 bg-black text-white text-xs py-1 px-2 rounded">
                  Copied!
                </span>
              )}
            </button>
          </div>
          <div className="space-y-3 w-full max-w-full">
            {titles.map((title, index) => (
              <div key={index} className="flex items-start gap-2 sm:gap-4 p-3 sm:p-4 bg-accent/30 rounded-lg w-full max-w-full overflow-hidden">
                <Sparkles className="w-5 h-5 text-primary flex-shrink-0 mt-1" />
                <p className="flex-1">{title}</p>
                <button 
                  className="button button-secondary button-icon relative"
                  onClick={() => handleCopy(title, index)}
                >
                  <Copy className="w-4 h-4" />
                  {copiedIndex === index && (
                    <span className="absolute -top-8 right-0 bg-black text-white text-xs py-1 px-2 rounded">
                      Copied!
                    </span>
                  )}
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function DescriptionGenerator() {
  const [input, setInput] = useState({
    title: '',
    keywords: '',
    wordCount: '300'
  });
  const [loading, setLoading] = useState(false);
  const [description, setDescription] = useState('');
  const [copied, setCopied] = useState(false);

  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      const apiKey = await getApiKey();
      
      if (!apiKey) {
        throw new Error('OpenRouter API key not found');
      }
      
      const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json',
          'HTTP-Referer': window.location.origin,
          'X-Title': 'SmartTube AI'
        },
        body: JSON.stringify({
          model: 'deepseek/deepseek-r1-zero:free',
          temperature: 0.7,
          messages: [
            {
              role: 'user',
              content: `You are a YouTube SEO expert and content writer. Generate an SEO-optimized YouTube video description based on the following details:

Video Title: ${input.title}
Keywords: ${input.keywords}
Word Count: ${input.wordCount}

Instructions:
- Use the keywords naturally at least 3-5 times
- Keep the tone informative and engaging
- Include a strong hook in the first sentence
- Add a brief call-to-action near the end
- Keep it human-sounding, no robotic phrases
- Match the description length to the provided word count

Return only the final description.`
            }
          ]
        })
      });
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error('Error generating description:', errorText);
        throw new Error('Failed to generate description');
      }
      
      const data = await response.json();
      
      if (!data.choices || data.choices.length === 0) {
        throw new Error('No description received from the AI model');
      }
      
      // Extract description from the response
      let content = data.choices[0].message.content;
      
      // Remove formatting characters
      content = content.replace(/^\\boxed\{|```python|```|\[|\]|\}/g, '');
      
      // Process the content to extract description
      // Split by spaces or newlines
      const words = content
        .split(/[\s\n]+/)
        .filter((word: string) => word.trim().length > 0)
        .map((word: string) => {
          // Clean each word
          let cleaned = word.trim();
          // Remove quotes
          cleaned = cleaned.replace(/"|'/g, '');
          // Remove commas
          cleaned = cleaned.replace(/,/g, '');
          // Ensure it starts with only one #
          cleaned = cleaned.replace(/^#+/, '');
          cleaned = cleaned.replace(/^/, '#');
          return cleaned;
        });
      
      // Filter out any empty or invalid descriptions
      const validDescription = words.join(' ');
      
      if (validDescription.length > 0) {
        setDescription(validDescription);
      } else {
        setDescription("Couldn't generate the description. Please try again.");
      }
    } catch (error) {
      console.error('Failed to generate description:', error);
      setDescription("Couldn't generate the description. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(description);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  const handleDownload = () => {
    const blob = new Blob([description], { type: 'text/plain' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'video-description.txt';
    document.body.appendChild(a);
    a.click();
    window.URL.revokeObjectURL(url);
    document.body.removeChild(a);
  };

  return (
    <div className="card p-4 sm:p-6 w-full max-w-full">
      <h2 className="text-xl font-semibold mb-6">Description Generator</h2>
      <form onSubmit={handleGenerate} className="space-y-4">
        <div>
          <label className="block text-sm font-medium mb-2">Video Title</label>
          <input
            type="text"
            value={input.title}
            onChange={(e) => setInput({ ...input, title: e.target.value })}
            className="input w-full max-w-full"
            placeholder="Enter your video title"
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-2">Keywords</label>
          <input
            type="text"
            value={input.keywords}
            onChange={(e) => setInput({ ...input, keywords: e.target.value })}
            className="input w-full max-w-full"
            placeholder="Enter target keywords (comma separated)"
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-2">Word Count</label>
          <input
            type="number"
            value={input.wordCount}
            onChange={(e) => setInput({ ...input, wordCount: e.target.value })}
            className="input w-full max-w-full"
            placeholder="Enter desired word count"
          />
        </div>
        <button type="submit" className="button button-primary w-full" disabled={loading}>
          {loading ? 'Generating...' : 'Generate Description'}
        </button>
      </form>

      {description && (
        <div className="mt-6">
          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-2 mb-4">
            <h3 className="text-lg font-semibold">Generated Description</h3>
            <div className="flex gap-2 flex-wrap">
              <button 
                className="button button-secondary button-icon relative" 
                onClick={handleCopy}
                title="Copy to clipboard"
              >
                <Copy className="w-4 h-4" />
                {copied && (
                  <span className="absolute -top-8 right-0 bg-black text-white text-xs py-1 px-2 rounded">
                    Copied!
                  </span>
                )}
              </button>
              <button 
                className="button button-secondary button-icon"
                onClick={handleDownload}
                title="Download as text"
              >
                <FileDown className="w-4 h-4" />
              </button>
            </div>
          </div>
          <div className="bg-accent/30 rounded-lg p-3 sm:p-4 w-full max-w-full overflow-x-auto">
            <pre className="whitespace-pre-wrap font-mono text-xs sm:text-sm w-full max-w-full">
              {description}
            </pre>
          </div>
        </div>
      )}
    </div>
  );
}

function HashtagGenerator() {
  const [title, setTitle] = useState('');
  const [loading, setLoading] = useState(false);
  const [hashtags, setHashtags] = useState<string[]>([]);
  const [copied, setCopied] = useState(false);

  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      const apiKey = await getApiKey();
      
      if (!apiKey) {
        throw new Error('OpenRouter API key not found');
      }
      
      const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json',
          'HTTP-Referer': window.location.origin,
          'X-Title': 'SmartTube AI'
        },
        body: JSON.stringify({
          model: 'deepseek/deepseek-r1-zero:free',
          temperature: 0.7,
          messages: [
            {
              role: 'user',
              content: `You are a YouTube SEO expert. Based on the video title below, generate a list of the most relevant, trending, and high-engagement hashtags for YouTube SEO. Only return the list of hashtags.

Video Title: ${title}

Instructions:
- Provide 10 to 15 hashtags.
- Keep hashtags short and relevant.
- Include both general and niche-specific tags.
- Do not include explanations or text — just output the hashtags.`
            }
          ]
        })
      });
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error('Error generating hashtags:', errorText);
        throw new Error('Failed to generate hashtags');
      }
      
      const data = await response.json();
      
      if (!data.choices || data.choices.length === 0) {
        throw new Error('No hashtags received from the AI model');
      }
      
      // Extract hashtags from the response
      let content = data.choices[0].message.content;
      
      // Remove formatting characters and code blocks
      content = content.replace(/\\boxed\{|```python|```|\[|\]|\}/g, '');
      
      // Define a cleanHashtags function since we removed the import
      const cleanHashtags = (content: string): string[] => {
        return content
          .split(/[\s\n]+/)
          .filter((word: string) => word.trim().length > 0)
          .map((word: string) => {
            // Clean each word
            let cleaned = word.trim();
            // Remove quotes
            cleaned = cleaned.replace(/"|'/g, '');
            // Remove commas
            cleaned = cleaned.replace(/,/g, '');
            // Ensure it starts with only one #
            cleaned = cleaned.replace(/^#+/, '');
            cleaned = cleaned.replace(/^/, '#');
            return cleaned;
          })
          .filter((tag: string) => tag.length > 1);
      };
      
      // Process and clean the hashtags
      const validHashtags = cleanHashtags(content);
      
      if (validHashtags.length > 0) {
        setHashtags(validHashtags);
      } else {
        setHashtags(["#NoHashtagsGenerated"]);
      }
    } catch (error) {
      console.error('Failed to generate hashtags:', error);
      setHashtags(["Couldn't generate hashtags. Please try again."]);
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(hashtags.join(' '));
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  return (
    <div className="card p-4 sm:p-6 w-full max-w-full">
      <h2 className="text-xl font-semibold mb-6">Hashtag Generator</h2>
      <form onSubmit={handleGenerate} className="space-y-4">
        <div>
          <label className="block text-sm font-medium mb-2">Video Title</label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="input w-full max-w-full"
            placeholder="Enter your video title"
            required
          />
        </div>
        <button type="submit" className="button button-primary w-full" disabled={loading}>
          {loading ? 'Generating...' : 'Generate Hashtags'}
        </button>
      </form>

      {hashtags.length > 0 && (
        <div className="mt-6">
          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-2 mb-4">
            <h3 className="text-lg font-semibold">Generated Hashtags</h3>
            <button 
              className="button button-secondary relative"
              onClick={handleCopy}
            >
              <Copy className="w-4 h-4 mr-2" />
              {copied ? 'Copied!' : 'Copy All'}
              {copied && (
                <span className="absolute -top-8 right-0 bg-black text-white text-xs py-1 px-2 rounded">
                  Copied!
                </span>
              )}
            </button>
          </div>
          <div className="flex flex-wrap gap-2 w-full max-w-full">
            {hashtags.map((hashtag, index) => (
              <span key={index} className="px-3 py-1 bg-accent rounded-full text-sm">
                {hashtag}
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function KeywordIdeasGenerator() {
  const [topic, setTopic] = useState('');
  const [loading, setLoading] = useState(false);
  const [keywords, setKeywords] = useState<string[]>([]);
  const [copied, setCopied] = useState(false);

  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      const apiKey = await getApiKey();
      
      if (!apiKey) {
        throw new Error('OpenRouter API key not found');
      }
      
      const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json',
          'HTTP-Referer': window.location.origin,
          'X-Title': 'SmartTube AI'
        },
        body: JSON.stringify({
          model: 'deepseek/deepseek-r1-zero:free',
          temperature: 0.7,
          messages: [
            {
              role: 'user',
              content: `Act as a YouTube SEO expert. Based on the following video title, generate 10 to 15 SEO-optimized keyword suggestions that are relevant and rankable.

Video Title: ${topic}

Only return the list of keywords.`
            }
          ]
        })
      });
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error('Error generating keywords:', errorText);
        throw new Error('Failed to generate keywords');
      }
      
      const data = await response.json();
      
      if (!data.choices || data.choices.length === 0) {
        throw new Error('No keywords received from the AI model');
      }
      
      // Extract keywords from the response
      const content = data.choices[0].message.content;
      
      // Process the content to extract keywords
      // Remove formatting characters and split by newlines or commas
      let cleanContent = content;
      
      // Remove \boxed{, [, ], } and other formatting
      cleanContent = cleanContent.replace(/^\\boxed\{\s*/i, '');
      cleanContent = cleanContent.replace(/^\s*\[\s*/i, '');
      cleanContent = cleanContent.replace(/\s*\]\s*$/i, '');
      cleanContent = cleanContent.replace(/\s*\}\s*$/i, '');
      
      // Remove the first two lines and last two lines if they contain formatting
      const contentLines = cleanContent.split('\n');
      let startIndex = 0;
      let endIndex = contentLines.length;
      
      // Skip first two lines if they contain formatting characters
      if (contentLines.length > 2) {
        if (contentLines[0].match(/\\boxed|\[|\]/)) startIndex = 1;
        if (contentLines[1].match(/\\boxed|\[|\]/)) startIndex = 2;
      }
      
      // Skip last two lines if they contain formatting characters
      if (contentLines.length > 2) {
        if (contentLines[contentLines.length - 1].match(/\}|\]/)) endIndex = contentLines.length - 1;
        if (contentLines.length > 3 && contentLines[contentLines.length - 2].match(/\}|\]/)) endIndex = contentLines.length - 2;
      }
      
      // Get the clean content lines
      const cleanLines = contentLines.slice(startIndex, endIndex);
      
      const extractedKeywords = cleanLines.join('\n')
        .split(/[\n,]+/)
        .map((keyword: string) => keyword.trim())
        .filter((keyword: string) => {
          // Filter out empty lines and formatting characters
          return keyword.length > 0 && 
                 !keyword.includes('\\boxed{') && 
                 !keyword.match(/^\s*\[\s*$/) && 
                 !keyword.match(/^\s*\]\s*$/) && 
                 !keyword.match(/^\s*\}\s*$/);
        });
      
      if (extractedKeywords.length > 0) {
        setKeywords(extractedKeywords);
      } else {
        setKeywords(['No keywords generated. Please try again with a different title.']);
      }
    } catch (error) {
      console.error('Failed to generate keywords:', error);
      setKeywords(['Failed to generate keywords. Please try again.']);
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(keywords.join('\n'));
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  return (
    <div className="card p-4 sm:p-6 w-full max-w-full">
      <h2 className="text-xl font-semibold mb-6">Keyword Ideas Generator</h2>
      <form onSubmit={handleGenerate} className="space-y-4">
        <div>
          <label className="block text-sm font-medium mb-2">Topic or Niche</label>
          <input
            type="text"
            value={topic}
            onChange={(e) => setTopic(e.target.value)}
            className="input w-full max-w-full"
            placeholder="Enter your video topic or niche"
            required
          />
        </div>
        <button type="submit" className="button button-primary w-full" disabled={loading}>
          {loading ? 'Generating...' : 'Generate Keyword Ideas'}
        </button>
      </form>

      {keywords.length > 0 && (
        <div className="mt-6">
          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-2 mb-4">
            <h3 className="text-lg font-semibold">Keyword Ideas</h3>
            <button 
              className="button button-secondary relative"
              onClick={handleCopy}
            >
              <Copy className="w-4 h-4 mr-2" />
              {copied ? 'Copied!' : 'Copy All'}
              {copied && (
                <span className="absolute -top-8 right-0 bg-black text-white text-xs py-1 px-2 rounded">
                  Copied!
                </span>
              )}
            </button>
          </div>
          <div className="space-y-2">
            {keywords.map((keyword, index) => (
              <div key={index} className="flex items-start gap-4 p-3 bg-accent/30 rounded-lg">
                <Search className="w-5 h-5 text-primary flex-shrink-0 mt-1" />
                <p className="flex-1">{keyword}</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function VideoHookGenerator() {
  const [input, setInput] = useState({
    topic: '',
    contentType: 'Tutorial' // Default content type
  });
  const [loading, setLoading] = useState(false);
  const [hooks, setHooks] = useState<string[]>([]);
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);

  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      const apiKey = await getApiKey();
      
      if (!apiKey) {
        throw new Error('OpenRouter API key not found');
      }
      
      const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json',
          'HTTP-Referer': window.location.origin,
          'X-Title': 'SmartTube AI'
        },
        body: JSON.stringify({
          model: 'deepseek/deepseek-r1-zero:free',
          temperature: 0.7,
          messages: [
            {
              role: 'user',
              content: `You are a professional YouTube content strategist. Based on the video title and content type provided below, generate 2–3 short, high-engagement hook lines to start the video. Keep it natural and avoid robotic tone.

Video Title: ${input.topic}
Content Type: ${input.contentType}

Only return the hooks.`
            }
          ]
        })
      });
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error('Error generating hooks:', errorText);
        throw new Error('Failed to generate hooks');
      }
      
      const data = await response.json();
      
      if (!data.choices || data.choices.length === 0) {
        throw new Error('No hooks received from the AI model');
      }
      
      // Extract hooks from the response
      const content = data.choices[0].message.content;
      
      // Process the content to extract hooks
      // Remove formatting characters and split by newlines
      let cleanContent = content;
      
      // Remove \boxed{ and } formatting
      cleanContent = cleanContent.replace(/^\\boxed\{\s*/i, '');
      cleanContent = cleanContent.replace(/\s*\}\s*$/i, '');
      
      // Remove the first line and last line if they contain formatting
      const contentLines = cleanContent.split('\n');
      let startIndex = 0;
      let endIndex = contentLines.length;
      
      // Skip first line if it contains formatting characters
      if (contentLines.length > 1 && contentLines[0].match(/\\boxed|\{/)) {
        startIndex = 1;
      }
      
      // Skip last line if it contains formatting characters
      if (contentLines.length > 1 && contentLines[contentLines.length - 1].match(/\}/)) {
        endIndex = contentLines.length - 1;
      }
      
      // Get the clean content lines
      const cleanLines = contentLines.slice(startIndex, endIndex);
      
      const extractedHooks = cleanLines.join('\n')
        .split(/\n+/)
        .map((hook: string) => hook.trim())
        .filter((hook: string) => {
          // Filter out empty lines and formatting characters
          return hook.length > 0 && 
                 !hook.includes('\\boxed{') && 
                 !hook.match(/^\s*\}\s*$/);
        })
        // Remove numbering if present (e.g., "1. Hook text" -> "Hook text")
        .map((hook: string) => hook.replace(/^\d+\.\s*/, ''));
      
      if (extractedHooks.length > 0) {
        setHooks(extractedHooks);
      } else {
        setHooks(['No hooks generated. Please try again with a different title.']);
      }
    } catch (error) {
      console.error('Failed to generate hooks:', error);
      setHooks(['Failed to generate hooks. Please try again.']);
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = async (text: string, index: number) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedIndex(index);
      setTimeout(() => setCopiedIndex(null), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  return (
    <div className="card p-4 sm:p-6 w-full max-w-full">
      <h2 className="text-xl font-semibold mb-6">Video Hook Generator</h2>
      <form onSubmit={handleGenerate} className="space-y-4">
        <div>
          <label className="block text-sm font-medium mb-2">Video Topic</label>
          <input
            type="text"
            value={input.topic}
            onChange={(e) => setInput({ ...input, topic: e.target.value })}
            className="input w-full max-w-full"
            placeholder="What is your video about?"
            required
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-2">Content Type</label>
          <select
            value={input.contentType}
            onChange={(e) => setInput({ ...input, contentType: e.target.value })}
            className="input w-full max-w-full"
            required
          >
            <option value="Informative">Informative</option>
            <option value="Tutorial">Tutorial</option>
            <option value="Entertainment">Entertainment</option>
            <option value="Review">Review</option>
            <option value="Vlog">Vlog</option>
            <option value="Educational">Educational</option>
            <option value="Gaming">Gaming</option>
            <option value="Tech">Tech</option>
            <option value="Lifestyle">Lifestyle</option>
            <option value="Comedy">Comedy</option>
            <option value="Storytelling">Storytelling</option>
          </select>
        </div>
        <button type="submit" className="button button-primary w-full" disabled={loading}>
          {loading ? 'Generating...' : 'Generate Hooks'}
        </button>
      </form>

      {hooks.length > 0 && (
        <div className="mt-6 space-y-4">
          <h3 className="text-lg font-semibold">Generated Hooks</h3>
          <div className="space-y-3 w-full max-w-full">
            {hooks.map((hook, index) => (
              <div key={index} className="flex items-start gap-2 sm:gap-4 p-3 sm:p-4 bg-accent/30 rounded-lg w-full max-w-full overflow-hidden">
                <Zap className="w-5 h-5 text-primary flex-shrink-0 mt-1" />
                <p className="flex-1">{hook}</p>
                <button 
                  className="button button-secondary button-icon relative"
                  onClick={() => handleCopy(hook, index)}
                >
                  <Copy className="w-4 h-4" />
                  {copiedIndex === index && (
                    <span className="absolute -top-8 right-0 bg-black text-white text-xs py-1 px-2 rounded">
                      Copied!
                    </span>
                  )}
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function TitleABTester() {
  const [titleA, setTitleA] = useState('');
  const [titleB, setTitleB] = useState('');
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<any>(null);

  const handleTest = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      const apiKey = await getApiKey();
      
      if (!apiKey) {
        throw new Error('OpenRouter API key not found');
      }
      
      const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json',
          'HTTP-Referer': window.location.origin,
          'X-Title': 'SmartTube AI'
        },
        body: JSON.stringify({
          model: 'deepseek/deepseek-r1-zero:free',
          temperature: 0.7,
          messages: [
            {
              role: 'user',
              content: `Act like a YouTube growth expert and SEO strategist. Analyze the two video titles below and determine which one is more effective for YouTube search visibility and click-through rate. Briefly explain why.

Title A: ${titleA}
Title B: ${titleB}

Return your answer in this format:

Best Title: [A or B]
Reason: [Explain briefly]`
            }
          ]
        })
      });
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error('Error analyzing titles:', errorText);
        throw new Error('Failed to analyze titles');
      }
      
      const data = await response.json();
      
      if (!data.choices || data.choices.length === 0) {
        throw new Error('No analysis received from the AI model');
      }
      
      // Extract analysis from the response
      const content = data.choices[0].message.content;
      
      // Parse the response to extract the winner and reason
      const bestTitleMatch = content.match(/Best Title:\s*([AB])/i);
      const reasonMatch = content.match(/Reason:\s*(.+?)(?:\n|$)/is);
      
      // Default to 'A' if no match is found
      const winner = bestTitleMatch ? bestTitleMatch[1] : 'A';
      const reason = reasonMatch ? reasonMatch[1].trim() : 'Analysis not available. Please try again.';
      
      // Generate scores that total to exactly 100%
      // Score between 60-80 for the winner
      const winnerScore = Math.floor(Math.random() * 20) + 60;
      // Loser gets the remaining percentage to total 100%
      const loserScore = 100 - winnerScore;
      
      // Generate feedback points based on the reason
      const feedback = [];
      
      // Add the main reason as a positive point for the winner
      feedback.push({ title: winner, point: reason, positive: true });
      
      // Add some generic feedback points
      if (winner === 'A') {
        feedback.push({ title: 'A', point: 'More likely to attract clicks', positive: true });
        feedback.push({ title: 'B', point: 'Could be improved for better CTR', positive: false });
      } else {
        feedback.push({ title: 'B', point: 'More likely to attract clicks', positive: true });
        feedback.push({ title: 'A', point: 'Could be improved for better CTR', positive: false });
      }
      
      // Add length feedback
      if (titleA.length > 60) {
        feedback.push({ title: 'A', point: 'Length may cause truncation in search results', positive: false });
      }
      if (titleB.length > 60) {
        feedback.push({ title: 'B', point: 'Length may cause truncation in search results', positive: false });
      }
      
      // Set the results
      setResults({
        winner,
        scores: {
          titleA: winner === 'A' ? winnerScore : loserScore,
          titleB: winner === 'B' ? winnerScore : loserScore
        },
        feedback
      });
    } catch (error) {
      console.error('Failed to analyze titles:', error);
      setResults(null);
      alert('Failed to analyze titles. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="card p-4 sm:p-6 w-full max-w-full">
      <h2 className="text-xl font-semibold mb-6">Title A/B Tester</h2>
      <form onSubmit={handleTest} className="space-y-4">
        <div>
          <label className="block text-sm font-medium mb-2">Title A</label>
          <input
            type="text"
            value={titleA}
            onChange={(e) => setTitleA(e.target.value)}
            className="input w-full max-w-full"
            placeholder="Enter first title option"
            required
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-2">Title B</label>
          <input
            type="text"
            value={titleB}
            onChange={(e) => setTitleB(e.target.value)}
            className="input w-full max-w-full"
            placeholder="Enter second title option"
            required
          />
        </div>
        <button type="submit" className="button button-primary w-full" disabled={loading}>
          {loading ? 'Analyzing...' : 'Compare Titles'}
        </button>
      </form>

      {results && (
        <div className="mt-6 space-y-4">
          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-2">
            <h3 className="text-lg font-semibold">Analysis Results</h3>
            <div className="text-sm font-medium">
              <span className="text-green-500 font-semibold">Title {results.winner} performs better</span>
            </div>
          </div>
          
          <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className={`p-4 rounded-lg ${results.winner === 'A' ? 'bg-green-900/20 border border-green-500/50' : 'bg-slate-800/50 border border-slate-700'}`}>
              <h3 className="text-lg font-medium mb-2 flex items-center">
                Title A
              </h3>
              <p className="mb-4 text-sm text-slate-300">{titleA}</p>
              <div className="h-2 w-full bg-slate-700 rounded-full overflow-hidden">
                <div 
                  className={`h-full ${results.winner === 'A' ? 'bg-green-500' : 'bg-slate-500'}`}
                  style={{ width: `${results.scores.titleA}%` }}
                ></div>
              </div>
              <p className="mt-1 text-right text-sm">{results.scores.titleA}%</p>
            </div>
            
            <div className={`p-4 rounded-lg ${results.winner === 'B' ? 'bg-green-900/20 border border-green-500/50' : 'bg-slate-800/50 border border-slate-700'}`}>
              <h3 className="text-lg font-medium mb-2 flex items-center">
                Title B
              </h3>
              <p className="mb-4 text-sm text-slate-300">{titleB}</p>
              <div className="h-2 w-full bg-slate-700 rounded-full overflow-hidden">
                <div 
                  className={`h-full ${results.winner === 'B' ? 'bg-green-500' : 'bg-slate-500'}`}
                  style={{ width: `${results.scores.titleB}%` }}
                ></div>
              </div>
              <p className="mt-1 text-right text-sm">{results.scores.titleB}%</p>
            </div>
          </div>
          
          <div className="mt-6">
            <h4 className="font-medium mb-3">Detailed Feedback</h4>
            <div className="space-y-2">
              {results.feedback.map((item: any, index: number) => (
                <div key={index} className="flex items-start gap-3 p-3 bg-accent/20 rounded-lg">
                  <div className={`w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 ${item.title === 'A' ? 'bg-blue-100 text-blue-600' : 'bg-purple-100 text-purple-600'}`}>
                    {item.title}
                  </div>
                  <div className="flex-1">
                    <p className="text-sm">{item.point}</p>
                  </div>
                  <div className={`w-5 h-5 rounded-full flex items-center justify-center ${item.positive ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'}`}>
                    {item.positive ? '+' : '-'}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function DescriptionOptimizer() {
  const [currentDescription, setCurrentDescription] = useState('');
  const [keywords, setKeywords] = useState('');
  const [loading, setLoading] = useState(false);
  const [optimizedDescription, setOptimizedDescription] = useState('');
  const [copied, setCopied] = useState(false);

  const handleOptimize = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      const apiKey = await getApiKey();
      
      if (!apiKey) {
        throw new Error('OpenRouter API key not found');
      }
      
      const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json',
          'HTTP-Referer': window.location.origin,
          'X-Title': 'SmartTube AI'
        },
        body: JSON.stringify({
          model: 'deepseek/deepseek-r1-zero:free',
          temperature: 0.7,
          messages: [
            {
              role: 'user',
              content: `You are an expert in YouTube SEO optimization. Based on the current video description and provided keywords, improve the description to make it more SEO-friendly, natural, and engaging. Use the keywords at least 3–5 times.

Current Description:
${currentDescription}

Keywords:
${keywords}

Return the optimized description only.`
            }
          ]
        })
      });
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error('Error optimizing description:', errorText);
        throw new Error('Failed to optimize description');
      }
      
      const data = await response.json();
      
      if (!data.choices || data.choices.length === 0) {
        throw new Error('No optimized description received from the AI model');
      }
      
      // Extract optimized description from the response
      let content = data.choices[0].message.content;
      
      // Remove formatting characters if present
      content = content.replace(/^\\boxed\{\s*```markdown\s*/i, '');
      content = content.replace(/^\\boxed\{\s*```text\s*/i, '');
      content = content.replace(/```\s*\}\s*$/i, '');
      content = content.replace(/^```markdown\s*/i, '');
      content = content.replace(/^```text\s*/i, '');
      content = content.replace(/```\s*$/i, '');
      content = content.replace(/^\\boxed\{\s*/i, '');
      content = content.replace(/\}\s*$/i, '');
      
      setOptimizedDescription(content);
    } catch (error) {
      console.error('Failed to optimize description:', error);
      setOptimizedDescription("Couldn't optimize the description. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(optimizedDescription);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  return (
    <div className="card p-4 sm:p-6 w-full max-w-full">
      <h2 className="text-xl font-semibold mb-6">Description Optimizer</h2>
      <form onSubmit={handleOptimize} className="space-y-4">
        <div>
          <label className="block text-sm font-medium mb-2">Current Description</label>
          <textarea
            value={currentDescription}
            onChange={(e) => setCurrentDescription(e.target.value)}
            className="input w-full max-w-full min-h-[120px]"
            placeholder="Paste your current video description here"
            required
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-2">Target Keywords (comma separated)</label>
          <input
            type="text"
            value={keywords}
            onChange={(e) => setKeywords(e.target.value)}
            className="input w-full max-w-full"
            placeholder="Enter keywords to include in the optimized description"
            required
          />
        </div>
        <button type="submit" className="button button-primary w-full" disabled={loading}>
          {loading ? 'Optimizing...' : 'Optimize Description'}
        </button>
      </form>

      {optimizedDescription && (
        <div className="mt-6">
          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-2 mb-4">
            <h3 className="text-lg font-semibold">Optimized Description</h3>
            <div className="flex gap-2 flex-wrap">
              <button 
                className="button button-secondary button-icon relative" 
                onClick={handleCopy}
                title="Copy to clipboard"
              >
                <Copy className="w-4 h-4" />
                {copied && (
                  <span className="absolute -top-8 right-0 bg-black text-white text-xs py-1 px-2 rounded">
                    Copied!
                  </span>
                )}
              </button>
              <button 
                className="button button-secondary button-icon"
                onClick={() => {
                  const blob = new Blob([optimizedDescription], { type: 'text/plain' });
                  const url = window.URL.createObjectURL(blob);
                  const a = document.createElement('a');
                  a.href = url;
                  a.download = 'optimized-description.txt';
                  document.body.appendChild(a);
                  a.click();
                  window.URL.revokeObjectURL(url);
                  document.body.removeChild(a);
                }}
                title="Download as text"
              >
                <FileDown className="w-4 h-4" />
              </button>
            </div>
          </div>
          <div className="bg-accent/30 rounded-lg p-3 sm:p-4 w-full max-w-full overflow-x-auto">
            <pre className="whitespace-pre-wrap font-mono text-xs sm:text-sm w-full max-w-full">
              {optimizedDescription}
            </pre>
          </div>
        </div>
      )}
    </div>
  );
}

export default function AiSeoTools() {
  const [activeTab, setActiveTab] = useState('titles');

  const tabs = [
    { id: 'titles', label: 'Title Generator', icon: Type },
    { id: 'description', label: 'Description Generator', icon: AlignLeft },
    { id: 'hashtags', label: 'Hashtag Generator', icon: Hash },
    { id: 'keywords', label: 'Keyword Ideas', icon: Search },
    { id: 'hooks', label: 'Video Hook Generator', icon: Zap },
    { id: 'abtester', label: 'Title A/B Tester', icon: BarChart2 },
    { id: 'descoptimizer', label: 'Description Optimizer', icon: FileText }
  ];

  const renderContent = () => {
    switch (activeTab) {
      case 'titles':
        return <TitleGenerator />;
      case 'description':
        return <DescriptionGenerator />;
      case 'hashtags':
        return <HashtagGenerator />;
      case 'keywords':
        return <KeywordIdeasGenerator />;
      case 'hooks':
        return <VideoHookGenerator />;
      case 'abtester':
        return <TitleABTester />;
      case 'descoptimizer':
        return <DescriptionOptimizer />;
      default:
        return <TitleGenerator />;
    }
  };

  return (
    <div className="flex flex-col items-center w-full">
      {/* Horizontal scrollable tab section */}
      <div className="w-full sticky top-0 z-10 px-4 py-6 bg-[#030C20] backdrop-blur-sm border-b border-accent/20 rounded-lg border border-primary/40 mb-6">
        <div className="max-w-4xl mx-auto">
          <div className="flex overflow-x-auto gap-3 pb-1 px-3 py-3 bg-[#020817] rounded-lg border border-primary/30 shadow-inner custom-scrollbar mb-4 mt-2">

            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`button ${
                  activeTab === tab.id ? 'button-primary bg-[#030C20]' : 'button-secondary bg-[#030C20]'
                } whitespace-nowrap flex-shrink-0 transition-all shadow-md hover:shadow-lg mx-1 border border-white/20`}
              >
                <tab.icon className="w-4 h-4 mr-2" />
                <span className="hidden sm:inline">{tab.label}</span>
                <span className="sm:hidden">{tab.label.split(' ')[0]}</span>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Fixed-width responsive tool container */}
      <div className="w-full max-w-4xl mx-auto px-4 py-6 overflow-visible mt-4">
        <div className="w-full overflow-y-auto overflow-x-hidden rounded-lg border border-accent/20 shadow-lg bg-[#030C20]">

          {renderContent()}
        </div>
      </div>
    </div>
  );
}