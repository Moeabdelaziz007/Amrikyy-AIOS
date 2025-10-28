import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import TasksWidget from './TasksWidget';
import { Task } from '../types';

describe('TasksWidget', () => {
  const mockTasks: Task[] = [
    { id: 't1', text: 'Prepare Q3 report', completed: false, projectId: 'p1' },
    { id: 't2', text: 'Review design mockups', completed: true, projectId: 'p1' },
    { id: 't3', text: 'Schedule team meeting', completed: false, projectId: 'p2' },
  ];

  it('renders the "My Tasks" title', () => {
    render(<TasksWidget tasks={[]} />);
    expect(screen.getByText('My Tasks')).toBeInTheDocument();
  });

  it('renders all provided tasks', () => {
    render(<TasksWidget tasks={mockTasks} />);

    expect(screen.getByText('Prepare Q3 report')).toBeInTheDocument();
    expect(screen.getByText('Review design mockups')).toBeInTheDocument();
    expect(screen.getByText('Schedule team meeting')).toBeInTheDocument();
  });

  it('displays checkbox for each task', () => {
    render(<TasksWidget tasks={mockTasks} />);

    const checkboxes = screen.getAllByRole('checkbox');
    expect(checkboxes).toHaveLength(mockTasks.length);
    expect(checkboxes[0]).not.toBeChecked();
    expect(checkboxes[1]).toBeChecked();
    expect(checkboxes[2]).not.toBeChecked();
  });

  it('applies "line-through" style to completed tasks', () => {
    render(<TasksWidget tasks={mockTasks} />);

    const completedTask = screen.getByText('Review design mockups');
    expect(completedTask).toHaveClass('line-through');
    expect(completedTask).toHaveClass('text-text-muted');

    const incompleteTask = screen.getByText('Prepare Q3 report');
    expect(incompleteTask).not.toHaveClass('line-through');
  });

  it('renders nothing when no tasks are provided', () => {
    const { queryByText } = render(<TasksWidget tasks={[]} />);
    expect(queryByText('Prepare Q3 report')).not.toBeInTheDocument();
  });

  it('checkboxes are read-only', () => {
    render(<TasksWidget tasks={[mockTasks[0]]} />);
    const checkbox = screen.getByRole('checkbox', { name: 'Prepare Q3 report' });
    expect(checkbox).toHaveAttribute('readOnly');
  });
});