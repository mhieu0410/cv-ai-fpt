-- ============================================================
-- Cấp quyền UPDATE giới hạn trên bảng orders cho role authenticated.
-- Chỉ 2 cột được phép sửa: status và bank_txn_id.
-- Các cột nhạy cảm (amount, user_id, order_code, plan...) không thể bị user sửa.
-- ============================================================

GRANT UPDATE (status, bank_txn_id) ON orders TO authenticated;


-- ============================================================
-- RLS policy cho UPDATE.
-- Thiếu policy này thì dù có GRANT, RLS vẫn block toàn bộ request.
-- ============================================================

CREATE POLICY "orders: confirm own pending"
  ON orders FOR UPDATE
  TO authenticated
  -- USING: row nào user được phép update
  --   - user_id = auth.uid()  → chỉ order của chính mình
  --   - status = 'pending'    → chỉ khi chưa submit (chống re-submit)
  USING (user_id = auth.uid() AND status = 'pending')
  -- WITH CHECK: sau khi update xong, row phải thoả điều kiện này
  --   - user_id = auth.uid()                           → không được chuyển sang user khác
  --   - status IN ('pending', 'awaiting_review')       → chỉ được đặt status hợp lệ
  WITH CHECK (user_id = auth.uid() AND status IN ('pending', 'awaiting_review'));
