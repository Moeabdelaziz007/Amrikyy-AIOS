import React, { useState, useRef } from 'react';
import { SparklesIcon } from '../Icons.tsx';
import { geminiService } from '../../packages/ai/src/index.ts';

const NanoBananaApp: React.FC = () => {
  const [prompt, setPrompt] = useState('');
  const [pattern, setPattern] = useState<string>('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [selectedStyle, setSelectedStyle] = useState<'geometric' | 'fractal' | 'abstract' | 'mandala'>('geometric');
  const [colors, setColors] = useState(['#FFD700', '#FF6B6B', '#4ECDC4', '#45B7D1', '#A8E6CF']);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const svgRef = useRef<HTMLDivElement | null>(null);

  const styles = [
    { id: 'geometric', name: 'Geometric', icon: '⬡' },
    { id: 'fractal', name: 'Fractal', icon: '❋' },
    { id: 'abstract', name: 'Abstract', icon: '∿' },
    { id: 'mandala', name: 'Mandala', icon: '✦' }
  ];

  const hasApiKey = Boolean(import.meta.env?.VITE_API_KEY);

  const generatePattern = async () => {
    setErrorMessage(null);
    if (!prompt.trim()) {
      setErrorMessage('Please enter a short prompt describing the pattern you want.');
      return;
    }

    if (!hasApiKey) {
      setErrorMessage('No API key configured. Set VITE_API_KEY in your environment to enable AI generation.');
      return;
    }

    setIsGenerating(true);
    try {
      const artPrompt = `Create a simple SVG pattern description for ${selectedStyle} art based on: "${prompt}". Keep it minimal and elegant. Only describe the visual elements, shapes, and arrangement.`;
      const description = await geminiService.generateText(
        artPrompt,
        [],
        {},
        "You are an AI art director specializing in minimalist patterns and designs. Create concise, visual descriptions."
      );

      // Basic sanitization/fallback
      setPattern(description?.trim() || 'No description returned.');
    } catch (error: any) {
      console.error('Failed to generate pattern:', error);
      setErrorMessage(error?.message || 'Failed to generate pattern.');
    } finally {
      setIsGenerating(false);
    }
  };

  const generateSVGPattern = () => {
    const size = 400;
    const elements: string[] = [];

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

  const downloadSVG = () => {
    const svg = generateSVGPattern();
    const blob = new Blob([svg], { type: 'image/svg+xml;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `nanobanana-${selectedStyle}.svg`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
  };

  const downloadPNG = async () => {
    const svg = generateSVGPattern();
    const svgBlob = new Blob([svg], { type: 'image/svg+xml;charset=utf-8' });
    const url = URL.createObjectURL(svgBlob);
    const img = new Image();
    img.src = url;
    await new Promise((res, rej) => {
      img.onload = res;
      img.onerror = rej;
    });

    const canvas = document.createElement('canvas');
    canvas.width = 400;
    canvas.height = 400;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    ctx.fillStyle = '#00000000';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.drawImage(img, 0, 0);
    canvas.toBlob((blob) => {
      if (!blob) return;
      const pngUrl = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = pngUrl;
      a.download = `nanobanana-${selectedStyle}.png`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(pngUrl);
    });
    URL.revokeObjectURL(url);
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
            aria-label="Pattern prompt"
          />
          <button
            onClick={generatePattern}
            disabled={isGenerating || !prompt.trim() || !hasApiKey}
            className="px-4 py-2 bg-yellow-400 text-black rounded-lg hover:bg-yellow-500 disabled:opacity-50 disabled:cursor-not-allowed text-sm font-semibold"
            aria-label="Generate pattern"
          >
            {isGenerating ? 'Generating...' : 'Generate'}
          </button>
        </div>

        {!hasApiKey && (
          <p className="mt-2 text-xs text-red-400">No API key configured — set <code>VITE_API_KEY</code> to enable AI generation.</p>
        )}
        {errorMessage && (
          <p className="mt-2 text-sm text-red-300">{errorMessage}</p>
        )}
      </div>

      <div className="flex-1 overflow-y-auto p-6">
        <div className="max-w-2xl mx-auto">
          <div className="bg-black/20 rounded-lg p-6 border border-white/10 mb-4">
            <div className="flex justify-center items-center min-h-[400px]" ref={svgRef}>
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
            <div className="bg-black/20 rounded-lg p-4 border border-white/10 flex items-center justify-between gap-4">
              <div>
                <h3 className="text-sm font-semibold mb-2 text-yellow-400">AI Description:</h3>
                <p className="text-sm text-text-secondary">{pattern}</p>
              </div>
              <div className="flex gap-2">
                <button onClick={downloadSVG} className="px-3 py-1 bg-white/5 hover:bg-white/10 rounded text-sm">Export SVG</button>
                <button onClick={downloadPNG} className="px-3 py-1 bg-white/5 hover:bg-white/10 rounded text-sm">Export PNG</button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default NanoBananaApp;
