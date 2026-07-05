import { useLocation } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { getInitials, avatarColor } from '../../utils/helpers'
import { HiBars3, HiBell, HiArrowRightOnRectangle } from 'react-icons/hi2'

const PAGE_TITLES = {
  '/patient':               'Dashboard',
  '/patient/ai-assistant':  'AI Assistant',
  '/patient/appointments':  'My Appointments',
  '/patient/notifications': 'Notifications',
  '/patient/profile':       'My Profile',
  '/doctor':                'Dashboard',
  '/doctor/today-appointments':   "Today's Appointments",
  '/doctor/consultation':         'Consultation',
  '/doctor/consultation-history': 'Consultation History',
  '/receptionist':               'Dashboard',
  '/receptionist/qr-scanner':    'QR Scanner',
  '/receptionist/today-queue':   "Today's Queue",
  '/receptionist/patient-search':'Patient Search',
  '/admin':              'Dashboard',
  '/admin/doctors':      'Doctors',
  '/admin/receptionists':'Receptionists',
  '/admin/departments':  'Departments',
  '/admin/hospital-info':'Hospital Information',
  '/admin/reports':      'Reports',
}

const ROLE_COLORS = {
  PATIENT: 'var(--primary)',
  DOCTOR: 'var(--success)',
  RECEPTIONIST: 'var(--warning)',
  ADMIN: 'var(--accent)',
}

export default function TopNav({ onToggleSidebar }) {
  const { user, logout } = useAuth()
  const location = useLocation()
  const title = PAGE_TITLES[location.pathname] || 'Hospital AI'
  const initials = getInitials(user?.full_name || user?.username)
  const bgColor = avatarColor(user?.full_name || user?.username)
  const roleColor = ROLE_COLORS[user?.role] || 'var(--primary)'

  return (
    <header style={{
      position: 'sticky', top: 0,
      height: 'var(--topnav-height)',
      background: 'rgba(15, 23, 42, 0.85)',
      backdropFilter: 'blur(20px)',
      borderBottom: '1px solid var(--border)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: '0 1.5rem',
      zIndex: 50,
    }}>
      {/* Left: toggle + title */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
        <button
          onClick={onToggleSidebar}
          style={{
            background: 'none', border: 'none', cursor: 'pointer',
            color: 'var(--text-secondary)', fontSize: '1.4rem', padding: '0.25rem',
            borderRadius: 'var(--radius-sm)', transition: 'var(--transition)',
            display: 'flex', alignItems: 'center',
          }}
          onMouseEnter={e => { e.currentTarget.style.background = 'var(--bg-card)'; e.currentTarget.style.color = 'var(--text-primary)' }}
          onMouseLeave={e => { e.currentTarget.style.background = 'none'; e.currentTarget.style.color = 'var(--text-secondary)' }}
          title="Toggle Sidebar"
        >
          <HiBars3 />
        </button>
        <h1 style={{ fontSize: '1.05rem', fontWeight: 700, color: 'var(--text-primary)', margin: 0 }}>
          {title}
        </h1>
      </div>

      {/* Right: actions */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
        {user?.role === 'PATIENT' && (
          <button
            style={{
              background: 'none', border: 'none', cursor: 'pointer',
              color: 'var(--text-secondary)', fontSize: '1.25rem', padding: '0.375rem',
              borderRadius: 'var(--radius-sm)', transition: 'var(--transition)',
              display: 'flex', alignItems: 'center', position: 'relative',
            }}
            title="Notifications"
          >
            <HiBell />
            <span style={{
              position: 'absolute', top: 2, right: 2,
              width: 8, height: 8, borderRadius: '50%',
              background: 'var(--danger)',
            }} />
          </button>
        )}

        {/* User chip */}
        <div style={{
          display: 'flex', alignItems: 'center', gap: '0.6rem',
          background: 'var(--bg-card)', border: '1px solid var(--border)',
          borderRadius: 'var(--radius-full)', padding: '0.25rem 0.875rem 0.25rem 0.375rem',
        }}>
          <div style={{
            width: 30, height: 30, borderRadius: '50%',
            background: bgColor, display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: '0.72rem', fontWeight: 700, color: '#fff', flexShrink: 0,
          }}>
            {initials}
          </div>
          <div style={{ lineHeight: 1.2 }}>
            <div style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-primary)' }}>
              {user?.full_name?.split(' ')[0] || user?.username}
            </div>
            <div style={{ fontSize: '0.65rem', color: roleColor, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.04em' }}>
              {user?.role}
            </div>
          </div>
        </div>

        {/* Logout */}
        <button
          onClick={logout}
          style={{
            background: 'none', border: '1px solid var(--border)', cursor: 'pointer',
            color: 'var(--text-muted)', fontSize: '1.1rem', padding: '0.45rem',
            borderRadius: 'var(--radius-sm)', transition: 'var(--transition)',
            display: 'flex', alignItems: 'center',
          }}
          onMouseEnter={e => { e.currentTarget.style.background = 'var(--danger-bg)'; e.currentTarget.style.color = 'var(--danger)'; e.currentTarget.style.borderColor = 'rgba(239,68,68,0.3)' }}
          onMouseLeave={e => { e.currentTarget.style.background = 'none'; e.currentTarget.style.color = 'var(--text-muted)'; e.currentTarget.style.borderColor = 'var(--border)' }}
          title="Logout"
        >
          <HiArrowRightOnRectangle />
        </button>
      </div>
    </header>
  )
}
