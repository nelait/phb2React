import { apiClient } from './apiClient';

const MOCK_APPOINTMENTS = [];

const generateId = () => 'a_' + crypto.randomUUID();
const now = () => new Date();
const formatDateTime = () => {
  const d = now();
  return d.toISOString().slice(0, 19).replace('T', ' ');
};

export const isUpcoming = (appt) => {
  const dt = new Date(`${appt.date}T${appt.time}`);
  return dt > now();
};

export const isPast = (appt) => !isUpcoming(appt);

export const isToday = (appt) => {
  const today = now().toISOString().slice(0, 10);
  return appt.date === today;
};

export const isDueSoon = (appt) => {
  const dt = new Date(`${appt.date}T${appt.time}`);
  const n = now();
  const in24h = new Date(n.getTime() + 24 * 60 * 60 * 1000);
  return dt > n && dt <= in24h;
};

export const sortAppointments = (appointments) => {
  return [...appointments].sort((a, b) => {
    const aTime = new Date(`${a.date}T${a.time}`).getTime();
    const bTime = new Date(`${b.date}T${b.time}`).getTime();
    const n = Date.now();
    const aUp = aTime > n;
    const bUp = bTime > n;
    if (aUp !== bUp) return bUp ? 1 : -1;
    if (aUp) return aTime - bTime;
    return bTime - aTime;
  });
};

export const appointmentsApi = {
  getAll: async () => {
    try {
      const res = await apiClient.get('/appointments');
      return res.data;
    } catch {
      return [...MOCK_APPOINTMENTS];
    }
  },

  getById: async (id) => {
    try {
      const res = await apiClient.get(`/appointments/${id}`);
      return res.data;
    } catch {
      return MOCK_APPOINTMENTS.find((a) => a.id === id) || null;
    }
  },

  create: async (appt) => {
    try {
      const res = await apiClient.post('/appointments', appt);
      return res.data;
    } catch {
      const newAppt = { ...appt, id: generateId(), createdAt: formatDateTime(), reminderSent: false };
      MOCK_APPOINTMENTS.push(newAppt);
      return newAppt;
    }
  },

  update: async (id, appt) => {
    try {
      const res = await apiClient.put(`/appointments/${id}`, appt);
      return res.data;
    } catch {
      const idx = MOCK_APPOINTMENTS.findIndex((a) => a.id === id);
      if (idx !== -1) MOCK_APPOINTMENTS[idx] = { ...appt, id };
      return { ...appt, id };
    }
  },

  delete: async (id) => {
    try {
      await apiClient.delete(`/appointments/${id}`);
    } catch {
      const idx = MOCK_APPOINTMENTS.findIndex((a) => a.id === id);
      if (idx !== -1) MOCK_APPOINTMENTS.splice(idx, 1);
    }
  },

  markReminderSent: async (id) => {
    try {
      const appt = await appointmentsApi.getById(id);
      if (appt) {
        appt.reminderSent = true;
        const res = await apiClient.put(`/appointments/${id}`, appt);
        return res.data;
      }
    } catch {
      const idx = MOCK_APPOINTMENTS.findIndex((a) => a.id === id);
      if (idx !== -1) MOCK_APPOINTMENTS[idx].reminderSent = true;
    }
  },

  search: (appointments, query) => {
    const q = query.toLowerCase();
    return appointments.filter(
      (a) =>
        a.title.toLowerCase().includes(q) ||
        a.description.toLowerCase().includes(q) ||
        a.location.toLowerCase().includes(q) ||
        a.category.toLowerCase().includes(q)
    );
  },

  getCategories: (appointments) => {
    const cats = [...new Set(appointments.map((a) => a.category))];
    cats.sort();
    return cats;
  },
};
