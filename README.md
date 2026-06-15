# CV AI FPT

Công cụ AI giúp sinh viên FPT **viết CV theo ngữ cảnh**, **đối chiếu CV với JD** và **tối ưu vượt bộ lọc ATS** để sẵn sàng cho kỳ OJT/internship.

Xây dựng trên **Next.js 16 (App Router) · React 19 · TypeScript · Tailwind CSS v4 · Supabase**.

## Tính năng

- **Xác thực** bằng email/mật khẩu (đăng ký, đăng nhập, quên/đặt lại mật khẩu) qua Supabase Auth.
- **Bảo vệ route** bằng middleware ở Edge: tự refresh session và chặn truy cập trang riêng tư khi chưa đăng nhập.
- **Trình tạo CV** với validation realtime (họ tên, email, SĐT, năm học, kỹ năng, dự án, hoạt động).
- **Dashboard**: thống kê nhanh, tìm kiếm, sắp xếp, trạng thái loading dạng skeleton, empty state, xoá CV có xác nhận.
- **Mẫu CV** (classic, modern-tech) — preview web + xuất **PDF** phía client bằng `@react-pdf/renderer`.
- **Match CV ↔ JD**: chấm điểm tổng quát, kỹ năng, kinh nghiệm, học vấn; chỉ ra kỹ năng còn thiếu & khuyến nghị.
- **Gói Free/Pro** với hạn mức CV, nâng cấp qua **VietQR** + luồng duyệt đơn thủ công.
- **Khu vực Admin**: tổng quan doanh thu/đơn/user, duyệt/từ chối đơn, cấp/thu hồi Pro.

## Kiến trúc

```
app/
  (public)        page.tsx (landing), login, signup, forgot/reset-password
  dashboard/      danh sách CV của user (client) + stats/search/sort
  cv/             new · [id]/edit · [id]/view · [id]/match · [id]/suggest
  orders/ upgrade/ checkout/   luồng thanh toán Pro
  admin/          layout (chặn non-admin) + dashboard, orders, users, feedbacks
  api/            route handlers (REST) cho cvs, orders, match, suggest, admin
components/
  CvForm, MatchForm, AppNavbar, NavbarLinks, TemplateSelector
  cv-templates/   registry + classic & modern-tech (preview.tsx + pdf.tsx)
lib/
  supabase.ts          browser client
  supabase-server.ts   server factories: createServerSupabase() / createRouteSupabase()
  supabase-admin.ts    service_role client (bypass RLS, chỉ server)
  admin-auth.ts        isAdmin(), requireAdmin(), getAdminUser()
  user-plan.ts         getUserPlan(), countUserCvs()
  config.ts            cấu hình tập trung (giá, hạn mức, ngân hàng)
db/migrations/    SQL schema + RLS policies (orders, matches, cột template, ...)
middleware.ts     auth guard + session refresh
```

**Nguyên tắc áp dụng:** Clean Architecture (tách lib/route/UI), DRY (gom khởi tạo Supabase & auth admin về một chỗ), defense-in-depth (RLS ở DB + ownership check ở route + middleware ở Edge), không hardcode (đẩy giá trị cấu hình ra `lib/config.ts` + biến môi trường).

## Bắt đầu

```bash
# 1. Cài dependencies
npm install

# 2. Tạo file môi trường
cp .env.example .env.local   # rồi điền giá trị thật

# 3. Áp dụng migrations trong db/migrations/ vào Supabase project

# 4. Chạy dev server
npm run dev                  # http://localhost:3000
```

## Scripts

| Lệnh             | Mô tả                                  |
| ---------------- | -------------------------------------- |
| `npm run dev`    | Chạy dev server                        |
| `npm run build`  | Build production                       |
| `npm run start`  | Chạy bản production đã build            |
| `npm run lint`   | Kiểm tra ESLint                        |
| `npx tsc --noEmit` | Type-check toàn dự án                 |

## Bảo mật

- `SUPABASE_SERVICE_ROLE_KEY` chỉ dùng trong code server (`lib/supabase-admin.ts`); không bao giờ import vào component browser.
- Row Level Security bật cho `orders`, `matches`; mọi route ghi đều kèm `.eq('user_id', user.id)` để chống truy cập chéo.
- Quyền admin dựa trên allowlist `ADMIN_EMAILS`, kiểm ở cả layout, route handler và middleware.
