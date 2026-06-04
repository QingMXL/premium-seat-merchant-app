import { createClient } from '@supabase/supabase-js'

// 从 .env 读取（本地开发请复制 .env.example → .env 并填入真实值）
const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL
const SUPABASE_KEY = import.meta.env.VITE_SUPABASE_KEY

if (!SUPABASE_URL || !SUPABASE_KEY) {
  console.error('[supabase] 缺少 VITE_SUPABASE_URL 或 VITE_SUPABASE_KEY — 请检查 .env 或 Vercel 环境变量')
}

export const supabase = createClient(
  SUPABASE_URL ?? 'https://placeholder.supabase.co',
  SUPABASE_KEY ?? 'placeholder',
)
