import React, { useState } from 'react';
import { Copy, Download, FileDown, AlertCircle, Loader2 } from 'lucide-react';
import { generateScript } from '../lib/openrouter';

export default function ScriptingSection() {
  const contentTypes = [
    'Informative',
    'Tutorial',
    'Entertainment',
    'Review',
    'Vlog',
    'Educational',
    'Gaming',
    'Tech',
    'Lifestyle',
    'Comedy'
  ];

  const [scriptData, setScriptData] = useState({
    title: '',
    keywords: '',
    audienceType: '',
    videoLength: '',
    contentType: contentTypes[0]
  });

  const [generatedScript, setGeneratedScript] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setScriptData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleGenerateScript = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    
    try {
      // Validate required fields
      if (!scriptData.title || !scriptData.keywords || !scriptData.audienceType || !scriptData.videoLength) {
        throw new Error('Please fill in all required fields');
      }
      
      // Call the OpenRouter API
      const result = await generateScript(
        scriptData.title,
        scriptData.keywords,
        scriptData.audienceType,
        scriptData.videoLength,
        scriptData.contentType
      );
      
      setGeneratedScript(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to generate script. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <div className="card p-6">
        <h2 className="text-xl font-semibold mb-6">Generate Video Script</h2>
        <form onSubmit={handleGenerateScript} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2">Video Title</label>
            <input
              type="text"
              name="title"
              value={scriptData.title}
              onChange={handleInputChange}
              className="input"
              placeholder="Enter your video title"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium mb-2">Keywords</label>
            <input
              type="text"
              name="keywords"
              value={scriptData.keywords}
              onChange={handleInputChange}
              className="input"
              placeholder="Enter keywords (comma separated)"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Target Audience</label>
            <input
              type="text"
              name="audienceType"
              value={scriptData.audienceType}
              onChange={handleInputChange}
              className="input"
              placeholder="Describe your target audience"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Video Length (minutes)</label>
            <input
              type="number"
              name="videoLength"
              value={scriptData.videoLength}
              onChange={handleInputChange}
              className="input"
              placeholder="Enter desired video length"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Content Type</label>
            <select
              name="contentType"
              value={scriptData.contentType}
              onChange={handleInputChange}
              className="input"
            >
              {contentTypes.map(type => (
                <option key={type} value={type}>{type}</option>
              ))}
            </select>
          </div>

          <button 
            type="submit" 
            className="button button-primary w-full flex items-center justify-center" 
            disabled={isLoading}
          >
            {isLoading ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Generating...
              </>
            ) : (
              'Generate Script'
            )}
          </button>
        </form>
      </div>

      <div className="card p-6">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-semibold">Generated Script</h2>
          <div className="flex gap-2">
            <button 
              className="button button-secondary button-icon" 
              title="Copy to clipboard"
              onClick={() => {
                if (generatedScript) {
                  navigator.clipboard.writeText(generatedScript);
                }
              }}
              disabled={!generatedScript}
            >
              <Copy className="w-4 h-4" />
            </button>
            <button 
              className="button button-secondary button-icon" 
              title="Download as text"
              onClick={() => {
                if (generatedScript) {
                  const blob = new Blob([generatedScript], { type: 'text/plain' });
                  const url = URL.createObjectURL(blob);
                  const a = document.createElement('a');
                  a.href = url;
                  a.download = `${scriptData.title.replace(/\s+/g, '-').toLowerCase()}-script.txt`;
                  document.body.appendChild(a);
                  a.click();
                  document.body.removeChild(a);
                  URL.revokeObjectURL(url);
                }
              }}
              disabled={!generatedScript}
            >
              <FileDown className="w-4 h-4" />
            </button>
            <button 
              className="button button-secondary button-icon" 
              title="Download as PDF"
              onClick={() => {
                // PDF download functionality would require a PDF library
                // This is a placeholder for future implementation
                alert('PDF download functionality coming soon!');
              }}
              disabled={!generatedScript}
            >
              <Download className="w-4 h-4" />
            </button>
          </div>
        </div>
        <div className="bg-accent/30 rounded-lg p-4">
          {error ? (
            <div className="flex items-center gap-2 text-red-500 bg-red-500/10 p-4 rounded-lg">
              <AlertCircle className="w-5 h-5" />
              <p>{error}</p>
            </div>
          ) : isLoading ? (
            <div className="flex flex-col items-center justify-center py-8">
              <Loader2 className="w-8 h-8 animate-spin text-primary mb-2" />
              <p className="text-muted-foreground">Generating your script...</p>
            </div>
          ) : generatedScript ? (
            <pre className="whitespace-pre-wrap font-mono text-sm">
              {generatedScript}
            </pre>
          ) : (
            <p className="text-muted-foreground text-center py-8">
              Generated script will appear here...
            </p>
          )}
        </div>
      </div>
    </div>
  );
}