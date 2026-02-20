```javascript
import React from 'react';
import { render, screen, fireEvent, waitFor, within, act } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import '@testing-library/jest-dom';
import { BrowserRouter, MemoryRouter, Routes, Route } from 'react-router-dom';

// ============================================================
// Mock API service
// ============================================================
const mockApi = {
  login: jest.fn(),
  logout: jest.fn(),
  getContacts: jest.fn(),
  addContact: jest.fn(),
  updateContact: jest.fn(),
  deleteContact: jest.fn(),
  searchContacts: jest.fn(),
  getAppointments: jest.fn(),
  addAppointment: jest.fn(),
  updateAppointment: jest.fn(),
  deleteAppointment: jest.fn(),
  searchAppointments: jest.fn(),
  getUpcomingAppointments: jest.fn(),
  getPastAppointments: jest.fn(),
  getAppointmentsByCategory: jest.fn(),
  markReminderSent: jest.fn(),
  getDueSoonAppointments: jest.fn(),
  getTasks: jest.fn(),
  addTask: jest.fn(),
  updateTask: jest.fn(),
  deleteTask: jest.fn(),
  searchTasks: jest.fn(),
  toggleTaskComplete: jest.fn(),
  getTasksByStatus: jest.fn(),
  getStocks: jest.fn(),
  addStock: jest.fn(),
  updateStock: jest.fn(),
  deleteStock: jest.fn(),
  searchStocks: jest.fn(),
  getStockGainers: jest.fn(),
  getStockLosers: jest.fn(),
  getStocksBySector: jest.fn(),
  getPortfolioSummary: jest.fn(),
  getWebsites: jest.fn(),
  addWebsite: jest.fn(),
  updateWebsite: jest.fn(),
  deleteWebsite: jest.fn(),
  searchWebsites: jest.fn(),
  getWebsitesByCategory: jest.fn(),
  getTheme: jest.fn(),
  toggleTheme: jest.fn(),
};

jest.mock('../services/api', () => mockApi);

// ============================================================
// Mock Auth Context
// ============================================================
const AuthContext = React.createContext();

const AuthProvider = ({ children, value }) => {
  const defaultValue = {
    isAuthenticated: false,
    user: null,
    login: jest.fn(),
    logout: jest.fn(),
    ...value,
  };
  return <AuthContext.Provider value={defaultValue}>{children}</AuthContext.Provider>;
};

const useAuth = () => React.useContext(AuthContext);

// ============================================================
// Component Stubs (representing the migrated React components)
// ============================================================

// Login Component
const LoginPage = () => {
  const { login } = useAuth();
  const [username, setUsername] = React.useState('');
  const [password, setPassword] = React.useState('');
  const [error, setError] = React.useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const result = await mockApi.login(username, password);
      if (result.success) {
        login(result.user);
      } else {
        setError('Invalid username or password.');
      }
    } catch {
      setError('Invalid username or password.');
    }
  };

  return (
    <div className="auth-wrapper">
      <div className="auth-card">
        <div className="auth-header">
          <span className="auth-icon">📞</span>
          <h1>PhoneBook</h1>
          <p className="auth-subtitle">Sign in to manage your contacts</p>
        </div>
        {error && (
          <div className="alert alert-error" role="alert">
            <span className="alert-icon">⚠️</span>
            {error}
          </div>
        )}
        <form onSubmit={handleSubmit} className="auth-form">
          <div className="form-group">
            <label htmlFor="username">Username</label>
            <input
              type="text"
              id="username"
              name="username"
              placeholder="Enter username"
              required
              autoComplete="username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
            />
          </div>
          <div className="form-group">
            <label htmlFor="password">Password</label>
            <input
              type="password"
              id="password"
              name="password"
              placeholder="Enter password"
              required
              autoComplete="current-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>
          <button type="submit" className="btn btn-primary btn-full">
            Sign In
          </button>
        </form>
        <div className="auth-footer">
          <p>
            Default: <code>admin</code> / <code>admin123</code>
          </p>
        </div>
      </div>
    </div>
  );
};

// Contact Form Component
const ContactForm = ({ contact, isEdit, onSubmit, onCancel }) => {
  const [name, setName] = React.useState(contact?.name || '');
  const [phone, setPhone] = React.useState(contact?.phone || '');
  const [email, setEmail] = React.useState(contact?.email || '');
  const [category, setCategory] = React.useState(contact?.category || 'General');
  const [errors, setErrors] = React.useState([]);

  const validate = () => {
    const errs = [];
    if (!name.trim()) errs.push('Name is required.');
    if (!phone.trim()) errs.push('Phone number is required.');
    return errs;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const errs = validate();
    if (errs.length > 0) {
      setErrors(errs);
      return;
    }
    setErrors([]);
    onSubmit({ name: name.trim(), phone: phone.trim(), email: email.trim(), category, id: contact?.id });
  };

  return (
    <div>
      <div className="page-header">
        <h1>{isEdit ? 'Edit Contact' : 'New Contact'}</h1>
        <p className="subtitle">{isEdit ? 'Update contact details' : 'Fill in the details below'}</p>
      </div>
      {errors.length > 0 && (
        <div className="alert alert-error" role="alert">
          <span className="alert-icon">⚠️</span>
          <ul className="error-list">
            {errors.map((err, i) => (
              <li key={i}>{err}</li>
            ))}
          </ul>
        </div>
      )}
      <form onSubmit={handleSubmit} className="contact-form">
        <div className="form-group">
          <label htmlFor="name">Full Name *</label>
          <input id="name" name="name" value={name} onChange={(e) => setName(e.target.value)} placeholder="John Doe" />
        </div>
        <div className="form-group">
          <label htmlFor="phone">Phone Number *</label>
          <input id="phone" name="phone" value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="+1 (555) 123-4567" />
        </div>
        <div className="form-group">
          <label htmlFor="email">Email</label>
          <input id="email" name="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="john@example.com" />
        </div>
        <div className="form-group">
          <label htmlFor="category">Category</label>
          <select id="category" name="category" value={category} onChange={(e) => setCategory(e.target.value)}>
            {['General', 'Family', 'Friends', 'Work', 'Business', 'Emergency'].map((cat) => (
              <option key={cat} value={cat}>{cat}</option>
            ))}
          </select>
        </div>
        <div className="form-actions">
          <button type="button" className="btn btn-ghost" onClick={onCancel}>Cancel</button>
          <button type="submit" className="btn btn-primary">{isEdit ? 'Save Changes' : 'Add Contact'}</button>
        </div>
      </form>
    </div>
  );
};

// Phonebook List Component
const PhonebookPage = () => {
  const [contacts, setContacts] = React.useState([]);
  const [search, setSearch] = React.useState('');
  const [success, setSuccess] = React.useState('');
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    loadContacts();
  }, []);

  const loadContacts = async () => {
    setLoading(true);
    const data = await mockApi.getContacts();
    setContacts(data || []);
    setLoading(false);
  };

  const handleSearch = async (e) => {
    e.preventDefault();
    if (search.trim()) {
      const data = await mockApi.searchContacts(search);
      setContacts(data || []);
    } else {
      loadContacts();
    }
  };

  const handleDelete = async (id, name) => {
    if (window.confirm(`Delete ${name}?`)) {
      await mockApi.deleteContact(id);
      setSuccess('Contact deleted successfully!');
      loadContacts();
    }
  };

  if (loading) return <div>Loading...</div>;

  return (
    <div>
      {success && (
        <div className="alert alert-success" role="status">
          <span className="alert-icon">✅</span>
          {success}
        </div>
      )}
      <div className="page-header">
        <div>
          <h1>My Contacts</h1>
          <p className="subtitle">{contacts.length} contact{contacts.length !== 1 ? 's' : ''} total</p>
        </div>
        <a href="/add" className="btn btn-primary">＋ Add Contact</a>
      </div>
      <form onSubmit={handleSearch} className="search-bar">
        <input
          type="text"
          name="search"
          placeholder="Search by name, phone, or email…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="search-input"
        />
        <button type="submit" className="btn btn-secondary">Search</button>
        {search && (
          <button type="button" className="btn btn-ghost" onClick={() => { setSearch(''); loadContacts(); }}>Clear</button>
        )}
      </form>
      {contacts.length === 0 ? (
        <div className="empty-state">
          <span className="empty-icon">📭</span>
          <h2>No contacts found</h2>
          <p>{search ? 'Try a different search term.' : 'Add your first contact to get started!'}</p>
        </div>
      ) : (
        <table className="contacts-table">
          <thead>
            <tr>
              <th>Name</th>
              <th>Phone</th>
              <th>Email</th>
              <th>Category</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {contacts.map((c) => (
              <tr key={c.id}>
                <td>{c.name}</td>
                <td>{c.phone}</td>
                <td>{c.email || '—'}</td>
                <td><span className="badge">{c.category}</span></td>
                <td>
                  <a href={`/edit?id=${c.id}`} className="btn btn-sm btn-secondary">Edit</a>
                  <button className="btn btn-sm btn-danger" onClick={() => handleDelete(c.id, c.name)}>Delete</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
};

// Task Form Component
const TaskForm = ({ task, isEdit, onSubmit, onCancel }) => {
  const [title, setTitle] = React.useState(task?.title || '');
  const [description, setDescription] = React.useState(task?.description || '');
  const [priority, setPriority] = React.useState(task?.priority || 'medium');
  const [dueDate, setDueDate] = React.useState(task?.dueDate || '');
  const [completed, setCompleted] = React.useState(task?.completed || false);
  const [errors, setErrors] = React.useState([]);

  const validate = () => {
    const errs = [];
    if (!title.trim()) errs.push('Task title is required.');
    return errs;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const errs = validate();
    if (errs.length > 0) {
      setErrors(errs);
      return;
    }
    setErrors([]);
    onSubmit({ title: title.trim(), description: description.trim(), priority, dueDate, completed, id: task?.id });
  };

  return (
    <div>
      <h1>{isEdit ? 'Edit Task' : 'New Task'}</h1>
      {errors.length > 0 && (
        <div className="alert alert-error" role="alert">
          <ul className="error-list">
            {errors.map((err, i) => <li key={i}>{err}</li>)}
          </ul>
        </div>
      )}
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="title">Task Title *</label>
          <input id="title" value={title} onChange={(e) => setTitle(e.target.value)} />
        </div>
        <div className="form-group">
          <label htmlFor="description">Description</label>
          <textarea id="description" value={description} onChange={(e) => setDescription(e.target.value)} />
        </div>
        <div className="form-group">
          <label htmlFor="priority">Priority</label>
          <select id="priority" value={priority} onChange={(e) => setPriority(e.target.value)}>
            <option value="low">Low</option>
            <option value="medium">Medium</option>
            <option value="high">High</option>
          </select>
        </div>
        <div className="form-group">
          <label htmlFor="due_date">Due Date</label>
          <input id="due_date" type="date" value={dueDate} onChange={(e) => setDueDate(e.target.value)} />
        </div>
        {isEdit && (
          <div className="form-group">
            <label>
              <input type="checkbox" checked={completed} onChange={(e) => setCompleted(e.target.checked)} />
              Mark as completed
            </label>
          </div>
        )}
        <button type="button" onClick={onCancel}>Cancel</button>
        <button type="submit">{isEdit ? 'Save Changes' : 'Add Task'}</button>
      </form>
    </div>
  );
};

// Appointment Form Component
const AppointmentForm = ({ appointment, isEdit, onSubmit, onCancel }) => {
  const [title, setTitle] = React.useState(appointment?.title || '');
  const [description, setDescription] = React.useState(appointment?.description || '');
  const [date, setDate] = React.useState(appointment?.date || '');
  const [time, setTime] = React.useState(appointment?.time || '');
  const [location, setLocation] = React.useState(appointment?.location || '');
  const [category, setCategory] = React.useState(appointment?.category || 