import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import CreatorStudioApp from './CreatorStudioApp';
import { Project, SharedContent } from '../../types';
import { useLanguage } from '../../contexts/LanguageContext';
import * as geminiService from '../../services/geminiService'; // Mock for AI Assistant tab

// Mock contexts
vi.mock('../../contexts/LanguageContext', () => ({
  useLanguage: vi.fn(),
}));

// Mock services
vi.mock('../../services/geminiService', () => ({
  generateResponse: vi.fn(),
}));

describe('CreatorStudioApp', () => {
  const mockProjects: Project[] = [
    { id: 'p1', name: 'Project Alpha', description: 'Desc Alpha', status: 'Active', earnings: 100 },
    { id: 'p2', name: 'Project Beta', description: 'Desc Beta', status: 'Completed', earnings: 500 },
  ];
  const mockOnAddProject = vi.fn();
  const mockOnShare = vi.fn();
  const mockT = vi.fn((key: string) => key.split('.').pop() || key); // Simple mock for translation

  beforeEach(() => {
    (useLanguage as vi.Mock).mockReturnValue({ t: mockT });
    mockOnAddProject.mockClear();
    mockOnShare.mockClear();
    (geminiService.generateResponse as vi.Mock).mockClear();
  });

  it('renders with "Dashboard" tab active by default and shows project stats', () => {
    render(<CreatorStudioApp projects={mockProjects} onAddProject={mockOnAddProject} onShare={mockOnShare} />);
    expect(screen.getByRole('button', { name: /dashboard/i, pressed: true })).toBeInTheDocument();
    expect(screen.getByText('Total Earnings')).toBeInTheDocument();
    expect(screen.getByText('$600')).toBeInTheDocument(); // 100 + 500
    expect(screen.getByText('Active Projects')).toBeInTheDocument();
    expect(screen.getByText('1')).toBeInTheDocument(); // Only Project Alpha is active
    expect(screen.getByText('Project Alpha')).toBeInTheDocument();
  });

  it('switches tabs correctly when buttons are clicked', () => {
    render(<CreatorStudioApp projects={mockProjects} onAddProject={mockOnAddProject} onShare={mockOnShare} />);
    
    // Switch to AI Assistant
    fireEvent.click(screen.getByRole('button', { name: /ai assistant/i }));
    expect(screen.getByText('Ask for business advice...')).toBeInTheDocument();

    // Switch to New Project
    fireEvent.click(screen.getByRole('button', { name: /new project/i }));
    expect(screen.getByText('Launch a New Venture')).toBeInTheDocument();
  });

  it('allows adding a new project in "New Project" tab', async () => {
    render(<CreatorStudioApp projects={mockProjects} onAddProject={mockOnAddProject} onShare={mockOnShare} />);
    fireEvent.click(screen.getByRole('button', { name: /new project/i }));

    const nameInput = screen.getByLabelText(/project name/i);
    const descriptionInput = screen.getByLabelText(/brief description/i);
    const createButton = screen.getByRole('button', { name: /create project/i });

    fireEvent.change(nameInput, { target: { value: 'Project Gamma' } });
    fireEvent.change(descriptionInput, { target: { value: 'New big idea' } });
    fireEvent.click(createButton);

    await waitFor(() => {
      expect(mockOnAddProject).toHaveBeenCalledTimes(1);
      expect(mockOnAddProject).toHaveBeenCalledWith(
        expect.objectContaining({ name: 'Project Gamma', description: 'New big idea', status: 'Active', earnings: 0 })
      );
    });
    // Should switch back to Dashboard after creation
    expect(screen.getByText('Project Alpha')).toBeInTheDocument();
  });

  it('sends message and displays AI response in "AI Assistant" tab', async () => {
    (geminiService.generateResponse as vi.Mock).mockResolvedValue('AI business advice');
    render(<CreatorStudioApp projects={mockProjects} onAddProject={mockOnAddProject} onShare={mockOnShare} />);
    fireEvent.click(screen.getByRole('button', { name: /ai assistant/i }));

    const chatInput = screen.getByPlaceholderText(/ask for business advice/i);
    fireEvent.change(chatInput, { target: { value: 'How to market my app?' } });
    fireEvent.click(screen.getByRole('button', { name: /send/i }));

    await waitFor(() => {
      expect(geminiService.generateResponse).toHaveBeenCalledWith(
        'As a business strategist named Atlas, answer this: How to market my app?',
        expect.any(Array) // Expecting history to be passed
      );
      expect(screen.getByText('AI business advice')).toBeInTheDocument();
    });
  });

  it('calls onShare when share button on a project is clicked', () => {
    render(<CreatorStudioApp projects={mockProjects} onAddProject={mockOnAddProject} onShare={mockOnShare} />);
    
    // Find the share button for 'Project Alpha'
    const shareButton = screen.getByRole('button', { name: /share project alpha/i });
    fireEvent.click(shareButton);

    expect(mockOnShare).toHaveBeenCalledTimes(1);
    expect(mockOnShare).toHaveBeenCalledWith({
      type: 'project',
      title: 'Project Alpha',
      subtitle: 'Desc Alpha',
      cta: 'Check Out My New Project',
    });
  });

  it('project earnings are displayed correctly', () => {
    render(<CreatorStudioApp projects={mockProjects} onAddProject={mockOnAddProject} onShare={mockOnShare} />);
    expect(screen.getByText('$100')).toBeInTheDocument(); // Earnings for Project Alpha
    expect(screen.getByText('$500')).toBeInTheDocument(); // Earnings for Project Beta
  });

  it('project status is displayed correctly with styling (smoke test for class)', () => {
    render(<CreatorStudioApp projects={mockProjects} onAddProject={mockOnAddProject} onShare={mockOnShare} />);
    const activeStatus = screen.getByText('Active');
    expect(activeStatus).toBeInTheDocument();
    expect(activeStatus).toHaveClass('bg-green-500'); // Check for specific class
  });
});