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

// 标记邀请码为已使用
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const id = parseInt(params.id)
    const clientIP = getClientIP(request)

    if (isNaN(id)) {
      return NextResponse.json({ error: '邀请码ID无效' }, { status: 400 })
    }

    // 检查邀请码是否存在且未使用，同时获取分类信息
    const { data: existingCode } = await supabase
      .from('invite_codes')
      .select('id, is_used, category_id')
      .eq('id', id)
      .single()

    if (!existingCode) {
      return NextResponse.json({ error: '邀请码不存在' }, { status: 404 })
    }

    if (existingCode.is_used) {
      return NextResponse.json({ error: '邀请码已被使用' }, { status: 400 })
    }

    // 检查该IP是否已经使用过此分类的邀请码
    const { data: ipUsage } = await supabase
      .from('ip_category_usage')
      .select('id')
      .eq('ip_address', clientIP)
      .eq('category_id', existingCode.category_id)
      .single()

    if (ipUsage) {
      // 获取分类名称用于错误信息
      const { data: category } = await supabase
        .from('categories')
        .select('name')
        .eq('id', existingCode.category_id)
        .single()
      
      return NextResponse.json({ 
        error: `您已经获取过 "${category?.name || '该分类'}" 的邀请码，每个分类只能获取一次` 
      }, { status: 400 })
    }

    // 开始事务：同时更新邀请码状态和记录IP使用
    const { data, error } = await supabase
      .from('invite_codes')
      .update({ 
        is_used: true,
        used_at: new Date().toISOString()
      })
      .eq('id', id)
      .select()
      .single()

    if (error) {
      console.error('标记邀请码失败:', error)
      return NextResponse.json({ error: '标记邀请码失败' }, { status: 500 })
    }

    // 记录IP使用记录
    const { error: usageError } = await supabase
      .from('ip_category_usage')
      .insert({
        ip_address: clientIP,
        category_id: existingCode.category_id,
        invite_code_id: id,
        used_at: new Date().toISOString()
      })

    if (usageError) {
      console.error('记录IP使用失败:', usageError)
      // 虽然记录失败，但邀请码已标记为使用，继续返回成功
    }

    return NextResponse.json({ inviteCode: data })
  } catch (error) {
    console.error('服务器错误:', error)
    return NextResponse.json({ error: '服务器错误' }, { status: 500 })
  }
} 