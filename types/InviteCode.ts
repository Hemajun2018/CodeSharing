export interface Category {
  id: number;
  name: string;
  created_at: string;
  updated_at: string;
}

export interface InviteCode {
  id: number;
  category_id: number;
  code: string;
  is_used: boolean;
  created_at: string;
  used_at: string | null;
  categories?: Category;
}

// 用于前端显示的简化类型
export interface SimpleInviteCode {
  id: number;
  categoryId: number;
  category: string;
  code: string;
  isUsed: boolean;
  createdAt: string;
}