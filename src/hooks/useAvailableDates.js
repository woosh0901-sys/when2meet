import { useState, useEffect, useCallback, useRef } from 'react';
import { supabase } from '../lib/supabase';
import { formatDateKey } from '../lib/dateUtils';

const TOTAL_USERS = 5;

/**
 * Supabase에서 모든 사용자의 선택 날짜를 가져오고,
 * Realtime으로 변경사항을 구독하는 핵심 훅.
 * 
 * 반환값:
 * - allDates: { [userId]: Set<dateString> } 형태
 * - myDates: Set<dateString> - 현재 사용자의 선택 날짜
 * - intersection: Set<dateString> - 5명 전원 가능 날짜
 * - othersCount: { [dateString]: number } - 각 날짜별 선택한 사람 수
 * - toggleDate: (date) => void - 날짜 토글 함수
 * - loading: boolean
 */
export function useAvailableDates(userId) {
  const [allDates, setAllDates] = useState({}); // { userId: Set<dateKey> }
  const [loading, setLoading] = useState(true);
  const channelRef = useRef(null);

  // 초기 데이터 로드
  useEffect(() => {
    if (!userId) return;

    async function fetchAllDates() {
      setLoading(true);
      const { data, error } = await supabase
        .from('available_dates')
        .select('user_id, selected_date');

      if (error) {
        console.error('Failed to fetch dates:', error);
        setLoading(false);
        return;
      }

      // userId별로 Set을 구성
      const grouped = {};
      (data || []).forEach(row => {
        if (!grouped[row.user_id]) {
          grouped[row.user_id] = new Set();
        }
        grouped[row.user_id].add(row.selected_date);
      });

      setAllDates(grouped);
      setLoading(false);
    }

    fetchAllDates();

    // Realtime 구독
    const channel = supabase
      .channel('available_dates_changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'available_dates',
        },
        (payload) => {
          if (payload.eventType === 'INSERT') {
            const { user_id, selected_date } = payload.new;
            setAllDates(prev => {
              const next = { ...prev };
              if (!next[user_id]) next[user_id] = new Set();
              else next[user_id] = new Set(next[user_id]);
              next[user_id].add(selected_date);
              return next;
            });
          } else if (payload.eventType === 'DELETE') {
            const { user_id, selected_date } = payload.old;
            setAllDates(prev => {
              const next = { ...prev };
              if (next[user_id]) {
                next[user_id] = new Set(next[user_id]);
                next[user_id].delete(selected_date);
              }
              return next;
            });
          }
        }
      )
      .subscribe();

    channelRef.current = channel;

    return () => {
      if (channelRef.current) {
        supabase.removeChannel(channelRef.current);
      }
    };
  }, [userId]);

  // 현재 사용자의 날짜 Set
  const myDates = allDates[userId] || new Set();

  // 각 날짜별 선택 인원 수
  const dateCountMap = {};
  Object.values(allDates).forEach(dateSet => {
    dateSet.forEach(dateKey => {
      dateCountMap[dateKey] = (dateCountMap[dateKey] || 0) + 1;
    });
  });

  // 5명 전원 교집합
  const intersection = new Set();
  Object.entries(dateCountMap).forEach(([dateKey, count]) => {
    if (count >= TOTAL_USERS) {
      intersection.add(dateKey);
    }
  });

  // 날짜 토글 (추가/삭제)
  const toggleDate = useCallback(async (date) => {
    if (!userId) return;

    const dateKey = formatDateKey(date);
    const isSelected = myDates.has(dateKey);

    // Optimistic update
    setAllDates(prev => {
      const next = { ...prev };
      if (!next[userId]) next[userId] = new Set();
      else next[userId] = new Set(next[userId]);

      if (isSelected) {
        next[userId].delete(dateKey);
      } else {
        next[userId].add(dateKey);
      }
      return next;
    });

    if (isSelected) {
      // 삭제
      const { error } = await supabase
        .from('available_dates')
        .delete()
        .eq('user_id', userId)
        .eq('selected_date', dateKey);

      if (error) {
        console.error('Failed to delete date:', error);
        // Rollback
        setAllDates(prev => {
          const next = { ...prev };
          next[userId] = new Set(next[userId]);
          next[userId].add(dateKey);
          return next;
        });
      }
    } else {
      // 추가
      const { error } = await supabase
        .from('available_dates')
        .insert({ user_id: userId, selected_date: dateKey });

      if (error) {
        console.error('Failed to insert date:', error);
        // Rollback
        setAllDates(prev => {
          const next = { ...prev };
          next[userId] = new Set(next[userId]);
          next[userId].delete(dateKey);
          return next;
        });
      }
    }
  }, [userId, myDates]);

  return {
    allDates,
    myDates,
    intersection,
    othersCount: dateCountMap,
    toggleDate,
    loading,
  };
}
