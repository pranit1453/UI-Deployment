import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Layout from '../../components/layout/Layout';
import StatCard from '../../components/common/StatCard';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import { useToast } from '../../context/ToastContext';
import dashboardService from '../../services/dashboardService';
import habitLogService from '../../services/habitLogService';
import reminderService from '../../services/reminderService';
import { getApiErrorMessage } from '../../utils/apiError';

const Dashboard = () => {
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const { error: showError, success: showSuccess } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    fetchDashboard();
  }, [selectedDate]);

  const fetchDashboard = async () => {
    try {
      setLoading(true);
      const data = await dashboardService.getDashboard(selectedDate);
      setDashboardData(data);
    } catch (err) {
      showError(getApiErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  const handleQuickLog = async (habitId, status) => {
    const today = new Date().toISOString().split('T')[0];
    try {
      await habitLogService.logHabit(habitId, { date: today, status });
      showSuccess(`Habit marked as ${status === 'DONE' ? 'completed' : status.toLowerCase()}`);
      fetchDashboard();
    } catch (err) {
      showError(getApiErrorMessage(err));
      fetchDashboard();
    }
  };

  const handleToggleReminder = async (habitId, currentStatus) => {
    try {
      const newStatus = !currentStatus;
      const updatedHabits = ongoingHabits.map((habit) =>
        habit.habitId === habitId
          ? { ...habit, reminderEnabled: newStatus }
          : habit
      );
      setDashboardData({
        ...dashboardData,
        ongoingHabits: updatedHabits,
      });
      await reminderService.toggleReminder(habitId, newStatus);
      showSuccess(`Reminder ${newStatus ? 'enabled' : 'disabled'} successfully`);
    } catch (err) {
      showError(getApiErrorMessage(err));
      fetchDashboard();
    }
  };

  if (loading) return <Layout><LoadingSpinner /></Layout>;

  const summary = dashboardData?.summary || {};
  const ongoingHabits = dashboardData?.ongoingHabits || [];
  const pastHabits = dashboardData?.pastHabits || [];

  return (
    <Layout>
      <div className="container-xxl page-enter">
        <div className="d-flex justify-content-between align-items-center mb-4">
          <div>
            <h2 className="fw-bold mb-1">📊 Dashboard</h2>
            <p className="text-muted mb-0">Track your daily habits and progress</p>
          </div>
          <div className="d-flex gap-2">
            <input
              type="date"
              className="form-control"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              style={{ maxWidth: '200px' }}
            />
            <button
              className="btn btn-outline-warning"
              onClick={() => navigate('/reminders')}
              title="Manage Reminders"
            >
              ⏰ Reminders
            </button>
            <button
              className="btn btn-primary"
              onClick={() => navigate('/habits/create')}
            >
              + New Habit
            </button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="row g-3 mb-4">
          <div className="col-md-3">
            <StatCard
              title="Total Habits"
              value={summary?.totalHabits || 0}
              icon="📊"
              color="primary"
            />
          </div>
          <div className="col-md-3">
            <StatCard
              title="Active Habits"
              value={ongoingHabits?.length || 0}
              icon="✅"
              color="success"
            />
          </div>
          <div className="col-md-3">
            <StatCard
              title="Completed Today"
              value={summary?.doneCount || 0}
              icon="🎯"
              color="info"
            />
          </div>
          <div className="col-md-3">
            <StatCard
              title="Current Streak"
              value={
                ongoingHabits?.reduce((max, habit) => 
                  Math.max(max, habit.currentStreak || 0), 0
                ) || 0
              }
              icon="🔥"
              color="warning"
              subtitle="days"
            />
          </div>
        </div>

        {/* Ongoing Habits */}
        <div className="card border-0 shadow-sm mb-4 card-hover">
          <div className="card-body">
            <h5 className="card-title mb-3">🔥 Ongoing Habits</h5>
            {ongoingHabits?.length > 0 ? (
              <div className="row g-3">
                {ongoingHabits.map((habit) => (
                  <div key={habit.habitId} className="col-md-6 col-lg-4">
                    <div className="card h-100 border card-hover">
                      <div className="card-body">
                        <div className="d-flex justify-content-between align-items-start mb-2">
                          <span className="badge bg-secondary">
                            {habit.categoryName}
                          </span>
                          <span className={`badge ${
                            habit.status === 'DONE' ? 'bg-success' : 
                            habit.status === 'SKIPPED' ? 'bg-danger' : 
                            habit.isScheduledToday ? 'bg-warning' : 'bg-secondary'
                          }`}>
                            {habit.status === 'DONE' ? '✅ Done' : 
                             habit.status === 'SKIPPED' ? '❌ Skipped' : 
                             habit.isScheduledToday ? '⏳ Pending' : '📅 Not Scheduled'}
                          </span>
                        </div>
                        <h5 className="card-title">{habit.habitName}</h5>
                        <p className="card-text small text-muted">
                          {habit.description || 'No description'}
                        </p>
                        <div className="mt-3">
                          <div className="d-flex justify-content-between align-items-center mb-2">
                            <span className="badge bg-primary">
                              🔥 Streak: {habit.currentStreak || 0} days
                            </span>
                            <span className="badge bg-info">
                              Best: {habit.longestStreak || 0} days
                            </span>
                          </div>
                          {habit.status === 'PENDING' && habit.isScheduledToday && (
                            <div className="btn-group w-100 mb-2" role="group">
                              <button
                                className="btn btn-sm btn-success"
                                onClick={() => handleQuickLog(habit.habitId, 'DONE')}
                              >
                                ✓ Done
                              </button>
                              <button
                                className="btn btn-sm btn-outline-danger"
                                onClick={() => handleQuickLog(habit.habitId, 'SKIPPED')}
                              >
                                ✗ Skip
                              </button>
                            </div>
                          )}
                          {!habit.isScheduledToday && (
                            <div className="alert alert-info py-2 mb-2 small" role="alert">
                              <small>
                                📅 <strong>Not scheduled today</strong>
                                <br />
                                This habit is not scheduled for today. Check your schedule settings.
                              </small>
                            </div>
                          )}
                          <div className="d-flex gap-2 mb-2">
                            <button
                              className="btn btn-sm btn-outline-primary flex-fill"
                              onClick={() => navigate(`/habits/${habit.habitId}`)}
                            >
                              View Details
                            </button>
                            <button
                              className={`btn btn-sm ${
                                habit.reminderEnabled
                                  ? 'btn-warning'
                                  : 'btn-outline-secondary'
                              }`}
                              onClick={() =>
                                handleToggleReminder(habit.habitId, habit.reminderEnabled)
                              }
                              title={habit.reminderEnabled ? 'Disable Reminder' : 'Enable Reminder'}
                            >
                              {habit.reminderEnabled ? '🔔' : '🔕'}
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-5">
                <div className="display-1 mb-3">📝</div>
                <p className="text-muted mb-3">
                  No ongoing habits. Create your first habit!
                </p>
                <button
                  className="btn btn-primary"
                  onClick={() => navigate('/habits/create')}
                >
                  Create Your First Habit
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Past Habits */}
        {pastHabits?.length > 0 && (
          <div className="card border-0 shadow-sm">
            <div className="card-body">
              <h5 className="card-title mb-3">Past Habits</h5>
              <div className="table-responsive">
                <table className="table table-hover">
                  <thead>
                    <tr>
                      <th>Habit Name</th>
                      <th>Category</th>
                      <th>Completion Rate</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {pastHabits.map((habit) => (
                      <tr key={habit.habitId}>
                        <td>{habit.habitName}</td>
                        <td>
                          <span className="badge bg-secondary">
                            {habit.categoryName}
                          </span>
                        </td>
                        <td>
                          <div className="d-flex align-items-center">
                            <div className="progress me-2" style={{ width: '60px', height: '8px' }}>
                              <div 
                                className="progress-bar bg-success" 
                                style={{ width: `${Math.min(habit.completionRate || 0, 100)}%` }}
                              ></div>
                            </div>
                            <span className="small">{(habit.completionRate || 0).toFixed(1)}%</span>
                          </div>
                        </td>
                        <td>
                          <button
                            className="btn btn-sm btn-outline-secondary"
                            onClick={() => navigate(`/habits/${habit.habitId}`)}
                          >
                            View Details
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
};

export default Dashboard;
