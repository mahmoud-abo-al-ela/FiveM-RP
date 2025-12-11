-- Extended Supabase Database Schema with Discord Auth Support
-- Run this in your Supabase SQL Editor to create/update all tables

-- Users table (merged with profiles, extended for Discord OAuth)
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  username TEXT UNIQUE,
  password TEXT,
  discord_id TEXT UNIQUE,
  discord_username TEXT,
  discord_discriminator TEXT,
  discord_avatar TEXT,
  email TEXT,
  role TEXT DEFAULT 'user',
  display_name TEXT,
  bio TEXT,
  in_game_name TEXT,
  playtime_hours INTEGER DEFAULT 0,
  level INTEGER DEFAULT 1,
  experience_points INTEGER DEFAULT 0,
  reputation_score INTEGER DEFAULT 0,
  activated BOOLEAN DEFAULT false,
  activated_at TIMESTAMPTZ,
  rejected_at TIMESTAMPTZ,
  rejection_reason TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  last_login TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Applications table
CREATE TABLE IF NOT EXISTS applications (
  id SERIAL PRIMARY KEY,
  user_id UUID REFERENCES users(id) ON DELETE SET NULL,
  type TEXT NOT NULL,
  discord_username TEXT NOT NULL,
  age INTEGER NOT NULL CHECK (age >= 13),
  experience TEXT NOT NULL,
  reason TEXT NOT NULL,
  status TEXT DEFAULT 'pending',
  reviewed_by UUID REFERENCES users(id),
  reviewed_at TIMESTAMPTZ,
  notes TEXT,
  submitted_at TIMESTAMPTZ DEFAULT NOW()
);

-- Store items table
CREATE TABLE IF NOT EXISTS store_items (
  id SERIAL PRIMARY KEY,
  category TEXT NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  price TEXT NOT NULL,
  metadata TEXT,
  image_url TEXT,
  available BOOLEAN DEFAULT true,
  popular BOOLEAN DEFAULT false,
  featured BOOLEAN DEFAULT false,
  stock INTEGER DEFAULT -1,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Shopping cart table
CREATE TABLE IF NOT EXISTS shopping_cart (
  id SERIAL PRIMARY KEY,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  item_id INTEGER REFERENCES store_items(id) ON DELETE CASCADE,
  quantity INTEGER DEFAULT 1,
  added_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, item_id)
);

-- Purchases table
CREATE TABLE IF NOT EXISTS purchases (
  id SERIAL PRIMARY KEY,
  user_id UUID REFERENCES users(id) ON DELETE SET NULL,
  item_id INTEGER REFERENCES store_items(id),
  quantity INTEGER DEFAULT 1,
  total_price TEXT,
  status TEXT DEFAULT 'pending',
  transaction_id TEXT,
  purchased_at TIMESTAMPTZ DEFAULT NOW()
);

