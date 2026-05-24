
import axios from 'axios';

const API_URL = '/api';

// Create axios instance with base URL
const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add request interceptor to include auth token in requests
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('logitrack-token');
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Authentication service
export const authService = {
  login: async (email: string, password: string) => {
    const response = await api.post('/auth/login', { email, password });
    if (response.data.token) {
      localStorage.setItem('logitrack-token', response.data.token);
    }
    return response.data;
  },
  
  register: async (name: string, email: string, password: string, role: string) => {
    const response = await api.post('/auth/register', { name, email, password, role });
    if (response.data.token) {
      localStorage.setItem('logitrack-token', response.data.token);
    }
    return response.data;
  },
  
  logout: () => {
    localStorage.removeItem('logitrack-token');
  }
};

// Products service
export const productService = {
  getAll: async () => {
    const response = await api.get('/products');
    return response.data;
  },
  
  getById: async (id: string) => {
    const response = await api.get(`/products/${id}`);
    return response.data;
  },
  
  create: async (product: any) => {
    const response = await api.post('/products', product);
    return response.data;
  },
  
  update: async (id: string, product: any) => {
    const response = await api.put(`/products/${id}`, product);
    return response.data;
  },
  
  delete: async (id: string) => {
    const response = await api.delete(`/products/${id}`);
    return response.data;
  },
  
  getLowStockItems: async () => {
    const response = await api.get('/products/stats/low-stock');
    return response.data;
  }
};

// Shipments service
export const shipmentService = {
  getAll: async () => {
    const response = await api.get('/shipments');
    return response.data;
  },
  
  getById: async (id: string) => {
    const response = await api.get(`/shipments/${id}`);
    return response.data;
  },
  
  create: async (shipment: any) => {
    const response = await api.post('/shipments', shipment);
    return response.data;
  },
  
  update: async (id: string, shipment: any) => {
    const response = await api.put(`/shipments/${id}`, shipment);
    return response.data;
  },
  
  delete: async (id: string) => {
    const response = await api.delete(`/shipments/${id}`);
    return response.data;
  },
  
  getStatusCounts: async () => {
    const response = await api.get('/shipments/stats/status-counts');
    return response.data;
  }
};

// Orders service
export const orderService = {
  getAll: async () => {
    const response = await api.get('/orders');
    return response.data;
  },
  
  getById: async (id: string) => {
    const response = await api.get(`/orders/${id}`);
    return response.data;
  },
  
  create: async (order: any) => {
    const response = await api.post('/orders', order);
    return response.data;
  },
  
  update: async (id: string, order: any) => {
    const response = await api.put(`/orders/${id}`, order);
    return response.data;
  },
  
  delete: async (id: string) => {
    const response = await api.delete(`/orders/${id}`);
    return response.data;
  },
  
  getPendingCount: async () => {
    const response = await api.get('/orders/stats/pending');
    return response.data;
  }
};

// Users service
export const userService = {
  getAll: async () => {
    const response = await api.get('/users');
    return response.data;
  },
  
  getById: async (id: string) => {
    const response = await api.get(`/users/${id}`);
    return response.data;
  },
  
  create: async (user: any) => {
    const response = await api.post('/users', user);
    return response.data;
  },
  
  update: async (id: string, user: any) => {
    const response = await api.put(`/users/${id}`, user);
    return response.data;
  },
  
  delete: async (id: string) => {
    const response = await api.delete(`/users/${id}`);
    return response.data;
  }
};

// Warehouses service
export const warehouseService = {
  getAll: async () => {
    const response = await api.get('/warehouses');
    return response.data;
  },
  
  getById: async (id: string) => {
    const response = await api.get(`/warehouses/${id}`);
    return response.data;
  },
  
  create: async (warehouse: any) => {
    const response = await api.post('/warehouses', warehouse);
    return response.data;
  },
  
  update: async (id: string, warehouse: any) => {
    const response = await api.put(`/warehouses/${id}`, warehouse);
    return response.data;
  },
  
  delete: async (id: string) => {
    const response = await api.delete(`/warehouses/${id}`);
    return response.data;
  }
};

// Settings service
export const settingsService = {
  getAll: async () => {
    const response = await api.get('/settings');
    return response.data;
  },
  
  update: async (settings: any) => {
    const response = await api.put('/settings', settings);
    return response.data;
  },
  
  reset: async () => {
    const response = await api.post('/settings/reset');
    return response.data;
  }
};

export default api;
  