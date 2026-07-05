import { useEffect, useState } from 'react'
import DashboardLayout from '../../components/layout/DashboardLayout'
import StatCard from '../../components/common/StatCard'
import Card from '../../components/common/Card'
import Badge from '../../components/common/Badge'
import { useAuth } from '../../context/AuthContext'
import { doctorService } from '../../services/doctorService'
import { getGreeting, formatTime } from '../../utils/helpers'
import { HiCalendar, HiCheckCircle, HiClock } from 'react-icons/hi2'

export default function DoctorDashboard() {
  const { user } = useAuth()
  const [profile, setProfile]           = useState(null)
  const [appointments, setAppointments] = useState([])
  const [upcoming, setUpcoming]         = useState([])
  const [activeTab, setActiveTab]       = useState('today') // 'today' or 'upcoming'
  const [loading, setLoading]           = useState(true)

  useEffect(() => {
    Promise.all([
      doctorService.getProfile(),
      doctorService.getTodayAppointments(),
      doctorService.getUpcomingAppointments()
    ])
      .then(([p, a, u]) => { 
        setProfile(p.data); 
        setAppointments(a.data); 
        setUpcoming(u.data);
      })
      .catch(() => {}).finally(() => setLoading(false))
  }, [])

  const completed = appointments.filter(a => a.status === 'COMPLETED').length
  const pending   = appointments.filter(a => ['BOOKED','WAITING','CHECKED_IN','IN_CONSULTATION'].includes(a.status)).length

  const currentList = activeTab === 'today' ? appointments : upcoming

  return (
    <DashboardLayout>
      <div style={{
        background: 'linear-gradient(135deg, rgba(16,185,129,0.1), rgba(14,165,233,0.06))',
        border: '1px solid var(--border)', borderRadius: 'var(--radius-xl)',
        padding: '1.75rem 2rem', marginBottom: '1.75rem',
      }}>
        <p style={{ color: 'var(--success)', fontWeight: 600, fontSize: '0.85rem', marginBottom: '0.25rem' }}>{getGreeting()} 👋</p>
        <h2 style={{ margin: 0 }}>{profile?.doctor_name || user?.full_name || user?.username}</h2>
        <p style={{ marginTop: '0.3rem', color: 'var(--text-muted)', fontSize: '0.85rem' }}>
          {profile?.specialization && `${profile.specialization} · `}{profile?.qualification}
        </p>
        <p style={{ marginTop: '0.25rem', color: 'var(--text-muted)', fontSize: '0.82rem' }}>
          🏥 Room {profile?.room_number || '—'}
        </p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '1rem', marginBottom: '1.75rem' }}>
        <StatCard title="Today's Appointments" value={loading ? null : appointments.length} icon={<HiCalendar />} loading={loading} />
        <StatCard title="Total Upcoming"       value={loading ? null : upcoming.length}       icon={<HiCalendar />} color="var(--primary)" loading={loading} />
        <StatCard title="Completed (Today)"    value={loading ? null : completed}             icon={<HiCheckCircle />} color="var(--success)" loading={loading} />
      </div>

      <Card>
        {/* Header Tabs */}
        <div style={{ display: 'flex', borderBottom: '1px solid var(--border)', marginBottom: '1rem', gap: '1.5rem' }}>
          <button 
            onClick={() => setActiveTab('today')}
            style={{
              background: 'none', border: 'none', borderBottom: activeTab === 'today' ? '2px solid var(--success)' : '2px solid transparent',
              color: activeTab === 'today' ? 'var(--text-primary)' : 'var(--text-muted)',
              padding: '0.5rem 0.25rem', fontSize: '0.95rem', fontWeight: 600, cursor: 'pointer', transition: 'all 0.2s'
            }}
          >
            Today's Schedule ({appointments.length})
          </button>
          <button 
            onClick={() => setActiveTab('upcoming')}
            style={{
              background: 'none', border: 'none', borderBottom: activeTab === 'upcoming' ? '2px solid var(--success)' : '2px solid transparent',
              color: activeTab === 'upcoming' ? 'var(--text-primary)' : 'var(--text-muted)',
              padding: '0.5rem 0.25rem', fontSize: '0.95rem', fontWeight: 600, cursor: 'pointer', transition: 'all 0.2s'
            }}
          >
            Upcoming Schedule ({upcoming.length})
          </button>
        </div>

        {loading ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            {[1,2,3].map(i => <div key={i} className="skeleton" style={{ height: 56 }} />)}
          </div>
        ) : currentList.length === 0 ? (
          <div className="empty-state">
            <div className="empty-state-icon">📅</div>
            <h3>No Appointments Found</h3>
            <p>Your schedule is clear for this view.</p>
          </div>
        ) : (
          <div className="table-wrapper">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Token</th>
                  <th>Patient</th>
                  {activeTab === 'upcoming' && <th>Date</th>}
                  <th>Time</th>
                  <th>Queue</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {currentList.map(a => (
                  <tr key={a.appointment_id}>
                    <td><span className="badge badge-primary">{a.token_number || `#${a.appointment_id}`}</span></td>
                    <td style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{a.patient?.full_name || `Patient #${a.patient_id}`}</td>
                    {activeTab === 'upcoming' && <td>{new Date(a.appointment_date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}</td>}
                    <td>{formatTime(a.appointment_time)}</td>
                    <td>{a.queue_position ?? '—'}</td>
                    <td><Badge status={a.status} /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>
    </DashboardLayout>
  )
}
