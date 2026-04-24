import axios from 'axios';

// Central API configuration
const API = axios.create({
  // baseURL: 'https://rakshit-ai-conditioners-backend.onrender.com/api/admin',
  baseURL: 'http://localhost:9000/api/admin',
});

// Add a request interceptor to attach the auth token
API.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Add a response interceptor to handle common error cases
API.interceptors.response.use(
  (response) => response.data,
  (error) => {
    const message = error.response?.data?.error || error.message || 'Something went wrong';
    return Promise.reject(new Error(message));
  }
);

// ─── Authentication ──────────────────────────────────────────
export const authAPI = {
  login: (userData) => API.post('/auth/login', userData),
  getMe: () => API.get('/auth/me'),
  updateDetails: (data) => {
    const config = data instanceof FormData ? { headers: { 'Content-Type': 'multipart/form-data' } } : {};
    return API.put('/auth/updatedetails', data, config);
  },
  updatePassword: (data) => API.put('/auth/updatepassword', data),
};

// ─── Products ───────────────────────────────────────────────
export const productsAPI = {
  getAll: (params) => API.get('/products', { params }),
  getOne: (id) => API.get(`/products/${id}`),
  create: (data) => {
    const config = data instanceof FormData ? { headers: { 'Content-Type': 'multipart/form-data' } } : {};
    return API.post('/products', data, config);
  },
  update: (id, data) => {
    const config = data instanceof FormData ? { headers: { 'Content-Type': 'multipart/form-data' } } : {};
    return API.put(`/products/${id}`, data, config);
  },
  delete: (id) => API.delete(`/products/${id}`),
};

// ─── Projects ────────────────────────────────────────────────
export const projectsAPI = {
  getAll: (params) => API.get('/projects', { params }),
  getOne: (id) => API.get(`/projects/${id}`),
  create: (data) => {
    const config = data instanceof FormData ? { headers: { 'Content-Type': 'multipart/form-data' } } : {};
    return API.post('/projects', data, config);
  },
  update: (id, data) => {
    const config = data instanceof FormData ? { headers: { 'Content-Type': 'multipart/form-data' } } : {};
    return API.put(`/projects/${id}`, data, config);
  },
  delete: (id) => API.delete(`/projects/${id}`),
};

// ─── Achievements ────────────────────────────────────────────
export const achievementsAPI = {
  getAll: (params) => API.get('/achievements', { params }),
  getOne: (id) => API.get(`/achievements/${id}`),
  create: (data) => {
    const config = data instanceof FormData ? { headers: { 'Content-Type': 'multipart/form-data' } } : {};
    return API.post('/achievements', data, config);
  },
  update: (id, data) => {
    const config = data instanceof FormData ? { headers: { 'Content-Type': 'multipart/form-data' } } : {};
    return API.put(`/achievements/${id}`, data, config);
  },
  delete: (id) => API.delete(`/achievements/${id}`),
};

// ─── Enquiries ────────────────────────────────────────────────
export const enquiryAPI = {
  getAll: (params) => API.get('/enquiries', { params }),
  updateStatus: (id, status) => API.put(`/enquiries/${id}`, { status }),
  delete: (id) => API.delete(`/enquiries/${id}`),
};

// ─── Contact Form Messages ────────────────────────────────────
export const contactAPI = {
  getAll: (params) => API.get('/contacts', { params }),
  updateStatus: (id, status) => API.put(`/contacts/${id}`, { status }),
  delete: (id) => API.delete(`/contacts/${id}`),
};

// ─── Clients ──────────────────────────────────────────────────
export const clientsAPI = {
  getAll: (params) => API.get('/clients', { params }),
  getOne: (id) => API.get(`/clients/${id}`),
  create: (data) => API.post('/clients', data),
  update: (id, data) => API.put(`/clients/${id}`, data),
  delete: (id) => API.delete(`/clients/${id}`),
};


// ─── Categories ──────────────────────────────────────────────────
export const categoriesAPI = {
  getAll: (params) => API.get('/categories', { params }),
  getOne: (id) => API.get(`/categories/${id}`),
  create: (data) => API.post('/categories', data),
  update: (id, data) => API.put(`/categories/${id}`, data),
  delete: (id) => API.delete(`/categories/${id}`),
};

// ─── Testimonials ─────────────────────────────────────────────
export const testimonialsAPI = {
  getAll: (params) => API.get('/testimonials', { params }),
  create: (data) => {
    const config = data instanceof FormData ? { headers: { 'Content-Type': 'multipart/form-data' } } : {};
    return API.post('/testimonials', data, config);
  },
  delete: (id) => API.delete(`/testimonials/${id}`),
};

// ─── Dashboard ───────────────────────────────────────────────
export const dashboardAPI = {
  getCounts: () => API.get('/dashboard/counts'),
};

export default API;
