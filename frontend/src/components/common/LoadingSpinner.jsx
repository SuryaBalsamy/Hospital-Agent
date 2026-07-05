export default function LoadingSpinner({ fullPage = false, text = 'Loading...' }) {
  if (fullPage) {
    return (
      <div className="loading-overlay">
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1rem' }}>
          <div style={{
            width: 56, height: 56,
            background: 'linear-gradient(135deg, var(--primary), var(--accent))',
            borderRadius: 'var(--radius-md)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: '1.5rem', marginBottom: '0.5rem',
            boxShadow: 'var(--shadow-glow)',
          }}>
            🏥
          </div>
          <div className="spinner" />
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }}>{text}</p>
        </div>
      </div>
    )
  }
  return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', padding: '3rem' }}>
      <div className="spinner" />
    </div>
  )
}
