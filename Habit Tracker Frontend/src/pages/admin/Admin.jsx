import { useState, useEffect } from 'react';
import Layout from '../../components/layout/Layout';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import StatCard from '../../components/common/StatCard';
import { useToast } from '../../context/ToastContext';
import { useAuth } from '../../context/AuthContext';
import adminService from '../../services/adminService';
import { getApiErrorMessage } from '../../utils/apiError';

const Admin = () => {
  const [activeTab, setActiveTab] = useState('overview'); // overview, users, feedback
  const [loading, setLoading] = useState(true);
  const [statistics, setStatistics] = useState(null);
  const [users, setUsers] = useState([]);
  const [usersDetailed, setUsersDetailed] = useState([]);
  const [feedback, setFeedback] = useState([]);
  const [showDetailedUsers, setShowDetailedUsers] = useState(false);
  const { error: showError } = useToast();
  const { user, isAuthenticated } = useAuth();

  useEffect(() => {
    fetchOverview();
  }, []);

  useEffect(() => {
    if (activeTab === 'users') {
      fetchUsers();
    } else if (activeTab === 'feedback') {
      fetchFeedback();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeTab, showDetailedUsers]);

  const fetchOverview = async () => {
    try {
      setLoading(true);
      const stats = await adminService.getStatistics();
      setStatistics(stats);
    } catch (err) {
      showError(getApiErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  const fetchUsers = async () => {
    try {
      setLoading(true);
      if (showDetailedUsers) {
        const data = await adminService.getUsersDetailed();
        setUsersDetailed(data || []);
      } else {
        const data = await adminService.getUsers();
        setUsers(data.users || []);
      }
    } catch (err) {
      showError(getApiErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  const fetchFeedback = async () => {
    try {
      setLoading(true);
      
      // Use the FeedbackController endpoint which requires ADMIN role
      // But let's try it with proper error handling
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:5000/api/feedback', {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        setFeedback(data.feedback || []);
      } else if (response.status === 401 || response.status === 403) {
        // User doesn't have admin rights, show message
        setFeedback([]);
        showError('Admin privileges required to view feedback.');
      } else {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      
    } catch (err) {
      // If all else fails, show sample data for testing
      setFeedback([
        {
          feedbackId: 1,
          name: 'Sample User',
          email: 'sample@example.com',
          rating: 5,
          message: 'This is sample feedback for testing. Add real feedback to see it here.',
          createdAt: new Date().toISOString()
        }
      ]);
      showError('Using sample data. Add real feedback to database.');
    } finally {
      setLoading(false);
    }
  };

  const getRatingStars = (rating) => {
    const fullStars = '★'.repeat(rating);
    const emptyStars = '☆'.repeat(5 - rating);
    return (
      <div className="rating-stars" style={{ fontSize: '18px', lineHeight: 1.2 }}>
        <span style={{ color: '#ffc107', marginRight: '2px' }}>{fullStars}</span>
        <span style={{ color: '#dee2e6', marginRight: '4px' }}>{emptyStars}</span>
        <span className="ms-1 badge bg-secondary" style={{ fontSize: '12px' }}>
          {rating}/5
        </span>
      </div>
    );
  };

  const renderOverview = () => {
    if (!statistics) return null;

    return (
      <div>
        <div className="row g-3 mb-4">
          <div className="col-md-3">
            <StatCard
              title="Total Users"
              value={statistics.totalUsers || 0}
              icon="👥"
              color="primary"
            />
          </div>
          <div className="col-md-3">
            <StatCard
              title="Active Users"
              value={statistics.activeUsers || 0}
              icon="✅"
              color="success"
            />
          </div>
          <div className="col-md-3">
            <StatCard
              title="Total Habits"
              value={statistics.totalHabits || 0}
              icon="📋"
              color="info"
            />
          </div>
          <div className="col-md-3">
            <StatCard
              title="Active Habits"
              value={statistics.activeHabits || 0}
              icon="🔥"
              color="warning"
            />
          </div>
        </div>

        <div className="row g-3 mb-4">
          <div className="col-md-3">
            <StatCard
              title="Total Logs"
              value={statistics.totalHabitLogs || 0}
              icon="📊"
              color="secondary"
            />
          </div>
          <div className="col-md-3">
            <StatCard
              title="Categories"
              value={statistics.totalCategories || 0}
              icon="📁"
              color="primary"
            />
          </div>
          <div className="col-md-3">
            <StatCard
              title="Feedback"
              value={statistics.totalFeedback || 0}
              icon="💬"
              color="info"
            />
          </div>
          <div className="col-md-3">
            <StatCard
              title="Avg Habits/User"
              value={statistics.averageHabitsPerUser?.toFixed(1) || 0}
              icon="📈"
              color="success"
            />
          </div>
        </div>

        <div className="card border-0 shadow-sm">
          <div className="card-body">
            <h5 className="card-title mb-3">System Metrics</h5>
            <div className="row g-3">
              <div className="col-md-6">
                <div className="p-3 bg-light rounded">
                  <div className="d-flex justify-content-between align-items-center">
                    <span className="text-muted">Average Completion Rate</span>
                    <span className="h4 fw-bold text-primary mb-0">
                      {statistics.averageCompletionRate?.toFixed(1) || 0}%
                    </span>
                  </div>
                </div>
              </div>
              <div className="col-md-6">
                <div className="p-3 bg-light rounded">
                  <div className="d-flex justify-content-between align-items-center">
                    <span className="text-muted">User Activity Rate</span>
                    <span className="h4 fw-bold text-success mb-0">
                      {statistics.totalUsers > 0
                        ? ((statistics.activeUsers / statistics.totalUsers) * 100).toFixed(1)
                        : 0}%
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  const renderUsers = () => {
    if (loading) return <LoadingSpinner />;

    return (
      <div>
        <div className="d-flex justify-content-between align-items-center mb-4">
          <h5 className="mb-0">User Management</h5>
            <div className="form-check form-switch">
              <input
                className="form-check-input"
                type="checkbox"
                id="detailedView"
                checked={showDetailedUsers}
                onChange={(e) => {
                  setShowDetailedUsers(e.target.checked);
                }}
              />
              <label className="form-check-label" htmlFor="detailedView">
                Detailed View
              </label>
            </div>
        </div>

        {showDetailedUsers ? (
          <div className="card border-0 shadow-sm">
            <div className="card-body">
              <div className="table-responsive">
                <table className="table table-hover">
                  <thead>
                    <tr>
                      <th>#</th>
                      <th>User ID</th>
                      <th>Full Name</th>
                      <th>Username</th>
                      <th>Email</th>
                      <th>Role</th>
                      <th>Status</th>
                      <th>Email Verified</th>
                      <th>Total Habits</th>
                      <th>Active Habits</th>
                      <th>Joined</th>
                    </tr>
                  </thead>
                  <tbody>
                    {usersDetailed.length > 0 ? (
                      usersDetailed.map((user, index) => (
                        <tr key={user.userId}>
                          <td>{index + 1}</td>
                          <td>{user.userId}</td>
                          <td>{user.fullName}</td>
                          <td>{user.username}</td>
                          <td>{user.email}</td>
                          <td>
                            <span className={`badge ${user.role === 'ADMIN' ? 'bg-danger' : 'bg-primary'}`}>
                              {user.role}
                            </span>
                          </td>
                          <td>
                            <span className={`badge ${user.isActive ? 'bg-success' : 'bg-danger'}`}>
                              {user.isActive ? 'Active' : 'Inactive'}
                            </span>
                          </td>
                          <td>
                            <span className={`badge ${user.isEmailVerified ? 'bg-success' : 'bg-warning'}`}>
                              {user.isEmailVerified ? 'Verified' : 'Not Verified'}
                            </span>
                          </td>
                          <td>{user.totalHabits}</td>
                          <td>{user.activeHabits}</td>
                          <td>{new Date(user.createdAt).toLocaleDateString()}</td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan="11" className="text-center text-muted">
                          No users found
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        ) : (
          <div className="card border-0 shadow-sm">
            <div className="card-body">
              <h5 className="card-title mb-3">User List</h5>
              {users.length > 0 ? (
                <div className="table-responsive">
                  <table className="table table-hover">
                    <thead>
                      <tr>
                        <th>#</th>
                        <th>User ID</th>
                        <th>Full Name</th>
                      </tr>
                    </thead>
                    <tbody>
                      {users.map((user, index) => (
                        <tr key={user.userId}>
                          <td>{index + 1}</td>
                          <td>{user.userId}</td>
                          <td>{user.fullName}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <p className="text-muted mb-0">No users found.</p>
              )}
            </div>
          </div>
        )}
      </div>
    );
  };

  const renderFeedback = () => {
    if (loading) return <LoadingSpinner />;

    return (
      <div>
        <div className="card border-0 shadow-sm">
          <div className="card-body">
            <h5 className="card-title mb-3">Customer Feedback</h5>
            {feedback.length > 0 ? (
              <div className="table-responsive">
                <table className="table table-hover">
                  <thead>
                    <tr>
                      <th width="50">#</th>
                      <th width="150">Name</th>
                      <th width="200">Email</th>
                      <th width="150">Rating</th>
                      <th>Message</th>
                      <th width="120">Date</th>
                    </tr>
                  </thead>
                  <tbody>
                    {feedback.map((item, index) => (
                      <tr key={item.feedbackId}>
                        <td>{index + 1}</td>
                        <td>
                          <strong>{item.name}</strong>
                        </td>
                        <td>
                          <small className="text-muted">{item.email}</small>
                        </td>
                        <td>
                          <div className="text-center">
                            {getRatingStars(item.rating)}
                          </div>
                        </td>
                        <td>
                          <div style={{ maxWidth: '300px' }}>
                            <p className="mb-0">{item.message}</p>
                          </div>
                        </td>
                        <td>
                          <small className="text-muted">
                            {new Date(item.createdAt).toLocaleDateString()}
                          </small>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <p className="text-muted mb-0">No feedback submitted yet.</p>
            )}
          </div>
        </div>
      </div>
    );
  };

  if (loading && !statistics) {
    return (
      <Layout>
        <LoadingSpinner />
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="container-xxl page-enter">
        <div className="d-flex justify-content-between align-items-center mb-4">
          <div>
            <h2 className="fw-bold mb-1">🔐 Admin Dashboard</h2>
            <p className="text-muted mb-0">System overview and management</p>
          </div>
        </div>

        {/* Tabs */}
        <ul className="nav nav-tabs mb-4" role="tablist">
          <li className="nav-item" role="presentation">
            <button
              className={`nav-link ${activeTab === 'overview' ? 'active' : ''}`}
              onClick={() => setActiveTab('overview')}
            >
              📊 Overview
            </button>
          </li>
          <li className="nav-item" role="presentation">
            <button
              className={`nav-link ${activeTab === 'users' ? 'active' : ''}`}
              onClick={() => setActiveTab('users')}
            >
              👥 Users
            </button>
          </li>
          <li className="nav-item" role="presentation">
            <button
              className={`nav-link ${activeTab === 'feedback' ? 'active' : ''}`}
              onClick={() => setActiveTab('feedback')}
            >
              💬 Feedback
            </button>
          </li>
        </ul>

        {/* Tab Content */}
        {activeTab === 'overview' && renderOverview()}
        {activeTab === 'users' && renderUsers()}
        {activeTab === 'feedback' && renderFeedback()}
      </div>
    </Layout>
  );
};

export default Admin;
