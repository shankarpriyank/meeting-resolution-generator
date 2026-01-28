-- Supabase SQL Schema for API Monitoring
-- Run this in your Supabase SQL Editor to create the required tables

-- Table for storing individual API call records
CREATE TABLE IF NOT EXISTS api_call_records (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    endpoint TEXT NOT NULL,
    provider TEXT NOT NULL CHECK (provider IN ('openai', 'anthropic', 'other')),
    model TEXT NOT NULL,
    status TEXT NOT NULL CHECK (status IN ('success', 'error')),
    latency_ms INTEGER NOT NULL,
    input_tokens INTEGER,
    output_tokens INTEGER,
    estimated_cost DECIMAL(10, 6),
    error_message TEXT,
    client_ip TEXT,
    metadata JSONB
);

-- Table for storing daily aggregated statistics
CREATE TABLE IF NOT EXISTS daily_stats (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    date DATE NOT NULL UNIQUE,
    total_calls INTEGER DEFAULT 0,
    success_calls INTEGER DEFAULT 0,
    error_calls INTEGER DEFAULT 0,
    total_latency_ms BIGINT DEFAULT 0,
    total_input_tokens BIGINT DEFAULT 0,
    total_output_tokens BIGINT DEFAULT 0,
    total_estimated_cost DECIMAL(12, 6) DEFAULT 0,
    calls_by_endpoint JSONB DEFAULT '{}',
    calls_by_provider JSONB DEFAULT '{}',
    calls_by_model JSONB DEFAULT '{}',
    errors_by_type JSONB DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_api_call_records_created_at ON api_call_records(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_api_call_records_endpoint ON api_call_records(endpoint);
CREATE INDEX IF NOT EXISTS idx_api_call_records_provider ON api_call_records(provider);
CREATE INDEX IF NOT EXISTS idx_api_call_records_status ON api_call_records(status);
CREATE INDEX IF NOT EXISTS idx_daily_stats_date ON daily_stats(date DESC);

-- Function to automatically update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Trigger to auto-update updated_at on daily_stats
DROP TRIGGER IF EXISTS update_daily_stats_updated_at ON daily_stats;
CREATE TRIGGER update_daily_stats_updated_at
    BEFORE UPDATE ON daily_stats
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Enable Row Level Security (RLS) - optional but recommended
ALTER TABLE api_call_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE daily_stats ENABLE ROW LEVEL SECURITY;

-- Create policies for service role access (allows full access with service role key)
CREATE POLICY "Service role has full access to api_call_records" ON api_call_records
    FOR ALL
    USING (true)
    WITH CHECK (true);

CREATE POLICY "Service role has full access to daily_stats" ON daily_stats
    FOR ALL
    USING (true)
    WITH CHECK (true);
