import { useState, useRef, useCallback, useEffect } from 'react';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin from '@fullcalendar/interaction';
import { format, addWeeks } from 'date-fns';
import { ko } from 'date-fns/locale';
import { useAuth } from '../../contexts/AuthContext';
import { useEvents } from '../../hooks/useEvents';
import { useFreeTimes } from '../../hooks/useFreeTimes';
import EventModal from './EventModal';
import SharedMemo from './SharedMemo';

export default function CalendarView() {
  const { user, users } = useAuth();
  const calendarRef = useRef(null);

  // 뷰 모드: 'mine' (내 캘린더) | 'group' (그룹 캘린더)
  const [viewMode, setViewMode] = useState('mine');

  // 필터: 선택된 사용자 ID 목록
  const [selectedUsers, setSelectedUsers] = useState([]);

  // users 목록이 로드되면 기본적으로 전체 선택
  useEffect(() => {
    if (users && users.length > 0 && selectedUsers.length === 0) {
      setSelectedUsers(users.map(u => u.id));
    }
  }, [users, selectedUsers.length]);

  // 현재 뷰 범위 상태
  const [viewRange, setViewRange] = useState({ start: null, end: null });

  const { events, createEvent, updateEvent, deleteEvent, createMultipleEvents } = useEvents(
    viewRange.start,
    viewRange.end
  );

  const freeTimes = useFreeTimes(events, viewRange.start, viewRange.end, selectedUsers);

  // 모달 상태
  const [modal, setModal] = useState({ open: false, mode: 'create', event: null, defaultStart: null });

  // 사용자 토글 핸들러
  const toggleUser = (userId) => {
    setSelectedUsers(prev => 
      prev.includes(userId) ? prev.filter(id => id !== userId) : [...prev, userId]
    );
  };

  // FullCalendar에 전달할 events 배열 구성
  const calendarEvents = buildCalendarEvents(events, users, user, freeTimes, viewMode, selectedUsers);

  // 빈 슬롯 클릭 → 일정 생성 모달
  const handleDateSelect = useCallback((info) => {
    setModal({ open: true, mode: 'create', event: null, defaultStart: { start: info.startStr, end: info.endStr } });
    info.view.calendar.unselect();
  }, []);

  // 이벤트 클릭 → 수정/삭제 모달
  const handleEventClick = useCallback((info) => {
    const { extendedProps } = info.event;
    // 타인 이벤트이면서 '우리 약속'이 아니면 수정 불가
    if (extendedProps.userId !== user.id && !extendedProps.isMeeting) return; 
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
        is_meeting: extendedProps.isMeeting || false,
      },
      defaultStart: null,
    });
  }, [user]);

  // 드래그&드롭으로 이벤트 이동
  const handleEventDrop = useCallback(async (info) => {
    const { extendedProps } = info.event;
    if (extendedProps.userId !== user.id && !extendedProps.isMeeting) {
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
    const { extendedProps } = info.event;
    if (extendedProps.userId !== user.id && !extendedProps.isMeeting) {
      info.revert();
      return;
    }
    await updateEvent(info.event.id, {
      start_at: info.event.startStr,
      end_at: info.event.endStr,
    });
  }, [user, updateEvent]);

  // 저장 핸들러 (다중 생성 포함)
  const handleSave = useCallback(async (payloads) => {
    if (modal.mode === 'create') {
      const finalPayloads = [];
      
      for (const payload of payloads) {
        const { repeatWeeks, ...eventData } = payload;
        const baseEvent = { ...eventData, user_id: user.id };
        
        if (repeatWeeks && repeatWeeks > 1) {
          // 주간 반복 생성
          for (let i = 0; i < repeatWeeks; i++) {
            const newStart = addWeeks(new Date(baseEvent.start_at), i);
            const newEnd = addWeeks(new Date(baseEvent.end_at), i);
            finalPayloads.push({
              ...baseEvent,
              start_at: newStart.toISOString(),
              end_at: newEnd.toISOString(),
            });
          }
        } else {
          finalPayloads.push(baseEvent);
        }
      }
      
      await createMultipleEvents(finalPayloads);
    } else {
      // edit 모드에서는 페이로드 배열의 첫 번째 요소만 사용
      const { repeatWeeks, ...eventData } = payloads[0];
      await updateEvent(modal.event.id, eventData);
    }
    setModal(m => ({ ...m, open: false }));
  }, [modal, user, updateEvent, createMultipleEvents]);

  const handleDelete = useCallback(async () => {
    if (modal.event?.id) await deleteEvent(modal.event.id);
    setModal(m => ({ ...m, open: false }));
  }, [modal, deleteEvent]);

  return (
    <div className="flex flex-col h-full gap-3">
      {/* 탭 및 필터 영역 */}
      <div className="shrink-0 bg-surface-800 rounded-xl p-2 flex flex-col gap-3">
        {/* 모드 전환 탭 */}
        <div className="flex bg-surface-900 rounded-lg p-1">
          <button
            onClick={() => setViewMode('mine')}
            className={`flex-1 py-2 text-sm font-semibold rounded-md transition-all ${
              viewMode === 'mine' ? 'bg-surface-700 text-white shadow-sm' : 'text-surface-400 hover:text-surface-300'
            }`}
          >
            내 일정
          </button>
          <button
            onClick={() => setViewMode('group')}
            className={`flex-1 py-2 text-sm font-semibold rounded-md transition-all ${
              viewMode === 'group' ? 'bg-brand-500 text-white shadow-sm' : 'text-surface-400 hover:text-surface-300'
            }`}
          >
            그룹 일정
          </button>
        </div>

        {/* 그룹 일정일 때만 사용자 필터 표시 */}
        {viewMode === 'group' && (
          <div className="flex items-center gap-2 px-2 pb-1 overflow-x-auto custom-scrollbar">
            <span className="text-xs text-surface-400 shrink-0 mr-2">참여자 선택:</span>
            {users.map(u => {
              const isSelected = selectedUsers.includes(u.id);
              return (
                <button
                  key={u.id}
                  onClick={() => toggleUser(u.id)}
                  className={`shrink-0 flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs transition-all border
                    ${isSelected ? 'bg-surface-700 text-white border-surface-600' : 'bg-surface-800/50 text-surface-500 border-surface-700/50 opacity-50'}`}
                >
                  <span className="w-2 h-2 rounded-full" style={{ backgroundColor: u.color }}></span>
                  {u.name}
                </button>
              );
            })}
          </div>
        )}
      </div>

      {/* 공유 메모장 */}
      <SharedMemo />

      {/* 여유 시간 요약 바 (그룹 모드에서만 표시) */}
      {viewMode === 'group' && (
        freeTimes.length > 0 ? (
          <div className="shrink-0 px-4 py-3 glass-card rounded-xl flex items-center gap-4 overflow-x-auto custom-scrollbar border border-emerald-500/20">
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
          <div className="shrink-0 px-4 py-3 glass-card rounded-xl flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-surface-600"></span>
              <span className="text-sm text-surface-400">선택된 참여자들이 모두 가능한 시간이 없습니다.</span>
            </div>
          </div>
        )
      )}

      {/* 캘린더 */}
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
            // 수정 불가한 이벤트에 cursor 변경
            const props = info.event.extendedProps;
            if (props.userId !== user.id && !props.isMeeting && !props.isFreeTime) {
              info.el.style.cursor = 'default';
            }
          }}
        />
      </div>

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
function buildCalendarEvents(events, users, currentUser, freeTimes, viewMode, selectedUsers) {
  const userMap = Object.fromEntries(users.map(u => [u.id, u]));
  const result = [];
  const selectedSet = new Set(selectedUsers);

  events.forEach(ev => {
    const owner = userMap[ev.user_id];
    const isMe = ev.user_id === currentUser?.id;
    const isMeeting = ev.is_meeting;

    // 뷰 모드에 따른 필터링 로직
    if (viewMode === 'mine') {
      // 내 일정 탭: 내 일정 + 모임 일정만 표시
      if (!isMe && !isMeeting) return;
    } else {
      // 그룹 일정 탭: 선택된 사람들의 일정 + 모임 일정 표시
      if (!selectedSet.has(ev.user_id) && !isMeeting) return;
    }

    let title, backgroundColor, borderColor, opacity;

    if (isMeeting) {
      // 모임 일정은 눈에 띄게 표시
      title = `[우리 약속] ${ev.title}`;
      backgroundColor = '#f43f5e'; // 핑크빛 눈에 띄는 색
      borderColor = '#e11d48';
      opacity = 1;
    } else if (isMe) {
      // 내 일정
      title = ev.title;
      backgroundColor = owner?.color || '#4c6ef5';
      borderColor = owner?.color || '#4c6ef5';
      opacity = 1;
    } else {
      // 타인 일정 (그룹 탭에서) - 프라이버시 보호를 위해 이름 숨김
      title = `(바쁨)`;
      backgroundColor = owner?.color || '#6c757d';
      borderColor = owner?.color || '#6c757d';
      opacity = 0.5; // 약간 투명하게
    }

    result.push({
      id: ev.id,
      title,
      start: ev.start_at,
      end: ev.end_at,
      allDay: ev.is_allday,
      backgroundColor,
      borderColor,
      textColor: '#ffffff',
      classNames: isMeeting ? ['event-meeting'] : (isMe ? ['event-mine'] : ['event-others']),
      extendedProps: {
        userId: ev.user_id,
        memo: ev.memo,
        isMeeting,
        isFreeTime: false,
      },
    });
  });

  // 교집합 여유 시간 (그룹 탭에서만 표시)
  if (viewMode === 'group') {
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
  }

  return result;
}
