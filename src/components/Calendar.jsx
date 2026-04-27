import { useState } from 'react';
import CalendarDay from './CalendarDay';
import { 
  getCalendarDays, 
  formatMonthYear, 
  formatDateKey, 
  WEEKDAY_LABELS, 
  addMonths, 
  subMonths 
} from '../lib/dateUtils';

export default function Calendar({ 
  myDates, 
  othersCount, 
  intersection, 
  onToggle, 
  loading 
}) {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const days = getCalendarDays(currentMonth);

  const goToPrevMonth = () => setCurrentMonth(prev => subMonths(prev, 1));
  const goToNextMonth = () => setCurrentMonth(prev => addMonths(prev, 1));
  const goToToday = () => setCurrentMonth(new Date());

  return (
    <div className="glass-card-strong mx-4 p-4 sm:p-5 animate-slide-up">
      {/* Month Navigation */}
      <div className="flex items-center justify-between mb-4">
        <button
          onClick={goToPrevMonth}
          className="w-10 h-10 rounded-xl bg-white/5 hover:bg-white/10 flex items-center justify-center
                     text-surface-400 hover:text-white transition-all duration-200 active:scale-90"
          aria-label="이전 달"
        >
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
          </svg>
        </button>

        <div className="flex items-center gap-2">
          <h2 className="text-lg font-bold text-white">
            {formatMonthYear(currentMonth)}
          </h2>
          <button
            onClick={goToToday}
            className="px-2 py-0.5 text-[10px] font-medium text-brand-400 bg-brand-500/10 
                       rounded-md hover:bg-brand-500/20 transition-colors"
          >
            오늘
          </button>
        </div>

        <button
          onClick={goToNextMonth}
          className="w-10 h-10 rounded-xl bg-white/5 hover:bg-white/10 flex items-center justify-center
                     text-surface-400 hover:text-white transition-all duration-200 active:scale-90"
          aria-label="다음 달"
        >
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
          </svg>
        </button>
      </div>

      {/* Weekday Headers */}
      <div className="grid grid-cols-7 gap-1 mb-1">
        {WEEKDAY_LABELS.map((label, i) => (
          <div
            key={label}
            className={`text-center text-xs font-medium py-2 
              ${i === 0 ? 'text-red-400/70' : i === 6 ? 'text-blue-400/70' : 'text-surface-500'}`}
          >
            {label}
          </div>
        ))}
      </div>

      {/* Calendar Grid */}
      {loading ? (
        <div className="flex items-center justify-center py-20">
          <div className="flex items-center gap-3 text-surface-500">
            <svg className="animate-spin w-5 h-5" viewBox="0 0 24 24" fill="none">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
            </svg>
            <span className="text-sm">데이터 불러오는 중...</span>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-7 gap-1">
          {days.map((day) => {
            const dateKey = formatDateKey(day);
            return (
              <CalendarDay
                key={dateKey}
                day={day}
                currentMonth={currentMonth}
                isMine={myDates.has(dateKey)}
                othersCount={othersCount[dateKey] || 0}
                isIntersection={intersection.has(dateKey)}
                onToggle={onToggle}
              />
            );
          })}
        </div>
      )}

      {/* Intersection Summary */}
      {intersection.size > 0 && (
        <div className="mt-4 px-4 py-3 rounded-xl bg-intersect/10 border border-intersect/20 animate-fade-in">
          <div className="flex items-center gap-2 mb-1">
            <span className="text-intersect font-semibold text-sm">
              🎉 모두 가능한 날: {intersection.size}일
            </span>
          </div>
          <p className="text-xs text-intersect/70">
            {[...intersection].sort().map(d => {
              const date = new Date(d + 'T00:00:00');
              return `${date.getMonth() + 1}/${date.getDate()}`;
            }).join(', ')}
          </p>
        </div>
      )}
    </div>
  );
}
