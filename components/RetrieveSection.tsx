"use client";

import { useState } from 'react';
import { Copy, Check, Gift } from 'lucide-react';
import { SimpleInviteCode } from '@/types/InviteCode';

interface RetrieveSectionProps {
  categories: string[];
  inviteCodes: SimpleInviteCode[];
  onUseInviteCode: (id: number) => void;
  theme: 'light' | 'dark';
}

const categoryColors = [
  'bg-blue-500',
  'bg-green-500',
  'bg-purple-500',
  'bg-orange-500',
  'bg-red-500',
  'bg-teal-500',
  'bg-indigo-500',
  'bg-pink-500',
];

export default function RetrieveSection({ categories, inviteCodes, onUseInviteCode, theme }: RetrieveSectionProps) {
  const [copiedId, setCopiedId] = useState<number | null>(null);

  const getAvailableCodes = (category: string) => {
    return inviteCodes.filter(code => code.category === category && !code.isUsed);
  };

  const handleGetCode = async (category: string) => {
    const availableCodes = getAvailableCodes(category);
    if (availableCodes.length === 0) return;

    const codeToUse = availableCodes[0];
    
    try {
      await navigator.clipboard.writeText(codeToUse.code);
      setCopiedId(codeToUse.id);
      onUseInviteCode(codeToUse.id);
      
      setTimeout(() => setCopiedId(null), 2000);
    } catch (err) {
      console.error('复制失败:', err);
    }
  };

  return (
    <div className="space-y-6">
      {categories.length === 0 ? (
        <div className={`text-center py-12 rounded-2xl ${
          theme === 'dark' 
            ? 'bg-gray-800/50 border border-gray-700' 
            : 'bg-white/70 border border-gray-200'
        }`}>
          <Gift className={`w-12 h-12 mx-auto mb-4 ${
            theme === 'dark' ? 'text-gray-400' : 'text-gray-400'
          }`} />
          <p className={theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}>
            暂无可用分类
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-1 xl:grid-cols-2 2xl:grid-cols-3 gap-4 sm:gap-6">
          {categories.map((category, index) => {
            const availableCodes = getAvailableCodes(category);
            const colorClass = categoryColors[index % categoryColors.length];
            
            return (
              <div
                key={`category-${category}-${index}`}
                className={`rounded-2xl overflow-hidden transition-all duration-300 hover:scale-[1.02] ${
                  theme === 'dark' 
                    ? 'bg-gray-800/50 backdrop-blur-sm border border-gray-700 hover:border-gray-600' 
                    : 'bg-white/70 backdrop-blur-sm border border-gray-200 hover:border-gray-300 shadow-sm hover:shadow-md'
                }`}
              >
                {/* 色带 */}
                <div className={`h-1 ${colorClass}`} />
                
                <div className="p-4 sm:p-6">
                  <div className="flex items-center justify-between mb-3 sm:mb-4">
                    <h3 className="text-base sm:text-lg font-semibold">{category}</h3>
                    <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                      availableCodes.length > 0
                        ? theme === 'dark'
                          ? 'bg-green-900/50 text-green-300 border border-green-700'
                          : 'bg-green-100 text-green-700 border border-green-200'
                        : theme === 'dark'
                        ? 'bg-gray-700 text-gray-400 border border-gray-600'
                        : 'bg-gray-100 text-gray-500 border border-gray-200'
                    }`}>
                      剩余 {availableCodes.length}
                    </span>
                  </div>
                  
                  <button
                    onClick={() => handleGetCode(category)}
                    disabled={availableCodes.length === 0}
                    className={`w-full h-10 sm:h-11 rounded-xl font-medium transition-all duration-200 flex items-center justify-center space-x-2 ${
                      availableCodes.length > 0
                        ? theme === 'dark'
                          ? 'bg-blue-600 hover:bg-blue-700 text-white hover:scale-[0.98] active:scale-95'
                          : 'bg-blue-500 hover:bg-blue-600 text-white hover:scale-[0.98] active:scale-95'
                        : theme === 'dark'
                        ? 'bg-gray-700 text-gray-500 cursor-not-allowed'
                        : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                    }`}
                  >
                    {availableCodes.length > 0 && copiedId && availableCodes.some(code => code.id === copiedId) ? (
                      <>
                        <Check className="w-5 h-5" />
                        <span>已复制 ✓</span>
                      </>
                    ) : availableCodes.length > 0 ? (
                      <>
                        <Copy className="w-5 h-5" />
                        <span>获取邀请码</span>
                      </>
                    ) : (
                      <span>惊喜已被取光</span>
                    )}
                  </button>
                  

                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}