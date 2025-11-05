import React, { createContext, useContext } from 'react';

// Define the shape of the context data
interface OSContextType {
  // From useOSState
  state: any; // Replace with OSState type
  dispatch: React.Dispatch<any>; // Replace with Action type
  openWindow: (payload: any) => void; // Replace with correct payload type

  // From useWindowManagement
  windows: any[]; // Replace with WindowState[] type
  closeWindow: (id: string) => void;
  focusWindow: (id: string) => void;
  minimizeWindow: (id: string) => void;
}

const OSContext = createContext<OSContextType | undefined>(undefined);

export const OSProvider: React.FC<{ children: React.ReactNode; value: OSContextType }> = ({ children, value }) => {
  return <OSContext.Provider value={value}>{children}</OSContext.Provider>;
};

export function useOS() {
  const context = useContext(OSContext);
  if (context === undefined) {
    throw new Error('useOS must be used within an OSProvider');
  }
  return context;
}
