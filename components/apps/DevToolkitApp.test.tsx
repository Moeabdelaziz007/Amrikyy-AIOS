import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import DevToolkitApp from './DevToolkitApp';
import * as geminiAdvancedService from '../../services/geminiAdvancedService';
import { useLanguage } from '../../contexts/LanguageContext';

// Mock contexts
vi.mock('../../contexts/LanguageContext', () => ({
  useLanguage: vi.fn(),
}));

// Mock AI service
vi.mock('../../services/geminiAdvancedService', () => ({
  testSystemPrompt: vi.fn(),
}));

describe('DevToolkitApp', () => {
  const mockT = vi.fn((key: string) => {
    const translations: Record<string, string> = {
      'dev_toolkit.title': 'System Prompt Playground',
      'dev_toolkit.desc': 'Test and refine the core behavior of your AI agents.',
      'dev_toolkit.system_prompt': 'System Instruction',
      'dev_toolkit.user_prompt': 'User Prompt',
      'dev_toolkit.run_test': 'Run Test',
      'dev_toolkit.response': 'AI Response',
    };
    return translations[key] || key;
  });

  beforeEach(() => {
    (useLanguage as vi.Mock).mockReturnValue({ t: mockT });
    (geminiAdvancedService.testSystemPrompt as vi.Mock).mockClear();
  });

  it('renders the app title and description', () => {
    render(<DevToolkitApp />);
    expect(screen.getByText('System Prompt Playground')).toBeInTheDocument();
    expect(screen.getByText('Test and refine the core behavior of your AI agents.')).toBeInTheDocument();
  });

  it('renders system and user prompt input fields', () => {
    render(<DevToolkitApp />);
    expect(screen.getByLabelText('System Instruction')).toBeInTheDocument();
    expect(screen.getByLabelText('User Prompt')).toBeInTheDocument();
  });

  it('renders "Run Test" button and AI Response area', () => {
    render(<DevToolkitApp />);
    expect(screen.getByRole('button', { name: /run test/i })).toBeInTheDocument();
    expect(screen.getByText('AI Response')).toBeInTheDocument();
  });

  it('allows changing system and user prompts', () => {
    render(<DevToolkitApp />);
    const systemPromptInput = screen.getByLabelText('System Instruction');
    const userPromptInput = screen.getByLabelText('User Prompt');

    fireEvent.change(systemPromptInput, { target: { value: 'New system instruction.' } });
    fireEvent.change(userPromptInput, { target: { value: 'New user prompt.' } });

    expect(systemPromptInput).toHaveValue('New system instruction.');
    expect(userPromptInput).toHaveValue('New user prompt.');
  });

  it('calls testSystemPrompt and displays response when "Run Test" is clicked', async () => {
    (geminiAdvancedService.testSystemPrompt as vi.Mock).mockResolvedValue('Mock AI response.');
    render(<DevToolkitApp />);
    
    const systemPromptInput = screen.getByLabelText('System Instruction');
    const userPromptInput = screen.getByLabelText('User Prompt');
    const runTestButton = screen.getByRole('button', { name: /run test/i });

    fireEvent.change(systemPromptInput, { target: { value: 'Be a poet.' } });
    fireEvent.change(userPromptInput, { target: { value: 'Write a haiku about a cat.' } });
    fireEvent.click(runTestButton);

    await waitFor(() => {
      expect(geminiAdvancedService.testSystemPrompt).toHaveBeenCalledWith('Be a poet.', 'Write a haiku about a cat.');
      expect(screen.getByText('Mock AI response.')).toBeInTheDocument();
    });
  });

  it('shows loading state when test is running', async () => {
    (geminiAdvancedService.testSystemPrompt as vi.Mock).mockReturnValue(new Promise(() => {})); // Never resolves
    render(<DevToolkitApp />);

    const userPromptInput = screen.getByLabelText('User Prompt');
    const runTestButton = screen.getByRole('button', { name: /run test/i });

    fireEvent.change(userPromptInput, { target: { value: 'Test query.' } });
    fireEvent.click(runTestButton);

    await waitFor(() => {
      expect(runTestButton).toBeDisabled();
      expect(runTestButton.querySelector('.animate-spin')).toBeInTheDocument();
      expect(screen.getByText('Waiting for response...')).toBeInTheDocument();
    });
  });

  it('displays error message if testSystemPrompt fails', async () => {
    (geminiAdvancedService.testSystemPrompt as vi.Mock).mockRejectedValue(new Error('API failed.'));
    render(<DevToolkitApp />);

    const userPromptInput = screen.getByLabelText('User Prompt');
    const runTestButton = screen.getByRole('button', { name: /run test/i });

    fireEvent.change(userPromptInput, { target: { value: 'Error trigger.' } });
    fireEvent.click(runTestButton);

    await waitFor(() => {
      expect(screen.getByText('Error: API failed.')).toBeInTheDocument();
    });
  });

  it('disables "Run Test" button if user prompt is empty', () => {
    render(<DevToolkitApp />);
    const runTestButton = screen.getByRole('button', { name: /run test/i });
    expect(runTestButton).toBeDisabled();

    fireEvent.change(screen.getByLabelText('User Prompt'), { target: { value: 'Some text' } });
    expect(runTestButton).not.toBeDisabled();
  });
});