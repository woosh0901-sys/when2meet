import { isSameMonth, isToday } from '../lib/dateUtils';

const TOTAL_USERS = 5;

/**
 * 개별 날짜 셀 컴포넌트
 * 상태에 따라 다른 스타일 적용:
 * - 교집합 (5명 전원 선택) → 초록 + glow
 * - 내가 선택 → 파란색
 * - 다른 사람도 선택 → 노란/주황 계열
 * - 미선택 → 기본
 */
export default function CalendarDay({ 
  day, 
  currentMonth, 
  isMine, 
  othersCount = 0, 
  isIntersection,
  onToggle 
}) {
  const inMonth = isSameMonth(day, currentMonth);
  const today = isToday(day);

  // 날짜 상태 결정
  let stateClass = 'day-default';
  let countBadge = null;

  if (!inMonth) {
    stateClass = 'day-disabled';
  } else if (isIntersection) {
    stateClass = 'day-intersect';
  } else if (isMine && othersCount > 1) {
    // 내가 선택 + 다른 사람도 선택 (하지만 전원은 아님)
    stateClass = 'day-mine';
    countBadge = othersCount;
  } else if (isMine) {
    stateClass = 'day-mine';
  } else if (othersCount > 0) {
    stateClass = 'day-others';
    countBadge = othersCount;
  }

  const handleClick = () => {
    if (!inMonth) return;
    onToggle(day);
  };

  return (
    <button
      type="button"
      onClick={handleClick}
      disabled={!inMonth}
      className={`
        relative aspect-square rounded-xl flex flex-col items-center justify-center
        text-sm sm:text-base
        ${stateClass}
        ${today ? 'day-today' : ''}
        ${inMonth ? 'active:scale-90' : ''}
      `}
    >
      <span className={`${isIntersection ? 'text-base font-bold' : ''}`}>
        {day.getDate()}
      </span>

      {/* 선택 인원 표시 배지 */}
      {countBadge && countBadge > 0 && inMonth && !isIntersection && (
        <span className={`
          absolute -top-1 -right-1 w-4 h-4 rounded-full text-[10px] font-bold
          flex items-center justify-center
          ${isMine 
            ? 'bg-mine text-white' 
            : 'bg-others text-surface-900'
          }
          animate-bounce-in
        `}>
          {countBadge}
        </span>
      )}

      {/* 교집합 마크 */}
      {isIntersection && inMonth && (
        <span className="text-[10px] leading-none mt-0.5">✨</span>
      )}
    </button>
  );
}
