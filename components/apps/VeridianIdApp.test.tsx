import { render, screen, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import VeridianIdApp from './VeridianIdApp';
import { useLanguage } from '../../contexts/LanguageContext';
import { UserAccount } from '../../types';

// Mock useLanguage hook
vi.mock('../../contexts/LanguageContext', () => ({
  useLanguage: vi.fn(),
}));

describe('VeridianIdApp', () => {
  const mockUserAccount: UserAccount = {
    osId: 'AMRIYY-OS-USER-7890',
    joinDate: '2023-01-15',
    trustScore: 75,
    name: 'Test User',
    avatar: '👩‍🚀',
    tier: 'Free',
    aiCredits: 100,
    referralCode: 'REF123',
    referralsCount: 0,
    creditsEarnedFromReferrals: 0,
    creatorScore: 0,
  };

  const mockT = vi.fn((key: string) => {
    const translations: Record<string, string> = {
      'app_titles.veridianId': 'Veridian ID',
      'veridian_id.verified_by': 'Verified by Amrikyy AI OS',
      'veridian_id.os_id': 'OS ID',
      'veridian_id.join_date': 'Join Date',
      'veridian_id.trust_score': 'Trust Score',
      'veridian_id.scan_to_verify': 'Scan to verify ID',
    };
    return translations[key] || key;
  });

  beforeEach(() => {
    (useLanguage as vi.Mock).mockReturnValue({ t: mockT });
    vi.useFakeTimers(); // Use fake timers for setInterval
  });

  afterEach(() => {
    vi.useRealTimers(); // Restore real timers
  });

  it('renders the app title and verified message', () => {
    render(<VeridianIdApp userAccount={mockUserAccount} />);
    expect(screen.getByText('Veridian ID')).toBeInTheDocument();
    expect(screen.getByText('Verified by Amrikyy AI OS')).toBeInTheDocument();
  });

  it('displays user account details correctly', () => {
    render(<VeridianIdApp userAccount={mockUserAccount} />);
    expect(screen.getByText('OS ID')).toBeInTheDocument();
    expect(screen.getByText(mockUserAccount.osId)).toBeInTheDocument();
    expect(screen.getByText('Join Date')).toBeInTheDocument();
    expect(screen.getByText(mockUserAccount.joinDate)).toBeInTheDocument();
    expect(screen.getByText('Trust Score')).toBeInTheDocument();
    expect(screen.getByText(`${mockUserAccount.trustScore}/100`)).toBeInTheDocument();
  });

  it('simulates dynamic trust score updates', async () => {
    render(<VeridianIdApp userAccount={mockUserAccount} />);
    
    const initialTrustScore = screen.getByText(`${mockUserAccount.trustScore}/100`);
    expect(initialTrustScore).toBeInTheDocument();

    // Advance timers by the update interval (10 seconds)
    vi.advanceTimersByTime(10000);

    // Trust score should have updated (it's random, so we check it's not the initial)
    await waitFor(() => {
      expect(screen.queryByText(`${mockUserAccount.trustScore}/100`)).not.toBeInTheDocument();
      // Ensure the format is still correct and within expected bounds (50-100)
      const newScoreText = screen.getByText(/([5-9][0-9]|100)\/100/);
      expect(newScoreText).toBeInTheDocument();
    });
  });

  it('renders the QR code and scan instruction', () => {
    render(<VeridianIdApp userAccount={mockUserAccount} />);
    const qrCode = screen.getByLabelText('Scan to verify ID');
    expect(qrCode).toBeInTheDocument();
    expect(screen.getByText('Scan to verify ID')).toBeInTheDocument();
  });
});