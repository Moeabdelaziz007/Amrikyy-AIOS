import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import SkillForgeApp from './SkillForgeApp';
import { useLanguage } from '../../contexts/LanguageContext';

// Mock contexts
vi.mock('../../contexts/LanguageContext', () => ({
  useLanguage: vi.fn(),
}));

describe('SkillForgeApp', () => {
  const mockT = vi.fn((key: string) => key.split('.').pop() || key); // Simple mock for translation

  beforeEach(() => {
    (useLanguage as vi.Mock).mockReturnValue({ t: mockT });
  });

  it('renders the app title', () => {
    render(<SkillForgeApp />);
    expect(screen.getByText('System Skills & Health')).toBeInTheDocument();
  });

  it('renders skill categories and skills within them', () => {
    render(<SkillForgeApp />);
    
    // Check categories
    expect(screen.getByText('Language')).toBeInTheDocument();
    expect(screen.getByText('Vision')).toBeInTheDocument();
    expect(screen.getByText('Audio')).toBeInTheDocument();
    expect(screen.getByText('Knowledge')).toBeInTheDocument();

    // Check specific skills
    expect(screen.getByText('Advanced Text')).toBeInTheDocument();
    expect(screen.getByText('Image Generation')).toBeInTheDocument();
    expect(screen.getByText('Web Search')).toBeInTheDocument();
  });

  it('renders system status metrics', () => {
    render(<SkillForgeApp />);
    expect(screen.getByText('System Status')).toBeInTheDocument();
    expect(screen.getByText('Cognitive Load')).toBeInTheDocument();
    expect(screen.getByText('Communication Latency')).toBeInTheDocument();
    expect(screen.getByText('Memory Usage (Engrams)')).toBeInTheDocument();
  });

  it('renders "Optimize All Skills" button', () => {
    render(<SkillForgeApp />);
    expect(screen.getByRole('button', { name: /optimize all skills/i })).toBeInTheDocument();
  });

  it('displays "Installed" button for each skill', () => {
    render(<SkillForgeApp />);
    const installedButtons = screen.getAllByRole('button', { name: /installed/i });
    expect(installedButtons.length).toBeGreaterThan(0); // Should be at least one for mock data
  });

  it('skill cards show correct content', () => {
    render(<SkillForgeApp />);
    const advancedTextSkill = screen.getByText('Advanced Text').closest('.flex-col');
    expect(advancedTextSkill).toBeInTheDocument();
    expect(advancedTextSkill).toHaveTextContent(/Complex reasoning, understanding/);
  });

  it('health metrics show values and units', () => {
    render(<SkillForgeApp />);
    const cognitiveLoad = screen.getByText('Cognitive Load').closest('div');
    expect(cognitiveLoad).toHaveTextContent('38%');
    const latency = screen.getByText('Communication Latency').closest('div');
    expect(latency).toHaveTextContent('12ms');
  });
});