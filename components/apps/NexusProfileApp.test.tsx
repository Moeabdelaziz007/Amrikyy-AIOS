import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import NexusProfileApp from './NexusProfileApp';
import { UserAccount, NexusPost, AppID } from '../../types';
import { useLanguage } from '../../contexts/LanguageContext';

// Mock contexts
vi.mock('../../contexts/LanguageContext', () => ({
  useLanguage: vi.fn(),
}));

describe('NexusProfileApp', () => {
  const mockUserAccount: UserAccount = {
    osId: 'AMRIYY-OS-USER-7890',
    name: 'Test User',
    avatar: '👨‍🚀',
    tier: 'Free',
    aiCredits: 1000,
    referralCode: 'REF123',
    referralsCount: 5,
    creditsEarnedFromReferrals: 2500,
    creatorScore: 1200,
    joinDate: '2023-01-01',
    trustScore: 85,
  };

  const mockUserPosts: NexusPost[] = [
    {
      id: 'post-1', author: 'Test User', osId: 'AMRIYY-OS-USER-7890',
      content: { type: 'image', title: 'My AI Art', subtitle: 'Beautiful landscape.', cta: 'View' },
      socialPost: { caption: 'Check out my AI art!', hashtags: ['#AIArt'] },
      likes: 50, views: 200, comments: [],
    },
    {
      id: 'post-2', author: 'Test User', osId: 'AMRIYY-OS-USER-7890',
      content: { type: 'text', title: 'My Thoughts', subtitle: 'Deep AI thoughts.', cta: 'Read' },
      socialPost: { caption: 'Thoughts on AI...', hashtags: ['#AILife'] },
      likes: 20, views: 100, comments: [],
    },
  ];

  const mockOnOpenApp = vi.fn();
  const mockT = vi.fn((key: string, options?: any) => {
    const translations: Record<string, string> = {
      'nexus_profile.title': 'Nexus Profile',
      'nexus_profile.total_posts': 'Total Posts',
      'nexus_profile.total_likes': 'Total Likes',
      'nexus_profile.avg_engagement': 'Avg. Engagement',
      'nexus_profile.edit_profile': 'Edit Profile',
      'nexus_profile.user_posts': 'My Posts',
      'nexus_feed.no_posts': 'No posts yet. Share your first creation!',
      'veridian_id.os_id': 'OS ID',
      'veridian_id.join_date': 'Join Date',
      'veridian_id.trust_score': 'Trust Score',
      'app_titles.nexusProfile': 'Nexus Profile',
    };
    return translations[key] || key;
  });

  beforeEach(() => {
    (useLanguage as vi.Mock).mockReturnValue({ t: mockT });
    mockOnOpenApp.mockClear();
  });

  it('renders the Nexus Profile title', () => {
    render(<NexusProfileApp userAccount={mockUserAccount} nexusPosts={[]} onOpenApp={mockOnOpenApp} />);
    expect(screen.getByText('Nexus Profile')).toBeInTheDocument();
  });

  it('displays user profile header with name, avatar, and stats', () => {
    render(<NexusProfileApp userAccount={mockUserAccount} nexusPosts={mockUserPosts} onOpenApp={mockOnOpenApp} />);
    
    expect(screen.getByText(mockUserAccount.name)).toBeInTheDocument();
    expect(screen.getByText(mockUserAccount.avatar)).toBeInTheDocument(); // Avatar emoji
    expect(screen.getByText(/@user-7890/i)).toBeInTheDocument();

    expect(screen.getByText('Total Posts')).toBeInTheDocument();
    expect(screen.getByText('2')).toBeInTheDocument(); // 2 posts

    expect(screen.getByText('Total Likes')).toBeInTheDocument();
    expect(screen.getByText('70')).toBeInTheDocument(); // 50 + 20

    expect(screen.getByText('Avg. Engagement')).toBeInTheDocument();
    expect(screen.getByText('35.0%')).toBeInTheDocument(); // (70/2) = 35
  });

  it('calls onOpenApp with settings and initialSection: profile when "Edit Profile" is clicked', () => {
    render(<NexusProfileApp userAccount={mockUserAccount} nexusPosts={[]} onOpenApp={mockOnOpenApp} />);
    fireEvent.click(screen.getByRole('button', { name: /edit profile/i }));
    expect(mockOnOpenApp).toHaveBeenCalledTimes(1);
    expect(mockOnOpenApp).toHaveBeenCalledWith(AppID.settings, { initialSection: 'profile' });
  });

  it('displays Veridian ID details', () => {
    render(<NexusProfileApp userAccount={mockUserAccount} nexusPosts={[]} onOpenApp={mockOnOpenApp} />);
    expect(screen.getByText('Veridian ID')).toBeInTheDocument();
    expect(screen.getByText('OS ID')).toBeInTheDocument();
    expect(screen.getByText(mockUserAccount.osId)).toBeInTheDocument();
    expect(screen.getByText('Join Date')).toBeInTheDocument();
    expect(screen.getByText(mockUserAccount.joinDate)).toBeInTheDocument();
    expect(screen.getByText('Trust Score')).toBeInTheDocument();
    expect(screen.getByText(`${mockUserAccount.trustScore}/100`)).toBeInTheDocument();
  });

  it('renders user\'s posts correctly', () => {
    render(<NexusProfileApp userAccount={mockUserAccount} nexusPosts={mockUserPosts} onOpenApp={mockOnOpenApp} />);
    expect(screen.getByText('My Posts')).toBeInTheDocument();
    expect(screen.getByText('Check out my AI art!')).toBeInTheDocument();
    expect(screen.getByText('Thoughts on AI...')).toBeInTheDocument();
    expect(screen.getByAltText('My AI Art')).toBeInTheDocument();
  });

  it('displays "No posts yet." message when user has no posts', () => {
    render(<NexusProfileApp userAccount={mockUserAccount} nexusPosts={[]} onOpenApp={mockOnOpenApp} />);
    expect(screen.getByText('No posts yet. Share your first creation!')).toBeInTheDocument();
  });

  it('post cards display likes and comments count', () => {
    render(<NexusProfileApp userAccount={mockUserAccount} nexusPosts={mockUserPosts} onOpenApp={mockOnOpenApp} />);
    const post1 = screen.getByText('Check out my AI art!').closest('div');
    expect(post1).toHaveTextContent('50'); // Likes
    expect(post1).toHaveTextContent('0'); // Comments

    const post2 = screen.getByText('Thoughts on AI...').closest('div');
    expect(post2).toHaveTextContent('20'); // Likes
    expect(post2).toHaveTextContent('0'); // Comments
  });
});