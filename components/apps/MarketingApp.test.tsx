import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import MarketingApp from './MarketingApp';
import * as geminiAdvancedService from '../../services/geminiAdvancedService';
import { useNotification } from '../../contexts/NotificationContext';
import { useLanguage } from '../../contexts/LanguageContext';

// Mock contexts
vi.mock('../../contexts/NotificationContext', () => ({
  useNotification: vi.fn(),
}));
vi.mock('../../contexts/LanguageContext', () => ({
  useLanguage: vi.fn(),
}));

// Mock AI service
vi.mock('../../services/geminiAdvancedService', () => ({
  generateSeoIdeas: vi.fn(),
  createAdCopy: vi.fn(),
}));

describe('MarketingApp', () => {
  const mockAddNotification = vi.fn();
  const mockT = vi.fn((key: string) => key.split('.').pop() || key); // Simple mock for translation

  beforeEach(() => {
    (useNotification as vi.Mock).mockReturnValue({ addNotification: mockAddNotification });
    (useLanguage as vi.Mock).mockReturnValue({ t: mockT });
    (geminiAdvancedService.generateSeoIdeas as vi.Mock).mockClear();
    (geminiAdvancedService.createAdCopy as vi.Mock).mockClear();
  });

  it('renders with "SEO" tab active by default', () => {
    render(<MarketingApp />);
    expect(screen.getByRole('button', { name: /seo/i, pressed: true })).toBeInTheDocument();
    expect(screen.getByText('Content Input')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('https://example.com')).toBeInTheDocument();
  });

  it('switches tabs correctly when buttons are clicked', () => {
    render(<MarketingApp />);
    
    // Switch to Ads
    fireEvent.click(screen.getByRole('button', { name: /ads/i }));
    expect(screen.getByText('AI Ad Studio')).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/an ai-powered os for creative professionals/i)).toBeInTheDocument();

    // Switch to Social
    fireEvent.click(screen.getByRole('button', { name: /social/i }));
    expect(screen.getByText('Social Analytics for Nexus')).toBeInTheDocument();
    expect(screen.getByText(/track your post performance/i)).toBeInTheDocument();
  });

  it('generates SEO strategy when "Generate AI Strategy" is clicked in SEO tab', async () => {
    (geminiAdvancedService.generateSeoIdeas as vi.Mock).mockResolvedValue({
      keywords: ['AI', 'Marketing'],
      blogOutline: { title: 'AI in Marketing', points: ['Intro'] },
      adCopy: ['Amazing AI'],
    });
    render(<MarketingApp />);

    const urlInput = screen.getByLabelText(/website url/i);
    const topicInput = screen.getByLabelText(/primary topic\/keyword/i);
    fireEvent.change(urlInput, { target: { value: 'https://amrikyyaios.com' } });
    fireEvent.change(topicInput, { target: { value: 'AI Marketing' } });
    fireEvent.click(screen.getByRole('button', { name: /generate ai strategy/i }));

    await waitFor(() => {
      expect(geminiAdvancedService.generateSeoIdeas).toHaveBeenCalledWith('https://amrikyyaios.com', 'AI Marketing');
      expect(screen.getByText('Target Keywords')).toBeInTheDocument();
      expect(screen.getByText('AI')).toBeInTheDocument();
      expect(screen.getByText('Marketing')).toBeInTheDocument();
    });
  });

  it('shows loading state during SEO generation', async () => {
    (geminiAdvancedService.generateSeoIdeas as vi.Mock).mockReturnValue(new Promise(() => {})); // Never resolves
    render(<MarketingApp />);
    
    const urlInput = screen.getByLabelText(/website url/i);
    const topicInput = screen.getByLabelText(/primary topic\/keyword/i);
    fireEvent.change(urlInput, { target: { value: 'https://amrikyyaios.com' } });
    fireEvent.change(topicInput, { target: { value: 'AI Marketing' } });
    fireEvent.click(screen.getByRole('button', { name: /generate ai strategy/i }));

    await waitFor(() => {
      expect(screen.getByText('Generating Strategy...')).toBeInTheDocument();
    });
  });

  it('generates ad copy when "Generate AI Ad Copy" is clicked in Ads tab', async () => {
    (geminiAdvancedService.createAdCopy as vi.Mock).mockResolvedValue({
      headline: 'Best AI Ever!',
      body: 'Get yours now.',
      cta: 'Buy!',
    });
    render(<MarketingApp />);
    fireEvent.click(screen.getByRole('button', { name: /ads/i }));

    const productDescInput = screen.getByLabelText(/product\/service description/i);
    const targetAudienceInput = screen.getByLabelText(/target audience/i);
    fireEvent.change(productDescInput, { target: { value: 'AI OS' } });
    fireEvent.change(targetAudienceInput, { target: { value: 'Everyone' } });
    fireEvent.click(screen.getByRole('button', { name: /generate ai ad copy/i }));

    await waitFor(() => {
      expect(geminiAdvancedService.createAdCopy).toHaveBeenCalledWith('AI OS', 'Everyone');
      expect(screen.getByText('Headline')).toBeInTheDocument();
      expect(screen.getByText('Best AI Ever!')).toBeInTheDocument();
      expect(mockAddNotification).toHaveBeenCalledWith('Ad copy generated successfully!', 'success');
    });
  });

  it('shows alert if required fields are missing for SEO generation', async () => {
    const alertSpy = vi.spyOn(window, 'alert').mockImplementation(() => {});
    render(<MarketingApp />);
    fireEvent.click(screen.getByRole('button', { name: /generate ai strategy/i })); // Missing URL and Topic
    expect(alertSpy).toHaveBeenCalledWith('Please provide both a URL and a topic.');
    alertSpy.mockRestore();
  });
});