import { Suspense } from 'react';
import { AuthProvider } from './contexts/AuthContext';
import { OSProvider, useOS } from './contexts/OSContext';
import { useOSState } from './hooks/useOSState';
import { useWindowManagement } from './hooks/useWindowManagement';
import AIOSDesktop from './components/AIOSDesktop'; // Assuming this is the main desktop component

const AppContent = () => {
  const { windows } = useOS();

  // Simplified rendering logic. The actual window rendering will be inside AIOSDesktop.
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <AIOSDesktop />
    </Suspense>
  );
};

const App = () => {
  const osState = useOSState();
  const windowManagement = useWindowManagement(osState);

  const osContextValue = {
    ...osState,
    ...windowManagement,
  };

  return (
    <AuthProvider>
      <OSProvider value={osContextValue}>
        <AppContent />
      </OSProvider>
    </AuthProvider>
  );
};

export default App;
