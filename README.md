# SLMS – Phần mềm Quản Lý Logistics Thông Minh (demo)

Bản chạy thử của bài tập lớn môn **Quản lý dự án phần mềm** – Nhóm 4, Học viện Công nghệ Bưu chính Viễn thông.
Chức năng bám theo tài liệu đặc tả yêu cầu (SLMS-SRS-01) và tài liệu thiết kế (SLMS-TK-01).

## Công nghệ
Next.js (App Router, TypeScript) · Tailwind CSS · Prisma + PostgreSQL · Leaflet + OpenStreetMap · Recharts · Vitest

## Chạy trên máy
Yêu cầu: Node.js 20 trở lên và một CSDL PostgreSQL. Không muốn cài PostgreSQL thì tạo CSDL miễn phí trên Neon
theo bước 1 của [docs/DEPLOY_VERCEL.md](docs/DEPLOY_VERCEL.md) rồi dán chuỗi kết nối vào `.env`.

```bash
npm install
cp .env.example .env        # Windows PowerShell: copy .env.example .env, rồi sửa DATABASE_URL và DIRECT_URL
npm run setup               # tạo bảng và nạp dữ liệu mẫu
npm run dev                 # mở http://localhost:3000
```

Nạp lại dữ liệu từ đầu: `npm run db:reset`. Đưa lên Internet: xem [docs/DEPLOY_VERCEL.md](docs/DEPLOY_VERCEL.md).

## Dữ liệu mẫu
- 3 kho (Hoàng Mai, Bắc Từ Liêm, Long Biên), 80 vị trí lưu trữ mỗi kho
- 50 xe, 60 tài xế, 150 khách hàng
- Lịch sử 7 ngày, khoảng 1.200 đơn/ngày; hôm nay có 300 đơn chờ duyệt và đã duyệt để chạy thử điều phối

## Tài khoản chạy thử (mật khẩu chung: `Slms@2026`)
| Vai trò | Tài khoản |
|---|---|
| Quản trị viên | `admin` |
| Nhà quản lý | `quanly01` |
| Điều phối viên | `dieuphoi01` … `dieuphoi10` |
| Thủ kho | `thukho01` … `thukho12` |
| Tài xế | `taixe01` … `taixe60` |
| Tài khoản mới (bắt buộc đổi mật khẩu) | `nhanvienmoi` |

## Cấu trúc thư mục
Xem `CLAUDE.md`. Tóm tắt: `src/types` (kiểu dữ liệu), `src/constants` (hằng số, dữ liệu tĩnh, tiếng Việt),
`src/lib` (hàm thuần: tính cước, tối ưu tuyến…), `src/services` (nghiệp vụ phía server), `src/hooks`,
`src/components/<tính năng>`, `prisma/` (lược đồ CSDL và dữ liệu mẫu).

## Lưu ý
Dịch vụ SMS/OTP được giả lập: mã OTP hiển thị trên màn hình và ghi ra console thay vì gửi tin nhắn thật.

## Bảo mật khi đưa lên mạng
Khi triển khai công khai (ví dụ Vercel), đặt các biến môi trường sau:

| Biến | Giá trị |
|---|---|
| `AUTH_SECRET` | Chuỗi ngẫu nhiên ít nhất 32 ký tự (`openssl rand -hex 32`). Bản production từ chối chạy nếu thiếu hoặc còn giá trị mẫu. |
| `NEXT_PUBLIC_DEMO_MODE` | `0` để ẩn tài khoản chạy thử ở trang đăng nhập, không hiện mã OTP trên app tài xế và tắt mô phỏng GPS. Để `1` nếu muốn cho giảng viên chạy thử. |
| `SEED_PASSWORD` | Mật khẩu cho mọi tài khoản mẫu khi chạy seed trên CSDL thật, thay cho `Slms@2026`. |

Các lớp bảo vệ đã có: mật khẩu băm bcrypt, khóa tài khoản 15 phút sau 5 lần sai, phiên ký JWT trong cookie httpOnly,
kiểm tra quyền ở middleware và từng API, khóa hoặc đổi vai trò người dùng có hiệu lực ngay, OTP băm và giới hạn 5 lần nhập,
chặn chuyển hướng ra ngoài sau đăng nhập, giới hạn kích thước ảnh và file Excel, các header chống nhúng trang (X-Frame-Options, HSTS…).

