import { NavLink, useLocation } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { getInitials, avatarColor } from '../../utils/helpers'
import {
  HiHome, HiSparkles, HiCalendar, HiBell, HiUser,
  HiClipboardDocument, HiArchiveBox, HiQrCode, HiQueueList,
  HiMagnifyingGlass, HiUserGroup, HiUsers, HiBuildingOffice2,
  HiInformationCircle, HiChartBar, HiXMark,
} from 'react-icons/hi2'

const NAV_ITEMS = {
  PATIENT: [
    { to: '/patient',              label: 'Dashboard',        icon: <HiHome /> },
    { to: '/patient/ai-assistant', label: 'AI Assistant',     icon: <HiSparkles /> },
    { to: '/patient/appointments', label: 'My Appointments',  icon: <HiCalendar /> },
    { to: '/patient/notifications',label: 'Notifications',    icon: <HiBell /> },
    { to: '/patient/profile',      label: 'Profile',          icon: <HiUser /> },
  ],
  DOCTOR: [
    { to: '/doctor',                      label: 'Dashboard',           icon: <HiHome /> },
    { to: '/doctor/today-appointments',   label: "Today's Appointments",icon: <HiCalendar /> },
    { to: '/doctor/upcoming-appointments',label: "Upcoming Schedule",  icon: <HiCalendar /> },
    { to: '/doctor/consultation',         label: 'Consultation',         icon: <HiClipboardDocument /> },
    { to: '/doctor/consultation-history', label: 'History',              icon: <HiArchiveBox /> },
  ],
  RECEPTIONIST: [
    { to: '/receptionist',               label: 'Dashboard',     icon: <HiHome /> },
    { to: '/receptionist/qr-scanner',    label: 'QR Scanner',    icon: <HiQrCode /> },
    { to: '/receptionist/today-queue',   label: "Today's Queue", icon: <HiQueueList /> },
    { to: '/receptionist/patient-search',label: 'Patient Search',icon: <HiMagnifyingGlass /> },
  ],
  ADMIN: [
    { to: '/admin',             label: 'Dashboard',       icon: <HiHome /> },
    { to: '/admin/doctors',     label: 'Doctors',          icon: <HiUserGroup /> },
    { to: '/admin/receptionists',label: 'Receptionists',  icon: <HiUsers /> },
    { to: '/admin/departments', label: 'Departments',      icon: <HiBuildingOffice2 /> },
    { to: '/admin/hospital-info',label: 'Hospital Info',  icon: <HiInformationCircle /> },
    { to: '/admin/reports',     label: 'Reports',          icon: <HiChartBar /> },
  ],
}

const ROLE_COLORS = {
  PATIENT: 'var(--primary)',
  DOCTOR: 'var(--success)',
  RECEPTIONIST: 'var(--warning)',
  ADMIN: 'var(--accent)',
}

const LogoIcon = ({ size = 38 }) => (
  <svg width={size} height={size} viewBox="0 0 42 42" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ flexShrink: 0 }}>
    <defs>
      <linearGradient id="hc-gradient-side" x1="0" y1="0" x2="42" y2="42" gradientUnits="userSpaceOnUse">
        <stop offset="0%" stopColor="#2563EB" />
        <stop offset="100%" stopColor="#06B6D4" />
      </linearGradient>
    </defs>
    <rect width="42" height="42" rx="10" fill="url(#hc-gradient-side)" />
    <path d="M15 21H27M21 15V27" stroke="#FFFFFF" strokeWidth="3" strokeLinecap="round" />
    <path d="M10 32H13L16 27L18 37L21 23L23 35L26 31L28 32H32" stroke="#FFFFFF" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" opacity="0.75" />
  </svg>
)

