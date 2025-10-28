import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import AgentProfileApp from './AgentProfileApp';
import { CustomAgent } from '../../types';
import { useLanguage } from '../../contexts/LanguageContext';

// Mock contexts
vi.mock('../../contexts/LanguageContext', () => ({
  useLanguage: vi.fn(),
}));

describe('AgentProfileApp', () => {
  const mockAgentWithSkills: CustomAgent = {
    id: 'my-custom-agent',
    name: 'My Custom Agent',
    role: 'Helper Bot',
    icon: '🤖',
    skillIDs: ['gemini-pro-text', 'web-search'],
  };

  const mockAgentNoSkills: CustomAgent = {
    id: 'simple-agent',
    name: 'Simple Agent',
    role: 'Basic Responder',
    icon: '💬',
    skillIDs: [],
  };

  const mockT = vi.fn((key: string) => key.split('.').pop() || key); // Simple mock for translation

  beforeEach(() => {
    (useLanguage as vi.Mock).mockReturnValue({ t: mockT });
  });

  it('renders agent name, role, and icon', () => {
    render(<AgentProfileApp agent={mockAgentWithSkills} />);
    expect(screen.getByText('MY CUSTOM AGENT')).toBeInTheDocument(); // Uppercase in hologram
    expect(screen.getByText('My Custom Agent')).toBeInTheDocument(); // Title
    expect(screen.getByText('Helper Bot')).toBeInTheDocument();
    expect(screen.getByText('🤖')).toBeInTheDocument();
  });

  it('renders equipped skills when agent has skills', () => {
    render(<AgentProfileApp agent={mockAgentWithSkills} />);
    expect(screen.getByText('Equipped Skills')).toBeInTheDocument();
    expect(screen.getByText('Advanced Text')).toBeInTheDocument();
    expect(screen.getByText('Web Search')).toBeInTheDocument();
    expect(screen.queryByText('No skills equipped.')).not.toBeInTheDocument();
  });

  it('renders "No skills equipped." when agent has no skills', () => {
    render(<AgentProfileApp agent={mockAgentNoSkills} />);
    expect(screen.getByText('Equipped Skills')).toBeInTheDocument();
    expect(screen.getByText('No skills equipped.')).toBeInTheDocument();
    expect(screen.queryByText('Advanced Text')).not.toBeInTheDocument();
  });

  it('displays correct icon for each skill', () => {
    render(<AgentProfileApp agent={mockAgentWithSkills} />);
    const advancedTextSkillCard = screen.getByText('Advanced Text').closest('div');
    expect(advancedTextSkillCard?.querySelector('.material-symbols-outlined')).toHaveTextContent('chat_bubble');
    
    const webSearchSkillCard = screen.getByText('Web Search').closest('div');
    expect(webSearchSkillCard?.querySelector('.material-symbols-outlined')).toHaveTextContent('search');
  });

  it('hologram section applies correct styling (smoke test for classes and inline styles)', () => {
    render(<AgentProfileApp agent={mockAgentWithSkills} />);
    const hologramCard = screen.getByText('MY CUSTOM AGENT').closest('.animate-hologram-glow');
    expect(hologramCard).toBeInTheDocument();
    expect(hologramCard).toHaveStyle('--glow-color: #00f0ff');
    expect(hologramCard?.querySelector('.animate-hologram-flicker')).toHaveStyle('filter: drop-shadow(2px 0 0 #00f0ff70) drop-shadow(-2px 0 0 #f000b870)');
  });
});