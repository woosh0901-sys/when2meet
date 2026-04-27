-- ============================================
-- ScheduleSync — Supabase 테이블 생성 스크립트
-- Supabase Dashboard > SQL Editor 에서 실행하세요
-- ============================================

-- 1. users 테이블: 사전 정의된 5명의 사용자
CREATE TABLE public.users (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 5명의 사용자 시드 데이터
INSERT INTO public.users (name) VALUES
  ('오윤'),
  ('김민지'),
  ('박지은'),
  ('우서현'),
  ('어진원');

-- 2. available_dates 테이블: 사용자별 가능한 날짜
CREATE TABLE public.available_dates (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  selected_date DATE NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE (user_id, selected_date)
);

-- 인덱스
CREATE INDEX idx_available_dates_date ON public.available_dates(selected_date);
CREATE INDEX idx_available_dates_user ON public.available_dates(user_id);

-- 3. RLS 활성화 & 정책
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.available_dates ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow read user names"
  ON public.users FOR SELECT USING (true);

CREATE POLICY "Allow read all dates"
  ON public.available_dates FOR SELECT USING (true);

CREATE POLICY "Allow insert dates"
  ON public.available_dates FOR INSERT WITH CHECK (true);

CREATE POLICY "Allow delete own dates"
  ON public.available_dates FOR DELETE USING (true);

-- 4. Realtime 활성화
ALTER PUBLICATION supabase_realtime ADD TABLE public.available_dates;
