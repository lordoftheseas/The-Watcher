import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'

function AuthCallback() {
  const navigate = useNavigate()
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    // Handle the OAuth callback
    const handleCallback = async () => {
      try {
        // Get the session from the URL hash
        const { data, error } = await supabase.auth.getSession()
        
        if (error) {
          setError(error.message)
          setTimeout(() => navigate('/login'), 3000)
          return
        }

        if (data.session) {
          // Successfully authenticated, redirect to dashboard
          navigate('/dashboard')
        } else {
          setError('No session found')
          setTimeout(() => navigate('/login'), 3000)
        }
      } catch (err) {
        console.error('Auth callback error:', err)
        setError('An error occurred during authentication')
        setTimeout(() => navigate('/login'), 3000)
      } finally {
        setLoading(false)
      }
    }

    handleCallback()
  }, [navigate])

  return (
    <div className="auth-container">
      <div className="auth-card">
        <div className="auth-header">
          <div className="logo">
            <span className="logo-text">The Watcher</span>
          </div>
          {loading ? (
            <>
              <h1 className="auth-title">Authenticating...</h1>
              <p className="auth-subtitle">Please wait while we sign you in</p>
            </>
          ) : error ? (
            <>
              <h1 className="auth-title">Authentication Error</h1>
              <p className="auth-subtitle">{error}</p>
              <p style={{ marginTop: '1rem', fontSize: '0.9rem', color: '#666' }}>
                Redirecting to login...
              </p>
            </>
          ) : (
            <>
              <h1 className="auth-title">Success!</h1>
              <p className="auth-subtitle">Redirecting to dashboard...</p>
            </>
          )}
        </div>
      </div>
    </div>
  )
}

export default AuthCallback
