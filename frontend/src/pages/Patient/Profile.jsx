import { useEffect, useState } from 'react'
import DashboardLayout from '../../components/layout/DashboardLayout'
import Card from '../../components/common/Card'
import Button from '../../components/common/Button'
import { useAuth } from '../../context/AuthContext'
import { patientService } from '../../services/patientService'
import { getInitials, avatarColor } from '../../utils/helpers'

const FIELDS = [
  { name: 'full_name',         label: 'Full Name',          type: 'text', col: 2 },
  { name: 'phone',             label: 'Phone',              type: 'tel',  col: 1 },
  { name: 'dob',               label: 'Date of Birth',      type: 'date', col: 1 },
  { name: 'address',           label: 'Address',            type: 'textarea', col: 2 },
  { name: 'emergency_contact', label: 'Emergency Contact',  type: 'tel',  col: 1 },
  { name: 'blood_group',       label: 'Blood Group',        type: 'select', options: ['','A+','A-','B+','B-','AB+','AB-','O+','O-'], col: 1 },
  { name: 'allergies',         label: 'Allergies',          type: 'textarea', col: 2 },
  { name: 'medical_history',   label: 'Medical History',    type: 'textarea', col: 2 },
]

export default function Profile() {
  const { user, updateUser } = useAuth()
  const [profile, setProfile] = useState(null)
  const [form, setForm]       = useState({})
  const [loading, setLoading] = useState(true)
  const [saving, setSaving]   = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError]     = useState('')

  useEffect(() => {
    patientService.getProfile().then(r => {
      setProfile(r.data)
      setForm(r.data)
    }).catch(() => {}).finally(() => setLoading(false))
  }, [])

  const handleChange = e => setForm(f => ({ ...f, [e.target.name]: e.target.value }))

  const handleSave = async e => {
    e.preventDefault()
    setSaving(true); setError(''); setSuccess(false)
    try {
      await patientService.updateProfile(form)
      updateUser({ full_name: form.full_name })
      setSuccess(true)
      setTimeout(() => setSuccess(false), 3000)
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to update profile.')
    } finally { setSaving(false) }
  }

  const initials = getInitials(form.full_name || user?.username)
  const bg       = avatarColor(form.full_name || user?.username)

  return (
    <DashboardLayout>
      <div style={{ maxWidth: 720, margin: '0 auto' }}>
        {/* Avatar header */}
        <div className="card" style={{ display: 'flex', alignItems: 'center', gap: '1.5rem', marginBottom: '1.5rem' }}>
          <div style={{
            width: 80, height: 80, borderRadius: 'var(--radius-lg)',
            background: bg, display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: '1.75rem', fontWeight: 700, color: '#fff', flexShrink: 0,
            boxShadow: 'var(--shadow-md)',
          }}>{initials}</div>
          <div>
            <h2 style={{ margin: 0 }}>{form.full_name || user?.username}</h2>
            <p style={{ margin: '0.25rem 0 0', color: 'var(--text-muted)', fontSize: '0.85rem' }}>
              Patient · @{user?.username}
            </p>
            {form.blood_group && (
              <span className="badge badge-danger" style={{ marginTop: '0.5rem' }}>
                🩸 {form.blood_group}
              </span>
            )}
          </div>
        </div>

        {/* Form */}
        <Card title="Edit Profile" subtitle="Update your personal information">
          {success && <div className="alert alert-success" style={{ marginBottom: '1.25rem' }}>✅ Profile updated successfully!</div>}
          {error   && <div className="alert alert-error"   style={{ marginBottom: '1.25rem' }}>⚠️ {error}</div>}

          {loading ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {[1,2,3,4].map(i => <div key={i} className="skeleton" style={{ height: 46 }} />)}
            </div>
          ) : (
            <form onSubmit={handleSave}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.25rem' }}>
                {FIELDS.map(f => (
                  <div key={f.name} className="form-group" style={{ gridColumn: `span ${f.col}` }}>
                    <label className="form-label">{f.label}</label>
                    {f.type === 'select' ? (
                      <select name={f.name} className="form-input" value={form[f.name] || ''} onChange={handleChange}>
                        {f.options.map(o => <option key={o} value={o}>{o || 'Select'}</option>)}
                      </select>
                    ) : f.type === 'textarea' ? (
                      <textarea name={f.name} className="form-input" rows={2} value={form[f.name] || ''} onChange={handleChange} />
                    ) : (
                      <input name={f.name} type={f.type} className="form-input" value={form[f.name] || ''} onChange={handleChange} />
                    )}
                  </div>
                ))}
              </div>
              <div style={{ marginTop: '1.5rem', display: 'flex', gap: '0.75rem', justifyContent: 'flex-end' }}>
                <Button type="button" variant="secondary" onClick={() => setForm(profile)}>Reset</Button>
                <Button type="submit" variant="primary" loading={saving}>Save Changes</Button>
              </div>
            </form>
          )}
        </Card>
      </div>
    </DashboardLayout>
  )
}
