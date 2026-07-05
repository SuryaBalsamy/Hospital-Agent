import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { HiUser, HiEnvelope, HiLockClosed, HiPhone, HiEye, HiEyeSlash } from 'react-icons/hi2'
import './auth.css'

const ROLES = [
  { value: 'PATIENT',      label: 'Patient',      icon: '🧑‍🤒', desc: 'Book appointments & manage health' },
  { value: 'DOCTOR',       label: 'Doctor',       icon: '👨‍⚕️', desc: 'Manage consultations & patients' },
  { value: 'RECEPTIONIST', label: 'Receptionist', icon: '👩‍💼', desc: 'Handle queue & check-ins' },
  { value: 'ADMIN',        label: 'Admin',        icon: '🔧', desc: 'Manage hospital operations' },
]

const LogoIcon = ({ size = 48 }) => (
  <svg width={size} height={size} viewBox="0 0 42 42" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ flexShrink: 0 }}>
    <defs>
      <linearGradient id="hc-gradient-reg" x1="0" y1="0" x2="42" y2="42" gradientUnits="userSpaceOnUse">
        <stop offset="0%" stopColor="#2563EB" />
        <stop offset="100%" stopColor="#06B6D4" />
      </linearGradient>
    </defs>
    <rect width="42" height="42" rx="10" fill="url(#hc-gradient-reg)" />
    <path d="M15 21H27M21 15V27" stroke="#FFFFFF" strokeWidth="3" strokeLinecap="round" />
    <path d="M10 32H13L16 27L18 37L21 23L23 35L26 31L28 32H32" stroke="#FFFFFF" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" opacity="0.75" />
    <circle cx="15" cy="15" r="1" fill="#FFFFFF" opacity="0.6" />
    <circle cx="27" cy="15" r="1" fill="#FFFFFF" opacity="0.6" />
    <circle cx="15" cy="27" r="1" fill="#FFFFFF" opacity="0.6" />
    <circle cx="27" cy="27" r="1" fill="#FFFFFF" opacity="0.6" />
  </svg>
)

