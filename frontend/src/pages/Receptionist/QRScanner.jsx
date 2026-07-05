import { useState } from 'react'
import DashboardLayout from '../../components/layout/DashboardLayout'
import Card from '../../components/common/Card'
import Button from '../../components/common/Button'
import Badge from '../../components/common/Badge'
import { receptionistService } from '../../services/adminService'
import { formatDate, formatTime } from '../../utils/helpers'

export default function QRScanner() {
  const [tokenInput, setTokenInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [appointment, setAppointment] = useState(null)
  const [errorMsg, setErrorMsg] = useState('')
  const [successMsg, setSuccessMsg] = useState('')

  const handleLookup = async (tokenValue) => {
    const val = tokenValue || tokenInput
    if (!val.trim()) return
    setLoading(true)
    setErrorMsg('')
    setSuccessMsg('')
    setAppointment(null)
    try {
      const r = await receptionistService.getAppointmentByToken(val.trim())
      setAppointment(r.data)
    } catch (err) {
      setErrorMsg('No active appointment found matching that token/QR code.')
    } finally {
      setLoading(false)
    }
  }

  const handleCheckIn = async () => {
    if (!appointment) return
    setLoading(true)
    setErrorMsg('')
    try {
      const r = await receptionistService.checkInPatient(appointment.appointment_id)
      setSuccessMsg(`Patient checked in successfully! Placed in waiting queue at position #${r.data.queue_position}.`)
      setAppointment(r.data) // Update UI state with new status (WAITING)
    } catch (err) {
      setErrorMsg(err.response?.data?.detail || 'Failed to complete check-in.')
    } finally {
      setLoading(false)
    }
  }

  const triggerSimulation = () => {
    const mockToken = prompt("Enter a valid Token or QR UUID to simulate a camera scan (e.g. from the Patient confirmation page):")
    if (mockToken) {
      setTokenInput(mockToken)
      handleLookup(mockToken)
    }
  }

  return (
    <DashboardLayout>
      <div style={{ maxWidth: 600, margin: '0 auto' }}>
        <Card title="QR Scanner & Patient Check-in" subtitle="Check in patients using appointment QR codes or manual tokens">
          
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1.5rem', padding: '1rem 0' }}>
            
            {/* Camera / Scan Frame Area */}
            <div style={{ position: 'relative', width: 200, height: 200 }}>
              <div 
                onClick={triggerSimulation}
                style={{
                  width: '100%', height: '100%', borderRadius: 'var(--radius-lg)',
                  border: '2px dashed var(--primary)', display: 'flex',
                  flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
                  fontSize: '1.25rem', background: 'var(--primary-glow)',
                  cursor: 'pointer', textAlign: 'center', padding: '1rem',
                  transition: 'var(--transition)',
                }}
                onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--accent)' }}
                onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--primary)' }}
              >
                <span style={{ fontSize: '3rem', marginBottom: '0.5rem' }}>📷</span>
                <span style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--primary)' }}>Click to Simulate Camera Scan</span>
              </div>
              
              {/* Corner accents */}
              {[['0','0'],['0','auto'],['auto','0'],['auto','auto']].map(([t,b], i) => (
                <div key={i} style={{
                  position: 'absolute',
                  top: t !== 'auto' ? -2 : 'auto', bottom: b !== 'auto' ? -2 : 'auto',
                  left: i < 2 ? -2 : 'auto', right: i >= 2 ? -2 : 'auto',
                  width: 20, height: 20,
                  borderTop: (i === 0 || i === 2) ? `3px solid var(--primary)` : 'none',
                  borderBottom: (i === 1 || i === 3) ? `3px solid var(--primary)` : 'none',
                  borderLeft: (i === 0 || i === 1) ? `3px solid var(--primary)` : 'none',
                  borderRight: (i === 2 || i === 3) ? `3px solid var(--primary)` : 'none',
                }} />
              ))}
            </div>

            {/* Input field */}
            <div style={{ width: '100%', display: 'flex', gap: '0.75rem' }}>
              <input 
                className="form-input" 
                placeholder="Or enter Token (e.g. TKN-1-...) manually..." 
                value={tokenInput}
                onChange={e => setTokenInput(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && handleLookup()}
                style={{ flex: 1 }}
              />
              <Button variant="primary" onClick={() => handleLookup()} loading={loading}>Look Up</Button>
            </div>

            {/* Notifications */}
            {errorMsg && (
              <div style={{ width: '100%', background: 'rgba(239, 68, 68, 0.1)', border: '1px solid var(--danger)', color: 'var(--danger)', padding: '0.75rem 1rem', borderRadius: 'var(--radius-sm)', fontSize: '0.85rem' }}>
                ⚠️ {errorMsg}
              </div>
            )}

            {successMsg && (
              <div style={{ width: '100%', background: 'rgba(16, 185, 129, 0.1)', border: '1px solid var(--success)', color: 'var(--success)', padding: '0.75rem 1rem', borderRadius: 'var(--radius-sm)', fontSize: '0.85rem' }}>
                ✅ {successMsg}
              </div>
            )}

            {/* Appointment Record Details Card */}
            {appointment && (
              <div style={{
                width: '100%', background: 'var(--bg-surface)', border: '1px solid var(--border)',
                borderRadius: 'var(--radius-lg)', padding: '1.25rem', marginTop: '0.5rem'
              }}>
                <h4 style={{ margin: '0 0 1rem 0', color: 'var(--primary)', borderBottom: '1px solid var(--border)', paddingBottom: '0.5rem' }}>
                  Appointment Record Verified
                </h4>
                
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', fontSize: '0.9rem', marginBottom: '1.25rem' }}>
                  <div>
                    <span style={{ color: 'var(--text-muted)' }}>Patient Name:</span>
                    <p style={{ fontWeight: 600, color: 'var(--text-primary)', margin: '0.2rem 0 0 0' }}>
                      {appointment.patient?.full_name}
                    </p>
                  </div>
                  <div>
                    <span style={{ color: 'var(--text-muted)' }}>Doctor:</span>
                    <p style={{ fontWeight: 600, color: 'var(--text-primary)', margin: '0.2rem 0 0 0' }}>
                      {appointment.doctor?.doctor_name}
                    </p>
                  </div>
                  <div>
                    <span style={{ color: 'var(--text-muted)' }}>Date & Time:</span>
                    <p style={{ fontWeight: 600, color: 'var(--text-primary)', margin: '0.2rem 0 0 0' }}>
                      {formatDate(appointment.appointment_date)} at {formatTime(appointment.appointment_time)}
                    </p>
                  </div>
                  <div>
                    <span style={{ color: 'var(--text-muted)' }}>Current Status:</span>
                    <div style={{ margin: '0.2rem 0 0 0' }}><Badge status={appointment.status} /></div>
                  </div>
                </div>

                {appointment.status === 'BOOKED' ? (
                  <Button variant="success" fullWidth onClick={handleCheckIn} loading={loading}>
                    Confirm Check In & Move to Waiting Queue
                  </Button>
                ) : (
                  <div style={{ textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.85rem', padding: '0.5rem 0', borderTop: '1px solid var(--border)' }}>
                    Patient has already checked in and is currently {appointment.status.replace('_', ' ')}.
                  </div>
                )}
              </div>
            )}
          </div>

        </Card>
      </div>
    </DashboardLayout>
  )
}
