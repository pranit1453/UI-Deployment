/**
 * Enhanced error reporting and debugging utility
 */

// Error tracking for debugging
let errorLog = [];
const MAX_ERROR_LOG = 50;

export function logError(error, context = 'Unknown') {
  const errorEntry = {
    timestamp: new Date().toISOString(),
    context,
    message: error?.message || String(error),
    stack: error?.stack,
    error: error
  };
  
  errorLog.push(errorEntry);
  
  // Keep only the last MAX_ERROR_LOG entries
  if (errorLog.length > MAX_ERROR_LOG) {
    errorLog = errorLog.slice(-MAX_ERROR_LOG);
  }
  
  // Log to console for debugging
  console.error(`[${context}]`, error);
}

export function getErrorLog() {
  return [...errorLog];
}

export function clearErrorLog() {
  errorLog = [];
}

// Enhanced window error handling
export function setupGlobalErrorHandling() {
  // Catch unhandled JavaScript errors
  window.addEventListener('error', (event) => {
    logError(event.error, 'Global JavaScript Error');
  });
  
  // Catch unhandled promise rejections
  window.addEventListener('unhandledrejection', (event) => {
    logError(event.reason, 'Unhandled Promise Rejection');
    
    // Prevent the default browser behavior
    event.preventDefault();
  });
  
  // Catch resource loading errors
  window.addEventListener('error', (event) => {
    if (event.target !== window) {
      logError(`Failed to load resource: ${event.target.src || event.target.href}`, 'Resource Loading Error');
    }
  }, true);
}

// Development helper
export function debugToasts() {
  if (process.env.NODE_ENV === 'development') {
    window.debugErrors = {
      getLog: getErrorLog,
      clearLog: clearErrorLog,
      log: logError
    };
  }
}
