import React, { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import {
  appointmentsApi,
  isUpcoming,
  isPast,
  isToday,
  isDueSoon,
  sortAppointments,
} from '../../services/appointmentsApi';
import { useToast } from '../../contexts/ToastContext';
import { ConfirmDialog } from '../../components/ConfirmDialog';

export const AppointmentsScreen = () => {
  const [appointments, setAppointments] = useState([]);
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [deleteId, setDeleteId] = useState(null);
  const { showToast } = useToast();

  useEffect(() => {
    loadAppointments();
  }, []);

  const loadAppointments = async () => {
    const data = await appointmentsApi.getAll();
    setAppointments(data);
  };

  const categories = useMemo(
    () => appointmentsApi.getCategories(appointments),
    [appointments]
  );

  const filteredAppointments = useMemo(() => {
    let result = appointments;
    if (search.trim()) {
      result = appointmentsApi.search(result, search);
    }
    if (filter === 'upcoming') {
      result = result.filter(isUpcoming);
    } else if (filter === 'past') {
      result = result.filter(isPast);
    }
    if (categoryFilter) {
      result = result.filter((a) => a.category === categoryFilter);
    }
    return sortAppointments(result);
  }, [appointments, search, filter, categoryFilter]);

  const upcomingCount = useMemo(
    () => filteredAppointments.filter(isUpcoming).length,
    [filteredAppointments]
  );
  const pastCount = useMemo(
    () => filteredAppointments.filter(isPast).length,
    [filteredAppointments]
  );

  const handleDelete = async () => {
    if (deleteId) {
      await appointmentsApi.delete(deleteId);
      setAppointments((prev) => prev.filter((a) => a.id !== deleteId));
      setDeleteId(null);
      showToast('Appointment deleted successfully!');
    }
  };

  const formatDate = (dateStr) => {
    const d = new Date(dateStr + 'T00:00:00');
    return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  const formatTime = (timeStr) => {
    const [h, m] = timeStr.split(':');
    const d = new Date();
    d.setHours(parseInt(h), parseInt(m));
    return d.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });
  };

  return (
    <>
      <div className="page-header">
        <div>
          <h1>Appointments</h1>
          <p className="subtitle">
            {upcomingCount} upcoming, {pastCount} past
          </p>
        </div>
        <div className="header-actions">
          <Link to="/appointments/reminders" className="btn btn-secondary">
            🔔 Reminders
          </Link>
          <Link to="/appointments/add" className="btn btn-primary">
            <span>＋</span> Add Appointment
          </Link>
        </div>
      </div>

      <div className="filter-bar">
        <div className="search-bar" style={{ marginBottom: 0 }}>
          <input
            type="text"
            placeholder="Search appointments..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="search-input"
          />
          {search && (
            <button className="btn btn-ghost" onClick={() => setSearch('')}>
              Clear
            </button>
          )}
        </div>

        <div className="filter-buttons">
          <button
            className={`filter-btn ${!filter && !categoryFilter ? 'active' : ''}`}
            onClick={() => { setFilter(''); setCategoryFilter(''); }}
          >
            All
          </button>
          <button
            className={`filter-btn ${filter === 'upcoming' ? 'active' : ''}`}
            onClick={() => { setFilter('upcoming'); setCategoryFilter(''); }}
          >
            Upcoming
          </button>
          <button
            className={`filter-btn ${filter === 'past' ? 'active' : ''}`}
            onClick={() => { setFilter('past'); setCategoryFilter(''); }}
          >
            Past
          </button>
        </div>

        {categories.length > 0 && (
          <div className="category-filter">
            <label>Category:</label>
            <select
              value={categoryFilter}
              onChange={(e) => { setCategoryFilter(e.target.value); setFilter(''); }}
            >
              <option value="">All Categories</option>
              {categories.map((cat) => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
          </div>
        )}
      </div>

      {filteredAppointments.length === 0 ? (
        <div className="empty-state">
          <span className="empty-icon">📅</span>
          <h2>No appointments found</h2>
          <p>
            {search
              ? 'Try a different search term.'
              : filter
              ? `No ${filter} appointments found.`
              : categoryFilter
              ? 'No appointments found in this category.'
              : 'Add your first appointment to get started!'}
          </p>
          {!search && !filter && !categoryFilter && (
            <Link to="/appointments/add" className="btn btn-primary">
              ＋ Add Appointment
            </Link>
          )}
        </div>
      ) : (
        <div className="appointments-list">
          {filteredAppointments.map((appt) => {
            const upcoming = isUpcoming(appt);
            const dueSoon = isDueSoon(appt);
            const today = isToday(appt);
            const catClass = `category-${appt.category.toLowerCase().replace(/\s+/g, '-')}`;

            return (
              <div
                key={appt.id}
                className={`appointment-card ${upcoming ? 'upcoming' : 'past'} ${dueSoon ? 'due-soon' : ''}`}
              >
                <div className="appointment-header">
                  <div className="appointment-datetime">
                    <div className="appointment-date">
                      {formatDate(appt.date)}
                      {today && <span className="today-badge">Today</span>}
                    </div>
                    <div className="appointment-time">{formatTime(appt.time)}</div>
                  </div>

                  <div className="appointment-content">
                    <h3 className="appointment-title">{appt.title}</h3>
                    {appt.description && (
                      <p className="appointment-description">{appt.description}</p>
                    )}
                    {appt.location && (
                      <div className="appointment-location">📍 {appt.location}</div>
                    )}
                  </div>

                  <div className="appointment-meta">
                    <span className={`category-badge ${catClass}`}>
                      {appt.category}
                    </span>
                    {dueSoon && <span className="due-soon-badge">Due Soon!</span>}
                    {appt.reminderSent && <span className="reminder-badge">🔔 Reminded</span>}
                  </div>
                </div>

                <div className="card-actions">
                  <Link
                    to={`/appointments/edit?id=${encodeURIComponent(appt.id)}`}
                    className="btn btn-sm btn-secondary"
                  >
                    Edit
                  </Link>
                  <button
                    className="btn btn-sm btn-danger"
                    onClick={() => setDeleteId(appt.id)}
                  >
                    Delete
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {deleteId && (
        <ConfirmDialog
          title="Delete Appointment"
          message="Are you sure you want to delete this appointment?"
          onConfirm={handleDelete}
          onCancel={() => setDeleteId(null)}
        />
      )}
    </>
  );
};
