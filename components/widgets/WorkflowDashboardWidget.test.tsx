import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import WorkflowDashboardWidget from './WorkflowDashboardWidget';
import { AppID } from '../../types';

describe('WorkflowDashboardWidget', () => {
  it('renders the title and active workflow information', () => {
    const onOpenApp = vi.fn();
    render(<WorkflowDashboardWidget onOpenApp={onOpenApp} />);

    expect(screen.getByText('Active Workflows')).toBeInTheDocument();
    expect(screen.getByText('Generating Travel Plan: Tokyo')).toBeInTheDocument();
    expect(screen.getByText('75%')).toBeInTheDocument();
    expect(screen.getByText('Agent: Karim - Optimizing Budget')).toBeInTheDocument();
  });

  it('calls onOpenApp with "workflow" when the "New +" button is clicked', () => {
    const onOpenApp = vi.fn();
    render(<WorkflowDashboardWidget onOpenApp={onOpenApp} />);

    const newButton = screen.getByRole('button', { name: /new \+/i });
    fireEvent.click(newButton);

    expect(onOpenApp).toHaveBeenCalledTimes(1);
    expect(onOpenApp).toHaveBeenCalledWith('workflow' as AppID);
  });

  it('has correct ARIA attributes for accessibility', () => {
    const onOpenApp = vi.fn();
    const { container } = render(<WorkflowDashboardWidget onOpenApp={onOpenApp} />);

    const newButton = screen.getByRole('button', { name: /new \+/i });
    expect(newButton).toHaveAttribute('type', 'button');

    // Ensure there are no critical accessibility violations (basic check)
    // More extensive a11y tests would use axe-core
    expect(container.querySelector('[aria-label]')).toBeNull(); // No redundant aria-label on this component as text is sufficient
  });
});