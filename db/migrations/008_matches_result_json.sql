ALTER TABLE public.matches
  ADD COLUMN result_json jsonb;

-- Comment: cột này lưu kết quả match dạng JSON object có cấu trúc
-- (overall_score, skill_match, experience_match, education_match,
--  missing_skills, strengths, recommendation) từ API team AI.
-- Cột result_text cũ giữ lại để tương thích, có thể null từ giờ.

-- Cho phép result_text nullable (vì giờ dùng result_json thay thế)
ALTER TABLE public.matches
  ALTER COLUMN result_text DROP NOT NULL;
