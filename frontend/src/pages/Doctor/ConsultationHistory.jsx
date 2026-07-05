import DashboardLayout from '../../components/layout/DashboardLayout'
import Card from '../../components/common/Card'

export default function ConsultationHistory() {
  return (
    <DashboardLayout>
      <Card title="Consultation History" subtitle="Past patient consultations and notes">
        <div className="table-wrapper" style={{ opacity: 0.5, pointerEvents: 'none' }}>
          <table className="data-table">
            <thead><tr><th>Date</th><th>Patient</th><th>Diagnosis</th><th>Follow-Up</th><th>Actions</th></tr></thead>
            <tbody>
              {[1,2,3].map(i => <tr key={i}><td><div className="skeleton" style={{height:18, width:80}} /></td><td><div className="skeleton" style={{height:18, width:120}} /></td><td><div className="skeleton" style={{height:18, width:160}} /></td><td><div className="skeleton" style={{height:18, width:60}} /></td><td><div className="skeleton" style={{height:18, width:80}} /></td></tr>)}
            </tbody>
          </table>
        </div>
        <div className="empty-state" style={{ paddingTop: '2rem' }}>
          <span className="coming-soon-badge">🚧 Consultation history coming soon</span>
          <p style={{ marginTop: '0.75rem' }}>Past consultation records with diagnosis, prescriptions, and follow-up notes will be shown here.</p>
        </div>
      </Card>
    </DashboardLayout>
  )
}
