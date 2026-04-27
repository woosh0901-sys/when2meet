import { useState, useRef, useCallback } from 'react';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin from '@fullcalendar/interaction';
import { format } from 'date-fns';
import { ko } from 'date-fns/locale';
import { useAuth } from '../../contexts/AuthContext';
import { useEvents } from '../../hooks/useEvents';
import { useFreeTimes } from '../../hooks/useFreeTimes';
import EventModal from './EventModal';

export default function CalendarView() {
  const { user, users } = useAuth();
  const calendarRef = useRef(null);

  // 현재 뷰 범위 상태 (FullCalendar datesSet 콜백으로 갱신)
  const [viewRange, setViewRange] = useState({ start: null, end: null });

  const { events, createEvent, updateEvent, deleteEvent } = useEvents(
    viewRange.start,
    viewRange.end
  );

  const freeTimes = useFreeTimes(events, viewRange.start, viewRange.end);

  // 모달 상태
  const [modal, setModal] = useState({ open: false, mode: 'create', event: null, defaultStart: null });

  // FullCalendar에 전달할 events 배열 구성
  const calendarEvents = buildCalendarEvents(events, users, user, freeTimes);

  // 빈 슬롯 클릭 → 일정 생성 모달
  const handleDateSelect = useCallback((info) => {
    setModal({ open: true, mode: 'create', event: null, defaultStart: { start: info.startStr, end: info.endStr } });
    info.view.calendar.unselect();
  }, []);

  // 이벤트 클릭 → 수정/삭제 모달 (본인 이벤트만)
  const handleEventClick = useCallback((info) => {
    const { extendedProps } = info.event;
    if (extendedProps.userId !== user.id) return; // 타인 이벤트 클릭 무시
    setModal({
      open: true,
      mode: 'edit',
      event: {
        id: info.event.id,
        title: info.event.title,
        start: info.event.startStr,
        end: info.event.endStr,
        allDay: info.event.allDay,
        memo: extendedProps.memo || '',
      },
      defaultStart: null,
    });
  }, [user]);

  // 드래그&드롭으로 이벤트 이동
  const handleEventDrop = useCallback(async (info) => {
    if (info.event.extendedProps.userId !== user.id) {
      info.revert();
      return;
    }
    await updateEvent(info.event.id, {
      start_at: info.event.startStr,
      end_at: info.event.endStr,
    });
  }, [user, updateEvent]);

  // 이벤트 리사이즈
  const handleEventResize = useCallback(async (info) => {
    if (info.event.extendedProps.userId !== user.id) {
      info.revert();
      return;
    }
    await updateEvent(info.event.id, {
      start_at: info.event.startStr,
      end_at: info.event.endStr,
    });
  }, [user, updateEvent]);

  const handleSave = useCallback(async (payload) => {
    if (modal.mode === 'create') {
      await createEvent({ ...payload, user_id: user.id });
    } else {
      await updateEvent(modal.event.id, payload);
    }
    setModal(m => ({ ...m, open: false }));
  }, [modal, user, createEvent, updateEvent]);

  const handleDelete = useCallback(async () => {
    if (modal.event?.id) await deleteEvent(modal.event.id);
    setModal(m => ({ ...m, open: false }));
  }, [modal, deleteEvent]);

  return (
    <div className="flex flex-col h-full">
      {/* 모두가 가능한 여유 시간 요약 바 */}
      {freeTimes.length > 0 ? (
        <div className="shrink-0 mb-3 px-4 py-3 glass-card rounded-xl flex items-center gap-4 overflow-x-auto custom-scrollbar">
          <div className="flex items-center gap-2 shrink-0">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse"></span>
            <span className="text-sm font-semibold text-white">모두 가능한 시간 ({freeTimes.length}) :</span>
          </div>
          <div className="flex items-center gap-2">
            {freeTimes.map((slot, i) => {
              const dateStr = format(slot.start, 'M.d (EEE)', { locale: ko });
              const timeStr = `${format(slot.start, 'HH:mm')} - ${format(slot.end, 'HH:mm')}`;
              return (
                <div key={i} className="shrink-0 px-3 py-1.5 bg-emerald-500/10 border border-emerald-500/20 rounded-lg text-emerald-300 text-xs font-medium whitespace-nowrap">
                  {dateStr} <span className="opacity-70 ml-1">{timeStr}</span>
                </div>
              );
            })}
          </div>
        </div>
      ) : (
        <div className="shrink-0 mb-3 px-4 py-3 glass-card rounded-xl flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-surface-600"></span>
            <span className="text-sm text-surface-400">이번 주 모두가 가능한 시간이 없습니다.</span>
          </div>
        </div>
      )}

      <div className="flex-1 fc-wrapper min-h-0">
        <FullCalendar
          ref={calendarRef}
          plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
        initialView="timeGridWeek"
        headerToolbar={{
          left: 'prev,next today',
          center: 'title',
          right: 'dayGridMonth,timeGridWeek,timeGridDay',
        }}
        locale="ko"
        buttonText={{ today: '오늘', month: '월', week: '주', day: '일' }}
        height="100%"
        selectable={true}
        selectMirror={true}
        editable={true}
        droppable={false}
        nowIndicator={true}
        slotMinTime="07:00:00"
        slotMaxTime="24:00:00"
        slotDuration="01:00:00"
        slotLabelInterval="01:00"
        allDaySlot={true}
        events={calendarEvents}
        datesSet={(info) => {
          setViewRange({ start: info.startStr, end: info.endStr });
        }}
        select={handleDateSelect}
        eventClick={handleEventClick}
        eventDrop={handleEventDrop}
        eventResize={handleEventResize}
        eventDidMount={(info) => {
          // 타인 이벤트에 cursor 변경
          if (info.event.extendedProps.userId !== user.id && !info.event.extendedProps.isFreeTime) {
            info.el.style.cursor = 'default';
          }
        }}
      />

      {modal.open && (
        <EventModal
          mode={modal.mode}
          event={modal.event}
          defaultStart={modal.defaultStart}
          onSave={handleSave}
          onDelete={handleDelete}
          onClose={() => setModal(m => ({ ...m, open: false }))}
        />
      )}
    </div>
  );
}

/** FullCalendar events 배열 구성 */
function buildCalendarEvents(events, users, currentUser, freeTimes) {
  const userMap = Object.fromEntries(users.map(u => [u.id, u]));
  const result = [];

  events.forEach(ev => {
    const owner = userMap[ev.user_id];
    const isMe = ev.user_id === currentUser?.id;

    result.push({
      id: ev.id,
      title: isMe ? ev.title : '바쁨',
      start: ev.start_at,
      end: ev.end_at,
      allDay: ev.is_allday,
      backgroundColor: isMe ? (owner?.color || '#4c6ef5') : '#6c757d',
      borderColor: isMe ? (owner?.color || '#4c6ef5') : '#6c757d',
      textColor: '#ffffff',
      opacity: isMe ? 1 : 0.45,
      extendedProps: {
        userId: ev.user_id,
        memo: ev.memo,
        isFreeTime: false,
      },
      classNames: isMe ? ['event-mine'] : ['event-others'],
    });
  });

  // 교집합 여유 시간 → background event
  freeTimes.forEach((slot, i) => {
    result.push({
      id: `free-${i}`,
      start: slot.start.toISOString(),
      end: slot.end.toISOString(),
      display: 'background',
      backgroundColor: 'rgba(32, 201, 151, 0.18)',
      classNames: ['event-free'],
      extendedProps: { isFreeTime: true },
    });
  });

  return result;
}
