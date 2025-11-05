import { useCallback } from 'react';

// This hook will consume the state and dispatch from useOSState
// and provide focused functions for window management.

interface UseWindowManagementProps {
  state: any; // Replace 'any' with the actual OSState type
  dispatch: React.Dispatch<any>; // Replace 'any' with the actual Action type
}

export function useWindowManagement({ state, dispatch }: UseWindowManagementProps) {

  const closeWindow = useCallback((id: string) => {
    dispatch({ type: 'CLOSE_WINDOW', payload: { id } });
  }, [dispatch]);

  const focusWindow = useCallback((id: string) => {
    dispatch({ type: 'FOCUS_WINDOW', payload: { id } });
  }, [dispatch]);

  const minimizeWindow = useCallback((id: string) => {
    dispatch({ type: 'MINIMIZE_WINDOW', payload: { id } });
  }, [dispatch]);

  return {
    windows: state.windows,
    closeWindow,
    focusWindow,
    minimizeWindow,
  };
}
