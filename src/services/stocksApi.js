import { apiClient } from './apiClient';

const MOCK_STOCKS = [];

const generateId = () => 's_' + crypto.randomUUID();
const formatDateTime = () => new Date().toISOString().slice(0, 19).replace('T', ' ');

export const getGainLoss = (stock) => {
  return (stock.quantity * stock.currentPrice) - (stock.quantity * stock.purchasePrice);
};

export const getGainLossPercentage = (stock) => {
  if (stock.purchasePrice === 0) return 0;
  return ((stock.currentPrice - stock.purchasePrice) / stock.purchasePrice) * 100;
};

export const getTotalValue = (stock) => stock.quantity * stock.currentPrice;
export const getTotalCost = (stock) => stock.quantity * stock.purchasePrice;
export const isGainer = (stock) => getGainLoss(stock) > 0;
export const isLoser = (stock) => getGainLoss(stock) < 0;

export const sortStocks = (stocks) => {
  return [...stocks].sort((a, b) => getGainLossPercentage(b) - getGainLossPercentage(a));
};

export const getPortfolioSummary = (stocks) => {
  const portfolioValue = stocks.reduce((sum, s) => sum + getTotalValue(s), 0);
  const portfolioCost = stocks.reduce((sum, s) => sum + getTotalCost(s), 0);
  const portfolioGainLoss = portfolioValue - portfolioCost;
  const portfolioGainLossPercentage = portfolioCost > 0 ? ((portfolioValue - portfolioCost) / portfolioCost) * 100 : 0;
  return { portfolioValue, portfolioCost, portfolioGainLoss, portfolioGainLossPercentage };
};

export const stocksApi = {
  getAll: async () => {
    try {
      const res = await apiClient.get('/stocks');
      return res.data;
    } catch {
      return [...MOCK_STOCKS];
    }
  },

  getById: async (id) => {
    try {
      const res = await apiClient.get(`/stocks/${id}`);
      return res.data;
    } catch {
      return MOCK_STOCKS.find((s) => s.id === id) || null;
    }
  },

  create: async (stock) => {
    try {
      const res = await apiClient.post('/stocks', stock);
      return res.data;
    } catch {
      const newStock = { ...stock, id: generateId(), createdAt: formatDateTime() };
      MOCK_STOCKS.push(newStock);
      return newStock;
    }
  },

  update: async (id, stock) => {
    try {
      const res = await apiClient.put(`/stocks/${id}`, stock);
      return res.data;
    } catch {
      const idx = MOCK_STOCKS.findIndex((s) => s.id === id);
      if (idx !== -1) MOCK_STOCKS[idx] = { ...stock, id };
      return { ...stock, id };
    }
  },

  delete: async (id) => {
    try {
      await apiClient.delete(`/stocks/${id}`);
    } catch {
      const idx = MOCK_STOCKS.findIndex((s) => s.id === id);
      if (idx !== -1) MOCK_STOCKS.splice(idx, 1);
    }
  },

  search: (stocks, query) => {
    const q = query.toLowerCase();
    return stocks.filter(
      (s) =>
        s.symbol.toLowerCase().includes(q) ||
        s.name.toLowerCase().includes(q) ||
        s.sector.toLowerCase().includes(q) ||
        (s.notes || '').toLowerCase().includes(q)
    );
  },

  getSectors: (stocks) => {
    const sectors = [...new Set(stocks.map((s) => s.sector))];
    sectors.sort();
    return sectors;
  },
};
