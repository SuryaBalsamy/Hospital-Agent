import { useState, useEffect } from 'react'
import Sidebar from './Sidebar'
import TopNav from './TopNav'

export default function DashboardLayout({ children }) {
  const [collapsed, setCollapsed]   = useState(false)
  const [isMobile, setIsMobile]     = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)

  useEffect(() => {
    const check = () => {
      const mobile = window.innerWidth < 768
      setIsMobile(mobile)
      if (mobile) setCollapsed(true)
    }
    check()
    window.addEventListener('resize', check)
    return () => window.removeEventListener('resize', check)
  }, [])

  const handleToggle = () => {
    if (isMobile) {
      setMobileOpen(o => !o)
    } else {
      setCollapsed(c => !c)
    }
  }

  const sidebarVisible = isMobile ? mobileOpen : true
  const sidebarCollapsed = isMobile ? false : collapsed

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: 'var(--bg-surface)' }}>
      {/* Sidebar */}
      {sidebarVisible && (
        <Sidebar
          collapsed={sidebarCollapsed}
          onClose={() => setMobileOpen(false)}
          isMobile={isMobile}
        />
      )}

      {/* Main content */}
      <div style={{
        flex: 1,
        marginLeft: isMobile ? 0 : (collapsed ? 'var(--sidebar-collapsed)' : 'var(--sidebar-width)'),
        transition: 'margin-left 0.3s cubic-bezier(0.4,0,0.2,1)',
        display: 'flex',
        flexDirection: 'column',
        minHeight: '100vh',
        minWidth: 0,
      }}>
        <TopNav onToggleSidebar={handleToggle} />
        <main style={{
          flex: 1,
          padding: '1.75rem',
          animation: 'pageEnter 0.3s ease forwards',
          maxWidth: '100%',
          overflow: 'hidden',
        }}>
          {children}
        </main>
      </div>
    </div>
  )
}
