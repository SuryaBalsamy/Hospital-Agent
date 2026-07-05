import { useEffect, useState } from 'react'
import DashboardLayout from '../../components/layout/DashboardLayout'
import Card from '../../components/common/Card'
import Badge from '../../components/common/Badge'
import { patientService } from '../../services/patientService'
import { formatDate } from '../../utils/helpers'

export default function Notifications() {
  const [notifications, setNotifications] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    patientService.getNotifications()
      .then(r => setNotifications(r.data))
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  const markRead = async (id) => {
    await patientService.markNotificationRead(id).catch(() => {})
    setNotifications(n => n.map(notif => notif.notification_id === id ? { ...notif, is_read: true } : notif))
  }

  const unread = notifications.filter(n => !n.is_read).length

  return (
    <DashboardLayout>
      <Card title="Notifications" subtitle={`${unread} unread`}>
        {loading ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            {[1,2,3].map(i => <div key={i} className="skeleton" style={{ height: 72 }} />)}
          </div>
        ) : notifications.length === 0 ? (
          <div className="empty-state">
            <div className="empty-state-icon">🔔</div>
            <h3>No Notifications</h3>
            <p>You're all caught up! Appointment and reminder notifications will appear here.</p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            {notifications.map(n => (
              <div key={n.notification_id} style={{
                display: 'flex', gap: '1rem', alignItems: 'flex-start',
                padding: '1rem', borderRadius: 'var(--radius-md)',
                background: n.is_read ? 'var(--bg-card)' : 'rgba(14,165,233,0.06)',
                border: `1px solid ${n.is_read ? 'var(--border)' : 'rgba(14,165,233,0.2)'}`,
                transition: 'var(--transition)',
              }}>
                <div style={{ fontSize: '1.5rem', flexShrink: 0 }}>
                  {{ APPOINTMENT: '📅', REMINDER: '⏰', COMPLETED: '✅', FOLLOW_UP: '🔄', GENERAL: '📢' }[n.notification_type] || '🔔'}
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem' }}>
                    <span style={{ fontWeight: 700, fontSize: '0.9rem' }}>{n.title}</span>
                    {!n.is_read && <span style={{ width: 8, height: 8, borderRadius: '50%', background: 'var(--primary)', display: 'inline-block' }} />}
                    <Badge status={n.notification_type} />
                  </div>
                  <p style={{ fontSize: '0.83rem', color: 'var(--text-muted)', margin: 0 }}>{n.message}</p>
                  <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.4rem' }}>{formatDate(n.created_at)}</p>
                </div>
                {!n.is_read && (
                  <button className="btn btn-ghost btn-sm" onClick={() => markRead(n.notification_id)}>Mark read</button>
                )}
              </div>
            ))}
          </div>
        )}
      </Card>
    </DashboardLayout>
  )
}
