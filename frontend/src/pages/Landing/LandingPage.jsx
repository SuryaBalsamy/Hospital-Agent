import { Link } from 'react-router-dom'
import './landing.css'

const DEPARTMENTS = [
  { name: 'Cardiology',      icon: '❤️', floor: '2nd Floor', block: 'Block A', desc: 'Expert heart care and cardiovascular treatment' },
  { name: 'Dermatology',     icon: '✨', floor: '3rd Floor', block: 'Block A', desc: 'Advanced skin, hair, and nail treatments' },
  { name: 'Orthopedics',     icon: '🦴', floor: '1st Floor', block: 'Block B', desc: 'Bone, joint, and musculoskeletal care' },
  { name: 'Neurology',       icon: '🧠', floor: '2nd Floor', block: 'Block B', desc: 'Brain, spine, and nervous system disorders' },
  { name: 'General Medicine', icon: '🩺', floor: '1st Floor', block: 'Block A', desc: 'Comprehensive primary and preventive care' },
]

const FEATURES = [
  { icon: '👨‍⚕️', title: 'Expert Doctors',       desc: '50+ qualified specialists across 5 departments' },
  { icon: '🚨', title: '24/7 Emergency',         desc: 'Round-the-clock emergency medical services' },
  { icon: '🤖', title: 'Smart Queue System',     desc: 'AI-powered queue management reduces wait time' },
  { icon: '📋', title: 'Digital Records',        desc: 'Secure, instant access to your medical history' },
  { icon: '📅', title: 'Easy Booking',           desc: 'Book appointments in seconds via app or web' },
  { icon: '💊', title: 'Personalized Care',      desc: 'Tailored treatment plans for every patient' },
]

const LogoIcon = ({ size = 40 }) => (
  <svg width={size} height={size} viewBox="0 0 42 42" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ flexShrink: 0 }}>
    <defs>
      <linearGradient id="hc-gradient-landing" x1="0" y1="0" x2="42" y2="42" gradientUnits="userSpaceOnUse">
        <stop offset="0%" stopColor="#2563EB" />
        <stop offset="100%" stopColor="#06B6D4" />
      </linearGradient>
    </defs>
    <rect width="42" height="42" rx="10" fill="url(#hc-gradient-landing)" />
    <path d="M15 21H27M21 15V27" stroke="#FFFFFF" strokeWidth="3" strokeLinecap="round" />
    <path d="M10 32H13L16 27L18 37L21 23L23 35L26 31L28 32H32" stroke="#FFFFFF" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" opacity="0.75" />
    <circle cx="15" cy="15" r="1" fill="#FFFFFF" opacity="0.6" />
    <circle cx="27" cy="15" r="1" fill="#FFFFFF" opacity="0.6" />
    <circle cx="15" cy="27" r="1" fill="#FFFFFF" opacity="0.6" />
    <circle cx="27" cy="27" r="1" fill="#FFFFFF" opacity="0.6" />
  </svg>
)

