-- ============================================
-- Threat Detection History Table
-- Run this in Supabase SQL Editor
-- ============================================

-- Create threat_detections table for storing live camera threat analysis
CREATE TABLE IF NOT EXISTS public.threat_detections (
    id SERIAL PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    camera_name TEXT DEFAULT 'Live Camera',
    threat_detected BOOLEAN NOT NULL,
    threat_level TEXT NOT NULL CHECK (threat_level IN ('safe', 'warning', 'danger')),
    description TEXT NOT NULL,
    confidence FLOAT NOT NULL CHECK (confidence >= 0 AND confidence <= 1),
    details JSONB DEFAULT '[]'::jsonb,
    image_url TEXT,
    timestamp TIMESTAMPTZ DEFAULT NOW(),
    reviewed BOOLEAN DEFAULT false,
    notes TEXT
);

-- Create indexes for faster queries
CREATE INDEX IF NOT EXISTS idx_threat_detections_user_id ON public.threat_detections(user_id);
CREATE INDEX IF NOT EXISTS idx_threat_detections_timestamp ON public.threat_detections(timestamp DESC);
CREATE INDEX IF NOT EXISTS idx_threat_detections_threat_level ON public.threat_detections(threat_level);
CREATE INDEX IF NOT EXISTS idx_threat_detections_reviewed ON public.threat_detections(reviewed);

-- Enable Row Level Security (RLS)
ALTER TABLE public.threat_detections ENABLE ROW LEVEL SECURITY;

-- RLS Policies

-- Allow users to view their own threat detections
CREATE POLICY "Users can view own threat detections"
    ON public.threat_detections
    FOR SELECT
    USING (auth.uid() = user_id);

-- Allow users to insert their own threat detections
CREATE POLICY "Users can insert own threat detections"
    ON public.threat_detections
    FOR INSERT
    WITH CHECK (auth.uid() = user_id);

-- Allow users to update their own threat detections
CREATE POLICY "Users can update own threat detections"
    ON public.threat_detections
    FOR UPDATE
    USING (auth.uid() = user_id);

-- Allow users to delete their own threat detections
CREATE POLICY "Users can delete own threat detections"
    ON public.threat_detections
    FOR DELETE
    USING (auth.uid() = user_id);
