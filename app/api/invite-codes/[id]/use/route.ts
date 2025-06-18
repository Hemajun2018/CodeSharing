import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

// 标记邀请码为已使用
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const id = parseInt(params.id)

    if (isNaN(id)) {
      return NextResponse.json({ error: '邀请码ID无效' }, { status: 400 })
    }

    // 检查邀请码是否存在且未使用
    const { data: existingCode } = await supabase
      .from('invite_codes')
      .select('id, is_used')
      .eq('id', id)
      .single()

    if (!existingCode) {
      return NextResponse.json({ error: '邀请码不存在' }, { status: 404 })
    }

    if (existingCode.is_used) {
      return NextResponse.json({ error: '邀请码已被使用' }, { status: 400 })
    }

    // 标记为已使用
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

    return NextResponse.json({ inviteCode: data })
  } catch (error) {
    console.error('服务器错误:', error)
    return NextResponse.json({ error: '服务器错误' }, { status: 500 })
  }
} 