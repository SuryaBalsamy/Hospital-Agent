import { useEffect, useState } from 'react'
import { useSearchParams, useNavigate } from 'react-router-dom'
import DashboardLayout from '../../components/layout/DashboardLayout'
import Card from '../../components/common/Card'
import Button from '../../components/common/Button'
import Badge from '../../components/common/Badge'
import { doctorService } from '../../services/doctorService'
import { formatDate } from '../../utils/helpers'

export default function Consultation() {
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const appointmentId = searchParams.get('appointment_id')

  const [queue, setQueue] = useState([])
  const [loading, setLoading] = useState(true)
  const [activeApp, setActiveApp] = useState(null)
  
  // Form states
  const [diagnosis, setDiagnosis] = useState('')
  const [prescription, setPrescription] = useState('')
  const [doctorNotes, setDoctorNotes] = useState('')
  const [followUpRequired, setFollowUpRequired] = useState(false)
  const [followUpDate, setFollowUpDate] = useState('')
  
  const [submitting, setSubmitting] = useState(false)
  const [errorMsg, setErrorMsg] = useState('')
  const [success, setSuccess] = useState(false)

  useEffect(() => {
    fetchQueueAndSetAppointment()
  }, [appointmentId])

  const fetchQueueAndSetAppointment = async () => {
    setLoading(true)
    setErrorMsg('')
    try {
      const r = await doctorService.getWaitingQueue()
      setQueue(r.data)
      
      if (appointmentId) {
        const app = r.data.find(a => a.appointment_id === parseInt(appointmentId))
        if (app) {
          setActiveApp(app)
        } else {
          // If not in waiting queue, maybe it is already completed or invalid
          setErrorMsg("Selected appointment is either not checked in, completed, or does not belong to your schedule.")
        }
      } else {
        setActiveApp(null)
      }
    } catch {
      setErrorMsg("Failed to load queue details.")
    } finally {
      setLoading(false)
    }
  }

  const handleStart = async () => {
    if (!activeApp) return
    setLoading(true)
    setErrorMsg('')
    try {
      const r = await doctorService.startConsultation(activeApp.appointment_id)
      setActiveApp(r.data)
    } catch (err) {
      setErrorMsg(err.response?.data?.detail || "Failed to start consultation.")
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!diagnosis.trim() || !prescription.trim()) {
      setErrorMsg("Diagnosis and Prescription are required.")
      return
    }

    setSubmitting(true)
    setErrorMsg('')
    try {
      const payload = {
        diagnosis,
        prescription,
        doctor_notes: doctorNotes,
        follow_up_required: followUpRequired,
        follow_up_date: followUpRequired ? followUpDate || null : null
      }
      await doctorService.endConsultation(activeApp.appointment_id, payload)
      setSuccess(true)
    } catch (err) {
      setErrorMsg(err.response?.data?.detail || "Failed to submit consultation details.")
    } finally {
      setSubmitting(false)
    }
  }

  if (success) {
    return (
      <DashboardLayout>
        <div style={{ maxWidth: 500, margin: '2rem auto' }}>
          <Card title="Consultation Completed">
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1.25rem', padding: '2rem 0', textAlign: 'center' }}>
              <span style={{ fontSize: '4rem' }}>✅</span>
              <h3>Prescription Saved!</h3>
              <p style={{ color: 'var(--text-muted)' }}>
                The appointment has been marked as Completed, and a notification has been sent to the patient.
              </p>
              <Button variant="primary" onClick={() => navigate('/doctor/today-appointments')}>
                Back to Appointments
              </Button>
            </div>
          </Card>
        </div>
      </DashboardLayout>
    )
  }

  return (
    <DashboardLayout>
      {errorMsg && (
        <div style={{ background: 'rgba(239, 68, 68, 0.1)', border: '1px solid var(--danger)', color: 'var(--danger)', padding: '0.75rem 1rem', borderRadius: 'var(--radius-sm)', marginBottom: '1.25rem', fontSize: '0.85rem' }}>
          ⚠️ {errorMsg}
        </div>
      )}

      {loading ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          {[1, 2, 3].map(i => <div key={i} className="skeleton" style={{ height: 120 }} />)}
        </div>
      ) : !activeApp ? (
        <Card title="Active Consultation Workspace" subtitle="Select a checked-in patient from the waiting queue to begin">
          {queue.length === 0 ? (
            <div className="empty-state">
              <div className="empty-state-icon">🩺</div>
              <h3>Waiting Queue is Empty</h3>
              <p>No patients are currently checked in and waiting. They will show up here once checked in by the reception.</p>
            </div>
          ) : (
            <div className="table-wrapper">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Token</th>
                    <th>Patient Name</th>
                    <th>Wait Time</th>
                    <th>Status</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {queue.map(a => (
                    <tr key={a.appointment_id}>
                      <td><span className="badge badge-primary">{a.token_number}</span></td>
                      <td style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{a.patient?.full_name}</td>
                      <td>{a.estimated_wait_minutes} mins</td>
                      <td><Badge status={a.status} /></td>
                      <td>
                        <Button variant="primary" size="sm" onClick={() => navigate(`/doctor/consultation?appointment_id=${a.appointment_id}`)}>
                          {a.status === 'IN_CONSULTATION' ? 'Resume' : 'Select'}
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </Card>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '1.5rem', alignItems: 'start' }}>
          
          {/* Patient Details Profile Sidecard */}
          <Card title="Patient Profile" subtitle="Medical Background">
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', fontSize: '0.9rem' }}>
              <div>
                <span style={{ color: 'var(--text-muted)' }}>Full Name</span>
                <p style={{ fontWeight: 600, color: 'var(--text-primary)', margin: '0.1rem 0 0 0' }}>{activeApp.patient?.full_name}</p>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem' }}>
                <div>
                  <span style={{ color: 'var(--text-muted)' }}>DOB</span>
                  <p style={{ fontWeight: 600, color: 'var(--text-primary)', margin: '0.1rem 0 0 0' }}>{activeApp.patient?.dob ? formatDate(activeApp.patient.dob) : '—'}</p>
                </div>
                <div>
                  <span style={{ color: 'var(--text-muted)' }}>Blood Group</span>
                  <p style={{ fontWeight: 600, color: 'var(--danger)', margin: '0.1rem 0 0 0' }}>🩸 {activeApp.patient?.blood_group || '—'}</p>
                </div>
              </div>
              <div>
                <span style={{ color: 'var(--text-muted)' }}>Allergies</span>
                <p style={{ fontWeight: 500, color: 'var(--danger)', margin: '0.1rem 0 0 0' }}>{activeApp.patient?.allergies || 'None reported'}</p>
              </div>
              <div>
                <span style={{ color: 'var(--text-muted)' }}>Medical History</span>
                <p style={{ fontWeight: 500, color: 'var(--text-primary)', margin: '0.1rem 0 0 0' }}>{activeApp.patient?.medical_history || 'No recorded history'}</p>
              </div>
              <div style={{ borderTop: '1px solid var(--border)', paddingTop: '1rem' }}>
                <span style={{ color: 'var(--text-muted)' }}>Appointment Status:</span>
                <div style={{ marginTop: '0.25rem' }}><Badge status={activeApp.status} /></div>
              </div>
              <Button variant="secondary" size="sm" onClick={() => navigate('/doctor/today-appointments')}>
                ⬅ Back to Queue
              </Button>
            </div>
          </Card>

          {/* Consultation Workspace Form */}
          <Card title="Consultation Details" subtitle={`Active Patient: ${activeApp.patient?.full_name}`}>
            {activeApp.status === 'WAITING' ? (
              <div style={{ padding: '2rem 1rem', textAlign: 'center' }}>
                <p style={{ color: 'var(--text-secondary)', marginBottom: '1.5rem' }}>
                  The patient is checked in and waiting. Click below to start the consultation timer and load inputs.
                </p>
                <Button variant="primary" onClick={handleStart}>
                  🩺 Start Consultation
                </Button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                
                <div className="input-group">
                  <label className="form-label">Diagnosis *</label>
                  <input 
                    className="form-input" 
                    placeholder="E.g. Acute Viral Bronchitis / Hypertension Grade I"
                    value={diagnosis}
                    onChange={e => setDiagnosis(e.target.value)}
                    required
                  />
                </div>

                <div className="input-group">
                  <label className="form-label">Prescription (Rx) *</label>
                  <textarea 
                    className="form-input" 
                    rows={4}
                    placeholder="E.g. Tab. Paracetamol 650mg - 1-0-1 - Post Meals - 5 Days&#10;Syp. Cough Relief - 10ml - Thrice Daily"
                    value={prescription}
                    onChange={e => setPrescription(e.target.value)}
                    required
                    style={{ resize: 'vertical' }}
                  />
                </div>

                <div className="input-group">
                  <label className="form-label">Doctor Notes</label>
                  <textarea 
                    className="form-input" 
                    rows={3}
                    placeholder="General observations, vitals, or tests recommended..."
                    value={doctorNotes}
                    onChange={e => setDoctorNotes(e.target.value)}
                    style={{ resize: 'vertical' }}
                  />
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', padding: '0.75rem', background: 'var(--bg-surface)', border: '1px solid var(--border)', borderRadius: 'var(--radius-md)' }}>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer', fontSize: '0.9rem', fontWeight: 600 }}>
                    <input 
                      type="checkbox" 
                      checked={followUpRequired} 
                      onChange={e => setFollowUpRequired(e.target.checked)} 
                    />
                    Follow-up Required Advice
                  </label>
                  {followUpRequired && (
                    <div className="input-group" style={{ marginTop: '0.25rem' }}>
                      <label className="form-label">Follow-up Date</label>
                      <input 
                        type="date" 
                        className="form-input" 
                        value={followUpDate}
                        onChange={e => setFollowUpDate(e.target.value)}
                      />
                    </div>
                  )}
                </div>

                <div style={{ marginTop: '1rem' }}>
                  <Button type="submit" variant="success" fullWidth loading={submitting} disabled={submitting}>
                    🏁 Complete Consultation & Issue Prescription
                  </Button>
                </div>
              </form>
            )}
          </Card>

        </div>
      )}
    </DashboardLayout>
  )
}
