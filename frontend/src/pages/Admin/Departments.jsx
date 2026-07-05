import { useEffect, useState } from 'react'
import DashboardLayout from '../../components/layout/DashboardLayout'
import Card from '../../components/common/Card'
import { adminService } from '../../services/adminService'

export default function Departments() {
  const [departments, setDepartments] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => { adminService.getDepartments().then(r => setDepartments(r.data)).catch(() => {}).finally(() => setLoading(false)) }, [])

  return (
    <DashboardLayout>
      <Card title="Departments" subtitle="Manage hospital departments and locations"
        action={<button className="btn btn-primary btn-sm">+ Add Department</button>}>
        {loading ? (
          <div style={{ display:'flex', flexDirection:'column', gap:'0.75rem' }}>{[1,2,3,4].map(i => <div key={i} className="skeleton" style={{height:56}} />)}</div>
        ) : departments.length === 0 ? (
          <div className="empty-state"><div className="empty-state-icon">🏢</div><h3>No Departments</h3></div>
        ) : (
          <div className="table-wrapper">
            <table className="data-table">
              <thead><tr><th>ID</th><th>Department Name</th><th>Block</th><th>Floor</th><th>Actions</th></tr></thead>
              <tbody>
                {departments.map(d => (
                  <tr key={d.department_id}>
                    <td style={{ color: 'var(--text-muted)' }}>#{d.department_id}</td>
                    <td style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{d.department_name}</td>
                    <td>{d.block_name || '—'}</td>
                    <td>{d.floor || '—'}</td>
                    <td><button className="btn btn-ghost btn-sm">Edit</button></td>
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
