import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.tsx';
import { LanguageProvider } from './contexts/LanguageContext.tsx';
import { MemoryProvider } from './contexts/MemoryContext.tsx';
import { NotificationProvider } from './contexts/NotificationContext.tsx';
import { UserBehaviorProvider } from './contexts/UserBehaviorContext.tsx';
import { GoogleAuthProvider } from './contexts/GoogleAuthContext.tsx';
import { AuthProvider } from './contexts/AuthContext.tsx';
import { initializeGlobalErrorHandler } from './utils/globalErrorHandler.ts';

// Initialize the global error handler to report issues to the System Health Monitor
initializeGlobalErrorHandler();

/**
 * The main entry point of the React application.
 * It initializes the root React DOM and renders the App component wrapped in various context providers.
 */
const rootElement = document.getElementById('root');
if (!rootElement) {
  throw new Error("Could not find root element to mount to");
}

const root = ReactDOM.createRoot(rootElement);
root.render(
  <React.StrictMode>
    <AuthProvider>
      <LanguageProvider>
        <MemoryProvider>
          <NotificationProvider>
            <UserBehaviorProvider>
              <GoogleAuthProvider>
                <App />
              </GoogleAuthProvider>
            </UserBehaviorProvider>
          </NotificationProvider>
        </MemoryProvider>
      </LanguageProvider>
    </AuthProvider>
  </React.StrictMode>
);
