import { useState, useEffect } from 'react'
import { useNavigate, Outlet, Link, useLocation } from 'react-router-dom'
import { authHelpers } from '../lib/supabase'
import '../styles/Dashboard.css'

function Dashboard() {
  const navigate = useNavigate()
  const location = useLocation()
  const [isSidebarOpen, setIsSidebarOpen] = useState(true)
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Get current user on component mount
    const fetchUser = async () => {
      try {
        const { user: currentUser, error } = await authHelpers.getCurrentUser()
        if (error) {
          console.error('Error fetching user:', error)
          navigate('/login')
          return
        }
        if (!currentUser) {
          navigate('/login')
          return
        }
        setUser(currentUser)
      } catch (err) {
        console.error('Failed to fetch user:', err)
        navigate('/login')
      } finally {
        setLoading(false)
      }
    }

    fetchUser()

    // Listen for auth state changes
    const { data: { subscription } } = authHelpers.onAuthStateChange((event, session) => {
      if (event === 'SIGNED_OUT') {
        navigate('/login')
      } else if (event === 'SIGNED_IN' && session?.user) {
        setUser(session.user)
      }
    })

    return () => {
      subscription?.unsubscribe()
    }
  }, [navigate])

  const handleLogout = async () => {
    try {
      await authHelpers.signOut()
      navigate('/')
    } catch (err) {
      console.error('Logout error:', err)
    }
  }

  const getUserInitials = () => {
    if (!user) return 'U'
    const name = user.user_metadata?.full_name || user.email
    return name.charAt(0).toUpperCase()
  }

  const getUserName = () => {
    if (!user) return 'User Name'
    return user.user_metadata?.full_name || user.email.split('@')[0]
  }

  const getUserEmail = () => {
    if (!user) return 'user@example.com'
    return user.email
  }

  if (loading) {
    return (
      <div className="dashboard-container" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <div>Loading...</div>
      </div>
    )
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
            {isSidebarOpen && <span className="logo-text">The Watcher</span>}
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
            <div className="user-avatar">{getUserInitials()}</div>
            {isSidebarOpen && (
              <div className="user-details">
                <span className="user-name">{getUserName()}</span>
                <span className="user-email">{getUserEmail()}</span>
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
