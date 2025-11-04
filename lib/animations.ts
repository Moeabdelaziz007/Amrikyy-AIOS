/**
 * Animation and Effect Utilities from holo-vision-quest
 * Holographic gradients, glow effects, and floating animations
 */

export const holographicGradient = 'bg-gradient-to-r from-cyan-400 via-purple-500 to-pink-500';

export const glowEffects = {
  cyan: 'shadow-[0_0_40px_rgba(34,211,238,0.4)]',
  purple: 'shadow-[0_0_40px_rgba(168,85,247,0.4)]',
  blue: 'shadow-[0_0_40px_rgba(59,130,246,0.4)]',
  green: 'shadow-[0_0_40px_rgba(34,197,94,0.4)]',
  pink: 'shadow-[0_0_40px_rgba(236,72,153,0.4)]',
};

export const floatingAnimation = `
  @keyframes float {
    0%, 100% {
      transform: translateY(0px);
    }
    50% {
      transform: translateY(-20px);
    }
  }
  
  .animate-float {
    animation: float 6s ease-in-out infinite;
  }
`;

export const pulseGlow = `
  @keyframes pulse-glow {
    0%, 100% {
      box-shadow: 0 0 20px rgba(34,211,238,0.3);
    }
    50% {
      box-shadow: 0 0 60px rgba(34,211,238,0.6);
    }
  }
  
  .animate-pulse-glow {
    animation: pulse-glow 2s ease-in-out infinite;
  }
`;

export const shimmerEffect = `
  @keyframes shimmer {
    0% {
      background-position: -1000px 0;
    }
    100% {
      background-position: 1000px 0;
    }
  }
  
  .animate-shimmer {
    animation: shimmer 3s linear infinite;
    background: linear-gradient(
      90deg,
      transparent 0%,
      rgba(255,255,255,0.1) 50%,
      transparent 100%
    );
    background-size: 1000px 100%;
  }
`;

// CSS-in-JS utility for holographic text
export const holographicTextStyle = {
  background: 'linear-gradient(135deg, #22d3ee 0%, #a855f7 50%, #ec4899 100%)',
  WebkitBackgroundClip: 'text',
  WebkitTextFillColor: 'transparent',
  backgroundClip: 'text',
};

// Tailwind utility classes
export const animations = {
  float: 'animate-float',
  pulseGlow: 'animate-pulse-glow',
  shimmer: 'animate-shimmer',
} as const;

export const gradients = {
  hologram: 'bg-gradient-to-br from-cyan-400 via-purple-500 to-pink-500',
  cyberpunk: 'bg-gradient-to-r from-purple-600 via-pink-600 to-blue-600',
  ocean: 'bg-gradient-to-r from-blue-400 via-cyan-500 to-teal-400',
  sunset: 'bg-gradient-to-r from-orange-400 via-red-500 to-pink-600',
  aurora: 'bg-gradient-to-r from-green-400 via-blue-500 to-purple-600',
} as const;

// Helper function to apply glow effect
export function applyGlow(color: keyof typeof glowEffects): string {
  return glowEffects[color];
}

// Helper function to combine gradient with text clip
export function holographicText(gradient: keyof typeof gradients = 'hologram'): string {
  return `${gradients[gradient]} bg-clip-text text-transparent`;
}

// Export all animations as CSS string for global injection
export const allAnimations = `
${floatingAnimation}
${pulseGlow}
${shimmerEffect}
`;
