-- Migration file to support Araiven trade reviews on virtual paper positions
ALTER TABLE paper_positions ADD COLUMN IF NOT EXISTS review_json JSONB;
