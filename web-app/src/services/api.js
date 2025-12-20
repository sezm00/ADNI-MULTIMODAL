import axios from 'axios';

const API_URL = 'http://localhost:5000/api';

// Create axios instance
const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add token to requests
api.interceptors.request.use(
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

// Handle response errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/';
    }
    return Promise.reject(error);
  }
);

// Auth API
export const authAPI = {
  login: (email, password, role) => 
    api.post('/auth/login', { email, password, role }),
  
  register: (userData) => 
    api.post('/auth/register', userData),
};

// Appointments API
export const appointmentsAPI = {
  getAll: () => api.get('/appointments'),
  
  getById: (id) => api.get(`/appointments/${id}`),
  
  create: (appointmentData) => api.post('/appointments', appointmentData),
  
  update: (id, appointmentData) => api.put(`/appointments/${id}`, appointmentData),
  
  delete: (id) => api.delete(`/appointments/${id}`),
  
  getByDoctor: (doctorId) => api.get(`/appointments/doctor/${doctorId}`),
  
  getByPatient: (patientId) => api.get(`/appointments/patient/${patientId}`),
};

// Patients API
export const patientsAPI = {
  getAll: () => api.get('/patients'),
  
  getById: (id) => api.get(`/patients/${id}`),
  
  update: (id, patientData) => api.put(`/patients/${id}`, patientData),
  
  delete: (id) => api.delete(`/patients/${id}`),
};

// Doctors API
export const doctorsAPI = {
  getAll: () => api.get('/doctors'),
  
  getById: (id) => api.get(`/doctors/${id}`),
  
  update: (id, doctorData) => api.put(`/doctors/${id}`, doctorData),
  
  getStatistics: (id) => api.get(`/doctors/${id}/statistics`),
};

// Medical Records API
export const medicalRecordsAPI = {
  getByPatient: (patientId) => api.get(`/medical-records/patient/${patientId}`),
  
  getById: (id) => api.get(`/medical-records/${id}`),
  
  create: (recordData) => api.post('/medical-records', recordData),
  
  update: (id, recordData) => api.put(`/medical-records/${id}`, recordData),
  
  delete: (id) => api.delete(`/medical-records/${id}`),
  
  getByType: (patientId, recordType) => 
    api.get(`/medical-records/patient/${patientId}/type/${recordType}`),
};

export default api;
