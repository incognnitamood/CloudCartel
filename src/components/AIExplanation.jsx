import React from 'react';
import { Sparkles } from 'lucide-react';

const AIExplanation = ({ explanation, hasError }) => {
  // Debug logging
  if (!explanation) {
    console.warn('AIExplanation: No explanation provided');
  }

  const formatExplanation = (text) => {
    if (!text) {
      console.warn('formatExplanation: Empty text provided');
      return <p className="text-slate-400 italic">No explanation available</p>;
    }
    
    const lines = text.split('\n');
    const formatted = [];
    
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      
      // Format section headers (## Header)
      if (line.startsWith('## ')) {
        formatted.push(
          <h4 key={i} className="font-bold text-purple-300 mt-4 mb-2 text-base first:mt-0">
            {line.replace('## ', '')}
          </h4>
        );
      }
      // Format step headers (### Step)
      else if (line.startsWith('### ')) {
        formatted.push(
          <h5 key={i} className="font-semibold text-blue-300 mt-3 mb-1.5 text-sm">
            {line.replace('### ', '')}
          </h5>
        );
      }
      // Format list items
      else if (line.trim().startsWith('- ') || line.trim().startsWith('• ')) {
        const content = line.replace(/^[-•]\s*/, '').trim();
        formatted.push(
          <div key={i} className="ml-4 mb-1.5 text-slate-200 flex items-start">
            <span className="text-purple-400 mr-2">•</span>
            <span>{content}</span>
          </div>
        );
      }
      // Format connection paths (e.g., "Client → CDN → Storage")
      else if (line.includes('→') || line.includes('->')) {
        formatted.push(
          <div key={i} className="ml-4 mb-2 text-blue-200 font-mono text-xs bg-slate-800/50 p-2 rounded border border-blue-500/30">
            {line.trim()}
          </div>
        );
      }
      // Regular paragraph
      else if (line.trim()) {
        formatted.push(
          <p key={i} className="mb-2 text-slate-100 leading-relaxed">
            {line.trim()}
          </p>
        );
      }
      // Empty line (only add if previous line wasn't empty)
      else if (formatted.length > 0 && formatted[formatted.length - 1].type !== 'br') {
        formatted.push(<br key={i} />);
      }
    }
    
    return formatted;
  };

  return (
    <div
      className={`
        relative rounded-lg p-4 shadow-lg
        ${
          hasError
            ? 'bg-yellow-900/20 border border-yellow-700/50'
            : 'bg-gradient-to-br from-purple-600/20 via-blue-600/20 to-purple-700/20 border border-purple-500/30'
        }
      `}
    >
      {!hasError && (
        <div className="absolute top-3 right-3">
          <Sparkles className="w-5 h-5 text-purple-400 animate-pulse" />
        </div>
      )}
      <div
        className={`text-sm leading-relaxed break-words ${
          hasError ? 'text-yellow-200' : 'text-white'
        }`}
        style={{ wordBreak: 'break-word', overflowWrap: 'break-word' }}
      >
        {hasError ? (
          <div>
            <div className="font-semibold mb-2 text-yellow-300">⚠️ Fallback Mode</div>
            <div className="ai-explanation-content">
              {formatExplanation(explanation)}
            </div>
          </div>
        ) : (
          <div className="ai-explanation-content">
            {formatExplanation(explanation)}
          </div>
        )}
      </div>
    </div>
  );
};

export default AIExplanation;

