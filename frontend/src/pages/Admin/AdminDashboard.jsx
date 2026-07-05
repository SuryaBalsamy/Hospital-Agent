import { useEffect, useState } from 'react'
import DashboardLayout from '../../components/layout/DashboardLayout'
import StatCard from '../../components/common/StatCard'
import Card from '../../components/common/Card'
import { adminService } from '../../services/adminService'
import { HiUserGroup, HiUsers, HiBuildingOffice2, HiCalendar } from 'react-icons/hi2'

export default function AdminDashboard() {
  const [stats, setStats]     = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    adminService.getDashboardStats().then(r => setStats(r.data)).catch(() => {}).finally(() => setLoading(false))
  }, [])

  return (
    <DashboardLayout>
      <div style={{
        background: 'linear-gradient(135deg, rgba(99,102,241,0.1), rgba(14,165,233,0.06))',
        border: '1px solid var(--border)', borderRadius: 'var(--radius-xl)',
        padding: '1.75rem 2rem', marginBottom: '1.75rem',
      }}>
        <p style={{ color: 'var(--accent)', fontWeight: 600, fontSize: '0.85rem', marginBottom: '0.25rem' }}>Overview</p>
        <h2 style={{ margin: 0 }}>System Dashboard</h2>
        <p style={{ marginTop: '0.3rem', color: 'var(--text-muted)', fontSize: '0.85rem' }}>Hospital Administration Portal</p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1.25rem', marginBottom: '1.75rem' }}>
        <StatCard title="Total Patients"     value={loading ? null : stats?.total_patients}     icon={<HiUsers />}           color="var(--primary)" loading={loading} />
        <StatCard title="Total Doctors"      value={loading ? null : stats?.total_doctors}      icon={<HiUserGroup />}       color="var(--success)" loading={loading} />
        <StatCard title="Departments"        value={loading ? null : stats?.total_departments}  icon={<HiBuildingOffice2 />} color="var(--warning)" loading={loading} />
        <StatCard title="Today Appointments" value={loading ? null : stats?.today_appointments} icon={<HiCalendar />}        color="var(--accent)"  loading={loading} />
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
        <Card title="Quick Links" subtitle="Manage hospital resources">
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
            {[{n:'Doctors', l:'/admin/doctors', c:'var(--success)', i:'👨‍⚕️'}, {n:'Receptionists', l:'/admin/receptionists', c:'var(--warning)', i:'👩‍💼'}, {n:'Departments', l:'/admin/departments', c:'var(--primary)', i:'🏢'}, {n:'Hospital Info', l:'/admin/hospital-info', c:'var(--accent)', i:'ℹ️'}].map(link => (
              <a key={link.n} href={link.l} style={{
                display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '1rem',
                background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 'var(--radius-md)',
                textDecoration: 'none', color: 'var(--text-primary)', fontWeight: 600, fontSize: '0.9rem',
                transition: 'var(--transition)'
              }}
              onMouseEnter={e => { e.currentTarget.style.borderColor = link.c; e.currentTarget.style.boxShadow = 'var(--shadow-glow)' }}
              onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border)'; e.currentTarget.style.boxShadow = 'none' }}>
                <span style={{ fontSize: '1.5rem' }}>{link.i}</span> {link.n}
              </a>
            ))}
          </div>
        </Card>

        <Card title="System Alerts" subtitle="Recent administrative notifications">
          <div className="empty-state">
            <div className="empty-state-icon" style={{ fontSize: '2rem' }}>✅</div>
            <h3 style={{ fontSize: '1rem' }}>All Systems Operational</h3>
            <p style={{ fontSize: '0.8rem' }}>No critical alerts or warnings today.</p>
          </div>
        </Card>
      </div>
    </DashboardLayout>
  )
}
