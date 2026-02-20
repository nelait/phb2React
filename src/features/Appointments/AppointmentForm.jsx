import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import { appointmentsApi } from '../../services/appointmentsApi';
import { useToast } from '../../contexts/ToastContext';

const CATEGORIES = ['General', 'Work', 'Personal', 'Medical', 'Business', 'Social'];

export const AppointmentForm = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const editId = searchParams.get('id');
  const isEdit = Boolean(editId);
  const { showToast } = useToast();

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [date, setDate] = useState('');
  const [time, setTime] = useState('');
  const [location, setLocation] = useState('');
  const [category, setCategory] = useState('General');
  const [errors, setErrors] = useState([]);
  const [originalData, setOriginalData] = useState(null);

  useEffect(() => {
    if (isEdit && editId) {
      appointmentsApi.getById(editId).then((appt) => {
        if (appt) {
          setTitle(appt.title);
          setDescription(appt.description || '');
          setDate(appt.date);
          setTime(appt.time);
          setLocation(appt.location || '');
          setCategory(appt.category || 'General');
          setOriginalData(appt);
        } else {
          navigate('/appointments', { replace: true });
        }
      });
    }
  }, [isEdit, editId, navigate]);

  const validate = () => {
    const errs = [];
    if (!title.trim()) errs.push('Appointment title is required.');
    if (!date) errs.push('Date is required.');
    if (!time) errs.push('Time is required.');
    if (date && time) {
      const dt = new Date(`${date}T${time}`);
      if (dt < new Date()) {
        errs.push('Appointment cannot be scheduled in the past.');
      }
    }
    return errs;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const errs = validate();
    if (errs.length > 0) {
      setErrors(errs);
      return;
    }

    const apptData = {
      title: title.trim(),
      description: description.trim(),
      date,
      time,
      location: location.trim(),
      category,
    };

    if (isEdit) {
      await appointmentsApi.update(editId, {
        ...apptData,
        id: editId,
        createdAt: originalData?.createdAt || new Date().toISOString().slice(0, 19).replace('T', ' '),
        reminderSent: originalData?.reminderSent || false,
      });
      showToast('Appointment updated successfully!');
    } else {
      await appointmentsApi.create(apptData);
      showToast('Appointment added successfully!');
    }
    navigate('/appointments');
  };

  return (
    <>
      <div className="page-header">
        <div>
          <h1>{isEdit ? 'Edit Appointment' : 'New Appointment'}</h1>
          <p className="subtitle">
            {isEdit ? 'Update appointment details' : 'Schedule a new appointment'}
          </p>
        </div>
        <Link to="/appointments" className="btn btn-ghost">← Back</Link>
      </div>

      {errors.length > 0 && (
        <div className="alert alert-error">
          <span className="alert-icon">⚠️</span>
          <ul className="error-list">
            {errors.map((err, i) => (
              <li key={i}>{err}</li>
            ))}
          </ul>
        </div>
      )}

      <div className="form-card">
        <form onSubmit={handleSubmit} className="appointment-form">
          <div className="form-group">
            <label htmlFor="title">Appointment Title <span className="required">*</span></label>
            <input
              type="text"
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Meeting with client"
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="description">Description</label>
            <textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
              placeholder="Additional details about the appointment..."
            />
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="date">Date <span className="required">*</span></label>
              <input
                type="date"
                id="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                required
              />
            </div>
            <div className="form-group">
              <label htmlFor="time">Time <span className="required">*</span></label>
              <input
                type="time"
                id="time"
                value={time}
                onChange={(e) => setTime(e.target.value)}
                required
              />
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="location">Location</label>
              <input
                type="text"
                id="location"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                placeholder="Office, Home, etc."
              />
            </div>
            <div className="form-group">
              <label htmlFor="category">Category</label>
              <select
                id="category"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
              >
                {CATEGORIES.map((cat) => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="form-actions">
            <Link to="/appointments" className="btn btn-ghost">Cancel</Link>
            <button type="submit" className="btn btn-primary">
              {isEdit ? 'Save Changes' : 'Add Appointment'}
            </button>
          </div>
        </form>
      </div>
    </>
  );
};
