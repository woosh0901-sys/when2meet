-- ============================================
-- CalSync — shared_memo 테이블 추가
-- Supabase SQL Editor에서 실행하세요
-- ============================================

-- 1. shared_memo 테이블 생성
CREATE TABLE public.shared_memo (
  id INT PRIMARY KEY,
  content TEXT NOT NULL DEFAULT '',
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- 기본 단일 레코드 삽입 (id 1번만 사용)
INSERT INTO public.shared_memo (id, content) VALUES (1, '') ON CONFLICT (id) DO NOTHING;

-- 2. RLS 활성화 및 정책 추가
ALTER TABLE public.shared_memo ENABLE ROW LEVEL SECURITY;

CREATE POLICY "shared_memo_select" ON public.shared_memo FOR SELECT USING (true);
CREATE POLICY "shared_memo_update" ON public.shared_memo FOR UPDATE USING (true) WITH CHECK (true);

-- 3. Realtime 활성화
ALTER PUBLICATION supabase_realtime ADD TABLE public.shared_memo;
