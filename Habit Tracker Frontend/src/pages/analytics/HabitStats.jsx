import { useState, useEffect } from 'react';
import Layout from '../../components/layout/Layout';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import StatCard from '../../components/common/StatCard';
import { useToast } from '../../context/ToastContext';
import analyticsService from '../../services/analyticsService';
import habitService from '../../services/habitService';
import { getApiErrorMessage } from '../../utils/apiError';

const HabitStats = () => {
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const { error: showError } = useToast();
  const [viewMode, setViewMode] = useState('overview'); // overview, daily, weekly, monthly, categories, streaks
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [selectedWeek, setSelectedWeek] = useState(getWeekStart(new Date()));
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1);
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [dailyData, setDailyData] = useState(null);
  const [weeklyData, setWeeklyData] = useState(null);
  const [monthlyData, setMonthlyData] = useState(null);
  const [categoryData, setCategoryData] = useState([]);
  const [streakData, setStreakData] = useState([]);
  const [habits, setHabits] = useState([]);
  const [selectedHabitId, setSelectedHabitId] = useState('all');

  useEffect(() => {
    fetchAnalytics();
    fetchHabits();
  }, []);

  useEffect(() => {
    if (viewMode === 'daily') {
      fetchDailyAnalytics();
    } else if (viewMode === 'weekly') {
      fetchWeeklyAnalytics();
    } else if (viewMode === 'monthly') {
      fetchMonthlyAnalytics();
    } else if (viewMode === 'categories') {
      fetchCategoryAnalytics();
    } else if (viewMode === 'streaks') {
      fetchStreakTrend();
    }
  }, [viewMode, selectedDate, selectedWeek, selectedMonth, selectedYear, selectedHabitId]);

  function getWeekStart(date) {
    const d = new Date(date);
    const day = d.getDay();
    const diff = d.getDate() - day + (day === 0 ? -6 : 1); // Adjust when day is Sunday
    return new Date(d.setDate(diff)).toISOString().split('T')[0];
  }

  const fetchAnalytics = async () => {
    try {
      setLoading(true);
      const data = await analyticsService.getAnalytics();
      setAnalytics(data);
    } catch (err) {
      setError(getApiErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  const fetchHabits = async () => {
    try {
      const data = await habitService.getAllHabits();
      setHabits(data);
    } catch (err) {
      showError(getApiErrorMessage(err));
    }
  };

  const fetchDailyAnalytics = async () => {
    try {
      const data = await analyticsService.getDailyAnalytics(selectedDate);
      setDailyData(data);
    } catch (err) {
      showError(getApiErrorMessage(err));
    }
  };

  const fetchWeeklyAnalytics = async () => {
    try {
      const data = await analyticsService.getWeeklyAnalytics(selectedWeek);
      setWeeklyData(data);
    } catch (err) {
      showError(getApiErrorMessage(err));
    }
  };

  const fetchMonthlyAnalytics = async () => {
    try {
      const data = await analyticsService.getMonthlyAnalytics(selectedYear, selectedMonth);
      setMonthlyData(data);
    } catch (err) {
      showError(getApiErrorMessage(err));
    }
  };

  const fetchCategoryAnalytics = async () => {
    try {
      const data = await analyticsService.getCategoryAnalytics();
      setCategoryData(data);
    } catch (err) {
      showError(getApiErrorMessage(err));
    }
  };

  const fetchStreakTrend = async () => {
    try {
      const habitId = selectedHabitId === 'all' ? null : parseInt(selectedHabitId);
      const data = await analyticsService.getStreakTrend(habitId);
      setStreakData(data);
    } catch (err) {
      showError(getApiErrorMessage(err));
    }
  };

  if (loading && !analytics) {
    return (
      <Layout>
        <LoadingSpinner />
      </Layout>
    );
  }

  if (error) {
    return (
      <Layout>
        <div className="container-xxl">
          <div className="alert alert-danger">{error}</div>
        </div>
      </Layout>
    );
  }

  const renderOverview = () => {
    if (!analytics) return null;

    return (
      <div>
        <div className="row g-3 mb-4">
          <div className="col-md-3">
            <StatCard
              title="Longest Active Streak"
              value={analytics.longestActiveStreak || 0}
              icon="🔥"
              color="warning"
              subtitle="days"
            />
          </div>
          <div className="col-md-3">
            <StatCard
              title="Best Streak Ever"
              value={analytics.bestStreakEver || 0}
              icon="⭐"
              color="info"
              subtitle="days"
            />
          </div>
          <div className="col-md-3">
            <StatCard
              title="Daily Completion"
              value={analytics.daily?.completionPercentage?.toFixed(1) || 0}
              icon="📊"
              color="success"
              subtitle="%"
            />
          </div>
          <div className="col-md-3">
            <StatCard
              title="Total Habits Today"
              value={analytics.daily?.totalHabits || 0}
              icon="📝"
              color="primary"
            />
          </div>
        </div>

        {analytics.daily && (
          <div className="card border-0 shadow-sm mb-4">
            <div className="card-body">
              <h5 className="card-title mb-3">Today's Summary</h5>
              <div className="row g-3">
                <div className="col-md-3">
                  <div className="text-center p-3 bg-light rounded">
                    <div className="h4 fw-bold text-success">
                      {analytics.daily.completedHabits || 0}
                    </div>
                    <div className="text-muted small">Completed</div>
                  </div>
                </div>
                <div className="col-md-3">
                  <div className="text-center p-3 bg-light rounded">
                    <div className="h4 fw-bold text-danger">
                      {analytics.daily.skippedHabits || 0}
                    </div>
                    <div className="text-muted small">Skipped</div>
                  </div>
                </div>
                <div className="col-md-3">
                  <div className="text-center p-3 bg-light rounded">
                    <div className="h4 fw-bold text-warning">
                      {analytics.daily.pendingHabits || 0}
                    </div>
                    <div className="text-muted small">Pending</div>
                  </div>
                </div>
                <div className="col-md-3">
                  <div className="text-center p-3 bg-light rounded">
                    <div className="h4 fw-bold text-primary">
                      {analytics.daily.completionPercentage?.toFixed(1) || 0}%
                    </div>
                    <div className="text-muted small">Completion Rate</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  };

  const renderDaily = () => {
    if (!dailyData) return <LoadingSpinner />;

    return (
      <div className="card border-0 shadow-sm">
        <div className="card-body">
          <div className="d-flex justify-content-between align-items-center mb-3">
            <h5 className="card-title mb-0">Daily Analytics</h5>
            <input
              type="date"
              className="form-control"
              style={{ maxWidth: '200px' }}
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
            />
          </div>
          <div className="row g-3">
            <div className="col-md-3">
              <div className="text-center p-3 bg-light rounded">
                <div className="h4 fw-bold">{dailyData.totalHabits || 0}</div>
                <div className="text-muted small">Total Habits</div>
              </div>
            </div>
            <div className="col-md-3">
              <div className="text-center p-3 bg-light rounded">
                <div className="h4 fw-bold text-success">
                  {dailyData.completedHabits || 0}
                </div>
                <div className="text-muted small">Completed</div>
              </div>
            </div>
            <div className="col-md-3">
              <div className="text-center p-3 bg-light rounded">
                <div className="h4 fw-bold text-danger">
                  {dailyData.skippedHabits || 0}
                </div>
                <div className="text-muted small">Skipped</div>
              </div>
            </div>
            <div className="col-md-3">
              <div className="text-center p-3 bg-light rounded">
                <div className="h4 fw-bold text-primary">
                  {dailyData.completionPercentage?.toFixed(1) || 0}%
                </div>
                <div className="text-muted small">Completion Rate</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  const renderWeekly = () => {
    if (!weeklyData) return <LoadingSpinner />;

    return (
      <div className="card border-0 shadow-sm">
        <div className="card-body">
          <div className="d-flex justify-content-between align-items-center mb-3">
            <h5 className="card-title mb-0">Weekly Analytics</h5>
            <input
              type="date"
              className="form-control"
              style={{ maxWidth: '200px' }}
              value={selectedWeek}
              onChange={(e) => setSelectedWeek(e.target.value)}
            />
          </div>
          <div className="row g-3 mb-3">
            <div className="col-md-3">
              <div className="text-center p-3 bg-light rounded">
                <div className="h4 fw-bold">{weeklyData.totalHabits || 0}</div>
                <div className="text-muted small">Total Habits</div>
              </div>
            </div>
            <div className="col-md-3">
              <div className="text-center p-3 bg-light rounded">
                <div className="h4 fw-bold text-success">
                  {weeklyData.completedHabits || 0}
                </div>
                <div className="text-muted small">Completed</div>
              </div>
            </div>
            <div className="col-md-3">
              <div className="text-center p-3 bg-light rounded">
                <div className="h4 fw-bold text-danger">
                  {weeklyData.skippedHabits || 0}
                </div>
                <div className="text-muted small">Skipped</div>
              </div>
            </div>
            <div className="col-md-3">
              <div className="text-center p-3 bg-light rounded">
                <div className="h4 fw-bold text-primary">
                  {weeklyData.completionPercentage?.toFixed(1) || 0}%
                </div>
                <div className="text-muted small">Completion Rate</div>
              </div>
            </div>
          </div>
          {weeklyData.dailyBreakdown && weeklyData.dailyBreakdown.length > 0 && (
            <div>
              <h6 className="mb-3">Daily Breakdown</h6>
              <div className="table-responsive">
                <table className="table table-hover">
                  <thead>
                    <tr>
                      <th>Date</th>
                      <th>Total</th>
                      <th>Completed</th>
                      <th>Skipped</th>
                      <th>Pending</th>
                      <th>Completion %</th>
                    </tr>
                  </thead>
                  <tbody>
                    {weeklyData.dailyBreakdown.map((day, idx) => (
                      <tr key={idx}>
                        <td>{new Date(day.date).toLocaleDateString()}</td>
                        <td>{day.totalHabits}</td>
                        <td className="text-success">{day.completedHabits}</td>
                        <td className="text-danger">{day.skippedHabits}</td>
                        <td className="text-warning">{day.pendingHabits}</td>
                        <td>{day.completionPercentage.toFixed(1)}%</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      </div>
    );
  };

  const renderMonthly = () => {
    if (!monthlyData) return <LoadingSpinner />;

    return (
      <div className="card border-0 shadow-sm">
        <div className="card-body">
          <div className="d-flex justify-content-between align-items-center mb-3">
            <h5 className="card-title mb-0">Monthly Analytics</h5>
            <div className="d-flex gap-2">
              <select
                className="form-select"
                style={{ maxWidth: '120px' }}
                value={selectedMonth}
                onChange={(e) => setSelectedMonth(parseInt(e.target.value))}
              >
                {Array.from({ length: 12 }, (_, i) => i + 1).map((month) => (
                  <option key={month} value={month}>
                    {new Date(2000, month - 1).toLocaleString('default', { month: 'long' })}
                  </option>
                ))}
              </select>
              <select
                className="form-select"
                style={{ maxWidth: '120px' }}
                value={selectedYear}
                onChange={(e) => setSelectedYear(parseInt(e.target.value))}
              >
                {Array.from({ length: 5 }, (_, i) => new Date().getFullYear() - 2 + i).map(
                  (year) => (
                    <option key={year} value={year}>
                      {year}
                    </option>
                  )
                )}
              </select>
            </div>
          </div>
          <div className="row g-3 mb-3">
            <div className="col-md-3">
              <div className="text-center p-3 bg-light rounded">
                <div className="h4 fw-bold">{monthlyData.totalHabits || 0}</div>
                <div className="text-muted small">Total Habits</div>
              </div>
            </div>
            <div className="col-md-3">
              <div className="text-center p-3 bg-light rounded">
                <div className="h4 fw-bold text-success">
                  {monthlyData.completedHabits || 0}
                </div>
                <div className="text-muted small">Completed</div>
              </div>
            </div>
            <div className="col-md-3">
              <div className="text-center p-3 bg-light rounded">
                <div className="h4 fw-bold text-danger">
                  {monthlyData.skippedHabits || 0}
                </div>
                <div className="text-muted small">Skipped</div>
              </div>
            </div>
            <div className="col-md-3">
              <div className="text-center p-3 bg-light rounded">
                <div className="h4 fw-bold text-primary">
                  {monthlyData.completionPercentage?.toFixed(1) || 0}%
                </div>
                <div className="text-muted small">Completion Rate</div>
              </div>
            </div>
          </div>
          {monthlyData.dailyBreakdown && monthlyData.dailyBreakdown.length > 0 && (
            <div>
              <h6 className="mb-3">Daily Breakdown</h6>
              <div className="table-responsive">
                <table className="table table-hover table-sm">
                  <thead>
                    <tr>
                      <th>Date</th>
                      <th>Total</th>
                      <th>Completed</th>
                      <th>Skipped</th>
                      <th>Pending</th>
                      <th>Completion %</th>
                    </tr>
                  </thead>
                  <tbody>
                    {monthlyData.dailyBreakdown.map((day, idx) => (
                      <tr key={idx}>
                        <td>{new Date(day.date).toLocaleDateString()}</td>
                        <td>{day.totalHabits}</td>
                        <td className="text-success">{day.completedHabits}</td>
                        <td className="text-danger">{day.skippedHabits}</td>
                        <td className="text-warning">{day.pendingHabits}</td>
                        <td>{day.completionPercentage.toFixed(1)}%</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      </div>
    );
  };

  const renderCategories = () => {
    if (categoryData.length === 0) {
      return (
        <div className="card border-0 shadow-sm">
          <div className="card-body text-center py-5">
            <p className="text-muted">No category analytics available</p>
          </div>
        </div>
      );
    }

    return (
      <div className="card border-0 shadow-sm">
        <div className="card-body">
          <h5 className="card-title mb-3">Category Analytics</h5>
          <div className="table-responsive">
            <table className="table table-hover">
              <thead>
                <tr>
                  <th>Category</th>
                  <th>Total Habits</th>
                  <th>Completed</th>
                  <th>Skipped</th>
                  <th>Completion Rate</th>
                </tr>
              </thead>
              <tbody>
                {categoryData.map((cat, idx) => (
                  <tr key={idx}>
                    <td>
                      <span className="badge bg-secondary">{cat.categoryName}</span>
                    </td>
                    <td>{cat.totalHabits || 0}</td>
                    <td className="text-success">{cat.completedHabits || 0}</td>
                    <td className="text-danger">{cat.skippedHabits || 0}</td>
                    <td>
                      <div className="d-flex align-items-center gap-2">
                        <div className="progress" style={{ width: '100px', height: '8px' }}>
                          <div
                            className="progress-bar bg-success"
                            style={{
                              width: `${cat.completionPercentage || 0}%`,
                            }}
                          ></div>
                        </div>
                        <span>{(cat.completionPercentage || 0).toFixed(1)}%</span>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    );
  };

  const renderStreaks = () => {
    return (
      <div className="card border-0 shadow-sm">
        <div className="card-body">
          <div className="d-flex justify-content-between align-items-center mb-3">
            <h5 className="card-title mb-0">Streak Trends</h5>
            <select
              className="form-select"
              style={{ maxWidth: '200px' }}
              value={selectedHabitId}
              onChange={(e) => setSelectedHabitId(e.target.value)}
            >
              <option value="all">All Habits</option>
              {habits.map((habit) => (
                <option key={habit.habitId} value={habit.habitId}>
                  {habit.habitName}
                </option>
              ))}
            </select>
          </div>
          {streakData.length === 0 ? (
            <div className="text-center py-5">
              <p className="text-muted">No streak data available</p>
            </div>
          ) : (
            <div className="table-responsive">
              <table className="table table-hover">
                <thead>
                  <tr>
                    <th>Date</th>
                    <th>Habit</th>
                    <th>Current Streak</th>
                    <th>Longest Streak</th>
                  </tr>
                </thead>
                <tbody>
                  {streakData.map((streak, idx) => (
                    <tr key={idx}>
                      <td>{new Date(streak.date).toLocaleDateString()}</td>
                      <td>{streak.habitName}</td>
                      <td>
                        <span className="badge bg-warning text-dark">
                          {streak.currentStreak} days
                        </span>
                      </td>
                      <td>
                        <span className="badge bg-info">{streak.longestStreak} days</span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    );
  };

  return (
    <Layout>
      <div className="container-xxl page-enter">
        <div className="d-flex justify-content-between align-items-center mb-4">
          <div>
            <h2 className="fw-bold mb-1">📈 Analytics</h2>
            <p className="text-muted mb-0">Track your progress and insights</p>
          </div>
        </div>

        {/* View Mode Tabs */}
        <ul className="nav nav-tabs mb-4" role="tablist">
          <li className="nav-item" role="presentation">
            <button
              className={`nav-link ${viewMode === 'overview' ? 'active' : ''}`}
              onClick={() => setViewMode('overview')}
            >
              Overview
            </button>
          </li>
          <li className="nav-item" role="presentation">
            <button
              className={`nav-link ${viewMode === 'daily' ? 'active' : ''}`}
              onClick={() => setViewMode('daily')}
            >
              Daily
            </button>
          </li>
          <li className="nav-item" role="presentation">
            <button
              className={`nav-link ${viewMode === 'weekly' ? 'active' : ''}`}
              onClick={() => setViewMode('weekly')}
            >
              Weekly
            </button>
          </li>
          <li className="nav-item" role="presentation">
            <button
              className={`nav-link ${viewMode === 'monthly' ? 'active' : ''}`}
              onClick={() => setViewMode('monthly')}
            >
              Monthly
            </button>
          </li>
          <li className="nav-item" role="presentation">
            <button
              className={`nav-link ${viewMode === 'categories' ? 'active' : ''}`}
              onClick={() => setViewMode('categories')}
            >
              Categories
            </button>
          </li>
          <li className="nav-item" role="presentation">
            <button
              className={`nav-link ${viewMode === 'streaks' ? 'active' : ''}`}
              onClick={() => setViewMode('streaks')}
            >
              Streaks
            </button>
          </li>
        </ul>

        {/* Content based on view mode */}
        {viewMode === 'overview' && renderOverview()}
        {viewMode === 'daily' && renderDaily()}
        {viewMode === 'weekly' && renderWeekly()}
        {viewMode === 'monthly' && renderMonthly()}
        {viewMode === 'categories' && renderCategories()}
        {viewMode === 'streaks' && renderStreaks()}
      </div>
    </Layout>
  );
};

export default HabitStats;
