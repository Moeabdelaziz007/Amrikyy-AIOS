import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import ProjectsWidget from './ProjectsWidget';
import { Project } from '../types';

describe('ProjectsWidget', () => {
  const mockProjects: Project[] = [
    { id: 'p1', name: 'Website Redesign', description: 'Redesign the company website', status: 'Active', earnings: 1500 },
    { id: 'p2', name: 'Mobile App Launch', description: 'Launch new mobile application', status: 'Completed', earnings: 5000 },
    { id: 'p3', name: 'SEO Campaign', description: 'Boost organic search rankings', status: 'Paused', earnings: 800 },
  ];

  it('renders the "Active Projects" title', () => {
    render(<ProjectsWidget projects={[]} />);
    expect(screen.getByText('Active Projects')).toBeInTheDocument();
  });

  it('renders all provided projects', () => {
    render(<ProjectsWidget projects={mockProjects} />);

    expect(screen.getByText('Website Redesign')).toBeInTheDocument();
    expect(screen.getByText('Mobile App Launch')).toBeInTheDocument();
    expect(screen.getByText('SEO Campaign')).toBeInTheDocument();
  });

  it('displays project status correctly', () => {
    render(<ProjectsWidget projects={mockProjects} />);

    expect(screen.getByText('Active')).toBeInTheDocument();
    expect(screen.getByText('Completed')).toBeInTheDocument();
    expect(screen.getByText('Paused')).toBeInTheDocument();
  });

  it('displays project earnings correctly', () => {
    render(<ProjectsWidget projects={mockProjects} />);

    expect(screen.getByText('Earnings: $1500')).toBeInTheDocument();
    expect(screen.getByText('Earnings: $5000')).toBeInTheDocument();
    expect(screen.getByText('Earnings: $800')).toBeInTheDocument();
  });

  it('renders nothing when no projects are provided', () => {
    const { queryByText } = render(<ProjectsWidget projects={[]} />);
    expect(queryByText('Website Redesign')).not.toBeInTheDocument();
    expect(queryByText('Mobile App Launch')).not.toBeInTheDocument();
  });

  it('applies status styling (smoke test for class existence)', () => {
    render(<ProjectsWidget projects={[mockProjects[0]]} />); // Render only one project for simplicity
    const activeStatusSpan = screen.getByText('Active');
    expect(activeStatusSpan).toHaveClass('bg-green-500/20');
    expect(activeStatusSpan).toHaveClass('text-green-300');
  });
});