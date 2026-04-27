-- ============================================
-- PIN 컬럼 추가 & UPDATE 정책 추가
-- Supabase SQL Editor에서 실행하세요
-- ============================================

-- 1. users 테이블에 pin 컬럼 추가 (NULL 허용 = 아직 설정 안 한 사용자)
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS pin TEXT DEFAULT NULL;

-- 2. users 테이블 UPDATE 정책 (PIN 설정용)
CREATE POLICY "Allow update user pin"
  ON public.users FOR UPDATE USING (true) WITH CHECK (true);
