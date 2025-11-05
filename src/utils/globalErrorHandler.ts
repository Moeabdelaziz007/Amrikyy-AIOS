/**
 * Sends health data to the backend System Health Monitor.
 * @param type - The type of data being logged.
 * @param payload - The data payload.
 */
async function logHealthData(type: 'error' | 'performance' | 'ux', payload: any) {
  try {
    await fetch('/api/health/log', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ type, payload }),
    });
  } catch (error) {
    console.error('[GlobalErrorHandler] Failed to log health data:', error);
  }
}

/**
 * Initializes a global error handler to capture uncaught exceptions.
 */
export function initializeGlobalErrorHandler() {
  window.addEventListener('error', (event) => {
    logHealthData('error', {
      message: event.message,
      filename: event.filename,
      lineno: event.lineno,
      colno: event.colno,
      error: event.error?.stack || 'No stack available',
    });
  });

  window.addEventListener('unhandledrejection', (event) => {
    logHealthData('error', {
      message: 'Unhandled promise rejection',
      reason: event.reason?.stack || event.reason || 'No reason available',
    });
  });

  console.log('[GlobalErrorHandler] Initialized.');
}
