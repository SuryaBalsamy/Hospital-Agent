import { useEffect, useState } from 'react'
import DashboardLayout from '../../components/layout/DashboardLayout'
import Card from '../../components/common/Card'
import Badge from '../../components/common/Badge'
import { adminService } from '../../services/adminService'

export default function Doctors() {
  const [doctors, setDoctors] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => { adminService.getDoctors().then(r => setDoctors(r.data)).catch(() => {}).finally(() => setLoading(false)) }, [])

  return (
    <DashboardLayout>
      <Card title="Doctor Management" subtitle="View and manage hospital doctors"
        action={<button className="btn btn-primary btn-sm">+ Add Doctor</button>}>
        {loading ? (
          <div style={{ display:'flex', flexDirection:'column', gap:'0.75rem' }}>{[1,2,3,4].map(i => <div key={i} className="skeleton" style={{height:56}} />)}</div>
        ) : doctors.length === 0 ? (
          <div className="empty-state"><div className="empty-state-icon">👨‍⚕️</div><h3>No Doctors</h3></div>
        ) : (
          <div className="table-wrapper">
            <table className="data-table">
              <thead><tr><th>ID</th><th>Name</th><th>Department</th><th>Specialization</th><th>Status</th><th>Actions</th></tr></thead>
              <tbody>
                {doctors.map(d => (
                  <tr key={d.doctor_id}>
                    <td style={{ color: 'var(--text-muted)' }}>#{d.doctor_id}</td>
                    <td style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{d.doctor_name}</td>
                    <td>{d.department?.department_name || '—'}</td>
                    <td>{d.specialization || '—'}</td>
                    <td><Badge status={d.status} /></td>
                    <td>
                      <button className="btn btn-ghost btn-sm">Edit</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>
    </DashboardLayout>
  )
}
