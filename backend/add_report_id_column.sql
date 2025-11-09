-- ============================================
-- Add report_id column to threat_detections table
-- Run this in Supabase SQL Editor
-- ============================================

-- Add report_id column to store the generated report ID
ALTER TABLE public.threat_detections 
ADD COLUMN IF NOT EXISTS report_id TEXT;

-- Create index for report_id for faster lookups
CREATE INDEX IF NOT EXISTS idx_threat_detections_report_id 
ON public.threat_detections(report_id);

-- Add comment to explain the column
COMMENT ON COLUMN public.threat_detections.report_id IS 
'ID of the detailed AI-generated threat report (format: THREAT-YYYYMMDD-HHMMSS)';
