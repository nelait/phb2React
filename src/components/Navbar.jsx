import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

export const Navbar = () => {
  const { username, logout } = useAuth();
  const location = useLocation();
  const path = location.pathname;

  const isActive = (href) => {
    if (href === '/') {
      return (
        path === '/' ||
        path === '/add' ||
        path === '/edit'
      );
    }
    return path.startsWith(href);
  };

  const links = [
    { href: '/', label: 'Contacts' },
    { href: '/appointments', label: 'Appointments' },
    { href: '/tasks', label: 'Tasks' },
    { href: '/stocks', label: 'Stocks' },
    { href: '/websites', label: 'Websites' },
  ];

  return (
    <nav className="navbar">
      <Link to="/" className="nav-brand">
        <span className="nav-icon">📞</span>
        <span className="nav-title">MaiGration Master</span>
      </Link>
      <div className="nav-links">
        {links.map((link) => (
          <Link
            key={link.href}
            to={link.href}
            className={`nav-link ${isActive(link.href) ? 'active' : ''}`}
          >
            {link.label}
          </Link>
        ))}
      </div>
      <div className="nav-right">
        <Link to="/settings" className="btn btn-ghost nav-settings" title="Settings">
          ⚙️
        </Link>
        <span className="nav-user">👤 {username}</span>
        <button onClick={logout} className="btn btn-ghost">
          Logout
        </button>
      </div>
    </nav>
  );
};
