export default function Card({ children, title, subtitle, action, className = '', style = {} }) {
  return (
    <div className={`card ${className}`} style={style}>
      {(title || action) && (
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem' }}>
          <div>
            {title && <h3 style={{ fontSize: '1.05rem', fontWeight: 700, margin: 0 }}>{title}</h3>}
            {subtitle && <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '0.2rem' }}>{subtitle}</p>}
          </div>
          {action && <div>{action}</div>}
        </div>
      )}
      {children}
    </div>
  )
}
