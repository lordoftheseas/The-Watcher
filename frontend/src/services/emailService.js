import emailjs from '@emailjs/browser'

// Initialize EmailJS with your public key
const EMAILJS_PUBLIC_KEY = import.meta.env.VITE_EMAILJS_PUBLIC_KEY
const EMAILJS_SERVICE_ID = import.meta.env.VITE_EMAILJS_SERVICE_ID
const EMAILJS_TEMPLATE_ID = import.meta.env.VITE_EMAILJS_TEMPLATE_ID

// Initialize EmailJS
if (EMAILJS_PUBLIC_KEY) {
  emailjs.init(EMAILJS_PUBLIC_KEY)
}

/**
 * Send threat detection email notification
 * Uses the same data format as report generation (simple and clean)
 * @param {Object} detection - Threat detection data from Gemini API
 * @param {string} detection.threat_level - Level of threat (safe/warning/danger)
 * @param {string} detection.description - Display description of the threat
 * @param {number} detection.confidence - Confidence score (0-1)
 * @param {Array} detection.objects_detected - List of detected objects
 * @param {number} detection.people_count - Number of people detected
 * @param {string} detection.recommended_action - Recommended action
 * @returns {Promise} EmailJS promise
 */
export const sendThreatEmail = async (detection) => {
  if (!EMAILJS_PUBLIC_KEY || !EMAILJS_SERVICE_ID || !EMAILJS_TEMPLATE_ID) {
    console.warn('EmailJS not configured. Skipping email notification.')
    return { success: false, message: 'EmailJS not configured' }
  }

  try {
    console.log('📧 Detection data received for email:', detection)
    
    // Validate detection data
    if (!detection || typeof detection !== 'object') {
      console.error('❌ Invalid detection data:', detection)
      return { success: false, error: 'Invalid detection data format' }
    }

    // Format objects detected (same as report display)
    const objectsText = Array.isArray(detection.objects_detected) 
      ? detection.objects_detected.join(', ')
      : String(detection.objects_detected || 'None')

    // Get the display description (same as what shows in LiveCamera)
    const description = detection.description || 'No description available'

    // Get recommended action
    const action = detection.recommended_action || 'Monitor the situation'

    // Get threat level
    const threatLevel = (detection.threat_level || 'unknown').toUpperCase()

    // Prepare email template parameters (simple format matching report)
    const templateParams = {
      // For subject: "Alert: Threat Detected - {description}"
      description: description,
      threat_level: threatLevel,
      objects_detected: objectsText,
      people_count: String(detection.people_count || 0),
      recommended_action: action,
      confidence: `${Math.round((detection.confidence || 0) * 100)}%`,
      timestamp: new Date().toLocaleString(),
      camera_name: 'Live Camera'
    }

    console.log('📧 Email template parameters:', templateParams)

    // Send email using EmailJS
    const response = await emailjs.send(
      EMAILJS_SERVICE_ID,
      EMAILJS_TEMPLATE_ID,
      templateParams
    )

    console.log('✅ Email sent successfully:', response)
    return { success: true, response }

  } catch (error) {
    console.error('❌ Failed to send email:', error)
    return { 
      success: false, 
      error: error?.text || error?.message || 'Unknown error occurred',
      details: error
    }
  }
}

/**
 * Check if EmailJS is properly configured
 * @returns {boolean} True if EmailJS is configured
 */
export const isEmailConfigured = () => {
  return !!(EMAILJS_PUBLIC_KEY && EMAILJS_SERVICE_ID && EMAILJS_TEMPLATE_ID)
}
