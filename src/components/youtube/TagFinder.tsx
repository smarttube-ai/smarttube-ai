import React from 'react';
import { Copy } from 'lucide-react';

interface Props {
  suggestedTags: string[];
}

export default function TagFinder({ suggestedTags }: Props) {
  if (!suggestedTags.length) return null;

  return (
    <div className="space-y-6">
      <div className="card p-6">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-xl font-semibold">Suggested Tags</h3>
          <button className="button button-secondary">
            <Copy className="w-4 h-4 mr-2" />
            Copy All
          </button>
        </div>
        <div className="flex flex-wrap gap-3">
          {suggestedTags.map((tag, index) => (
            <div key={index} className="flex items-center gap-2 px-3 py-2 bg-accent/30 rounded-full">
              <span className="text-sm">{tag}</span>
              <button className="p-1 hover:bg-accent rounded-full">
                <Copy className="w-4 h-4" />
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}