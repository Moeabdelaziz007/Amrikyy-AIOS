import { useCallback } from 'react';

export type SoundType = 'click' | 'message' | 'response' | 'success' | 'error' | 'notification';

export interface UseSoundReturn {
  playSound: (type: SoundType) => void;
  isSupported: boolean;
}

/**
 * Hook for playing UI sound effects using Web Audio API
 * @returns Object with playSound function and support detection
 */
export function useSound(): UseSoundReturn {
  const isSupported =
    typeof window !== 'undefined' && 
    !!(window.AudioContext || (window as any).webkitAudioContext);

  const playSound = useCallback(
    (type: SoundType) => {
      if (!isSupported) return;

      try {
        // Create audio context for subtle sci-fi sounds
        const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
        const now = audioContext.currentTime;

        switch (type) {
          case 'click':
            // Short beep
            const osc1 = audioContext.createOscillator();
            const gain1 = audioContext.createGain();
            osc1.connect(gain1);
            gain1.connect(audioContext.destination);
            osc1.frequency.value = 800;
            gain1.gain.setValueAtTime(0.1, now);
            gain1.gain.exponentialRampToValueAtTime(0.01, now + 0.1);
            osc1.start(now);
            osc1.stop(now + 0.1);
            break;

          case 'message':
            // Ascending tone
            const osc2 = audioContext.createOscillator();
            const gain2 = audioContext.createGain();
            osc2.connect(gain2);
            gain2.connect(audioContext.destination);
            osc2.frequency.setValueAtTime(600, now);
            osc2.frequency.linearRampToValueAtTime(800, now + 0.15);
            gain2.gain.setValueAtTime(0.1, now);
            gain2.gain.exponentialRampToValueAtTime(0.01, now + 0.15);
            osc2.start(now);
            osc2.stop(now + 0.15);
            break;

          case 'response':
            // Descending tone
            const osc3 = audioContext.createOscillator();
            const gain3 = audioContext.createGain();
            osc3.connect(gain3);
            gain3.connect(audioContext.destination);
            osc3.frequency.setValueAtTime(800, now);
            osc3.frequency.linearRampToValueAtTime(600, now + 0.15);
            gain3.gain.setValueAtTime(0.1, now);
            gain3.gain.exponentialRampToValueAtTime(0.01, now + 0.15);
            osc3.start(now);
            osc3.stop(now + 0.15);
            break;

          case 'success':
            // Two ascending tones
            for (let i = 0; i < 2; i++) {
              const osc = audioContext.createOscillator();
              const gain = audioContext.createGain();
              osc.connect(gain);
              gain.connect(audioContext.destination);
              osc.frequency.value = 600 + i * 200;
              gain.gain.setValueAtTime(0.1, now + i * 0.1);
              gain.gain.exponentialRampToValueAtTime(0.01, now + i * 0.1 + 0.1);
              osc.start(now + i * 0.1);
              osc.stop(now + i * 0.1 + 0.1);
            }
            break;

          case 'error':
            // Low warning tone
            const osc4 = audioContext.createOscillator();
            const gain4 = audioContext.createGain();
            osc4.connect(gain4);
            gain4.connect(audioContext.destination);
            osc4.frequency.value = 300;
            gain4.gain.setValueAtTime(0.1, now);
            gain4.gain.exponentialRampToValueAtTime(0.01, now + 0.2);
            osc4.start(now);
            osc4.stop(now + 0.2);
            break;

          case 'notification':
            // Triple beep
            for (let i = 0; i < 3; i++) {
              const osc = audioContext.createOscillator();
              const gain = audioContext.createGain();
              osc.connect(gain);
              gain.connect(audioContext.destination);
              osc.frequency.value = 700;
              gain.gain.setValueAtTime(0.08, now + i * 0.15);
              gain.gain.exponentialRampToValueAtTime(0.01, now + i * 0.15 + 0.08);
              osc.start(now + i * 0.15);
              osc.stop(now + i * 0.15 + 0.08);
            }
            break;
        }

        // Clean up audio context after sounds finish
        setTimeout(() => {
          audioContext.close();
        }, 1000);
      } catch (error) {
        console.error('Error playing sound:', error);
      }
    },
    [isSupported]
  );

  return { playSound, isSupported };
}
