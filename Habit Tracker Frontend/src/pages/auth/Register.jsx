import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { getApiErrorMessage } from '../../utils/apiError';

const Register = () => {
  const [formData, setFormData] = useState({
    firstName: '',
    middleName: '',
    lastName: '',
    username: '',
    email: '',
    mobileNumber: '',
    password: '',
    confirmPassword: '',
    dob: '',
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { register } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    
    // Special handling for mobile number - only allow digits, max 10 digits
    if (name === 'mobileNumber') {
      const digitsOnly = value.replace(/\D/g, '').slice(0, 10);
      setFormData({ ...formData, [name]: digitsOnly });
      return;
    }
    
    setFormData({ ...formData, [name]: value });
  };

  const validateForm = () => {
    const errors = [];
    
    if (!formData.firstName.trim()) errors.push('First name is required');
    if (!formData.lastName.trim()) errors.push('Last name is required');
    if (!formData.username.trim()) errors.push('Username is required');
    if (!formData.email.trim()) errors.push('Email is required');
    if (!formData.mobileNumber.trim()) errors.push('Mobile number is required');
    if (!formData.password.trim()) errors.push('Password is required');
    if (!formData.confirmPassword.trim()) errors.push('Confirm password is required');
    
    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (formData.email && !emailRegex.test(formData.email)) {
      errors.push('Please enter a valid email address');
    }
    
    // Mobile number validation (exactly 10 digits)
    if (formData.mobileNumber && !/^\d{10}$/.test(formData.mobileNumber)) {
      errors.push('Mobile number must be exactly 10 digits');
    }
    
    // Password validation
    if (formData.password && formData.password.length < 6) {
      errors.push('Password must be at least 6 characters long');
    }
    
    // Password match validation
    if (formData.password !== formData.confirmPassword) {
      errors.push('Passwords do not match');
    }
    
    return errors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    const validationErrors = validateForm();
    if (validationErrors.length > 0) {
      setError(validationErrors.join(', '));
      return;
    }

    setLoading(true);

    try {
      // Convert camelCase to PascalCase for backend DTO
      const backendData = {
        FirstName: formData.firstName,
        MiddleName: formData.middleName || null,
        LastName: formData.lastName,
        Username: formData.username,
        Email: formData.email,
        MobileNumber: formData.mobileNumber,
        Password: formData.password,
        ConfirmPassword: formData.confirmPassword,
        Dob: formData.dob ? new Date(formData.dob).toISOString() : null
      };
      
      // Debug: Log the data being sent
      console.log('Frontend data:', formData);
      console.log('Backend data being sent:', backendData);
      console.log('Password value:', backendData.Password);
      console.log('ConfirmPassword value:', backendData.ConfirmPassword);
      console.log('Password length:', backendData.Password?.length);
      console.log('ConfirmPassword length:', backendData.ConfirmPassword?.length);
      
      const response = await register(backendData);
      console.log('Registration response:', response);
      
      // Navigate to email verification page
      navigate(`/verify-email?email=${encodeURIComponent(formData.email)}`);
    } catch (err) {
      console.error('Registration error:', err);
      console.error('Error response:', err.response?.data);
      
      // Enhanced error handling for validation errors
      if (err.response?.data?.errors) {
        console.log('Validation errors:', err.response.data.errors);
        console.log('ConfirmPassword errors:', err.response.data.errors.ConfirmPassword);
        const validationErrors = Object.entries(err.response.data.errors)
          .map(([field, errors]) => {
            const errorArray = Array.isArray(errors) ? errors : [errors];
            return `${field}: ${errorArray.join(', ')}`;
          })
          .join('. ');
        setError(`Validation failed: ${validationErrors}`);
      } else if (err.response?.data?.title) {
        setError(err.response.data.title);
      } else {
        setError(getApiErrorMessage(err));
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-vh-100 d-flex align-items-center bg-light py-5">
      <div className="container">
        <div className="row justify-content-center">
          <div className="col-md-8 col-lg-6">
            <div className="card shadow-sm border-0">
              <div className="card-body p-4">
                <div className="text-center mb-4">
                  <h2 className="fw-bold text-primary">Create Account</h2>
                  <p className="text-muted">Join Habit Tracker today</p>
                </div>

                {error && (
                  <div className="alert alert-danger" role="alert">
                    {error}
                  </div>
                )}

                <form onSubmit={handleSubmit}>
                  <div className="row">
                    <div className="col-md-4 mb-3">
                      <label htmlFor="firstName" className="form-label">
                        First Name *
                      </label>
                      <input
                        type="text"
                        className="form-control"
                        id="firstName"
                        name="firstName"
                        value={formData.firstName}
                        onChange={handleChange}
                        required
                      />
                    </div>
                    <div className="col-md-4 mb-3">
                      <label htmlFor="middleName" className="form-label">
                        Middle Name
                      </label>
                      <input
                        type="text"
                        className="form-control"
                        id="middleName"
                        name="middleName"
                        value={formData.middleName}
                        onChange={handleChange}
                      />
                    </div>
                    <div className="col-md-4 mb-3">
                      <label htmlFor="lastName" className="form-label">
                        Last Name *
                      </label>
                      <input
                        type="text"
                        className="form-control"
                        id="lastName"
                        name="lastName"
                        value={formData.lastName}
                        onChange={handleChange}
                        required
                      />
                    </div>
                  </div>

                  <div className="mb-3">
                    <label htmlFor="username" className="form-label">
                      Username *
                    </label>
                    <input
                      type="text"
                      className="form-control"
                      id="username"
                      name="username"
                      value={formData.username}
                      onChange={handleChange}
                      required
                    />
                  </div>

                  <div className="row">
                    <div className="col-md-6 mb-3">
                      <label htmlFor="email" className="form-label">
                        Email *
                      </label>
                      <input
                        type="email"
                        className="form-control"
                        id="email"
                        name="email"
                        value={formData.email}
                        onChange={handleChange}
                        required
                        placeholder="Enter your email address"
                      />
                      <small className="text-muted">
                        Example: user@example.com
                      </small>
                    </div>
                    <div className="col-md-6 mb-3">
                      <label htmlFor="mobileNumber" className="form-label">
                        Mobile Number *
                      </label>
                      <input
                        type="tel"
                        className="form-control"
                        id="mobileNumber"
                        name="mobileNumber"
                        value={formData.mobileNumber}
                        onChange={handleChange}
                        required
                        maxLength="10"
                        placeholder="Enter 10-digit mobile number"
                      />
                      <small className="text-muted">
                        Must be 10 digits starting with 6, 7, 8, or 9
                      </small>
                    </div>
                  </div>

                  <div className="mb-3">
                    <label htmlFor="dob" className="form-label">
                      Date of Birth
                    </label>
                    <input
                      type="date"
                      className="form-control"
                      id="dob"
                      name="dob"
                      value={formData.dob}
                      onChange={handleChange}
                    />
                  </div>

                  <div className="row">
                    <div className="col-md-6 mb-3">
                      <label htmlFor="password" className="form-label">
                        Password *
                      </label>
                      <input
                        type="password"
                        className="form-control"
                        id="password"
                        name="password"
                        value={formData.password}
                        onChange={handleChange}
                        required
                        minLength="6"
                        placeholder="Min 6 characters"
                      />
                      <small className="text-muted">
                        Password must be at least 6 characters long
                      </small>
                    </div>
                    <div className="col-md-6 mb-3">
                      <label htmlFor="confirmPassword" className="form-label">
                        Confirm Password *
                      </label>
                      <input
                        type="password"
                        className="form-control"
                        id="confirmPassword"
                        name="confirmPassword"
                        value={formData.confirmPassword}
                        onChange={handleChange}
                        required
                        minLength="6"
                        placeholder="Re-enter your password"
                      />
                      {formData.confirmPassword && formData.password !== formData.confirmPassword && (
                        <small className="text-danger">
                          Passwords do not match
                        </small>
                      )}
                    </div>
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
                        Creating account...
                      </>
                    ) : (
                      'Sign Up'
                    )}
                  </button>

                  <div className="text-center">
                    <span className="text-muted">Already have an account? </span>
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

export default Register;
