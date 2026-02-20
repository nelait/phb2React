import React, { createContext, useContext, useState, useCallback } from 'react';

const AuthContext = createContext(null);

const VALID_USERNAME = 'admin';
const VALID_PASSWORD = 'admin123';

export const AuthProvider = ({ children }) => {
  const [authState, setAuthState] = useState(() => {
    const stored = localStorage.getItem('auth');
    if (stored) {
      try {
        return JSON.parse(stored);
      } catch {
        return { authenticated: false, username: '' };
      }
    }
    return { authenticated: false, username: '' };
  });

  const login = useCallback((username, password) => {
    if (username === VALID_USERNAME && password === VALID_PASSWORD) {
      const state = { authenticated: true, username };
      setAuthState(state);
      localStorage.setItem('auth', JSON.stringify(state));
      return { success: true };
    }
    return { success: false, error: 'Invalid username or password.' };
  }, []);

  const logout = useCallback(() => {
    setAuthState({ authenticated: false, username: '' });
    localStorage.removeItem('auth');
  }, []);

  return (
    <AuthContext.Provider value={{ ...authState, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
