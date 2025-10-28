import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import GrowthHubApp from './GrowthHubApp';
import { UserAccount, CreatorBounty, AppID } from '../../types';
import { useLanguage } from '../../contexts/LanguageContext';

// Mock contexts
vi.mock('../../contexts/LanguageContext', () => ({
  useLanguage: vi.fn(),
}));

describe('GrowthHubApp', () => {
  const mockUserAccount: UserAccount = {
    osId: 'USER-123', name: 'Creator John', avatar: '👨‍🎨', tier: 'Pro', aiCredits: 1000,
    referralCode: 'CREATOR', referralsCount: 5, creditsEarnedFromReferrals: 2500,
    creatorScore: 1200, joinDate: '2023-01-01', trustScore: 90,
  };

  const mockBounties: CreatorBounty[] = [
    { id: 'b1', title: 'First Creation', description: 'Share an image', creditReward: 250, action: { type: 'share_content' } },
    { id: 'b2', title: 'Forge Agent', description: 'Create an agent', creditReward: 300, action: { type: 'create_agent' } },
    { id: 'b3', title: 'Explore Hub', description: 'Open Resource Hub', creditReward: 50, action: { type: 'open_app', appId: AppID.resourceHub } },
  ];

  const mockCompletedBounties = new Set<string>(['b1']); // Only b1 is completed
  const mockOnCompleteBounty = vi.fn();
  const mockT = vi.fn((key: string) => key.split('.').pop() || key); // Simple mock for translation

  beforeEach(() => {
    (useLanguage as vi.Mock).mockReturnValue({ t: mockT });
    mockOnCompleteBounty.mockClear();
  });

  it('renders the app title', () => {
    render(<GrowthHubApp userAccount={mockUserAccount} bounties={[]} completedBounties={new Set()} onCompleteBounty={mockOnCompleteBounty} />);
    expect(screen.getByText('Creator Rewards Program')).toBeInTheDocument();
  });

  it('displays user stats correctly', () => {
    render(<GrowthHubApp userAccount={mockUserAccount} bounties={mockBounties} completedBounties={mockCompletedBounties} onCompleteBounty={mockOnCompleteBounty} />);
    
    expect(screen.getByText('Creator Score')).toBeInTheDocument();
    expect(screen.getByText('1200')).toBeInTheDocument(); // From mockUserAccount

    expect(screen.getByText('Bounties Completed')).toBeInTheDocument();
    expect(screen.getByText('1 / 3')).toBeInTheDocument(); // 1 completed out of 3 total

    expect(screen.getByText('Total Credits Earned')).toBeInTheDocument();
    expect(screen.getByText('250')).toBeInTheDocument(); // Only 'b1' completed, reward is 250
  });

  it('renders bounties and their descriptions', () => {
    render(<GrowthHubApp userAccount={mockUserAccount} bounties={mockBounties} completedBounties={mockCompletedBounties} onCompleteBounty={mockOnCompleteBounty} />);
    
    expect(screen.getByText('Creator Bounties')).toBeInTheDocument();
    expect(screen.getByText('First Creation')).toBeInTheDocument();
    expect(screen.getByText('Forge Agent')).toBeInTheDocument();
    expect(screen.getByText('Explore Hub')).toBeInTheDocument();
  });

  it('marks completed bounties with "Completed" status and disables button', () => {
    render(<GrowthHubApp userAccount={mockUserAccount} bounties={mockBounties} completedBounties={mockCompletedBounties} onCompleteBounty={mockOnCompleteBounty} />);
    
    const firstCreationBounty = screen.getByText('First Creation').closest('.flex');
    expect(firstCreationBounty).toHaveClass('bg-green-500/10');
    expect(firstCreationBounty?.querySelector('button')).toHaveTextContent('Completed');
    expect(firstCreationBounty?.querySelector('button')).toBeDisabled();
  });

  it('enables "Claim Reward" button for uncompleted bounties', () => {
    render(<GrowthHubApp userAccount={mockUserAccount} bounties={mockBounties} completedBounties={mockCompletedBounties} onCompleteBounty={mockOnCompleteBounty} />);
    
    const forgeAgentBounty = screen.getByText('Forge Agent').closest('.flex');
    expect(forgeAgentBounty?.querySelector('button')).toHaveTextContent('Claim Reward');
    expect(forgeAgentBounty?.querySelector('button')).not.toBeDisabled();
  });

  it('calls onCompleteBounty when "Claim Reward" is clicked', () => {
    render(<GrowthHubApp userAccount={mockUserAccount} bounties={mockBounties} completedBounties={mockCompletedBounties} onCompleteBounty={mockOnCompleteBounty} />);
    
    fireEvent.click(screen.getByRole('button', { name: 'Claim Reward' }));
    expect(mockOnCompleteBounty).toHaveBeenCalledTimes(1);
    expect(mockOnCompleteBounty).toHaveBeenCalledWith('b2'); // id of 'Forge Agent'
  });

  it('displays correct credit rewards for bounties', () => {
    render(<GrowthHubApp userAccount={mockUserAccount} bounties={mockBounties} completedBounties={mockCompletedBounties} onCompleteBounty={mockOnCompleteBounty} />);
    expect(screen.getByText('+250 Credits')).toBeInTheDocument();
    expect(screen.getByText('+300 Credits')).toBeInTheDocument();
    expect(screen.getByText('+50 Credits')).toBeInTheDocument();
  });

  it('handles empty bounties list gracefully', () => {
    render(<GrowthHubApp userAccount={mockUserAccount} bounties={[]} completedBounties={new Set()} onCompleteBounty={mockOnCompleteBounty} />);
    expect(screen.queryByText('First Creation')).not.toBeInTheDocument();
    expect(screen.queryByText('Forge Agent')).not.toBeInTheDocument();
  });
});