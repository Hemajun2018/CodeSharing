"use client";

import { useState } from 'react';
import { ChevronDown, Check, AlertCircle, Plus, Sparkles } from 'lucide-react';

interface UploadSectionProps {
  categories: string[];
  onAddInviteCode: (category: string, codes: string[]) => void;
  onAddCategory: (newCategory: string) => Promise<boolean>;
  theme: 'light' | 'dark';
}

type UploadStatus = 'idle' | 'extracting' | 'extracted' | 'uploading' | 'success' | 'error';

export default function UploadSection({ categories, onAddInviteCode, onAddCategory, theme }: UploadSectionProps) {
  const [selectedCategory, setSelectedCategory] = useState('');
  const [inviteCodes, setInviteCodes] = useState('');
  const [extractedCodes, setExtractedCodes] = useState('');
  const [sharedCodesCount, setSharedCodesCount] = useState(0);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [uploadStatus, setUploadStatus] = useState<UploadStatus>('idle');
  const [showAddCategory, setShowAddCategory] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState('');
  const [addCategoryError, setAddCategoryError] = useState('');
  const [isAddingCategory, setIsAddingCategory] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCategory || !inviteCodes.trim()) return;

    try {
      // 第一步：AI提取邀请码
      setUploadStatus('extracting');
      
      const extractResponse = await fetch('/api/extract-codes', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ text: inviteCodes }),
      });

      const extractData = await extractResponse.json();

      if (!extractResponse.ok) {
        throw new Error(extractData.error || 'AI提取失败');
      }

      // 显示提取结果让用户确认
      setExtractedCodes(extractData.extractedCodes);
      setUploadStatus('extracted');

    } catch (error) {
      console.error('AI提取失败:', error);
      setUploadStatus('error');
      setTimeout(() => setUploadStatus('idle'), 3000);
    }
  };

  const handleConfirmExtracted = async () => {
    setUploadStatus('uploading');

    try {
      const codes = extractedCodes
        .split('\n')
        .map(code => code.trim())
        .filter(code => code.length > 0);

      if (codes.length === 0) {
        throw new Error('没有找到有效的邀请码');
      }

      // 保存分享的邀请码数量
      setSharedCodesCount(codes.length);
      
      onAddInviteCode(selectedCategory, codes);
      setUploadStatus('success');
      
      // 重置表单
      setTimeout(() => {
        setSelectedCategory('');
        setInviteCodes('');
        setExtractedCodes('');
        setSharedCodesCount(0);
        setUploadStatus('idle');
      }, 3000);

    } catch (error) {
      setUploadStatus('error');
      setTimeout(() => setUploadStatus('idle'), 2000);
    }
  };

  const handleReEdit = () => {
    setUploadStatus('idle');
    setExtractedCodes('');
  };

  const handleAddCategory = async () => {
    // 防止重复提交
    if (isAddingCategory) {
      console.log('UploadSection: 正在添加分类中，忽略重复请求');
      return;
    }

    console.log('UploadSection: 开始添加分类，输入值:', newCategoryName);
    console.log('UploadSection: 当前分类列表:', categories);
    
    if (!newCategoryName.trim()) {
      console.log('UploadSection: 分类名称为空');
      setAddCategoryError('分类名称不能为空');
      return;
    }

    if (categories.includes(newCategoryName.trim())) {
      console.log('UploadSection: 分类已存在');
      setAddCategoryError('分类已存在');
      return;
    }

    setIsAddingCategory(true);
    console.log('UploadSection: 调用 onAddCategory');
    
    try {
      const success = await onAddCategory(newCategoryName.trim());
      console.log('UploadSection: onAddCategory 返回结果:', success);
      
      if (success) {
        setSelectedCategory(newCategoryName.trim());
        setNewCategoryName('');
        setShowAddCategory(false);
        setAddCategoryError('');
        setIsDropdownOpen(false);
        console.log('UploadSection: 分类添加成功，UI已更新');
      } else {
        console.log('UploadSection: 分类添加失败');
        setAddCategoryError('添加分类失败');
      }
    } finally {
      setIsAddingCategory(false);
    }
  };



  return (
    <div className={`rounded-2xl p-8 transition-all duration-300 ${
      theme === 'dark' 
        ? 'bg-gray-800/50 backdrop-blur-sm border border-gray-700' 
        : 'bg-white/70 backdrop-blur-sm border border-gray-200 shadow-sm'
    }`}>
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* 分类选择 */}
        <div className="relative">
          <label className={`block text-sm font-medium mb-3 ${
            theme === 'dark' ? 'text-gray-300' : 'text-gray-700'
          }`}>
            选择平台
          </label>
          <div className="relative">
            <button
              type="button"
              onClick={() => setIsDropdownOpen(!isDropdownOpen)}
              className={`w-full p-4 text-left rounded-xl transition-all duration-200 flex items-center justify-between ${
                theme === 'dark'
                  ? 'bg-gray-700 border border-gray-600 hover:border-gray-500 text-white'
                  : 'bg-gray-50 border border-gray-200 hover:border-blue-300 focus:border-blue-500'
              } ${selectedCategory ? 'text-gray-900 dark:text-white' : 'text-gray-500'}`}
            >
              <span>{selectedCategory || '选择邀请码分类'}</span>
              <ChevronDown className={`w-5 h-5 transition-transform duration-200 ${
                isDropdownOpen ? 'rotate-180' : ''
              }`} />
            </button>
            
            {isDropdownOpen && (
              <div className={`absolute top-full left-0 right-0 mt-2 rounded-xl overflow-hidden z-10 transition-all duration-200 ${
                theme === 'dark' 
                  ? 'bg-gray-700 border border-gray-600 shadow-2xl' 
                  : 'bg-white border border-gray-200 shadow-lg'
              }`}>
                {categories.map((category, index) => (
                  <button
                    key={category}
                    type="button"
                    onClick={() => {
                      setSelectedCategory(category);
                      setIsDropdownOpen(false);
                    }}
                    className={`w-full p-4 text-left transition-all duration-150 ${
                      theme === 'dark'
                        ? 'hover:bg-gray-600 text-white'
                        : 'hover:bg-blue-50 text-gray-900'
                    } ${index < categories.length ? 'border-b border-gray-200 dark:border-gray-600' : ''}`}
                  >
                    {category}
                  </button>
                ))}
                
                {/* 添加新分类按钮 */}
                <button
                  type="button"
                  onClick={() => {
                    setShowAddCategory(true);
                    setIsDropdownOpen(false);
                  }}
                  className={`w-full p-4 text-left transition-all duration-150 flex items-center space-x-2 ${
                    theme === 'dark'
                      ? 'hover:bg-gray-600 text-blue-400 border-t border-gray-600'
                      : 'hover:bg-blue-50 text-blue-600 border-t border-gray-200'
                  }`}
                >
                  <Plus className="w-4 h-4" />
                  <span>添加新分类</span>
                </button>
              </div>
            )}
          </div>
        </div>

        {/* 添加分类表单 */}
        {showAddCategory && (
          <div className={`p-4 rounded-xl border-2 border-dashed ${
            theme === 'dark' 
              ? 'border-gray-600 bg-gray-700/50' 
              : 'border-gray-300 bg-gray-50'
          }`}>
            <div className="space-y-3">
              <label className={`block text-sm font-medium ${
                theme === 'dark' ? 'text-gray-300' : 'text-gray-700'
              }`}>
                新分类名称
              </label>
              <input
                type="text"
                value={newCategoryName}
                onChange={(e) => {
                  setNewCategoryName(e.target.value);
                  setAddCategoryError('');
                }}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    handleAddCategory();
                  }
                }}
                placeholder="输入新分类名称..."
                className={`w-full p-3 rounded-lg transition-all duration-200 ${
                  theme === 'dark'
                    ? 'bg-gray-600 border border-gray-500 focus:border-blue-500 text-white placeholder-gray-400'
                    : 'bg-white border border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 placeholder-gray-500'
                } focus:outline-none`}
              />
              {addCategoryError && (
                <p className="text-red-500 text-sm">{addCategoryError}</p>
              )}
              <div className="flex space-x-2">
                <button
                  type="button"
                  onClick={handleAddCategory}
                  disabled={isAddingCategory}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                    isAddingCategory
                      ? 'bg-gray-400 cursor-not-allowed text-gray-200'
                      : theme === 'dark'
                      ? 'bg-blue-600 hover:bg-blue-700 text-white'
                      : 'bg-blue-500 hover:bg-blue-600 text-white'
                  }`}
                >
                  {isAddingCategory ? '添加中...' : '添加'}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowAddCategory(false);
                    setNewCategoryName('');
                    setAddCategoryError('');
                  }}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                    theme === 'dark'
                      ? 'bg-gray-600 hover:bg-gray-500 text-white'
                      : 'bg-gray-200 hover:bg-gray-300 text-gray-700'
                  }`}
                >
                  取消
                </button>
              </div>
            </div>
          </div>
        )}

        {/* 邀请码输入 */}
        <div>
          <label className={`block text-sm font-medium mb-3 ${
            theme === 'dark' ? 'text-gray-300' : 'text-gray-700'
          }`}>
            邀请码内容
          </label>
          
          {uploadStatus === 'extracted' ? (
            // 显示AI提取结果
            <div className="space-y-4">
              <div className={`p-4 rounded-xl border-2 ${
                theme === 'dark' 
                  ? 'bg-green-900/20 border-green-700' 
                  : 'bg-green-50 border-green-200'
              }`}>
                                 <div className="flex items-center space-x-2 mb-3">
                   <Sparkles className={`w-4 h-4 ${
                     theme === 'dark' ? 'text-green-400' : 'text-green-600'
                   }`} />
                   <span className={`text-sm font-medium ${
                     theme === 'dark' ? 'text-green-400' : 'text-green-600'
                   }`}>
                     AI已提取以下 {extractedCodes.split('\n').filter(code => code.trim().length > 0).length} 个邀请码：
                   </span>
                 </div>
                                 <div className={`p-3 rounded-lg font-mono text-sm ${
                   theme === 'dark'
                     ? 'bg-gray-800 text-gray-300 border border-gray-600'
                     : 'bg-white text-gray-700 border border-gray-200'
                 }`}>
                   {extractedCodes.split('\n').map((code, index) => (
                     <div key={index} className="py-0.5">
                       {code.trim()}
                     </div>
                   ))}
                 </div>
              </div>
              
              <div className="flex space-x-3">
                <button
                  type="button"
                  onClick={handleConfirmExtracted}
                  className={`flex-1 h-11 rounded-xl font-medium transition-all duration-200 flex items-center justify-center space-x-2 ${
                    theme === 'dark'
                      ? 'bg-green-600 hover:bg-green-700 text-white'
                      : 'bg-green-500 hover:bg-green-600 text-white'
                  }`}
                >
                  <Check className="w-5 h-5" />
                  <span>确认分享</span>
                </button>
                
                <button
                  type="button"
                  onClick={handleReEdit}
                  className={`px-6 h-11 rounded-xl font-medium transition-all duration-200 ${
                    theme === 'dark'
                      ? 'bg-gray-600 hover:bg-gray-500 text-white'
                      : 'bg-gray-200 hover:bg-gray-300 text-gray-700'
                  }`}
                >
                  重新编辑
                </button>
              </div>
            </div>
          ) : (
            // 正常输入状态
            <textarea
              value={inviteCodes}
              onChange={(e) => setInviteCodes(e.target.value)}
              rows={6}
              placeholder="请输入邀请码内容，可以是规范的邀请码（每行一个），也可以直接粘贴包含邀请码的文本，AI会自动提取..."
              className={`w-full p-4 rounded-xl resize-none transition-all duration-200 ${
                theme === 'dark'
                  ? 'bg-gray-700 border border-gray-600 focus:border-blue-500 text-white placeholder-gray-400'
                  : 'bg-gray-50 border border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 placeholder-gray-500'
              } focus:outline-none`}
            />
          )}
        </div>

        {/* 提交按钮 */}
        {uploadStatus !== 'extracted' && (
          <button
            type="submit"
            disabled={!selectedCategory || !inviteCodes.trim() || uploadStatus === 'extracting' || uploadStatus === 'uploading'}
            className={`w-full h-11 rounded-xl font-medium transition-all duration-200 flex items-center justify-center space-x-2 ${
              uploadStatus === 'success'
                ? 'bg-green-500 text-white'
                : uploadStatus === 'error'
                ? 'bg-red-500 text-white animate-pulse'
                : uploadStatus === 'extracting'
                ? 'bg-purple-500 text-white cursor-not-allowed'
                : uploadStatus === 'uploading'
                ? 'bg-blue-500 text-white cursor-not-allowed'
                : selectedCategory && inviteCodes.trim()
                ? 'bg-blue-500 hover:bg-blue-600 text-white hover:scale-[0.98] active:scale-95'
                : theme === 'dark'
                ? 'bg-gray-700 text-gray-500 cursor-not-allowed'
                : 'bg-gray-200 text-gray-400 cursor-not-allowed'
            }`}
          >
            {uploadStatus === 'extracting' && (
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
            )}
            {uploadStatus === 'uploading' && (
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
            )}
            {uploadStatus === 'success' && <Check className="w-5 h-5" />}
            {uploadStatus === 'error' && <AlertCircle className="w-5 h-5" />}
            {uploadStatus === 'idle' && <Sparkles className="w-5 h-5" />}
            
                          <span>
                {uploadStatus === 'extracting' && '🤖 正在提取邀请码...'}
                {uploadStatus === 'uploading' && '📤 正在分享...'}
                {uploadStatus === 'success' && `🎉 分享成功！感谢您分享 ${sharedCodesCount} 个邀请码`}
                {uploadStatus === 'error' && '❌ 分享失败'}
                {uploadStatus === 'idle' && ' 分享邀请码'}
              </span>
          </button>
        )}
      </form>
    </div>
  );
}