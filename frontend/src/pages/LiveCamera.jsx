import { useState, useRef, useEffect } from 'react'
import { supabase } from '../lib/supabase'
import { sendThreatEmail, isEmailConfigured } from '../services/emailService'
import '../styles/LiveCamera.css'

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
      
      // Get current session
      const { data: { session } } = await supabase.auth.getSession()
      
      if (!session) {
        console.log('No session found')
        return
      }

      const response = await fetch(`${API_URL}/api/threat-detections?auth_token=${session.access_token}&limit=50`)
      
      if (!response.ok) {
        throw new Error('Failed to load threat history')
      }

      const result = await response.json()
      
      if (result.success) {
        setThreatHistory(result.detections || [])
      }
    } catch (err) {
      console.error('Error loading threat history:', err)
    } finally {
      setIsLoadingHistory(false)
    }
  }

  const saveThreatToDatabase = async (analysis) => {
    try {
      // Save ALL detections (safe, warning, danger) with confidence >= 0.5
      if (analysis.confidence >= 0.5) {
        
        // Get current session
        const { data: { session } } = await supabase.auth.getSession()
        
        if (!session) {
          console.log('No session, skipping database save')
          return
        }

        // The analysis now includes image_data captured by Gemini
        const response = await fetch(`${API_URL}/api/threat-detections`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            auth_token: session.access_token,
            camera_name: 'Live Camera',
            detection: analysis,  // This includes image_data from Gemini
            image_url: null  // Optional: for external storage URLs
          })
        })

        if (response.ok) {
          const result = await response.json()
          console.log('✅ Detection saved to database:', result)
          
          // Reload history to show new detection
          await loadThreatHistory()
        }
      }
    } catch (err) {
      console.error('Error saving detection to database:', err)
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

        // Add detection to local log
        const newDetection = {
          id: Date.now(),
          text: analysis.description || 'Analysis completed',
          time: new Date().toLocaleTimeString(),
          timestamp: new Date().toISOString(),
          threatLevel: analysis.threat_level,
          confidence: analysis.confidence,
          details: analysis.details || []
        }

        setDetections(prev => [newDetection, ...prev].slice(0, 10))

        // Update Gemini metrics from API response
        setGeminiMetrics({
          objectsDetected: analysis.objects_detected || [],
          peopleCount: analysis.people_count || 0,
          recommendedAction: analysis.recommended_action || 'Continue monitoring',
          averageConfidence: analysis.confidence || 0
        })

        // Save ALL detections to database (snapshot already captured by Gemini)
        await saveThreatToDatabase(analysis)

        // Send email notification for warning and danger threats
        if (analysis.threat_level === 'warning' || analysis.threat_level === 'danger') {
          if (isEmailConfigured()) {
            const emailResult = await sendThreatEmail(analysis)
            if (emailResult.success) {
              console.log('📧 Email notification sent for threat:', analysis.threat_level)
            } else {
              console.error('Failed to send email notification:', emailResult.error)
            }
          } else {
            console.warn('Email notifications not configured. Set VITE_EMAILJS_* variables in .env')
          }
        }

        // Log to console for debugging
        console.log('Threat Analysis:', analysis)
      }

    } catch (err) {
      console.error('Error analyzing frame:', err)
      // Add error to detection log
      setDetections(prev => [{
        id: Date.now(),
        text: 'Analysis error - continuing monitoring',
        time: new Date().toLocaleTimeString(),
        threatLevel: 'safe'
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
                  <span className="placeholder-icon">📹</span>
                  <h3>Camera Not Active</h3>
                  <p>Click "Start Camera" to begin live monitoring</p>
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
              <div className="compact-stat-item">
                <span className="compact-stat-icon">👥</span>
                <span className="compact-stat-value">{geminiMetrics.peopleCount}</span>
                <span className="compact-stat-label">People Count</span>
              </div>
              <div className="compact-stat-item">
                <span className="compact-stat-icon">⚡</span>
                <span className="compact-stat-value">{geminiMetrics.recommendedAction}</span>
                <span className="compact-stat-label">Recommended Action</span>
              </div>
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
