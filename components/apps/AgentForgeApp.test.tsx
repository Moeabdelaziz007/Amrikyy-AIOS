import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import AgentForgeApp from './AgentForgeApp';
import * as geminiAdvancedService from '../../services/geminiAdvancedService';
import { SkillID, AppID } from '../../types';

// Mock AI service
vi.mock('../../services/geminiAdvancedService', () => ({
  suggestAgentPersona: vi.fn(),
}));

describe('AgentForgeApp', () => {
  const mockOnAddAgent = vi.fn();
  const mockOnClose = vi.fn();

  beforeEach(() => {
    (geminiAdvancedService.suggestAgentPersona as vi.Mock).mockClear();
    mockOnAddAgent.mockClear();
    mockOnClose.mockClear();
  });

  it('renders agent persona definition fields', () => {
    render(<AgentForgeApp onAddAgent={mockOnAddAgent} onClose={mockOnClose} />);
    expect(screen.getByLabelText(/name/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/role/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/icon \(emoji\)/i)).toBeInTheDocument();
  });

  it('renders skill selection checkboxes/buttons', () => {
    render(<AgentForgeApp onAddAgent={mockOnAddAgent} onClose={mockOnClose} />);
    expect(screen.getByText('Plug-in Skills')).toBeInTheDocument();
    expect(screen.getByText('Advanced Text')).toBeInTheDocument(); // Example skill
    expect(screen.getByText('Image Generation')).toBeInTheDocument(); // Example skill
  });

  it('toggles skill selection when a skill card is clicked', () => {
    render(<AgentForgeApp onAddAgent={mockOnAddAgent} onClose={mockOnClose} />);
    const advancedTextSkill = screen.getByText('Advanced Text').closest('div');
    
    if (advancedTextSkill) {
        expect(advancedTextSkill).not.toHaveClass('bg-accent/20'); // Initially not selected
        fireEvent.click(advancedTextSkill);
        expect(advancedTextSkill).toHaveClass('bg-accent/20'); // Now selected
        fireEvent.click(advancedTextSkill);
        expect(advancedTextSkill).not.toHaveClass('bg-accent/20'); // Toggled off
    } else {
        throw new Error("Advanced Text skill card not found.");
    }
  });

  it('suggests agent persona using AI when "Suggest with AI" is clicked', async () => {
    (geminiAdvancedService.suggestAgentPersona as vi.Mock).mockResolvedValue({
      name: 'Poetry Bot',
      icon: '📝',
      skillIDs: ['gemini-pro-text', 'fast-text'] as SkillID[],
    });
    render(<AgentForgeApp onAddAgent={mockOnAddAgent} onClose={mockOnClose} />);

    const roleInput = screen.getByLabelText(/role/i);
    fireEvent.change(roleInput, { target: { value: 'A poetry writing assistant' } });
    fireEvent.click(screen.getByTitle('Suggest with AI'));

    await waitFor(() => {
      expect(geminiAdvancedService.suggestAgentPersona).toHaveBeenCalledWith('A poetry writing assistant');
      expect(screen.getByLabelText(/name/i)).toHaveValue('Poetry Bot');
      expect(screen.getByLabelText(/icon \(emoji\)/i)).toHaveValue('📝');
      // Check if skills are selected (Advanced Text and Fast Text are in mock skills data)
      const advancedTextSkill = screen.getByText('Advanced Text').closest('div');
      const fastTextSkill = screen.getByText('Fast Text').closest('div');
      expect(advancedTextSkill).toHaveClass('bg-accent/20');
      expect(fastTextSkill).toHaveClass('bg-accent/20');
    });
  });

  it('shows loading state during AI persona suggestion', async () => {
    (geminiAdvancedService.suggestAgentPersona as vi.Mock).mockReturnValue(new Promise(() => {})); // Never resolves
    render(<AgentForgeApp onAddAgent={mockOnAddAgent} onClose={mockOnClose} />);

    const roleInput = screen.getByLabelText(/role/i);
    fireEvent.change(roleInput, { target: { value: 'A test role' } });
    fireEvent.click(screen.getByTitle('Suggest with AI'));

    await waitFor(() => {
      expect(screen.getByRole('button', { name: /suggest with ai/i }).querySelector('.animate-spin')).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /suggest with ai/i })).toBeDisabled();
    });
  });

  it('triggers confirmation dialog before deploying an agent', async () => {
    render(<AgentForgeApp onAddAgent={mockOnAddAgent} onClose={mockOnClose} />);
    
    // Fill required fields
    fireEvent.change(screen.getByLabelText(/name/i), { target: { value: 'My Agent' } });
    fireEvent.change(screen.getByLabelText(/role/i), { target: { value: 'Test Agent' } });
    fireEvent.click(screen.getByText('Advanced Text')); // Select a skill to make it more realistic

    fireEvent.click(screen.getByRole('button', { name: /deploy agent/i }));

    await waitFor(() => {
      expect(screen.getByRole('dialog', { name: /confirm agent deployment/i })).toBeInTheDocument();
      expect(screen.getByText('Are you sure you want to deploy agent "My Agent"? It will become available across the OS.')).toBeInTheDocument();
    });
  });

  it('deploys agent and shows success message after confirmation', async () => {
    render(<AgentForgeApp onAddAgent={mockOnAddAgent} onClose={mockOnClose} />);
    
    fireEvent.change(screen.getByLabelText(/name/i), { target: { value: 'My Agent' } });
    fireEvent.change(screen.getByLabelText(/role/i), { target: { value: 'Test Agent' } });
    fireEvent.click(screen.getByText('Advanced Text')); 
    fireEvent.click(screen.getByRole('button', { name: /deploy agent/i }));

    await waitFor(() => {
      expect(screen.getByRole('dialog', { name: /confirm agent deployment/i })).toBeInTheDocument();
    });

    fireEvent.click(screen.getByRole('button', { name: /deploy/i })); // Confirm button in dialog

    await waitFor(() => {
      expect(mockOnAddAgent).toHaveBeenCalledTimes(1);
      expect(mockOnAddAgent).toHaveBeenCalledWith(
        expect.objectContaining({
          name: 'My Agent',
          role: 'Test Agent',
          skillIDs: ['gemini-pro-text'], // Advanced Text skill ID
        })
      );
      expect(screen.getByText('Deployment Successful!')).toBeInTheDocument();
      expect(screen.getByText(/your new agent, my agent, is now active/i)).toBeInTheDocument();
    });
  });

  it('allows closing the success screen', async () => {
    render(<AgentForgeApp onAddAgent={mockOnAddAgent} onClose={mockOnClose} />);
    
    fireEvent.change(screen.getByLabelText(/name/i), { target: { value: 'My Agent' } });
    fireEvent.change(screen.getByLabelText(/role/i), { target: { value: 'Test Agent' } });
    fireEvent.click(screen.getByRole('button', { name: /deploy agent/i }));
    await waitFor(() => screen.getByRole('button', { name: /deploy/i }));
    fireEvent.click(screen.getByRole('button', { name: /deploy/i }));
    await waitFor(() => screen.getByText('Deployment Successful!'));

    fireEvent.click(screen.getByRole('button', { name: /close/i }));
    expect(mockOnClose).toHaveBeenCalledTimes(1);
  });
});