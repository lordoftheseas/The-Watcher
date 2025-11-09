import { useState, useRef, useEffect } from 'react'
import { sendThreatEmail, isEmailConfigured } from '../services/emailService'
import { generateReport, saveReportToLocal } from '../services/reportService'
import '../styles/LiveCamera.css'
import professorImage from '../assets/professor.jpg'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000'

function LiveCamera() {
  const videoRef = useRef(null)
  const canvasRef = useRef(null)
  const [isStreaming, setIsStreaming] = useState(false)
  const [error, setError] = useState(null)
  const [threatLevel, setThreatLevel] = useState('safe')
  const [detections, setDetections] = useState([]) // Local state for all detections
  const [threatHistory, setThreatHistory] = useState([]) // Database history
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [lastAnalysis, setLastAnalysis] = useState(null)
  const [showHistory, setShowHistory] = useState(false)
  const [isLoadingHistory, setIsLoadingHistory] = useState(false)
  const [apiStats, setApiStats] = useState({ total_calls: 0, mode: 'direct_gemini_analysis' })
  const [geminiMetrics, setGeminiMetrics] = useState({
    objectsDetected: [],
    peopleCount: 0,
    recommendedAction: 'Monitoring...',
    averageConfidence: 0
  })
  const [demoEmailSent, setDemoEmailSent] = useState(false) // Track if demo email sent
  const analysisIntervalRef = useRef(null)

  // Load saved detections from localStorage on mount
  useEffect(() => {
    const savedDetections = localStorage.getItem('liveDetections')
    if (savedDetections) {
      try {
        const parsed = JSON.parse(savedDetections)
        setDetections(parsed)
      } catch (err) {
        console.error('Error loading saved detections:', err)
      }
    }
  }, [])

  // Save detections to localStorage whenever they change
  useEffect(() => {
    if (detections.length > 0) {
      localStorage.setItem('liveDetections', JSON.stringify(detections))
    }
  }, [detections])

  // Load threat history and API stats on component mount
  useEffect(() => {
    loadThreatHistory()
    loadApiStats()
    
    // Update API stats every 30 seconds
    const statsInterval = setInterval(loadApiStats, 30000)
    return () => clearInterval(statsInterval)
  }, [])

  const loadApiStats = async () => {
    try {
      const response = await fetch(`${API_URL}/health`)
      if (response.ok) {
        const result = await response.json()
        if (result.api_usage) {
          setApiStats({
            total_calls: result.api_usage.total_calls || 0,
            mode: result.api_usage.mode || 'direct_gemini_analysis'
          })
        }
      }
    } catch (err) {
      console.error('Error loading API stats:', err)
    }
  }

  // Real-time threat detection using Gemini API
  useEffect(() => {
    if (isStreaming && videoRef.current) {
      // Analyze frames every 3 seconds
      analysisIntervalRef.current = setInterval(async () => {
        await analyzeCurrentFrame()
      }, 3000)

      return () => {
        if (analysisIntervalRef.current) {
          clearInterval(analysisIntervalRef.current)
        }
      }
    }
  }, [isStreaming])

  const loadThreatHistory = async () => {
    try {
      setIsLoadingHistory(true)
      
      // Load reports from localStorage instead of database
      const { getLocalReports } = await import('../services/reportService')
      const localReports = getLocalReports()
      
      // Convert reports to threat history format
      const threats = localReports
        .filter(r => r.threatLevel === 'warning' || r.threatLevel === 'danger')
        .map(r => ({
          id: r.id,
          timestamp: r.timestamp,
          threat_level: r.threatLevel,
          description: r.description,
          confidence: r.confidence,
          details: r.details,
          camera_name: r.cameraName
        }))
      
      setThreatHistory(threats)
    } catch (err) {
      console.error('Error loading threat history:', err)
    } finally {
      setIsLoadingHistory(false)
    }
  }



  const captureFrame = () => {
    if (!videoRef.current) return null

    // Create a canvas to capture the current frame
    const canvas = document.createElement('canvas')
    canvas.width = videoRef.current.videoWidth
    canvas.height = videoRef.current.videoHeight
    const ctx = canvas.getContext('2d')
    ctx.drawImage(videoRef.current, 0, 0)

    return canvas
  }

  const analyzeCurrentFrame = async () => {
    if (!videoRef.current || isAnalyzing) return

    try {
      setIsAnalyzing(true)

      const canvas = captureFrame()
      if (!canvas) return

      // Convert canvas to blob
      const blob = await new Promise(resolve => canvas.toBlob(resolve, 'image/jpeg', 0.8))

      // Create FormData and send to backend
      const formData = new FormData()
      formData.append('file', blob, 'frame.jpg')

      const response = await fetch(`${API_URL}/api/analyze-frame`, {
        method: 'POST',
        body: formData
      })

      if (!response.ok) {
        throw new Error('Failed to analyze frame')
      }

      const result = await response.json()
      
      if (result.success && result.analysis) {
        const analysis = result.analysis
        setLastAnalysis(analysis)

        // Update threat level
        setThreatLevel(analysis.threat_level || 'safe')

        // Build human-readable details from JSON data
        const readableDetails = []
        if (analysis.objects_detected && analysis.objects_detected.length > 0) {
          readableDetails.push(`Objects: ${analysis.objects_detected.join(', ')}`)
        }
        if (analysis.people_count !== undefined) {
          readableDetails.push(`People count: ${analysis.people_count}`)
        }
        if (analysis.recommended_action) {
          readableDetails.push(`Action: ${analysis.recommended_action}`)
        }

        // Add detection to local log - SHOW PLAIN DESCRIPTION ONLY
        const newDetection = {
          id: Date.now(),
          text: analysis.description || 'Analysis completed', // Plain text description
          time: new Date().toLocaleTimeString(),
          timestamp: new Date().toISOString(),
          threatLevel: analysis.threat_level,
          confidence: analysis.confidence,
          details: readableDetails,
          // Keep raw JSON data for report generation
          rawData: analysis
        }

        setDetections(prev => [newDetection, ...prev].slice(0, 10))

        // Update Gemini metrics from API response
        setGeminiMetrics({
          objectsDetected: analysis.objects_detected || [],
          peopleCount: analysis.people_count || 0,
          recommendedAction: analysis.recommended_action || 'Continue monitoring',
          averageConfidence: analysis.confidence || 0
        })

        // Generate and save report LOCALLY for warning/danger threats
        // Capture snapshot at the moment of threat detection
        if (analysis.threat_level === 'warning' || analysis.threat_level === 'danger') {
          console.log('📸 Capturing snapshot for report...')
          
          // Capture the current frame as snapshot
          const snapshotCanvas = captureFrame()
          let snapshotImage = null
          
          if (snapshotCanvas) {
            // Convert canvas to base64 image
            snapshotImage = snapshotCanvas.toDataURL('image/jpeg', 0.85)
          }
          
          // Generate report with snapshot
          const report = generateReport(analysis, snapshotImage)
          const saveResult = saveReportToLocal(report)
          
          if (saveResult.success) {
            console.log('✅ Report generated with snapshot and saved locally:', report.id)
            setDetections(prev => [{
              id: Date.now() + 1,
              text: `📄 Report generated: ${report.id}`,
              time: new Date().toLocaleTimeString(),
              threatLevel: 'safe',
              confidence: 1.0
            }, ...prev].slice(0, 10))
          }
        }

        // DEMO: Send email on FIRST detection (any threat level)
        if (!demoEmailSent && isEmailConfigured()) {
          console.log('📧 DEMO: Sending first detection email...')
          setDemoEmailSent(true) // Mark as sent so we don't send again
          
          try {
            const emailResult = await sendThreatEmail(analysis)
            if (emailResult.success) {
              console.log('✅ Demo email sent successfully!')
              setDetections(prev => [{
                id: Date.now() + 1,
                text: '📧 Demo email sent successfully!',
                time: new Date().toLocaleTimeString(),
                threatLevel: 'safe',
                confidence: 1.0
              }, ...prev].slice(0, 10))
            } else {
              console.error('❌ Failed to send demo email:', emailResult.error || emailResult.message)
              setDetections(prev => [{
                id: Date.now() + 1,
                text: `⚠️ Demo email failed: ${emailResult.error || emailResult.message}`,
                time: new Date().toLocaleTimeString(),
                threatLevel: 'warning',
                details: ['Check EmailJS configuration in .env', 'Verify service and template IDs']
              }, ...prev].slice(0, 10))
            }
          } catch (emailError) {
            console.error('❌ Demo email error:', emailError)
          }
        }
        
        // Send email notification for warning and danger threats (normal behavior)
        if (analysis.threat_level === 'warning' || analysis.threat_level === 'danger') {
          if (isEmailConfigured() && demoEmailSent) { // Only send if demo already sent
            console.log('📧 Attempting to send email for threat level:', analysis.threat_level)
            try {
              const emailResult = await sendThreatEmail(analysis)
              if (emailResult.success) {
                console.log('✅ Email notification sent successfully')
                setDetections(prev => [{
                  id: Date.now() + 1,
                  text: '✅ Email alert sent successfully',
                  time: new Date().toLocaleTimeString(),
                  threatLevel: 'safe',
                  confidence: 1.0
                }, ...prev].slice(0, 10))
              } else {
                console.error('❌ Failed to send email:', emailResult.error || emailResult.message)
                setDetections(prev => [{
                  id: Date.now() + 1,
                  text: `⚠️ Email failed: ${emailResult.error || emailResult.message}`,
                  time: new Date().toLocaleTimeString(),
                  threatLevel: 'warning',
                  details: ['Check EmailJS configuration in .env', 'Verify service and template IDs']
                }, ...prev].slice(0, 10))
              }
            } catch (emailError) {
              console.error('❌ Email error:', emailError)
            }
          } else {
            console.warn('⚠️ EmailJS not configured. Set VITE_EMAILJS_* variables in .env')
          }
        }

        // Log to console for debugging
        console.log('Threat Analysis:', analysis)
      }

    } catch (err) {
      console.error('Error analyzing frame:', err)
      // Add error to detection log with more details
      const errorMessage = err.message || 'Unknown error'
      const isNetworkError = errorMessage.includes('fetch') || errorMessage.includes('Failed to analyze')
      
      setDetections(prev => [{
        id: Date.now(),
        text: isNetworkError 
          ? '⚠️ Cannot reach backend server - is it running on port 8000?' 
          : `Analysis error: ${errorMessage}`,
        time: new Date().toLocaleTimeString(),
        threatLevel: 'safe',
        details: isNetworkError 
          ? ['Check backend server is running', 'Run: cd backend && python3.13 -m uvicorn main:app --reload']
          : [errorMessage]
      }, ...prev].slice(0, 10))
    } finally {
      setIsAnalyzing(false)
    }
  }

  const startCamera = async () => {
    try {
      setError(null)
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { 
          width: { ideal: 1280 },
          height: { ideal: 720 }
        },
        audio: false 
      })
      
      if (videoRef.current) {
        videoRef.current.srcObject = stream
        setIsStreaming(true)
      }
    } catch (err) {
      console.error('Error accessing camera:', err)
      setError('Unable to access camera. Please ensure you have granted camera permissions.')
    }
  }

  const stopCamera = () => {
    if (videoRef.current && videoRef.current.srcObject) {
      const stream = videoRef.current.srcObject
      const tracks = stream.getTracks()
      tracks.forEach(track => track.stop())
      videoRef.current.srcObject = null
      setIsStreaming(false)
    }
  }



  const takeSnapshot = () => {
    if (!isStreaming || !videoRef.current) return
    
    const canvas = document.createElement('canvas')
    canvas.width = videoRef.current.videoWidth
    canvas.height = videoRef.current.videoHeight
    const ctx = canvas.getContext('2d')
    ctx.drawImage(videoRef.current, 0, 0)
    
    // Download the snapshot
    canvas.toBlob(blob => {
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `snapshot-${Date.now()}.png`
      a.click()
      URL.revokeObjectURL(url)
    })
  }

  const threatLevelColors = {
    safe: '#10b981',
    warning: '#f59e0b',
    danger: '#ef4444'
  }

  return (
    <div className="live-camera-container">
      <div className="camera-layout">
        {/* Main Video Feed */}
        <div className="video-section">
          <div className="video-container">
            {!isStreaming && !error && (
              <div className="video-placeholder">
                <div className="placeholder-content">
                  <img 
                    src={professorImage} 
                    alt="Big Brother" 
                    className="professor-image"
                    style={{
                      width: '180px',
                      height: '180px',
                      objectFit: 'cover',
                      borderRadius: '50%',
                      marginBottom: '15px',
                      border: '3px solid #3b82f6',
                      boxShadow: '0 0 20px rgba(59, 130, 246, 0.5)'
                    }}
                  />
                  <h3 style={{ fontSize: '1.4rem', marginBottom: '8px', lineHeight: '1.3' }}>Big Brother is Always Watching You</h3>
                  <p style={{ fontSize: '0.95rem' }}>Click "Start Camera" to begin live monitoring</p>
                </div>
              </div>
            )}
            
            {error && (
              <div className="video-placeholder error">
                <div className="placeholder-content">
                  <span className="placeholder-icon">⚠️</span>
                  <h3>Camera Access Error</h3>
                  <p>{error}</p>
                  <button className="btn-retry" onClick={startCamera}>
                    Try Again
                  </button>
                </div>
              </div>
            )}

            <video
              ref={videoRef}
              autoPlay
              playsInline
              className={`video-feed ${isStreaming ? 'active' : ''}`}
            />

            {isStreaming && (
              <>
                <div className="video-overlay">
                  <div className="overlay-top">
                    <div className="recording-indicator">
                      <span className="rec-dot"></span>
                      <span>LIVE</span>
                    </div>
                    <div className="timestamp">
                      {new Date().toLocaleString()}
                    </div>
                  </div>
                  
                  <div className="detection-overlay">
                    <div className="scan-line"></div>
                    <div className="detection-frame"></div>
                  </div>

                  <div className="overlay-bottom">
                    <div 
                      className="threat-indicator"
                      style={{ background: threatLevelColors[threatLevel] }}
                    >
                      <span className="threat-icon">
                        {threatLevel === 'safe' ? '✓' : '⚠'}
                      </span>
                      <span>Threat Level: {threatLevel.toUpperCase()}</span>
                    </div>
                  </div>
                </div>
              </>
            )}
          </div>

          {/* Camera Controls */}
          <div className="camera-controls">
            <div className="control-group">
              {!isStreaming ? (
                <button className="btn-control primary" onClick={startCamera}>
                  <span>▶</span> Start Camera
                </button>
              ) : (
                <button className="btn-control danger" onClick={stopCamera}>
                  <span>⏹</span> Stop Camera
                </button>
              )}
              
              <button 
                className="btn-control"
                onClick={takeSnapshot}
                disabled={!isStreaming}
              >
                <span>📸</span> Take Snapshot
              </button>
            </div>

            <div className="control-group">
              <button className="btn-control" disabled={!isStreaming}>
                <span>🔄</span> Rotate
              </button>
              <button className="btn-control" disabled={!isStreaming}>
                <span>🔍</span> Zoom
              </button>
              <button className="btn-control" disabled={!isStreaming}>
                <span>⚙️</span> Settings
              </button>
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div className="sidebar-section">
          {/* Camera Info */}
          <div className="info-card">
            <h3>Camera Information</h3>
            <div className="info-grid">
              <div className="info-item">
                <span className="info-label">Status:</span>
                <span className={`info-value ${isStreaming ? 'active' : 'inactive'}`}>
                  {isStreaming ? 'Active' : 'Inactive'}
                </span>
              </div>
              <div className="info-item">
                <span className="info-label">Resolution:</span>
                <span className="info-value">1280x720</span>
              </div>
              <div className="info-item">
                <span className="info-label">FPS:</span>
                <span className="info-value">30</span>
              </div>
              <div className="info-item">
                <span className="info-label">Source:</span>
                <span className="info-value">Webcam</span>
              </div>
            </div>
            
            {/* Gemini AI Metrics */}
            <div className="compact-stats">
              <div className="compact-stat-item">
                <span className="compact-stat-icon">👁️</span>
                <span className="compact-stat-value">{geminiMetrics.objectsDetected.length > 0 ? geminiMetrics.objectsDetected.join(', ') : 'None'}</span>
                <span className="compact-stat-label">Objects Detected</span>
              </div>
              {/* <div className="compact-stat-item">
                <span className="compact-stat-icon">👥</span>
                <span className="compact-stat-value">{geminiMetrics.peopleCount}</span>
                <span className="compact-stat-label">People Count</span>
              </div> */}
              {/* <div className="compact-stat-item">
                <span className="compact-stat-icon">⚡</span>
                <span className="compact-stat-value">{geminiMetrics.recommendedAction}</span>
                <span className="compact-stat-label">Recommended Action</span>
              </div> */}
              <div className="compact-stat-item">
                <span className="compact-stat-icon">🎯</span>
                <span className="compact-stat-value">{(geminiMetrics.averageConfidence * 100).toFixed(0)}%</span>
                <span className="compact-stat-label">Confidence</span>
              </div>
            </div>
          </div>

          {/* Threat Analysis */}
          <div className="info-card">
            <h3>Threat Analysis</h3>
            <div className="threat-meter">
              <div className="meter-label">Current Threat Level</div>
              <div className="meter-bar">
                <div 
                  className="meter-fill"
                  style={{ 
                    width: threatLevel === 'safe' ? '20%' : threatLevel === 'warning' ? '60%' : '90%',
                    background: threatLevelColors[threatLevel]
                  }}
                ></div>
              </div>
              <div 
                className="meter-value"
                style={{ color: threatLevelColors[threatLevel] }}
              >
                {threatLevel.toUpperCase()}
              </div>
            </div>
          </div>

          {/* Detection Log */}
          <div className="info-card detection-log">
            <div className="log-header-tabs">
              <h3 
                className={!showHistory ? 'active' : ''}
                onClick={() => setShowHistory(false)}
              >
                Live Log {isAnalyzing && <span className="analyzing-badge">🔍</span>}
              </h3>
              <h3 
                className={showHistory ? 'active' : ''}
                onClick={() => setShowHistory(true)}
              >
                History ({threatHistory.length})
              </h3>
            </div>

            {!showHistory ? (
              /* Live Detection Log */
              <div className="log-list">
                {detections.length === 0 ? (
                  <div className="log-empty">
                    <span>No detections yet</span>
                    {isStreaming && <span className="log-hint">Starting analysis...</span>}
                  </div>
                ) : (
                  detections.map(detection => (
                    <div key={detection.id} className={`log-item ${detection.threatLevel}`}>
                      <div className="log-header">
                        <span className="log-time">{detection.time}</span>
                        {detection.confidence && (
                          <span className="log-confidence">
                            {Math.round(detection.confidence * 100)}%
                          </span>
                        )}
                      </div>
                      <span className="log-text">{detection.text}</span>
                      {detection.details && detection.details.length > 0 && (
                        <div className="log-details">
                          {detection.details.map((detail, idx) => (
                            <span key={idx} className="detail-item">• {detail}</span>
                          ))}
                        </div>
                      )}
                    </div>
                  ))
                )}
              </div>
            ) : (
              /* Threat History from Database */
              <div className="log-list">
                {isLoadingHistory ? (
                  <div className="log-empty">
                    <span>Loading history...</span>
                  </div>
                ) : threatHistory.length === 0 ? (
                  <div className="log-empty">
                    <span>No threat history</span>
                    <span className="log-hint">Warnings and danger detections appear here</span>
                  </div>
                ) : (
                  threatHistory.map((threat, index) => (
                    <div key={threat.id || index} className={`log-item ${threat.threat_level}`}>
                      <div className="log-header">
                        <span className="log-time">
                          {new Date(threat.timestamp).toLocaleString()}
                        </span>
                        <span className="log-confidence">
                          {Math.round(threat.confidence * 100)}%
                        </span>
                      </div>
                      <div className="log-threat-badge">
                        {threat.threat_level === 'danger' ? '🚨' : '⚠️'} {threat.threat_level.toUpperCase()}
                      </div>
                      <span className="log-text">{threat.description}</span>
                      {threat.details && threat.details.length > 0 && (
                        <div className="log-details">
                          {threat.details.map((detail, idx) => (
                            <span key={idx} className="detail-item">• {detail}</span>
                          ))}
                        </div>
                      )}
                      <div className="log-camera-name">📹 {threat.camera_name}</div>
                    </div>
                  ))
                )}
              </div>
            )}
          </div>

          {/* Quick Actions */}
          <div className="info-card">
            <h3>Quick Actions</h3>
            <div className="action-buttons">
              <button className="btn-action" disabled={!isStreaming}>
                🚨 Report Incident
              </button>
              <button className="btn-action" disabled={!isStreaming}>
                📧 Send Alert
              </button>
              <button className="btn-action" disabled={!isStreaming}>
                💾 Save Session
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default LiveCamera
