CREATE EXTENSION IF NOT EXISTS "pgcrypto";

CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email VARCHAR(255) NOT NULL UNIQUE,
  password_hash VARCHAR(255) NOT NULL,
  full_name VARCHAR(120),
  credits NUMERIC(10, 2) NOT NULL DEFAULT 1,
  email_verified BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS verification_codes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email VARCHAR(255) NOT NULL,
  code VARCHAR(6) NOT NULL,
  purpose VARCHAR(20) NOT NULL CHECK (purpose IN ('signup', 'signin')),
  expires_at TIMESTAMPTZ NOT NULL,
  used_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_verification_codes_email_purpose
  ON verification_codes (email, purpose);

CREATE INDEX IF NOT EXISTS idx_verification_codes_expires_at
  ON verification_codes (expires_at);

CREATE OR REPLACE FUNCTION set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS users_set_updated_at ON users;
CREATE TRIGGER users_set_updated_at
  BEFORE UPDATE ON users
  FOR EACH ROW
  EXECUTE FUNCTION set_updated_at();

CREATE TABLE IF NOT EXISTS auto_blog_settings (
  user_id UUID PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
  enabled BOOLEAN NOT NULL DEFAULT TRUE,
  ai_provider VARCHAR(30) NOT NULL DEFAULT 'openai',
  ai_model VARCHAR(100) NOT NULL DEFAULT 'gpt-4o',
  api_key TEXT NOT NULL DEFAULT '',
  generation_mode VARCHAR(20) NOT NULL DEFAULT 'single',
  generation_temperature NUMERIC(4, 2) NOT NULL DEFAULT 0.7,
  generation_max_tokens INTEGER NOT NULL DEFAULT 4000,
  content_length VARCHAR(20) NOT NULL DEFAULT 'medium',
  content_min_words INTEGER NOT NULL DEFAULT 800,
  content_max_words INTEGER NOT NULL DEFAULT 1200,
  content_prompt_type VARCHAR(50) NOT NULL DEFAULT 'news_article',
  system_prompt TEXT NOT NULL DEFAULT '',
  content_language VARCHAR(20) NOT NULL DEFAULT 'en',
  publish_status VARCHAR(20) NOT NULL DEFAULT 'draft',
  seo_enabled BOOLEAN NOT NULL DEFAULT TRUE,
  featured_image_enabled BOOLEAN NOT NULL DEFAULT FALSE,
  featured_image_ai_provider VARCHAR(30) NOT NULL DEFAULT 'openai',
  featured_image_ai_model VARCHAR(100) NOT NULL DEFAULT 'dall-e-3',
  featured_image_api_key TEXT NOT NULL DEFAULT '',
  multi_step_prompts JSONB NOT NULL DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS auto_blog_posts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  keyword VARCHAR(255) NOT NULL DEFAULT '',
  title VARCHAR(500) NOT NULL DEFAULT '',
  slug VARCHAR(500),
  excerpt TEXT,
  content TEXT NOT NULL DEFAULT '',
  status VARCHAR(20) NOT NULL DEFAULT 'draft',
  focus_keyword VARCHAR(255),
  meta_description TEXT,
  seo_title VARCHAR(500),
  provider VARCHAR(50),
  model VARCHAR(100),
  generation_mode VARCHAR(20),
  tokens_prompt INTEGER NOT NULL DEFAULT 0,
  tokens_completion INTEGER NOT NULL DEFAULT 0,
  tokens_total INTEGER NOT NULL DEFAULT 0,
  error_message TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_auto_blog_posts_user_id
  ON auto_blog_posts (user_id, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_auto_blog_posts_status
  ON auto_blog_posts (user_id, status);

CREATE TABLE IF NOT EXISTS auto_blog_generation_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  post_id UUID REFERENCES auto_blog_posts(id) ON DELETE SET NULL,
  keyword VARCHAR(255) NOT NULL DEFAULT '',
  status VARCHAR(20) NOT NULL DEFAULT 'pending',
  provider VARCHAR(50),
  model VARCHAR(100),
  tokens_prompt INTEGER NOT NULL DEFAULT 0,
  tokens_completion INTEGER NOT NULL DEFAULT 0,
  tokens_total INTEGER NOT NULL DEFAULT 0,
  error_message TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_auto_blog_generation_log_user_id
  ON auto_blog_generation_log (user_id, created_at DESC);

DROP TRIGGER IF EXISTS auto_blog_settings_set_updated_at ON auto_blog_settings;
CREATE TRIGGER auto_blog_settings_set_updated_at
  BEFORE UPDATE ON auto_blog_settings
  FOR EACH ROW
  EXECUTE FUNCTION set_updated_at();

DROP TRIGGER IF EXISTS auto_blog_posts_set_updated_at ON auto_blog_posts;
CREATE TRIGGER auto_blog_posts_set_updated_at
  BEFORE UPDATE ON auto_blog_posts
  FOR EACH ROW
  EXECUTE FUNCTION set_updated_at();

ALTER TABLE auto_blog_settings
  ADD COLUMN IF NOT EXISTS multi_step_prompts JSONB NOT NULL DEFAULT '{}';

ALTER TABLE auto_blog_settings
  ADD COLUMN IF NOT EXISTS topic_niche TEXT NOT NULL DEFAULT '';

CREATE TABLE IF NOT EXISTS auto_blog_categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  name VARCHAR(120) NOT NULL,
  description TEXT NOT NULL DEFAULT '',
  prompt TEXT NOT NULL DEFAULT '',
  enabled BOOLEAN NOT NULL DEFAULT TRUE,
  sort_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_auto_blog_categories_user_id
  ON auto_blog_categories (user_id, sort_order, name);

CREATE TABLE IF NOT EXISTS auto_blog_topics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  category_id UUID REFERENCES auto_blog_categories(id) ON DELETE SET NULL,
  topic VARCHAR(255) NOT NULL,
  status VARCHAR(20) NOT NULL DEFAULT 'pending',
  source VARCHAR(20) NOT NULL DEFAULT 'manual',
  priority INTEGER NOT NULL DEFAULT 5,
  post_id UUID REFERENCES auto_blog_posts(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_auto_blog_topics_user_id
  ON auto_blog_topics (user_id, status, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_auto_blog_topics_category_id
  ON auto_blog_topics (user_id, category_id);

ALTER TABLE auto_blog_posts
  ADD COLUMN IF NOT EXISTS topic_id UUID REFERENCES auto_blog_topics(id) ON DELETE SET NULL;

ALTER TABLE auto_blog_posts
  ADD COLUMN IF NOT EXISTS featured_image TEXT NOT NULL DEFAULT '';

ALTER TABLE auto_blog_posts
  ADD COLUMN IF NOT EXISTS featured_image_error TEXT NOT NULL DEFAULT '';

ALTER TABLE auto_blog_posts
  ADD COLUMN IF NOT EXISTS remote_post_id TEXT NOT NULL DEFAULT '';

ALTER TABLE auto_blog_posts
  ADD COLUMN IF NOT EXISTS remote_post_url TEXT NOT NULL DEFAULT '';

ALTER TABLE auto_blog_posts
  ADD COLUMN IF NOT EXISTS live_publish_error TEXT NOT NULL DEFAULT '';

CREATE TABLE IF NOT EXISTS auto_blog_live_publish (
  user_id UUID PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
  enabled BOOLEAN NOT NULL DEFAULT FALSE,
  platform VARCHAR(30) NOT NULL DEFAULT 'wordpress',
  site_url TEXT NOT NULL DEFAULT '',
  username TEXT NOT NULL DEFAULT '',
  api_key TEXT NOT NULL DEFAULT '',
  webhook_url TEXT NOT NULL DEFAULT '',
  remote_status VARCHAR(20) NOT NULL DEFAULT 'publish',
  remote_category_id TEXT NOT NULL DEFAULT '',
  last_tested_at TIMESTAMPTZ,
  last_test_status VARCHAR(20),
  last_test_message TEXT NOT NULL DEFAULT '',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

DROP TRIGGER IF EXISTS auto_blog_live_publish_set_updated_at ON auto_blog_live_publish;
CREATE TRIGGER auto_blog_live_publish_set_updated_at
  BEFORE UPDATE ON auto_blog_live_publish
  FOR EACH ROW
  EXECUTE FUNCTION set_updated_at();

DROP TRIGGER IF EXISTS auto_blog_categories_set_updated_at ON auto_blog_categories;
CREATE TRIGGER auto_blog_categories_set_updated_at
  BEFORE UPDATE ON auto_blog_categories
  FOR EACH ROW
  EXECUTE FUNCTION set_updated_at();

DROP TRIGGER IF EXISTS auto_blog_topics_set_updated_at ON auto_blog_topics;
CREATE TRIGGER auto_blog_topics_set_updated_at
  BEFORE UPDATE ON auto_blog_topics
  FOR EACH ROW
  EXECUTE FUNCTION set_updated_at();

ALTER TABLE auto_blog_categories
  ADD COLUMN IF NOT EXISTS prompt TEXT NOT NULL DEFAULT '';

ALTER TABLE users
  ADD COLUMN IF NOT EXISTS role VARCHAR(20) NOT NULL DEFAULT 'user';

ALTER TABLE users
  ADD COLUMN IF NOT EXISTS is_suspended BOOLEAN NOT NULL DEFAULT FALSE;

CREATE TABLE IF NOT EXISTS credit_transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  admin_id UUID REFERENCES users(id) ON DELETE SET NULL,
  amount NUMERIC(10, 2) NOT NULL,
  balance_after NUMERIC(10, 2) NOT NULL,
  reason VARCHAR(255) NOT NULL DEFAULT '',
  type VARCHAR(30) NOT NULL DEFAULT 'admin_adjustment',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_credit_transactions_user_id
  ON credit_transactions (user_id, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_users_role
  ON users (role);

CREATE TABLE IF NOT EXISTS admin_users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email VARCHAR(255) NOT NULL UNIQUE,
  password_hash VARCHAR(255) NOT NULL,
  full_name VARCHAR(120),
  role VARCHAR(20) NOT NULL DEFAULT 'staff'
    CHECK (role IN ('administrator', 'manager', 'staff', 'support')),
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE admin_users ADD COLUMN IF NOT EXISTS role VARCHAR(20);
UPDATE admin_users SET role = 'administrator' WHERE role IS NULL;
ALTER TABLE admin_users ALTER COLUMN role SET DEFAULT 'staff';
ALTER TABLE admin_users ALTER COLUMN role SET NOT NULL;
ALTER TABLE admin_users DROP CONSTRAINT IF EXISTS admin_users_role_check;
ALTER TABLE admin_users
  ADD CONSTRAINT admin_users_role_check
  CHECK (role IN ('administrator', 'manager', 'staff', 'support', 'editor'));

CREATE TABLE IF NOT EXISTS cms_blog_posts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  author_id UUID REFERENCES admin_users(id) ON DELETE SET NULL,
  title VARCHAR(500) NOT NULL,
  slug VARCHAR(500) NOT NULL UNIQUE,
  excerpt TEXT NOT NULL DEFAULT '',
  content TEXT NOT NULL DEFAULT '',
  focus_keyword VARCHAR(120) NOT NULL DEFAULT '',
  meta_description VARCHAR(320) NOT NULL DEFAULT '',
  seo_title VARCHAR(500) NOT NULL DEFAULT '',
  featured_image TEXT NOT NULL DEFAULT '',
  status VARCHAR(20) NOT NULL DEFAULT 'draft'
    CHECK (status IN ('draft', 'published')),
  published_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_cms_blog_posts_status_published
  ON cms_blog_posts (status, published_at DESC);

CREATE INDEX IF NOT EXISTS idx_cms_blog_posts_slug
  ON cms_blog_posts (slug);

ALTER TABLE cms_blog_posts ADD COLUMN IF NOT EXISTS featured_image TEXT NOT NULL DEFAULT '';

ALTER TABLE auto_blog_settings ADD COLUMN IF NOT EXISTS featured_image_ai_provider VARCHAR(30) NOT NULL DEFAULT 'openai';
ALTER TABLE auto_blog_settings ADD COLUMN IF NOT EXISTS featured_image_ai_model VARCHAR(100) NOT NULL DEFAULT 'dall-e-3';
ALTER TABLE auto_blog_settings ADD COLUMN IF NOT EXISTS featured_image_api_key TEXT NOT NULL DEFAULT '';

DROP TRIGGER IF EXISTS cms_blog_posts_set_updated_at ON cms_blog_posts;
CREATE TRIGGER cms_blog_posts_set_updated_at
  BEFORE UPDATE ON cms_blog_posts
  FOR EACH ROW
  EXECUTE FUNCTION set_updated_at();

CREATE INDEX IF NOT EXISTS idx_admin_users_email
  ON admin_users (email);

CREATE INDEX IF NOT EXISTS idx_admin_users_role
  ON admin_users (role);

DROP TRIGGER IF EXISTS admin_users_set_updated_at ON admin_users;
CREATE TRIGGER admin_users_set_updated_at
  BEFORE UPDATE ON admin_users
  FOR EACH ROW
  EXECUTE FUNCTION set_updated_at();

ALTER TABLE credit_transactions DROP CONSTRAINT IF EXISTS credit_transactions_admin_id_fkey;

ALTER TABLE credit_transactions
  ADD CONSTRAINT credit_transactions_admin_id_fkey
  FOREIGN KEY (admin_id) REFERENCES admin_users(id) ON DELETE SET NULL;

CREATE TABLE IF NOT EXISTS payment_settings (
  id SMALLINT PRIMARY KEY DEFAULT 1 CHECK (id = 1),
  active_mode VARCHAR(10) NOT NULL DEFAULT 'test' CHECK (active_mode IN ('test', 'live')),
  stripe_enabled BOOLEAN NOT NULL DEFAULT FALSE,
  stripe_test_publishable_key TEXT NOT NULL DEFAULT '',
  stripe_test_secret_key TEXT NOT NULL DEFAULT '',
  stripe_live_publishable_key TEXT NOT NULL DEFAULT '',
  stripe_live_secret_key TEXT NOT NULL DEFAULT '',
  razorpay_enabled BOOLEAN NOT NULL DEFAULT FALSE,
  razorpay_test_key_id TEXT NOT NULL DEFAULT '',
  razorpay_test_key_secret TEXT NOT NULL DEFAULT '',
  razorpay_live_key_id TEXT NOT NULL DEFAULT '',
  razorpay_live_key_secret TEXT NOT NULL DEFAULT '',
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

INSERT INTO payment_settings (id)
VALUES (1)
ON CONFLICT (id) DO NOTHING;

DROP TRIGGER IF EXISTS payment_settings_set_updated_at ON payment_settings;
CREATE TRIGGER payment_settings_set_updated_at
  BEFORE UPDATE ON payment_settings
  FOR EACH ROW
  EXECUTE FUNCTION set_updated_at();

CREATE TABLE IF NOT EXISTS credit_purchases (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  provider VARCHAR(20) NOT NULL CHECK (provider IN ('stripe', 'razorpay')),
  external_id VARCHAR(255) NOT NULL,
  credits INTEGER NOT NULL CHECK (credits > 0),
  amount_cents INTEGER NOT NULL CHECK (amount_cents > 0),
  currency VARCHAR(10) NOT NULL DEFAULT 'usd',
  status VARCHAR(20) NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'completed', 'failed')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  completed_at TIMESTAMPTZ
);

CREATE UNIQUE INDEX IF NOT EXISTS idx_credit_purchases_provider_external
  ON credit_purchases (provider, external_id);

CREATE INDEX IF NOT EXISTS idx_credit_purchases_user_id
  ON credit_purchases (user_id, created_at DESC);

CREATE TABLE IF NOT EXISTS user_activities (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  service VARCHAR(40) NOT NULL,
  action VARCHAR(40) NOT NULL,
  status VARCHAR(20) NOT NULL DEFAULT 'started' CHECK (status IN ('started', 'completed', 'failed')),
  title VARCHAR(500) NOT NULL DEFAULT '',
  detail TEXT NOT NULL DEFAULT '',
  metadata JSONB NOT NULL DEFAULT '{}',
  reference_id UUID,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_user_activities_user_id
  ON user_activities (user_id, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_user_activities_created_at
  ON user_activities (created_at DESC);

CREATE INDEX IF NOT EXISTS idx_user_activities_service_action
  ON user_activities (service, action, created_at DESC);

DROP TRIGGER IF EXISTS user_activities_set_updated_at ON user_activities;
CREATE TRIGGER user_activities_set_updated_at
  BEFORE UPDATE ON user_activities
  FOR EACH ROW
  EXECUTE FUNCTION set_updated_at();

CREATE TABLE IF NOT EXISTS support_tickets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  subject VARCHAR(255) NOT NULL,
  category VARCHAR(40) NOT NULL DEFAULT 'general'
    CHECK (category IN ('billing', 'credits', 'technical', 'account', 'general')),
  status VARCHAR(20) NOT NULL DEFAULT 'open'
    CHECK (status IN ('open', 'in_progress', 'resolved', 'closed')),
  priority VARCHAR(20) NOT NULL DEFAULT 'normal'
    CHECK (priority IN ('low', 'normal', 'high')),
  assigned_admin_id UUID REFERENCES admin_users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  resolved_at TIMESTAMPTZ
);

CREATE INDEX IF NOT EXISTS idx_support_tickets_user_id
  ON support_tickets (user_id, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_support_tickets_status
  ON support_tickets (status, updated_at DESC);

CREATE INDEX IF NOT EXISTS idx_support_tickets_assigned_admin
  ON support_tickets (assigned_admin_id);

CREATE TABLE IF NOT EXISTS support_ticket_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  ticket_id UUID NOT NULL REFERENCES support_tickets(id) ON DELETE CASCADE,
  author_type VARCHAR(10) NOT NULL CHECK (author_type IN ('user', 'admin')),
  author_user_id UUID REFERENCES users(id) ON DELETE SET NULL,
  author_admin_id UUID REFERENCES admin_users(id) ON DELETE SET NULL,
  message TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_support_ticket_messages_ticket_id
  ON support_ticket_messages (ticket_id, created_at ASC);

DROP TRIGGER IF EXISTS support_tickets_set_updated_at ON support_tickets;
CREATE TRIGGER support_tickets_set_updated_at
  BEFORE UPDATE ON support_tickets
  FOR EACH ROW
  EXECUTE FUNCTION set_updated_at();

CREATE TABLE IF NOT EXISTS invoice_company_settings (
  id SMALLINT PRIMARY KEY DEFAULT 1 CHECK (id = 1),
  company_name VARCHAR(200) NOT NULL DEFAULT '',
  company_email VARCHAR(255) NOT NULL DEFAULT '',
  company_phone VARCHAR(50) NOT NULL DEFAULT '',
  company_address_line1 VARCHAR(255) NOT NULL DEFAULT '',
  company_address_line2 VARCHAR(255) NOT NULL DEFAULT '',
  company_city VARCHAR(120) NOT NULL DEFAULT '',
  company_state VARCHAR(120) NOT NULL DEFAULT '',
  company_postal_code VARCHAR(30) NOT NULL DEFAULT '',
  company_country VARCHAR(120) NOT NULL DEFAULT '',
  tax_id VARCHAR(80) NOT NULL DEFAULT '',
  invoice_prefix VARCHAR(20) NOT NULL DEFAULT 'INV',
  invoice_footer TEXT NOT NULL DEFAULT '',
  next_invoice_number INTEGER NOT NULL DEFAULT 1 CHECK (next_invoice_number >= 1),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

INSERT INTO invoice_company_settings (id, company_name, company_email, invoice_footer)
VALUES (
  1,
  'Content AI',
  'hello@contentai.example',
  'Thank you for your purchase. Credits are added to your account immediately after payment.'
)
ON CONFLICT (id) DO NOTHING;

DROP TRIGGER IF EXISTS invoice_company_settings_set_updated_at ON invoice_company_settings;
CREATE TRIGGER invoice_company_settings_set_updated_at
  BEFORE UPDATE ON invoice_company_settings
  FOR EACH ROW
  EXECUTE FUNCTION set_updated_at();

CREATE TABLE IF NOT EXISTS user_billing_profiles (
  user_id UUID PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
  billing_name VARCHAR(200) NOT NULL DEFAULT '',
  company_name VARCHAR(200) NOT NULL DEFAULT '',
  email VARCHAR(255) NOT NULL DEFAULT '',
  phone VARCHAR(50) NOT NULL DEFAULT '',
  address_line1 VARCHAR(255) NOT NULL DEFAULT '',
  address_line2 VARCHAR(255) NOT NULL DEFAULT '',
  city VARCHAR(120) NOT NULL DEFAULT '',
  state VARCHAR(120) NOT NULL DEFAULT '',
  postal_code VARCHAR(30) NOT NULL DEFAULT '',
  country VARCHAR(120) NOT NULL DEFAULT '',
  tax_id VARCHAR(80) NOT NULL DEFAULT '',
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

DROP TRIGGER IF EXISTS user_billing_profiles_set_updated_at ON user_billing_profiles;
CREATE TRIGGER user_billing_profiles_set_updated_at
  BEFORE UPDATE ON user_billing_profiles
  FOR EACH ROW
  EXECUTE FUNCTION set_updated_at();

CREATE TABLE IF NOT EXISTS invoices (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  purchase_id UUID NOT NULL UNIQUE REFERENCES credit_purchases(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  invoice_number VARCHAR(40) NOT NULL UNIQUE,
  company_snapshot JSONB NOT NULL DEFAULT '{}',
  customer_snapshot JSONB NOT NULL DEFAULT '{}',
  line_items JSONB NOT NULL DEFAULT '[]',
  subtotal_cents INTEGER NOT NULL CHECK (subtotal_cents > 0),
  currency VARCHAR(10) NOT NULL DEFAULT 'usd',
  issued_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_invoices_user_id
  ON invoices (user_id, issued_at DESC);

CREATE INDEX IF NOT EXISTS idx_invoices_purchase_id
  ON invoices (purchase_id);

CREATE TABLE IF NOT EXISTS social_content_settings (
  user_id UUID PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
  enabled BOOLEAN NOT NULL DEFAULT TRUE,
  ai_provider VARCHAR(30) NOT NULL DEFAULT 'openai',
  ai_model VARCHAR(100) NOT NULL DEFAULT 'gpt-4o',
  api_key TEXT NOT NULL DEFAULT '',
  brand_voice TEXT NOT NULL DEFAULT '',
  default_topic_brief TEXT NOT NULL DEFAULT '',
  content_language VARCHAR(20) NOT NULL DEFAULT 'en',
  content_tone VARCHAR(30) NOT NULL DEFAULT 'professional',
  default_platform VARCHAR(30) NOT NULL DEFAULT 'linkedin',
  generation_temperature NUMERIC(4, 2) NOT NULL DEFAULT 0.7,
  generation_max_tokens INTEGER NOT NULL DEFAULT 2000,
  include_hashtags BOOLEAN NOT NULL DEFAULT TRUE,
  include_hook BOOLEAN NOT NULL DEFAULT TRUE,
  post_image_enabled BOOLEAN NOT NULL DEFAULT FALSE,
  post_image_ai_provider VARCHAR(30) NOT NULL DEFAULT 'openai',
  post_image_ai_model VARCHAR(100) NOT NULL DEFAULT 'dall-e-3',
  post_image_api_key TEXT NOT NULL DEFAULT '',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS social_content_posts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  platform VARCHAR(30) NOT NULL DEFAULT 'linkedin',
  topic TEXT NOT NULL DEFAULT '',
  hook TEXT,
  content TEXT NOT NULL DEFAULT '',
  hashtags TEXT[] NOT NULL DEFAULT '{}',
  post_image TEXT NOT NULL DEFAULT '',
  status VARCHAR(20) NOT NULL DEFAULT 'draft',
  provider VARCHAR(50),
  model VARCHAR(100),
  tokens_prompt INTEGER NOT NULL DEFAULT 0,
  tokens_completion INTEGER NOT NULL DEFAULT 0,
  tokens_total INTEGER NOT NULL DEFAULT 0,
  error_message TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_social_content_posts_user_id
  ON social_content_posts (user_id, created_at DESC);

CREATE TABLE IF NOT EXISTS social_content_generation_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  post_id UUID REFERENCES social_content_posts(id) ON DELETE SET NULL,
  platform VARCHAR(30) NOT NULL DEFAULT '',
  topic TEXT NOT NULL DEFAULT '',
  status VARCHAR(20) NOT NULL DEFAULT 'pending',
  provider VARCHAR(50),
  model VARCHAR(100),
  tokens_prompt INTEGER NOT NULL DEFAULT 0,
  tokens_completion INTEGER NOT NULL DEFAULT 0,
  tokens_total INTEGER NOT NULL DEFAULT 0,
  error_message TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

DROP TRIGGER IF EXISTS social_content_settings_set_updated_at ON social_content_settings;
CREATE TRIGGER social_content_settings_set_updated_at
  BEFORE UPDATE ON social_content_settings
  FOR EACH ROW
  EXECUTE FUNCTION set_updated_at();

DROP TRIGGER IF EXISTS social_content_posts_set_updated_at ON social_content_posts;
CREATE TRIGGER social_content_posts_set_updated_at
  BEFORE UPDATE ON social_content_posts
  FOR EACH ROW
  EXECUTE FUNCTION set_updated_at();

ALTER TABLE social_content_settings ADD COLUMN IF NOT EXISTS post_image_enabled BOOLEAN NOT NULL DEFAULT FALSE;
ALTER TABLE social_content_settings ADD COLUMN IF NOT EXISTS post_image_ai_provider VARCHAR(30) NOT NULL DEFAULT 'openai';
ALTER TABLE social_content_settings ADD COLUMN IF NOT EXISTS post_image_ai_model VARCHAR(100) NOT NULL DEFAULT 'dall-e-3';
ALTER TABLE social_content_settings ADD COLUMN IF NOT EXISTS post_image_api_key TEXT NOT NULL DEFAULT '';

ALTER TABLE social_content_posts ADD COLUMN IF NOT EXISTS post_image TEXT NOT NULL DEFAULT '';

ALTER TABLE social_content_posts ADD COLUMN IF NOT EXISTS post_image_error TEXT NOT NULL DEFAULT '';

ALTER TABLE social_content_settings ADD COLUMN IF NOT EXISTS default_topic_brief TEXT NOT NULL DEFAULT '';

CREATE TABLE IF NOT EXISTS social_content_categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  name VARCHAR(120) NOT NULL,
  description TEXT NOT NULL DEFAULT '',
  prompt TEXT NOT NULL DEFAULT '',
  enabled BOOLEAN NOT NULL DEFAULT TRUE,
  sort_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_social_content_categories_user_id
  ON social_content_categories (user_id, sort_order, name);

CREATE TABLE IF NOT EXISTS social_content_topics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  category_id UUID REFERENCES social_content_categories(id) ON DELETE SET NULL,
  platform VARCHAR(30),
  topic VARCHAR(255) NOT NULL,
  status VARCHAR(20) NOT NULL DEFAULT 'pending',
  source VARCHAR(20) NOT NULL DEFAULT 'manual',
  priority INTEGER NOT NULL DEFAULT 5,
  post_id UUID REFERENCES social_content_posts(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_social_content_topics_user_id
  ON social_content_topics (user_id, status, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_social_content_topics_category_id
  ON social_content_topics (user_id, category_id);

ALTER TABLE social_content_posts
  ADD COLUMN IF NOT EXISTS topic_id UUID REFERENCES social_content_topics(id) ON DELETE SET NULL;

ALTER TABLE social_content_posts
  ADD COLUMN IF NOT EXISTS remote_post_id TEXT NOT NULL DEFAULT '';

ALTER TABLE social_content_posts
  ADD COLUMN IF NOT EXISTS remote_post_url TEXT NOT NULL DEFAULT '';

ALTER TABLE social_content_posts
  ADD COLUMN IF NOT EXISTS live_publish_error TEXT NOT NULL DEFAULT '';

CREATE TABLE IF NOT EXISTS social_content_live_publish (
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  platform VARCHAR(30) NOT NULL,
  enabled BOOLEAN NOT NULL DEFAULT FALSE,
  access_token TEXT NOT NULL DEFAULT '',
  refresh_token TEXT NOT NULL DEFAULT '',
  token_expires_at TIMESTAMPTZ,
  account_id TEXT NOT NULL DEFAULT '',
  account_name TEXT NOT NULL DEFAULT '',
  meta_page_id TEXT NOT NULL DEFAULT '',
  webhook_url TEXT NOT NULL DEFAULT '',
  webhook_secret TEXT NOT NULL DEFAULT '',
  last_tested_at TIMESTAMPTZ,
  last_test_status VARCHAR(20),
  last_test_message TEXT NOT NULL DEFAULT '',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  PRIMARY KEY (user_id, platform)
);

ALTER TABLE social_content_live_publish DROP CONSTRAINT IF EXISTS social_content_live_publish_pkey;
ALTER TABLE social_content_live_publish ADD PRIMARY KEY (user_id, platform);

ALTER TABLE social_content_settings ADD COLUMN IF NOT EXISTS live_publish_enabled BOOLEAN NOT NULL DEFAULT FALSE;

DROP TRIGGER IF EXISTS social_content_live_publish_set_updated_at ON social_content_live_publish;
CREATE TRIGGER social_content_live_publish_set_updated_at
  BEFORE UPDATE ON social_content_live_publish
  FOR EACH ROW
  EXECUTE FUNCTION set_updated_at();

DROP TRIGGER IF EXISTS social_content_categories_set_updated_at ON social_content_categories;
CREATE TRIGGER social_content_categories_set_updated_at
  BEFORE UPDATE ON social_content_categories
  FOR EACH ROW
  EXECUTE FUNCTION set_updated_at();

DROP TRIGGER IF EXISTS social_content_topics_set_updated_at ON social_content_topics;
CREATE TRIGGER social_content_topics_set_updated_at
  BEFORE UPDATE ON social_content_topics
  FOR EACH ROW
  EXECUTE FUNCTION set_updated_at();

CREATE TABLE IF NOT EXISTS service_credit_settings (
  service_id VARCHAR(50) PRIMARY KEY,
  title VARCHAR(200) NOT NULL DEFAULT '',
  credit_cost NUMERIC(10, 2) NOT NULL DEFAULT 1 CHECK (credit_cost >= 0 AND credit_cost <= 100),
  sort_order INTEGER NOT NULL DEFAULT 0,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

INSERT INTO service_credit_settings (service_id, title, credit_cost, sort_order)
VALUES
  ('auto-blog', 'Auto Blog Creation', 1, 1),
  ('social-content', 'Social Media Content', 1, 2),
  ('seo-optimization', 'SEO Optimization', 1, 3),
  ('content-repurpose', 'Content Repurposing', 1, 4),
  ('email-newsletters', 'Email Newsletters', 1, 5),
  ('content-scheduling', 'Content Scheduling', 1, 6)
ON CONFLICT (service_id) DO NOTHING;

DROP TRIGGER IF EXISTS service_credit_settings_set_updated_at ON service_credit_settings;
CREATE TRIGGER service_credit_settings_set_updated_at
  BEFORE UPDATE ON service_credit_settings
  FOR EACH ROW
  EXECUTE FUNCTION set_updated_at();

ALTER TABLE service_credit_settings
  ALTER COLUMN credit_cost TYPE NUMERIC(10, 2) USING credit_cost::NUMERIC(10, 2);

ALTER TABLE users
  ALTER COLUMN credits TYPE NUMERIC(10, 2) USING credits::NUMERIC(10, 2);

ALTER TABLE credit_transactions
  ALTER COLUMN amount TYPE NUMERIC(10, 2) USING amount::NUMERIC(10, 2),
  ALTER COLUMN balance_after TYPE NUMERIC(10, 2) USING balance_after::NUMERIC(10, 2);

CREATE TABLE IF NOT EXISTS email_newsletter_settings (
  user_id UUID PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
  enabled BOOLEAN NOT NULL DEFAULT TRUE,
  ai_provider VARCHAR(30) NOT NULL DEFAULT 'openai',
  ai_model VARCHAR(100) NOT NULL DEFAULT 'gpt-4o',
  api_key TEXT NOT NULL DEFAULT '',
  brand_voice TEXT NOT NULL DEFAULT '',
  company_name VARCHAR(200) NOT NULL DEFAULT '',
  from_name VARCHAR(200) NOT NULL DEFAULT '',
  default_topic_brief TEXT NOT NULL DEFAULT '',
  content_language VARCHAR(20) NOT NULL DEFAULT 'en',
  content_tone VARCHAR(30) NOT NULL DEFAULT 'professional',
  email_template_style VARCHAR(30) NOT NULL DEFAULT 'classic',
  include_cta BOOLEAN NOT NULL DEFAULT TRUE,
  default_cta_text VARCHAR(200) NOT NULL DEFAULT 'Learn more',
  default_cta_url TEXT NOT NULL DEFAULT '',
  footer_text TEXT NOT NULL DEFAULT '',
  generation_temperature NUMERIC(4, 2) NOT NULL DEFAULT 0.7,
  generation_max_tokens INTEGER NOT NULL DEFAULT 6000,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE email_newsletter_settings
  ADD COLUMN IF NOT EXISTS newsletter_format VARCHAR(30) NOT NULL DEFAULT 'content_email';

CREATE TABLE IF NOT EXISTS email_newsletter_posts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  topic TEXT NOT NULL DEFAULT '',
  subject VARCHAR(500) NOT NULL DEFAULT '',
  preview_text VARCHAR(320) NOT NULL DEFAULT '',
  html_content TEXT NOT NULL DEFAULT '',
  plain_text TEXT NOT NULL DEFAULT '',
  status VARCHAR(20) NOT NULL DEFAULT 'draft',
  provider VARCHAR(50),
  model VARCHAR(100),
  tokens_prompt INTEGER NOT NULL DEFAULT 0,
  tokens_completion INTEGER NOT NULL DEFAULT 0,
  tokens_total INTEGER NOT NULL DEFAULT 0,
  error_message TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_email_newsletter_posts_user_id
  ON email_newsletter_posts (user_id, created_at DESC);

CREATE TABLE IF NOT EXISTS email_newsletter_generation_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  post_id UUID REFERENCES email_newsletter_posts(id) ON DELETE SET NULL,
  topic TEXT NOT NULL DEFAULT '',
  status VARCHAR(20) NOT NULL DEFAULT 'pending',
  provider VARCHAR(50),
  model VARCHAR(100),
  tokens_prompt INTEGER NOT NULL DEFAULT 0,
  tokens_completion INTEGER NOT NULL DEFAULT 0,
  tokens_total INTEGER NOT NULL DEFAULT 0,
  error_message TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

DROP TRIGGER IF EXISTS email_newsletter_settings_set_updated_at ON email_newsletter_settings;
CREATE TRIGGER email_newsletter_settings_set_updated_at
  BEFORE UPDATE ON email_newsletter_settings
  FOR EACH ROW
  EXECUTE FUNCTION set_updated_at();

DROP TRIGGER IF EXISTS email_newsletter_posts_set_updated_at ON email_newsletter_posts;
CREATE TRIGGER email_newsletter_posts_set_updated_at
  BEFORE UPDATE ON email_newsletter_posts
  FOR EACH ROW
  EXECUTE FUNCTION set_updated_at();

CREATE TABLE IF NOT EXISTS email_newsletter_categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  name VARCHAR(120) NOT NULL,
  description TEXT NOT NULL DEFAULT '',
  prompt TEXT NOT NULL DEFAULT '',
  enabled BOOLEAN NOT NULL DEFAULT TRUE,
  sort_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_email_newsletter_categories_user_id
  ON email_newsletter_categories (user_id, sort_order, name);

CREATE TABLE IF NOT EXISTS email_newsletter_topics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  category_id UUID REFERENCES email_newsletter_categories(id) ON DELETE SET NULL,
  topic VARCHAR(255) NOT NULL,
  status VARCHAR(20) NOT NULL DEFAULT 'pending',
  source VARCHAR(20) NOT NULL DEFAULT 'manual',
  priority INTEGER NOT NULL DEFAULT 5,
  post_id UUID REFERENCES email_newsletter_posts(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_email_newsletter_topics_user_id
  ON email_newsletter_topics (user_id, status, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_email_newsletter_topics_category_id
  ON email_newsletter_topics (user_id, category_id);

ALTER TABLE email_newsletter_posts
  ADD COLUMN IF NOT EXISTS topic_id UUID REFERENCES email_newsletter_topics(id) ON DELETE SET NULL;

DROP TRIGGER IF EXISTS email_newsletter_categories_set_updated_at ON email_newsletter_categories;
CREATE TRIGGER email_newsletter_categories_set_updated_at
  BEFORE UPDATE ON email_newsletter_categories
  FOR EACH ROW
  EXECUTE FUNCTION set_updated_at();

DROP TRIGGER IF EXISTS email_newsletter_topics_set_updated_at ON email_newsletter_topics;
CREATE TRIGGER email_newsletter_topics_set_updated_at
  BEFORE UPDATE ON email_newsletter_topics
  FOR EACH ROW
  EXECUTE FUNCTION set_updated_at();

ALTER TABLE email_newsletter_settings
  ADD COLUMN IF NOT EXISTS email_image_enabled BOOLEAN NOT NULL DEFAULT FALSE;

ALTER TABLE email_newsletter_settings
  ADD COLUMN IF NOT EXISTS email_image_ai_provider VARCHAR(30) NOT NULL DEFAULT 'openai';

ALTER TABLE email_newsletter_settings
  ADD COLUMN IF NOT EXISTS email_image_ai_model VARCHAR(100) NOT NULL DEFAULT 'dall-e-3';

ALTER TABLE email_newsletter_settings
  ADD COLUMN IF NOT EXISTS email_image_api_key TEXT NOT NULL DEFAULT '';

ALTER TABLE email_newsletter_posts
  ADD COLUMN IF NOT EXISTS email_image TEXT NOT NULL DEFAULT '';

ALTER TABLE email_newsletter_posts
  ADD COLUMN IF NOT EXISTS email_image_error TEXT NOT NULL DEFAULT '';
