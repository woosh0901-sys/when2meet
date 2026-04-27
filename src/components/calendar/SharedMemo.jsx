import { useState, useEffect, useCallback } from 'react';
import { useSharedMemo } from '../../hooks/useSharedMemo';

// 디바운스 유틸
function useDebounce(value, delay) {
  const [debouncedValue, setDebouncedValue] = useState(value);
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);
    return () => { clearTimeout(handler); };
  }, [value, delay]);
  return debouncedValue;
}

export default function SharedMemo() {
  const { content, updateMemo, loading } = useSharedMemo();
  const [localContent, setLocalContent] = useState('');
  const [isEditing, setIsEditing] = useState(false);

  // DB에서 내려온 content와 동기화 (내가 편집 중이 아닐 때만)
  useEffect(() => {
    if (!isEditing) {
      setLocalContent(content);
    }
  }, [content, isEditing]);

  const debouncedContent = useDebounce(localContent, 1000);

  // 디바운스된 값이 변경될 때 DB 업데이트
  useEffect(() => {
    if (isEditing && debouncedContent !== content) {
      updateMemo(debouncedContent);
    }
  }, [debouncedContent, isEditing, content, updateMemo]);

  const handleChange = (e) => {
    setIsEditing(true);
    setLocalContent(e.target.value);
  };

  const handleBlur = () => {
    setIsEditing(false);
    // 포커스를 잃을 때 즉시 한 번 더 업데이트
    if (localContent !== content) {
      updateMemo(localContent);
    }
  };

  if (loading) {
    return <div className="h-24 bg-surface-800 animate-pulse rounded-xl"></div>;
  }

  return (
    <div className="glass-card flex flex-col p-3 rounded-xl gap-2 h-32 shrink-0">
      <div className="flex items-center gap-2 px-1">
        <svg className="w-4 h-4 text-brand-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
        </svg>
        <span className="text-sm font-bold text-white">공유 메모장</span>
        <span className="text-[10px] text-surface-400 ml-auto">실시간 동기화</span>
      </div>
      <textarea
        value={localContent}
        onChange={handleChange}
        onBlur={handleBlur}
        placeholder="모두가 볼 수 있는 메모를 남겨보세요..."
        className="w-full h-full flex-1 bg-transparent text-sm text-surface-300 resize-none focus:outline-none custom-scrollbar px-1"
      />
    </div>
  );
}
