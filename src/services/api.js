import axios from 'axios';

// Central API configuration
const API = axios.create({
  // baseURL: 'https://rakshit-ai-conditioners-backend.onrender.com/api/admin',
  // baseURL: 'http://localhost:9000/api/admin',
  baseURL: 'http://192.168.0.115:9000/api/admin',
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

// ─── Branches & Contact Channels ───────────────────────────
export const branchesAPI = {
  getAll: (params) => API.get('/branches', { params }),
  getOne: (id) => API.get(`/branches/${id}`),
  create: (data) => {
    const config = data instanceof FormData ? { headers: { 'Content-Type': 'multipart/form-data' } } : {};
    return API.post('/branches', data, config);
  },
  update: (id, data) => {
    const config = data instanceof FormData ? { headers: { 'Content-Type': 'multipart/form-data' } } : {};
    return API.put(`/branches/${id}`, data, config);
  },
  delete: (id) => API.delete(`/branches/${id}`),
};

export const contactChannelsAPI = {
  getAll: () => API.get('/contact-channels'),
  update: (data) => API.put('/contact-channels', data),
  updateOne: (id, data) => API.put(`/contact-channels/${id}`, data),
};

// ─── Service Locations ───────────────────────────────────────
export const serviceLocationsAPI = {
  getAll: (params) => API.get('/service-locations', { params }),
  getOne: (id) => API.get(`/service-locations/${id}`),
  create: (data) => API.post('/service-locations', data),
  update: (id, data) => API.put(`/service-locations/${id}`, data),
  delete: (id) => API.delete(`/service-locations/${id}`),
};

// ─── Error Codes ─────────────────────────────────────────────
export const errorCodesAPI = {
  getAll: (params) => API.get('/error-codes', { params }),
  getOne: (id) => API.get(`/error-codes/${id}`),
  create: (data) => API.post('/error-codes', data),
  update: (id, data) => API.put(`/error-codes/${id}`, data),
  delete: (id) => API.delete(`/error-codes/${id}`),
};

// ─── Service Approach ────────────────────────────────────────
export const serviceApproachAPI = {
  get: () => API.get('/service-approach'),
  update: (data) => {
    const config = data instanceof FormData ? { headers: { 'Content-Type': 'multipart/form-data' } } : {};
    return API.put('/service-approach', data, config);
  },
};

// ─── Service Training ────────────────────────────────────────
export const serviceTrainingAPI = {
  get: () => API.get('/service-training'),
  update: (data) => API.put('/service-training', data),
};

// ─── Dashboard ───────────────────────────────────────────────
export const dashboardAPI = {
  getCounts: () => API.get('/dashboard/counts'),
};

// ─── Settings ────────────────────────────────────────────────
export const settingsAPI = {
  getAll: () => API.get('/settings'),
  saveAll: (data) => API.post('/settings', data),
  delete: (key) => API.delete(`/settings/${key}`),
};

export default API;
