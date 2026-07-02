# KỊCH BẢN DEMO — CV AI FPT

> Demo end-to-end toàn bộ tính năng, đi từ **người dùng** → **thanh toán** → **admin duyệt** → **người dùng Pro**.
> Thời lượng gợi ý: **8–12 phút**.

---

## 0. CHUẨN BỊ TRƯỚC KHI DEMO (làm trước, không trình chiếu)

- **2 tài khoản:**
  - 1 tài khoản **người dùng thường** (vd `sinhvien@fpt.edu.vn`) — đang ở gói **Free**.
  - 1 tài khoản **admin** (email nằm trong `ADMIN_EMAILS`, vd `mhieu@gmail.com`).
- **Làm nóng dịch vụ AI trước 1–2 phút** (bấm thử 1 lần) vì server AI (recommend + analyze-job) trên Vercel/Render có thể "ngủ", lần gọi đầu chậm ~30–60s.
- Chuẩn bị sẵn **1 đoạn JD** để dán thủ công (phòng khi API gợi ý việc chậm).
- Mở sẵn 2 trình duyệt / 2 cửa sổ ẩn danh: một cho **user**, một cho **admin**.
- Chuẩn bị nội dung CV mẫu (tên, học vấn FPT, vài kỹ năng) để nhập nhanh.

---

## 1. ĐĂNG KÝ / ĐĂNG NHẬP (30 giây)

**Thao tác:** Vào trang chủ → **Đăng ký** hoặc **Đăng nhập bằng Google**.

**Nói:** "Sinh viên đăng nhập bằng email FPT hoặc Google chỉ trong vài giây. Sau khi đăng ký lần đầu, hệ thống dẫn qua bước Onboarding."

**Kết quả:** Đăng nhập thành công → vào **Dashboard**. Trên thanh điều hướng hiện badge **Free**.

---

## 2. TẠO CV BẰNG TRỢ LÝ THÔNG MINH (2–3 phút) ⭐ điểm nhấn

**Thao tác:** Dashboard → **Tạo CV mới** → điền tên file → vào trình soạn thảo 2 cột (trái nhập liệu, phải xem trước trực tiếp).

Demo lần lượt (nhấn mạnh triết lý *"không bắt người dùng đối mặt ô trống"*):

1. **Thông tin cá nhân** — nhập tên, email, SĐT → xem preview cập nhật realtime.
2. **Kỹ năng:** chọn **ngành** (vd CNTT) → hiện chip kỹ năng theo ngành (Java, React, Git...) → **bấm chọn thay vì gõ**. Bấm **"💡 Cần gợi ý?"** để thêm nhanh bộ kỹ năng phổ biến.
   - **Nói:** "Chọn ngành khác như Marketing thì bộ gợi ý đổi theo — sinh viên không còn bí ý tưởng."
3. **Dự án:** bấm **"🚀 Dùng trợ lý"** → wizard hỏi từng bước (tên → vai trò → công nghệ → tính năng) → **AI tự sinh mô tả bullet** chuyên nghiệp.
4. **Hoạt động & Thành tích:** bấm **"💡 Gợi ý"** → chọn thẻ (CLB, tình nguyện...) + tích thành tích (GPA, học bổng) → tự sinh câu.
5. **Trợ lý hoàn thiện CV:** chỉ lên thanh điểm + gợi ý **"+điểm"** (vd "Thêm kỹ năng +5").

**Kết quả:** CV được dựng nhanh, preview đẹp; điểm hoàn thiện tăng dần. Bấm **Lưu CV**.

---

## 3. XEM CV & ĐỔI MẪU (1 phút)

**Thao tác:** Mở CV → trang xem có **live preview lớn** + panel bên phải.

1. Bấm **"Đổi mẫu"** → mở thư viện 10 mẫu (Classic, Modern Tech, Creative, Neo-Brutal, Gradient, Sidebar...). Mẫu có nhãn **Pro** đang khóa.
2. Chọn mẫu **Free** → preview đổi ngay.
3. Bấm **"Tải PDF"** → mở file PDF **có watermark "TẠO BỞI CV AI FPT"** (vì đang Free).

**Nói:** "Tài khoản Free dùng 2 mẫu cơ bản và PDF có watermark. Các mẫu đẹp và PDF sạch dành cho Pro — lát nữa mình sẽ mở khóa."

---

## 4. KHÁM PHÁ FPT + INSIDER SECRETS (1 phút)

**Thao tác:** Menu **"Khám phá FPT"** → lưới các công ty con → mở 1 công ty (vd **FPT Software**).

**Nói:** "Ngoài dựng CV, tụi em giúp sinh viên hiểu nơi mình ứng tuyển: lĩnh vực, văn hóa, vị trí tuyển. Đặc biệt là mục **🔓 FPT Insider Secrets** — bí mật thực chiến về quy trình phỏng vấn, luật ngầm văn hóa STCo, đặc thù công việc."

**Kết quả:** Trang chi tiết + khối Insider Secrets nổi bật.

---

## 5. AI JOB MATCH — TÌM VIỆC TỪ CV (2 phút) ⭐ điểm nhấn

**Thao tác:** Từ CV → **Match JD** → tab **"Việc phù hợp"** (tự chạy).

