import React, { useRef } from 'react';
import { useParticleSystem } from '../../hooks/useParticleSystem';
import { themes } from '../../config/themes';

interface DesktopBackgroundProps {
  theme: keyof typeof themes;
}

const DesktopBackground: React.FC<DesktopBackgroundProps> = ({ theme }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  useParticleSystem(canvasRef, { theme: theme as string });

  const currentTheme = themes[theme];

  return (
    <div className="fixed inset-0 -z-10">
      <canvas
        ref={canvasRef}
        className="absolute inset-0 opacity-30 pointer-events-none"
      />
      <div className={`absolute inset-0 bg-gradient-to-br ${currentTheme.gradient} opacity-40 animate-pulse`}
           style={{ animationDuration: '10s' }} />
      <div className="absolute inset-0 bg-radial-gradient opacity-20"
           style={{ background: 'radial-gradient(circle at 50% 50%, rgba(100, 100, 255, 0.1), transparent 70%)' }} />
    </div>
  );
};

export default DesktopBackground;