export default function Sidebar({ collapsed, onClose, isMobile }) {
  const { user, logout } = useAuth()
  const location = useLocation()
  const navItems = NAV_ITEMS[user?.role] || []
  const roleColor = ROLE_COLORS[user?.role] || 'var(--primary)'
  const initials = getInitials(user?.full_name || user?.username)
  const bgColor = avatarColor(user?.full_name || user?.username)

  const isExactActive = (to, idx) => {
    if (idx === 0) return location.pathname === to || location.pathname === to + '/'
    return location.pathname.startsWith(to)
  }

  return (
    <>
      {/* Mobile overlay */}
      {isMobile && !collapsed && (
        <div onClick={onClose} style={{
          position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)',
          backdropFilter: 'blur(4px)', zIndex: 99,
        }} />
      )}

      <aside style={{
        position: 'fixed',
        top: 0, left: 0,
        height: '100vh',
        width: collapsed ? 'var(--sidebar-collapsed)' : 'var(--sidebar-width)',
        background: 'var(--bg-surface)',
        borderRight: '1px solid var(--border)',
        display: 'flex',
        flexDirection: 'column',
        transition: 'width 0.3s cubic-bezier(0.4,0,0.2,1)',
        overflow: 'hidden',
        zIndex: 100,
        boxShadow: isMobile && !collapsed ? 'var(--shadow-xl)' : 'none',
      }}>

        {/* Logo */}
        <div style={{
          padding: '1.25rem 1rem',
          borderBottom: '1px solid var(--border)',
          display: 'flex',
          alignItems: 'center',
          gap: '0.875rem',
          minHeight: 'var(--topnav-height)',
          overflow: 'hidden',
        }}>
          <LogoIcon size={38} />
          {!collapsed && (
            <div style={{ overflow: 'hidden' }}>
              <div style={{ fontWeight: 800, fontSize: '0.9rem', color: 'var(--text-primary)', whiteSpace: 'nowrap' }}>
                HorizonCare AI
              </div>
              <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', whiteSpace: 'nowrap' }}>
                Medical Center
              </div>
            </div>
          )}
          {isMobile && !collapsed && (
            <button onClick={onClose} style={{
              marginLeft: 'auto', background: 'none', border: 'none',
              color: 'var(--text-muted)', cursor: 'pointer', fontSize: '1.2rem', padding: '0.25rem',
            }}>
              <HiXMark />
            </button>
          )}
        </div>

        {/* Nav Items */}
        <nav style={{ flex: 1, padding: '0.75rem 0.5rem', overflowY: 'auto', overflowX: 'hidden' }}>
          {navItems.map((item, idx) => {
            const active = isExactActive(item.to, idx)
            return (
              <NavLink
                key={item.to}
                to={item.to}
                end={idx === 0}
                onClick={isMobile ? onClose : undefined}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.75rem',
                  padding: '0.7rem 0.875rem',
                  borderRadius: 'var(--radius-md)',
                  marginBottom: '0.25rem',
                  color: active ? roleColor : 'var(--text-secondary)',
                  background: active ? `${roleColor}18` : 'transparent',
                  borderLeft: active ? `3px solid ${roleColor}` : '3px solid transparent',
                  fontWeight: active ? 600 : 500,
                  fontSize: '0.875rem',
                  textDecoration: 'none',
                  transition: 'var(--transition)',
                  whiteSpace: 'nowrap',
                  overflow: 'hidden',
                }}
                onMouseEnter={e => { if (!active) { e.currentTarget.style.background = 'var(--bg-card)'; e.currentTarget.style.color = 'var(--text-primary)' }}}
                onMouseLeave={e => { if (!active) { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = 'var(--text-secondary)' }}}
              >
                <span style={{ fontSize: '1.15rem', flexShrink: 0, display: 'flex' }}>{item.icon}</span>
                {!collapsed && <span style={{ overflow: 'hidden', textOverflow: 'ellipsis' }}>{item.label}</span>}
              </NavLink>
            )
          })}
        </nav>

        {/* User footer */}
        <div style={{
          padding: '0.875rem 0.75rem',
          borderTop: '1px solid var(--border)',
          display: 'flex',
          alignItems: 'center',
          gap: '0.75rem',
          overflow: 'hidden',
        }}>
          <div style={{
            width: 36, height: 36, borderRadius: 'var(--radius-md)', flexShrink: 0,
            background: bgColor,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: '0.8rem', fontWeight: 700, color: '#fff',
          }}>
            {initials}
          </div>
          {!collapsed && (
            <div style={{ flex: 1, overflow: 'hidden' }}>
              <div style={{ fontSize: '0.82rem', fontWeight: 600, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                {user?.full_name || user?.username}
              </div>
              <span style={{
                fontSize: '0.68rem', fontWeight: 600, textTransform: 'uppercase',
                color: roleColor, letterSpacing: '0.04em',
              }}>
                {user?.role}
              </span>
            </div>
          )}
        </div>
      </aside>
    </>
  )
}
