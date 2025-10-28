import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import VoiceHologram from './VoiceHologram';

describe('VoiceHologram', () => {
  it('renders in "idle" state correctly', () => {
    render(<VoiceHologram state="idle" />);
    expect(screen.getByText('AI is ready. Click the button to speak.')).toBeInTheDocument();
    expect(screen.getByLabelText('Voice assistant is idle')).toBeInTheDocument();
    // Check for specific icon (SparklesIcon is a MaterialIcon with 'auto_awesome')
    expect(screen.getByText('auto_awesome')).toBeInTheDocument();
    const hologram = screen.getByLabelText('Voice assistant is idle');
    expect(hologram).toHaveClass('animate-voice-pulse'); // animation class for idle state
  });

  it('renders in "listening" state correctly', () => {
    render(<VoiceHologram state="listening" />);
    expect(screen.getByText('Listening...')).toBeInTheDocument();
    expect(screen.getByLabelText('Voice assistant is listening')).toBeInTheDocument();
    // Check for specific icon (MicrophoneIcon is a MaterialIcon with 'mic')
    expect(screen.getByText('mic')).toBeInTheDocument();
    const hologram = screen.getByLabelText('Voice assistant is listening');
    expect(hologram.querySelector('.animate-ping')).toBeInTheDocument(); // ping animation for listening
    expect(hologram.querySelector('.animate-pulse')).toBeInTheDocument(); // pulse animation for listening (inner ring)
  });

  it('renders in "speaking" state correctly', () => {
    render(<VoiceHologram state="speaking" />);
    expect(screen.getByText('Speaking...')).toBeInTheDocument();
    expect(screen.getByLabelText('Voice assistant is speaking')).toBeInTheDocument();
    // Check for specific icon (SparklesIcon with 'auto_awesome')
    expect(screen.getByText('auto_awesome')).toBeInTheDocument();
    const hologram = screen.getByLabelText('Voice assistant is speaking');
    expect(hologram).toHaveClass('animate-voice-pulse'); // animation class for speaking state
  });

  it('hides ARIA hidden icons', () => {
    const { container } = render(<VoiceHologram state="idle" />);
    expect(container.querySelector('.material-symbols-outlined')).toHaveAttribute('aria-hidden', 'true');
  });
});