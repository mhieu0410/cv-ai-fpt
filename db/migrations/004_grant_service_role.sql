-- ============================================================
-- GRANT quyền cho role service_role trên các bảng ứng dụng.
-- service_role bypass RLS nhưng vẫn cần table-level GRANT.
-- ============================================================

-- SELECT trên tất cả bảng (admin chỉ đọc)
GRANT SELECT ON profiles    TO service_role;
GRANT SELECT ON cvs         TO service_role;
GRANT SELECT ON suggestions TO service_role;
GRANT SELECT ON orders      TO service_role;
GRANT SELECT ON feedbacks   TO service_role;

-- UPDATE trên profiles — admin đổi plan + pro_expires_at khi duyệt đơn
GRANT UPDATE ON profiles TO service_role;

-- UPDATE trên orders — admin đổi status, paid_at, note khi duyệt/reject
GRANT UPDATE ON orders TO service_role;
