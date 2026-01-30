import { Component } from 'react';

/**
 * Catches React render errors so the app doesn't show a blank crash.
 * Renders a friendly message and retry button.
 */
class ErrorBoundary extends Component {
  state = { hasError: false, error: null };

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('ErrorBoundary caught:', error, errorInfo);
  }

  handleRetry = () => {
    this.setState({ hasError: false, error: null });
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-vh-100 d-flex align-items-center justify-content-center bg-light p-4">
          <div className="card shadow-sm border-0 text-center" style={{ maxWidth: '420px' }}>
            <div className="card-body p-4">
              <div className="text-danger mb-3" style={{ fontSize: '3rem' }}>⚠️</div>
              <h5 className="card-title">Something went wrong</h5>
              <p className="card-text text-muted mb-4">
                An unexpected error occurred. Please try again or go back to the home page.
              </p>
              <div className="d-flex gap-2 justify-content-center flex-wrap">
                <button type="button" className="btn btn-primary" onClick={this.handleRetry}>
                  Try again
                </button>
                <a href="/" className="btn btn-outline-secondary">
                  Go to Home
                </a>
              </div>
            </div>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}

export default ErrorBoundary;
