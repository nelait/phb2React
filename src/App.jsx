import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './contexts/AuthContext';
import { MainLayout } from './components/MainLayout';
import { LoginScreen } from './features/Auth/LoginScreen';
import { PhonebookScreen } from './features/Contacts/PhonebookScreen';
import { ContactForm } from './features/Contacts/ContactForm';
import { AppointmentsScreen } from './features/Appointments/AppointmentsScreen';
import { AppointmentForm } from './features/Appointments/AppointmentForm';
import { AppointmentReminders } from './features/Appointments/AppointmentReminders';
import { TasksScreen } from './features/Tasks/TasksScreen';
import { TaskForm } from './features/Tasks/TaskForm';
import { StocksScreen } from './features/Stocks/StocksScreen';
import { StockForm } from './features/Stocks/StockForm';
import { WebsitesScreen } from './features/Websites/WebsitesScreen';
import { WebsiteForm } from './features/Websites/WebsiteForm';
import { SettingsScreen } from './features/Settings/SettingsScreen';

const ProtectedRoute = ({ children }) => {
  const { authenticated } = useAuth();
  if (!authenticated) {
    return <Navigate to="/login" replace />;
  }
  return children;
};

export const App = () => {
  const { authenticated } = useAuth();

  return (
    <Routes>
      <Route
        path="/login"
        element={authenticated ? <Navigate to="/" replace /> : <LoginScreen />}
      />
      <Route
        path="/"
        element={
          <ProtectedRoute>
            <MainLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<PhonebookScreen />} />
        <Route path="add" element={<ContactForm />} />
        <Route path="edit" element={<ContactForm />} />
        <Route path="appointments" element={<AppointmentsScreen />} />
        <Route path="appointments/add" element={<AppointmentForm />} />
        <Route path="appointments/edit" element={<AppointmentForm />} />
        <Route path="appointments/reminders" element={<AppointmentReminders />} />
        <Route path="tasks" element={<TasksScreen />} />
        <Route path="tasks/add" element={<TaskForm />} />
        <Route path="tasks/edit" element={<TaskForm />} />
        <Route path="stocks" element={<StocksScreen />} />
        <Route path="stocks/add" element={<StockForm />} />
        <Route path="stocks/edit" element={<StockForm />} />
        <Route path="websites" element={<WebsitesScreen />} />
        <Route path="websites/add" element={<WebsiteForm />} />
        <Route path="websites/edit" element={<WebsiteForm />} />
        <Route path="settings" element={<SettingsScreen />} />
      </Route>
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
};
