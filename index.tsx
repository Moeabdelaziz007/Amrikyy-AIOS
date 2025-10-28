import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import { LanguageProvider } from './contexts/LanguageContext';
import { MemoryProvider } from './contexts/MemoryContext';
import { NotificationProvider } from './contexts/NotificationContext';
import { UserBehaviorProvider } from './contexts/UserBehaviorContext';
import { GoogleAuthProvider } from './contexts/GoogleAuthContext';

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
  </React.StrictMode>
);