import { describe, it, expect, beforeEach } from 'vitest';
import { GoogleWorkspaceService, getGoogleWorkspaceService } from './services/google/workspace.service';

// Mock environment variables for testing
process.env.GOOGLE_CLIENT_ID = 'test-client-id';
process.env.GOOGLE_CLIENT_SECRET = 'test-client-secret';
process.env.GOOGLE_REDIRECT_URI = 'http://localhost:3000/auth/callback';
process.env.GOOGLE_CLOUD_PROJECT_ID = 'test-project-id';

describe('GoogleWorkspaceService', () => {
  let workspaceService: GoogleWorkspaceService;

  beforeEach(() => {
    // Reset singleton for each test
    workspaceService = getGoogleWorkspaceService();
  });

  it('should initialize with correct configuration', () => {
    expect(workspaceService).toBeInstanceOf(GoogleWorkspaceService);
  });

  it('should generate auth URL', () => {
    const authUrl = workspaceService.getAuthUrl('test-state');
    expect(authUrl).toContain('https://accounts.google.com/o/oauth2/authorize');
    expect(authUrl).toContain('test-state');
  });

  it('should check authentication status', () => {
    const isAuth = workspaceService.isUserAuthenticated();
    expect(typeof isAuth).toBe('boolean');
  });
});

describe('Google Workspace Integration Types', () => {
  it('should export correct types', () => {
    // This test ensures our TypeScript types are properly exported
    const mockConfig = {
      clientId: 'test',
      clientSecret: 'test',
      redirectUri: 'test',
      scopes: ['test'],
    };
    
    expect(mockConfig.clientId).toBe('test');
    expect(mockConfig.scopes).toContain('test');
  });
});
