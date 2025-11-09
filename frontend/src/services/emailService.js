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
 * @param {Object} threatData - Threat detection data from Gemini API
 * @param {string} threatData.threat_level - Level of threat (safe/warning/danger)
 * @param {string} threatData.description - Description of the threat
 * @param {number} threatData.confidence - Confidence score (0-1)
 * @param {Array} threatData.objects_detected - List of detected objects
 * @param {number} threatData.people_count - Number of people detected
 * @param {string} threatData.recommended_action - Recommended action
 * @param {Array} threatData.details - Additional details
 * @returns {Promise} EmailJS promise
 */
export const sendThreatEmail = async (threatData) => {
  if (!EMAILJS_PUBLIC_KEY || !EMAILJS_SERVICE_ID || !EMAILJS_TEMPLATE_ID) {
    console.warn('EmailJS not configured. Skipping email notification.')
    return { success: false, message: 'EmailJS not configured' }
  }

  try {
    console.log('📧 Raw threat data received:', threatData)
    
    // Validate threat data
    if (!threatData || typeof threatData !== 'object') {
      console.error('❌ Invalid threat data:', threatData)
      return { success: false, error: 'Invalid threat data format' }
    }

    // Format the threat level with appropriate emoji
    const threatEmoji = {
      safe: '✅',
      warning: '⚠️',
      danger: '🚨'
    }

    // Handle both array and string for details
    let detailsText = 'No additional details'
    if (Array.isArray(threatData.details)) {
      detailsText = threatData.details.join('\n• ')
    } else if (typeof threatData.details === 'string') {
      detailsText = threatData.details
    }

    // Handle both array and string for objects_detected
    let objectsText = 'None'
    if (Array.isArray(threatData.objects_detected)) {
      objectsText = threatData.objects_detected.join(', ')
    } else if (typeof threatData.objects_detected === 'string') {
      objectsText = threatData.objects_detected
    }

    // Prepare email template parameters
    const templateParams = {
      threat_level: (threatData.threat_level || 'UNKNOWN').toUpperCase(),
      threat_emoji: threatEmoji[threatData.threat_level] || '❓',
      description: threatData.description || 'No description available',
      confidence: `${((threatData.confidence || 0) * 100).toFixed(1)}%`,
      objects_detected: objectsText,
      people_count: String(threatData.people_count || 0),
      recommended_action: threatData.recommended_action || 'Continue monitoring',
      details: detailsText,
      timestamp: new Date().toLocaleString(),
      camera_name: 'Live Camera'
    }

    console.log('📧 Formatted email parameters:', templateParams)

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
