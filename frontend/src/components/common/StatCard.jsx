export default function StatCard({ title, value, icon, color = 'var(--primary)', trend, loading = false }) {
  return (
    <div className="stat-card card" style={{ position: 'relative', overflow: 'hidden' }}>
      {/* Glow accent */}
      <div style={{
        position: 'absolute', top: -20, right: -20, width: 80, height: 80,
        borderRadius: '50%', background: color, opacity: 0.08, filter: 'blur(20px)'
      }} />
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
        <div style={{ flex: 1 }}>
          <p style={{ fontSize: '0.78rem', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '0.5rem' }}>
            {title}
          </p>
          {loading ? (
            <div className="skeleton" style={{ height: 36, width: 80, borderRadius: 8 }} />
          ) : (
            <div style={{ fontSize: '2rem', fontWeight: 800, color: 'var(--text-primary)', lineHeight: 1 }}>
              {value ?? '—'}
            </div>
          )}
          {trend && !loading && (
            <p style={{ fontSize: '0.78rem', marginTop: '0.5rem', color: trend.up ? 'var(--success)' : 'var(--danger)' }}>
              {trend.up ? '↑' : '↓'} {trend.label}
            </p>
          )}
        </div>
        <div style={{
          width: 48, height: 48,
          borderRadius: 'var(--radius-md)',
          background: `${color}22`,
          border: `1px solid ${color}33`,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: '1.4rem', color, flexShrink: 0,
        }}>
          {icon}
        </div>
      </div>
    </div>
  )
}
