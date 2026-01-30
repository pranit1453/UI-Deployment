import { useEffect, useState } from 'react';
import { useToast } from '../../context/ToastContext';
import './Toast.css';

const Toast = ({ toast }) => {
  const { removeToast } = useToast();
  const [isRemoving, setIsRemoving] = useState(false);

  // Guard against undefined toast
  if (!toast) {
    return null;
  }

  useEffect(() => {
    if (toast.duration > 0) {
      const timer = setTimeout(() => {
        handleRemove();
      }, toast.duration);
      return () => clearTimeout(timer);
    }
  }, [toast]);

  const handleRemove = () => {
    setIsRemoving(true);
    setTimeout(() => {
      removeToast(toast.id);
    }, 300); // Wait for slideOut animation
  };

  const getIcon = () => {
    switch (toast.type || 'info') {
      case 'success':
        return '✅';
      case 'error':
        return '❌';
      case 'warning':
        return '⚠️';
      case 'info':
      default:
        return 'ℹ️';
    }
  };

  const getClassName = () => {
    const baseClass = `toast toast-${toast.type || 'info'}`;
    return isRemoving ? `${baseClass} removing` : baseClass;
  };

  return (
    <div className={getClassName()} onClick={handleRemove}>
      <div className="toast-content">
        <span className="toast-icon">{getIcon()}</span>
        <span className="toast-message">{toast.message || 'Notification'}</span>
      </div>
      <button
        className="toast-close"
        onClick={(e) => {
          e.stopPropagation();
          handleRemove();
        }}
        aria-label="Close"
        title="Dismiss"
      >
        ×
      </button>
    </div>
  );
};

export const ToastContainer = () => {
  const { toasts } = useToast();

  return (
    <div className="toast-container">
      {toasts.map((toast) => (
        toast && <Toast key={toast.id} toast={toast} />
      ))}
    </div>
  );
};

export default Toast;
