import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

// 获取所有分类
export async function GET() {
  try {
    const { data, error } = await supabase
      .from('categories')
      .select('*')
      .order('created_at', { ascending: false })

    if (error) {
      console.error('获取分类失败:', error)
      return NextResponse.json({ error: '获取分类失败' }, { status: 500 })
    }

    return NextResponse.json({ categories: data })
  } catch (error) {
    console.error('服务器错误:', error)
    return NextResponse.json({ error: '服务器错误' }, { status: 500 })
  }
}

// 创建新分类
export async function POST(request: NextRequest) {
  try {
    const { name } = await request.json()

    if (!name?.trim()) {
      return NextResponse.json({ error: '分类名称不能为空' }, { status: 400 })
    }

    // 检查分类是否已存在
    const { data: existingCategory } = await supabase
      .from('categories')
      .select('id')
      .eq('name', name.trim())
      .single()

    if (existingCategory) {
      return NextResponse.json({ error: '分类已存在' }, { status: 400 })
    }

    // 创建新分类
    const { data, error } = await supabase
      .from('categories')
      .insert([{ name: name.trim() }])
      .select()
      .single()

    if (error) {
      console.error('创建分类失败:', error)
      return NextResponse.json({ error: '创建分类失败' }, { status: 500 })
    }

    return NextResponse.json({ category: data }, { status: 201 })
  } catch (error) {
    console.error('服务器错误:', error)
    return NextResponse.json({ error: '服务器错误' }, { status: 500 })
  }
} 