export default function RegisterPage() {
  const { register } = useAuth()
  const navigate      = useNavigate()
  const [role, setRole]     = useState('PATIENT')
  const [showPass, setShowPass] = useState(false)
  const [loading, setLoading]   = useState(false)
  const [error, setError]       = useState('')
  const [success, setSuccess]   = useState(false)
  const [form, setForm] = useState({
    full_name: '', username: '', email: '', password: '', confirm_password: '',
    phone: '', dob: '', gender: '', blood_group: '',
  })

  const handleChange = e => setForm(f => ({ ...f, [e.target.name]: e.target.value }))

  const handleSubmit = async e => {
    e.preventDefault()
    setError('')
    if (!form.full_name || !form.username || !form.email || !form.password) {
      setError('Please fill in all required fields.'); return
    }
    if (form.password !== form.confirm_password) {
      setError('Passwords do not match.'); return
    }
    if (form.password.length < 6) {
      setError('Password must be at least 6 characters.'); return
    }
    setLoading(true)
    try {
      await register({
        username: form.username, email: form.email, password: form.password,
        role, full_name: form.full_name, phone: form.phone || undefined,
        dob: form.dob || undefined, gender: form.gender || undefined,
        blood_group: form.blood_group || undefined,
      })
      setSuccess(true)
      setTimeout(() => navigate('/login'), 2000)
    } catch (err) {
      setError(err.response?.data?.detail || 'Registration failed. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="auth-page" style={{ alignItems: 'flex-start', overflowY: 'auto' }}>
      <div className="auth-panel-left" style={{ height: '100%' }}>
        <div className="auth-panel-bg">
          <div className="auth-orb auth-orb-1" />
          <div className="auth-orb auth-orb-2" />
        </div>
        <div className="auth-panel-content">
          <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '1.5rem' }}>
            <LogoIcon size={80} />
          </div>
          <h2 className="auth-panel-title">Join HorizonCare</h2>
          <p className="auth-panel-sub">Create your account in seconds and access intelligent medical orchestration services.</p>
          <div className="auth-trust-badges">
            {[
              { icon: '🔒', text: 'Secure & Private' },
              { icon: '✅', text: 'Free to register' },
              { icon: '📱', text: 'Access anywhere' }
            ].map(b => (
              <div key={b.text} className="trust-badge"><span>{b.icon}</span> {b.text}</div>
            ))}
          </div>
        </div>
      </div>

      <div className="auth-panel-right" style={{ overflowY: 'auto', padding: '2rem 1.5rem' }}>
        <div className="auth-form-card" style={{ maxWidth: 520, margin: '0 auto' }}>
          <div className="auth-form-header">
            <h1 className="auth-form-title">Create Account</h1>
            <p className="auth-form-sub">Select your role and fill in your details</p>
          </div>

          {success && (
            <div className="alert alert-success" style={{ marginBottom: '1.25rem' }}>
              ✅ Registration successful! Redirecting to login...
            </div>
          )}
          {error && (
            <div className="alert alert-error" style={{ marginBottom: '1.25rem' }}>
              ⚠️ {error}
            </div>
          )}

          {/* Role selector */}
          <div style={{ marginBottom: '1.5rem' }}>
            <p className="form-label" style={{ marginBottom: '0.75rem' }}>I am registering as</p>
            <div className="role-grid">
              {ROLES.map(r => (
                <button key={r.value} type="button"
                  className={`role-card ${role === r.value ? 'role-card-active' : ''}`}
                  onClick={() => setRole(r.value)}
                >
                  <span className="role-icon">{r.icon}</span>
                  <span className="role-label">{r.label}</span>
                  <span className="role-desc">{r.desc}</span>
                </button>
              ))}
            </div>
          </div>

          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              <div className="form-group">
                <label className="form-label">Full Name *</label>
                <div className="input-wrapper">
                  <HiUser className="input-icon" />
                  <input name="full_name" type="text" className="form-input has-icon"
                    placeholder="John Doe" value={form.full_name} onChange={handleChange} />
                </div>
              </div>
              <div className="form-group">
                <label className="form-label">Username *</label>
                <div className="input-wrapper">
                  <span className="input-icon" style={{ fontSize: '0.85rem' }}>@</span>
                  <input name="username" type="text" className="form-input has-icon"
                    placeholder="johndoe" value={form.username} onChange={handleChange} />
                </div>
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Email Address *</label>
              <div className="input-wrapper">
                <HiEnvelope className="input-icon" />
                <input name="email" type="email" className="form-input has-icon"
                  placeholder="john@example.com" value={form.email} onChange={handleChange} />
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Phone Number</label>
              <div className="input-wrapper">
                <HiPhone className="input-icon" />
                <input name="phone" type="tel" className="form-input has-icon"
                  placeholder="+91 9876543210" value={form.phone} onChange={handleChange} />
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              <div className="form-group">
                <label className="form-label">Password *</label>
                <div className="input-wrapper">
                  <HiLockClosed className="input-icon" />
                  <input name="password" type={showPass ? 'text' : 'password'} className="form-input has-icon has-icon-right"
                    placeholder="Min. 6 characters" value={form.password} onChange={handleChange} />
                  <button type="button" className="input-icon-right" onClick={() => setShowPass(s => !s)}
                    style={{ background: 'none', border: 'none', cursor: 'pointer', display: 'flex' }}>
                    {showPass ? <HiEyeSlash /> : <HiEye />}
                  </button>
                </div>
              </div>
              <div className="form-group">
                <label className="form-label">Confirm Password *</label>
                <div className="input-wrapper">
                  <HiLockClosed className="input-icon" />
                  <input name="confirm_password" type="password" className="form-input has-icon"
                    placeholder="Repeat password" value={form.confirm_password} onChange={handleChange} />
                </div>
              </div>
            </div>

            {/* Patient-specific fields */}
            {role === 'PATIENT' && (
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '1rem' }}>
                <div className="form-group">
                  <label className="form-label">Date of Birth</label>
                  <input name="dob" type="date" className="form-input"
                    value={form.dob} onChange={handleChange} />
                </div>
                <div className="form-group">
                  <label className="form-label">Gender</label>
                  <select name="gender" className="form-input" value={form.gender} onChange={handleChange}>
                    <option value="">Select</option>
                    <option value="MALE">Male</option>
                    <option value="FEMALE">Female</option>
                    <option value="OTHER">Other</option>
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label">Blood Group</label>
                  <select name="blood_group" className="form-input" value={form.blood_group} onChange={handleChange}>
                    <option value="">Select</option>
                    {['A+','A-','B+','B-','AB+','AB-','O+','O-'].map(bg => (
                      <option key={bg} value={bg}>{bg}</option>
                    ))}
                  </select>
                </div>
              </div>
            )}

            <button type="submit" className="btn btn-primary btn-full btn-lg"
              disabled={loading} style={{ marginTop: '0.5rem' }}>
              {loading ? <><div className="spinner spinner-sm" /> Creating account...</> : 'Create Account'}
            </button>
          </form>

          <div className="auth-form-footer">
            <p>Already have an account? <Link to="/login">Sign in →</Link></p>
            <Link to="/" className="auth-back-link">← Back to Home</Link>
          </div>
        </div>
      </div>
    </div>
  )
}
