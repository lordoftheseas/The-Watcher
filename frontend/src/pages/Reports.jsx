import { useState } from 'react'
import '../styles/Reports.css'

function Reports() {
  const [selectedReport, setSelectedReport] = useState(null)
  const [filterStatus, setFilterStatus] = useState('all')
  const [filterThreat, setFilterThreat] = useState('all')

  // Hardcoded report data
  const [reports] = useState([
    {
      id: 1,
      title: 'Suspicious Activity - Main Entrance',
      date: '2025-11-08',
      time: '14:30:00',
      location: 'Main Entrance',
      cameraId: 'Camera 1',
      threatLevel: 'warning',
      status: 'under-review',
      description: 'Unidentified individual loitering near entrance for extended period. No hostile actions observed.',
      detections: ['Person detected', 'Loitering behavior', 'Face not recognized'],
      duration: '15 minutes',
      assignedTo: 'Security Team A',
      priority: 'medium'
    },
    {
      id: 2,
      title: 'Unauthorized Access Attempt - Parking Lot',
      date: '2025-11-08',
      time: '02:15:00',
      location: 'Parking Lot',
      cameraId: 'Camera 2',
      threatLevel: 'danger',
      status: 'resolved',
      description: 'Individual attempted to access restricted parking area without proper credentials. Security responded and subject was escorted out.',
      detections: ['Unauthorized access', 'Security breach', 'Multiple persons'],
      duration: '8 minutes',
      assignedTo: 'Security Team B',
      priority: 'high'
    },
    {
      id: 3,
      title: 'Routine Check - Lobby',
      date: '2025-11-08',
      time: '10:00:00',
      location: 'Lobby',
      cameraId: 'Camera 3',
      threatLevel: 'safe',
      status: 'resolved',
      description: 'Scheduled security check completed. No anomalies detected. Area secure.',
      detections: ['Normal activity', 'Authorized personnel only'],
      duration: '5 minutes',
      assignedTo: 'Security Team A',
      priority: 'low'
    },
    {
      id: 4,
      title: 'Package Delivery - Loading Dock',
      date: '2025-11-08',
      time: '09:45:00',
      location: 'Loading Dock',
      cameraId: 'Camera 14',
      threatLevel: 'safe',
      status: 'resolved',
      description: 'Authorized delivery vehicle arrived. Package inspected and cleared. No security concerns.',
      detections: ['Vehicle detected', 'Package scan complete', 'Authorized personnel'],
      duration: '12 minutes',
      assignedTo: 'Security Team C',
      priority: 'low'
    },
    {
      id: 5,
      title: 'Motion After Hours - Office Wing',
      date: '2025-11-07',
      time: '22:30:00',
      location: 'Office Wing',
      cameraId: 'Camera 11',
      threatLevel: 'warning',
      status: 'under-review',
      description: 'Motion detected in office area during non-business hours. Investigating if authorized staff or maintenance.',
      detections: ['Motion detected', 'After hours activity', 'Light source detected'],
      duration: '25 minutes',
      assignedTo: 'Security Team B',
      priority: 'medium'
    },
    {
      id: 6,
      title: 'Fire Alarm Test - Multiple Locations',
      date: '2025-11-07',
      time: '15:00:00',
      location: 'Building-wide',
      cameraId: 'Multiple',
      threatLevel: 'safe',
      status: 'resolved',
      description: 'Scheduled fire alarm system test conducted successfully. All personnel evacuated orderly. System functioning properly.',
      detections: ['Alarm triggered', 'Evacuation procedures', 'All clear'],
      duration: '45 minutes',
      assignedTo: 'Security Team A',
      priority: 'low'
    },
    {
      id: 7,
      title: 'Tailgating Incident - Main Entrance',
      date: '2025-11-07',
      time: '08:15:00',
      location: 'Main Entrance',
      cameraId: 'Camera 1',
      threatLevel: 'warning',
      status: 'resolved',
      description: 'Individual attempted to enter without badge by following authorized person. Security intervened and verified credentials.',
      detections: ['Tailgating detected', 'Access control breach', 'Security response'],
      duration: '3 minutes',
      assignedTo: 'Security Team A',
      priority: 'high'
    },
    {
      id: 8,
      title: 'Crowd Detected - Cafeteria',
      date: '2025-11-07',
      time: '12:30:00',
      location: 'Cafeteria',
      cameraId: 'Camera 13',
      threatLevel: 'safe',
      status: 'resolved',
      description: 'Large gathering during lunch hour. Normal activity, no security concerns.',
      detections: ['Multiple persons', 'Normal behavior', 'Authorized area'],
      duration: '60 minutes',
      assignedTo: 'Security Team C',
      priority: 'low'
    }
  ])

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
                      <span className="detail-value">#{selectedReport.id.toString().padStart(6, '0')}</span>
                    </div>
                    <div className="detail-item">
                      <span className="detail-label">Date:</span>
                      <span className="detail-value">{selectedReport.date}</span>
                    </div>
                    <div className="detail-item">
                      <span className="detail-label">Time:</span>
                      <span className="detail-value">{selectedReport.time}</span>
                    </div>
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
