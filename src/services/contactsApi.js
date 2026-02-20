import { apiClient } from './apiClient';

const MOCK_CONTACTS = [
  {
    id: 'c_69962c79ba3031.74750554',
    name: 'John Smith',
    phone: '+1 (555) 123-4567',
    email: 'john@example.com',
    category: 'General',
  },
  {
    id: 'c_69962c8d974971.10518044',
    name: 'Jane Doe',
    phone: '+1 (555) 987-6543',
    email: 'jane@example.com',
    category: 'Friends',
  },
];

export const contactsApi = {
  getAll: async () => {
    try {
      const res = await apiClient.get('/contacts');
      return res.data;
    } catch {
      return [...MOCK_CONTACTS];
    }
  },

  getById: async (id) => {
    try {
      const res = await apiClient.get(`/contacts/${id}`);
      return res.data;
    } catch {
      return MOCK_CONTACTS.find((c) => c.id === id) || null;
    }
  },

  create: async (contact) => {
    try {
      const res = await apiClient.post('/contacts', contact);
      return res.data;
    } catch {
      const newContact = { ...contact, id: 'c_' + crypto.randomUUID() };
      MOCK_CONTACTS.push(newContact);
      return newContact;
    }
  },

  update: async (id, contact) => {
    try {
      const res = await apiClient.put(`/contacts/${id}`, contact);
      return res.data;
    } catch {
      const idx = MOCK_CONTACTS.findIndex((c) => c.id === id);
      if (idx !== -1) MOCK_CONTACTS[idx] = { ...contact, id };
      return { ...contact, id };
    }
  },

  delete: async (id) => {
    try {
      await apiClient.delete(`/contacts/${id}`);
    } catch {
      const idx = MOCK_CONTACTS.findIndex((c) => c.id === id);
      if (idx !== -1) MOCK_CONTACTS.splice(idx, 1);
    }
  },

  search: (contacts, query) => {
    const q = query.toLowerCase();
    return contacts.filter(
      (c) =>
        c.name.toLowerCase().includes(q) ||
        c.phone.toLowerCase().includes(q) ||
        c.email.toLowerCase().includes(q)
    );
  },
};
