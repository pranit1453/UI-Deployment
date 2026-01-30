/**
 * Test utility for toast system (development only)
 */
import { useToast } from '../context/ToastContext';

export function useToastTest() {
  const { success, error, warning, info } = useToast();
  
  const testAllToasts = () => {
    success('Success message test!');
    error('Error message test!');
    warning('Warning message test!');
    info('Info message test!');
  };
  
  const testErrorHandling = () => {
    try {
      throw new Error('Test error for toast system');
    } catch (err) {
      error(err.message);
    }
  };
  
  return {
    testAllToasts,
    testErrorHandling,
    success,
    error,
    warning,
    info
  };
}

// Development helper
if (process.env.NODE_ENV === 'development') {
  window.testToast = () => {
    const { testAllToasts } = useToastTest();
    testAllToasts();
  };
}
