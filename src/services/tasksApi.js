import { apiClient } from './apiClient';

const MOCK_TASKS = [];

const generateId = () => 't_' + crypto.randomUUID();
const formatDateTime = () => new Date().toISOString().slice(0, 19).replace('T', ' ');

export const sortTasks = (tasks) => {
  const priorityOrder = { high: 3, medium: 2, low: 1 };
  return [...tasks].sort((a, b) => {
    if (a.completed !== b.completed) return a.completed ? 1 : -1;
    const aPri = priorityOrder[a.priority] || 2;
    const bPri = priorityOrder[b.priority] || 2;
    if (aPri !== bPri) return bPri - aPri;
    if (a.dueDate && b.dueDate) return new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime();
    if (a.dueDate) return -1;
    if (b.dueDate) return 1;
    return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
  });
};

export const tasksApi = {
  getAll: async () => {
    try {
      const res = await apiClient.get('/tasks');
      return res.data;
    } catch {
      return [...MOCK_TASKS];
    }
  },

  getById: async (id) => {
    try {
      const res = await apiClient.get(`/tasks/${id}`);
      return res.data;
    } catch {
      return MOCK_TASKS.find((t) => t.id === id) || null;
    }
  },

  create: async (task) => {
    try {
      const res = await apiClient.post('/tasks', task);
      return res.data;
    } catch {
      const newTask = { ...task, id: generateId(), createdAt: formatDateTime(), completed: false };
      MOCK_TASKS.push(newTask);
      return newTask;
    }
  },

  update: async (id, task) => {
    try {
      const res = await apiClient.put(`/tasks/${id}`, task);
      return res.data;
    } catch {
      const idx = MOCK_TASKS.findIndex((t) => t.id === id);
      if (idx !== -1) MOCK_TASKS[idx] = { ...task, id };
      return { ...task, id };
    }
  },

  delete: async (id) => {
    try {
      await apiClient.delete(`/tasks/${id}`);
    } catch {
      const idx = MOCK_TASKS.findIndex((t) => t.id === id);
      if (idx !== -1) MOCK_TASKS.splice(idx, 1);
    }
  },

  toggleComplete: async (id) => {
    try {
      const task = await tasksApi.getById(id);
      if (task) {
        task.completed = !task.completed;
        const res = await apiClient.put(`/tasks/${id}`, task);
        return res.data;
      }
    } catch {
      const idx = MOCK_TASKS.findIndex((t) => t.id === id);
      if (idx !== -1) {
        MOCK_TASKS[idx].completed = !MOCK_TASKS[idx].completed;
        return MOCK_TASKS[idx];
      }
    }
    return null;
  },

  search: (tasks, query) => {
    const q = query.toLowerCase();
    return tasks.filter(
      (t) =>
        t.title.toLowerCase().includes(q) ||
        t.description.toLowerCase().includes(q)
    );
  },
};
