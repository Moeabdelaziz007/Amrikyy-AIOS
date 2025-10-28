import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import QuickActionsWidget from './QuickActionsWidget';
import { AppID } from '../../types';

describe('QuickActionsWidget', () => {
  const mockOnOpenApp = vi.fn();

  beforeEach(() => {
    mockOnOpenApp.mockClear();
  });

  it('renders the "Quick Actions" title', () => {
    render(<QuickActionsWidget onOpenApp={mockOnOpenApp} />);
    expect(screen.getByText('Quick Actions')).toBeInTheDocument();
  });

  it('renders all quick action buttons', () => {
    render(<QuickActionsWidget onOpenApp={mockOnOpenApp} />);

    expect(screen.getByRole('button', { name: /new project/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /plan a trip/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /generate image/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /start workflow/i })).toBeInTheDocument();
  });

  it('calls onOpenApp with correct AppID when "New Project" is clicked', () => {
    render(<QuickActionsWidget onOpenApp={mockOnOpenApp} />);
    fireEvent.click(screen.getByRole('button', { name: /new project/i }));
    expect(mockOnOpenApp).toHaveBeenCalledTimes(1);
    expect(mockOnOpenApp).toHaveBeenCalledWith('creatorStudio' as AppID);
  });

  it('calls onOpenApp with correct AppID when "Plan a Trip" is clicked', () => {
    render(<QuickActionsWidget onOpenApp={mockOnOpenApp} />);
    fireEvent.click(screen.getByRole('button', { name: /plan a trip/i }));
    expect(mockOnOpenApp).toHaveBeenCalledTimes(1);
    expect(mockOnOpenApp).toHaveBeenCalledWith('travelAgent' as AppID);
  });

  it('calls onOpenApp with correct AppID when "Generate Image" is clicked', () => {
    render(<QuickActionsWidget onOpenApp={mockOnOpenApp} />);
    fireEvent.click(screen.getByRole('button', { name: /generate image/i }));
    expect(mockOnOpenApp).toHaveBeenCalledTimes(1);
    expect(mockOnOpenApp).toHaveBeenCalledWith('image' as AppID);
  });

  it('calls onOpenApp with correct AppID when "Start Workflow" is clicked', () => {
    render(<QuickActionsWidget onOpenApp={mockOnOpenApp} />);
    fireEvent.click(screen.getByRole('button', { name: /start workflow/i }));
    expect(mockOnOpenApp).toHaveBeenCalledTimes(1);
    expect(mockOnOpenApp).toHaveBeenCalledWith('workflow' as AppID);
  });
});