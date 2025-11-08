import { useState } from 'react'
import { useNavigate, Outlet, Link, useLocation } from 'react-router-dom'
import '../styles/Dashboard.css'

function Dashboard() {
  const navigate = useNavigate()
  const location = useLocation()
  const [isSidebarOpen, setIsSidebarOpen] = useState(true)

  const handleLogout = () => {
    // TODO: Implement actual logout logic
    navigate('/')
  }

  const menuItems = [
    {
      path: '/dashboard/cctv',
      icon: '📹',
      label: 'CCTV Grid',
      description: 'View all camera feeds'
    },
    {
      path: '/dashboard/live',
      icon: '🎥',
      label: 'Live Camera',
      description: 'Access live camera'
    },
    {
      path: '/dashboard/reports',
      icon: '📊',
      label: 'Reports',
      description: 'View incident reports'
    }
  ]

  return (
    <div className="dashboard-container">
      {/* Sidebar */}
      <aside className={`sidebar ${isSidebarOpen ? 'open' : 'closed'}`}>
        <div className="sidebar-header">
          <div className="logo" onClick={() => navigate('/')}>
            <span className="logo-icon">👁️</span>
            {isSidebarOpen && <span className="logo-text">Watcher</span>}
          </div>
          <button 
            className="sidebar-toggle"
            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
          >
            {isSidebarOpen ? '◀' : '▶'}
          </button>
        </div>

        <nav className="sidebar-nav">
          {menuItems.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              className={`nav-item ${location.pathname === item.path ? 'active' : ''}`}
            >
              <span className="nav-icon">{item.icon}</span>
              {isSidebarOpen && (
                <div className="nav-content">
                  <span className="nav-label">{item.label}</span>
                  <span className="nav-description">{item.description}</span>
                </div>
              )}
            </Link>
          ))}
        </nav>

        <div className="sidebar-footer">
          <div className="user-info">
            <div className="user-avatar">U</div>
            {isSidebarOpen && (
              <div className="user-details">
                <span className="user-name">User Name</span>
                <span className="user-email">user@example.com</span>
              </div>
            )}
          </div>
          <button className="btn-logout" onClick={handleLogout}>
            <span>🚪</span>
            {isSidebarOpen && <span>Logout</span>}
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="dashboard-main">
        {/* Top Bar */}
        <header className="dashboard-header">
          <div className="header-content">
            <h1 className="page-title">
              {menuItems.find(item => item.path === location.pathname)?.label || 'Dashboard'}
            </h1>
            <div className="header-actions">
              <div className="status-badge">
                <span className="status-dot active"></span>
                <span>System Active</span>
              </div>
              <button className="btn-icon" title="Notifications">
                🔔
              </button>
              <button className="btn-icon" title="Settings">
                ⚙️
              </button>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <div className="dashboard-content">
          <Outlet />
        </div>
      </main>
    </div>
  )
}

export default Dashboard
