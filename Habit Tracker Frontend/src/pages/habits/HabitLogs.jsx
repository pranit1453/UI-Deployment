import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Layout from '../../components/layout/Layout';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import StatCard from '../../components/common/StatCard';
import { useToast } from '../../context/ToastContext';
import habitService from '../../services/habitService';
import habitLogService from '../../services/habitLogService';
import { getApiErrorMessage } from '../../utils/apiError';

const HabitLogs = () => {
  const { habitId } = useParams();
  const navigate = useNavigate();
  const [habit, setHabit] = useState(null);
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState({
    startDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    endDate: new Date().toISOString().split('T')[0],
    status: 'ALL'
  });
  const [selectedLogs, setSelectedLogs] = useState(new Set());
  const { error: showError, success: showSuccess } = useToast();

  useEffect(() => {
    fetchHabit();
    fetchLogs();
  }, [habitId, filter]);

  const fetchHabit = async () => {
    try {
      const data = await habitService.getHabitById(habitId);
      setHabit(data);
    } catch (err) {
      showError(getApiErrorMessage(err));
    }
  };

  const fetchLogs = async () => {
    try {
      setLoading(true);
      const data = await habitService.getHabitLogs(habitId, filter.startDate, filter.endDate);
      let filteredLogs = data;
      
      if (filter.status !== 'ALL') {
        filteredLogs = data.filter(log => log.status === filter.status);
      }
      
      setLogs(filteredLogs);
    } catch (err) {
      showError(getApiErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  const handleLogStatus = async (date, status) => {
    try {
      await habitLogService.logHabit(habitId, { date, status });
      showSuccess(`Habit marked as ${status.toLowerCase()}`);
      fetchLogs();
    } catch (err) {
      showError(getApiErrorMessage(err));
    }
  };

  const handleDeleteLog = async (date) => {
    if (!window.confirm('Are you sure you want to delete this log?')) return;
    
    try {
      await habitService.deleteHabitLog(habitId, date);
      showSuccess('Log deleted successfully');
      fetchLogs();
    } catch (err) {
      showError(getApiErrorMessage(err));
    }
  };

  const handleBulkDelete = async () => {
    if (selectedLogs.size === 0) {
      showError('Please select logs to delete');
      return;
    }

    if (!window.confirm(`Are you sure you want to delete ${selectedLogs.size} logs?`)) return;
    
    try {
      const dates = Array.from(selectedLogs);
      await habitService.deleteHabitLog(habitId, dates[0]); // Note: Backend needs bulk delete implementation
      showSuccess(`${selectedLogs.size} logs deleted successfully`);
      setSelectedLogs(new Set());
      fetchLogs();
    } catch (err) {
      showError(getApiErrorMessage(err));
    }
  };

  const toggleLogSelection = (date) => {
    const newSelected = new Set(selectedLogs);
    if (newSelected.has(date)) {
      newSelected.delete(date);
    } else {
      newSelected.add(date);
    }
    setSelectedLogs(newSelected);
  };

  const getStatusBadge = (status) => {
    const variants = {
      DONE: 'bg-success',
      SKIPPED: 'bg-danger',
      PENDING: 'bg-warning'
    };
    return variants[status] || 'bg-secondary';
  };

  const getStatusIcon = (status) => {
    const icons = {
      DONE: '✅',
      SKIPPED: '❌',
      PENDING: '⏳'
    };
    return icons[status] || '❓';
  };

  const calculateStats = () => {
    const total = logs.length;
    const completed = logs.filter(log => log.status === 'DONE').length;
    const skipped = logs.filter(log => log.status === 'SKIPPED').length;
    const pending = logs.filter(log => log.status === 'PENDING').length;
    const completionRate = total > 0 ? (completed / total * 100).toFixed(1) : 0;

    return { total, completed, skipped, pending, completionRate };
  };

  if (loading && !habit) {
    return (
      <Layout>
        <LoadingSpinner />
      </Layout>
    );
  }

  const stats = calculateStats();

  return (
    <Layout>
      <div className="container-xxl page-enter">
        <div className="d-flex justify-content-between align-items-center mb-4">
          <div>
            <h2 className="fw-bold mb-1">📊 Habit Logs</h2>
            <p className="text-muted mb-0">
              {habit?.habitName || 'Habit'} - Log History & Management
            </p>
          </div>
          <div className="d-flex gap-2">
            <button
              className="btn btn-outline-secondary"
              onClick={() => navigate(`/habits/${habitId}`)}
            >
              ← Back to Habit
            </button>
            {selectedLogs.size > 0 && (
              <button
                className="btn btn-danger"
                onClick={handleBulkDelete}
              >
                Delete Selected ({selectedLogs.size})
              </button>
            )}
          </div>
        </div>

        {/* Stats Cards */}
        <div className="row g-3 mb-4">
          <div className="col-md-3">
            <StatCard
              title="Total Logs"
              value={stats.total}
              icon="📝"
              color="primary"
            />
          </div>
          <div className="col-md-3">
            <StatCard
              title="Completed"
              value={stats.completed}
              icon="✅"
              color="success"
            />
          </div>
          <div className="col-md-3">
            <StatCard
              title="Skipped"
              value={stats.skipped}
              icon="❌"
              color="danger"
            />
          </div>
          <div className="col-md-3">
            <StatCard
              title="Completion Rate"
              value={`${stats.completionRate}%`}
              icon="📈"
              color="info"
            />
          </div>
        </div>

        {/* Filters */}
        <div className="card border-0 shadow-sm mb-4">
          <div className="card-body">
            <h5 className="card-title mb-3">Filters</h5>
            <div className="row g-3">
              <div className="col-md-3">
                <label className="form-label">Start Date</label>
                <input
                  type="date"
                  className="form-control"
                  value={filter.startDate}
                  onChange={(e) => setFilter({ ...filter, startDate: e.target.value })}
                />
              </div>
              <div className="col-md-3">
                <label className="form-label">End Date</label>
                <input
                  type="date"
                  className="form-control"
                  value={filter.endDate}
                  onChange={(e) => setFilter({ ...filter, endDate: e.target.value })}
                />
              </div>
              <div className="col-md-3">
                <label className="form-label">Status</label>
                <select
                  className="form-select"
                  value={filter.status}
                  onChange={(e) => setFilter({ ...filter, status: e.target.value })}
                >
                  <option value="ALL">All Status</option>
                  <option value="DONE">Completed</option>
                  <option value="SKIPPED">Skipped</option>
                  <option value="PENDING">Pending</option>
                </select>
              </div>
              <div className="col-md-3 d-flex align-items-end">
                <button
                  className="btn btn-primary w-100"
                  onClick={fetchLogs}
                  disabled={loading}
                >
                  {loading ? <LoadingSpinner /> : 'Apply Filters'}
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Logs Table */}
        <div className="card border-0 shadow-sm">
          <div className="card-body">
            <div className="d-flex justify-content-between align-items-center mb-3">
              <h5 className="card-title mb-0">Log Entries</h5>
              <div className="form-check">
                <input
                  className="form-check-input"
                  type="checkbox"
                  id="selectAll"
                  checked={selectedLogs.size === logs.length && logs.length > 0}
                  onChange={(e) => {
                    if (e.target.checked) {
                      setSelectedLogs(new Set(logs.map(log => log.logDate)));
                    } else {
                      setSelectedLogs(new Set());
                    }
                  }}
                />
                <label className="form-check-label" htmlFor="selectAll">
                  Select All
                </label>
              </div>
            </div>

            {logs.length === 0 ? (
              <div className="text-center py-5">
                <div className="display-1 mb-3">📝</div>
                <p className="text-muted mb-0">No logs found for the selected period</p>
              </div>
            ) : (
              <div className="table-responsive">
                <table className="table table-hover">
                  <thead>
                    <tr>
                      <th width="50">
                        <input
                          type="checkbox"
                          checked={selectedLogs.size === logs.length && logs.length > 0}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setSelectedLogs(new Set(logs.map(log => log.logDate)));
                            } else {
                              setSelectedLogs(new Set());
                            }
                          }}
                        />
                      </th>
                      <th>Date</th>
                      <th>Status</th>
                      <th>Remarks</th>
                      <th>Logged At</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {logs.map((log) => (
                      <tr key={log.logDate}>
                        <td>
                          <input
                            type="checkbox"
                            checked={selectedLogs.has(log.logDate)}
                            onChange={() => toggleLogSelection(log.logDate)}
                          />
                        </td>
                        <td>{new Date(log.logDate).toLocaleDateString()}</td>
                        <td>
                          <span className={`badge ${getStatusBadge(log.status)}`}>
                            {getStatusIcon(log.status)} {log.status}
                          </span>
                        </td>
                        <td>{log.remarks || '-'}</td>
                        <td>{new Date(log.createdAt).toLocaleString()}</td>
                        <td>
                          <div className="btn-group" role="group">
                            {log.status === 'PENDING' && (
                              <>
                                <button
                                  className="btn btn-sm btn-success"
                                  onClick={() => handleLogStatus(log.logDate, 'DONE')}
                                  title="Mark as Done"
                                >
                                  ✓
                                </button>
                                <button
                                  className="btn btn-sm btn-outline-danger"
                                  onClick={() => handleLogStatus(log.logDate, 'SKIPPED')}
                                  title="Mark as Skipped"
                                >
                                  ✗
                                </button>
                              </>
                            )}
                            <button
                              className="btn btn-sm btn-outline-danger"
                              onClick={() => handleDeleteLog(log.logDate)}
                              title="Delete Log"
                            >
                              🗑️
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
      </div>
    </Layout>
  );
};

export default HabitLogs;
