-- Travel Records (Highlights / 旅行之最) Table Schema
-- This table stores various travel records and superlatives for the Highlights page

CREATE TABLE travel_records (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  
  -- Record type: 'data' | 'photo' | 'split'
  type VARCHAR(20) NOT NULL CHECK (type IN ('data', 'photo', 'split')),
  
  -- Display order (lower numbers appear first)
  display_order INTEGER NOT NULL DEFAULT 0,
  
  -- Grid size: 'small' (1x1) | 'medium' (2x1) | 'large' (2x2)
  grid_size VARCHAR(20) DEFAULT 'small' CHECK (grid_size IN ('small', 'medium', 'large')),
  
  -- Titles (bilingual)
  title_en VARCHAR(255),
  title_zh VARCHAR(255),
  
  -- For DataCard: main value/statistic
  value TEXT,
  
  -- For DataCard: caption/description (bilingual)
  caption_en TEXT,
  caption_zh TEXT,
  
  -- For PhotoRecordCard: image URL
  image_url TEXT,
  
  -- For SplitCard: left side
  split_left_value TEXT,
  split_left_caption_en TEXT,
  split_left_caption_zh TEXT,
  
  -- For SplitCard: right side
  split_right_value TEXT,
  split_right_caption_en TEXT,
  split_right_caption_zh TEXT,
  
  -- Visibility toggle
  is_visible BOOLEAN DEFAULT true,
  
  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create index on display_order for faster sorting
CREATE INDEX idx_travel_records_display_order ON travel_records(display_order);

-- Create index on type for filtering
CREATE INDEX idx_travel_records_type ON travel_records(type);

-- Enable Row Level Security
ALTER TABLE travel_records ENABLE ROW LEVEL SECURITY;

-- Policy: Anyone can view visible records
CREATE POLICY "Public travel records are viewable by everyone"
  ON travel_records FOR SELECT
  USING (is_visible = true);

-- Policy: Only authenticated users can insert (for admin)
CREATE POLICY "Authenticated users can insert travel records"
  ON travel_records FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- Policy: Only authenticated users can update (for admin)
CREATE POLICY "Authenticated users can update travel records"
  ON travel_records FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- Policy: Only authenticated users can delete (for admin)
CREATE POLICY "Authenticated users can delete travel records"
  ON travel_records FOR DELETE
  TO authenticated
  USING (true);

-- Create updated_at trigger
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_travel_records_updated_at
  BEFORE UPDATE ON travel_records
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Sample seed data (you can insert via Admin Dashboard later)
INSERT INTO travel_records (type, display_order, grid_size, title_en, title_zh, value, caption_en, caption_zh, is_visible) VALUES
  ('data', 1, 'small', 'Highest Altitude', '最高海拔', '4,810m', 'Mont Blanc Summit, France', '法國白朗峰頂', true),
  ('data', 2, 'small', 'Cities Visited', '造訪城市', '12', 'Across 3 Continents', '橫跨 3 大洲', true),
  ('data', 3, 'small', 'Total Photos', '總相片數', '2,847', 'Captured Memories', '捕捉的回憶', true);

INSERT INTO travel_records (type, display_order, grid_size, title_en, title_zh, image_url, caption_en, caption_zh, is_visible) VALUES
  ('photo', 4, 'medium', 'Best Sunset', '最美日落', 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&q=85', 'Santorini, Greece 2023', '希臘聖托里尼 2023', true),
  ('photo', 5, 'large', 'Most Memorable Moment', '最難忘時刻', 'https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?w=1200&q=85', 'Northern Lights in Iceland', '冰島極光', true);

INSERT INTO travel_records (type, display_order, grid_size, title_en, title_zh, split_left_value, split_left_caption_en, split_left_caption_zh, split_right_value, split_right_caption_en, split_right_caption_zh, is_visible) VALUES
  ('split', 6, 'medium', 'Extreme Temperatures', '極端溫度', '+42°C', 'Sahara Desert, Morocco', '摩洛哥撒哈拉沙漠', '-15°C', 'Hokkaido, Japan', '日本北海道', true),
  ('split', 7, 'small', 'Flight Hours', '飛行時數', '156h', 'In The Air', '在空中', '23', 'Flights Taken', '航班數', true);

COMMENT ON TABLE travel_records IS 'Stores travel records and superlatives for the Highlights page';
COMMENT ON COLUMN travel_records.type IS 'Type of card: data (statistic), photo (image), or split (comparison)';
COMMENT ON COLUMN travel_records.grid_size IS 'Grid cell size: small (1x1), medium (2x1), or large (2x2)';
