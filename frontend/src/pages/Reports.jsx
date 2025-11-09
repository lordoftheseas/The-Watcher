import { useState, useEffect } from 'react'
import { getLocalReports, generateDummyReport, exportReportsToJSON, clearAllReports } from '../services/reportService'
import '../styles/Reports.css'

function Reports() {
  const [selectedReport, setSelectedReport] = useState(null)
  const [filterStatus, setFilterStatus] = useState('all')
  const [filterThreat, setFilterThreat] = useState('all')
  const [reports, setReports] = useState([])
  const [isLoading, setIsLoading] = useState(true)

  // Load reports from localStorage
  useEffect(() => {
    loadReports()
  }, [])

  const loadReports = async () => {
    try {
      setIsLoading(true)
      
      // Load reports from localStorage
      const localReports = getLocalReports()
      
      // Transform to display format
      const transformedReports = localReports.map((report) => {
        // Determine icon based on threat level
        let icon = '✓'
        if (report.threatLevel === 'danger') icon = '🚨'
        else if (report.threatLevel === 'warning') icon = '⚠️'
        
        // Format details array
        const detailsArray = []
        if (report.objectsDetected && report.objectsDetected.length > 0) {
          detailsArray.push(`Objects: ${report.objectsDetected.join(', ')}`)
        }
        if (report.peopleCount !== undefined) {
          detailsArray.push(`People count: ${report.peopleCount}`)
        }
        if (report.recommendedAction) {
          detailsArray.push(`Action: ${report.recommendedAction}`)
        }
        if (report.details && Array.isArray(report.details)) {
          detailsArray.push(...report.details)
        }
        
        return {
          id: report.id,
          title: `${icon} ${report.description.substring(0, 50)}...`,
          date: report.date,
          time: report.time,
          location: report.cameraName,
          cameraId: report.cameraId,
          threatLevel: report.threatLevel,
          status: report.status,
          description: report.description,
          detections: detailsArray,
          duration: 'Live detection',
          assignedTo: 'Security Team',
          priority: report.priority,
          confidence: report.confidence,
          reportId: report.id,
          timestamp: report.timestamp,
          snapshotImage: report.snapshotImage, // Captured snapshot
          imageData: report.imageData, // Fallback
          objectsDetected: report.objectsDetected,
          peopleCount: report.peopleCount,
          recommendedAction: report.recommendedAction
        }
      })
      
      setReports(transformedReports)
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

  const handleGenerateDummyReport = () => {
    const result = generateDummyReport()
    if (result.success) {
      alert('✅ Dummy report generated successfully!')
      loadReports() // Reload to show new report
    }
  }

  const handleExportReports = () => {
    exportReportsToJSON()
    alert('✅ Reports exported to JSON file!')
  }

  const handleClearReports = () => {
    if (confirm('Are you sure you want to delete all reports? This cannot be undone.')) {
      clearAllReports()
      setReports([])
      setSelectedReport(null)
      alert('✅ All reports cleared!')
    }
  }

  return (
    <div className="reports-container">
      {isLoading && (
        <div className="loading-overlay">
          <div className="loading-spinner">Loading reports...</div>
        </div>
      )}
      
      {/* Action Buttons */}
      <div style={{ padding: '20px', display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
        <button 
          onClick={handleGenerateDummyReport}
          style={{
            padding: '8px 16px',
            background: '#3b82f6',
            color: 'white',
            border: 'none',
            borderRadius: '5px',
            cursor: 'pointer',
            fontSize: '14px'
          }}
        >
          📄 Generate Dummy Report
        </button>
        <button 
          onClick={handleExportReports}
          style={{
            padding: '8px 16px',
            background: '#10b981',
            color: 'white',
            border: 'none',
            borderRadius: '5px',
            cursor: 'pointer',
            fontSize: '14px'
          }}
        >
          💾 Export to JSON
        </button>
        <button 
          onClick={handleClearReports}
          style={{
            padding: '8px 16px',
            background: '#ef4444',
            color: 'white',
            border: 'none',
            borderRadius: '5px',
            cursor: 'pointer',
            fontSize: '14px'
          }}
        >
          🗑️ Clear All Reports
        </button>
      </div>
      
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

                {/* Show captured snapshot if available */}
                {(selectedReport.snapshotImage || selectedReport.imageData || selectedReport.imageUrl) && (
                  <div className="detail-section">
                    <h3>Captured Snapshot at Detection</h3>
                    <div className="image-evidence">
                      <img 
                        src={selectedReport.snapshotImage || selectedReport.imageData || selectedReport.imageUrl} 
                        alt="Threat detection snapshot"
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
