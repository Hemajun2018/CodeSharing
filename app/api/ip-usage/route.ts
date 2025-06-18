import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

// 获取客户端IP地址
function getClientIP(request: NextRequest): string {
  // 尝试从不同的header获取真实IP
  const forwardedFor = request.headers.get('x-forwarded-for')
  const realIP = request.headers.get('x-real-ip')
  const remoteAddr = request.headers.get('x-remote-addr')
  
  if (forwardedFor) {
    // x-forwarded-for 可能包含多个IP，取第一个
    return forwardedFor.split(',')[0].trim()
  }
  
  if (realIP) {
    return realIP
  }
  
  if (remoteAddr) {
    return remoteAddr
  }
  
  // 作为后备，虽然在生产环境中可能不准确
  return request.ip || 'unknown'
}

// 获取当前IP已使用的分类列表
export async function GET(request: NextRequest) {
  try {
    const clientIP = getClientIP(request)

    // 查询当前IP已经使用过的分类
    const { data: usedCategories, error } = await supabase
      .from('ip_category_usage')
      .select('category_id')
      .eq('ip_address', clientIP)

    if (error) {
      console.error('查询IP使用记录失败:', error)
      return NextResponse.json({ error: '查询失败' }, { status: 500 })
    }

    // 提取分类ID列表
    const usedCategoryIds = usedCategories?.map(usage => usage.category_id) || []

    return NextResponse.json({ 
      usedCategories: usedCategoryIds,
      clientIP: process.env.NODE_ENV === 'development' ? clientIP : undefined // 开发环境下显示IP用于调试
    })
  } catch (error) {
    console.error('服务器错误:', error)
    return NextResponse.json({ error: '服务器错误' }, { status: 500 })
  }
} 