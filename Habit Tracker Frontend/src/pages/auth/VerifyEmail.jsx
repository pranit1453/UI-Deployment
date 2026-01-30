import { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { useToast } from '../../context/ToastContext';
import authService from '../../services/authService';
import { getApiErrorMessage } from '../../utils/apiError';

const VerifyEmail = () => {
  const [searchParams] = useSearchParams();
  const email = searchParams.get('email') || '';
  const [formData, setFormData] = useState({
    email: email,
    otp: '',
  });
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const { error: showError, success: showSuccess } = useToast();
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.email || !formData.otp) {
      showError('Please enter email and OTP');
      return;
    }

    setLoading(true);

    try {
      await authService.verifyEmail(formData.email, formData.otp);
      setSuccess(true);
      showSuccess('Email verified successfully! Redirecting to login...');
      setTimeout(() => {
        navigate('/login');
      }, 2000);
    } catch (err) {
      showError(getApiErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  const handleResendOTP = async () => {
    if (!formData.email) {
      showError('Please enter your email address');
      return;
    }

    try {
      await authService.sendVerificationEmail(formData.email);
      showSuccess('Verification email sent! Please check your inbox.');
    } catch (err) {
      showError(getApiErrorMessage(err));
    }
  };

  if (success) {
    return (
      <div className="min-vh-100 d-flex align-items-center bg-light py-5">
        <div className="container">
          <div className="row justify-content-center">
            <div className="col-md-6 col-lg-4">
              <div className="card shadow-sm border-0">
                <div className="card-body p-4 text-center">
                  <div className="mb-3">
                    <div className="display-1 text-success">✓</div>
                  </div>
                  <h3 className="mb-3">Email Verified!</h3>
                  <p className="text-muted">Your email has been successfully verified.</p>
                  <p className="text-muted">Redirecting to login...</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-vh-100 d-flex align-items-center bg-light py-5">
      <div className="container">
        <div className="row justify-content-center">
          <div className="col-md-6 col-lg-4">
            <div className="card shadow-sm border-0">
              <div className="card-body p-4">
                <div className="text-center mb-4">
                  <h2 className="fw-bold text-primary">Verify Email</h2>
                  <p className="text-muted">Enter the OTP sent to your email</p>
                </div>

                <form onSubmit={handleSubmit}>
                  <div className="mb-3">
                    <label htmlFor="email" className="form-label">
                      Email Address *
                    </label>
                    <input
                      type="email"
                      className="form-control"
                      id="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      required
                      disabled={!!email}
                    />
                  </div>

                  <div className="mb-3">
                    <label htmlFor="otp" className="form-label">
                      OTP Code *
                    </label>
                    <input
                      type="text"
                      className="form-control text-center"
                      id="otp"
                      name="otp"
                      value={formData.otp}
                      onChange={handleChange}
                      required
                      maxLength="6"
                      placeholder="000000"
                      style={{ fontSize: '1.5rem', letterSpacing: '0.5rem' }}
                    />
                  </div>

                  <button
                    type="submit"
                    className="btn btn-primary w-100 mb-3"
                    disabled={loading}
                  >
                    {loading ? (
                      <>
                        <span
                          className="spinner-border spinner-border-sm me-2"
                          role="status"
                          aria-hidden="true"
                        ></span>
                        Verifying...
                      </>
                    ) : (
                      'Verify Email'
                    )}
                  </button>

                  <div className="text-center mb-3">
                    <button
                      type="button"
                      className="btn btn-link text-decoration-none"
                      onClick={handleResendOTP}
                    >
                      Resend OTP
                    </button>
                  </div>

                  <div className="text-center">
                    <span className="text-muted">Already verified? </span>
                    <Link to="/login" className="text-decoration-none">
                      Sign in
                    </Link>
                  </div>
                </form>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VerifyEmail;
