-- ============================================
-- CalSync — events 테이블 마이그레이션 (개편안)
-- Supabase SQL Editor에서 실행하세요
-- ============================================

-- 1. events 테이블에 is_meeting 컬럼 추가 (우리끼리 약속 플래그)
ALTER TABLE public.events ADD COLUMN IF NOT EXISTS is_meeting BOOLEAN NOT NULL DEFAULT false;

-- 기존 데이터 중 '모임', '우리 약속'과 같은 title이 있으면 is_meeting을 true로 업데이트 (옵션)
-- UPDATE public.events SET is_meeting = true WHERE title LIKE '%모임%';
