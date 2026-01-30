import { useState, useEffect } from 'react';
import Layout from '../../components/layout/Layout';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import Modal from '../../components/common/Modal';
import { useToast } from '../../context/ToastContext';
import reminderService from '../../services/reminderService';
import habitService from '../../services/habitService';
import { getApiErrorMessage } from '../../utils/apiError';

const ReminderSettings = () => {
  const [reminders, setReminders] = useState([]);
  const [habits, setHabits] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingReminder, setEditingReminder] = useState(null);
  const [formData, setFormData] = useState({
    habitId: '',
    enabled: true,
    reminderTime: '09:00'
  });
  const [bulkMode, setBulkMode] = useState(false);
  const [selectedReminders, setSelectedReminders] = useState(new Set());
  const { error: showError, success: showSuccess } = useToast();

  useEffect(() => {
    fetchReminders();
    fetchHabits();
  }, []);

  const fetchReminders = async () => {
    try {
      setLoading(true);
      const data = await reminderService.getAllReminders();
      setReminders(data || []);
    } catch (err) {
      showError(getApiErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  const fetchHabits = async () => {
    try {
      const data = await habitService.getAllHabits();
      setHabits(data.filter(h => h.isActive));
    } catch (err) {
      showError(getApiErrorMessage(err));
    }
  };

  const handleOpenModal = (reminder = null) => {
    if (reminder) {
      setEditingReminder(reminder);
      setFormData({
        habitId: reminder.habitId.toString(),
        enabled: reminder.enabled,
        reminderTime: reminder.reminderTime || '09:00'
      });
    } else {
      setEditingReminder(null);
      setFormData({
        habitId: '',
        enabled: true,
        reminderTime: '09:00'
      });
    }
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setEditingReminder(null);
    setFormData({
      habitId: '',
      enabled: true,
      reminderTime: '09:00'
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingReminder) {
        await reminderService.updateReminderTime(
          parseInt(formData.habitId),
          formData.reminderTime
        );
        if (formData.enabled !== editingReminder.enabled) {
          await reminderService.toggleReminder(
            parseInt(formData.habitId),
            formData.enabled
          );
        }
        showSuccess('Reminder updated successfully');
      } else {
        await reminderService.updateReminderTime(
          parseInt(formData.habitId),
          formData.reminderTime
        );
        if (!formData.enabled) {
          await reminderService.toggleReminder(
            parseInt(formData.habitId),
            false
          );
        }
        showSuccess('Reminder created successfully');
      }
      fetchReminders();
      handleCloseModal();
    } catch (err) {
      showError(getApiErrorMessage(err));
    }
  };

  const handleToggleReminder = async (habitId, currentStatus) => {
    try {
      const newStatus = !currentStatus;
      await reminderService.toggleReminder(habitId, newStatus);
      showSuccess(`Reminder ${newStatus ? 'enabled' : 'disabled'} successfully`);
      fetchReminders();
    } catch (err) {
      showError(getApiErrorMessage(err));
    }
  };

  const handleSendMissedAlerts = async () => {
    try {
      await reminderService.sendMissedAlerts();
      showSuccess('Missed habit alerts sent successfully');
    } catch (err) {
      showError(getApiErrorMessage(err));
    }
  };

  const handleBulkUpdate = async () => {
    if (selectedReminders.size === 0) {
      showError('Please select reminders to update');
      return;
    }

    try {
      const updates = Array.from(selectedReminders).map(habitId => ({
        habitId: parseInt(habitId),
        enabled: true,
        reminderTime: formData.reminderTime
      }));

      await reminderService.bulkUpdateReminders(updates);
      showSuccess(`${selectedReminders.size} reminders updated successfully`);
      setSelectedReminders(new Set());
      setBulkMode(false);
      fetchReminders();
    } catch (err) {
      showError(getApiErrorMessage(err));
    }
  };

  const toggleReminderSelection = (habitId) => {
    const newSelected = new Set(selectedReminders);
    if (newSelected.has(habitId)) {
      newSelected.delete(habitId);
    } else {
      newSelected.add(habitId);
    }
    setSelectedReminders(newSelected);
  };

  const getHabitName = (habitId) => {
    const habit = habits.find(h => h.habitId === habitId);
    return habit?.habitName || 'Unknown Habit';
  };

  const getCategoryName = (habitId) => {
    const habit = habits.find(h => h.habitId === habitId);
    return habit?.categoryName || 'General';
  };

  const getScheduleDays = (habitId) => {
    const habit = habits.find(h => h.habitId === habitId);
    return habit?.scheduleDays || [];
  };

  if (loading) {
    return (
      <Layout>
        <LoadingSpinner />
      </Layout>
    );
  }

  const activeReminders = reminders.filter(r => r.enabled);
  const inactiveReminders = reminders.filter(r => !r.enabled);

  return (
    <Layout>
      <div className="container-xxl page-enter">
        <div className="d-flex justify-content-between align-items-center mb-4">
          <div>
            <h2 className="fw-bold mb-1">⏰ Reminder Settings</h2>
            <p className="text-muted mb-0">Manage habit reminders and notifications</p>
          </div>
          <div className="d-flex gap-2">
            <button
              className="btn btn-outline-warning"
              onClick={handleSendMissedAlerts}
            >
              📧 Send Missed Alerts
            </button>
            <button
              className={`btn ${bulkMode ? 'btn-success' : 'btn-outline-primary'}`}
              onClick={() => setBulkMode(!bulkMode)}
            >
              {bulkMode ? '✓ Bulk Mode On' : '🔧 Bulk Update'}
            </button>
            <button
              className="btn btn-primary"
              onClick={() => handleOpenModal()}
            >
              + Add Reminder
            </button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="row g-3 mb-4">
          <div className="col-md-4">
            <div className="card border-0 shadow-sm">
              <div className="card-body text-center">
                <div className="h1 text-primary">🔔</div>
                <h3 className="fw-bold">{activeReminders.length}</h3>
                <p className="text-muted mb-0">Active Reminders</p>
              </div>
            </div>
          </div>
          <div className="col-md-4">
            <div className="card border-0 shadow-sm">
              <div className="card-body text-center">
                <div className="h1 text-secondary">🔕</div>
                <h3 className="fw-bold">{inactiveReminders.length}</h3>
                <p className="text-muted mb-0">Inactive Reminders</p>
              </div>
            </div>
          </div>
          <div className="col-md-4">
            <div className="card border-0 shadow-sm">
              <div className="card-body text-center">
                <div className="h1 text-info">📊</div>
                <h3 className="fw-bold">{habits.length}</h3>
                <p className="text-muted mb-0">Total Habits</p>
              </div>
            </div>
          </div>
        </div>

        {/* Bulk Update Controls */}
        {bulkMode && (
          <div className="card border-0 shadow-sm mb-4 border-warning">
            <div className="card-body">
              <h5 className="card-title mb-3">🔧 Bulk Update Selected</h5>
              <div className="row g-3 align-items-end">
                <div className="col-md-4">
                  <label className="form-label">Reminder Time</label>
                  <input
                    type="time"
                    className="form-control"
                    value={formData.reminderTime}
                    onChange={(e) => setFormData({ ...formData, reminderTime: e.target.value })}
                  />
                </div>
                <div className="col-md-4">
                  <div className="form-check">
                    <input
                      className="form-check-input"
                      type="checkbox"
                      id="bulkEnable"
                      checked={formData.enabled}
                      onChange={(e) => setFormData({ ...formData, enabled: e.target.checked })}
                    />
                    <label className="form-check-label" htmlFor="bulkEnable">
                      Enable Reminders
                    </label>
                  </div>
                </div>
                <div className="col-md-4">
                  <button
                    className="btn btn-success w-100"
                    onClick={handleBulkUpdate}
                    disabled={selectedReminders.size === 0}
                  >
                    Update {selectedReminders.size} Selected
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Active Reminders */}
        <div className="card border-0 shadow-sm mb-4">
          <div className="card-body">
            <div className="d-flex justify-content-between align-items-center mb-3">
              <h5 className="card-title mb-0">🔔 Active Reminders</h5>
              {bulkMode && (
                <div className="form-check">
                  <input
                    className="form-check-input"
                    type="checkbox"
                    id="selectAllActive"
                    checked={selectedReminders.size === activeReminders.length && activeReminders.length > 0}
                    onChange={(e) => {
                      if (e.target.checked) {
                        setSelectedReminders(new Set(activeReminders.map(r => r.habitId)));
                      } else {
                        setSelectedReminders(new Set());
                      }
                    }}
                  />
                  <label className="form-check-label" htmlFor="selectAllActive">
                    Select All
                  </label>
                </div>
              )}
            </div>

            {activeReminders.length === 0 ? (
              <div className="text-center py-5">
                <div className="display-1 mb-3">🔔</div>
                <p className="text-muted mb-0">No active reminders found</p>
              </div>
            ) : (
              <div className="table-responsive">
                <table className="table table-hover">
                  <thead>
                    <tr>
                      {bulkMode && <th width="50"></th>}
                      <th>Habit</th>
                      <th>Category</th>
                      <th>Schedule</th>
                      <th>Time</th>
                      <th>Status</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {activeReminders.map((reminder) => (
                      <tr key={reminder.habitId}>
                        {bulkMode && (
                          <td>
                            <input
                              type="checkbox"
                              checked={selectedReminders.has(reminder.habitId)}
                              onChange={() => toggleReminderSelection(reminder.habitId)}
                            />
                          </td>
                        )}
                        <td>
                          <div>
                            <strong>{getHabitName(reminder.habitId)}</strong>
                          </div>
                        </td>
                        <td>
                          <span className="badge bg-secondary">
                            {getCategoryName(reminder.habitId)}
                          </span>
                        </td>
                        <td>
                          <div className="d-flex flex-wrap gap-1">
                            {getScheduleDays(reminder.habitId).map(day => (
                              <span key={day} className="badge bg-primary text-white" style={{ fontSize: '0.7rem' }}>
                                {day}
                              </span>
                            ))}
                          </div>
                        </td>
                        <td>
                          <span className="badge bg-info">
                            🕐 {reminder.reminderTime || 'Not set'}
                          </span>
                        </td>
                        <td>
                          <span className="badge bg-success">
                            🔔 Active
                          </span>
                        </td>
                        <td>
                          <div className="btn-group" role="group">
                            <button
                              className="btn btn-sm btn-outline-warning"
                              onClick={() => handleOpenModal(reminder)}
                              title="Edit Reminder"
                            >
                              ✏️
                            </button>
                            <button
                              className="btn btn-sm btn-outline-danger"
                              onClick={() => handleToggleReminder(reminder.habitId, true)}
                              title="Disable Reminder"
                            >
                              🔕
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>

        {/* Inactive Reminders */}
        <div className="card border-0 shadow-sm">
          <div className="card-body">
            <div className="d-flex justify-content-between align-items-center mb-3">
              <h5 className="card-title mb-0">🔕 Inactive Reminders</h5>
              {bulkMode && (
                <div className="form-check">
                  <input
                    className="form-check-input"
                    type="checkbox"
                    id="selectAllInactive"
                    checked={selectedReminders.size === inactiveReminders.length && inactiveReminders.length > 0}
                    onChange={(e) => {
                      if (e.target.checked) {
                        setSelectedReminders(new Set(inactiveReminders.map(r => r.habitId)));
                      } else {
                        setSelectedReminders(new Set());
                      }
                    }}
                  />
                  <label className="form-check-label" htmlFor="selectAllInactive">
                    Select All
                  </label>
                </div>
              )}
            </div>

            {inactiveReminders.length === 0 ? (
              <div className="text-center py-5">
                <div className="display-1 mb-3">🔕</div>
                <p className="text-muted mb-0">No inactive reminders found</p>
              </div>
            ) : (
              <div className="table-responsive">
                <table className="table table-hover">
                  <thead>
                    <tr>
                      {bulkMode && <th width="50"></th>}
                      <th>Habit</th>
                      <th>Category</th>
                      <th>Schedule</th>
                      <th>Time</th>
                      <th>Status</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {inactiveReminders.map((reminder) => (
                      <tr key={reminder.habitId}>
                        {bulkMode && (
                          <td>
                            <input
                              type="checkbox"
                              checked={selectedReminders.has(reminder.habitId)}
                              onChange={() => toggleReminderSelection(reminder.habitId)}
                            />
                          </td>
                        )}
                        <td>
                          <div>
                            <strong>{getHabitName(reminder.habitId)}</strong>
                          </div>
                        </td>
                        <td>
                          <span className="badge bg-secondary">
                            {getCategoryName(reminder.habitId)}
                          </span>
                        </td>
                        <td>
                          <div className="d-flex flex-wrap gap-1">
                            {getScheduleDays(reminder.habitId).map(day => (
                              <span key={day} className="badge bg-secondary text-white" style={{ fontSize: '0.7rem' }}>
                                {day}
                              </span>
                            ))}
                          </div>
                        </td>
                        <td>
                          <span className="badge bg-light text-dark">
                            🕐 {reminder.reminderTime || 'Not set'}
                          </span>
                        </td>
                        <td>
                          <span className="badge bg-secondary">
                            🔕 Inactive
                          </span>
                        </td>
                        <td>
                          <div className="btn-group" role="group">
                            <button
                              className="btn btn-sm btn-outline-success"
                              onClick={() => handleToggleReminder(reminder.habitId, false)}
                              title="Enable Reminder"
                            >
                              🔔
                            </button>
                            <button
                              className="btn btn-sm btn-outline-primary"
                              onClick={() => handleOpenModal(reminder)}
                              title="Edit Reminder"
                            >
                              ✏️
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>

        {/* Add/Edit Reminder Modal */}
        <Modal
          show={showModal}
          onHide={handleCloseModal}
          title={editingReminder ? '✏️ Edit Reminder' : '➕ Add Reminder'}
          footer={
            <>
              <button className="btn btn-secondary" onClick={handleCloseModal}>
                Cancel
              </button>
              <button className="btn btn-primary" onClick={handleSubmit}>
                {editingReminder ? 'Update Reminder' : 'Add Reminder'}
              </button>
            </>
          }
        >
          <form onSubmit={handleSubmit}>
            <div className="mb-3">
              <label htmlFor="habitId" className="form-label">
                Habit *
              </label>
              <select
                className="form-select"
                id="habitId"
                value={formData.habitId}
                onChange={(e) => setFormData({ ...formData, habitId: e.target.value })}
                required
              >
                <option value="">Select a habit</option>
                {habits.map((habit) => (
                  <option key={habit.habitId} value={habit.habitId}>
                    {habit.habitName} ({habit.categoryName})
                  </option>
                ))}
              </select>
            </div>

            <div className="mb-3">
              <label htmlFor="reminderTime" className="form-label">
                Reminder Time *
              </label>
              <input
                type="time"
                className="form-control"
                id="reminderTime"
                value={formData.reminderTime}
                onChange={(e) => setFormData({ ...formData, reminderTime: e.target.value })}
                required
              />
              <small className="text-muted">
                Set the time when you want to receive daily reminders
              </small>
            </div>

            <div className="mb-3">
              <div className="form-check">
                <input
                  className="form-check-input"
                  type="checkbox"
                  id="enabled"
                  checked={formData.enabled}
                  onChange={(e) => setFormData({ ...formData, enabled: e.target.checked })}
                />
                <label className="form-check-label" htmlFor="enabled">
                  Enable Reminder
                </label>
              </div>
              <small className="text-muted">
                Turn this on to receive daily reminders for this habit
              </small>
            </div>
          </form>
        </Modal>
      </div>
    </Layout>
  );
};

export default ReminderSettings;
