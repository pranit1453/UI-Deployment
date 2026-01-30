
import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Layout from '../../components/layout/Layout';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import { useToast } from '../../context/ToastContext';
import habitService from '../../services/habitService';
import habitLogService from '../../services/habitLogService';
import reminderService from '../../services/reminderService';
import { getApiErrorMessage } from '../../utils/apiError';

const HabitDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [habit, setHabit] = useState(null);
  const [todayStatus, setTodayStatus] = useState('PENDING');
  const [loading, setLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [habitLogs, setHabitLogs] = useState({});
  const [reminderTime, setReminderTime] = useState('');
  const [updatingReminderTime, setUpdatingReminderTime] = useState(false);
  const { error: showError, success: showSuccess } = useToast();

  useEffect(() => {
    fetchHabitDetails();
    fetchHabitLogs();
    // eslint-disable-next-line
  }, [id]);

  const fetchHabitDetails = async () => {
    try {
      setLoading(true);
      const data = await habitService.getHabitById(id);
      setHabit(data);
      setTodayStatus(data.todayStatus || 'PENDING');
      if (data.reminderTime) {
        setReminderTime(data.reminderTime.substring(0, 5)); // Convert HH:mm:ss to HH:mm
      }
    } catch (err) {
      showError(getApiErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  const fetchHabitLogs = async () => {
    try {
      // Fetch logs for the last 30 days
      // Note: This makes multiple API calls. If your backend has a bulk endpoint,
      // consider using that instead for better performance.
      const logs = {};
      const today = new Date();
      const promises = [];
      
      // Create promises for all dates
      for (let i = 0; i < 30; i++) {
        const date = new Date(today);
        date.setDate(date.getDate() - i);
        const dateStr = date.toISOString().split('T')[0];
        promises.push(
          habitLogService.getHabitLog(id, dateStr)
            .then(log => ({ dateStr, log }))
            .catch(() => null) // Log doesn't exist for this date
        );
      }
      
      // Wait for all requests to complete
      const results = await Promise.all(promises);
      results.forEach(result => {
        if (result && result.log) {
          logs[result.dateStr] = result.log;
        }
      });
      
      setHabitLogs(logs);
    } catch (err) {
      showError(getApiErrorMessage(err));
    }
  };

  // -------------------- ACTIONS --------------------

  const handleDelete = async () => {
    if (!window.confirm('Are you sure you want to delete this habit?')) return;
    try {
      await habitService.deleteHabit(id);
      showSuccess('Habit deleted successfully');
      setTimeout(() => navigate('/habits'), 1000);
    } catch (err) {
      showError(getApiErrorMessage(err));
    }
  };

  const handleToggleActive = async () => {
    try {
      setHabit({ ...habit, isActive: !habit.isActive });
      await habitService.toggleHabitStatus(id);
      showSuccess(`Habit ${habit.isActive ? 'deactivated' : 'activated'} successfully`);
      fetchHabitDetails();
    } catch (err) {
      showError(getApiErrorMessage(err));
      fetchHabitDetails();
    }
  };

  const handleToggleReminder = async () => {
    try {
      const newStatus = !habit.reminderEnabled;
      setHabit({ ...habit, reminderEnabled: newStatus });
      await reminderService.toggleReminder(id, newStatus);
      showSuccess(`Reminder ${newStatus ? 'enabled' : 'disabled'} successfully`);
    } catch (err) {
      showError(getApiErrorMessage(err));
      fetchHabitDetails();
    }
  };

  const handleUpdateReminderTime = async () => {
    if (!reminderTime) {
      showError('Please enter a reminder time');
      return;
    }
    setUpdatingReminderTime(true);
    try {
      await reminderService.updateReminderTime(id, reminderTime);
      showSuccess('Reminder time updated successfully');
      fetchHabitDetails();
    } catch (err) {
      showError(getApiErrorMessage(err));
    } finally {
      setUpdatingReminderTime(false);
    }
  };

  const handleDailyStatus = async (status) => {
    const today = new Date().toISOString().split('T')[0];
    try {
      if (status === 'DONE') {
        await habitLogService.logHabit(id, { date: today, status: 'DONE' });
        showSuccess('Habit marked as completed');
      } else if (status === 'SKIPPED') {
        await habitLogService.logHabit(id, { date: today, status: 'SKIPPED' });
        showSuccess('Habit marked as skipped');
      }
      fetchHabitDetails();
      fetchHabitLogs();
    } catch (err) {
      showError(getApiErrorMessage(err));
      fetchHabitDetails();
      fetchHabitLogs();
    }
  };

  const handleDateLog = async (date, status) => {
    try {
      if (status === 'DELETE') {
        await habitLogService.deleteHabitLog(id, date);
        showSuccess('Habit log deleted');
      } else {
        await habitLogService.logHabit(id, { date, status });
        showSuccess(`Habit marked as ${status.toLowerCase()}`);
      }
      fetchHabitDetails();
      fetchHabitLogs();
    } catch (err) {
      showError(getApiErrorMessage(err));
      fetchHabitDetails();
      fetchHabitLogs();
    }
  };

  const getLogStatusForDate = (date) => {
    return habitLogs[date]?.status || null;
  };

  const renderCalendarGrid = () => {
    const days = [];
    const today = new Date();
    for (let i = 29; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);
      const dateStr = date.toISOString().split('T')[0];
      const dayOfWeek = date.getDay();
      const dayName = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'][dayOfWeek];
      const dayNum = date.getDate();
      const isToday = dateStr === today.toISOString().split('T')[0];
      const logStatus = getLogStatusForDate(dateStr);
      
      days.push(
        <div
          key={dateStr}
          className={`calendar-day ${isToday ? 'today' : ''} ${logStatus ? `status-${logStatus.toLowerCase()}` : ''}`}
          title={dateStr}
        >
          <div className="day-name">{dayName}</div>
          <div className="day-number">{dayNum}</div>
          {logStatus === 'DONE' && <div className="status-icon">✓</div>}
          {logStatus === 'SKIPPED' && <div className="status-icon">✗</div>}
        </div>
      );
    }
    return days;
  };

  // -------------------- UI STATES --------------------

  if (loading) {
    return (
      <Layout>
        <LoadingSpinner />
      </Layout>
    );
  }


  if (!habit) {
    return (
      <Layout>
        <div className="container-xxl py-4">
          <div className="alert alert-warning">Habit not found</div>
          <button className="btn btn-secondary" onClick={() => navigate('/dashboard')}>
            Back to Dashboard
          </button>
        </div>
      </Layout>
    );
  }

  // -------------------- MAIN UI --------------------

  return (
    <Layout>
      <div className="container-xxl py-4">
        {/* Header */}
        <div className="d-flex justify-content-between align-items-start mb-4">
          <div>
            <h2 className="fw-bold mb-2">{habit.habitName}</h2>
            <div className="d-flex gap-2 align-items-center">
              <span className="badge bg-secondary">{habit.categoryName}</span>
              <span className={`badge ${habit.isActive ? 'bg-success' : 'bg-danger'}`}>
                {habit.isActive ? 'Active' : 'Inactive'}
              </span>
            </div>
          </div>
          <button
            className="btn btn-outline-secondary"
            onClick={() => navigate('/dashboard')}
          >
            ← Back
          </button>
        </div>

        <div className="row g-4">
          {/* LEFT SIDE */}
          <div className="col-lg-8">
            {/* Habit Info */}
            <div className="card border-0 shadow-sm mb-4">
              <div className="card-body">
                <h5 className="card-title mb-3">Habit Information</h5>

                {habit.description && (
                  <div className="mb-3">
                    <label className="text-muted small mb-1">Description</label>
                    <p className="mb-0">{habit.description}</p>
                  </div>
                )}

                <div className="row g-3">
                  <div className="col-md-6">
                    <label className="text-muted small mb-1">Start Date</label>
                    <p className="mb-0">
                      {new Date(habit.startDate).toLocaleDateString()}
                    </p>
                  </div>

                  {habit.endDate && (
                    <div className="col-md-6">
                      <label className="text-muted small mb-1">End Date</label>
                      <p className="mb-0">
                        {new Date(habit.endDate).toLocaleDateString()}
                      </p>
                    </div>
                  )}

                  <div className="col-md-6">
                    <label className="text-muted small mb-1">Created At</label>
                    <p className="mb-0">
                      {new Date(habit.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="card border-0 shadow-sm">
              <div className="card-body">
                <h5 className="card-title mb-3">Actions</h5>
                <div className="d-flex gap-2 flex-wrap">
                  <button
                    className="btn btn-primary"
                    onClick={() => navigate(`/habits/edit/${habit.habitId}`)}
                  >
                    ✏️ Edit Habit
                  </button>

                  <button
                    className="btn btn-outline-info"
                    onClick={() => navigate(`/habits/${habit.habitId}/logs`)}
                  >
                    📊 View Logs
                  </button>

                  <button
                    className={`btn ${habit.isActive ? 'btn-warning' : 'btn-success'}`}
                    onClick={handleToggleActive}
                  >
                    {habit.isActive ? '⏸️ Deactivate' : '▶️ Activate'}
                  </button>

                  <button
                    className={`btn ${habit.reminderEnabled ? 'btn-warning' : 'btn-outline-secondary'}`}
                    onClick={handleToggleReminder}
                  >
                    {habit.reminderEnabled ? '🔔 Disable Reminder' : '🔕 Enable Reminder'}
                  </button>

                  {/* Custom Reminder Time */}
                  {habit.reminderEnabled && (
                    <div className="d-flex gap-2 align-items-end">
                      <div>
                        <label className="form-label small mb-1">Reminder Time</label>
                        <input
                          type="time"
                          className="form-control form-control-sm"
                          value={reminderTime}
                          onChange={(e) => setReminderTime(e.target.value)}
                          style={{ width: '150px' }}
                        />
                      </div>
                      <button
                        className="btn btn-sm btn-primary"
                        onClick={handleUpdateReminderTime}
                        disabled={updatingReminderTime}
                      >
                        {updatingReminderTime ? 'Updating...' : 'Update Time'}
                      </button>
                    </div>
                  )}

                  <button className="btn btn-danger" onClick={handleDelete}>
                    🗑️ Delete Habit
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* RIGHT SIDE */}
          <div className="col-lg-4">
            <div className="card border-0 shadow-sm">
              <div className="card-body">
                <h5 className="card-title mb-3">Statistics</h5>

                <div className="d-flex flex-column gap-3">
                  <div className="text-center p-3 bg-light rounded">
                    <div className="display-6 fw-bold text-primary">
                      {habit.currentStreak || 0}
                    </div>
                    <div className="text-muted small">Current Streak (days)</div>
                  </div>

                  <div className="text-center p-3 bg-light rounded">
                    <div className="display-6 fw-bold text-warning">
                      {habit.longestStreak || 0}
                    </div>
                    <div className="text-muted small">Longest Streak (days)</div>
                  </div>

                  {/* DAILY STATUS */}
                  <div className="text-center p-3 bg-light rounded">
                    <div className="fw-bold mb-2">Today</div>

                    {todayStatus === 'DONE' && (
                      <div className="text-success fw-bold mb-2">✅ Done</div>
                    )}

                    {todayStatus === 'SKIPPED' && (
                      <div className="text-danger fw-bold mb-2">❌ Skipped</div>
                    )}

                    {todayStatus === 'PENDING' && (
                      <div className="d-flex justify-content-center gap-2 mb-2">
                        <button
                          className="btn btn-success btn-sm"
                          onClick={() => handleDailyStatus('DONE')}
                        >
                          ✔ Done
                        </button>
                        <button
                          className="btn btn-outline-danger btn-sm"
                          onClick={() => handleDailyStatus('SKIPPED')}
                        >
                          ✖ Skip
                        </button>
                      </div>
                    )}

                    <div className="text-muted small">Daily Status</div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Calendar View */}
          <div className="col-12 mt-4">
            <div className="card border-0 shadow-sm">
              <div className="card-body">
                <h5 className="card-title mb-3">30-Day Activity Calendar</h5>
                <div className="calendar-grid">
                  {renderCalendarGrid()}
                </div>
                <div className="mt-3 d-flex gap-3 justify-content-center">
                  <div className="d-flex align-items-center gap-2">
                    <div className="calendar-legend done"></div>
                    <small>Done</small>
                  </div>
                  <div className="d-flex align-items-center gap-2">
                    <div className="calendar-legend skipped"></div>
                    <small>Skipped</small>
                  </div>
                  <div className="d-flex align-items-center gap-2">
                    <div className="calendar-legend pending"></div>
                    <small>Pending</small>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default HabitDetail;
