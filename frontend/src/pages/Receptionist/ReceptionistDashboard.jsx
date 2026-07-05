import { useEffect, useState } from 'react'
import DashboardLayout from '../../components/layout/DashboardLayout'
import StatCard from '../../components/common/StatCard'
import Card from '../../components/common/Card'
import Badge from '../../components/common/Badge'
import { useAuth } from '../../context/AuthContext'
import { receptionistService } from '../../services/adminService'
import { getGreeting, formatTime } from '../../utils/helpers'

export default function ReceptionistDashboard() {
  const { user } = useAuth()
  const [queue, setQueue]     = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    receptionistService.getTodayQueue()
      .then(r => setQueue(r.data)).catch(() => {}).finally(() => setLoading(false))
  }, [])

  const checkedIn = queue.filter(a => a.status === 'CHECKED_IN').length
  const waiting   = queue.filter(a => a.status === 'WAITING').length
  const completed = queue.filter(a => a.status === 'COMPLETED').length

  return (
    <DashboardLayout>
      <div style={{
        background: 'linear-gradient(135deg, rgba(245,158,11,0.1), rgba(14,165,233,0.06))',
        border: '1px solid var(--border)', borderRadius: 'var(--radius-xl)',
        padding: '1.75rem 2rem', marginBottom: '1.75rem',
      }}>
        <p style={{ color: 'var(--warning)', fontWeight: 600, fontSize: '0.85rem', marginBottom: '0.25rem' }}>{getGreeting()} 👋</p>
        <h2 style={{ margin: 0 }}>{user?.full_name || user?.username}</h2>
        <p style={{ marginTop: '0.3rem', color: 'var(--text-muted)', fontSize: '0.85rem' }}>Receptionist · Main Desk</p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: '1rem', marginBottom: '1.75rem' }}>
        <StatCard title="Total Queue"  value={loading ? null : queue.length}    icon="👥" loading={loading} />
        <StatCard title="Checked In"   value={loading ? null : checkedIn}        icon="✅" color="var(--accent)"   loading={loading} />
        <StatCard title="Waiting"      value={loading ? null : waiting}           icon="⏳" color="var(--warning)"  loading={loading} />
        <StatCard title="Completed"    value={loading ? null : completed}         icon="🏁" color="var(--success)"  loading={loading} />
      </div>

      <Card title="Today's Queue" subtitle="All appointments across all doctors">
        {loading ? (
          <div style={{ display:'flex', flexDirection:'column', gap:'0.75rem' }}>
            {[1,2,3].map(i => <div key={i} className="skeleton" style={{height:56}} />)}
          </div>
        ) : queue.length === 0 ? (
          <div className="empty-state"><div className="empty-state-icon">📋</div><h3>No Queue Today</h3><p>No appointments scheduled for today.</p></div>
        ) : (
          <div className="table-wrapper">
            <table className="data-table">
              <thead><tr><th>Token</th><th>Patient</th><th>Doctor</th><th>Time</th><th>Status</th><th>Action</th></tr></thead>
              <tbody>
                {queue.map(a => (
                  <tr key={a.appointment_id}>
                    <td><span className="badge badge-primary">{a.token_number || `#${a.appointment_id}`}</span></td>
                    <td style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{a.patient?.full_name || `Patient #${a.patient_id}`}</td>
                    <td style={{ color: 'var(--text-secondary)' }}>{a.doctor?.doctor_name || `Doctor #${a.doctor_id}`}</td>
                    <td>{formatTime(a.appointment_time)}</td>
                    <td><Badge status={a.status} /></td>
                    <td><button className="btn btn-primary btn-sm">Check In</button></td>
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
