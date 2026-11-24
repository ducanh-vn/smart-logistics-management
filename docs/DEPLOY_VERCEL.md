# Đưa SLMS lên Internet (Neon + Vercel)

SLMS dùng PostgreSQL. Cách gọn nhất là dùng **Neon** (PostgreSQL miễn phí) làm CSDL và **Vercel** để chạy web.
Cả hai đều có gói miễn phí, đủ cho bản demo. Tổng thời gian khoảng 15 phút.

## 1. Tạo CSDL trên Neon

1. Vào https://neon.tech, đăng nhập bằng GitHub, bấm **New Project**.
2. Đặt tên `slms`, chọn **Region: AWS Asia Pacific (Singapore)** cho gần Việt Nam, Postgres 16 hoặc 17, bấm **Create**.
3. Trong hộp **Connection string**, chép ra hai chuỗi:
   - Bật **Connection pooling**: chuỗi có `-pooler` trong tên máy → dùng cho `DATABASE_URL`.
   - Tắt **Connection pooling**: chuỗi không có `-pooler` → dùng cho `DIRECT_URL`.

## 2. Nạp dữ liệu mẫu từ máy của bạn

Mở file `.env` trên máy, thay hai dòng đầu bằng hai chuỗi vừa chép (giữ nguyên dấu ngoặc kép):

```env
DATABASE_URL="postgresql://...-pooler.ap-southeast-1.aws.neon.tech/neondb?sslmode=require"
DIRECT_URL="postgresql://....ap-southeast-1.aws.neon.tech/neondb?sslmode=require"
```

Rồi chạy:

```bash
npm install
npm run setup        # tạo bảng và nạp dữ liệu mẫu lên Neon, khoảng 1–2 phút
npm run dev          # chạy thử trên máy, lúc này máy cũng dùng CSDL Neon
```

Muốn đặt mật khẩu riêng cho các tài khoản mẫu thay cho `Slms@2026`, thêm `SEED_PASSWORD="..."` vào `.env` trước khi chạy `npm run setup`.

> Dữ liệu "hôm nay" (300 đơn để chạy điều phối) gắn với ngày chạy seed. Trước buổi demo, chạy `npm run db:reset` để làm mới.

## 3. Deploy lên Vercel

1. Push code lên GitHub (file `.env` đã nằm trong `.gitignore`, không bị đẩy lên).
2. Vào https://vercel.com → **Add New… → Project** → chọn repo `smart-logistics-management` → **Import**.
3. Framework tự nhận là Next.js. Mở **Environment Variables** và thêm:

   | Tên | Giá trị |
   |---|---|
   | `DATABASE_URL` | chuỗi Neon có `-pooler` |
   | `DIRECT_URL` | chuỗi Neon không có `-pooler` |
   | `AUTH_SECRET` | chuỗi ngẫu nhiên ≥ 32 ký tự, ví dụ kết quả của `openssl rand -hex 32` |
   | `NEXT_PUBLIC_DEMO_MODE` | `1` nếu muốn giảng viên thấy tài khoản chạy thử và mã OTP trên màn hình; `0` nếu để công khai |

4. Bấm **Deploy**. Xong sẽ có địa chỉ dạng `https://smart-logistics-management-xxx.vercel.app`.
5. (Nên làm) **Settings → Functions → Function Region** chọn **Singapore (sin1)** cho cùng vùng với Neon, rồi **Redeploy**. App sẽ nhanh hơn rõ rệt.

Mỗi lần push lên nhánh `main`, Vercel tự build lại. Đổi biến môi trường xong thì phải **Redeploy** mới có hiệu lực
(riêng `NEXT_PUBLIC_DEMO_MODE` được gắn lúc build).

## Lỗi thường gặp

| Hiện tượng | Cách xử lý |
|---|---|
| Build báo `Environment variable not found: DIRECT_URL` | Thiếu biến `DIRECT_URL` trên Vercel. |
| Mở trang báo lỗi 500, log có `AUTH_SECRET must be set` | Đặt `AUTH_SECRET` đủ 32 ký tự rồi Redeploy. |
| Đăng nhập được nhưng danh sách trống | Chưa chạy `npm run setup` trỏ vào Neon (bước 2). |
| `Can't reach database server` | Kiểm tra chuỗi kết nối có `?sslmode=require`; dự án Neon miễn phí tự ngủ khi không dùng, lần mở đầu chậm vài giây là bình thường. |

## Giờ Việt Nam

Máy chủ Vercel chạy giờ UTC. App tự đặt múi giờ `Asia/Ho_Chi_Minh` khi khởi động (`src/instrumentation.ts`)
nên "đơn hôm nay", dashboard và giờ dự kiến trong SMS vẫn tính theo giờ Việt Nam.
