import { useEffect, useState } from 'react'
import DashboardLayout from '../../components/layout/DashboardLayout'
import StatCard from '../../components/common/StatCard'
import Card from '../../components/common/Card'
import Badge from '../../components/common/Badge'
import { useAuth } from '../../context/AuthContext'
import { patientService } from '../../services/patientService'
import { getGreeting, formatDate, formatTime } from '../../utils/helpers'
import { HiCalendar, HiBell, HiSparkles, HiUser } from 'react-icons/hi2'
import { Link } from 'react-router-dom'

export default function PatientDashboard() {
  const { user } = useAuth()
  const [profile, setProfile]             = useState(null)
  const [appointments, setAppointments]   = useState([])
  const [notifications, setNotifications] = useState([])
  const [loading, setLoading]             = useState(true)

  useEffect(() => {
    Promise.all([
      patientService.getProfile(),
      patientService.getAppointments(),
      patientService.getNotifications(),
    ]).then(([p, a, n]) => {
      setProfile(p.data)
      setAppointments(a.data)
      setNotifications(n.data)
    }).catch(() => {}).finally(() => setLoading(false))
  }, [])

  const upcoming  = appointments.filter(a => ['BOOKED','WAITING','CHECKED_IN'].includes(a.status))
  const unread    = notifications.filter(n => !n.is_read)

  const QUICK_ACTIONS = [
    { icon: '🤖', label: 'AI Assistant',     to: '/patient/ai-assistant',  color: 'var(--accent)' },
    { icon: '📅', label: 'Book Appointment', to: '/patient/appointments',  color: 'var(--primary)' },
    { icon: '🔔', label: 'Notifications',    to: '/patient/notifications', color: 'var(--warning)' },
    { icon: '👤', label: 'My Profile',       to: '/patient/profile',       color: 'var(--success)' },
  ]

  return (
    <DashboardLayout>
      {/* Welcome banner */}
      <div style={{
        background: 'linear-gradient(135deg, rgba(14,165,233,0.12), rgba(99,102,241,0.08))',
        border: '1px solid var(--border)', borderRadius: 'var(--radius-xl)',
        padding: '1.75rem 2rem', marginBottom: '1.75rem',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        flexWrap: 'wrap', gap: '1rem',
      }}>
        <div>
          <p style={{ color: 'var(--primary)', fontWeight: 600, fontSize: '0.85rem', marginBottom: '0.25rem' }}>
            {getGreeting()} 👋
          </p>
          <h2 style={{ margin: 0, fontSize: '1.4rem' }}>
            {profile?.full_name || user?.full_name || user?.username}
          </h2>
          <p style={{ marginTop: '0.25rem', color: 'var(--text-muted)', fontSize: '0.85rem' }}>
            Here's your health overview for today
          </p>
        </div>
        <Link to="/patient/ai-assistant" className="btn btn-primary">
          <HiSparkles /> Ask AI Assistant
        </Link>
      </div>

      {/* Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '1rem', marginBottom: '1.75rem' }}>
        <StatCard title="Total Appointments" value={loading ? null : appointments.length} icon={<HiCalendar />} loading={loading} />
        <StatCard title="Upcoming"           value={loading ? null : upcoming.length}      icon="⏳" color="var(--warning)" loading={loading} />
        <StatCard title="Notifications"      value={loading ? null : unread.length}        icon={<HiBell />} color="var(--accent)" loading={loading} />
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
        {/* Quick actions */}
        <Card title="Quick Actions">
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
            {QUICK_ACTIONS.map(a => (
              <Link key={a.to} to={a.to} style={{
                display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.5rem',
                background: 'var(--bg-card)', border: '1px solid var(--border)',
                borderRadius: 'var(--radius-md)', padding: '1.25rem 0.75rem',
                transition: 'var(--transition)', textDecoration: 'none',
              }}
              onMouseEnter={e => { e.currentTarget.style.borderColor = a.color; e.currentTarget.style.background = `${a.color}10` }}
              onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border)'; e.currentTarget.style.background = 'var(--bg-card)' }}>
                <span style={{ fontSize: '1.75rem' }}>{a.icon}</span>
                <span style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-secondary)' }}>{a.label}</span>
              </Link>
            ))}
          </div>
        </Card>

        {/* Recent appointments */}
        <Card title="Recent Appointments" subtitle={`${appointments.length} total`}>
          {loading ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              {[1,2,3].map(i => <div key={i} className="skeleton" style={{ height: 48 }} />)}
            </div>
          ) : appointments.length === 0 ? (
            <div className="empty-state">
              <div className="empty-state-icon">📅</div>
              <h3>No appointments yet</h3>
              <p>Your appointments will appear here</p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
              {appointments.slice(0, 4).map(a => (
                <div key={a.appointment_id} style={{
                  display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                  padding: '0.75rem', background: 'var(--bg-card)', borderRadius: 'var(--radius-md)',
                }}>
                  <div>
                    <div style={{ fontWeight: 600, fontSize: '0.85rem' }}>
                      {a.doctor?.doctor_name || `Doctor #${a.doctor_id}`}
                    </div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                      {formatDate(a.appointment_date)} · {formatTime(a.appointment_time)}
                    </div>
                  </div>
                  <Badge status={a.status} />
                </div>
              ))}
            </div>
          )}
        </Card>
      </div>
    </DashboardLayout>
  )
}
