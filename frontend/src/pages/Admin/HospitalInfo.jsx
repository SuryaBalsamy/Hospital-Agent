import { useEffect, useState } from 'react'
import DashboardLayout from '../../components/layout/DashboardLayout'
import Card from '../../components/common/Card'
import { hospitalService } from '../../services/adminService'

export default function HospitalInfo() {
  const [info, setInfo] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => { hospitalService.getInfo().then(r => setInfo(r.data)).catch(() => {}).finally(() => setLoading(false)) }, [])

  return (
    <DashboardLayout>
      <Card title="Hospital Information" subtitle="Manage static hospital information and directories"
        action={<button className="btn btn-primary btn-sm">+ Add Info Record</button>}>
        {loading ? (
          <div style={{ display:'flex', flexDirection:'column', gap:'0.75rem' }}>{[1,2,3].map(i => <div key={i} className="skeleton" style={{height:56}} />)}</div>
        ) : info.length === 0 ? (
          <div className="empty-state"><div className="empty-state-icon">ℹ️</div><h3>No Information Records</h3></div>
        ) : (
          <div className="table-wrapper">
            <table className="data-table">
              <thead><tr><th>Category</th><th>Title</th><th>Location</th><th>Actions</th></tr></thead>
              <tbody>
                {info.map(i => (
                  <tr key={i.info_id}>
                    <td><span className="badge badge-accent">{i.category}</span></td>
                    <td style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{i.title}</td>
                    <td>{i.block_name ? `${i.block_name}, ${i.floor}` : '—'}</td>
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
