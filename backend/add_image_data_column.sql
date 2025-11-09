-- ============================================
-- Add image_data column to threat_detections table
-- Run this in Supabase SQL Editor
-- ============================================

-- Add image_data column to store base64 encoded images
ALTER TABLE public.threat_detections 
ADD COLUMN IF NOT EXISTS image_data TEXT;

-- Add comment
COMMENT ON COLUMN public.threat_detections.image_data IS 
'Base64 encoded image data captured at the moment of threat detection';

-- Create index for faster queries (optional, only if needed)
-- CREATE INDEX IF NOT EXISTS idx_threat_detections_has_image 
-- ON public.threat_detections((image_data IS NOT NULL));

COMMENT ON TABLE public.threat_detections IS 
'Stores threat detections with optional image data captured at detection time';
