import React, { useState, useRef, useCallback, useEffect } from 'react';
import { WindowStyle } from '../types';

/**
 * A custom React hook to detect if the screen matches a given media query.
 * @param {string} query - The media query string (e.g., '(max-width: 768px)').
 * @returns {boolean} True if the media query matches, false otherwise.
 */
const useMediaQuery = (query: string) => {
    const [matches, setMatches] = useState(false);
    useEffect(() => {
        const media = window.matchMedia(query);
        if (media.matches !== matches) {
            setMatches(media.matches);
        }
        const listener = () => setMatches(media.matches);
        window.addEventListener('resize', listener);
        return () => window.removeEventListener('resize', listener);
    }, [matches, query]);
    return matches;
};

/**
 * Props for the WindowControls component.
 */
interface WindowControlsProps {
  /** Callback function to close the window. */
  onClose: () => void;
  /** Callback function to minimize the window. */
  onMinimize: () => void;
  /** The current visual style of the window. */
  style: WindowStyle;
  /** The title of the window, used for ARIA labels. */
  title: string;
}

/**
 * Renders the minimize, maximize, and close buttons for a window.
 * @param {WindowControlsProps} props - The component props.
 * @returns {JSX.Element} The window control buttons.
 */
const WindowControls: React.FC<WindowControlsProps> = ({ onClose, onMinimize, style, title }) => {
    return (
        <div className="flex items-center space-x-2">
            <button onClick={onClose} aria-label={`Close ${title} window`} className="window-control size-3 rounded-full bg-red-400/80 hover:bg-red-400" />
            <button onClick={onMinimize} aria-label={`Minimize ${title} window`} className="window-control size-3 rounded-full bg-yellow-400/80 hover:bg-yellow-400" />
            <button aria-label="Maximize window (disabled)" className="window-control size-3 rounded-full bg-green-400/80 hover:bg-green-400 cursor-not-allowed" />
        </div>
    );
};

/**
 * Props for the WindowComponent.
 */
interface WindowProps {
  /** The unique identifier for the window. */
  id: number;
  /** The content to be rendered inside the window. */
  children: React.ReactNode;
  /** The title displayed in the window's title bar. */
  title: string;
  /** The initial X-coordinate of the window. */
  initialX: number;
  /** The initial Y-coordinate of the window. */
  initialY: number;
  /** The initial width of the window. */
  initialWidth: number;
  /** The initial height of the window. */
  initialHeight: number;
  /** The z-index of the window, determining its stacking order. */
  zIndex: number;
  /** Indicates if the window is currently minimized. */
  isMinimized: boolean;
  /** Indicates if the window is currently active (focused). */
  isActive: boolean;
  /** The visual style of the window. */
  windowStyle: WindowStyle;
  /** Callback function to handle closing the window. */
  onClose: () => void;
  /** Callback function to handle minimizing the window. */
  onMinimize: () => void;
  /** Callback function to handle focusing the window. */
  onFocus: () => void;
}

/**
 * A draggable, resizable, and closable window component for the OS.
 * @param {WindowProps} props - The component props.
 * @returns {JSX.Element | null} The rendered window or null if minimized.
 */