-- Server status table
CREATE TABLE IF NOT EXISTS server_status (
  id SERIAL PRIMARY KEY,
  online BOOLEAN DEFAULT true,
  current_players INTEGER DEFAULT 0,
  max_players INTEGER DEFAULT 200,
  ping INTEGER DEFAULT 0,
  uptime_seconds INTEGER DEFAULT 0,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Events table
CREATE TABLE IF NOT EXISTS events (
  id SERIAL PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  image_url TEXT,
  event_date TIMESTAMPTZ NOT NULL,
  expiration_date TIMESTAMPTZ NOT NULL,
  created_by UUID REFERENCES users(id),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Event participants table
CREATE TABLE IF NOT EXISTS event_participants (
  id SERIAL PRIMARY KEY,
  event_id INTEGER REFERENCES events(id) ON DELETE CASCADE,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  status TEXT DEFAULT 'registered',
  joined_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(event_id, user_id)
);

-- Leaderboard table
CREATE TABLE IF NOT EXISTS leaderboard (
  id SERIAL PRIMARY KEY,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  category TEXT NOT NULL,
  score INTEGER DEFAULT 0,
  rank INTEGER,
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, category)
);

-- Notifications table
CREATE TABLE IF NOT EXISTS notifications (
  id SERIAL PRIMARY KEY,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  type TEXT DEFAULT 'info',
  read BOOLEAN DEFAULT false,
  link TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_users_discord_id ON users(discord_id);
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_activated ON users(activated);
CREATE INDEX IF NOT EXISTS idx_users_rejected_at ON users(rejected_at);
CREATE INDEX IF NOT EXISTS idx_users_display_name ON users(display_name);
CREATE INDEX IF NOT EXISTS idx_users_in_game_name ON users(in_game_name);
CREATE INDEX IF NOT EXISTS idx_applications_user_id ON applications(user_id);
CREATE INDEX IF NOT EXISTS idx_applications_status ON applications(status);
CREATE INDEX IF NOT EXISTS idx_applications_submitted_at ON applications(submitted_at DESC);
CREATE INDEX IF NOT EXISTS idx_store_items_category ON store_items(category);
CREATE INDEX IF NOT EXISTS idx_store_items_available ON store_items(available);
CREATE INDEX IF NOT EXISTS idx_shopping_cart_user_id ON shopping_cart(user_id);
CREATE INDEX IF NOT EXISTS idx_purchases_user_id ON purchases(user_id);
CREATE INDEX IF NOT EXISTS idx_events_event_date ON events(event_date);
CREATE INDEX IF NOT EXISTS idx_events_expiration_date ON events(expiration_date);
CREATE INDEX IF NOT EXISTS idx_leaderboard_category_rank ON leaderboard(category, rank);
CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON notifications(user_id, read);
CREATE INDEX IF NOT EXISTS idx_server_status_updated_at ON server_status(updated_at DESC);

-- Enable Row Level Security (RLS)
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE applications ENABLE ROW LEVEL SECURITY;
ALTER TABLE store_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE shopping_cart ENABLE ROW LEVEL SECURITY;
ALTER TABLE purchases ENABLE ROW LEVEL SECURITY;
ALTER TABLE server_status ENABLE ROW LEVEL SECURITY;
ALTER TABLE events ENABLE ROW LEVEL SECURITY;
ALTER TABLE event_participants ENABLE ROW LEVEL SECURITY;
ALTER TABLE leaderboard ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

-- RLS Policies

-- Users: Public read, own update
CREATE POLICY "Users are publicly readable" ON users
  FOR SELECT USING (true);

CREATE POLICY "Users can update own profile" ON users
  FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile" ON users
  FOR INSERT WITH CHECK (auth.uid() = id);

-- Applications: Anyone can insert, users can view own, admins can view all
CREATE POLICY "Anyone can submit applications" ON applications
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Users can view own applications" ON applications
  FOR SELECT USING (auth.uid() = user_id OR auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can update applications" ON applications
  FOR UPDATE USING (auth.role() = 'authenticated');

-- Store items: Public read, authenticated write
CREATE POLICY "Store items are publicly readable" ON store_items
  FOR SELECT USING (true);

CREATE POLICY "Authenticated users can manage store items" ON store_items
  FOR ALL USING (auth.role() = 'authenticated');

-- Shopping cart: Users can manage own cart
CREATE POLICY "Users can view own cart" ON shopping_cart
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can manage own cart" ON shopping_cart
  FOR ALL USING (auth.uid() = user_id);

-- Purchases: Users can view own purchases
CREATE POLICY "Users can view own purchases" ON purchases
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create purchases" ON purchases
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Server status: Public read, authenticated write
CREATE POLICY "Server status is publicly readable" ON server_status
  FOR SELECT USING (true);

CREATE POLICY "Authenticated users can update server status" ON server_status
  FOR ALL USING (auth.role() = 'authenticated');

-- Events: Public read, authenticated write
CREATE POLICY "Events are publicly readable" ON events
  FOR SELECT USING (true);

CREATE POLICY "Authenticated users can create events" ON events
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Event creators can update own events" ON events
  FOR UPDATE USING (auth.uid() = created_by);

-- Event participants: Public read, authenticated join
CREATE POLICY "Event participants are publicly readable" ON event_participants
  FOR SELECT USING (true);

CREATE POLICY "Users can join events" ON event_participants
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can leave events" ON event_participants
  FOR DELETE USING (auth.uid() = user_id);

-- Leaderboard: Public read, system write
CREATE POLICY "Leaderboard is publicly readable" ON leaderboard
  FOR SELECT USING (true);

CREATE POLICY "Authenticated users can update leaderboard" ON leaderboard
  FOR ALL USING (auth.role() = 'authenticated');

-- Notifications: Users can view own notifications
CREATE POLICY "Users can view own notifications" ON notifications
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can update own notifications" ON notifications
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "System can create notifications" ON notifications
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');
