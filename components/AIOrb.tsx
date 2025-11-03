import React, { useState, useEffect } from 'react';

interface AIOrbProps {
  status?: 'idle' | 'thinking' | 'active' | 'error';
  currentTask?: string;
  onClick?: () => void;
}

/**
 * AIOrb - Animated AI presence indicator (floating orb)
 * Features:
 * - Pulsing animated orb showing AI activity
 * - Changes color based on system status
 * - Click to interact with AI assistant
 * - Draggable positioning
 * - Tooltip showing current AI tasks
 */
const AIOrb: React.FC<AIOrbProps> = ({
  status = 'idle',
  currentTask = 'Ready to assist',
  onClick,
}) => {
  const [position, setPosition] = useState({ x: window.innerWidth - 100, y: window.innerHeight - 100 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const [showTooltip, setShowTooltip] = useState(false);

  const statusColors = {
    idle: 'bg-primary-cyan',
    thinking: 'bg-primary-purple',
    active: 'bg-success',
    error: 'bg-error',
  };

  const statusGlows = {
    idle: 'shadow-[0_0_20px_rgba(6,182,212,0.5)]',
    thinking: 'shadow-[0_0_30px_rgba(139,92,246,0.7)]',
    active: 'shadow-[0_0_25px_rgba(16,185,129,0.6)]',
    error: 'shadow-[0_0_20px_rgba(239,68,68,0.5)]',
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    if (e.button === 0) { // Left click only
      setIsDragging(true);
      setDragOffset({
        x: e.clientX - position.x,
        y: e.clientY - position.y,
      });
    }
  };

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (isDragging) {
        setPosition({
          x: Math.max(0, Math.min(window.innerWidth - 80, e.clientX - dragOffset.x)),
          y: Math.max(0, Math.min(window.innerHeight - 80, e.clientY - dragOffset.y)),
        });
      }
    };

    const handleMouseUp = () => {
      setIsDragging(false);
    };

    if (isDragging) {
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', handleMouseUp);
    }

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isDragging, dragOffset]);

  const handleClick = () => {
    if (!isDragging && onClick) {
      onClick();
    }
  };

  return (
    <div
      className="fixed z-50 cursor-move"
      style={{
        left: `${position.x}px`,
        top: `${position.y}px`,
      }}
      onMouseDown={handleMouseDown}
      onClick={handleClick}
      onMouseEnter={() => setShowTooltip(true)}
      onMouseLeave={() => setShowTooltip(false)}
    >
      {/* Tooltip */}
      {showTooltip && (
        <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-3 py-2 bg-bg-secondary border border-border-color rounded-lg whitespace-nowrap text-sm text-white shadow-lg">
          <div className="font-semibold capitalize">{status}</div>
          <div className="text-xs text-text-secondary">{currentTask}</div>
          <div className="absolute top-full left-1/2 transform -translate-x-1/2 -mt-1">
            <div className="w-2 h-2 bg-bg-secondary border-r border-b border-border-color transform rotate-45"></div>
          </div>
        </div>
      )}

      {/* Orb */}
      <div className="relative w-20 h-20">
        {/* Outer glow ring */}
        <div
          className={`absolute inset-0 rounded-full ${statusColors[status]} ${statusGlows[status]} opacity-30 animate-pulse`}
          style={{ animationDuration: status === 'thinking' ? '1s' : '2s' }}
        ></div>

        {/* Middle ring */}
        <div
          className={`absolute inset-2 rounded-full ${statusColors[status]} opacity-50 animate-pulse`}
          style={{ animationDuration: status === 'thinking' ? '1.5s' : '3s' }}
        ></div>

        {/* Core orb */}
        <div
          className={`absolute inset-4 rounded-full ${statusColors[status]} flex items-center justify-center ${
            status === 'thinking' ? 'animate-spin' : ''
          }`}
          style={{ animationDuration: '3s' }}
        >
          <span className="text-2xl">🤖</span>
        </div>

        {/* Sparkle effect for active status */}
        {status === 'active' && (
          <>
            <div className="absolute top-0 left-1/2 w-1 h-1 bg-white rounded-full animate-ping"></div>
            <div className="absolute bottom-0 right-0 w-1 h-1 bg-white rounded-full animate-ping" style={{ animationDelay: '0.5s' }}></div>
            <div className="absolute top-1/2 left-0 w-1 h-1 bg-white rounded-full animate-ping" style={{ animationDelay: '1s' }}></div>
          </>
        )}
      </div>
    </div>
  );
};

export default AIOrb;