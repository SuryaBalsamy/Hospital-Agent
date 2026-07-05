import api from './api'

export const doctorService = {
  getAll: () => api.get('/api/doctors/'),
  getById: (id) => api.get(`/api/doctors/${id}`),
  getProfile: () => api.get('/api/doctors/profile'),
  getTodayAppointments: () => api.get('/api/doctors/today-appointments'),
  getUpcomingAppointments: () => api.get('/api/doctors/upcoming-appointments'),
  
  // Doctor queue & consultation workflow
  getWaitingQueue: () => api.get('/api/doctors/waiting-queue'),
  startConsultation: (id) => api.post(`/api/doctors/appointments/${id}/start-consultation`),
  endConsultation: (id, data) => api.post(`/api/doctors/appointments/${id}/end-consultation`, data),
}
