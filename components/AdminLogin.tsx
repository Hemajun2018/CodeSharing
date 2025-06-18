"use client";

import { useState } from 'react';
import { X, Lock, Eye, EyeOff } from 'lucide-react';

interface AdminLoginProps {
  isOpen: boolean;
  onClose: () => void;
  onLogin: (success: boolean) => void;
  theme: 'light' | 'dark';
}

export default function AdminLogin({ isOpen, onClose, onLogin, theme }: AdminLoginProps) {
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // 简单的管理员密码（在实际项目中应该使用更安全的方式）
  const ADMIN_PASSWORD = 'admin123';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    // 模拟验证延迟
    await new Promise(resolve => setTimeout(resolve, 500));

    if (password === ADMIN_PASSWORD) {
      // 登录成功，保存到localStorage
      localStorage.setItem('isAdminLoggedIn', 'true');
      localStorage.setItem('adminLoginTime', Date.now().toString());
      onLogin(true);
      onClose();
      setPassword('');
    } else {
      setError('密码错误');
      onLogin(false);
    }
    
    setIsLoading(false);
  };

  const handleClose = () => {
    setPassword('');
    setError('');
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* 背景遮罩 */}
      <div 
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={handleClose}
      />
      
      {/* 登录模态框 */}
      <div className={`relative w-full max-w-md mx-4 p-6 rounded-2xl shadow-2xl ${
        theme === 'dark' 
          ? 'bg-gray-800 border border-gray-700' 
          : 'bg-white border border-gray-200'
      }`}>
        {/* 关闭按钮 */}
        <button
          onClick={handleClose}
          className={`absolute top-4 right-4 p-2 rounded-lg transition-colors ${
            theme === 'dark' 
              ? 'hover:bg-gray-700 text-gray-400 hover:text-white' 
              : 'hover:bg-gray-100 text-gray-500 hover:text-gray-700'
          }`}
        >
          <X className="w-5 h-5" />
        </button>

        {/* 标题 */}
        <div className="text-center mb-6">
          <div className={`inline-flex items-center justify-center w-12 h-12 rounded-full mb-4 ${
            theme === 'dark' ? 'bg-blue-900/20' : 'bg-blue-50'
          }`}>
            <Lock className="w-6 h-6 text-blue-500" />
          </div>
          <h2 className="text-2xl font-semibold mb-2">管理员登录</h2>
          <p className={`text-sm ${
            theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
          }`}>
            请输入管理员密码
          </p>
        </div>

        {/* 登录表单 */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className={`block text-sm font-medium mb-2 ${
              theme === 'dark' ? 'text-gray-300' : 'text-gray-700'
            }`}>
              密码
            </label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className={`w-full px-4 py-3 pr-12 rounded-lg border transition-colors ${
                  theme === 'dark'
                    ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400 focus:border-blue-500 focus:ring-blue-500/20'
                    : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500 focus:border-blue-500 focus:ring-blue-500/20'
                } focus:outline-none focus:ring-2`}
                placeholder="请输入管理员密码"
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className={`absolute right-3 top-1/2 -translate-y-1/2 p-1 rounded ${
                  theme === 'dark' 
                    ? 'text-gray-400 hover:text-white' 
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                {showPassword ? (
                  <EyeOff className="w-5 h-5" />
                ) : (
                  <Eye className="w-5 h-5" />
                )}
              </button>
            </div>
          </div>

          {/* 错误信息 */}
          {error && (
            <div className="p-3 rounded-lg bg-red-50 border border-red-200 text-red-600 text-sm">
              {error}
            </div>
          )}

          {/* 提示信息 */}
          <div className={`p-3 rounded-lg text-xs ${
            theme === 'dark' 
              ? 'bg-gray-700 text-gray-300' 
              : 'bg-gray-50 text-gray-600'
          }`}>
            💡 提示：默认密码是 <code className="font-mono bg-gray-200 dark:bg-gray-600 px-1 rounded">admin123</code>
          </div>

          {/* 登录按钮 */}
          <button
            type="submit"
            disabled={isLoading || !password}
            className={`w-full py-3 px-4 rounded-lg font-medium transition-all ${
              isLoading || !password
                ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                : 'bg-blue-500 hover:bg-blue-600 text-white shadow-lg shadow-blue-500/25 hover:shadow-blue-500/40'
            }`}
          >
            {isLoading ? (
              <div className="flex items-center justify-center">
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2" />
                验证中...
              </div>
            ) : (
              '登录'
            )}
          </button>
        </form>
      </div>
    </div>
  );
} 