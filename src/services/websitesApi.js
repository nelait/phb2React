import { apiClient } from './apiClient';

const MOCK_WEBSITES = [];

const generateId = () => 'w_' + crypto.randomUUID();
const formatDateTime = () => new Date().toISOString().slice(0, 19).replace('T', ' ');

export const websitesApi = {
  getAll: async () => {
    try {
      const res = await apiClient.get('/websites');
      return res.data;
    } catch {
      return [...MOCK_WEBSITES];
    }
  },

  getById: async (id) => {
    try {
      const res = await apiClient.get(`/websites/${id}`);
      return res.data;
    } catch {
      return MOCK_WEBSITES.find((w) => w.id === id) || null;
    }
  },

  create: async (website) => {
    try {
      const res = await apiClient.post('/websites', website);
      return res.data;
    } catch {
      const newWebsite = { ...website, id: generateId(), createdAt: formatDateTime() };
      MOCK_WEBSITES.push(newWebsite);
      return newWebsite;
    }
  },

  update: async (id, website) => {
    try {
      const res = await apiClient.put(`/websites/${id}`, website);
      return res.data;
    } catch {
      const idx = MOCK_WEBSITES.findIndex((w) => w.id === id);
      if (idx !== -1) MOCK_WEBSITES[idx] = { ...website, id };
      return { ...website, id };
    }
  },

  delete: async (id) => {
    try {
      await apiClient.delete(`/websites/${id}`);
    } catch {
      const idx = MOCK_WEBSITES.findIndex((w) => w.id === id);
      if (idx !== -1) MOCK_WEBSITES.splice(idx, 1);
    }
  },

  search: (websites, query) => {
    const q = query.toLowerCase();
    return websites.filter(
      (w) =>
        w.name.toLowerCase().includes(q) ||
        w.url.toLowerCase().includes(q) ||
        (w.description || '').toLowerCase().includes(q) ||
        w.category.toLowerCase().includes(q)
    );
  },

  getCategories: (websites) => {
    const cats = [...new Set(websites.map((w) => w.category))];
    cats.sort();
    return cats;
  },

  getHostname: (url) => {
    try {
      return new URL(url).hostname;
    } catch {
      return url;
    }
  },
};
