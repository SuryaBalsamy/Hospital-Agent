import DashboardLayout from '../../components/layout/DashboardLayout'
import Card from '../../components/common/Card'

export default function Reports() {
  return (
    <DashboardLayout>
      <Card title="Hospital Reports" subtitle="Analytics and performance reports">
        <div className="empty-state" style={{ padding: '4rem 2rem' }}>
          <div className="empty-state-icon" style={{ fontSize: '3rem' }}>📊</div>
          <h3>Reporting Module Coming Soon</h3>
          <p style={{ maxWidth: 400, margin: '0.5rem auto' }}>
            Advanced analytics, patient flow reports, and revenue dashboards will be available in the next release.
          </p>
          <span className="coming-soon-badge" style={{ marginTop: '1rem' }}>🚧 Under Construction</span>
        </div>
      </Card>
    </DashboardLayout>
  )
}
