ALTER TABLE public.cvs
  ADD COLUMN template text NOT NULL DEFAULT 'classic';

COMMENT ON COLUMN public.cvs.template IS
  'Id template user chọn cho CV (classic, modern-tech, ...). Default classic để CV cũ tự động hợp lệ.';

-- Không cần thêm GRANT/policy: cột mới nằm trong bảng cvs đã có sẵn
-- GRANT SELECT/UPDATE và RLS policy cho authenticated, cột mới tự động kế thừa.
