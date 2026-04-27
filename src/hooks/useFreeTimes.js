import { useMemo } from 'react';

const TOTAL_USERS = 5;
const SLOT_HOURS = 1; // 1시간 단위

/**
 * 5명 전원이 비어있는 시간대(교집합 여유 시간) 계산
 * @param {Array} events - 전체 이벤트 배열 [{ user_id, start_at, end_at, is_allday }]
 * @param {string} viewStart - 뷰 시작 ISO string
 * @param {string} viewEnd   - 뷰 종료 ISO string
 * @returns {{ start: Date, end: Date }[]} - 교집합 여유 시간 슬롯 목록
 */
export function useFreeTimes(events, viewStart, viewEnd) {
  const freeTimes = useMemo(() => {
    if (!viewStart || !viewEnd || !events.length) return [];

    const rangeStart = new Date(viewStart);
    const rangeEnd = new Date(viewEnd);

    // 하루 8시 ~ 23시 범위만 계산 (야간 제외)
    const WORK_START = 8;
    const WORK_END = 23;

    const slots = [];
    const cursor = new Date(rangeStart);

    // 날짜 순회
    while (cursor < rangeEnd) {
      const dayStart = new Date(cursor);
      dayStart.setHours(WORK_START, 0, 0, 0);
      const dayEnd = new Date(cursor);
      dayEnd.setHours(WORK_END, 0, 0, 0);

      // 해당 날짜의 슬롯 생성 (1시간 단위)
      const slotStart = new Date(dayStart);
      while (slotStart < dayEnd) {
        const slotEnd = new Date(slotStart.getTime() + SLOT_HOURS * 60 * 60 * 1000);

        // 이 슬롯에 겹치는 이벤트가 있는 사용자 수 계산
        const busyUserIds = new Set();
        events.forEach(ev => {
          if (ev.is_allday) {
            busyUserIds.add(ev.user_id);
            return;
          }
          const evStart = new Date(ev.start_at);
          const evEnd = new Date(ev.end_at);
          // 겹침: evStart < slotEnd && evEnd > slotStart
          if (evStart < slotEnd && evEnd > slotStart) {
            busyUserIds.add(ev.user_id);
          }
        });

        // 5명 전원이 비어있는 슬롯만 수집
        if (busyUserIds.size === 0) {
          slots.push({ start: new Date(slotStart), end: new Date(slotEnd) });
        }

        slotStart.setTime(slotStart.getTime() + SLOT_HOURS * 60 * 60 * 1000);
      }

      cursor.setDate(cursor.getDate() + 1);
    }

    // 연속 슬롯 병합
    const merged = [];
    slots.forEach(slot => {
      if (merged.length === 0) {
        merged.push({ ...slot });
      } else {
        const last = merged[merged.length - 1];
        if (last.end.getTime() === slot.start.getTime()) {
          last.end = slot.end;
        } else {
          merged.push({ ...slot });
        }
      }
    });

    return merged;
  }, [events, viewStart, viewEnd]);

  return freeTimes;
}
