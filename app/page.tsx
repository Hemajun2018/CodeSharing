"use client";

import { useState, useEffect } from 'react';
import { Moon, Sun, Shield, Menu, X } from 'lucide-react';
import UploadSection from '@/components/UploadSection';
import RetrieveSection from '@/components/RetrieveSection';
import AdminLogin from '@/components/AdminLogin';
import { useTheme } from '@/hooks/useTheme';
import { Category, InviteCode, SimpleInviteCode } from '@/types/InviteCode';
import { useRouter } from 'next/navigation';

export default function Home() {
  const { theme, toggleTheme } = useTheme();
  const router = useRouter();
  const [categories, setCategories] = useState<Category[]>([]);
  const [inviteCodes, setInviteCodes] = useState<SimpleInviteCode[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAdminLogin, setShowAdminLogin] = useState(false);
  const [isAdminLoggedIn, setIsAdminLoggedIn] = useState(false);
  const [showMobileMenu, setShowMobileMenu] = useState(false);

  // 检查管理员登录状态
  useEffect(() => {
    const checkAdminLogin = () => {
      const isLoggedIn = localStorage.getItem('isAdminLoggedIn');
      const loginTime = localStorage.getItem('adminLoginTime');
      const rememberDays = localStorage.getItem('adminRememberDays');
      
      if (isLoggedIn && loginTime) {
        const now = Date.now();
        const login = parseInt(loginTime);
        const days = rememberDays ? parseInt(rememberDays) : 1; // 默认1天（24小时）
        const hoursDiff = (now - login) / (1000 * 60 * 60);
        const maxHours = days * 24;
        
        if (hoursDiff < maxHours) {
          setIsAdminLoggedIn(true);
        } else {
          // 登录过期，清除状态
          localStorage.removeItem('isAdminLoggedIn');
          localStorage.removeItem('adminLoginTime');
          localStorage.removeItem('adminRememberDays');
          setIsAdminLoggedIn(false);
        }
      }
    };

    checkAdminLogin();
  }, []);

  // 加载数据
  useEffect(() => {
    loadData();
  }, []);

  // 点击外部关闭移动菜单
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Element;
      if (showMobileMenu && !target.closest('nav')) {
        setShowMobileMenu(false);
      }
    };

    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, [showMobileMenu]);

  const loadData = async () => {
    try {
      setLoading(true);
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
      } else {
        console.error('加载分类失败:', data.error);
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
        // 转换数据格式为前端需要的格式
        const simplifiedCodes = (data.inviteCodes || []).map((code: InviteCode) => ({
          id: code.id,
          categoryId: code.category_id,
          category: code.categories?.name || '未知分类',
          code: code.code,
          isUsed: code.is_used,
          createdAt: code.created_at,
        }));
        setInviteCodes(simplifiedCodes);
      } else {
        console.error('加载邀请码失败:', data.error);
      }
    } catch (error) {
      console.error('加载邀请码失败:', error);
    }
  };

  const handleAddCategory = async (newCategoryName: string) => {
    console.log('尝试添加分类:', newCategoryName);
    
    try {
      const response = await fetch('/api/categories', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ name: newCategoryName }),
      });

      const data = await response.json();

      if (response.ok) {
        console.log('分类添加成功:', data.category);
        // 重新加载分类列表
        await loadCategories();
        return true;
      } else {
        console.error('添加分类失败:', data.error);
        return false;
      }
    } catch (error) {
      console.error('添加分类失败:', error);
      return false;
    }
  };

  const handleAddInviteCode = async (categoryName: string, codes: string[]) => {
    console.log('尝试添加邀请码:', categoryName, codes);
    
    try {
      // 找到分类ID
      const category = categories.find(cat => cat.name === categoryName);
      if (!category) {
        console.error('分类不存在:', categoryName);
        return;
      }

      const response = await fetch('/api/invite-codes', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          categoryId: category.id, 
          codes: codes 
        }),
      });

      const data = await response.json();

      if (response.ok) {
        console.log('邀请码添加成功:', data.inviteCodes);
        // 重新加载邀请码列表
        await loadInviteCodes();
      } else {
        console.error('添加邀请码失败:', data.error);
      }
    } catch (error) {
      console.error('添加邀请码失败:', error);
    }
  };

  const handleUseInviteCode = async (id: number) => {
    console.log('尝试使用邀请码:', id);
    
    // 立即更新本地状态，提供即时反馈
    setInviteCodes(prevCodes => 
      prevCodes.map(code => 
        code.id === id 
          ? { ...code, isUsed: true }
          : code
      )
    );
    
    try {
      const response = await fetch(`/api/invite-codes/${id}/use`, {
        method: 'POST',
      });

      console.log('API响应状态:', response.status, response.statusText);
      const data = await response.json();

      if (response.ok) {
        console.log('邀请码使用成功:', data.inviteCode);
        // 后端成功，本地状态已经更新，无需重新加载
      } else {
        console.error('使用邀请码失败 - 状态:', response.status);
        console.error('使用邀请码失败 - 错误:', data.error);
        console.error('API URL:', `/api/invite-codes/${id}/use`);
        // 如果后端失败，回滚本地状态
        setInviteCodes(prevCodes => 
          prevCodes.map(code => 
            code.id === id 
              ? { ...code, isUsed: false }
              : code
          )
        );
      }
    } catch (error) {
      console.error('使用邀请码失败:', error);
      // 如果网络错误，回滚本地状态
      setInviteCodes(prevCodes => 
        prevCodes.map(code => 
          code.id === id 
            ? { ...code, isUsed: false }
            : code
        )
      );
    }
  };

  const handleAdminLogin = (success: boolean) => {
    if (success) {
      setIsAdminLoggedIn(true);
      // 可以选择直接跳转到管理页面
      setTimeout(() => {
        router.push('/admin');
      }, 1000);
    }
  };

  const handleAdminClick = () => {
    if (isAdminLoggedIn) {
      router.push('/admin');
    } else {
      setShowAdminLogin(true);
    }
  };

  const scrollToSection = (sectionId: string) => {
    const element = document.getElementById(sectionId);
    if (element) {
      const navHeight = 64; // 导航栏高度
      const elementPosition = element.offsetTop - navHeight;
      window.scrollTo({
        top: elementPosition,
        behavior: 'smooth'
      });
      setShowMobileMenu(false); // 关闭移动菜单
    }
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
      <nav className={`fixed top-0 left-0 right-0 z-50 h-14 sm:h-16 backdrop-blur-md transition-colors duration-300 ${
        theme === 'dark' 
          ? 'bg-gray-900/80 border-gray-800' 
          : 'bg-white/80 border-gray-200'
      } border-b`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-full flex items-center justify-between">
          <div className="flex items-center space-x-6 sm:space-x-8">
            <button 
              onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
              className="flex items-center space-x-3 hover:opacity-80 transition-opacity duration-200"
            >
              <img 
                src="/logo.png" 
                alt="CodeSharing Logo" 
                className="w-10 h-10 sm:w-16 sm:h-16"
              />
              <h1 className="text-lg sm:text-xl font-bold tracking-tight">CodeSharing</h1>
            </button>
            
            {/* 导航菜单 */}
            <nav className="hidden sm:flex items-center space-x-6">
              <button
                onClick={() => scrollToSection('retrieve')}
                className={`text-sm font-medium transition-colors duration-200 hover:opacity-80 ${
                  theme === 'dark' ? 'text-gray-300 hover:text-white' : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                获取邀请码
              </button>
              <button
                onClick={() => scrollToSection('share')}
                className={`text-sm font-medium transition-colors duration-200 hover:opacity-80 ${
                  theme === 'dark' ? 'text-gray-300 hover:text-white' : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                分享邀请码
              </button>
            </nav>
          </div>
          
          <div className="flex items-center space-x-2 sm:space-x-3">
            {/* 移动端菜单按钮 */}
            <button
              onClick={() => setShowMobileMenu(!showMobileMenu)}
              className={`sm:hidden p-1.5 rounded-lg transition-all duration-200 ${
                theme === 'dark' 
                  ? 'hover:bg-gray-800' 
                  : 'hover:bg-gray-100'
              }`}
              aria-label="切换菜单"
            >
              {showMobileMenu ? (
                <X className="w-5 h-5" />
              ) : (
                <Menu className="w-5 h-5" />
              )}
            </button>
            
            {/* 管理员按钮 */}
            <button
              onClick={handleAdminClick}
              className={`flex items-center space-x-1 sm:space-x-2 px-2 sm:px-3 py-1.5 sm:py-2 rounded-lg transition-all duration-200 ${
                isAdminLoggedIn
                  ? theme === 'dark'
                    ? 'bg-blue-600 hover:bg-blue-700 text-white'
                    : 'bg-blue-500 hover:bg-blue-600 text-white'
                  : theme === 'dark' 
                    ? 'hover:bg-gray-800 text-gray-300' 
                    : 'hover:bg-gray-100 text-gray-600'
              }`}
              title={isAdminLoggedIn ? '进入管理后台' : '管理员登录'}
            >
              <Shield className="w-3 h-3 sm:w-4 sm:h-4" />
              <span className="text-xs sm:text-sm hidden xs:inline">
                {isAdminLoggedIn ? '管理后台' : '管理员'}
              </span>
            </button>
            
            {/* 主题切换按钮 */}
            <button
              onClick={toggleTheme}
              className={`p-1.5 sm:p-2 rounded-lg transition-all duration-200 hover:scale-110 ${
                theme === 'dark' 
                  ? 'hover:bg-gray-800' 
                  : 'hover:bg-gray-100'
              }`}
              aria-label="切换主题"
            >
              {theme === 'dark' ? (
                <Sun className="w-4 h-4 sm:w-5 sm:h-5 text-yellow-500" />
              ) : (
                <Moon className="w-4 h-4 sm:w-5 sm:h-5 text-gray-600" />
              )}
            </button>
          </div>
        </div>
        
        {/* 移动端导航菜单 */}
        {showMobileMenu && (
          <div className={`sm:hidden absolute top-full left-0 right-0 transition-all duration-300 border-b ${
            theme === 'dark' 
              ? 'bg-gray-900/95 border-gray-800' 
              : 'bg-white/95 border-gray-200'
          } backdrop-blur-md`}>
            <div className="max-w-7xl mx-auto px-4 py-4 space-y-2">
              <button
                onClick={() => scrollToSection('retrieve')}
                className={`w-full text-left py-3 px-2 rounded-lg transition-colors duration-200 ${
                  theme === 'dark' 
                    ? 'text-gray-300 hover:text-white hover:bg-gray-800' 
                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                }`}
              >
                获取邀请码
              </button>
              <button
                onClick={() => scrollToSection('share')}
                className={`w-full text-left py-3 px-2 rounded-lg transition-colors duration-200 ${
                  theme === 'dark' 
                    ? 'text-gray-300 hover:text-white hover:bg-gray-800' 
                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                }`}
              >
                分享邀请码
              </button>
            </div>
          </div>
        )}
      </nav>

      {/* 主内容区 */}
      <main className="pt-20 sm:pt-24 pb-8 sm:pb-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          {/* 移动端优先布局：获取邀请码在前，分享邀请码在后 */}
          <div className="flex flex-col lg:grid lg:grid-cols-2 gap-8 sm:gap-12 lg:gap-16">
            {/* 获取邀请码区域 - 移动端显示在前面 */}
            <div id="retrieve" className="space-y-6 sm:space-y-8 order-1 lg:order-2">
              <div className="text-center lg:text-left">
                <h2 className="text-2xl sm:text-3xl font-semibold mb-2">获取邀请码</h2>
                <p className={`text-base sm:text-lg ${
                  theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
                }`}>
                  选择分类，获取可用的邀请码
                </p>
              </div>
              <RetrieveSection
                categories={categories.map(cat => cat.name)}
                inviteCodes={inviteCodes}
                onUseInviteCode={handleUseInviteCode}
                theme={theme}
              />
            </div>

            {/* 分享邀请码区域 - 移动端显示在后面 */}
            <div id="share" className="space-y-6 sm:space-y-8 order-2 lg:order-1">
              <div className="text-center lg:text-left">
                <h2 className="text-2xl sm:text-3xl font-semibold mb-2">分享邀请码</h2>
                <p className={`text-base sm:text-lg ${
                  theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
                }`}>
                  选择分类，添加您的邀请码
                </p>
              </div>
              <UploadSection
                categories={categories.map(cat => cat.name)}
                onAddInviteCode={handleAddInviteCode}
                onAddCategory={handleAddCategory}
                theme={theme}
              />
            </div>
          </div>
        </div>
      </main>

      {/* 管理员登录模态框 */}
      <AdminLogin
        isOpen={showAdminLogin}
        onClose={() => setShowAdminLogin(false)}
        onLogin={handleAdminLogin}
        theme={theme}
      />
    </div>
  );
}