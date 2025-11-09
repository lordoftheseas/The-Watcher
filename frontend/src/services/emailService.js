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
    // Format the threat level with appropriate emoji
    const threatEmoji = {
      safe: '✅',
      warning: '⚠️',
      danger: '🚨'
    }

    // Prepare email template parameters
    const templateParams = {
      threat_level: threatData.threat_level?.toUpperCase() || 'UNKNOWN',
      threat_emoji: threatEmoji[threatData.threat_level] || '❓',
      description: threatData.description || 'No description available',
      confidence: `${(threatData.confidence * 100).toFixed(1)}%`,
      objects_detected: threatData.objects_detected?.join(', ') || 'None',
      people_count: threatData.people_count || 0,
      recommended_action: threatData.recommended_action || 'Continue monitoring',
      details: threatData.details?.join('\n• ') || 'No additional details',
      timestamp: new Date().toLocaleString(),
      camera_name: 'Live Camera'
    }

    console.log('📧 Sending threat email notification...', templateParams)

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
    return { success: false, error: error.message }
  }
}

/**
 * Check if EmailJS is properly configured
 * @returns {boolean} True if EmailJS is configured
 */
export const isEmailConfigured = () => {
  return !!(EMAILJS_PUBLIC_KEY && EMAILJS_SERVICE_ID && EMAILJS_TEMPLATE_ID)
}
