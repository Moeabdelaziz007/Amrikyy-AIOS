import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import ResourceHubApp from './ResourceHubApp';
import { useLanguage } from '../../contexts/LanguageContext';

// Mock contexts
vi.mock('../../contexts/LanguageContext', () => ({
  useLanguage: vi.fn(),
}));

describe('ResourceHubApp', () => {
  const mockT = vi.fn((key: string) => key.split('.').pop() || key); // Simple mock for translation

  beforeEach(() => {
    (useLanguage as vi.Mock).mockReturnValue({ t: mockT });
  });

  it('renders the app title and description', () => {
    render(<ResourceHubApp />);
    expect(screen.getByText('Open Source Resource Hub')).toBeInTheDocument();
    expect(screen.getByText('A curated list of tools and libraries for developers and creators.')).toBeInTheDocument();
  });

  it('renders search input and category filters', () => {
    render(<ResourceHubApp />);
    expect(screen.getByPlaceholderText(/search resources/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'All' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'AI/ML' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Frontend' })).toBeInTheDocument();
  });

  it('renders all resources by default', () => {
    render(<ResourceHubApp />);
    expect(screen.getByText('TensorFlow')).toBeInTheDocument();
    expect(screen.getByText('React')).toBeInTheDocument();
    expect(screen.getByText('Figma')).toBeInTheDocument();
    expect(screen.getByText('Visual Studio Code')).toBeInTheDocument();
  });

  it('filters resources by category', () => {
    render(<ResourceHubApp />);
    
    // Filter by AI/ML
    fireEvent.click(screen.getByRole('button', { name: 'AI/ML' }));
    expect(screen.getByText('TensorFlow')).toBeInTheDocument();
    expect(screen.getByText('PyTorch')).toBeInTheDocument();
    expect(screen.queryByText('React')).not.toBeInTheDocument(); // Frontend should be hidden
  });

  it('filters resources by search term (title)', () => {
    render(<ResourceHubApp />);
    const searchInput = screen.getByPlaceholderText(/search resources/i);
    fireEvent.change(searchInput, { target: { value: 'figma' } });
    expect(screen.getByText('Figma')).toBeInTheDocument();
    expect(screen.queryByText('TensorFlow')).not.toBeInTheDocument();
  });

  it('filters resources by search term (description)', () => {
    render(<ResourceHubApp />);
    const searchInput = screen.getByPlaceholderText(/search resources/i);
    fireEvent.change(searchInput, { target: { value: 'interface design' } });
    expect(screen.getByText('Figma')).toBeInTheDocument();
    expect(screen.queryByText('TensorFlow')).not.toBeInTheDocument();
  });

  it('filters resources by search term (tags)', () => {
    render(<ResourceHubApp />);
    const searchInput = screen.getByPlaceholderText(/search resources/i);
    fireEvent.change(searchInput, { target: { value: 'javascript' } });
    expect(screen.getByText('TensorFlow')).toBeInTheDocument(); // Has 'javascript' tag
    expect(screen.getByText('React')).toBeInTheDocument(); // Has 'javascript' tag
    expect(screen.queryByText('Figma')).not.toBeInTheDocument();
  });

  it('displays "No resources found." when no matching resources', () => {
    render(<ResourceHubApp />);
    const searchInput = screen.getByPlaceholderText(/search resources/i);
    fireEvent.change(searchInput, { target: { value: 'nonexistent' } });
    expect(screen.getByText('No resources found.')).toBeInTheDocument();
  });

  it('resource cards have correct link attributes', () => {
    render(<ResourceHubApp />);
    const reactCard = screen.getByText('React').closest('a');
    expect(reactCard).toHaveAttribute('href', 'https://react.dev/');
    expect(reactCard).toHaveAttribute('target', '_blank');
    expect(reactCard).toHaveAttribute('rel', 'noopener noreferrer');
  });
});