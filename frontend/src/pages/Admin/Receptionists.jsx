import { useEffect, useState } from 'react'
import DashboardLayout from '../../components/layout/DashboardLayout'
import Card from '../../components/common/Card'
import { adminService } from '../../services/adminService'

export default function Receptionists() {
  const [receptionists, setReceptionists] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => { adminService.getReceptionists().then(r => setReceptionists(r.data)).catch(() => {}).finally(() => setLoading(false)) }, [])

  return (
    <DashboardLayout>
      <Card title="Receptionist Management" subtitle="Manage hospital receptionists"
        action={<button className="btn btn-primary btn-sm">+ Add Receptionist</button>}>
        {loading ? (
          <div style={{ display:'flex', flexDirection:'column', gap:'0.75rem' }}>{[1,2,3].map(i => <div key={i} className="skeleton" style={{height:56}} />)}</div>
        ) : receptionists.length === 0 ? (
          <div className="empty-state"><div className="empty-state-icon">👩‍💼</div><h3>No Receptionists</h3></div>
        ) : (
          <div className="table-wrapper">
            <table className="data-table">
              <thead><tr><th>ID</th><th>Name</th><th>Phone</th><th>Email</th><th>Actions</th></tr></thead>
              <tbody>
                {receptionists.map(r => (
                  <tr key={r.receptionist_id}>
                    <td style={{ color: 'var(--text-muted)' }}>#{r.receptionist_id}</td>
                    <td style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{r.full_name}</td>
                    <td>{r.phone || '—'}</td>
                    <td>{r.email || '—'}</td>
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
