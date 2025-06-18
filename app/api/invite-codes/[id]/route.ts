import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

// 删除邀请码
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const id = parseInt(params.id)

    if (isNaN(id)) {
      return NextResponse.json({ error: '邀请码ID无效' }, { status: 400 })
    }

    // 删除邀请码
    const { data, error } = await supabase
      .from('invite_codes')
      .delete()
      .eq('id', id)
      .select()
      .single()

    if (error) {
      console.error('删除邀请码失败:', error)
      return NextResponse.json({ error: '删除邀请码失败' }, { status: 500 })
    }

    return NextResponse.json({ 
      message: '邀请码删除成功',
      inviteCode: data 
    })
  } catch (error) {
    console.error('服务器错误:', error)
    return NextResponse.json({ error: '服务器错误' }, { status: 500 })
  }
} 