import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

export type Database = {
  public: {
    Tables: {
      categories: {
        Row: {
          id: number
          name: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: number
          name: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: number
          name?: string
          created_at?: string
          updated_at?: string
        }
      }
      invite_codes: {
        Row: {
          id: number
          category_id: number
          code: string
          is_used: boolean
          created_at: string
          used_at: string | null
        }
        Insert: {
          id?: number
          category_id: number
          code: string
          is_used?: boolean
          created_at?: string
          used_at?: string | null
        }
        Update: {
          id?: number
          category_id?: number
          code?: string
          is_used?: boolean
          created_at?: string
          used_at?: string | null
        }
      }
    }
  }
} 