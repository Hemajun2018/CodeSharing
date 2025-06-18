import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

// 删除分类
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const id = parseInt(params.id)

    if (isNaN(id)) {
      return NextResponse.json({ error: '分类ID无效' }, { status: 400 })
    }

    // 先删除该分类下的所有邀请码
    const { error: deleteInviteCodesError } = await supabase
      .from('invite_codes')
      .delete()
      .eq('category_id', id)

    if (deleteInviteCodesError) {
      console.error('删除邀请码失败:', deleteInviteCodesError)
      return NextResponse.json({ error: '删除邀请码失败' }, { status: 500 })
    }

    // 然后删除分类
    const { data, error, count } = await supabase
      .from('categories')
      .delete()
      .eq('id', id)
      .select()

    if (error) {
      console.error('删除分类失败:', error)
      return NextResponse.json({ error: '删除分类失败' }, { status: 500 })
    }

    if (count === 0) {
      return NextResponse.json({ error: '找不到要删除的分类' }, { status: 404 })
    }

    return NextResponse.json({ 
      message: '分类删除成功',
      category: data?.[0] 
    })
  } catch (error) {
    console.error('服务器错误:', error)
    return NextResponse.json({ error: '服务器错误' }, { status: 500 })
  }
} 