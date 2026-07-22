-- Migration file for Ravora News & Sentiment Engine V1

-- 1. NEWS ARTICLES TABLE
CREATE TABLE IF NOT EXISTS news_articles (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title           TEXT NOT NULL,
  content         TEXT NOT NULL,
  url             TEXT UNIQUE NOT NULL,
  source          TEXT NOT NULL,
  category        TEXT NOT NULL,
  published_at    TIMESTAMPTZ NOT NULL,
  sentiment       TEXT NOT NULL CHECK (sentiment IN ('Very Bullish', 'Bullish', 'Neutral', 'Bearish', 'Very Bearish')),
  sentiment_score NUMERIC NOT NULL DEFAULT 0.0,
  market_impact   TEXT NOT NULL CHECK (market_impact IN ('low', 'medium', 'high', 'critical')),
  created_at      TIMESTAMPTZ DEFAULT NOW()
);

-- 2. NEWS ASSET MAPPING TABLE
CREATE TABLE IF NOT EXISTS news_asset_mappings (
  article_id      UUID NOT NULL REFERENCES news_articles(id) ON DELETE CASCADE,
  asset_symbol    TEXT NOT NULL,
  PRIMARY KEY (article_id, asset_symbol)
);

CREATE INDEX IF NOT EXISTS idx_news_asset_mappings_symbol ON news_asset_mappings(asset_symbol);

-- 3. NEWS BOOKMARKS TABLE
CREATE TABLE IF NOT EXISTS news_bookmarks (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id         UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  article_id      UUID NOT NULL REFERENCES news_articles(id) ON DELETE CASCADE,
  created_at      TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE (user_id, article_id)
);

CREATE INDEX IF NOT EXISTS idx_news_bookmarks_user ON news_bookmarks(user_id);

-- 4. NEWS READ STATUS TABLE
CREATE TABLE IF NOT EXISTS news_read_status (
  user_id         UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  article_id      UUID NOT NULL REFERENCES news_articles(id) ON DELETE CASCADE,
  read_at         TIMESTAMPTZ DEFAULT NOW(),
  PRIMARY KEY (user_id, article_id)
);

-- ROW LEVEL SECURITY RULES
ALTER TABLE news_articles ENABLE ROW LEVEL SECURITY;
ALTER TABLE news_asset_mappings ENABLE ROW LEVEL SECURITY;
ALTER TABLE news_bookmarks ENABLE ROW LEVEL SECURITY;
ALTER TABLE news_read_status ENABLE ROW LEVEL SECURITY;

-- Policies for public articles access
CREATE POLICY "Public read news_articles" ON news_articles FOR SELECT USING (true);
CREATE POLICY "Public read news_asset_mappings" ON news_asset_mappings FOR SELECT USING (true);

-- Policies for user bookmarks and read statuses
CREATE POLICY "Users can manage own news bookmarks" ON news_bookmarks FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users can manage own news read status" ON news_read_status FOR ALL USING (auth.uid() = user_id);
