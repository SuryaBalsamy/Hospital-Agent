import { getStatusClass } from '../../utils/helpers'

const STATUS_LABELS = {
  BOOKED: 'Booked',
  CHECKED_IN: 'Checked In',
  WAITING: 'Waiting',
  IN_CONSULTATION: 'In Consultation',
  COMPLETED: 'Completed',
  CANCELLED: 'Cancelled',
  AVAILABLE: 'Available',
  ON_LEAVE: 'On Leave',
  APPOINTMENT: 'Appointment',
  REMINDER: 'Reminder',
  FOLLOW_UP: 'Follow-Up',
  GENERAL: 'General',
}

export default function Badge({ status, children }) {
  const label = children || STATUS_LABELS[status] || status
  return <span className={getStatusClass(status)}>{label}</span>
}
