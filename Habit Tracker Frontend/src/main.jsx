import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import 'bootstrap/dist/css/bootstrap.min.css'
import 'bootstrap/dist/js/bootstrap.bundle.min.js'
import './index.css'
import App from './App.jsx'
import { ToastProvider } from './context/ToastContext';
import { AuthProvider } from './context/AuthContext';
import { setupGlobalErrorHandling } from './utils/errorReporting';

// Setup global error handling before rendering
setupGlobalErrorHandling();

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <ToastProvider>
      <AuthProvider>
        <App />
      </AuthProvider>
    </ToastProvider>
  </StrictMode>
)
