export const SCHEMA = `
CREATE TABLE IF NOT EXISTS users (
  id TEXT PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  role TEXT NOT NULL DEFAULT 'viewer',
  persona_preference TEXT NOT NULL DEFAULT 'dev',
  password_hash TEXT,
  avatar_url TEXT,
  permissions JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS integrations (
  id TEXT PRIMARY KEY,
  provider_key TEXT NOT NULL,
  display_name TEXT NOT NULL,
  credentials JSONB NOT NULL DEFAULT '{}',
  scope JSONB NOT NULL DEFAULT '{}',
  enabled BOOLEAN DEFAULT true,
  created_by TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  last_tested_at TIMESTAMPTZ,
  last_test_result TEXT,
  last_test_message TEXT
);

CREATE TABLE IF NOT EXISTS brand_settings (
  id TEXT PRIMARY KEY DEFAULT 'default',
  product_name TEXT NOT NULL DEFAULT 'Zornik',
  tenant_name TEXT NOT NULL DEFAULT 'CEPS',
  primary_color TEXT NOT NULL DEFAULT '#2162AD',
  secondary_color TEXT NOT NULL DEFAULT '#4F91CE',
  tertiary_color TEXT NOT NULL DEFAULT '#6BC7F1',
  style TEXT NOT NULL DEFAULT 'vercel'
);

CREATE TABLE IF NOT EXISTS audit_log (
  id TEXT PRIMARY KEY,
  actor TEXT NOT NULL,
  action TEXT NOT NULL,
  target TEXT,
  env_id TEXT,
  app_id TEXT,
  details TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS roles (
  id TEXT PRIMARY KEY,
  name TEXT UNIQUE NOT NULL,
  description TEXT,
  permissions JSONB NOT NULL DEFAULT '[]',
  is_system BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS email_subscriptions (
  id TEXT PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
`;
