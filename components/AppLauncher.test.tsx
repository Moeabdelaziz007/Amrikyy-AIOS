import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import AppLauncher from './AppLauncher';
import { AppID } from '../types';
import { ChatIcon, SettingsIcon, TripIcon } from './Icons'; // Import actual icons for rendering
import { useLanguage } from '../contexts/LanguageContext';

// Mock contexts
vi.mock('../contexts/LanguageContext', () => ({
  useLanguage: vi.fn(),
}));

describe('AppLauncher', () => {
  const mockAllApps = [
    { id: AppID.chat, name: 'AI Chat', icon: ChatIcon },
    { id: AppID.settings, name: 'System Settings', icon: SettingsIcon },
    { id: AppID.travelAgent, name: 'Travel Agent Pro', icon: TripIcon },
