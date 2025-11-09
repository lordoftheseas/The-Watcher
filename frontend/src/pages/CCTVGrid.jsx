import { useState } from 'react'
import '../styles/CCTVGrid.css'

function CCTVGrid() {
  // Hardcoded CCTV data for 36 cameras (6x6 grid)
  const [cameras] = useState(() => {
    return Array.from({ length: 6 }, (_, index) => ({
      id: index + 1,
      name: `Camera ${index + 1}`,
      location: [
        'Main Entrance', 'Parking Lot', 'Lobby', 'Corridor A', 'Corridor B', 'Emergency Exit',
        'Stairwell 1', 'Elevator 1', 'Elevator 2', 'Storage Room', 'Office Wing', 'Conference Room',
        'Cafeteria', 'Loading Dock', 'Server Room', 'Rooftop', 'Perimeter North', 'Perimeter South',
        'Perimeter East', 'Perimeter West', 'Reception', 'Break Room', 'Restroom Area', 'Utility Room',
        'Basement', 'Garage Level 1', 'Garage Level 2', 'Back Entrance', 'Fire Exit A', 'Fire Exit B',
        'Stairwell 2', 'Maintenance Area', 'Equipment Room', 'Security Office', 'Archives', 'Data Center'
      ][index],
      status: Math.random() > 0.1 ? 'active' : 'offline',
      threatLevel: ['safe', 'safe', 'safe', 'safe', 'warning', 'safe'][Math.floor(Math.random() * 6)],
      lastUpdate: new Date().toLocaleTimeString()
    }))
  })

  const [selectedCamera, setSelectedCamera] = useState(null)
  const [viewMode, setViewMode] = useState('grid') // 'grid' or 'focus'

  const threatLevelColors = {
    safe: '#10b981',
    warning: '#f59e0b',
    danger: '#ef4444'
  }

  const handleCameraClick = (camera) => {
    setSelectedCamera(camera)
    setViewMode('focus')
  }

  const handleBackToGrid = () => {
    setViewMode('grid')
    setSelectedCamera(null)
  }

  const activeCameras = cameras.filter(c => c.status === 'active').length
  const warningCameras = cameras.filter(c => c.threatLevel === 'warning').length

  return (
    <div className="cctv-container">
      {/* Stats Bar */}
      <div className="stats-bar">
        <div className="stat-card">
          <div className="stat-icon">📹</div>
          <div className="stat-info">
            <span className="stat-value">{cameras.length}</span>
            <span className="stat-label">Total Cameras</span>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon success">✓</div>
          <div className="stat-info">
            <span className="stat-value">{activeCameras}</span>
            <span className="stat-label">Active</span>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon warning">⚠️</div>
          <div className="stat-info">
            <span className="stat-value">{warningCameras}</span>
            <span className="stat-label">Warnings</span>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon offline">⊗</div>
          <div className="stat-info">
            <span className="stat-value">{cameras.length - activeCameras}</span>
            <span className="stat-label">Offline</span>
          </div>
        </div>
      </div>

      {viewMode === 'grid' ? (
        <>
          {/* Controls */}
          <div className="controls-bar">
            <div className="control-group">
              <button className="btn-control active">All Cameras</button>
              <button className="btn-control">Active Only</button>
              <button className="btn-control">Warnings</button>
            </div>
            <div className="control-group">
              <input 
                type="text" 
                placeholder="Search cameras..." 
                className="search-input"
              />
            </div>
          </div>

          {/* CCTV Grid */}
          <div className="cctv-grid">
            {cameras.map((camera) => (
              <div 
                key={camera.id} 
                className={`camera-feed ${camera.status}`}
                onClick={() => handleCameraClick(camera)}
              >
                <div className="camera-video">
                  {camera.status === 'active' ? (
                    <>
                      <div className="video-placeholder">
                        <div className="scan-line"></div>
                        <div className="timestamp">
                          {camera.lastUpdate}
                        </div>
                      </div>
                      <div 
                        className="threat-indicator"
                        style={{ background: threatLevelColors[camera.threatLevel] }}
                      ></div>
                    </>
                  ) : (
                    <div className="offline-indicator">
                      <span className="offline-icon">⊗</span>
                      <span>Offline</span>
                    </div>
                  )}
                </div>
                <div className="camera-info">
                  <div className="camera-details">
                    <span className="camera-name">{camera.name}</span>
                    <span className="camera-location">{camera.location}</span>
                  </div>
                  <div className={`status-badge ${camera.status}`}>
                    {camera.status === 'active' ? '●' : '○'}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </>
      ) : (
        /* Focus View */
        <div className="camera-focus">
          <button className="btn-back" onClick={handleBackToGrid}>
            ← Back to Grid
          </button>
          <div className="focus-content">
            <div className="focus-video">
              <div className="video-placeholder large">
                <div className="scan-line"></div>
                <div className="timestamp large">
                  {selectedCamera?.lastUpdate}
                </div>
                <div className="detection-overlay">
                  <div className="detection-box">
                    <span className="detection-label">No threats detected</span>
                  </div>
                </div>
              </div>
              <div 
                className="threat-indicator large"
                style={{ background: threatLevelColors[selectedCamera?.threatLevel] }}
              ></div>
            </div>
            <div className="focus-sidebar">
              <div className="focus-info-card">
                <h3>Camera Information</h3>
                <div className="info-item">
                  <span className="info-label">Camera ID:</span>
                  <span className="info-value">{selectedCamera?.name}</span>
                </div>
                <div className="info-item">
                  <span className="info-label">Location:</span>
                  <span className="info-value">{selectedCamera?.location}</span>
                </div>
                <div className="info-item">
                  <span className="info-label">Status:</span>
                  <span className={`info-value ${selectedCamera?.status}`}>
                    {selectedCamera?.status}
                  </span>
                </div>
                <div className="info-item">
                  <span className="info-label">Threat Level:</span>
                  <span 
                    className="info-value"
                    style={{ color: threatLevelColors[selectedCamera?.threatLevel] }}
                  >
                    {selectedCamera?.threatLevel}
                  </span>
                </div>
                <div className="info-item">
                  <span className="info-label">Last Update:</span>
                  <span className="info-value">{selectedCamera?.lastUpdate}</span>
                </div>
              </div>

              <div className="focus-controls">
                <button className="btn-control-action">
                  📸 Take Snapshot
                </button>
                <button className="btn-control-action">
                  🔴 Start Recording
                </button>
                <button className="btn-control-action">
                  🚨 Report Incident
                </button>
              </div>

              <div className="focus-info-card">
                <h3>Recent Activity</h3>
                <div className="activity-list">
                  <div className="activity-item">
                    <span className="activity-time">2 min ago</span>
                    <span className="activity-text">Motion detected</span>
                  </div>
                  <div className="activity-item">
                    <span className="activity-time">15 min ago</span>
                    <span className="activity-text">Person identified</span>
                  </div>
                  <div className="activity-item">
                    <span className="activity-time">1 hour ago</span>
                    <span className="activity-text">System check completed</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default CCTVGrid
