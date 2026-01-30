import { useToast } from '../../context/ToastContext';
import { testAllToastTypes, testLongMessages, testRapidSuccession, testInvalidMessages, setupToastTesting } from '../../utils/toastTestHelper';
import { useEffect } from 'react';

// Development only component
const ToastTest = () => {
  const toastFunctions = useToast();

  useEffect(() => {
    setupToastTesting();
    
    // Set up global testing functions in development
    if (process.env.NODE_ENV === 'development') {
      window.toastTest = {
        testAll: () => testAllToastTypes(toastFunctions),
        testLong: () => testLongMessages(toastFunctions),
        testRapid: () => testRapidSuccession(toastFunctions),
        testInvalid: () => testInvalidMessages(toastFunctions),
        success: toastFunctions.success,
        error: toastFunctions.error,
        warning: toastFunctions.warning,
        info: toastFunctions.info
      };
    }
  }, [toastFunctions]);

  // This component doesn't render anything visible
  return null;
};

export default ToastTest;
