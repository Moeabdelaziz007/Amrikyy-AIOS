import React from 'react';

export interface FloatingOrbProps {
  /**
   * Size of the orb in pixels
   */
  size?: number;
  /**
   * Color of the orb (cyan, purple, blue, green, pink)
   */
  color?: 'cyan' | 'purple' | 'blue' | 'green' | 'pink';
  /**
   * Position from top (in pixels or percentage)
   */
  top?: string | number;
  /**
   * Position from left (in pixels or percentage)
   */
  left?: string | number;
  /**
   * Position from bottom (in pixels or percentage)
   */
  bottom?: string | number;
  /**
   * Position from right (in pixels or percentage)
   */
  right?: string | number;
  /**
   * Animation delay in seconds
   */
  delay?: number;
  /**
   * Blur amount (in pixels)
   */
  blur?: number;
  /**
   * Opacity (0-1)
   */
  opacity?: number;
  /**
   * Custom className
   */
  className?: string;
}

const colorClasses = {
  cyan: 'bg-cyan-400',
  purple: 'bg-purple-500',
  blue: 'bg-blue-500',
  green: 'bg-green-500',
  pink: 'bg-pink-500',
};

export function FloatingOrb({
  size = 288,
  color = 'cyan',
  top,
  left,
  bottom,
  right,
  delay = 0,
  blur = 48,
  opacity = 0.2,
  className = '',
}: FloatingOrbProps) {
  const positionStyle: React.CSSProperties = {
    top: top !== undefined ? (typeof top === 'number' ? `${top}px` : top) : undefined,
    left: left !== undefined ? (typeof left === 'number' ? `${left}px` : left) : undefined,
    bottom: bottom !== undefined ? (typeof bottom === 'number' ? `${bottom}px` : bottom) : undefined,
    right: right !== undefined ? (typeof right === 'number' ? `${right}px` : right) : undefined,
    width: `${size}px`,
    height: `${size}px`,
    filter: `blur(${blur}px)`,
    opacity,
    animationDelay: `${delay}s`,
  };

  return (
    <div
      className={`absolute rounded-full animate-float ${colorClasses[color]} ${className}`}
      style={positionStyle}
      aria-hidden="true"
    />
  );
}

export interface FloatingOrbsBackgroundProps {
  /**
   * Children to render on top of the orbs
   */
  children?: React.ReactNode;
  /**
   * Custom className for the container
   */
  className?: string;
}

/**
 * Pre-configured floating orbs background
 */
export function FloatingOrbsBackground({ children, className = '' }: FloatingOrbsBackgroundProps) {
  return (
    <div className={`relative overflow-hidden ${className}`}>
      <FloatingOrb size={288} color="cyan" top={80} left={80} delay={0} />
      <FloatingOrb size={384} color="purple" bottom={80} right={80} delay={3} />
      <FloatingOrb size={240} color="blue" top="50%" left="50%" delay={1.5} opacity={0.15} />
      {children}
    </div>
  );
}
