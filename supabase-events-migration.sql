-- ============================================
-- CalSync — events 테이블 추가 마이그레이션
-- Supabase SQL Editor에서 실행하세요
-- ============================================

-- 1. users 테이블에 color 컬럼 추가
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS color TEXT NOT NULL DEFAULT '#4c6ef5';

-- 각 사용자 색상 설정 (name 기준)
UPDATE public.users SET color = '#4c6ef5' WHERE name = '오윤';
UPDATE public.users SET color = '#20c997' WHERE name = '김민지';
UPDATE public.users SET color = '#f59f00' WHERE name = '박지은';
UPDATE public.users SET color = '#e64980' WHERE name = '우서현';
UPDATE public.users SET color = '#7950f2' WHERE name = '어진원';

-- 2. events 테이블 생성
CREATE TABLE public.events (
  id         UUID        DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id    UUID        NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  title      TEXT        NOT NULL DEFAULT '일정',
  memo       TEXT,
  start_at   TIMESTAMPTZ NOT NULL,
  end_at     TIMESTAMPTZ NOT NULL,
  is_allday  BOOLEAN     NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),

  CONSTRAINT chk_time_order CHECK (end_at > start_at)
);

-- 인덱스
CREATE INDEX idx_events_user  ON public.events(user_id);
CREATE INDEX idx_events_start ON public.events(start_at);
CREATE INDEX idx_events_range ON public.events(start_at, end_at);

-- updated_at 자동 갱신 트리거
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN NEW.updated_at = now(); RETURN NEW; END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_events_updated_at
  BEFORE UPDATE ON public.events
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- 3. RLS
ALTER TABLE public.events ENABLE ROW LEVEL SECURITY;

CREATE POLICY "events_select" ON public.events FOR SELECT USING (true);
CREATE POLICY "events_insert" ON public.events FOR INSERT WITH CHECK (true);
CREATE POLICY "events_update" ON public.events FOR UPDATE USING (true) WITH CHECK (true);
CREATE POLICY "events_delete" ON public.events FOR DELETE USING (true);

-- 4. Realtime 활성화
ALTER PUBLICATION supabase_realtime ADD TABLE public.events;
