import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import ChronoVaultApp from './ChronoVaultApp';
import { useMemory } from '../../contexts/MemoryContext';
import { Engram } from '../../types';

// Mock the useMemory hook
vi.mock('../../contexts/MemoryContext', () => ({
  useMemory: vi.fn(),
}));

// Mock the QuantumFoamBackground component
vi.mock('../QuantumFoamBackground', () => ({
  default: () => <div data-testid="quantum-foam-background" />,
}));

describe('ChronoVaultApp', () => {
  const mockEngrams: Engram[] = [
    { id: 'e1', label: 'Engram 1', type: 'user_preference', content: 'Content 1', timestamp: Date.now(), color: '#FF0000', potentiality: 1 },
    { id: 'e2', label: 'Engram 2', type: 'travel_plan', content: 'Content 2', timestamp: Date.now(), color: '#00FF00', potentiality: 0 },
  ];
  const mockConnections = [{ from: 'e1', to: 'e2' }];
  const mockReasoningPaths = [{ from: 'e1', to: 'e2' }];
  const mockSynthesizeNewMemory = vi.fn();
  const mockTriggerReasoning = vi.fn();
  const mockCollapseEngram = vi.fn();

  beforeEach(() => {
    (useMemory as vi.Mock).mockReturnValue({
      engrams: mockEngrams,
      connections: mockConnections,
      reasoningPaths: mockReasoningPaths,
      isSynthesizing: false,
      addEngram: vi.fn(),
      addConnections: vi.fn(),
      synthesizeNewMemory: mockSynthesizeNewMemory,
      triggerReasoning: mockTriggerReasoning,
      collapseEngram: mockCollapseEngram,
    });
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.runOnlyPendingTimers();
    vi.useRealTimers();
  });

  it('renders the Quantum Reasoning Engine title', () => {
    render(<ChronoVaultApp />);
    expect(screen.getByText('Quantum Reasoning Engine')).toBeInTheDocument();
  });

  it('renders existing engrams on the canvas', () => {
    render(<ChronoVaultApp />);
    expect(screen.getByText('Engram 1')).toBeInTheDocument();
    expect(screen.getByText('Engram 2')).toBeInTheDocument();
  });

  it('renders static connections between engrams', () => {
    render(<ChronoVaultApp />);
    // This is hard to test directly without inspecting SVG DOM,
    // but we can check if the SVG structure elements are present.
    const svg = screen.getByTestId('quantum-foam-background').nextElementSibling; // Get the SVG element after the mock background
    expect(svg).toBeInTheDocument();
    expect(svg?.querySelector('line')).toBeInTheDocument();
  });

  it('renders reasoning paths when active', () => {
    render(<ChronoVaultApp />);
    const svg = screen.getByTestId('quantum-foam-background').nextElementSibling;
    expect(svg?.querySelector('path.animate-reasoning-path')).toBeInTheDocument();
  });

  it('calls triggerReasoning when an engram node is clicked', () => {
    render(<ChronoVaultApp />);
    fireEvent.click(screen.getByText('Engram 1'));
    expect(mockTriggerReasoning).toHaveBeenCalledWith('e1');
  });

  it('calls synthesizeNewMemory when "Synthesize Insight" button is clicked', async () => {
    render(<ChronoVaultApp />);
    const promptInput = screen.getByPlaceholderText(/e\.g\., what common theme exists/i);
    fireEvent.change(promptInput, { target: { value: 'New insight prompt' } });
    fireEvent.click(screen.getByRole('button', { name: /synthesize insight/i }));

    await waitFor(() => {
      expect(mockSynthesizeNewMemory).toHaveBeenCalledWith('New insight prompt');
    });
  });

  it('disables "Synthesize Insight" button when synthesizing', () => {
    (useMemory as vi.Mock).mockReturnValue({
      ...useMemory(), // Spread existing mock values
      isSynthesizing: true,
    });
    render(<ChronoVaultApp />);
    const promptInput = screen.getByPlaceholderText(/e\.g\., what common theme exists/i);
    fireEvent.change(promptInput, { target: { value: 'Test' } });
    expect(screen.getByRole('button', { name: /synthesize insight/i })).toBeDisabled();
  });

  it('calls collapseEngram for potentiality: 0 engrams after timeout', () => {
    render(<ChronoVaultApp />);
    vi.advanceTimersByTime(3000); // Advance past the 3-second collapse timeout
    expect(mockCollapseEngram).toHaveBeenCalledWith('e2'); // Engram 2 has potentiality 0
  });

  it('displays correct styling for potentiality: 0 (superposition) engrams', () => {
    render(<ChronoVaultApp />);
    const engram2Text = screen.getByText('Engram 2');
    const engram2Circle = engram2Text.closest('g')?.querySelector('circle.animate-superposition');
    expect(engram2Circle).toBeInTheDocument();
  });

  it('displays correct styling for potentiality: 1 (collapsed) engrams', () => {
    render(<ChronoVaultApp />);
    const engram1Text = screen.getByText('Engram 1');
    const engram1Circle = engram1Text.closest('g')?.querySelector('circle[r="2.5"]');
    expect(engram1Circle).toBeInTheDocument();
  });
});