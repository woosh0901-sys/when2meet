import { useState, useEffect } from 'react';
import { format } from 'date-fns';

export default function EventModal({ mode, event, defaultStart, onSave, onDelete, onClose }) {
  const [title, setTitle] = useState('');
  const [memo, setMemo] = useState('');
  const [startAt, setStartAt] = useState('');
  const [endAt, setEndAt] = useState('');
  const [isAllday, setIsAllday] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (mode === 'edit' && event) {
      setTitle(event.title || '');
      setMemo(event.memo || '');
      setStartAt(toLocalInput(event.start));
      setEndAt(toLocalInput(event.end));
      setIsAllday(event.allDay || false);
    } else if (defaultStart) {
      setTitle('');
      setMemo('');
      setStartAt(toLocalInput(defaultStart.start));
      setEndAt(toLocalInput(defaultStart.end));
      setIsAllday(false);
    }
  }, [mode, event, defaultStart]);

  const handleSave = async () => {
    if (!title.trim()) { setError('제목을 입력해 주세요.'); return; }
    if (!startAt || !endAt) { setError('시작/종료 시간을 입력해 주세요.'); return; }
    if (new Date(startAt) >= new Date(endAt)) { setError('종료 시간이 시작 시간보다 늦어야 합니다.'); return; }

    setSubmitting(true);
    await onSave({
      title: title.trim(),
      memo: memo.trim() || null,
      start_at: new Date(startAt).toISOString(),
      end_at: new Date(endAt).toISOString(),
      is_allday: isAllday,
    });
    setSubmitting(false);
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in"
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div className="w-full max-w-md glass-card-strong p-6 animate-slide-up">
        {/* Header */}
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-lg font-bold text-white">
            {mode === 'create' ? '새 일정 추가' : '일정 수정'}
          </h2>
          <button onClick={onClose} className="w-8 h-8 rounded-lg bg-white/5 hover:bg-white/10 flex items-center justify-center text-surface-400 hover:text-white transition-colors">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="space-y-4">
          {/* 제목 */}
          <div>
            <label className="block text-xs text-surface-500 mb-1.5">제목 *</label>
            <input
              type="text"
              value={title}
              onChange={e => { setTitle(e.target.value); setError(''); }}
              placeholder="일정 제목 입력"
              className="input-field"
              autoFocus
            />
          </div>

          {/* 하루 종일 */}
          <label className="flex items-center gap-3 cursor-pointer">
            <div
              onClick={() => setIsAllday(v => !v)}
              className={`w-10 h-6 rounded-full transition-colors duration-200 flex items-center px-1
                ${isAllday ? 'bg-brand-500' : 'bg-white/10'}`}
            >
              <div className={`w-4 h-4 rounded-full bg-white transition-transform duration-200 ${isAllday ? 'translate-x-4' : 'translate-x-0'}`} />
            </div>
            <span className="text-sm text-surface-300">하루 종일</span>
          </label>

          {/* 시작/종료 시간 */}
          {!isAllday && (
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs text-surface-500 mb-1.5">시작</label>
                <input
                  type="datetime-local"
                  value={startAt}
                  onChange={e => { setStartAt(e.target.value); setError(''); }}
                  className="input-field text-sm"
                />
              </div>
              <div>
                <label className="block text-xs text-surface-500 mb-1.5">종료</label>
                <input
                  type="datetime-local"
                  value={endAt}
                  onChange={e => { setEndAt(e.target.value); setError(''); }}
                  className="input-field text-sm"
                />
              </div>
            </div>
          )}

          {/* 날짜만 (하루 종일) */}
          {isAllday && (
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs text-surface-500 mb-1.5">날짜</label>
                <input
                  type="date"
                  value={startAt.slice(0, 10)}
                  onChange={e => {
                    setStartAt(e.target.value + 'T00:00');
                    setEndAt(e.target.value + 'T23:59');
                  }}
                  className="input-field text-sm"
                />
              </div>
            </div>
          )}

          {/* 메모 */}
          <div>
            <label className="block text-xs text-surface-500 mb-1.5">메모 (선택)</label>
            <textarea
              value={memo}
              onChange={e => setMemo(e.target.value)}
              placeholder="메모를 입력하세요"
              rows={2}
              className="input-field resize-none"
            />
          </div>

          {/* 에러 */}
          {error && (
            <div className="flex items-center gap-2 px-3 py-2.5 rounded-xl bg-red-500/10 border border-red-500/20 text-sm text-red-300">
              <svg className="w-4 h-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01" />
              </svg>
              {error}
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="flex gap-2 mt-6">
          {mode === 'edit' && (
            <button
              onClick={onDelete}
              className="px-4 py-2.5 rounded-xl bg-red-500/10 hover:bg-red-500/20 border border-red-500/20 text-red-400 text-sm font-medium transition-all"
            >
              삭제
            </button>
          )}
          <button onClick={onClose} className="flex-1 px-4 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-surface-300 text-sm font-medium transition-all">
            취소
          </button>
          <button
            onClick={handleSave}
            disabled={submitting}
            className="flex-1 btn-primary py-2.5 text-sm flex items-center justify-center gap-2"
          >
            {submitting ? (
              <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
              </svg>
            ) : (mode === 'create' ? '추가' : '저장')}
          </button>
        </div>
      </div>
    </div>
  );
}

/** datetime-local input 형식으로 변환 */
function toLocalInput(isoString) {
  if (!isoString) return '';
  const d = new Date(isoString);
  const pad = n => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth()+1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}
