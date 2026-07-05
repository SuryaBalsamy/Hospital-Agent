import api from './api'

export const adminService = {
  getDashboardStats: () => api.get('/api/admin/dashboard-stats'),
  getDoctors: () => api.get('/api/admin/doctors'),
  createDoctor: (data) => api.post('/api/admin/doctors', data),
  deleteDoctor: (id) => api.delete(`/api/admin/doctors/${id}`),
  getReceptionists: () => api.get('/api/admin/receptionists'),
  getPatients: () => api.get('/api/admin/patients'),
  getDepartments: () => api.get('/api/admin/departments'),
  createDepartment: (data) => api.post('/api/admin/departments', data),
  updateDepartment: (id, data) => api.put(`/api/admin/departments/${id}`, data),
  deleteDepartment: (id) => api.delete(`/api/admin/departments/${id}`),
}

export const receptionistService = {
  getProfile: () => api.get('/api/receptionists/profile'),
  getTodayQueue: () => api.get('/api/receptionists/today-queue'),
  logQRScan: (data) => api.post('/api/receptionists/qr-scan', data),
  searchPatients: (query) => api.get(`/api/receptionists/search-patients?query=${query}`),
  getAppointmentByToken: (token) => api.get(`/api/receptionists/appointments/by-token/${token}`),
  checkInPatient: (id) => api.patch(`/api/receptionists/appointments/${id}/check-in`),
}

export const hospitalService = {
  getInfo: () => api.get('/api/hospital/info'),
  getInfoByCategory: (cat) => api.get(`/api/hospital/info/category/${cat}`),
}
