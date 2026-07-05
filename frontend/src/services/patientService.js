import api from './api'

export const patientService = {
  getProfile: () => api.get('/api/patients/profile'),
  updateProfile: (data) => api.put('/api/patients/profile', data),
  getAppointments: () => api.get('/api/patients/appointments'),
  getNotifications: () => api.get('/api/patients/notifications'),
  markNotificationRead: (id) => api.patch(`/api/patients/notifications/${id}/read`),
  
  // New Appointment Management Routes
  getDepartments: () => api.get('/api/patients/departments'),
  getDoctorsByDept: (deptId) => api.get(`/api/patients/departments/${deptId}/doctors`),
  getAvailabilities: (doctorId) => api.get(`/api/patients/doctors/${doctorId}/availabilities`),
  bookAppointment: (data) => api.post('/api/patients/appointments/book', data),
  cancelAppointment: (id) => api.post(`/api/patients/appointments/${id}/cancel`),
  rescheduleAppointment: (id, data) => api.patch(`/api/patients/appointments/${id}/reschedule`, data),
  
  // AI Endpoints
  getChatHistory: () => api.get('/api/ai/history'),
  sendChatMessage: (data) => api.post('/api/ai/chat', data),
}
