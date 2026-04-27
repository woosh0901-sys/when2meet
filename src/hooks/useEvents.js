import { useState, useEffect, useCallback, useRef } from 'react';
import { supabase } from '../lib/supabase';

/**
 * 이벤트 CRUD + Supabase Realtime 구독
 * viewStart/viewEnd: 현재 캘린더 뷰 범위 (ISO string)
 */
export function useEvents(viewStart, viewEnd) {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const channelRef = useRef(null);

  // 범위 내 이벤트 전체 조회
  const fetchEvents = useCallback(async () => {
    if (!viewStart || !viewEnd) return;
    setLoading(true);
    const { data, error } = await supabase
      .from('events')
      .select('id, user_id, title, memo, start_at, end_at, is_allday, is_meeting')
      .gte('start_at', viewStart)
      .lte('end_at', viewEnd)
      .order('start_at');
    if (error) console.error('fetchEvents error:', error);
    setEvents(data || []);
    setLoading(false);
  }, [viewStart, viewEnd]);

  // Realtime 구독
  useEffect(() => {
    fetchEvents();

    const channel = supabase
      .channel('events_realtime')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'events' }, () => {
        // 변경 감지 시 전체 재조회 (단순하고 신뢰성 높음)
        fetchEvents();
      })
      .subscribe();

    channelRef.current = channel;
    return () => { supabase.removeChannel(channel); };
  }, [fetchEvents]);

  // 생성
  const createEvent = useCallback(async (payload) => {
    const { error } = await supabase.from('events').insert(payload);
    if (error) { console.error('createEvent error:', error); return false; }
    return true;
  }, []);

  // 수정
  const updateEvent = useCallback(async (id, payload) => {
    const { error } = await supabase.from('events').update(payload).eq('id', id);
    if (error) { console.error('updateEvent error:', error); return false; }
    return true;
  }, []);

  // 삭제
  const deleteEvent = useCallback(async (id) => {
    const { error } = await supabase.from('events').delete().eq('id', id);
    if (error) { console.error('deleteEvent error:', error); return false; }
    return true;
  }, []);

  // 다중 일정 생성 (주간 반복용)
  const createMultipleEvents = useCallback(async (payloads) => {
    const { error } = await supabase.from('events').insert(payloads);
    if (error) { console.error('createMultipleEvents error:', error); return false; }
    return true;
  }, []);

  return { events, loading, createEvent, updateEvent, deleteEvent, createMultipleEvents, refetch: fetchEvents };
}
