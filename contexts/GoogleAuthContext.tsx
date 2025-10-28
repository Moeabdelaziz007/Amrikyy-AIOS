import React, { createContext, useState, useContext, useCallback, ReactNode } from 'react';

/**
 * Defines the structure of a Google user's profile information.
 */
interface GoogleUserProfile {
  /** The user's email address. */
  email: string;
  /** The user's full name. */
  name: string;
  /** URL to the user's profile picture. */
  picture: string;
}

/**
 * Defines the shape of the context object provided by `GoogleAuthContext`.
 */
interface GoogleAuthContextType {
  /** Indicates whether the user is currently signed in with Google. */
  isSignedIn: boolean;
  /** The Google user's profile information, or `null` if not signed in. */
  userProfile: GoogleUserProfile | null;
  /** Function to initiate the Google Sign-In process. */
  signIn: () => void;
  /** Function to sign out the user from Google. */
  signOut: () => void;
}

/**
 * React Context for managing Google authentication state.
 */
const GoogleAuthContext = createContext<GoogleAuthContextType | undefined>(undefined);

/**
 * Provides Google authentication context to its children.
 * Simulates Google Sign-In and Sign-Out functionalities for demonstration purposes.
 * @param {object} props - The component props.
 * @param {ReactNode} props.children - The child components to render within the provider.
 * @returns {JSX.Element} The GoogleAuthProvider component.
 */
export const GoogleAuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [isSignedIn, setIsSignedIn] = useState(false);
  const [userProfile, setUserProfile] = useState<GoogleUserProfile | null>(null);

  /**
   * Simulates a Google Sign-In. In a real application, this would integrate
   * with the Google API client library for actual OAuth flow.
   */
  const signIn = useCallback(() => {
    // This is a simulation of an OAuth flow.
    // In a real app, you would use the Google API client library to trigger the login popup.
    console.log("Simulating Google Sign-In...");
    setIsSignedIn(true);
    setUserProfile({
      email: 'user@example.com',
      name: 'Demo User',
      picture: 'https://i.pravatar.cc/150?u=a042581f4e29026704d',
    });
  }, []);

  /**
   * Simulates a Google Sign-Out. In a real application, this would revoke
   * authentication tokens.
   */
  const signOut = useCallback(() => {
    console.log("Simulating Google Sign-Out...");
    setIsSignedIn(false);
    setUserProfile(null);
  }, []);

  return (
    <GoogleAuthContext.Provider value={{ isSignedIn, userProfile, signIn, signOut }}>
      {children}
    </GoogleAuthContext.Provider>
  );
};

/**
 * Custom hook to access the Google authentication context.
 * This hook provides components with access to the user's Google sign-in status,
 * profile information, and functions to initiate sign-in/sign-out.
 * It should be used within a `GoogleAuthProvider`.
 * @returns {GoogleAuthContextType} The current Google authentication context, including
 *   sign-in status, user profile, and authentication functions.
 * @throws {Error} If `useGoogleAuth` is not used within a `GoogleAuthProvider`.
 */
export const useGoogleAuth = (): GoogleAuthContextType => {
  const context = useContext(GoogleAuthContext);
  if (context === undefined) {
    throw new Error('useGoogleAuth must be used within a GoogleAuthProvider');
  }
  return context;
};