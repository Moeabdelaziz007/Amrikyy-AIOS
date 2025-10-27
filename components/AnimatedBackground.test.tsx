import { render } from '@testing-library/react';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import AnimatedBackground from './AnimatedBackground';

describe('AnimatedBackground', () => {
  // Mock the canvas getContext method as it's not implemented in JSDOM
  // This is essential for any component that interacts with a canvas.
  beforeEach(() => {
    HTMLCanvasElement.prototype.getContext = vi.fn(() => ({
      clearRect: vi.fn(),
      beginPath: vi.fn(),
      moveTo: vi.fn(),
      lineTo: vi.fn(),
      stroke: vi.fn(),
      arc: vi.fn(),
      fill: vi.fn(),
    })) as any;
  });
  
  it('renders a canvas element without crashing', () => {
    render(<AnimatedBackground />);
    
    // In JSDOM, we cannot test the visual output or animations of the canvas.
    // This "smoke test" ensures that the component mounts and renders its
    // primary canvas element without throwing any errors.
    const canvasElement = document.querySelector('canvas');
    expect(canvasElement).toBeInTheDocument();
  });
});