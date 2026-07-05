export function getInitials(name = '') {
  if (!name) return '?'
  return name.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2)
}

export function formatDate(dateStr) {
  if (!dateStr) return '—'
  return new Date(dateStr).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })
}

export function formatTime(timeStr) {
  if (!timeStr) return '—'
  const [h, m] = timeStr.split(':')
  const hour = parseInt(h)
  const ampm = hour >= 12 ? 'PM' : 'AM'
  return `${hour % 12 || 12}:${m} ${ampm}`
}

export function getGreeting() {
  const h = new Date().getHours()
  if (h < 12) return 'Good Morning'
  if (h < 17) return 'Good Afternoon'
  return 'Good Evening'
}

export function getRoleDashboard(role) {
  const map = { PATIENT: '/patient', DOCTOR: '/doctor', RECEPTIONIST: '/receptionist', ADMIN: '/admin' }
  return map[role] || '/login'
}

export function getStatusClass(status) {
  const map = {
    BOOKED: 'badge badge-info',
    CHECKED_IN: 'badge badge-accent',
    WAITING: 'badge badge-warning',
    IN_CONSULTATION: 'badge badge-primary',
    COMPLETED: 'badge badge-success',
    CANCELLED: 'badge badge-danger',
    AVAILABLE: 'badge badge-success',
    ON_LEAVE: 'badge badge-warning',
  }
  return map[status] || 'badge badge-muted'
}

export function avatarColor(name = '') {
  const colors = ['#0EA5E9','#6366F1','#10B981','#F59E0B','#EF4444','#06B6D4','#8B5CF6']
  const idx = (name.charCodeAt(0) || 0) % colors.length
  return colors[idx]
}
