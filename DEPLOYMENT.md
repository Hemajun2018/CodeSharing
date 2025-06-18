# 🚀 CodeSharing 部署指南

## 📋 部署前准备

### 1. 创建 Supabase 项目

1. 访问 [Supabase](https://supabase.com/)
2. 点击 "Start your project"
3. 创建新项目，记录以下信息：
   - Project URL (类似: `https://xxx.supabase.co`)
   - API Keys 中的 `anon` `public` key

### 2. 设置数据库

1. 在 Supabase 控制台中，进入 SQL Editor
2. 复制 `supabase-schema.sql` 文件的全部内容
3. 在 SQL Editor 中粘贴并执行

## 🌐 Vercel 部署

### 1. 推送代码到 GitHub

```bash
git add .
git commit -m "Add Supabase integration"
git push origin main
```

### 2. 部署到 Vercel

1. 访问 [Vercel](https://vercel.com/)
2. 点击 "New Project"
3. 导入你的 GitHub 仓库
4. 在环境变量设置中添加：
   - `NEXT_PUBLIC_SUPABASE_URL`: 你的 Supabase 项目 URL
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`: 你的 Supabase anon key
5. 点击 "Deploy"

### 3. 本地开发环境设置

更新 `.env.local` 文件：

```env
NEXT_PUBLIC_SUPABASE_URL=你的_supabase_项目_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=你的_supabase_anon_key
```

## 🔧 功能特性

### ✅ 已实现功能

- 📦 **分类管理**: 动态添加新分类
- 📤 **邀请码上传**: 批量上传邀请码（自动分割）
- 📥 **邀请码获取**: 一键获取并复制邀请码
- 🌙 **主题切换**: 深色/浅色模式
- 📱 **响应式设计**: 适配移动端和桌面端
- 🗃️ **数据持久化**: 使用 Supabase PostgreSQL 数据库
- ⚡ **实时更新**: 数据变更即时反映

### 🏗️ 数据库结构

- **categories**: 分类表
  - `id`: 主键
  - `name`: 分类名称
  - `created_at`: 创建时间
  - `updated_at`: 更新时间

- **invite_codes**: 邀请码表
  - `id`: 主键
  - `category_id`: 所属分类ID
  - `code`: 邀请码内容
  - `is_used`: 是否已使用
  - `created_at`: 创建时间
  - `used_at`: 使用时间

## 🛡️ 安全配置

项目使用 Supabase 的行级安全策略 (RLS)：
- 所有用户可以读取数据
- 所有用户可以插入新数据
- 所有用户可以更新数据状态

## 📈 性能优化

- 数据库索引优化
- API 路由缓存
- 响应式图片加载
- CSS 代码分割

## 🔍 故障排除

### 常见问题

1. **环境变量未设置**
   - 确保 `.env.local` 文件配置正确
   - 检查 Vercel 环境变量设置

2. **数据库连接失败**
   - 验证 Supabase URL 和 API Key
   - 确保数据库表已正确创建

3. **部署失败**
   - 检查 build 日志
   - 确保所有依赖已正确安装

### 支持联系

如果遇到问题，请检查：
1. Supabase 项目状态
2. Vercel 部署日志
3. 浏览器开发者工具的错误信息 