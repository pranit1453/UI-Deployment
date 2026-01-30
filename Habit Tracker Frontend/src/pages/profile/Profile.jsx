import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Layout from '../../components/layout/Layout';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import { useToast } from '../../context/ToastContext';
import userService from '../../services/userService';
import { getApiErrorMessage } from '../../utils/apiError';

const Profile = () => {
  const navigate = useNavigate();
  const [profile, setProfile] = useState(null);
  const [form, setForm] = useState({
    firstName: '',
    middleName: '',
    lastName: '',
    username: '',
    email: '',
    mobileNumber: '',
    dob: '',
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [validation, setValidation] = useState({});
  const [emailNotificationsEnabled, setEmailNotificationsEnabled] = useState(true);
  const { error: showError, success: showSuccess } = useToast();

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      setLoading(true);
      //setError('');
      const data = await userService.getProfile();
      setProfile(data);
      setForm({
        firstName: data.firstName || '',
        middleName: data.middleName || '',
        lastName: data.lastName || '',
        username: data.username || '',
        email: data.email || '',
        mobileNumber: data.mobileNumber || '',
        dob: data.dob ? data.dob.split('T')[0] : '',
      });
      setEmailNotificationsEnabled(data.emailNotificationsEnabled ?? true);
    } catch (err) {
      showError(getApiErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  const validate = () => {
    const err = {};
    if (!form.firstName?.trim()) err.firstName = 'First name is required';
    if (!form.lastName?.trim()) err.lastName = 'Last name is required';
    if (!form.username?.trim()) err.username = 'Username is required';
    if (!form.email?.trim()) err.email = 'Email is required';
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) err.email = 'Invalid email format';
    if (!form.mobileNumber?.trim()) err.mobileNumber = 'Mobile number is required';
    setValidation(err);
    return Object.keys(err).length === 0;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    if (validation[name]) setValidation((prev) => ({ ...prev, [name]: '' }));
  };

  const handleToggleNotifications = async () => {
    try {
      const newStatus = !emailNotificationsEnabled;
      await userService.toggleEmailNotifications(newStatus);
      setEmailNotificationsEnabled(newStatus);
      showSuccess(`Email notifications ${newStatus ? 'enabled' : 'disabled'} successfully`);
    } catch (err) {
      showError(getApiErrorMessage(err));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    setSaving(true);
    try {
      const updated = await userService.updateProfile({
        firstName: form.firstName.trim(),
        middleName: form.middleName?.trim() || null,
        lastName: form.lastName.trim(),
        username: form.username.trim(),
        email: form.email.trim(),
        mobileNumber: form.mobileNumber.trim(),
        dob: form.dob || null,
      });
      setProfile(updated);
      showSuccess('Profile updated successfully');
    } catch (err) {
      showError(getApiErrorMessage(err));
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <Layout><LoadingSpinner /></Layout>;

  return (
    <Layout>
      <div className="container-xxl">
        <h2 className="fw-bold mb-1">Profile</h2>
        <p className="text-muted mb-4">Edit your personal information</p>

        <div className="card border-0 shadow-sm mb-4" style={{ maxWidth: '600px' }}>
          <div className="card-body p-4">
            <h5 className="card-title mb-3">Email Notifications</h5>
            <div className="d-flex justify-content-between align-items-center">
              <div>
                <p className="mb-1">Receive email notifications for habits</p>
                <small className="text-muted">
                  Get reminders for pending habits and missed habit alerts
                </small>
              </div>
              <div className="form-check form-switch">
                <input
                  className="form-check-input"
                  type="checkbox"
                  role="switch"
                  id="emailNotifications"
                  checked={emailNotificationsEnabled}
                  onChange={handleToggleNotifications}
                  style={{ width: '3rem', height: '1.5rem', cursor: 'pointer' }}
                />
                <label className="form-check-label ms-2" htmlFor="emailNotifications">
                  {emailNotificationsEnabled ? 'Enabled' : 'Disabled'}
                </label>
              </div>
            </div>
            <div className="mt-3 pt-3 border-top">
              <button
                className="btn btn-outline-warning btn-sm"
                onClick={() => navigate('/reminders')}
              >
                ⏰ Manage Reminder Settings
              </button>
            </div>
          </div>
        </div>

        <div className="card border-0 shadow-sm" style={{ maxWidth: '600px' }}>
          <div className="card-body p-4">
            <form onSubmit={handleSubmit}>
              <div className="row g-3">
                <div className="col-md-6">
                  <label htmlFor="firstName" className="form-label">
                    First name <span className="text-danger">*</span>
                  </label>
                  <input
                    type="text"
                    className={`form-control ${validation.firstName ? 'is-invalid' : ''}`}
                    id="firstName"
                    name="firstName"
                    value={form.firstName}
                    onChange={handleChange}
                    required
                  />
                  {validation.firstName && (
                    <div className="invalid-feedback">{validation.firstName}</div>
                  )}
                </div>
                <div className="col-md-6">
                  <label htmlFor="middleName" className="form-label">Middle name</label>
                  <input
                    type="text"
                    className="form-control"
                    id="middleName"
                    name="middleName"
                    value={form.middleName}
                    onChange={handleChange}
                  />
                </div>
                <div className="col-12">
                  <label htmlFor="lastName" className="form-label">
                    Last name <span className="text-danger">*</span>
                  </label>
                  <input
                    type="text"
                    className={`form-control ${validation.lastName ? 'is-invalid' : ''}`}
                    id="lastName"
                    name="lastName"
                    value={form.lastName}
                    onChange={handleChange}
                    required
                  />
                  {validation.lastName && (
                    <div className="invalid-feedback">{validation.lastName}</div>
                  )}
                </div>
                <div className="col-12">
                  <label htmlFor="username" className="form-label">
                    Username <span className="text-danger">*</span>
                  </label>
                  <input
                    type="text"
                    className={`form-control ${validation.username ? 'is-invalid' : ''}`}
                    id="username"
                    name="username"
                    value={form.username}
                    onChange={handleChange}
                    required
                  />
                  {validation.username && (
                    <div className="invalid-feedback">{validation.username}</div>
                  )}
                </div>
                <div className="col-12">
                  <label htmlFor="email" className="form-label">
                    Email <span className="text-danger">*</span>
                  </label>
                  <input
                    type="email"
                    className={`form-control ${validation.email ? 'is-invalid' : ''}`}
                    id="email"
                    name="email"
                    value={form.email}
                    onChange={handleChange}
                    required
                  />
                  {validation.email && (
                    <div className="invalid-feedback">{validation.email}</div>
                  )}
                </div>
                <div className="col-12">
                  <label htmlFor="mobileNumber" className="form-label">
                    Mobile number <span className="text-danger">*</span>
                  </label>
                  <input
                    type="text"
                    className={`form-control ${validation.mobileNumber ? 'is-invalid' : ''}`}
                    id="mobileNumber"
                    name="mobileNumber"
                    value={form.mobileNumber}
                    onChange={handleChange}
                    required
                  />
                  {validation.mobileNumber && (
                    <div className="invalid-feedback">{validation.mobileNumber}</div>
                  )}
                </div>
                <div className="col-12">
                  <label htmlFor="dob" className="form-label">Date of birth</label>
                  <input
                    type="date"
                    className="form-control"
                    id="dob"
                    name="dob"
                    value={form.dob}
                    onChange={handleChange}
                  />
                </div>
              </div>
              <div className="mt-4">
                <button
                  type="submit"
                  className="btn btn-primary"
                  disabled={saving}
                >
                  {saving ? (
                    <>
                      <span className="spinner-border spinner-border-sm me-2" />
                      Saving...
                    </>
                  ) : (
                    'Save changes'
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default Profile;
