import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'
import '../styles/Reports.css'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000'

function Reports() {
  const [selectedReport, setSelectedReport] = useState(null)
  const [filterStatus, setFilterStatus] = useState('all')
  const [filterThreat, setFilterThreat] = useState('all')
  const [reports, setReports] = useState([])
  const [isLoading, setIsLoading] = useState(true)

  // Load reports from database
  useEffect(() => {
    loadReports()
  }, [])

  const loadReports = async () => {
    try {
      setIsLoading(true)
      
      // Get current session
      const { data: { session } } = await supabase.auth.getSession()
      
      if (!session) {
        console.log('No session found')
        setReports([])
        return
      }

      const response = await fetch(`${API_URL}/api/threat-detections?auth_token=${session.access_token}&limit=100`)
      
      if (!response.ok) {
        throw new Error('Failed to load reports')
      }

      const result = await response.json()
      
      if (result.success && result.detections) {
        // Transform database detections to report format
        const transformedReports = result.detections.map((detection, index) => {
          // Determine icon based on threat level
          let icon = '✓'
          if (detection.threat_level === 'danger') icon = '🚨'
          else if (detection.threat_level === 'warning') icon = '⚠️'
          
          // Parse details to extract structured information
          const details = Array.isArray(detection.details) ? detection.details : []
          const objectsLine = details.find(d => d.startsWith('Objects detected:'))
          const peopleLine = details.find(d => d.startsWith('People count:'))
          const actionLine = details.find(d => d.startsWith('Recommended action:'))
          
          return {
            id: detection.id,
            title: `${icon} ${detection.description.substring(0, 50)}...`,
            date: new Date(detection.timestamp).toISOString().split('T')[0],
            time: new Date(detection.timestamp).toLocaleTimeString(),
            location: detection.camera_name || 'Live Camera',
            cameraId: detection.camera_name || 'Live Camera',
            threatLevel: detection.threat_level,
            status: detection.reviewed ? 'resolved' : 'under-review',
            description: detection.description,
            detections: details,
            duration: 'Live detection',
            assignedTo: 'Security Team',
            priority: detection.threat_level === 'danger' ? 'high' : 
                     detection.threat_level === 'warning' ? 'medium' : 'low',
            confidence: detection.confidence,
            reportId: detection.report_id || `#${detection.id}`,
            timestamp: detection.timestamp,
            imageData: detection.image_data,
            imageUrl: detection.image_url
          }
        })
        
        setReports(transformedReports)
      } else {
        setReports([])
      }
    } catch (err) {
      console.error('Error loading reports:', err)
      setReports([])
    } finally {
      setIsLoading(false)
    }
  }

  const filteredReports = reports.filter(report => {
    const statusMatch = filterStatus === 'all' || report.status === filterStatus
    const threatMatch = filterThreat === 'all' || report.threatLevel === filterThreat
    return statusMatch && threatMatch
  })

  const handleReportClick = (report) => {
    setSelectedReport(report)
  }

  const handleCloseDetail = () => {
    setSelectedReport(null)
  }

  const getThreatColor = (level) => {
    const colors = {
      safe: '#10b981',
      warning: '#f59e0b',
      danger: '#ef4444'
    }
    return colors[level]
  }

  const getStatusBadgeClass = (status) => {
    return status.replace('-', '_')
  }

  const getPriorityColor = (priority) => {
    const colors = {
      low: '#10b981',
      medium: '#f59e0b',
      high: '#ef4444'
    }
    return colors[priority]
  }

  return (
    <div className="reports-container">
      {isLoading && (
        <div className="loading-overlay">
          <div className="loading-spinner">Loading reports...</div>
        </div>
      )}
      
      {/* Stats Bar */}
      <div className="reports-stats">
        <div className="stat-card">
          <div className="stat-icon">📊</div>
          <div className="stat-info">
            <span className="stat-value">{reports.length}</span>
            <span className="stat-label">Total Reports</span>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon review">🔍</div>
          <div className="stat-info">
            <span className="stat-value">
              {reports.filter(r => r.status === 'under-review').length}
            </span>
            <span className="stat-label">Under Review</span>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon success">✓</div>
          <div className="stat-info">
            <span className="stat-value">
              {reports.filter(r => r.status === 'resolved').length}
            </span>
            <span className="stat-label">Resolved</span>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon warning">⚠️</div>
          <div className="stat-info">
            <span className="stat-value">
              {reports.filter(r => r.threatLevel === 'warning' || r.threatLevel === 'danger').length}
            </span>
            <span className="stat-label">High Priority</span>
          </div>
        </div>
      </div>

      <div className="reports-layout">
        {/* Reports List */}
        <div className="reports-list">
          {/* Filters */}
          <div className="filters-bar">
            <div className="filter-group">
              <label>Status:</label>
              <select 
                value={filterStatus} 
                onChange={(e) => setFilterStatus(e.target.value)}
                className="filter-select"
              >
                <option value="all">All</option>
                <option value="under-review">Under Review</option>
                <option value="resolved">Resolved</option>
              </select>
            </div>
            <div className="filter-group">
              <label>Threat Level:</label>
              <select 
                value={filterThreat} 
                onChange={(e) => setFilterThreat(e.target.value)}
                className="filter-select"
              >
                <option value="all">All</option>
                <option value="safe">Safe</option>
                <option value="warning">Warning</option>
                <option value="danger">Danger</option>
              </select>
            </div>
            <button className="btn-filter">
              <span>📥</span> Export
            </button>
          </div>

          {/* Report Cards */}
          <div className="report-cards">
            {filteredReports.map(report => (
              <div 
                key={report.id}
                className={`report-card ${selectedReport?.id === report.id ? 'selected' : ''}`}
                onClick={() => handleReportClick(report)}
              >
                <div className="report-header">
                  <div className="report-title-section">
                    <h3 className="report-title">{report.title}</h3>
                    <span className="report-location">📍 {report.location}</span>
                  </div>
                  <div 
                    className="threat-badge"
                    style={{ background: getThreatColor(report.threatLevel) }}
                  >
                    {report.threatLevel}
                  </div>
                </div>
                <div className="report-meta">
                  <span className="meta-item">
                    <span className="meta-icon">📅</span>
                    {report.date}
                  </span>
                  <span className="meta-item">
                    <span className="meta-icon">🕐</span>
                    {report.time}
                  </span>
                  <span className="meta-item">
                    <span className="meta-icon">📹</span>
                    {report.cameraId}
                  </span>
                </div>
                <p className="report-preview">{report.description}</p>
                <div className="report-footer">
                  <span className={`status-badge ${getStatusBadgeClass(report.status)}`}>
                    {report.status.replace('-', ' ')}
                  </span>
                  <span 
                    className="priority-badge"
                    style={{ color: getPriorityColor(report.priority) }}
                  >
                    {report.priority} priority
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Report Detail */}
        <div className="report-detail">
          {selectedReport ? (
            <>
              <div className="detail-header">
                <h2>{selectedReport.title}</h2>
                <button className="btn-close" onClick={handleCloseDetail}>
                  ✕
                </button>
              </div>

              <div className="detail-content">
                <div className="detail-section">
                  <h3>Overview</h3>
                  <div className="detail-grid">
                    <div className="detail-item">
                      <span className="detail-label">Report ID:</span>
                      <span className="detail-value">
                        {selectedReport.reportId || `#${selectedReport.id.toString().padStart(6, '0')}`}
                      </span>
                    </div>
                    <div className="detail-item">
                      <span className="detail-label">Date:</span>
                      <span className="detail-value">{selectedReport.date}</span>
                    </div>
                    <div className="detail-item">
                      <span className="detail-label">Time:</span>
                      <span className="detail-value">{selectedReport.time}</span>
                    </div>
                    {selectedReport.confidence && (
                      <div className="detail-item">
                        <span className="detail-label">Confidence:</span>
                        <span className="detail-value">{Math.round(selectedReport.confidence * 100)}%</span>
                      </div>
                    )}
                    <div className="detail-item">
                      <span className="detail-label">Duration:</span>
                      <span className="detail-value">{selectedReport.duration}</span>
                    </div>
                    <div className="detail-item">
                      <span className="detail-label">Location:</span>
                      <span className="detail-value">{selectedReport.location}</span>
                    </div>
                    <div className="detail-item">
                      <span className="detail-label">Camera:</span>
                      <span className="detail-value">{selectedReport.cameraId}</span>
                    </div>
                    <div className="detail-item">
                      <span className="detail-label">Threat Level:</span>
                      <span 
                        className="detail-value"
                        style={{ color: getThreatColor(selectedReport.threatLevel) }}
                      >
                        {selectedReport.threatLevel.toUpperCase()}
                      </span>
                    </div>
                    <div className="detail-item">
                      <span className="detail-label">Status:</span>
                      <span className={`detail-value status ${getStatusBadgeClass(selectedReport.status)}`}>
                        {selectedReport.status.replace('-', ' ')}
                      </span>
                    </div>
                    <div className="detail-item">
                      <span className="detail-label">Priority:</span>
                      <span 
                        className="detail-value"
                        style={{ color: getPriorityColor(selectedReport.priority) }}
                      >
                        {selectedReport.priority.toUpperCase()}
                      </span>
                    </div>
                    <div className="detail-item">
                      <span className="detail-label">Assigned To:</span>
                      <span className="detail-value">{selectedReport.assignedTo}</span>
                    </div>
                  </div>
                </div>

                <div className="detail-section">
                  <h3>Description</h3>
                  <p className="detail-description">{selectedReport.description}</p>
                </div>

                <div className="detail-section">
                  <h3>Detections</h3>
                  <div className="detection-tags">
                    {selectedReport.detections.map((detection, index) => (
                      <span key={index} className="detection-tag">
                        {detection}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Show captured image if available */}
                {(selectedReport.imageData || selectedReport.imageUrl) && (
                  <div className="detail-section">
                    <h3>Captured Frame at Detection</h3>
                    <div className="image-evidence">
                      <img 
                        src={selectedReport.imageData || selectedReport.imageUrl} 
                        alt="Threat detection frame"
                        style={{
                          maxWidth: '100%',
                          borderRadius: '8px',
                          border: '2px solid #333',
                          boxShadow: '0 4px 6px rgba(0,0,0,0.3)'
                        }}
                      />
                      <p style={{ 
                        fontSize: '0.9rem', 
                        color: '#888', 
                        marginTop: '8px',
                        textAlign: 'center'
                      }}>
                        📸 Frame captured at {selectedReport.time} on {selectedReport.date}
                      </p>
                    </div>
                  </div>
                )}

                <div className="detail-section">
                  <h3>Video Evidence</h3>
                  <div className="video-thumbnail">
                    <div className="thumbnail-placeholder">
                      <span className="thumbnail-icon">📹</span>
                      <span>Video Recording Available</span>
                      <button className="btn-play">▶ Play Video</button>
                    </div>
                  </div>
                </div>

                <div className="detail-actions">
                  <button className="btn-action-detail">
                    📧 Send Report
                  </button>
                  <button className="btn-action-detail">
                    📥 Download
                  </button>
                  <button className="btn-action-detail">
                    🖨️ Print
                  </button>
                  <button className="btn-action-detail primary">
                    ✓ Mark as Resolved
                  </button>
                </div>
              </div>
            </>
          ) : (
            <div className="detail-empty">
              <span className="empty-icon">📋</span>
              <h3>No Report Selected</h3>
              <p>Select a report from the list to view details</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default Reports
