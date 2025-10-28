import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import StoreApp from './StoreApp';
import { useLanguage } from '../../contexts/LanguageContext';
import { UserAccount, CustomAgent, AppID } from '../../types';

// Mock contexts
vi.mock('../../contexts/LanguageContext', () => ({
  useLanguage: vi.fn(),
}));

describe('StoreApp', () => {
  const mockUserAccountFree: UserAccount = {
    osId: 'USER-FREE', name: 'Free User', avatar: '😀', tier: 'Free', aiCredits: 100, joinDate: '', trustScore: 100,
  };
  const mockUserAccountPro: UserAccount = {
    osId: 'USER-PRO', name: 'Pro User', avatar: '😎', tier: 'Pro', aiCredits: 5000, joinDate: '', trustScore: 100,
  };
  const mockOnAddAgent = vi.fn();
  const mockOnOpenApp = vi.fn();
  const mockInstalledAgents: CustomAgent[] = [
    { id: 'community-poetron-3000', name: 'Poetron 3000', role: 'Writer', icon: '✍️', skillIDs: [] },
  ];
  const mockT = vi.fn((key: string) => key.split('.').pop() || key); // Simple mock for translation

  beforeEach(() => {
    (useLanguage as vi.Mock).mockReturnValue({ t: mockT });
    mockOnAddAgent.mockClear();
    mockOnOpenApp.mockClear();
  });

  it('renders the store title and search input', () => {
    render(<StoreApp onAddAgent={mockOnAddAgent} installedAgents={[]} userAccount={mockUserAccountFree} onOpenApp={mockOnOpenApp} />);
    expect(screen.getByText('Gemini Store')).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/search by name or description/i)).toBeInTheDocument();
  });

  it('renders category filters', () => {
    render(<StoreApp onAddAgent={mockOnAddAgent} installedAgents={[]} userAccount={mockUserAccountFree} onOpenApp={mockOnOpenApp} />);
    expect(screen.getByRole('button', { name: 'All' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Productivity' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Creative' })).toBeInTheDocument();
  });

  it('filters agents by category', () => {
    render(<StoreApp onAddAgent={mockOnAddAgent} installedAgents={[]} userAccount={mockUserAccountFree} onOpenApp={mockOnOpenApp} />);
    
    // Default: all agents visible
    expect(screen.getByText('Poetron 3000')).toBeInTheDocument();
    expect(screen.getByText('Code Helper Pro')).toBeInTheDocument();

    // Filter by Creative
    fireEvent.click(screen.getByRole('button', { name: 'Creative' }));
    expect(screen.getByText('Poetron 3000')).toBeInTheDocument();
    expect(screen.getByText('Logo Creator')).toBeInTheDocument();
    expect(screen.queryByText('Code Helper Pro')).not.toBeInTheDocument();
  });

  it('filters agents by search term', () => {
    render(<StoreApp onAddAgent={mockOnAddAgent} installedAgents={[]} userAccount={mockUserAccountFree} onOpenApp={mockOnOpenApp} />);
    const searchInput = screen.getByPlaceholderText(/search by name or description/i);

    fireEvent.change(searchInput, { target: { value: 'code' } });
    expect(screen.getByText('Code Helper Pro')).toBeInTheDocument();
    expect(screen.queryByText('Poetron 3000')).not.toBeInTheDocument();
  });

  it('displays "Installed" for already installed agents', () => {
    render(<StoreApp onAddAgent={mockOnAddAgent} installedAgents={mockInstalledAgents} userAccount={mockUserAccountFree} onOpenApp={mockOnOpenApp} />);
    expect(screen.getByText('Poetron 3000').closest('div')?.querySelector('button')).toHaveTextContent('Installed');
  });

  it('calls onAddAgent for free agents when "Get" is clicked', () => {
    render(<StoreApp onAddAgent={mockOnAddAgent} installedAgents={[]} userAccount={mockUserAccountFree} onOpenApp={mockOnOpenApp} />);
    const focusMaster = screen.getByText('Focus Master').closest('div');
    if (focusMaster) {
        fireEvent.click(focusMaster.querySelector('button')!);
        expect(mockOnAddAgent).toHaveBeenCalledTimes(1);
        expect(mockOnAddAgent).toHaveBeenCalledWith(
            expect.objectContaining({ id: 'community-focus-master', name: 'Focus Master' })
        );
    } else {
        throw new Error("Focus Master agent card not found.");
    }
  });

  it('shows upgrade prompt and calls onOpenApp with "pricing" for paid agents (Free User)', () => {
    const alertSpy = vi.spyOn(window, 'alert').mockImplementation(() => {});
    render(<StoreApp onAddAgent={mockOnAddAgent} installedAgents={[]} userAccount={mockUserAccountFree} onOpenApp={mockOnOpenApp} />);
    const codeHelperPro = screen.getByText('Code Helper Pro').closest('div');
    
    if (codeHelperPro) {
        fireEvent.click(codeHelperPro.querySelector('button')!); // Click "Get for $10"
        expect(alertSpy).toHaveBeenCalledWith('upgrade_prompt_text');
        expect(mockOnOpenApp).toHaveBeenCalledWith('pricing' as AppID);
        expect(mockOnAddAgent).not.toHaveBeenCalled();
    } else {
        throw new Error("Code Helper Pro agent card not found.");
    }
    alertSpy.mockRestore();
  });

  it('installs paid agents for Pro user', () => {
    render(<StoreApp onAddAgent={mockOnAddAgent} installedAgents={[]} userAccount={mockUserAccountPro} onOpenApp={mockOnOpenApp} />);
    const codeHelperPro = screen.getByText('Code Helper Pro').closest('div');
    if (codeHelperPro) {
        fireEvent.click(codeHelperPro.querySelector('button')!); // Click "Get for $10"
        expect(mockOnAddAgent).toHaveBeenCalledTimes(1);
        expect(mockOnAddAgent).toHaveBeenCalledWith(
            expect.objectContaining({ id: 'community-code-helper', name: 'Code Helper Pro' })
        );
        expect(mockOnOpenApp).not.toHaveBeenCalled(); // No pricing app for Pro user
    } else {
        throw new Error("Code Helper Pro agent card not found.");
    }
  });

  it('opens agent detail modal when agent card is clicked', () => {
    render(<StoreApp onAddAgent={mockOnAddAgent} installedAgents={[]} userAccount={mockUserAccountFree} onOpenApp={mockOnOpenApp} />);
    fireEvent.click(screen.getByText('Poetron 3000'));
    expect(screen.getByRole('dialog', { name: /poetron 3000/i })).toBeInTheDocument();
    expect(screen.getByText(/your perfect partner for crafting beautiful poems/i)).toBeInTheDocument();
  });

  it('closes agent detail modal when cancel button is clicked', () => {
    render(<StoreApp onAddAgent={mockOnAddAgent} installedAgents={[]} userAccount={mockUserAccountFree} onOpenApp={mockOnOpenApp} />);
    fireEvent.click(screen.getByText('Poetron 3000'));
    expect(screen.getByRole('dialog', { name: /poetron 3000/i })).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: /cancel/i }));
    expect(screen.queryByRole('dialog', { name: /poetron 3000/i })).not.toBeInTheDocument();
  });
});