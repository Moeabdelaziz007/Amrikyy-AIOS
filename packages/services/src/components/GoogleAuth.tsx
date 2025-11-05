import React, { useState, useEffect, useCallback } from 'react';
import { getGoogleWorkspaceService, GoogleAuthTokens } from '../services/google/workspace.service';

interface GoogleAuthProps {
  onAuthSuccess?: (tokens: GoogleAuthTokens) => void;
  onAuthError?: (error: Error) => void;
  onLogout?: () => void;
  className?: string;
}

/**
 * Google Authentication Component
 * Handles OAuth2 flow for Google Workspace integration
 */
export const GoogleAuth: React.FC<GoogleAuthProps> = ({
  onAuthSuccess,
  onAuthError,
  onLogout,
  className = '',
}) => {
  const [isLoading, setIsLoading] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [userInfo, setUserInfo] = useState<any>(null);
  const [showPopup, setShowPopup] = useState(false);

  const workspaceService = getGoogleWorkspaceService();

  // Check authentication status on mount
  useEffect(() => {
    checkAuthStatus();
  }, []);

  const checkAuthStatus = useCallback(async () => {
    try {
      // Check if we have stored tokens
      const storedTokens = localStorage.getItem('google_auth_tokens');
      
      if (storedTokens) {
        const tokens: GoogleAuthTokens = JSON.parse(storedTokens);
        
        // Check if tokens are still valid
        if (new Date(tokens.expiryDate) > new Date()) {
          // Tokens are valid, initialize service
          await workspaceService.refreshAccessToken(tokens.refreshToken);
          setIsAuthenticated(true);
          setUserInfo(await getUserInfo());
          onAuthSuccess?.(tokens);
        } else {
          // Tokens expired, clear them
          localStorage.removeItem('google_auth_tokens');
        }
      }
    } catch (error) {
      console.error('Error checking auth status:', error);
      onAuthError?.(error as Error);
    }
  }, [workspaceService, onAuthSuccess, onAuthError]);

  const handleLogin = useCallback(async () => {
    try {
      setIsLoading(true);
      
      // Generate auth URL
      const authUrl = workspaceService.getAuthUrl('creator-studio-login');
      
      // Open popup for OAuth flow
      const popup = window.open(
        authUrl,
        'google-auth',
        'width=500,height=600,scrollbars=yes,resizable=yes'
      );
      
      if (!popup) {
        throw new Error('Popup blocked. Please allow popups for this site.');
      }
      
      setShowPopup(true);
      
      // Listen for messages from popup
      const messageHandler = async (event: MessageEvent) => {
        if (event.origin !== window.location.origin) return;
        
        if (event.data.type === 'GOOGLE_AUTH_SUCCESS') {
          const { code, state } = event.data;
          
          if (state === 'creator-studio-login') {
            // Exchange code for tokens
            const tokens = await workspaceService.exchangeCodeForTokens(code);
            
            // Store tokens
            localStorage.setItem('google_auth_tokens', JSON.stringify(tokens));
            
            setIsAuthenticated(true);
            setUserInfo(await getUserInfo());
            onAuthSuccess?.(tokens);
          }
          
          popup.close();
          setShowPopup(false);
          window.removeEventListener('message', messageHandler);
        } else if (event.data.type === 'GOOGLE_AUTH_ERROR') {
          const error = new Error(event.data.error);
          onAuthError?.(error);
          popup.close();
          setShowPopup(false);
          window.removeEventListener('message', messageHandler);
        }
      };
      
      window.addEventListener('message', messageHandler);
      
      // Check if popup was closed manually
      const checkClosed = setInterval(() => {
        if (popup.closed) {
          clearInterval(checkClosed);
          setShowPopup(false);
          window.removeEventListener('message', messageHandler);
          setIsLoading(false);
        }
      }, 1000);
      
    } catch (error) {
      console.error('Login error:', error);
      onAuthError?.(error as Error);
      setIsLoading(false);
      setShowPopup(false);
    }
  }, [workspaceService, onAuthSuccess, onAuthError]);

  const handleLogout = useCallback(async () => {
    try {
      // Clear stored tokens
      localStorage.removeItem('google_auth_tokens');
      
      // Reset service state
      setIsAuthenticated(false);
      setUserInfo(null);
      
      onLogout?.();
    } catch (error) {
      console.error('Logout error:', error);
      onAuthError?.(error as Error);
    }
  }, [onLogout, onAuthError]);

  const getUserInfo = useCallback(async () => {
    // This would typically use Google's userinfo endpoint
    // For now, return mock data
    return {
      email: 'user@example.com',
      name: 'Google User',
      picture: 'https://via.placeholder.com/40',
    };
  }, []);

  return (
    <div className={`google-auth ${className}`}>
      {isAuthenticated ? (
        <div className="flex items-center space-x-4">
          {userInfo && (
            <div className="flex items-center space-x-2">
              <img
                src={userInfo.picture}
                alt={userInfo.name}
                className="w-8 h-8 rounded-full"
              />
              <span className="text-sm font-medium text-gray-700">
                {userInfo.name}
              </span>
            </div>
          )}
          
          <button
            onClick={handleLogout}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            Logout
          </button>
        </div>
      ) : (
        <button
          onClick={handleLogin}
          disabled={isLoading}
          className="flex items-center px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isLoading ? (
            <>
              <svg
                className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
              >
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                />
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                />
              </svg>
              Connecting...
            </>
          ) : (
            <>
              <svg
                className="w-5 h-5 mr-2"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  fill="#4285F4"
                />
                <path
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  fill="#34A853"
                />
                <path
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                  fill="#FBBC05"
                />
                <path
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                  fill="#EA4335"
                />
              </svg>
              Sign in with Google
            </>
          )}
        </button>
      )}
      
      {showPopup && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-sm mx-4">
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              Google Authentication
            </h3>
            <p className="text-sm text-gray-600 mb-4">
              Please complete the authentication in the popup window that opened.
            </p>
            <button
              onClick={() => setShowPopup(false)}
              className="w-full px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
            >
              Cancel
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default GoogleAuth;

// Hook for Google authentication state
export function useGoogleAuth() {
  const [tokens, setTokens] = useState<GoogleAuthTokens | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const workspaceService = getGoogleWorkspaceService();

  useEffect(() => {
    const storedTokens = localStorage.getItem('google_auth_tokens');
    if (storedTokens) {
      const parsedTokens: GoogleAuthTokens = JSON.parse(storedTokens);
      
      if (new Date(parsedTokens.expiryDate) > new Date()) {
        setTokens(parsedTokens);
        setIsAuthenticated(true);
      } else {
        localStorage.removeItem('google_auth_tokens');
      }
    }
  }, []);

  const login = useCallback(async () => {
    setIsLoading(true);
    try {
      const authUrl = workspaceService.getAuthUrl();
      const popup = window.open(authUrl, 'google-auth', 'width=500,height=600');
      
      // Handle OAuth flow similar to component above...
    } catch (error) {
      setIsLoading(false);
      throw error;
    }
  }, [workspaceService]);

  const logout = useCallback(() => {
    localStorage.removeItem('google_auth_tokens');
    setTokens(null);
    setIsAuthenticated(false);
  }, []);

  return {
    tokens,
    isAuthenticated,
    isLoading,
    login,
    logout,
  };
}