1. Hệ thống **đọc CV → gợi ý danh sách việc thật** (từ LinkedIn qua dịch vụ AI), kèm banner "AI đọc CV của bạn".
2. Bấm 1 việc → AI phân tích độ khớp → hiện **điểm khớp % lớn + câu hook** ("Khớp 72% — cao hơn ~70% ứng viên...").
3. Bấm **"Xem chi tiết"** → hiện **ô khóa 🔒 "Nâng cấp Pro"** (vì đang Free).
   - **Nói:** "Free thấy điểm và hook để biết mình đứng ở đâu. Muốn xem lý do phù hợp, thư xin việc và mẹo phỏng vấn thì cần Pro — đây là điểm bán hàng."
4. (Tùy chọn) Chỉ tab **"Dán JD thủ công"** cho ai đã có JD sẵn.

**Dự phòng:** Nếu API gợi ý việc chậm/không ra, chuyển ngay sang tab **Dán JD thủ công** với JD chuẩn bị sẵn.

---

## 6. NÂNG CẤP PRO — THANH TOÁN (1–2 phút)

**Thao tác:** Bấm **"Nâng cấp Pro"** (từ ô khóa hoặc menu) → trang gói.

1. Bấm **"Lên đời Pro"** → hệ thống **tạo đơn hàng** → sang trang **Checkout**.
2. Hiện **mã VietQR** + số tiền. **Nói:** "Sinh viên quét mã chuyển khoản."
3. Nhập **mã giao dịch ngân hàng** vào ô → bấm **"Tôi đã chuyển khoản"**.
4. Màn hình báo **"Đã gửi — chờ admin đối soát"** (KHÔNG tự lên Pro ngay).

**Nói:** "Quan trọng: hệ thống KHÔNG tự nâng cấp. Đơn chuyển sang trạng thái *chờ duyệt* để admin đối soát tiền thật — chống gian lận."

**Kết quả:** Vào **Đơn hàng** thấy trạng thái **"Đang duyệt"**.

---

## 7. LUỒNG ADMIN — DUYỆT ĐƠN (1–2 phút) ⭐ điểm nhấn

**Thao tác:** Chuyển sang cửa sổ **admin** → đăng nhập tài khoản admin → menu **"🛠 Admin"** → **Quản lý Đơn hàng**.

1. Tab **"Chờ duyệt"** → thấy đơn của user vừa tạo (mã đơn, email, số tiền, **mã giao dịch**).
2. **Nói:** "Admin đối chiếu mã giao dịch + số tiền trong app ngân hàng của mình."
3. Bấm **"✓ Duyệt"** → xác nhận → đơn chuyển **"Đã duyệt"**, tài khoản user được nâng lên **Pro 30 ngày**.
4. (Giới thiệu thêm) **Quản lý User:** admin có thể **cấp/thu hồi Pro thủ công** cho bất kỳ tài khoản nào; và có thể **Từ chối** đơn kèm lý do.

**Kết quả:** User giờ là **Pro**.

---

## 8. QUAY LẠI USER — TRẢI NGHIỆM PRO (1–2 phút) ⭐ chốt hạ

**Thao tác:** Về cửa sổ **user** → tải lại trang. Badge đổi thành **Pro · 30 ngày**.

Mở lại các tính năng vừa bị khóa:
1. **Đổi mẫu:** giờ chọn được **mọi mẫu Premium** → **Tải PDF sạch (không watermark)**.
2. **Match JD:** bấm lại 1 việc → **"Xem chi tiết"** giờ mở đầy đủ: **Vì sao phù hợp**, **kỹ năng khớp/thiếu**, **✉️ Thư xin việc soạn sẵn** (có nút Copy), **💡 Mẹo phỏng vấn**.
3. **AI tối ưu văn phong:** trong ô mô tả dự án bấm **🪄 AI** → viết lại chuyên nghiệp.
4. (Nếu có) **Nhân bản CV**, trang **Cover Letter** riêng.

**Nói:** "Sau khi lên Pro, toàn bộ bộ đồ nghề đi xin việc được mở khóa: mẫu đẹp, PDF sạch, và quan trọng nhất là thư xin việc + mẹo phỏng vấn AI cho từng công ty."

---

## 9. CÁC MỤC PHỤ (nếu còn thời gian — 30 giây)

- **Tài khoản:** đổi tên hiển thị / email / mật khẩu.
- **Lịch sử Match** và **Lịch sử Đơn hàng**.
- **Góp ý** gửi phản hồi.

---

## 10. GỢI Ý TRÌNH BÀY & DỰ PHÒNG

- **Thứ tự vàng:** Tạo CV thông minh → Match việc từ CV (chạm giới hạn Free) → Thanh toán → Admin duyệt → Mở khóa Pro. Đây là câu chuyện *"vấn đề → giá trị → mô hình kinh doanh"* rõ ràng nhất.
- **Nhấn 3 điểm khác biệt:** (1) trợ lý xóa "nỗi sợ trang trắng", (2) tìm việc thật từ CV + phân tích AI, (3) Insider Secrets về FPT.
- **Dự phòng AI chậm:** làm nóng trước; nếu treo, dùng tab Dán JD thủ công / chuyển sang mục khác rồi quay lại.
- **Dự phòng thanh toán:** đã chuẩn bị sẵn 1 đơn "chờ duyệt" từ trước để nếu tạo đơn mới bị lỗi vẫn có cái để admin duyệt.
- **Câu chốt:** "Từ một CV, sinh viên biết mình hợp việc gì, thiếu gì, và có ngay thư xin việc để nộp — tất cả trong một chỗ."

---

*Ghi chú kỹ thuật: bản demo phản ánh hệ thống hiện tại (2 mức Free/Pro). Mô hình 3 gói (0đ / 9k / 19k) là kế hoạch mở rộng, chưa triển khai trong bản demo này.*