export default function LandingPage() {
  return (
    <div className="landing">
      {/* Navbar */}
      <nav className="landing-nav">
        <div className="landing-nav-inner">
          <div className="landing-logo">
            <LogoIcon size={42} />
            <div>
              <div className="landing-logo-name">HorizonCare AI</div>
              <div className="landing-logo-sub">Medical Center</div>
            </div>
          </div>
          <div className="landing-nav-links">
            <a href="#departments">Departments</a>
            <a href="#features">Features</a>
            <a href="#about">About</a>
          </div>
          <div className="landing-nav-actions">
            <Link to="/login" className="btn btn-secondary btn-sm">Sign In</Link>
            <Link to="/register" className="btn btn-primary btn-sm">Register</Link>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="hero">
        <div className="hero-bg">
          <div className="hero-orb hero-orb-1" />
          <div className="hero-orb hero-orb-2" />
          <div className="hero-orb hero-orb-3" />
          <div className="hero-grid" />
        </div>
        <div className="hero-content">
          <div className="hero-badge">
            <span>✨</span> AI-Powered Healthcare
          </div>
          <h1 className="hero-title">
            Smart Healthcare,<br />
            <span className="hero-gradient-text">Human Care.</span>
          </h1>
          <p className="hero-desc">
            HorizonCare AI Medical Center combines world-class medical expertise with cutting-edge AI technology
            to deliver personalized, efficient, and compassionate healthcare — all in one place.
          </p>
          <div className="hero-actions">
            <Link to="/register" className="btn btn-primary btn-lg">Book Appointment</Link>
            <a href="#departments" className="btn btn-outline btn-lg">Explore Departments</a>
          </div>
        </div>

        {/* Floating icons */}
        <div className="hero-float-icons">
          <div className="float-icon float-icon-1">❤️</div>
          <div className="float-icon float-icon-2">🧬</div>
          <div className="float-icon float-icon-3">💊</div>
          <div className="float-icon float-icon-4">🔬</div>
        </div>
      </section>

      {/* Stats bar */}
      <section className="stats-bar">
        <div className="container">
          <div className="stats-grid">
            {[
              { icon: '👨‍⚕️', value: '50+',    label: 'Expert Doctors' },
              { icon: '🏥',   value: '5',      label: 'Specialities' },
              { icon: '🧑‍🤝‍🧑', value: '10K+',  label: 'Patients Served' },
              { icon: '🕐',   value: '24/7',   label: 'Support Available' },
            ].map(s => (
              <div key={s.label} className="stat-item">
                <div className="stat-item-icon">{s.icon}</div>
                <div className="stat-item-value">{s.value}</div>
                <div className="stat-item-label">{s.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Departments */}
      <section id="departments" className="section landing-section">
        <div className="container">
          <div className="section-header">
            <div className="coming-soon-badge">Our Specialities</div>
            <h2 className="section-title">World-Class Departments</h2>
            <p className="section-desc">Expert care across every medical specialty, with state-of-the-art facilities and compassionate professionals.</p>
          </div>
          <div className="dept-grid">
            {DEPARTMENTS.map(d => (
              <div key={d.name} className="dept-card card">
                <div className="dept-icon">{d.icon}</div>
                <h3 className="dept-name">{d.name}</h3>
                <p className="dept-desc">{d.desc}</p>
                <div className="dept-meta">
                  <span className="dept-tag">🏢 {d.floor}</span>
                  <span className="dept-tag">📍 {d.block}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* AI Feature */}
      <section id="about" className="ai-section">
        <div className="container">
          <div className="ai-inner">
            <div className="ai-text">
              <div className="coming-soon-badge">🤖 AI-Powered</div>
              <h2 style={{ marginTop: '1rem' }}>Meet Your AI Hospital Assistant</h2>
              <p style={{ marginTop: '1rem', marginBottom: '1.5rem' }}>
                Our intelligent assistant is always available to help you navigate the hospital, book appointments, check queue status, and get instant answers — all through natural conversation.
              </p>
              <ul className="ai-features-list">
                <li>📅 Book & manage appointments with voice or text</li>
                <li>🗺️ Navigate to any department effortlessly</li>
                <li>⏳ Real-time queue status and wait estimates</li>
                <li>🔔 Smart reminders and follow-up alerts</li>
                <li>💬 24/7 patient support and guidance</li>
              </ul>
              <Link to="/register" className="btn btn-primary" style={{ marginTop: '2rem', display: 'inline-flex' }}>
                Get Started Free
              </Link>
            </div>
            <div className="ai-chat-mockup">
              <div className="chat-mockup-header">
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                  <div style={{ width: 32, height: 32, borderRadius: 8, background: 'linear-gradient(135deg,var(--primary),var(--accent))', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1rem' }}>🤖</div>
                  <div>
                    <div style={{ fontWeight: 700, fontSize: '0.85rem' }}>AI Assistant</div>
                    <div style={{ fontSize: '0.7rem', color: 'var(--success)' }}>● Online</div>
                  </div>
                </div>
              </div>
              <div className="chat-messages">
                <div className="chat-msg chat-msg-ai">Hello! I'm your hospital assistant. How can I help you today? 😊</div>
                <div className="chat-msg chat-msg-user">I need to book an appointment with a cardiologist.</div>
                <div className="chat-msg chat-msg-ai">Sure! Dr. Priya Sharma (Cardiology) is available on Monday. Shall I book a slot at 10:00 AM? 📅</div>
                <div className="chat-msg chat-msg-user">Yes, please!</div>
                <div className="chat-msg chat-msg-ai">
                  ✅ Appointment confirmed!<br/>
                  <strong>Dr. Priya Sharma</strong> · Monday 10:00 AM<br/>
                  Token: <strong>#A012</strong> · Room 201
                </div>
                <div className="chat-typing"><span /><span /><span /></div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="section landing-section">
        <div className="container">
          <div className="section-header">
            <div className="coming-soon-badge">Why Choose Us</div>
            <h2 className="section-title">Everything You Need</h2>
            <p className="section-desc">A complete digital healthcare ecosystem built for patients, doctors, and staff.</p>
          </div>
          <div className="features-grid">
            {FEATURES.map(f => (
              <div key={f.title} className="feature-card card">
                <div className="feature-icon">{f.icon}</div>
                <h3 className="feature-title">{f.title}</h3>
                <p className="feature-desc">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="cta-section">
        <div className="container" style={{ textAlign: 'center' }}>
          <h2 style={{ fontSize: 'clamp(1.8rem, 4vw, 2.5rem)' }}>Ready to Experience Smarter Healthcare?</h2>
          <p style={{ marginTop: '1rem', color: 'var(--text-secondary)', maxWidth: 500, margin: '1rem auto' }}>
            Join thousands of patients who trust HorizonCare AI Medical Center for expert care and AI-powered assistance.
          </p>
          <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', marginTop: '2rem', flexWrap: 'wrap' }}>
            <Link to="/register" className="btn btn-primary btn-lg">Create Account</Link>
            <Link to="/login"    className="btn btn-outline btn-lg">Sign In</Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="landing-footer">
        <div className="container">
          <div className="footer-grid">
            <div>
              <div className="landing-logo" style={{ marginBottom: '1rem' }}>
                <LogoIcon size={42} />
                <div>
                  <div className="landing-logo-name">HorizonCare AI</div>
                  <div className="landing-logo-sub">Medical Center</div>
                </div>
              </div>
              <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', maxWidth: 260 }}>
                Delivering compassionate, world-class medical care powered by intelligent technology.
              </p>
            </div>
            <div>
              <h4 style={{ marginBottom: '1rem', fontSize: '0.9rem' }}>Quick Links</h4>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                {['Departments', 'AI Assistant', 'Book Appointment', 'Patient Portal'].map(l => (
                  <a key={l} href="#" style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>{l}</a>
                ))}
              </div>
            </div>
            <div>
              <h4 style={{ marginBottom: '1rem', fontSize: '0.9rem' }}>Contact</h4>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                <span>📍 123 Health Street, Medical City</span>
                <span>📞 +91 98765 43210</span>
                <span>✉️ info@horizoncare.ai</span>
                <span>🕐 24/7 Emergency Available</span>
              </div>
            </div>
          </div>
          <div className="footer-bottom">
            <p>© 2026 HorizonCare AI Medical Center. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}
