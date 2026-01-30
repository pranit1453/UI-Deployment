/**
 * Global fallback for unhandled API/async errors so the app never crashes silently.
 * ToastProvider registers its showError here; unhandledrejection calls it.
 */
import { getApiErrorMessage } from './apiError';

let handler = null;

export function setGlobalErrorHandler(fn) {
  handler = fn;
}

export function notifyGlobalError(error) {
  if (typeof handler === 'function') {
    try {
      const errorMessage = getApiErrorMessage(error);
      if (errorMessage && errorMessage !== 'An unexpected error occurred') {
        handler(errorMessage);
      } else {
        handler(String(error?.message || error || 'Something went wrong'));
      }
    } catch (err) {
      console.error('Error in global error handler:', err);
      // Fallback to prevent infinite loops
      try {
        handler('An unexpected error occurred');
      } catch {
        console.error('Global error handler failed completely');
      }
    }
  } else {
    console.error('Global error handler not set, error:', error);
  }
}
