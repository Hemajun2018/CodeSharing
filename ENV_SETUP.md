# 🔧 环境变量配置指南

## 本地开发环境

在项目根目录创建 `.env.local` 文件：

```bash
# 在项目根目录执行
touch .env.local
```

然后在 `.env.local` 文件中添加以下内容：

```env
# Supabase 配置
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key

# 硅基流动 API 密钥（AI功能）
SILICONFLOW_API_KEY=sk-your_siliconflow_api_key
```

## Vercel 部署环境

在 Vercel 项目设置的 Environment Variables 中添加：

| Variable Name | Value | Description |
|---------------|-------|-------------|
| `NEXT_PUBLIC_SUPABASE_URL` | `https://your-project.supabase.co` | Supabase 项目 URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | `your_supabase_anon_key` | Supabase 匿名密钥 |
| `SILICONFLOW_API_KEY` | `sk-your_siliconflow_api_key` | 硅基流动 API 密钥 |

## 🔑 获取API密钥

### Supabase
1. 访问 [Supabase](https://supabase.com/)
2. 创建项目后在 Settings > API 中找到相关密钥

### 硅基流动
1. 访问 [硅基流动](https://siliconflow.cn/)
2. 注册账户后在控制台创建 API 密钥

## ⚠️ 注意事项

- 永远不要将 `.env.local` 文件提交到版本控制系统
- API 密钥是敏感信息，请妥善保管
- 定期检查和轮换 API 密钥
- 确保生产环境和开发环境使用不同的密钥 