import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { ToastProvider } from './context/ToastContext';
import ToastContainer from './components/common/Toast';
import ErrorBoundary from './components/common/ErrorBoundary';
import { UserRoute, AdminRoute } from './components/common/RoleProtectedRoute';

// Development helper
import ToastTest from './components/dev/ToastTest';

// Auth Pages
import Login from './pages/auth/Login';
import Register from './pages/auth/Register';
import ForgotPassword from './pages/auth/ForgotPassword';
import ResetPassword from './pages/auth/ResetPassword';
import VerifyEmail from './pages/auth/VerifyEmail';

// Public Pages
import Home from './pages/Home';

// User-only Pages
import Dashboard from './pages/dashboard/Dashboard';
import HabitsList from './pages/habits/HabitsList';
import HabitForm from './pages/habits/HabitForm';
import HabitDetail from './pages/habits/HabitDetail';
import HabitLogs from './pages/habits/HabitLogs';
import Categories from './pages/categories/Categories';
import Analytics from './pages/analytics/HabitStats';
import Profile from './pages/profile/Profile';
import ReminderSettings from './pages/reminders/ReminderSettings';

// Admin-only Pages
import Admin from './pages/admin/Admin';

import './App.css';

function App() {
  return (
    <ToastProvider>
      <Router>
        <AuthProvider>
          <ErrorBoundary>
            <ToastContainer />
            {process.env.NODE_ENV === 'development' && <ToastTest />}
            <Routes>
              {/* Public Routes */}
              <Route path="/" element={<Home />} />
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route path="/forgot-password" element={<ForgotPassword />} />
              <Route path="/reset-password" element={<ResetPassword />} />
              <Route path="/verify-email" element={<VerifyEmail />} />

              {/* User-only Routes (ADMIN cannot access) */}
              <Route path="/dashboard" element={<UserRoute><Dashboard /></UserRoute>} />
              <Route path="/habits" element={<UserRoute><HabitsList /></UserRoute>} />
              <Route path="/habits/create" element={<UserRoute><HabitForm /></UserRoute>} />
              <Route path="/habits/edit/:id" element={<UserRoute><HabitForm /></UserRoute>} />
              <Route path="/habits/:id" element={<UserRoute><HabitDetail /></UserRoute>} />
              <Route path="/habits/:id/logs" element={<UserRoute><HabitLogs /></UserRoute>} />
              <Route path="/categories" element={<UserRoute><Categories /></UserRoute>} />
              <Route path="/analytics" element={<UserRoute><Analytics /></UserRoute>} />
              <Route path="/profile" element={<UserRoute><Profile /></UserRoute>} />
              <Route path="/reminders" element={<UserRoute><ReminderSettings /></UserRoute>} />

              {/* Admin-only Routes (USER cannot access) */}
              <Route path="/admin" element={<AdminRoute><Admin /></AdminRoute>} />

              {/* Default Route */}
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </ErrorBoundary>
        </AuthProvider>
      </Router>
    </ToastProvider>
  );
}

export default App;
