import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Layout from '../../components/layout/Layout';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import EmptyState from '../../components/common/EmptyState';
import { useToast } from '../../context/ToastContext';
import habitService from '../../services/habitService';
import categoryService from '../../services/categoryService';
import reminderService from '../../services/reminderService';
import { getApiErrorMessage } from '../../utils/apiError';

const HabitsList = () => {
  const [habits, setHabits] = useState([]);
  const [filteredHabits, setFilteredHabits] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all'); // all, active, inactive
  const [filterCategory, setFilterCategory] = useState('all');
  const [categories, setCategories] = useState([]);
  const { error: showError, success: showSuccess } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    fetchHabits();
    fetchCategories();
  }, []);

  useEffect(() => {
    filterHabits();
  }, [habits, searchTerm, filterStatus, filterCategory]);

  const fetchHabits = async () => {
    try {
      setLoading(true);
      const data = await habitService.getAllHabits();
      setHabits(data);
      setFilteredHabits(data);
    } catch (err) {
      showError(getApiErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  const fetchCategories = async () => {
    try {
      const data = await categoryService.getAllCategories();
      setCategories(data);
    } catch (err) {
      console.error('Failed to load categories:', err);
    }
  };

  const filterHabits = () => {
    let filtered = [...habits];

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(
        (habit) =>
          habit.habitName.toLowerCase().includes(searchTerm.toLowerCase()) ||
          (habit.description && habit.description.toLowerCase().includes(searchTerm.toLowerCase())) ||
          habit.categoryName.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Status filter
    if (filterStatus === 'active') {
      filtered = filtered.filter((habit) => habit.isActive);
    } else if (filterStatus === 'inactive') {
      filtered = filtered.filter((habit) => !habit.isActive);
    }

    // Category filter
    if (filterCategory !== 'all') {
      filtered = filtered.filter(
        (habit) => habit.categoryId === parseInt(filterCategory)
      );
    }

    setFilteredHabits(filtered);
  };

  const handleDelete = async (habitId) => {
    if (!window.confirm('Are you sure you want to delete this habit?')) return;
    try {
      const updatedHabits = habits.filter((h) => h.habitId !== habitId);
      setHabits(updatedHabits);
      await habitService.deleteHabit(habitId);
      showSuccess('Habit deleted successfully');
    } catch (err) {
      showError(getApiErrorMessage(err));
      fetchHabits();
    }
  };

  const handleToggleStatus = async (habitId) => {
    try {
      const updatedHabits = habits.map((h) =>
        h.habitId === habitId ? { ...h, isActive: !h.isActive } : h
      );
      setHabits(updatedHabits);
      await habitService.toggleHabitStatus(habitId);
      const habit = habits.find((h) => h.habitId === habitId);
      showSuccess(`Habit ${habit?.isActive ? 'deactivated' : 'activated'} successfully`);
    } catch (err) {
      showError(getApiErrorMessage(err));
      fetchHabits();
    }
  };

  const handleToggleReminder = async (habitId, currentStatus) => {
    try {
      const newStatus = !currentStatus;
      const updatedHabits = habits.map((h) =>
        h.habitId === habitId ? { ...h, reminderEnabled: newStatus } : h
      );
      setHabits(updatedHabits);
      await reminderService.toggleReminder(habitId, newStatus);
      showSuccess(`Reminder ${newStatus ? 'enabled' : 'disabled'} successfully`);
    } catch (err) {
      showError(getApiErrorMessage(err));
      fetchHabits();
    }
  };

  if (loading) return <Layout><LoadingSpinner /></Layout>;

  return (
    <Layout>
      <div className="container-xxl page-enter">
        <div className="d-flex justify-content-between align-items-center mb-4">
          <div>
            <h2 className="fw-bold mb-1">📋 My Habits</h2>
            <p className="text-muted mb-0">Manage your daily habits</p>
          </div>
          <button
            className="btn btn-primary"
            onClick={() => navigate('/habits/create')}
          >
            + Create Habit
          </button>
        </div>

        {/* Search and Filter Section */}
        <div className="search-filter-container">
          <div className="row g-3">
            <div className="col-md-4">
              <label htmlFor="search" className="form-label">Search</label>
              <input
                type="text"
                className="form-control"
                id="search"
                placeholder="Search habits..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <div className="col-md-3">
              <label htmlFor="statusFilter" className="form-label">Status</label>
              <select
                className="form-select"
                id="statusFilter"
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
              >
                <option value="all">All Status</option>
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
              </select>
            </div>
            <div className="col-md-3">
              <label htmlFor="categoryFilter" className="form-label">Category</label>
              <select
                className="form-select"
                id="categoryFilter"
                value={filterCategory}
                onChange={(e) => setFilterCategory(e.target.value)}
              >
                <option value="all">All Categories</option>
                {categories.map((cat) => (
                  <option key={cat.categoryId} value={cat.categoryId}>
                    {cat.categoryName}
                  </option>
                ))}
              </select>
            </div>
            <div className="col-md-2 d-flex align-items-end">
              <button
                className="btn btn-outline-secondary w-100"
                onClick={() => {
                  setSearchTerm('');
                  setFilterStatus('all');
                  setFilterCategory('all');
                }}
              >
                Clear Filters
              </button>
            </div>
          </div>
          {filteredHabits.length !== habits.length && (
            <div className="mt-2">
              <small className="text-muted">
                Showing {filteredHabits.length} of {habits.length} habits
              </small>
            </div>
          )}
        </div>

        {habits.length === 0 ? (
          <EmptyState
            title="No Habits Yet"
            message="Start building better habits by creating your first one!"
            action={
              <button
                className="btn btn-primary"
                onClick={() => navigate('/habits/create')}
              >
                Create Your First Habit
              </button>
            }
          />
        ) : filteredHabits.length === 0 ? (
          <div className="text-center py-5">
            <div className="display-1 mb-3">🔍</div>
            <h5>No habits found</h5>
            <p className="text-muted">Try adjusting your search or filters</p>
            <button
              className="btn btn-outline-primary"
              onClick={() => {
                setSearchTerm('');
                setFilterStatus('all');
                setFilterCategory('all');
              }}
            >
              Clear Filters
            </button>
          </div>
        ) : (
          <div className="row g-4">
            {filteredHabits.map((habit) => (
              <div key={habit.habitId} className="col-md-6 col-lg-4">
                <div className="card h-100 shadow-sm border-0 card-hover">
                  <div className="card-body">
                    <div className="d-flex justify-content-between align-items-start mb-2">
                      <span className="badge bg-secondary">
                        {habit.categoryName}
                      </span>
                      <span
                        className={`badge ${
                          habit.isActive ? 'bg-success' : 'bg-danger'
                        }`}
                      >
                        {habit.isActive ? '✅ Active' : '⏸️ Inactive'}
                      </span>
                    </div>
                    <h5 className="card-title mb-2">{habit.habitName}</h5>
                    <p className="card-text text-muted small">
                      {habit.description || 'No description'}
                    </p>
                    <div className="mt-3">
                      <div className="d-flex justify-content-between align-items-center mb-2">
                        <small className="text-muted">
                          📅 Started: {new Date(habit.startDate).toLocaleDateString()}
                        </small>
                        {habit.currentStreak > 0 && (
                          <span className="badge bg-warning text-dark">
                            🔥 {habit.currentStreak} day streak
                          </span>
                        )}
                      </div>
                      {habit.todayStatus && (
                        <div className="mb-2">
                          <small className="text-muted">Today: </small>
                          <span className={`badge ${
                            habit.todayStatus === 'DONE' ? 'bg-success' :
                            habit.todayStatus === 'SKIPPED' ? 'bg-danger' :
                            'bg-secondary'
                          }`}>
                            {habit.todayStatus === 'DONE' ? '✅ Done' :
                             habit.todayStatus === 'SKIPPED' ? '❌ Skipped' :
                             '⏳ Pending'}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="card-footer bg-transparent border-top">
                    <div className="d-flex gap-2">
                      <button
                        className="btn btn-sm btn-outline-primary flex-fill"
                        onClick={() => navigate(`/habits/${habit.habitId}`)}
                      >
                        View
                      </button>
                      <button
                        className="btn btn-sm btn-outline-secondary"
                        onClick={() => navigate(`/habits/edit/${habit.habitId}`)}
                        title="Edit"
                      >
                        ✏️
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
                      <button
                        className="btn btn-sm btn-outline-warning"
                        onClick={() => handleToggleStatus(habit.habitId)}
                        title={habit.isActive ? 'Deactivate' : 'Activate'}
                      >
                        {habit.isActive ? '⏸️' : '▶️'}
                      </button>
                      <button
                        className="btn btn-sm btn-outline-danger"
                        onClick={() => handleDelete(habit.habitId)}
                        title="Delete"
                      >
                        🗑️
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </Layout>
  );
};

export default HabitsList;
