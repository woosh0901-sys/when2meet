import { format, startOfMonth, endOfMonth, startOfWeek, endOfWeek, 
         eachDayOfInterval, isSameMonth, isSameDay, isToday, 
         addMonths, subMonths } from 'date-fns';
import { ko } from 'date-fns/locale';

/**
 * 날짜를 'YYYY-MM-DD' 형식 문자열로 변환
 */
export function formatDateKey(date) {
  return format(date, 'yyyy-MM-dd');
}

/**
 * 캘린더 그리드에 표시할 날짜 배열 생성
 * 해당 월의 시작 주 월요일 ~ 마지막 주 일요일
 */
export function getCalendarDays(currentMonth) {
  const monthStart = startOfMonth(currentMonth);
  const monthEnd = endOfMonth(currentMonth);
  const calendarStart = startOfWeek(monthStart, { weekStartsOn: 0 });
  const calendarEnd = endOfWeek(monthEnd, { weekStartsOn: 0 });

  return eachDayOfInterval({ start: calendarStart, end: calendarEnd });
}

/**
 * 월 표시 포맷 (예: "2026년 4월")
 */
export function formatMonthYear(date) {
  return format(date, 'yyyy년 M월', { locale: ko });
}

/**
 * 요일 헤더 배열
 */
export const WEEKDAY_LABELS = ['일', '월', '화', '수', '목', '금', '토'];

export { isSameMonth, isSameDay, isToday, addMonths, subMonths };