const WindowComponent: React.FC<WindowProps> = ({ children, title, id, initialX, initialY, initialWidth, initialHeight, zIndex, isMinimized, isActive, windowStyle, onClose, onMinimize, onFocus }) => {
  const isMobile = useMediaQuery('(max-width: 768px)');
  const [position, setPosition] = useState({ x: initialX, y: initialY });
  const [size, setSize] = useState({ width: initialWidth, height: initialHeight });
  const [isDragging, setIsDragging] = useState(false);
  const dragOffset = useRef({ x: 0, y: 0 });
  const windowRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isActive && windowRef.current) {
      windowRef.current.focus();
    }
  }, [isActive]);
  
  /**
   * Handles the mouse down event for window dragging.
   * @param {React.MouseEvent<HTMLDivElement>} e - The mouse event.
   */
  const handleMouseDown = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    // Only allow dragging on desktop, not mobile
    if ((e.target as HTMLElement).closest('.window-control') || isMobile) return;
    onFocus();
    setIsDragging(true);
    const rect = windowRef.current?.getBoundingClientRect();
    if (rect) {
      dragOffset.current = {
        x: e.clientX - rect.left,
        y: e.clientY - rect.top,
      };
    }
    e.preventDefault();
  }, [onFocus, isMobile]);

  /**
   * Handles the mouse move event during dragging.
   * @param {MouseEvent} e - The mouse event.
   */
  const handleMouseMove = useCallback((e: MouseEvent) => {
    if (isDragging && !isMobile) {
      setPosition({
        x: e.clientX - dragOffset.current.x,
        y: e.clientY - dragOffset.current.y,
      });
    }
  }, [isDragging, isMobile]);

  /**
   * Handles the mouse up event, ending dragging.
   */
  const handleMouseUp = useCallback(() => {
    setIsDragging(false);
  }, []);

  useEffect(() => {
    if (isDragging) {
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', handleMouseUp);
    }
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isDragging, handleMouseMove, handleMouseUp]);

  if (isMinimized) {
    return null;
  }

  /**
   * Configuration for different window styles, defining their CSS classes.
   */
  const styleConfig = {
      cyberpunk: {
          container: `glass-effect rounded-xl transition-all duration-300 ${isActive ? 'shadow-2xl ring-2 ring-inset ring-[var(--accent-color)]' : ''}`,
          titlebar: 'h-10 justify-between px-4',
          title: 'font-medium text-sm',
          body: '',
          background: 'transparent',
      },
      macos: {
          container: `shadow-2xl shadow-black/50 border ${isActive ? 'ring-2 ring-accent border-accent/50' : 'border-border-color'}`,
          titlebar: 'h-10 bg-black/20 justify-between px-3',
          title: 'font-bold text-sm absolute left-1/2 -translate-x-1/2',
          body: 'p-1',
          background: 'var(--glass-bg)',
      },
      gemini: {
          container: `shadow-2xl shadow-black/50 border ${isActive ? 'border-accent/50' : 'border-border-color'}`,
          titlebar: 'h-10 justify-center group/titlebar',
          title: 'font-semibold text-sm',
          body: 'p-0.5',
          background: 'var(--bg-tertiary)',
      },
      futuristic: {
          container: `shadow-2xl shadow-accent/20 border-2 ${isActive ? 'border-accent' : 'border-border-color'}`,
          titlebar: 'h-10 bg-black/30 justify-between px-3',
          title: 'font-mono uppercase text-accent text-sm absolute left-1/2 -translate-x-1/2',
          body: 'p-1',
          background: 'var(--bg-primary)',
      },
  }
  const currentStyle = styleConfig[windowStyle] || styleConfig['cyberpunk'];
  
  // Mobile: full screen, no dragging/resizing
  const mobileStyles: React.CSSProperties = {
      position: 'fixed', // Use fixed for full viewport coverage
      inset: 0,
      width: '100%',
      height: '100%',
      zIndex,
      resize: 'none',
      borderRadius: 0, // No rounded corners on mobile full screen
  };

  // Desktop: draggable and resizable
  const desktopStyles: React.CSSProperties = {
      left: `${position.x}px`,
      top: `${position.y}px`,
      width: `${size.width}px`,
      height: `${size.height}px`,
      zIndex,
      minWidth: '300px',
      minHeight: '200px',
      resize: 'both',
  };

  return (
    <div
      ref={windowRef}
      id={`window-${id}`}
      role="dialog"
      aria-modal="true"
      aria-labelledby={`window-title-${id}`}
      tabIndex={-1}
      className={`absolute flex flex-col overflow-hidden animate-slide-up focus:outline-none ${currentStyle.container} ${isMobile ? 'rounded-none' : ''}`}
      style={isMobile ? mobileStyles : desktopStyles}
      onMouseDown={onFocus}
    >
      <div
        className={`relative flex items-center flex-shrink-0 ${isDragging && !isMobile ? 'cursor-grabbing' : 'cursor-grab'} ${isMobile ? '!cursor-default' : ''} ${currentStyle.titlebar} border-b border-white/10`}
        onMouseDown={handleMouseDown}
      >
          <span id={`window-title-${id}`} className={`text-white/80 ${currentStyle.title}`}>{title}</span>
          <WindowControls onClose={onClose} onMinimize={onMinimize} style={windowStyle} title={title} />
      </div>
      <div className={`flex-grow overflow-auto bg-background-dark/80 ${currentStyle.body}`}>
        {children}
      </div>
    </div>
  );
};

export default React.memo(WindowComponent);