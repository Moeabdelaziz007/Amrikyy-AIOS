import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import AnalyticsHubApp from './AnalyticsHubApp';
import { AppID } from '../../types';

// Mock contexts
vi.mock('../../contexts/LanguageContext', () => ({
  useLanguage: vi.fn().mockReturnValue({ t: (key: string) => key.split('.').pop() || key }),
}));

describe('AnalyticsHubApp', () => {
  const mockOnOpenApp = vi.fn();

  beforeEach(() => {
    mockOnOpenApp.mockClear();
  });

  it('renders the main title', () => {
    render(<AnalyticsHubApp onOpenApp={mockOnOpenApp} />);
    expect(screen.getByText('System Analytics & Workflows')).toBeInTheDocument();
  });

  it('renders all system entities with their details', () => {
    render(<AnalyticsHubApp onOpenApp={mockOnOpenApp} />);
    
    expect(screen.getByText('Workflow Builder')).toBeInTheDocument();
    expect(screen.getByText('Agent Manager')).toBeInTheDocument();
    expect(screen.getByText('Analytics Hub')).toBeInTheDocument();
    expect(screen.getByText('A2A Shield')).toBeInTheDocument();

    // Check descriptions and goals
    expect(screen.getByText(/Visually construct, manage, and deploy/i)).toBeInTheDocument();
    expect(screen.getByText(/Primary Goal: Automate Tasks/i)).toBeInTheDocument();
  });

  it('calls onOpenApp with the correct AppID when an entity card is clicked', () => {
    render(<AnalyticsHubApp onOpenApp={mockOnOpenApp} />);
    
    fireEvent.click(screen.getByText('Workflow Builder'));
    expect(mockOnOpenApp).toHaveBeenCalledTimes(1);
    expect(mockOnOpenApp).toHaveBeenCalledWith('workflow' as AppID);
    
    mockOnOpenApp.mockClear();
    fireEvent.click(screen.getByText('Agent Manager'));
    expect(mockOnOpenApp).toHaveBeenCalledTimes(1);
    expect(mockOnOpenApp).toHaveBeenCalledWith('skillForge' as AppID);
  });

  it('renders workflow icons and labels for each entity', () => {
    render(<AnalyticsHubApp onOpenApp={mockOnOpenApp} />);
    
    const workflowBuilderCard = screen.getByText('Workflow Builder').closest('.glass-effect');
    expect(workflowBuilderCard).toHaveTextContent(/Trigger/);
    expect(workflowBuilderCard).toHaveTextContent(/Agent A/);
    expect(workflowBuilderCard).toHaveTextContent(/App B/);
    // Check for Material Symbols icons, e.g., 'input' icon
    expect(workflowBuilderCard?.querySelector('.material-symbols-outlined')).toBeInTheDocument();
  });

  it('has clickable cards with hover effects (smoke test for classes)', () => {
    render(<AnalyticsHubApp onOpenApp={mockOnOpenApp} />);
    const workflowBuilderCard = screen.getByText('Workflow Builder').closest('.glass-effect');
    expect(workflowBuilderCard).toHaveClass('cursor-pointer');
    expect(workflowBuilderCard).toHaveClass('hover:border-neon-cyan/50');
  });
});