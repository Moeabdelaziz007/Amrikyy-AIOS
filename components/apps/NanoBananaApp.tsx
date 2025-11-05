import React, { useState } from 'react';
import { SparklesIcon } from '../Icons';
import { useGemini } from '../../services/geminiService';

const NanoBananaApp: React.FC = () => {
  const [prompt, setPrompt] = useState('');
  const [pattern, setPattern] = useState<string>('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [selectedStyle, setSelectedStyle] = useState<'geometric' | 'fractal' | 'abstract' | 'mandala'>('geometric');
  const [colors, setColors] = useState(['#FFD700', '#FF6B6B', '#4ECDC4', '#45B7D1', '#A8E6CF']);
  const { generateText } = useGemini();

  const styles = [
    { id: 'geometric', name: 'Geometric', icon: '⬡' },
    { id: 'fractal', name: 'Fractal', icon: '❋' },
    { id: 'abstract', name: 'Abstract', icon: '∿' },
    { id: 'mandala', name: 'Mandala', icon: '✦' }
  ];

  const generatePattern = async () => {
    if (!prompt.trim()) return;
    
    setIsGenerating(true);
    try {
      const artPrompt = `Create a simple SVG pattern description for ${selectedStyle} art based on: "${prompt}". Keep it minimal and elegant. Only describe the visual elements, shapes, and arrangement.`;
      const description = await generateText(artPrompt);
      setPattern(description);
    } catch (error) {
      console.error('Failed to generate pattern:', error);
    } finally {
      setIsGenerating(false);
    }
  };

  const generateSVGPattern = () => {
    const size = 400;
    const elements = [];
    
    for (let i = 0; i < 8; i++) {
      const x = (i % 4) * 100 + 50;
      const y = Math.floor(i / 4) * 200 + 50;
      const color = colors[i % colors.length];
      
      if (selectedStyle === 'geometric') {
        elements.push(`<rect x="${x - 30}" y="${y - 30}" width="60" height="60" fill="${color}" opacity="0.7" transform="rotate(${i * 15} ${x} ${y})" />`);
      } else if (selectedStyle === 'fractal') {
        elements.push(`<circle cx="${x}" cy="${y}" r="${30 - i * 2}" fill="none" stroke="${color}" stroke-width="2" />`);
      } else if (selectedStyle === 'abstract') {
        elements.push(`<path d="M ${x} ${y} Q ${x + 40} ${y + 20} ${x + 20} ${y + 40}" stroke="${color}" stroke-width="3" fill="none" />`);
      } else {
        elements.push(`<polygon points="${x},${y - 30} ${x + 20},${y} ${x},${y + 30} ${x - 20},${y}" fill="${color}" opacity="0.6" />`);
      }
    }
    
    return `<svg width="${size}" height="${size}" xmlns="http://www.w3.org/2000/svg">${elements.join('')}</svg>`;
  };

  return (
    <div className="h-full w-full flex flex-col bg-bg-tertiary rounded-b-md text-white overflow-hidden">
      <div className="p-4 border-b border-white/10">
        <div className="flex items-center gap-2 mb-4">
          <SparklesIcon className="w-6 h-6 text-yellow-400" />
          <h1 className="font-display text-xl font-bold">NanoBanana</h1>
          <span className="text-xs text-yellow-400">AI Pattern Generator</span>
        </div>

        <div className="flex gap-2 mb-3">
          {styles.map((style) => (
            <button
              key={style.id}
              onClick={() => setSelectedStyle(style.id as any)}
              className={`px-3 py-2 rounded-lg text-sm ${
                selectedStyle === style.id
                  ? 'bg-yellow-400 text-black'
                  : 'bg-white/5 hover:bg-white/10'
              }`}
            >
              {style.icon} {style.name}
            </button>
          ))}
        </div>

        <div className="flex gap-2">
          <input
            type="text"
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder="Describe your pattern... (e.g., 'sunset waves', 'cosmic energy')"
            className="flex-1 px-3 py-2 bg-black/20 border border-white/10 rounded-lg text-sm"
            onKeyPress={(e) => e.key === 'Enter' && generatePattern()}
          />
          <button
            onClick={generatePattern}
            disabled={isGenerating || !prompt.trim()}
            className="px-4 py-2 bg-yellow-400 text-black rounded-lg hover:bg-yellow-500 disabled:opacity-50 disabled:cursor-not-allowed text-sm font-semibold"
          >
            {isGenerating ? 'Generating...' : 'Generate'}
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-6">
        <div className="max-w-2xl mx-auto">
          <div className="bg-black/20 rounded-lg p-6 border border-white/10 mb-4">
            <div className="flex justify-center items-center min-h-[400px]">
              {pattern ? (
                <div dangerouslySetInnerHTML={{ __html: generateSVGPattern() }} />
              ) : (
                <div className="text-center text-text-secondary">
                  <SparklesIcon className="w-12 h-12 mx-auto mb-3 text-yellow-400/30" />
                  <p>Enter a prompt and click Generate to create nano-scale art</p>
                </div>
              )}
            </div>
          </div>

          {pattern && (
            <div className="bg-black/20 rounded-lg p-4 border border-white/10">
              <h3 className="text-sm font-semibold mb-2 text-yellow-400">AI Description:</h3>
              <p className="text-sm text-text-secondary">{pattern}</p>
              <div className="mt-3 flex gap-2">
                <button className="px-3 py-1 bg-white/5 hover:bg-white/10 rounded text-sm">
                  Export SVG
                </button>
                <button className="px-3 py-1 bg-white/5 hover:bg-white/10 rounded text-sm">
                  Export PNG
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default NanoBananaApp;
