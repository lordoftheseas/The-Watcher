import { useNavigate } from 'react-router-dom'
import '../styles/Landing.css'

function Landing() {
  const navigate = useNavigate()

  return (
    <div className="landing-container">
      {/* Navigation */}
      <nav className="navbar">
        <div className="nav-content">
          <div className="logo">
            <span className="logo-icon">👁️</span>
            <span className="logo-text">Watcher</span>
          </div>
          <div className="nav-links">
            <button onClick={() => navigate('/login')} className="btn-text">
              Login
            </button>
            <button onClick={() => navigate('/signup')} className="btn-primary">
              Get Started
            </button>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="hero">
        <div className="hero-content">
          <div className="hero-badge">
            <span className="badge-dot"></span>
            Real-Time Monitoring Active
          </div>
          <h1 className="hero-title">
            Intelligent Crime Detection
            <br />
            <span className="gradient-text">Protecting What Matters</span>
          </h1>
          <p className="hero-description">
            Advanced AI-powered real-time monitoring system that detects and analyzes
            potential threats instantly. Stay one step ahead with Watcher's intelligent
            surveillance technology.
          </p>
          <div className="hero-buttons">
            <button onClick={() => navigate('/signup')} className="btn-hero-primary">
              Start Monitoring
              <span className="arrow">→</span>
            </button>
            <button className="btn-hero-secondary">
              Watch Demo
            </button>
          </div>

          {/* Stats */}
          <div className="stats">
            <div className="stat-item">
              <div className="stat-value">High</div>
              <div className="stat-label">Accuracy</div>
            </div>
            <div className="stat-divider"></div>
            <div className="stat-item">
              <div className="stat-value">Fast</div>
              <div className="stat-label">Response Time</div>
            </div>
            <div className="stat-divider"></div>
            <div className="stat-item">
              <div className="stat-value">24/7</div>
              <div className="stat-label">Monitoring</div>
            </div>
          </div>
        </div>

        {/* Visual Element */}
        <div className="hero-visual">
          <div className="info-cards-container">
            {/* Main Feature Card */}
            <div className="main-info-card">
              <div className="info-card-icon">🛡️</div>
              <h3>Advanced Security Monitoring</h3>
              <p>Real-time AI-powered threat detection and analysis</p>
              <div className="info-card-stats">
                <div className="info-stat">
                  <span className="info-stat-value">1</span>
                  <span className="info-stat-label">Person Protected</span>
                </div>
                <div className="info-stat">
                  <span className="info-stat-value">1</span>
                  <span className="info-stat-label">Threat Prevented</span>
                </div>
              </div>
            </div>

            {/* Feature Grid */}
            <div className="mini-features-grid">
              <div className="mini-feature-card">
                <div className="mini-icon">⚡</div>
                <div className="mini-content">
                  <h4>Instant Detection</h4>
                  <p>Real-time threat identification</p>
                </div>
              </div>
              <div className="mini-feature-card">
                <div className="mini-icon">🎯</div>
                <div className="mini-content">
                  <h4>High Accuracy</h4>
                  <p>99.9% detection precision</p>
                </div>
              </div>
              <div className="mini-feature-card">
                <div className="mini-icon">📊</div>
                <div className="mini-content">
                  <h4>Smart Analytics</h4>
                  <p>Comprehensive reporting</p>
                </div>
              </div>
              <div className="mini-feature-card">
                <div className="mini-icon">🔒</div>
                <div className="mini-content">
                  <h4>Secure & Private</h4>
                  <p>End-to-end encryption</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="features">
        <div className="section-header">
          <h2 className="section-title">How Watcher Works</h2>
          <p className="section-description">
            Cutting-edge technology for comprehensive security monitoring
          </p>
        </div>
        <div className="features-grid">
          <div className="feature-card">
            <div className="feature-icon">🎯</div>
            <h3>Real-Time Detection</h3>
            <p>
              Instantly analyze situations and identify potential threats with
              AI-powered computer vision technology.
            </p>
          </div>
          <div className="feature-card">
            <div className="feature-icon">🧠</div>
            <h3>AI Analysis</h3>
            <p>
              Advanced machine learning algorithms continuously learn and improve
              threat detection accuracy.
            </p>
          </div>
          <div className="feature-card">
            <div className="feature-icon">⚡</div>
            <h3>Instant Alerts</h3>
            <p>
              Receive immediate notifications when suspicious activity is detected,
              enabling rapid response.
            </p>
          </div>
          <div className="feature-card">
            <div className="feature-icon">📊</div>
            <h3>Detailed Reports</h3>
            <p>
              Access comprehensive analytics and incident reports to understand
              patterns and trends.
            </p>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="cta">
        <div className="cta-content">
          <h2 className="cta-title">Ready to Enhance Your Security?</h2>
          <p className="cta-description">
            Join thousands of organizations already using Watcher to protect their spaces.
          </p>
          <button onClick={() => navigate('/signup')} className="btn-cta">
            Get Started Now
          </button>
        </div>
      </section>

      {/* Footer */}
      <footer className="footer">
        <div className="footer-content">
          <div className="footer-section">
            <div className="footer-logo">
              <span className="logo-icon">👁️</span>
              <span className="logo-text">Watcher</span>
            </div>
            <p className="footer-description">
              Real-time crime detection and monitoring system
            </p>
          </div>
          <div className="footer-section">
            <h4>Product</h4>
            <a href="#">Features</a>
            <a href="#">Pricing</a>
            <a href="#">Security</a>
          </div>
          <div className="footer-section">
            <h4>Company</h4>
            <a href="#">About</a>
            <a href="#">Contact</a>
            <a href="#">Careers</a>
          </div>
          <div className="footer-section">
            <h4>Legal</h4>
            <a href="#">Privacy</a>
            <a href="#">Terms</a>
            <a href="#">License</a>
          </div>
        </div>
        <div className="footer-bottom">
          <p>&copy; 2025 Watcher. All rights reserved.</p>
        </div>
      </footer>
    </div>
  )
}

export default Landing
