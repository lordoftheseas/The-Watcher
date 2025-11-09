/**
 * Local Report Generator
 * Generates threat detection reports from local detection data
 * No database dependency - everything stored in localStorage
 */

export const generateReport = (detection) => {
  const report = {
    id: `report-${Date.now()}`,
    timestamp: new Date().toISOString(),
    date: new Date().toLocaleDateString(),
    time: new Date().toLocaleTimeString(),
    
    // Threat Information
    threatLevel: detection.threat_level || 'safe',
    description: detection.description || 'No description available',
    confidence: detection.confidence || 0,
    
    // Details
    objectsDetected: detection.objects_detected || [],
    peopleCount: detection.people_count || 0,
    recommendedAction: detection.recommended_action || 'Monitor the situation',
    details: detection.details || [],
    
    // Camera Information
    cameraName: 'Live Camera',
    cameraId: 'live-camera-1',
    
    // Image data
    imageData: detection.image_data || null,
    
    // Status
    status: 'active',
    priority: detection.threat_level === 'danger' ? 'high' : detection.threat_level === 'warning' ? 'medium' : 'low',
  }
  
  return report
}

export const saveReportToLocal = (report) => {
  try {
    // Get existing reports
    const existingReports = getLocalReports()
    
    // Add new report at the beginning
    const updatedReports = [report, ...existingReports]
    
    // Keep only last 100 reports to avoid storage issues
    const reportsToSave = updatedReports.slice(0, 100)
    
    // Save to localStorage
    localStorage.setItem('threatReports', JSON.stringify(reportsToSave))
    
    console.log('✅ Report saved locally:', report.id)
    return { success: true, report }
  } catch (error) {
    console.error('❌ Error saving report:', error)
    return { success: false, error: error.message }
  }
}

export const getLocalReports = () => {
  try {
    const reportsJson = localStorage.getItem('threatReports')
    if (!reportsJson) return []
    
    const reports = JSON.parse(reportsJson)
    return reports || []
  } catch (error) {
    console.error('Error loading reports:', error)
    return []
  }
}

export const getReportById = (reportId) => {
  const reports = getLocalReports()
  return reports.find(r => r.id === reportId)
}

export const deleteReport = (reportId) => {
  try {
    const reports = getLocalReports()
    const filtered = reports.filter(r => r.id !== reportId)
    localStorage.setItem('threatReports', JSON.stringify(filtered))
    return { success: true }
  } catch (error) {
    console.error('Error deleting report:', error)
    return { success: false, error: error.message }
  }
}

export const clearAllReports = () => {
  try {
    localStorage.removeItem('threatReports')
    return { success: true }
  } catch (error) {
    console.error('Error clearing reports:', error)
    return { success: false, error: error.message }
  }
}

export const getReportStats = () => {
  const reports = getLocalReports()
  
  return {
    total: reports.length,
    danger: reports.filter(r => r.threatLevel === 'danger').length,
    warning: reports.filter(r => r.threatLevel === 'warning').length,
    safe: reports.filter(r => r.threatLevel === 'safe').length,
    today: reports.filter(r => {
      const reportDate = new Date(r.timestamp).toDateString()
      const today = new Date().toDateString()
      return reportDate === today
    }).length
  }
}

// Generate a dummy report for testing
export const generateDummyReport = () => {
  const dummyDetection = {
    threat_level: 'warning',
    description: 'Suspicious activity detected: Person lingering near entrance after business hours',
    confidence: 0.87,
    objects_detected: ['person', 'door', 'bag', 'vehicle'],
    people_count: 1,
    recommended_action: 'Review footage and alert security personnel',
    details: [
      'Single individual observed near main entrance',
      'Person carrying large backpack',
      'Activity occurred outside normal business hours (11:45 PM)',
      'Subject appeared to be testing door handles',
      'Vehicle with obscured license plate nearby'
    ],
    image_data: null // Would normally contain base64 image
  }
  
  const report = generateReport(dummyDetection)
  const result = saveReportToLocal(report)
  
  return result
}

export const exportReportsToJSON = () => {
  const reports = getLocalReports()
  const dataStr = JSON.stringify(reports, null, 2)
  const blob = new Blob([dataStr], { type: 'application/json' })
  const url = URL.createObjectURL(blob)
  
  const a = document.createElement('a')
  a.href = url
  a.download = `watcher-reports-${new Date().toISOString().split('T')[0]}.json`
  a.click()
  
  URL.revokeObjectURL(url)
}
