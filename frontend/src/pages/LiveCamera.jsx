import { useState, useRef, useEffect } from 'react'
import '../styles/LiveCamera.css'

function LiveCamera() {
  const videoRef = useRef(null)
  const [isStreaming, setIsStreaming] = useState(false)
  const [error, setError] = useState(null)
  const [threatLevel, setThreatLevel] = useState('safe')
  const [detections, setDetections] = useState([])
  const [isRecording, setIsRecording] = useState(false)

  useEffect(() => {
    // Simulate threat detection updates
    if (isStreaming) {
      const interval = setInterval(() => {
        const levels = ['safe', 'safe', 'safe', 'warning']
        setThreatLevel(levels[Math.floor(Math.random() * levels.length)])
        
        // Simulate detections
        const possibleDetections = [
          'Person detected',
          'Motion in frame',
          'Face recognized',
          'Object detected',
          'No activity'
        ]
        setDetections(prev => {
          const newDetection = {
            id: Date.now(),
            text: possibleDetections[Math.floor(Math.random() * possibleDetections.length)],
            time: new Date().toLocaleTimeString()
          }
          return [newDetection, ...prev].slice(0, 10)
        })
      }, 3000)

      return () => clearInterval(interval)
    }
  }, [isStreaming])

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
      setIsRecording(false)
    }
  }

  const toggleRecording = () => {
    if (!isStreaming) return
    // TODO: Implement actual recording logic
    setIsRecording(!isRecording)
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
                      <span className={`rec-dot ${isRecording ? 'recording' : ''}`}></span>
                      <span>{isRecording ? 'RECORDING' : 'LIVE'}</span>
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
                className={`btn-control ${isRecording ? 'recording' : ''}`}
                onClick={toggleRecording}
                disabled={!isStreaming}
              >
                <span>{isRecording ? '⏹' : '🔴'}</span>
                {isRecording ? 'Stop Recording' : 'Start Recording'}
              </button>
              
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
            <h3>Detection Log</h3>
            <div className="log-list">
              {detections.length === 0 ? (
                <div className="log-empty">
                  <span>No detections yet</span>
                </div>
              ) : (
                detections.map(detection => (
                  <div key={detection.id} className="log-item">
                    <span className="log-time">{detection.time}</span>
                    <span className="log-text">{detection.text}</span>
                  </div>
                ))
              )}
            </div>
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
