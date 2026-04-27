import { useState, useEffect, useCallback, useRef } from 'react';
import { supabase } from '../lib/supabase';

export function useSharedMemo() {
  const [content, setContent] = useState('');
  const [loading, setLoading] = useState(true);
  const channelRef = useRef(null);

  const fetchMemo = useCallback(async () => {
    const { data, error } = await supabase
      .from('shared_memo')
      .select('content')
      .eq('id', 1)
      .single();
    
    if (error && error.code !== 'PGRST116') {
      console.error('fetchMemo error:', error);
    } else if (data) {
      setContent(data.content || '');
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchMemo();

    const channel = supabase
      .channel('shared_memo_realtime')
      .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'shared_memo', filter: 'id=eq.1' }, (payload) => {
        setContent(payload.new.content || '');
      })
      .subscribe();

    channelRef.current = channel;
    return () => { supabase.removeChannel(channel); };
  }, [fetchMemo]);

  const updateMemo = useCallback(async (newContent) => {
    // 로컬 상태 즉시 업데이트 (Optimistic UI)
    setContent(newContent);
    const { error } = await supabase
      .from('shared_memo')
      .update({ content: newContent, updated_at: new Date().toISOString() })
      .eq('id', 1);
    
    if (error) {
      console.error('updateMemo error:', error);
      // 에러 발생 시 원래 상태로 복구 위해 다시 fetch (선택적)
    }
  }, []);

  return { content, updateMemo, loading };
}
