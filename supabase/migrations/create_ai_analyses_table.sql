-- AI Analyses Table
-- This table stores autonomous AI analysis results from DeepSeek
-- Used for pattern recognition and price prediction insights

CREATE TABLE ai_analyses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  sentinel_id UUID REFERENCES sentinels(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) NOT NULL,
  analysis_text TEXT NOT NULL,
  confidence_score INTEGER CHECK (confidence_score >= 0 AND confidence_score <= 100),
  sentiment TEXT CHECK (sentiment IN ('bullish', 'neutral', 'bearish')),
  cost NUMERIC DEFAULT 0.0008,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE ai_analyses ENABLE ROW LEVEL SECURITY;

-- SELECT Policy: Users can view their own analyses
CREATE POLICY "Users can view their own analyses"
  ON ai_analyses
  FOR SELECT
  USING (auth.uid() = user_id);

-- INSERT Policy: Users can insert their own analyses
CREATE POLICY "Users can insert their own analyses"
  ON ai_analyses
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Indexes for query performance
CREATE INDEX idx_ai_analyses_sentinel_id ON ai_analyses(sentinel_id);
CREATE INDEX idx_ai_analyses_user_id ON ai_analyses(user_id);
CREATE INDEX idx_ai_analyses_created_at ON ai_analyses(created_at DESC);
