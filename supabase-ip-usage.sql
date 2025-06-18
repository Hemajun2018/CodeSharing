-- IP使用限制功能更新脚本
-- 为现有数据库添加IP分类使用记录表

-- 创建IP使用记录表
CREATE TABLE IF NOT EXISTS ip_category_usage (
  id BIGSERIAL PRIMARY KEY,
  ip_address VARCHAR(45) NOT NULL, -- 支持IPv4和IPv6
  category_id BIGINT NOT NULL REFERENCES categories(id) ON DELETE CASCADE,
  invite_code_id BIGINT NOT NULL REFERENCES invite_codes(id) ON DELETE CASCADE,
  used_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  UNIQUE(ip_address, category_id) -- 确保每个IP每个分类只能使用一次
);

-- 创建索引以提高查询性能
CREATE INDEX IF NOT EXISTS idx_ip_category_usage_ip ON ip_category_usage(ip_address);
CREATE INDEX IF NOT EXISTS idx_ip_category_usage_category ON ip_category_usage(category_id);

-- 启用行级安全策略 (RLS)
ALTER TABLE ip_category_usage ENABLE ROW LEVEL SECURITY;

-- 创建策略：允许所有人读取数据
DROP POLICY IF EXISTS "Enable read access for all users" ON ip_category_usage;
CREATE POLICY "Enable read access for all users" ON ip_category_usage FOR SELECT USING (true);

-- 创建策略：允许所有人插入数据
DROP POLICY IF EXISTS "Enable insert for all users" ON ip_category_usage;
CREATE POLICY "Enable insert for all users" ON ip_category_usage FOR INSERT WITH CHECK (true); 