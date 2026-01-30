import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import Layout from '../../components/layout/Layout';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import { useToast } from '../../context/ToastContext';
import habitService from '../../services/habitService';
import categoryService from '../../services/categoryService';
import { getApiErrorMessage } from '../../utils/apiError';

const HabitForm = () => {
  const { id } = useParams();
  const isEditMode = !!id;
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    categoryId: '',
    habitName: '',
    description: '',
    startDate: new Date().toISOString().split('T')[0],
    endDate: '',
    scheduleDays: [],
    priority: 'MEDIUM',
    reminderTime: '',
  });
  const [dateError, setDateError] = useState('');
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(false);
  const { error: showError, success: showSuccess } = useToast();

  const daysOfWeek = [
    'MON',
    'TUE',
    'WED',
    'THU',
    'FRI',
    'SAT',
    'SUN',
  ];

  useEffect(() => {
    fetchCategories();
    if (isEditMode) {
      fetchHabit();
    }
  }, [id]);

  const fetchCategories = async () => {
    try {
      const data = await categoryService.getAllCategories();
      setCategories(data);
    } catch (err) {
      showError(getApiErrorMessage(err));
    }
  };

  const fetchHabit = async () => {
    try {
      setLoading(true);
      const habit = await habitService.getHabitById(id);
      setFormData({
        categoryId: habit.categoryId,
        habitName: habit.habitName,
        description: habit.description || '',
        startDate: habit.startDate?.split('T')[0] || '',
        endDate: habit.endDate?.split('T')[0] || '',
        scheduleDays: habit.scheduleDays || [],
        priority: habit.priority || 'MEDIUM',
        reminderTime: habit.reminderTime
          ? habit.reminderTime.substring(0, 5)
          : '', // Convert HH:mm:ss to HH:mm for time input
      });
    } catch (err) {
      showError(getApiErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  const validateDates = () => {
    const today = new Date().toISOString().split('T')[0];
    const errors = [];

    // Validate start date
    if (formData.startDate < today) {
      errors.push('Start date cannot be in the past');
      setDateError('Start date cannot be in the past');
    } else {
      setDateError('');
    }

    // Validate end date if provided
    if (formData.endDate && formData.startDate && formData.endDate < formData.startDate) {
      errors.push('End date cannot be before start date');
      setDateError('End date cannot be before start date');
    }

    return errors;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    
    // Clear date error when user starts typing
    if (name === 'startDate' || name === 'endDate') {
      setDateError('');
    }

    setFormData({ ...formData, [name]: value });
  };

  const handleDayToggle = (day) => {
    const days = formData.scheduleDays.includes(day)
      ? formData.scheduleDays.filter((d) => d !== day)
      : [...formData.scheduleDays, day];
    setFormData({ ...formData, scheduleDays: days });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (formData.scheduleDays.length === 0) {
      showError('Please select at least one day');
      return;
    }

    // Validate dates before submission
    const dateErrors = validateDates();
    if (dateErrors.length > 0) {
      showError(dateErrors.join(', '));
      return;
    }

    setLoading(true);

    try {
      // Convert reminder time to TimeSpan format (HH:mm:ss) if provided
      let reminderTime = null;
      if (formData.reminderTime) {
        const [hours, minutes] = formData.reminderTime.split(':');
        reminderTime = `${hours}:${minutes}:00`; // Format as HH:mm:ss
      }

      const submitData = {
        ...formData,
        categoryId: parseInt(formData.categoryId),
        startDate: new Date(formData.startDate).toISOString(),
        endDate: formData.endDate ? new Date(formData.endDate).toISOString() : null,
        priority: formData.priority,
        reminderTime: reminderTime,
      };

      if (isEditMode) {
        await habitService.updateHabit(id, submitData);
        showSuccess('Habit updated successfully');
      } else {
        await habitService.createHabit(submitData);
        showSuccess('Habit created successfully');
      }

      setTimeout(() => {
        navigate('/habits');
      }, 1000);
    } catch (err) {
      showError(getApiErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  if (loading && isEditMode) {
    return (
      <Layout>
        <LoadingSpinner />
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="container-xxl page-enter">
        <div className="row justify-content-center">
          <div className="col-lg-8">
            <div className="card border-0 shadow-sm card-hover">
              <div className="card-body p-4">
                <h3 className="mb-4">
                  {isEditMode ? '✏️ Edit Habit' : '➕ Create New Habit'}
                </h3>

                <form onSubmit={handleSubmit}>
                  <div className="mb-3">
                    <label htmlFor="categoryId" className="form-label">
                      Category *
                    </label>
                    <select
                      className="form-select"
                      id="categoryId"
                      name="categoryId"
                      value={formData.categoryId}
                      onChange={handleChange}
                      required
                    >
                      <option value="">Select a category</option>
                      {categories.map((cat) => (
                        <option key={cat.categoryId} value={cat.categoryId}>
                          {cat.categoryName}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="mb-3">
                    <label htmlFor="habitName" className="form-label">
                      Habit Name *
                    </label>
                    <input
                      type="text"
                      className="form-control"
                      id="habitName"
                      name="habitName"
                      value={formData.habitName}
                      onChange={handleChange}
                      required
                      minLength="2"
                      maxLength="100"
                    />
                  </div>

                  <div className="mb-3">
                    <label htmlFor="description" className="form-label">
                      Description
                    </label>
                    <textarea
                      className="form-control"
                      id="description"
                      name="description"
                      rows="3"
                      value={formData.description}
                      onChange={handleChange}
                      maxLength="500"
                    ></textarea>
                  </div>

                  <div className="row">
                    <div className="col-md-6 mb-3">
                      <label htmlFor="startDate" className="form-label">
                        Start Date *
                      </label>
                      <input
                        type="date"
                        className={`form-control ${dateError ? 'is-invalid' : ''}`}
                        id="startDate"
                        name="startDate"
                        value={formData.startDate}
                        onChange={handleChange}
                        min={new Date().toISOString().split('T')[0]}
                        required
                      />
                      {dateError && (
                        <div className="invalid-feedback d-block">
                          {dateError}
                        </div>
                      )}
                      <small className="text-muted">
                        📅 Start date cannot be in the past
                      </small>
                    </div>
                    <div className="col-md-6 mb-3">
                      <label htmlFor="endDate" className="form-label">
                        End Date (Optional)
                      </label>
                      <input
                        type="date"
                        className="form-control"
                        id="endDate"
                        name="endDate"
                        value={formData.endDate}
                        onChange={handleChange}
                        min={formData.startDate}
                      />
                      <small className="text-muted">
                        📅 End date must be after start date
                      </small>
                    </div>
                  </div>

                  <div className="mb-4">
                    <label className="form-label">Schedule Days *</label>
                    <div className="d-flex flex-wrap gap-2">
                      {daysOfWeek.map((day) => (
                        <button
                          key={day}
                          type="button"
                          className={`btn ${
                            formData.scheduleDays.includes(day)
                              ? 'btn-primary'
                              : 'btn-outline-primary'
                          }`}
                          onClick={() => handleDayToggle(day)}
                        >
                          {day}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="row">
                    <div className="col-md-6 mb-3">
                      <label htmlFor="priority" className="form-label">
                        Priority
                      </label>
                      <select
                        className="form-select"
                        id="priority"
                        name="priority"
                        value={formData.priority}
                        onChange={handleChange}
                      >
                        <option value="LOW">Low</option>
                        <option value="MEDIUM">Medium</option>
                        <option value="HIGH">High</option>
                      </select>
                    </div>
                    <div className="col-md-6 mb-3">
                      <label htmlFor="reminderTime" className="form-label">
                        Reminder Time (Optional)
                      </label>
                      <input
                        type="time"
                        className="form-control"
                        id="reminderTime"
                        name="reminderTime"
                        value={formData.reminderTime}
                        onChange={handleChange}
                      />
                      <small className="text-muted">
                        Set a daily reminder time for this habit
                      </small>
                    </div>
                  </div>

                  <div className="d-flex gap-2">
                    <button
                      type="submit"
                      className="btn btn-primary"
                      disabled={loading}
                    >
                      {loading ? (
                        <>
                          <span
                            className="spinner-border spinner-border-sm me-2"
                            role="status"
                          ></span>
                          Saving...
                        </>
                      ) : isEditMode ? (
                        'Update Habit'
                      ) : (
                        'Create Habit'
                      )}
                    </button>
                    <button
                      type="button"
                      className="btn btn-secondary"
                      onClick={() => navigate('/habits')}
                    >
                      Cancel
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default HabitForm;
