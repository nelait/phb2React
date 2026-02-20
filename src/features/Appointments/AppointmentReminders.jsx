import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { appointmentsApi, isDueSoon, isToday } from '../../services/appointmentsApi';
import { useToast } from '../../contexts/ToastContext';

export const AppointmentReminders = () => {
  const [appointments, setAppointments] = useState([]);
  const { showToast } = useToast();

  useEffect(() => {
    loadAppointments();
  }, []);

  const loadAppointments = async () => {
    const data = await appointmentsApi.getAll();
    setAppointments(data);
  };

  const dueSoonAppointments = appointments.filter(isDueSoon);
  const todayAppointments = appointments.filter(isToday);

  const handleMarkReminded = async (id) => {
    await appointmentsApi.markReminderSent(id);
    setAppointments((prev) =>
      prev.map((a) => (a.id === id ? { ...a, reminderSent: true } : a))
    );
    showToast('Reminder marked as sent!');
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

  const renderCard = (appt, type) => (
    <div key={appt.id} className={`reminder-card ${type}`}>
      <div className="reminder-header">
        <div className="reminder-time">
          <div className="reminder-date">
            {type === 'today' ? 'Today' : formatDate(appt.date)}
          </div>
          <div className="reminder-clock">{formatTime(appt.time)}</div>
        </div>
        <div className="reminder-content">
          <h3>{appt.title}</h3>
          {appt.description && <p>{appt.description}</p>}
          {appt.location && <div className="location">📍 {appt.location}</div>}
        </div>
        <div className="reminder-actions">
          {!appt.reminderSent ? (
            <button
              className="btn btn-sm btn-primary"
              onClick={() => handleMarkReminded(appt.id)}
            >
              Mark as Reminded
            </button>
          ) : (
            <span className="reminded-badge-text">✅ Reminded</span>
          )}
        </div>
      </div>
    </div>
  );

  return (
    <>
      <div className="page-header">
        <div>
          <h1>Appointment Reminders</h1>
          <p className="subtitle">Upcoming appointments and reminders</p>
        </div>
        <Link to="/appointments" className="btn btn-ghost">← Back to Appointments</Link>
      </div>

      {dueSoonAppointments.length > 0 && (
        <div className="reminder-section">
          <h2 className="section-title">Due Within 24 Hours</h2>
          <div className="reminder-list">
            {dueSoonAppointments.map((a) => renderCard(a, 'urgent'))}
          </div>
        </div>
      )}

      {todayAppointments.length > 0 && (
        <div className="reminder-section">
          <h2 className="section-title">Today's Appointments</h2>
          <div className="reminder-list">
            {todayAppointments.map((a) => renderCard(a, 'today'))}
          </div>
        </div>
      )}

      {dueSoonAppointments.length === 0 && todayAppointments.length === 0 && (
        <div className="empty-state">
          <span className="empty-icon">🔔</span>
          <h2>No upcoming reminders</h2>
          <p>You don't have any appointments due soon or today.</p>
          <Link to="/appointments/add" className="btn btn-primary">
            Schedule New Appointment
          </Link>
        </div>
      )}
    </>
  );
};
