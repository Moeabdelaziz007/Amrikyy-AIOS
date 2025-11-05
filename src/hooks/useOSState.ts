import { useReducer, useCallback } from 'react';

// Define the shape of your state
interface WindowState {
  id: string;
  appId: string;
  title: string;
  zIndex: number;
  isMinimized: boolean;
  // Add other window properties like position, size, etc.
}

interface OSState {
  windows: WindowState[];
  nextZIndex: number;
  nextId: number;
  // Add other global state like settings, user account, etc.
}

// Define the actions
type Action = 
  | { type: 'OPEN_WINDOW'; payload: Omit<WindowState, 'id' | 'zIndex'> & { id?: string } }
  | { type: 'CLOSE_WINDOW'; payload: { id: string } }
  | { type: 'FOCUS_WINDOW'; payload: { id:string } }
  | { type: 'MINIMIZE_WINDOW'; payload: { id: string } };

const initialState: OSState = {
  windows: [],
  nextZIndex: 1,
  nextId: 1,
};

function osReducer(state: OSState, action: Action): OSState {
  switch (action.type) {
    case 'OPEN_WINDOW': {
      const newWindow: WindowState = {
        ...action.payload,
        id: action.payload.id || `window-${state.nextId}`,
        zIndex: state.nextZIndex,
        isMinimized: false,
      };
      return {
        ...state,
        windows: [...state.windows, newWindow],
        nextZIndex: state.nextZIndex + 1,
        nextId: state.nextId + 1,
      };
    }
    // Add cases for CLOSE_WINDOW, FOCUS_WINDOW, MINIMIZE_WINDOW here
    default:
      return state;
  }
}

export function useOSState() {
  const [state, dispatch] = useReducer(osReducer, initialState);

  const openWindow = useCallback((payload: Omit<WindowState, 'id' | 'zIndex'> & { id?: string }) => {
    dispatch({ type: 'OPEN_WINDOW', payload });
  }, []);

  // Define other actions like closeWindow, focusWindow, etc.

  return { state, dispatch, openWindow };
}
