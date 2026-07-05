import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { getRoleDashboard } from '../../utils/helpers'
import { HiUser, HiLockClosed, HiEye, HiEyeSlash } from 'react-icons/hi2'
import './auth.css'

const LogoIcon = ({ size = 48 }) => (
  <svg width={size} height={size} viewBox="0 0 42 42" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ flexShrink: 0 }}>
    <defs>
      <linearGradient id="hc-gradient-login" x1="0" y1="0" x2="42" y2="42" gradientUnits="userSpaceOnUse">
        <stop offset="0%" stopColor="#2563EB" />
        <stop offset="100%" stopColor="#06B6D4" />
      </linearGradient>
    </defs>
    <rect width="42" height="42" rx="10" fill="url(#hc-gradient-login)" />
    <path d="M15 21H27M21 15V27" stroke="#FFFFFF" strokeWidth="3" strokeLinecap="round" />
    <path d="M10 32H13L16 27L18 37L21 23L23 35L26 31L28 32H32" stroke="#FFFFFF" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" opacity="0.75" />
    <circle cx="15" cy="15" r="1" fill="#FFFFFF" opacity="0.6" />
    <circle cx="27" cy="15" r="1" fill="#FFFFFF" opacity="0.6" />
    <circle cx="15" cy="27" r="1" fill="#FFFFFF" opacity="0.6" />
    <circle cx="27" cy="27" r="1" fill="#FFFFFF" opacity="0.6" />
  </svg>
)

export default function LoginPage() {
  const { login } = useAuth()
  const navigate   = useNavigate()
  const [form, setForm]       = useState({ username: '', password: '' })
  const [showPass, setShowPass] = useState(false)
  const [loading, setLoading]  = useState(false)
  const [error, setError]      = useState('')

  const handleChange = e => setForm(f => ({ ...f, [e.target.name]: e.target.value }))

  const handleSubmit = async e => {
    e.preventDefault()
    if (!form.username || !form.password) { setError('Please fill in all fields.'); return }
    setError(''); setLoading(true)
    try {
      const data = await login(form)
      navigate(getRoleDashboard(data.role), { replace: true })
    } catch (err) {
      setError(err.response?.data?.detail || 'Invalid username or password.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="auth-page">
      {/* Left panel */}
      <div className="auth-panel-left">
        <div className="auth-panel-bg">
          <div className="auth-orb auth-orb-1" />
          <div className="auth-orb auth-orb-2" />
        </div>
        <div className="auth-panel-content">
          <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '1.5rem' }}>
            <LogoIcon size={80} />
          </div>
          <h2 className="auth-panel-title">HorizonCare AI Medical Center</h2>
          <p className="auth-panel-sub">Smart Healthcare. Human Care.</p>
          <div className="auth-trust-badges">
            {[
              { icon: '🔒', text: 'Secure & Private Health Records' },
              { icon: '🤖', text: 'AI-Powered Orchestration' },
              { icon: '📅', text: 'Real-time Slot Booking' },
            ].map(b => (
              <div key={b.text} className="trust-badge">
                <span>{b.icon}</span> {b.text}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Right form */}
      <div className="auth-panel-right">
        <div className="auth-form-card">
          <div className="auth-form-header">
            <h1 className="auth-form-title">Welcome Back</h1>
            <p className="auth-form-sub">Sign in to your hospital portal</p>
          </div>

          {error && (
            <div className="alert alert-error" style={{ marginBottom: '1.25rem' }}>
              ⚠️ {error}
            </div>
          )}

          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            <div className="form-group">
              <label className="form-label">Username</label>
              <div className="input-wrapper">
                <HiUser className="input-icon" />
                <input
                  name="username" type="text" id="username"
                  className="form-input has-icon"
                  placeholder="Enter your username"
                  value={form.username} onChange={handleChange}
                  autoComplete="username"
                />
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Password</label>
              <div className="input-wrapper">
                <HiLockClosed className="input-icon" />
                <input
                  name="password" type={showPass ? 'text' : 'password'} id="password"
                  className="form-input has-icon has-icon-right"
                  placeholder="Enter your password"
                  value={form.password} onChange={handleChange}
                  autoComplete="current-password"
                />
                <button type="button" className="input-icon-right" onClick={() => setShowPass(s => !s)}
                  style={{ background: 'none', border: 'none', cursor: 'pointer', display: 'flex' }}>
                  {showPass ? <HiEyeSlash /> : <HiEye />}
                </button>
              </div>
            </div>

            <button
              type="submit" className="btn btn-primary btn-full btn-lg"
              disabled={loading}
              style={{ marginTop: '0.5rem' }}
            >
              {loading ? <><div className="spinner spinner-sm" /> Signing in...</> : 'Sign In'}
            </button>
          </form>

          <div className="auth-form-footer">
            <p>Don't have an account? <Link to="/register">Create one →</Link></p>
            <Link to="/" className="auth-back-link">← Back to Home</Link>
          </div>
        </div>
      </div>
    </div>
  )
}
