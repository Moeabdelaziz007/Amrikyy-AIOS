import React, { createContext, useState, useContext, useCallback, ReactNode } from 'react';

interface GoogleUserProfile {
  email: string;
  name: string;
  picture: string;
}

interface GoogleAuthContextType {
  isSignedIn: boolean;
  userProfile: GoogleUserProfile | null;
  signIn: () => void;
  signOut: () => void;
}

const GoogleAuthContext = createContext<GoogleAuthContextType | undefined>(undefined);

export const GoogleAuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [isSignedIn, setIsSignedIn] = useState(false);
  const [userProfile, setUserProfile] = useState<GoogleUserProfile | null>(null);

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

export const useGoogleAuth = (): GoogleAuthContextType => {
  const context = useContext(GoogleAuthContext);
  if (context === undefined) {
    throw new Error('useGoogleAuth must be used within a GoogleAuthProvider');
  }
  return context;
};