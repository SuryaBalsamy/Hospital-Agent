import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import ProtectedRoute from '../components/auth/ProtectedRoute'
import { getRoleDashboard } from '../utils/helpers'

// Public
import LandingPage from '../pages/Landing/LandingPage'
import LoginPage from '../pages/Auth/LoginPage'
import RegisterPage from '../pages/Auth/RegisterPage'

// Patient
import PatientDashboard from '../pages/Patient/PatientDashboard'
import AIAssistant from '../pages/Patient/AIAssistant'
import MyAppointments from '../pages/Patient/MyAppointments'
import Notifications from '../pages/Patient/Notifications'
import Profile from '../pages/Patient/Profile'

// Doctor
import DoctorDashboard from '../pages/Doctor/DoctorDashboard'
import TodayAppointments from '../pages/Doctor/TodayAppointments'
import UpcomingAppointments from '../pages/Doctor/UpcomingAppointments'
import Consultation from '../pages/Doctor/Consultation'
import ConsultationHistory from '../pages/Doctor/ConsultationHistory'

// Receptionist
import ReceptionistDashboard from '../pages/Receptionist/ReceptionistDashboard'
import QRScanner from '../pages/Receptionist/QRScanner'
import TodayQueue from '../pages/Receptionist/TodayQueue'
import PatientSearch from '../pages/Receptionist/PatientSearch'

// Admin
import AdminDashboard from '../pages/Admin/AdminDashboard'
import Doctors from '../pages/Admin/Doctors'
import Receptionists from '../pages/Admin/Receptionists'
import Departments from '../pages/Admin/Departments'
import HospitalInfo from '../pages/Admin/HospitalInfo'
import Reports from '../pages/Admin/Reports'

function AuthRedirect({ children }) {
  const { isAuthenticated, user } = useAuth()
  if (isAuthenticated && user) return <Navigate to={getRoleDashboard(user.role)} replace />
  return children
}

export default function AppRouter() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Public */}
        <Route path="/" element={<LandingPage />} />
        <Route path="/login"    element={<AuthRedirect><LoginPage /></AuthRedirect>} />
        <Route path="/register" element={<AuthRedirect><RegisterPage /></AuthRedirect>} />

        {/* Patient */}
        <Route path="/patient" element={<ProtectedRoute allowedRoles={['PATIENT']}><PatientDashboard /></ProtectedRoute>} />
        <Route path="/patient/ai-assistant"  element={<ProtectedRoute allowedRoles={['PATIENT']}><AIAssistant /></ProtectedRoute>} />
        <Route path="/patient/appointments"  element={<ProtectedRoute allowedRoles={['PATIENT']}><MyAppointments /></ProtectedRoute>} />
        <Route path="/patient/notifications" element={<ProtectedRoute allowedRoles={['PATIENT']}><Notifications /></ProtectedRoute>} />
        <Route path="/patient/profile"       element={<ProtectedRoute allowedRoles={['PATIENT']}><Profile /></ProtectedRoute>} />

        {/* Doctor */}
        <Route path="/doctor" element={<ProtectedRoute allowedRoles={['DOCTOR']}><DoctorDashboard /></ProtectedRoute>} />
        <Route path="/doctor/today-appointments"   element={<ProtectedRoute allowedRoles={['DOCTOR']}><TodayAppointments /></ProtectedRoute>} />
        <Route path="/doctor/upcoming-appointments"element={<ProtectedRoute allowedRoles={['DOCTOR']}><UpcomingAppointments /></ProtectedRoute>} />
        <Route path="/doctor/consultation"         element={<ProtectedRoute allowedRoles={['DOCTOR']}><Consultation /></ProtectedRoute>} />
        <Route path="/doctor/consultation-history" element={<ProtectedRoute allowedRoles={['DOCTOR']}><ConsultationHistory /></ProtectedRoute>} />

        {/* Receptionist */}
        <Route path="/receptionist" element={<ProtectedRoute allowedRoles={['RECEPTIONIST']}><ReceptionistDashboard /></ProtectedRoute>} />
        <Route path="/receptionist/qr-scanner"     element={<ProtectedRoute allowedRoles={['RECEPTIONIST']}><QRScanner /></ProtectedRoute>} />
        <Route path="/receptionist/today-queue"    element={<ProtectedRoute allowedRoles={['RECEPTIONIST']}><TodayQueue /></ProtectedRoute>} />
        <Route path="/receptionist/patient-search" element={<ProtectedRoute allowedRoles={['RECEPTIONIST']}><PatientSearch /></ProtectedRoute>} />

        {/* Admin */}
        <Route path="/admin" element={<ProtectedRoute allowedRoles={['ADMIN']}><AdminDashboard /></ProtectedRoute>} />
        <Route path="/admin/doctors"      element={<ProtectedRoute allowedRoles={['ADMIN']}><Doctors /></ProtectedRoute>} />
        <Route path="/admin/receptionists"element={<ProtectedRoute allowedRoles={['ADMIN']}><Receptionists /></ProtectedRoute>} />
        <Route path="/admin/departments"  element={<ProtectedRoute allowedRoles={['ADMIN']}><Departments /></ProtectedRoute>} />
        <Route path="/admin/hospital-info"element={<ProtectedRoute allowedRoles={['ADMIN']}><HospitalInfo /></ProtectedRoute>} />
        <Route path="/admin/reports"      element={<ProtectedRoute allowedRoles={['ADMIN']}><Reports /></ProtectedRoute>} />

        {/* Fallback */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  )
}