## Chức năng đã có
- **Đơn hàng** (`dieuphoi01`): tạo đơn với cước tự tính (BR01), nhập Excel theo file mẫu, duyệt hoặc hủy nhiều đơn (BR07), xem chi tiết và lịch sử trạng thái.
- **Kho** (`thukho01`): tồn kho theo vị trí, tìm theo vị trí (ví dụ `A-01-03`), nhập kho và xuất kho bằng quét mã vạch (máy quét USB gõ mã rồi Enter), kiểm kê có duyệt, danh sách chứng từ, in phiếu.
  - Thử TC04: xuất `MV001` số lượng 25 ở Kho 1 sẽ bị từ chối (tồn 20).
  - Thử TC24: xuất 2 `MV002` sẽ hiện cảnh báo dưới mức tối thiểu.
  - Thử TC22: phiếu kiểm kê do `thukho01` lập phải được người khác duyệt (đăng nhập `thukho02` hoặc `admin`).
  - Ô `A-01-03` của mỗi kho để trống sẵn cho TC23.
- **Phương tiện** (`dieuphoi01`): hồ sơ xe (thêm, sửa), lịch bảo dưỡng nhắc trước 7 ngày, xe đến hạn không được phân chuyến, tài xế và ca làm việc.
- **Điều phối** (`dieuphoi01`): chọn kho, bấm *Tối ưu tuyến* (gom cụm theo khu vực, Clarke–Wright, 2-opt, tối đa 35 điểm mỗi chuyến), xem tuyến trên bản đồ, đổi thứ tự hoặc chuyển đơn giữa các xe, chọn tài xế rồi *Xác nhận và gửi lệnh*.
  - Tab *Theo dõi chuyến xe* tự cập nhật mỗi 10 giây. Xe chỉ hiện vị trí khi chuyến đang chạy (sau khi thủ kho xuất kho theo chuyến, hoặc tài xế bắt đầu chuyến).
  - Ô *Mô phỏng GPS* cho xe tự di chuyển trên bản đồ khi chạy thử không có điện thoại tài xế.
  - Bản đồ dùng OpenStreetMap nên máy cần có Internet.
- **App tài xế** (mở `/driver` trên điện thoại, đăng nhập tài khoản tài xế của chuyến, ví dụ `taixe01`): xem chuyến và điểm giao theo thứ tự, *Dẫn đường* mở Google Maps, *Bắt đầu chuyến* (đơn chuyển "Đang giao", gửi GPS 30 giây một lần), *Giao hàng* cần chụp ảnh và nhập OTP người nhận, *Không giao được* chọn lý do và chụp ảnh.
  - OTP 6 số, hiệu lực 30 phút, sai quá 5 lần phải gửi mã mới. Vì SMS là giả lập nên mã hiện ngay trên màn hình tài xế.
  - Giao lỗi lần 1, 2 thì đơn về "Giao lại" để điều phối lại; lần 3 thì "Hoàn kho".
- **Tra cứu đơn** (`/tracking`, không cần đăng nhập): nhập mã đơn và SĐT người nhận để xem trạng thái, giờ dự kiến, vị trí xe và các tin SMS đã gửi.
- **Dashboard và Báo cáo** (`quanly01`): số đơn theo trạng thái, tỷ lệ giao đúng hẹn, xe hoạt động, xu hướng 7 ngày; báo cáo hiệu suất theo xe, xuất Excel và PDF.
- **Quản trị** (`admin`): tạo, khóa người dùng và đổi vai trò; sửa bảng giá cước; tham số hệ thống (mức tồn tối thiểu mặc định…); nhật ký thao tác.

## Kịch bản chạy thử
Xem [docs/KICH_BAN_CHAY_THU.md](docs/KICH_BAN_CHAY_THU.md): các bước demo theo một ngày làm việc, đối chiếu với mã ca kiểm thử.
