-- 创建分类表
CREATE TABLE categories (
  id BIGSERIAL PRIMARY KEY,
  name VARCHAR(100) NOT NULL UNIQUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- 创建邀请码表
CREATE TABLE invite_codes (
  id BIGSERIAL PRIMARY KEY,
  category_id BIGINT NOT NULL REFERENCES categories(id) ON DELETE CASCADE,
  code VARCHAR(255) NOT NULL,
  is_used BOOLEAN DEFAULT FALSE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  used_at TIMESTAMP WITH TIME ZONE
);

-- 创建IP使用记录表
CREATE TABLE ip_category_usage (
  id BIGSERIAL PRIMARY KEY,
  ip_address VARCHAR(45) NOT NULL, -- 支持IPv4和IPv6
  category_id BIGINT NOT NULL REFERENCES categories(id) ON DELETE CASCADE,
  invite_code_id BIGINT NOT NULL REFERENCES invite_codes(id) ON DELETE CASCADE,
  used_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  UNIQUE(ip_address, category_id) -- 确保每个IP每个分类只能使用一次
);

-- 创建索引以提高查询性能
CREATE INDEX idx_invite_codes_category_id ON invite_codes(category_id);
CREATE INDEX idx_invite_codes_is_used ON invite_codes(is_used);
CREATE INDEX idx_invite_codes_created_at ON invite_codes(created_at);
CREATE INDEX idx_ip_category_usage_ip ON ip_category_usage(ip_address);
CREATE INDEX idx_ip_category_usage_category ON ip_category_usage(category_id);

-- 创建更新时间的触发器函数
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = TIMEZONE('utc'::text, NOW());
    RETURN NEW;
END;
$$ language 'plpgsql';

-- 为分类表添加更新时间触发器
CREATE TRIGGER update_categories_updated_at BEFORE UPDATE ON categories 
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- 插入默认分类数据
INSERT INTO categories (name) VALUES 
  ('VPN服务'),
  ('云存储'),
  ('在线工具'),
  ('流媒体'),
  ('开发者工具'),
  ('学习平台');

-- 启用行级安全策略 (RLS)
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE invite_codes ENABLE ROW LEVEL SECURITY;
ALTER TABLE ip_category_usage ENABLE ROW LEVEL SECURITY;

-- 创建策略：允许所有人读取数据
CREATE POLICY "Enable read access for all users" ON categories FOR SELECT USING (true);
CREATE POLICY "Enable read access for all users" ON invite_codes FOR SELECT USING (true);
CREATE POLICY "Enable read access for all users" ON ip_category_usage FOR SELECT USING (true);

-- 创建策略：允许所有人插入数据
CREATE POLICY "Enable insert for all users" ON categories FOR INSERT WITH CHECK (true);
CREATE POLICY "Enable insert for all users" ON invite_codes FOR INSERT WITH CHECK (true);
CREATE POLICY "Enable insert for all users" ON ip_category_usage FOR INSERT WITH CHECK (true);

-- 创建策略：允许所有人更新数据
CREATE POLICY "Enable update for all users" ON categories FOR UPDATE USING (true);
CREATE POLICY "Enable update for all users" ON invite_codes FOR UPDATE USING (true); 