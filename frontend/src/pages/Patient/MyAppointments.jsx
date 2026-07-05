import { useEffect, useState } from 'react'
import DashboardLayout from '../../components/layout/DashboardLayout'
import Card from '../../components/common/Card'
import Badge from '../../components/common/Badge'
import Button from '../../components/common/Button'
import { patientService } from '../../services/patientService'
import { formatDate, formatTime } from '../../utils/helpers'

export default function MyAppointments() {
  const [appointments, setAppointments] = useState([])
  const [loading, setLoading] = useState(true)
  const [bookingMode, setBookingMode] = useState(false) // false | 'book' | 'reschedule' | 'confirm'
  
  // Reschedule target
  const [rescheduleTarget, setRescheduleTarget] = useState(null)

  // Booking states
  const [departments, setDepartments] = useState([])
  const [doctors, setDoctors] = useState([])
  const [availabilities, setAvailabilities] = useState([])
  const [selectedDept, setSelectedDept] = useState('')
  const [selectedDoctor, setSelectedDoctor] = useState(null)
  const [selectedAvailability, setSelectedAvailability] = useState(null)
  
  const [bookingDate, setBookingDate] = useState('')
  const [bookingTime, setBookingTime] = useState('')
  const [confirmedApp, setConfirmedApp] = useState(null)
  const [formError, setFormError] = useState('')
  const [bookingLoading, setBookingLoading] = useState(false)

  useEffect(() => {
    fetchAppointments()
  }, [])

  const fetchAppointments = () => {
    setLoading(true)
    patientService.getAppointments()
      .then(r => setAppointments(r.data))
      .catch(() => {})
      .finally(() => setLoading(false))
  }

  const startBooking = async () => {
    setFormError('')
    setBookingLoading(true)
    try {
      const r = await patientService.getDepartments()
      setDepartments(r.data)
      setBookingMode('book')
    } catch (err) {
      setFormError('Failed to load departments')
    } finally {
      setBookingLoading(false)
    }
  }

  const handleDeptSelect = async (deptId) => {
    setSelectedDept(deptId)
    setSelectedDoctor(null)
    setSelectedAvailability(null)
    setAvailabilities([])
    setDoctors([])
    setBookingLoading(true)
    try {
      const r = await patientService.getDoctorsByDept(deptId)
      setDoctors(r.data)
    } catch {
      setFormError('Failed to load doctors')
    } finally {
      setBookingLoading(false)
    }
  }

  const handleDoctorSelect = async (doc) => {
    setSelectedDoctor(doc)
    setSelectedAvailability(null)
    setBookingLoading(true)
    try {
      const r = await patientService.getAvailabilities(doc.doctor_id)
      setAvailabilities(r.data)
    } catch {
      setFormError('Failed to load doctor availability')
    } finally {
      setBookingLoading(false)
    }
  }

  const handleBook = async (e) => {
    e.preventDefault()
    if (!selectedDoctor || !selectedAvailability || !bookingDate || !bookingTime) {
      setFormError('All fields are required')
      return
    }
    setFormError('')
    setBookingLoading(true)
    try {
      const payload = {
        doctor_id: selectedDoctor.doctor_id,
        availability_id: selectedAvailability.availability_id,
        appointment_date: bookingDate,
        appointment_time: bookingTime
      }
      const r = await patientService.bookAppointment(payload)
      setConfirmedApp(r.data)
      setBookingMode('confirm')
      fetchAppointments()
    } catch (err) {
      setFormError(err.response?.data?.detail || 'Double-booking or scheduling conflict detected. Please select another slot.')
    } finally {
      setBookingLoading(false)
    }
  }

  const handleCancel = async (appId) => {
    if (!window.confirm('Are you sure you want to cancel this appointment?')) return
    try {
      await patientService.cancelAppointment(appId)
      alert('Appointment cancelled successfully.')
      fetchAppointments()
    } catch (err) {
      alert(err.response?.data?.detail || 'Failed to cancel appointment')
    }
  }

  const startReschedule = async (app) => {
    setRescheduleTarget(app)
    setSelectedDoctor(app.doctor)
    setBookingDate(app.appointment_date)
    setBookingTime(app.appointment_time)
    setFormError('')
    setBookingLoading(true)
    try {
      const r = await patientService.getAvailabilities(app.doctor_id)
      setAvailabilities(r.data)
      // Auto select matching availability
      const match = r.data.find(a => a.availability_id === app.availability_id)
      setSelectedAvailability(match || r.data[0])
      setBookingMode('reschedule')
    } catch {
      setFormError('Failed to load rescheduling information')
    } finally {
      setBookingLoading(false)
    }
  }

  const handleRescheduleSubmit = async (e) => {
    e.preventDefault()
    setFormError('')
    setBookingLoading(true)
    try {
      const payload = {
        availability_id: selectedAvailability.availability_id,
        appointment_date: bookingDate,
        appointment_time: bookingTime
      }
      const r = await patientService.rescheduleAppointment(rescheduleTarget.appointment_id, payload)
      alert('Rescheduled successfully!')
      setBookingMode(false)
      setRescheduleTarget(null)
      fetchAppointments()
    } catch (err) {
      setFormError(err.response?.data?.detail || 'Slot conflict or unavailable date/time.')
    } finally {
      setBookingLoading(false)
    }
  }

  if (bookingMode === 'confirm' && confirmedApp) {
    const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=180x180&bgcolor=1e293b&color=0ea5e9&data=${confirmedApp.qr_value}`
    return (
      <DashboardLayout>
        <div style={{ maxWidth: 500, margin: '0 auto' }}>
          <Card title="Booking Confirmed" subtitle="Show this token at the reception desk">
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1.25rem', textAlign: 'center', padding: '1rem 0' }}>
              <div style={{
                background: 'var(--bg-surface)', padding: '1.25rem', borderRadius: 'var(--radius-lg)',
                border: '1px solid var(--primary-glow)', boxShadow: 'var(--shadow-glow)'
              }}>
                <img src={qrUrl} alt="Appointment QR Code" style={{ width: 180, height: 180, display: 'block' }} />
              </div>
              <div>
                <span className="badge badge-success" style={{ fontSize: '1.1rem', padding: '0.4rem 1rem' }}>
                  Token: {confirmedApp.token_number}
                </span>
              </div>
              <div style={{ width: '100%', borderTop: '1px solid var(--border)', paddingTop: '1rem', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', textAlign: 'left', fontSize: '0.9rem' }}>
                <div>
                  <span style={{ color: 'var(--text-muted)' }}>Doctor:</span>
                  <p style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{selectedDoctor?.doctor_name}</p>
                </div>
                <div>
                  <span style={{ color: 'var(--text-muted)' }}>Department:</span>
                  <p style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{selectedDoctor?.department?.department_name || 'General Medicine'}</p>
                </div>
                <div>
                  <span style={{ color: 'var(--text-muted)' }}>Date:</span>
                  <p style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{formatDate(confirmedApp.appointment_date)}</p>
                </div>
                <div>
                  <span style={{ color: 'var(--text-muted)' }}>Time:</span>
                  <p style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{formatTime(confirmedApp.appointment_time)}</p>
                </div>
              </div>
              <Button variant="primary" fullWidth onClick={() => setBookingMode(false)}>Done</Button>
            </div>
          </Card>
        </div>
      </DashboardLayout>
    )
  }

  if (bookingMode === 'book' || bookingMode === 'reschedule') {
    return (
      <DashboardLayout>
        <div style={{ maxWidth: 650, margin: '0 auto' }}>
          <Card 
            title={bookingMode === 'book' ? "Book Appointment" : "Reschedule Appointment"} 
            subtitle={bookingMode === 'book' ? "Select department, doctor, and schedule" : `Rescheduling with ${selectedDoctor?.doctor_name}`}
          >
            {formError && (
              <div style={{ background: 'rgba(239, 68, 68, 0.1)', border: '1px solid var(--danger)', color: 'var(--danger)', padding: '0.75rem 1rem', borderRadius: 'var(--radius-sm)', marginBottom: '1.25rem', fontSize: '0.875rem' }}>
                ⚠️ {formError}
              </div>
            )}

            <form onSubmit={bookingMode === 'book' ? handleBook : handleRescheduleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              {bookingMode === 'book' && (
                <>
                  <div className="input-group">
                    <label className="form-label">Select Department</label>
                    <select className="form-input" value={selectedDept} onChange={(e) => handleDeptSelect(e.target.value)}>
                      <option value="">-- Select Department --</option>
                      {departments.map(d => <option key={d.department_id} value={d.department_id}>{d.department_name}</option>)}
                    </select>
                  </div>

                  {selectedDept && (
                    <div className="input-group">
                      <label className="form-label">Select Doctor</label>
                      <select className="form-input" value={selectedDoctor?.doctor_id || ''} onChange={(e) => {
                        const doc = doctors.find(d => d.doctor_id === parseInt(e.target.value))
                        if (doc) handleDoctorSelect(doc)
                      }}>
                        <option value="">-- Select Doctor --</option>
                        {doctors.map(d => <option key={d.doctor_id} value={d.doctor_id}>{d.doctor_name} ({d.specialization})</option>)}
                      </select>
                    </div>
                  )}
                </>
              )}

              {selectedDoctor && (
                <>
                  <div className="input-group">
                    <label className="form-label">Doctor Schedule Availability</label>
                    <div style={{ padding: '0.75rem', background: 'var(--bg-surface)', border: '1px solid var(--border)', borderRadius: 'var(--radius-md)', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                      {availabilities.length === 0 ? (
                        <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', margin: 0 }}>No regular hours scheduled. Admin will allocate shortly.</p>
                      ) : (
                        availabilities.map(av => (
                          <div key={av.availability_id} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem' }}>
                            <span style={{ fontWeight: 600, color: 'var(--primary)' }}>{av.day_of_week}</span>
                            <span style={{ color: 'var(--text-secondary)' }}>{formatTime(av.start_time)} - {formatTime(av.end_time)}</span>
                          </div>
                        ))
                      )}
                    </div>
                  </div>

                  {availabilities.length > 0 && (
                    <>
                      <div className="input-group">
                        <label className="form-label">Select Availability Rule Block</label>
                        <select className="form-input" value={selectedAvailability?.availability_id || ''} onChange={(e) => {
                          const av = availabilities.find(a => a.availability_id === parseInt(e.target.value))
                          setSelectedAvailability(av)
                        }}>
                          <option value="">-- Select Block --</option>
                          {availabilities.map(av => (
                            <option key={av.availability_id} value={av.availability_id}>
                              {av.day_of_week} ({formatTime(av.start_time)} - {formatTime(av.end_time)})
                            </option>
                          ))}
                        </select>
                      </div>

                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                        <div className="input-group">
                          <label className="form-label">Date</label>
                          <input type="date" className="form-input" value={bookingDate} onChange={(e) => setBookingDate(e.target.value)} />
                        </div>
                        <div className="input-group">
                          <label className="form-label">Time</label>
                          <input type="time" className="form-input" value={bookingTime} onChange={(e) => setBookingTime(e.target.value)} />
                        </div>
                      </div>
                    </>
                  )}
                </>
              )}

              <div style={{ display: 'flex', gap: '1rem', marginTop: '1rem' }}>
                <Button type="button" variant="secondary" onClick={() => {
                  setBookingMode(false)
                  setRescheduleTarget(null)
                }} style={{ flex: 1 }}>Cancel</Button>
                <Button type="submit" variant="primary" loading={bookingLoading} disabled={bookingLoading} style={{ flex: 2 }}>
                  {bookingMode === 'book' ? 'Confirm Booking' : 'Update Appointment'}
                </Button>
              </div>
            </form>
          </Card>
        </div>
      </DashboardLayout>
    )
  }

  return (
    <DashboardLayout>
      <Card title="My Appointments" subtitle="Track and manage your scheduled hospital visits"
        action={<Button variant="primary" size="sm" onClick={startBooking}>+ Book Appointment</Button>}>
        {loading ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            {[1, 2, 3].map(i => <div key={i} className="skeleton" style={{ height: 56 }} />)}
          </div>
        ) : appointments.length === 0 ? (
          <div className="empty-state">
            <div className="empty-state-icon">📅</div>
            <h3>No Appointments Yet</h3>
            <p>You don't have any appointments scheduled. Click '+ Book Appointment' to schedule one.</p>
          </div>
        ) : (
          <div className="table-wrapper">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Token</th>
                  <th>Doctor</th>
                  <th>Date</th>
                  <th>Time</th>
                  <th>Queue Pos</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {appointments.map(a => (
                  <tr key={a.appointment_id}>
                    <td>
                      <span className="badge badge-primary">{a.token_number || `#${a.appointment_id}`}</span>
                    </td>
                    <td style={{ fontWeight: 600, color: 'var(--text-primary)' }}>
                      {a.doctor?.doctor_name || `Doctor #${a.doctor_id}`}
                    </td>
                    <td>{formatDate(a.appointment_date)}</td>
                    <td>{formatTime(a.appointment_time)}</td>
                    <td style={{ textAlign: 'center' }}>{a.queue_position || '—'}</td>
                    <td><Badge status={a.status} /></td>
                    <td>
                      <div style={{ display: 'flex', gap: '0.4rem' }}>
                        {a.status === 'BOOKED' && (
                          <>
                            <button className="btn btn-secondary btn-sm" onClick={() => startReschedule(a)}>Reschedule</button>
                            <button className="btn btn-danger btn-sm" onClick={() => handleCancel(a.appointment_id)}>Cancel</button>
                          </>
                        )}
                        {a.status === 'COMPLETED' && (
                          <button className="btn btn-ghost btn-sm" onClick={() => {
                            if (a.consultation_note) {
                              alert(`Diagnosis: ${a.consultation_note.diagnosis}\nPrescription: ${a.consultation_note.prescription}`)
                            } else {
                              alert("Consultation completed. Details loading.")
                            }
                          }}>View Rx</button>
                        )}
                        {(a.status === 'CANCELLED' || a.status === 'WAITING' || a.status === 'IN_CONSULTATION') && (
                          <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>No Actions</span>
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
