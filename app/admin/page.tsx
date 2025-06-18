"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Trash2, LogOut, Shield, RefreshCw, AlertTriangle } from 'lucide-react';
import { useTheme } from '@/hooks/useTheme';
import { Category, InviteCode } from '@/types/InviteCode';
import { supabase } from '@/lib/supabase';

export default function AdminPage() {
  const { theme } = useTheme();
  const router = useRouter();
  const [categories, setCategories] = useState<Category[]>([]);
  const [inviteCodes, setInviteCodes] = useState<InviteCode[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState<{ type: string; id: number } | null>(null);
  const [autoRefresh, setAutoRefresh] = useState(true);

  // 检查管理员登录状态
  useEffect(() => {
    const checkAdmin = () => {
      const isLoggedIn = localStorage.getItem('isAdminLoggedIn');
      const loginTime = localStorage.getItem('adminLoginTime');
      const rememberDays = localStorage.getItem('adminRememberDays');
      
      if (!isLoggedIn || !loginTime) {
        router.push('/');
        return;
      }

      // 检查登录是否过期（根据记住密码设置）
      const now = Date.now();
      const login = parseInt(loginTime);
      const days = rememberDays ? parseInt(rememberDays) : 1; // 默认1天（24小时）
      const hoursDiff = (now - login) / (1000 * 60 * 60);
      const maxHours = days * 24;
      
      if (hoursDiff > maxHours) {
        handleLogout();
        return;
      }
    };

    checkAdmin();
    loadData();
  }, [router]);

  // 实时数据订阅
  useEffect(() => {
    if (!autoRefresh) return;

    console.log('🔗 建立实时数据订阅...');

    // 订阅邀请码表的实时变化
    const inviteCodesSubscription = supabase
      .channel('invite_codes_changes')
      .on('postgres_changes', 
        { 
          event: '*', 
          schema: 'public', 
          table: 'invite_codes' 
        }, 
                 (payload: any) => {
           console.log('📧 收到邀请码变化:', payload);
           // 实时更新邀请码数据
           loadInviteCodes();
         }
      )
      .subscribe();

    // 订阅分类表的实时变化
    const categoriesSubscription = supabase
      .channel('categories_changes')
      .on('postgres_changes', 
        { 
          event: '*', 
          schema: 'public', 
          table: 'categories' 
        }, 
                 (payload: any) => {
           console.log('📂 收到分类变化:', payload);
           // 实时更新分类数据
           loadCategories();
         }
      )
      .subscribe();

    // 清理订阅
    return () => {
      console.log('🔌 断开实时数据订阅');
      supabase.removeChannel(inviteCodesSubscription);
      supabase.removeChannel(categoriesSubscription);
    };
  }, [autoRefresh]);

  // 当用户回到标签页时刷新数据（作为实时订阅的备用方案）
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (!document.hidden && autoRefresh) {
        loadData();
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
  }, [autoRefresh]);

  const loadData = async () => {
    setLoading(true);
    try {
      await Promise.all([loadCategories(), loadInviteCodes()]);
    } catch (error) {
      console.error('加载数据失败:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadCategories = async () => {
    try {
      const response = await fetch('/api/categories');
      const data = await response.json();
      if (response.ok) {
        setCategories(data.categories || []);
      }
    } catch (error) {
      console.error('加载分类失败:', error);
    }
  };

  const loadInviteCodes = async () => {
    try {
      const response = await fetch('/api/invite-codes');
      const data = await response.json();
      if (response.ok) {
        setInviteCodes(data.inviteCodes || []);
      }
    } catch (error) {
      console.error('加载邀请码失败:', error);
    }
  };

  const handleDeleteCategory = async (categoryId: number, categoryName: string) => {
    if (!confirm(`确定要删除分类 "${categoryName}" 吗？这将同时删除该分类下的所有邀请码！`)) {
      return;
    }

    setDeleting({ type: 'category', id: categoryId });
    try {
      const response = await fetch(`/api/categories/${categoryId}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        await loadData(); // 重新加载数据
        alert('分类删除成功！');
      } else {
        const data = await response.json();
        alert(`删除失败: ${data.error}`);
      }
    } catch (error) {
      console.error('删除分类失败:', error);
      alert('删除失败');
    } finally {
      setDeleting(null);
    }
  };

  const handleDeleteInviteCode = async (codeId: number, code: string) => {
    if (!confirm(`确定要删除邀请码 "${code}" 吗？`)) {
      return;
    }

    setDeleting({ type: 'code', id: codeId });
    try {
      const response = await fetch(`/api/invite-codes/${codeId}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        await loadInviteCodes(); // 重新加载邀请码
        alert('邀请码删除成功！');
      } else {
        const data = await response.json();
        alert(`删除失败: ${data.error}`);
      }
    } catch (error) {
      console.error('删除邀请码失败:', error);
      alert('删除失败');
    } finally {
      setDeleting(null);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('isAdminLoggedIn');
    localStorage.removeItem('adminLoginTime');
    localStorage.removeItem('adminRememberDays');
    router.push('/');
  };

  const getCategoryInviteCount = (categoryId: number) => {
    return inviteCodes.filter(code => code.category_id === categoryId).length;
  };

  const getUsedInviteCount = (categoryId: number) => {
    return inviteCodes.filter(code => code.category_id === categoryId && code.is_used).length;
  };

  if (loading) {
    return (
      <div className={`min-h-screen flex items-center justify-center ${
        theme === 'dark' ? 'bg-gray-900 text-white' : 'bg-gray-50 text-gray-900'
      }`}>
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-500 mb-4"></div>
          <p className="text-lg">加载中...</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen transition-colors duration-300 ${
      theme === 'dark' 
        ? 'bg-gray-900 text-white' 
        : 'bg-gray-50 text-gray-900'
    }`}>
      {/* 导航栏 */}
      <nav className={`fixed top-0 left-0 right-0 z-50 h-14 backdrop-blur-md transition-colors duration-300 ${
        theme === 'dark' 
          ? 'bg-gray-900/80 border-gray-800' 
          : 'bg-white/80 border-gray-200'
      } border-b`}>
        <div className="max-w-7xl mx-auto px-6 h-full flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <Shield className="w-5 h-5 text-blue-500" />
            <h1 className="text-xl font-light tracking-tight">管理员后台</h1>
          </div>
          <div className="flex items-center space-x-4">
            <button
              onClick={() => setAutoRefresh(!autoRefresh)}
              className={`p-2 rounded-lg transition-all duration-200 hover:scale-110 ${
                autoRefresh
                  ? theme === 'dark' 
                    ? 'bg-green-600/20 text-green-400 hover:bg-green-600/30' 
                    : 'bg-green-100 text-green-600 hover:bg-green-200'
                  : theme === 'dark' 
                    ? 'hover:bg-gray-800 text-gray-400' 
                    : 'hover:bg-gray-100 text-gray-500'
              }`}
              title={autoRefresh ? "关闭实时同步" : "开启实时同步"}
            >
              <RefreshCw className={`w-5 h-5 ${autoRefresh ? 'animate-spin' : ''}`} />
            </button>
            <button
              onClick={loadData}
              className={`p-2 rounded-lg transition-all duration-200 hover:scale-110 ${
                theme === 'dark' 
                  ? 'hover:bg-gray-800' 
                  : 'hover:bg-gray-100'
              }`}
              title="立即刷新数据"
            >
              <RefreshCw className="w-5 h-5" />
            </button>
            <button
              onClick={handleLogout}
              className={`flex items-center space-x-2 px-3 py-2 rounded-lg transition-colors ${
                theme === 'dark' 
                  ? 'hover:bg-gray-800 text-red-400' 
                  : 'hover:bg-gray-100 text-red-600'
              }`}
            >
              <LogOut className="w-4 h-4" />
              <span className="text-sm">登出</span>
            </button>
          </div>
        </div>
      </nav>

      {/* 主内容 */}
      <main className="pt-20 pb-12">
        <div className="max-w-7xl mx-auto px-6">
          {/* 统计信息 */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div className={`p-6 rounded-2xl ${
              theme === 'dark' ? 'bg-gray-800' : 'bg-white'
            } shadow-lg`}>
              <h3 className="text-lg font-semibold mb-2">总分类数</h3>
              <p className="text-3xl font-bold text-blue-500">{categories.length}</p>
            </div>
            <div className={`p-6 rounded-2xl ${
              theme === 'dark' ? 'bg-gray-800' : 'bg-white'
            } shadow-lg`}>
              <h3 className="text-lg font-semibold mb-2">总邀请码数</h3>
              <p className="text-3xl font-bold text-green-500">{inviteCodes.length}</p>
            </div>
            <div className={`p-6 rounded-2xl ${
              theme === 'dark' ? 'bg-gray-800' : 'bg-white'
            } shadow-lg`}>
              <h3 className="text-lg font-semibold mb-2">已使用</h3>
              <p className="text-3xl font-bold text-orange-500">
                {inviteCodes.filter(code => code.is_used).length}
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* 分类管理 */}
            <div className={`p-6 rounded-2xl ${
              theme === 'dark' ? 'bg-gray-800' : 'bg-white'
            } shadow-lg`}>
              <h2 className="text-xl font-semibold mb-4 flex items-center">
                <AlertTriangle className="w-5 h-5 mr-2 text-orange-500" />
                分类管理
              </h2>
              <div className="space-y-3">
                {categories.map((category) => {
                  const inviteCount = getCategoryInviteCount(category.id);
                  const usedCount = getUsedInviteCount(category.id);
                  const isDeleting = deleting?.type === 'category' && deleting.id === category.id;
                  
                  return (
                    <div key={category.id} className={`p-4 rounded-lg border ${
                      theme === 'dark' 
                        ? 'bg-gray-700 border-gray-600' 
                        : 'bg-gray-50 border-gray-200'
                    }`}>
                      <div className="flex items-center justify-between">
                        <div>
                          <h3 className="font-medium">{category.name}</h3>
                          <p className={`text-sm ${
                            theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
                          }`}>
                            邀请码: {inviteCount} 个 | 已使用: {usedCount} 个
                          </p>
                        </div>
                        <button
                          onClick={() => handleDeleteCategory(category.id, category.name)}
                          disabled={isDeleting}
                          className={`p-2 rounded-lg transition-colors ${
                            isDeleting
                              ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                              : 'bg-red-100 hover:bg-red-200 text-red-600'
                          }`}
                          title="删除分类"
                        >
                          {isDeleting ? (
                            <div className="w-4 h-4 border-2 border-gray-400 border-t-transparent rounded-full animate-spin" />
                          ) : (
                            <Trash2 className="w-4 h-4" />
                          )}
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* 邀请码管理 */}
            <div className={`p-6 rounded-2xl ${
              theme === 'dark' ? 'bg-gray-800' : 'bg-white'
            } shadow-lg`}>
              <h2 className="text-xl font-semibold mb-4 flex items-center">
                <AlertTriangle className="w-5 h-5 mr-2 text-orange-500" />
                邀请码管理
              </h2>
              <div className="space-y-3 max-h-96 overflow-y-auto">
                {inviteCodes.map((code) => {
                  const category = categories.find(cat => cat.id === code.category_id);
                  const isDeleting = deleting?.type === 'code' && deleting.id === code.id;
                  
                  return (
                    <div key={code.id} className={`p-4 rounded-lg border ${
                      theme === 'dark' 
                        ? 'bg-gray-700 border-gray-600' 
                        : 'bg-gray-50 border-gray-200'
                    }`}>
                      <div className="flex items-center justify-between">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center space-x-2">
                            <span className={`px-2 py-1 text-xs rounded-full ${
                              code.is_used 
                                ? 'bg-red-100 text-red-600' 
                                : 'bg-green-100 text-green-600'
                            }`}>
                              {code.is_used ? '已使用' : '可用'}
                            </span>
                            <span className={`text-xs px-2 py-1 rounded ${
                              theme === 'dark' ? 'bg-gray-600' : 'bg-gray-200'
                            }`}>
                              {category?.name || '未知分类'}
                            </span>
                          </div>
                          <p className="font-mono text-sm mt-1 truncate">{code.code}</p>
                          <p className={`text-xs ${
                            theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
                          }`}>
                            {new Date(code.created_at).toLocaleString()}
                          </p>
                        </div>
                        <button
                          onClick={() => handleDeleteInviteCode(code.id, code.code)}
                          disabled={isDeleting}
                          className={`p-2 rounded-lg transition-colors ml-2 ${
                            isDeleting
                              ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                              : 'bg-red-100 hover:bg-red-200 text-red-600'
                          }`}
                          title="删除邀请码"
                        >
                          {isDeleting ? (
                            <div className="w-4 h-4 border-2 border-gray-400 border-t-transparent rounded-full animate-spin" />
                          ) : (
                            <Trash2 className="w-4 h-4" />
                          )}
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
} 