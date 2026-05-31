-- ============================================================
-- Phần 1: Thêm cột vào bảng profiles
-- ============================================================

ALTER TABLE profiles
  ADD COLUMN plan text NOT NULL DEFAULT 'free'
    CONSTRAINT profiles_plan_check CHECK (plan IN ('free', 'pro')),
  ADD COLUMN pro_expires_at timestamptz;


-- ============================================================
-- Phần 2: Tạo bảng orders
-- ============================================================

CREATE TABLE orders (
  id           uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id      uuid        NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  order_code   text        NOT NULL UNIQUE,
  plan         text        NOT NULL CONSTRAINT orders_plan_check CHECK (plan IN ('pro_1month')),
  amount       integer     NOT NULL CONSTRAINT orders_amount_check CHECK (amount > 0),
  status       text        NOT NULL DEFAULT 'pending'
                 CONSTRAINT orders_status_check CHECK (status IN ('pending', 'awaiting_review', 'paid', 'rejected')),
  bank_txn_id  text,
  note         text,
  created_at   timestamptz NOT NULL DEFAULT now(),
  paid_at      timestamptz
);


-- ============================================================
-- Phần 3: Bật RLS và policies cho orders
-- ============================================================

ALTER TABLE orders ENABLE ROW LEVEL SECURITY;

-- User chỉ xem được order của chính mình
CREATE POLICY "orders: select own"
  ON orders FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

-- User chỉ tạo order cho chính mình
CREATE POLICY "orders: insert own"
  ON orders FOR INSERT
  TO authenticated
  WITH CHECK (user_id = auth.uid());

-- UPDATE policy — tạm comment, admin sẽ thêm sau
-- CREATE POLICY "orders: update (admin only)"
--   ON orders FOR UPDATE
--   TO ...
--   USING (...);


-- ============================================================
-- Phần 4: GRANT quyền cho role authenticated
-- ============================================================

GRANT SELECT, INSERT ON orders TO authenticated;


-- ============================================================
-- Phần 5: Index cho hiệu suất truy vấn
-- ============================================================

-- Truy vấn "đơn của user X" thường xuyên
CREATE INDEX idx_orders_user_id ON orders (user_id);

-- Admin lọc theo trạng thái
CREATE INDEX idx_orders_status ON orders (status);
