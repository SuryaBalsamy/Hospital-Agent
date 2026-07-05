import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import DashboardLayout from '../../components/layout/DashboardLayout'
import Card from '../../components/common/Card'
import Badge from '../../components/common/Badge'
import Button from '../../components/common/Button'
import { doctorService } from '../../services/doctorService'
import { formatTime } from '../../utils/helpers'

export default function TodayAppointments() {
  const [appointments, setAppointments] = useState([])
  const [loading, setLoading] = useState(true)
  const navigate = useNavigate()

  useEffect(() => {
    fetchAppointments()
  }, [])

  const fetchAppointments = () => {
    setLoading(true)
    doctorService.getTodayAppointments()
      .then(r => setAppointments(r.data))
      .catch(() => {})
      .finally(() => setLoading(false))
  }

  const handleStartConsultation = (appointmentId) => {
    // Navigate to active consultation workspace
    navigate(`/doctor/consultation?appointment_id=${appointmentId}`)
  }

  return (
    <DashboardLayout>
      <Card 
        title="Today's Appointments" 
        subtitle={new Date().toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long' })}
      >
        {loading ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            {[1, 2, 3].map(i => <div key={i} className="skeleton" style={{ height: 56 }} />)}
          </div>
        ) : appointments.length === 0 ? (
          <div className="empty-state">
            <div className="empty-state-icon">📅</div>
            <h3>No Appointments Today</h3>
            <p>Your schedule is clear for today.</p>
          </div>
        ) : (
          <div className="table-wrapper">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Token</th>
                  <th>Patient</th>
                  <th>Time</th>
                  <th>Wait (min)</th>
                  <th>Status</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {appointments.map((a) => (
                  <tr key={a.appointment_id}>
                    <td>
                      <span className="badge badge-primary">{a.token_number || `#${a.appointment_id}`}</span>
                    </td>
                    <td style={{ fontWeight: 600, color: 'var(--text-primary)' }}>
                      {a.patient?.full_name || `Patient #${a.patient_id}`}
                    </td>
                    <td>{formatTime(a.appointment_time)}</td>
                    <td>{a.status === 'BOOKED' || a.status === 'WAITING' ? (a.estimated_wait_minutes ?? '—') : '—'}</td>
                    <td><Badge status={a.status} /></td>
                    <td>
                      {a.status === 'WAITING' ? (
                        <Button 
                          variant="primary" 
                          size="sm" 
                          onClick={() => handleStartConsultation(a.appointment_id)}
                        >
                          Start Consultation
                        </Button>
                      ) : a.status === 'IN_CONSULTATION' ? (
                        <Button 
                          variant="warning" 
                          size="sm" 
                          onClick={() => handleStartConsultation(a.appointment_id)}
                        >
                          Resume Consultation
                        </Button>
                      ) : a.status === 'COMPLETED' ? (
                        <span style={{ fontSize: '0.85rem', color: 'var(--success)', fontWeight: 600 }}>Consulted</span>
                      ) : (
                        <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Waiting for Check-in</span>
                      )}
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
