import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

// 获取所有邀请码
export async function GET() {
  try {
    const { data, error } = await supabase
      .from('invite_codes')
      .select(`
        *,
        categories (
          id,
          name
        )
      `)
      .order('created_at', { ascending: false })

    if (error) {
      console.error('获取邀请码失败:', error)
      return NextResponse.json({ error: '获取邀请码失败' }, { status: 500 })
    }

    return NextResponse.json({ inviteCodes: data })
  } catch (error) {
    console.error('服务器错误:', error)
    return NextResponse.json({ error: '服务器错误' }, { status: 500 })
  }
}

// 创建新邀请码
export async function POST(request: NextRequest) {
  try {
    const { categoryId, codes } = await request.json()

    if (!categoryId || !codes || !Array.isArray(codes) || codes.length === 0) {
      return NextResponse.json({ error: '参数无效' }, { status: 400 })
    }

    // 验证分类是否存在
    const { data: category } = await supabase
      .from('categories')
      .select('id')
      .eq('id', categoryId)
      .single()

    if (!category) {
      return NextResponse.json({ error: '分类不存在' }, { status: 400 })
    }

    // 批量插入邀请码
    const inviteCodeData = codes.map(code => ({
      category_id: categoryId,
      code: code.trim(),
      is_used: false
    }))

    const { data, error } = await supabase
      .from('invite_codes')
      .insert(inviteCodeData)
      .select()

    if (error) {
      console.error('创建邀请码失败:', error)
      return NextResponse.json({ error: '创建邀请码失败' }, { status: 500 })
    }

    return NextResponse.json({ inviteCodes: data }, { status: 201 })
  } catch (error) {
    console.error('服务器错误:', error)
    return NextResponse.json({ error: '服务器错误' }, { status: 500 })
  }
} 