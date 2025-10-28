import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import NexusFeedWidget from './NexusFeedWidget';
import { NexusPost } from '../../types';
import { useLanguage } from '../../contexts/LanguageContext';

// Mock the useLanguage hook
vi.mock('../../contexts/LanguageContext', () => ({
  useLanguage: vi.fn(),
}));

describe('NexusFeedWidget', () => {
  const mockT = vi.fn((key: string, options?: any) => {
    switch (key) {
      case 'nexus_feed.title': return 'Nexus Feed';
      case 'nexus_feed.no_posts': return 'The feed is quiet...';
      case 'nexus_feed.comments_button': return `Comments (${options.count})`;
      default: return key.split('.').pop(); // Mock other keys as just their last part
    }
  });

  const mockPosts: NexusPost[] = [
    {
      id: 'post-1',
      author: 'Jane Doe',
      osId: 'jane-os-user-123',
      content: {
        type: 'image',
        title: 'Sunset over Neo-Tokyo',
        subtitle: 'AI-generated cityscape.',
        cta: 'View Image',
        imageUrl: 'https://example.com/sunset.jpg',
      },
      socialPost: {
        caption: 'Loving this AI-generated cityscape!',
        hashtags: ['#AIArt', '#NeoTokyo'],
      },
      likes: 15,
      views: 120,
      comments: [{ id: 'c1', authorName: 'John', osId: 'john-1', text: 'Cool!', timestamp: 0 }],
    },
    {
      id: 'post-2',
      author: 'John Smith',
      osId: 'john-os-user-456',
      content: {
        type: 'text',
        title: 'Thoughts on AI',
        subtitle: 'Just a quick thought on the future of AI in daily life.',
        cta: 'Read More',
      },
      socialPost: {
        caption: 'The future of AI is here!',
        hashtags: ['#AI', '#FutureTech'],
      },
      likes: 5,
      views: 50,
      comments: [],
    },
  ];

  beforeEach(() => {
    (useLanguage as vi.Mock).mockReturnValue({ t: mockT });
  });

  it('renders the Nexus Feed title', () => {
    render(<NexusFeedWidget posts={[]} />);
    expect(screen.getByText('Nexus Feed')).toBeInTheDocument();
  });

  it('displays "no posts" message when the posts array is empty', () => {
    render(<NexusFeedWidget posts={[]} />);
    expect(screen.getByText('The feed is quiet...')).toBeInTheDocument();
  });

  it('renders a list of Nexus posts', () => {
    render(<NexusFeedWidget posts={mockPosts} />);

    expect(screen.getByText('Jane Doe')).toBeInTheDocument();
    expect(screen.getByText(/@jane-123/i)).toBeInTheDocument(); // osId sliced
    expect(screen.getByText('Loving this AI-generated cityscape!')).toBeInTheDocument();
    expect(screen.getByText('#AIArt #NeoTokyo')).toBeInTheDocument();
    expect(screen.getByText('15')).toBeInTheDocument(); // likes
    expect(screen.getByText('Comments (1)')).toBeInTheDocument();
    expect(screen.getByText('120')).toBeInTheDocument(); // views

    expect(screen.getByText('John Smith')).toBeInTheDocument();
    expect(screen.getByText(/@john-456/i)).toBeInTheDocument(); // osId sliced
    expect(screen.getByText('The future of AI is here!')).toBeInTheDocument();
    expect(screen.getByText('#AI #FutureTech')).toBeInTheDocument();
    expect(screen.getByText('5')).toBeInTheDocument(); // likes
    expect(screen.getByText('Comments (0)')).toBeInTheDocument();
    expect(screen.getByText('50')).toBeInTheDocument(); // views
  });

  it('renders post image if imageUrl is provided', () => {
    render(<NexusFeedWidget posts={mockPosts} />);
    const image = screen.getByAltText('Sunset over Neo-Tokyo');
    expect(image).toBeInTheDocument();
    expect(image).toHaveAttribute('src', 'https://example.com/sunset.jpg');
  });

  it('does not render image if imageUrl is not provided', () => {
    render(<NexusFeedWidget posts={mockPosts} />);
    expect(screen.queryByAltText('Thoughts on AI')).not.toBeInTheDocument();
  });
});