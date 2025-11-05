export function safeAlert(message: string) {
  try {
    if (typeof window !== 'undefined' && typeof window.alert === 'function') {
      window.alert(message);
    } else {
      // fallback for test environments
      // eslint-disable-next-line no-console
      console.warn('[alert]', message);
    }
  } catch (e) {
    // last resort
    // eslint-disable-next-line no-console
    console.warn('[alert] error', message, e);
  }
}

