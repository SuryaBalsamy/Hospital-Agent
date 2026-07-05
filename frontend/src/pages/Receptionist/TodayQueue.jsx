import { useEffect, useState } from 'react'
import DashboardLayout from '../../components/layout/DashboardLayout'
import Card from '../../components/common/Card'
import Badge from '../../components/common/Badge'
import { receptionistService } from '../../services/adminService'
import { formatTime } from '../../utils/helpers'

export default function TodayQueue() {
  const [queue, setQueue]     = useState([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter]   = useState('ALL')
  const [actionLoading, setActionLoading] = useState(false)

  useEffect(() => {
    fetchQueue()
  }, [])

  const fetchQueue = () => {
    setLoading(true)
    receptionistService.getTodayQueue()
      .then(r => setQueue(r.data))
      .catch(() => {})
      .finally(() => setLoading(false))
  }

  const handleManualCheckIn = async (appointmentId) => {
    setActionLoading(true)
    try {
      await receptionistService.checkInPatient(appointmentId)
      alert("Patient checked in and moved to doctor's queue successfully.")
      fetchQueue()
    } catch (err) {
      alert(err.response?.data?.detail || "Failed to complete check-in.")
    } finally {
      setActionLoading(false)
    }
  }

  const filtered = filter === 'ALL' ? queue : queue.filter(a => a.status === filter)

  return (
    <DashboardLayout>
      <Card 
        title="Today's Queue Manager" 
        subtitle={new Date().toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long' })}
        action={
          <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap' }}>
            {['ALL', 'BOOKED', 'WAITING', 'IN_CONSULTATION', 'COMPLETED', 'CANCELLED'].map(s => (
              <button 
                key={s} 
                className={`btn btn-sm ${filter === s ? 'btn-primary' : 'btn-secondary'}`} 
                onClick={() => setFilter(s)}
              >
                {s === 'ALL' ? 'All' : s.replace('_', ' ')}
              </button>
            ))}
          </div>
        }
      >
        {loading ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            {[1, 2, 3, 4].map(i => <div key={i} className="skeleton" style={{ height: 56 }} />)}
          </div>
        ) : filtered.length === 0 ? (
          <div className="empty-state">
            <div className="empty-state-icon">📋</div>
            <h3>No Queue Entries</h3>
            <p>No appointments found in the database for the selected status.</p>
          </div>
        ) : (
          <div className="table-wrapper">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Token</th>
                  <th>Patient</th>
                  <th>Doctor</th>
                  <th>Time</th>
                  <th>Est. Wait</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map(a => (
                  <tr key={a.appointment_id}>
                    <td>
                      <span className="badge badge-primary">{a.token_number || `#${a.appointment_id}`}</span>
                    </td>
                    <td style={{ fontWeight: 600, color: 'var(--text-primary)' }}>
                      {a.patient?.full_name || `Patient #${a.patient_id}`}
                    </td>
                    <td style={{ color: 'var(--text-secondary)' }}>
                      {a.doctor?.doctor_name || `Doctor #${a.doctor_id}`}
                    </td>
                    <td>{formatTime(a.appointment_time)}</td>
                    <td>{a.status === 'BOOKED' || a.status === 'WAITING' ? `${a.estimated_wait_minutes} min` : '—'}</td>
                    <td><Badge status={a.status} /></td>
                    <td>
                      <div style={{ display: 'flex', gap: '0.4rem' }}>
                        {a.status === 'BOOKED' ? (
                          <button 
                            className="btn btn-success btn-sm" 
                            disabled={actionLoading}
                            onClick={() => handleManualCheckIn(a.appointment_id)}
                          >
                            Check In
                          </button>
                        ) : (
                          <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Checked In</span>
                        )}
                      </div>
                    </td>
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
