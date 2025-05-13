// src/services/api.js
import axios from 'axios';

const API_URL = 'http://localhost:4004/api'; // Backend is running on port 4004

// Create an axios instance
const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add request interceptor to include auth token in all requests
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Auth API calls
export const authAPI = {
  login: async (email, password) => {
    const response = await api.post('/user/login', { email, password });
    if (response.data.success) {
      localStorage.setItem('user', JSON.stringify(response.data.userDoc));
    }
    return response.data;
  },
  
  register: async (userData) => {
    return await api.post('/user/add', userData);
  },
  
  logout: () => {
    localStorage.removeItem('user');
  },
  
  getCurrentUser: () => {
    return JSON.parse(localStorage.getItem('user'));
  },
  
  triggerEmailOtp: async (email) => {
    return await api.post('/user/triggerOTP', { email });
  },
  
  verifyEmailOtp: async (otp, userId) => {
    return await api.post('/user/verifyEmailOtp', { otp, userId });
  },
  
  resetPassword: async (email, newPassword) => {
    return await api.post('/user/resetPassword', { email, newPassword });
  }
};

// User API calls
export const userAPI = {
  getAll: async () => {
    return await api.get('/user/getAll');
  },
  
  getById: async (id) => {
    return await api.get(`/user/getUserbyId/${id}`);
  },
  
  update: async (userData) => {
    return await api.put('/user/update', userData);
  },
  
  delete: async (id) => {
    return await api.delete(`/user/delete/${id}`);
  }
};

// Course API calls
export const courseAPI = {
  getAll: async (page = 1, pageSize = 10) => {
    return await api.get(`/course/getAll?page=${page}&pageSize=${pageSize}`);
  },
  
  getById: async (id) => {
    return await api.get(`/course/getById/${id}`);
  },
  
  create: async (courseData) => {
    return await api.post('/course/add', courseData);
  },
  
  update: async (courseData) => {
    return await api.put('/course/update', courseData);
  },
  
  delete: async (id) => {
    return await api.delete(`/course/delete/${id}`);
  }
};

// Class API calls
export const classAPI = {
  getAll: async () => {
    return await api.get('/class/getAll');
  },
  
  getById: async (id) => {
    return await api.get(`/class/getById/${id}`);
  },
  
  create: async (classData) => {
    return await api.post('/class/add', classData);
  },
  
  update: async (id, classData) => {
    return await api.put(`/class/update/${id}`, classData);
  },
  
  delete: async (id) => {
    return await api.delete(`/class/delete/${id}`);
  }
};

// Enrollment API calls
export const enrollmentAPI = {
  create: async (enrollmentData) => {
    return await api.post('/enrollment/create', enrollmentData);
  },
  
  getByStudent: async (userId) => {
    return await api.get(`/enrollment/getByStudent/${userId}`);
  },
  
  getByCourse: async (courseId) => {
    return await api.get(`/enrollment/getByCourse/${courseId}`);
  },
  
  update: async (enrollmentData) => {
    return await api.put('/enrollment/update', enrollmentData);
  },
  
  delete: async (id) => {
    return await api.delete(`/enrollment/delete/${id}`);
  }
};

export default {
  auth: authAPI,
  users: userAPI,
  courses: courseAPI,
  classes: classAPI,
  enrollments: enrollmentAPI
};