import { useState } from 'react'
import DashboardLayout from '../../components/layout/DashboardLayout'
import Card from '../../components/common/Card'
import { receptionistService } from '../../services/adminService'

export default function PatientSearch() {
  const [query, setQuery]     = useState('')
  const [results, setResults] = useState([])
  const [loading, setLoading] = useState(false)
  const [searched, setSearched] = useState(false)

  const handleSearch = async () => {
    if (!query.trim()) return
    setLoading(true); setSearched(true)
    try {
      const r = await receptionistService.searchPatients(query)
      setResults(r.data)
    } catch { setResults([]) }
    finally { setLoading(false) }
  }

  return (
    <DashboardLayout>
      <Card title="Patient Search" subtitle="Find patients by name">
        <div style={{ display:'flex', gap:'0.75rem', marginBottom:'1.5rem' }}>
          <input className="form-input" placeholder="Search patient by name..." style={{ flex:1 }}
            value={query} onChange={e => setQuery(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && handleSearch()} />
          <button className="btn btn-primary" onClick={handleSearch} disabled={loading}>
            {loading ? <><div className="spinner spinner-sm"/>Searching...</> : '🔍 Search'}
          </button>
        </div>

        {!searched ? (
          <div className="empty-state"><div className="empty-state-icon">🔍</div><h3>Search for a Patient</h3><p>Enter a patient name and press Search to find records.</p></div>
        ) : loading ? (
          <div style={{ display:'flex', flexDirection:'column', gap:'0.75rem' }}>{[1,2,3].map(i => <div key={i} className="skeleton" style={{height:56}} />)}</div>
        ) : results.length === 0 ? (
          <div className="empty-state"><div className="empty-state-icon">😕</div><h3>No Results Found</h3><p>No patients matched "{query}"</p></div>
        ) : (
          <div className="table-wrapper">
            <table className="data-table">
              <thead><tr><th>ID</th><th>Name</th><th>Phone</th><th>Blood Group</th><th>Gender</th><th>Actions</th></tr></thead>
              <tbody>
                {results.map(p => (
                  <tr key={p.patient_id}>
                    <td style={{ color:'var(--text-muted)' }}>#{p.patient_id}</td>
                    <td style={{ fontWeight:600, color:'var(--text-primary)' }}>{p.full_name || '—'}</td>
                    <td>{p.phone || '—'}</td>
                    <td>{p.blood_group ? <span className="badge badge-danger">🩸 {p.blood_group}</span> : '—'}</td>
                    <td>{p.gender || '—'}</td>
                    <td><button className="btn btn-secondary btn-sm">View Profile</button></td>
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
