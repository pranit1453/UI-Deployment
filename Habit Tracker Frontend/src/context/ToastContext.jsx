import { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { setGlobalErrorHandler, notifyGlobalError } from '../utils/globalErrorHandler';

const ToastContext = createContext();

export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
};

export const ToastProvider = ({ children }) => {
  const [toasts, setToasts] = useState([]);

  const showToast = useCallback((message, type = 'info', duration = 5000) => {
    // Guard against invalid inputs
    if (!message && typeof message !== 'string') {
      console.warn('Toast: message is required');
      return null;
    }

    // Ensure message is a string and not empty
    const messageStr = String(message).trim();
    if (!messageStr) {
      console.warn('Toast: message cannot be empty');
      return null;
    }

    const id = Date.now() + Math.random();
    const toast = { 
      id, 
      message: messageStr, 
      type: type || 'info', 
      duration: duration || 5000 
    };

    setToasts((prev) => [...prev, toast]);
    
    if (duration > 0) {
      setTimeout(() => {
        removeToast(id);
      }, duration);
    }

    return id;
  }, []);

  const removeToast = useCallback((id) => {
    setToasts((prev) => prev.filter((toast) => toast.id !== id));
  }, []);

  const success = useCallback((message, duration = 5000) => {
    return showToast(message, 'success', duration);
  }, [showToast]);

  const error = useCallback((message, duration = 8000) => {
    return showToast(message, 'error', duration);
  }, [showToast]);

  const info = useCallback((message, duration = 5000) => {
    return showToast(message, 'info', duration);
  }, [showToast]);

  const warning = useCallback((message, duration = 6000) => {
    return showToast(message, 'warning', duration);
  }, [showToast]);

  // Enhanced global error handler
  useEffect(() => {
    setGlobalErrorHandler((msg) => {
      if (msg) {
        const messageStr = String(msg).trim();
        if (messageStr) {
          showToast(messageStr, 'error', 8000);
        }
      }
    });
    
    const onUnhandledRejection = (event) => {
      if (event.reason) {
        notifyGlobalError(event.reason);
        event.preventDefault?.();
      }
    };
    
    window.addEventListener('unhandledrejection', onUnhandledRejection);
    return () => {
      window.removeEventListener('unhandledrejection', onUnhandledRejection);
      setGlobalErrorHandler(null);
    };
  }, [showToast]);

  return (
    <ToastContext.Provider value={{ toasts, showToast, removeToast, success, error, info, warning }}>
      {children}
    </ToastContext.Provider>
  );
};
