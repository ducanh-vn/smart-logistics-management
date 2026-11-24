# Kịch bản chạy thử SLMS (bản demo Nhóm 4)

Kịch bản đi theo một ngày làm việc, từ lúc nhận đơn đến lúc giao xong và xem báo cáo. Mỗi bước ghi mã ca kiểm thử (TC) tương ứng trong tài liệu *Kịch bản kiểm thử*.

## 0. Chuẩn bị (khoảng 2 phút)

```bash
npm install
# Lần đầu: npm run setup. Đã chạy trước đó thì dùng npm run db:reset để làm mới dữ liệu
npm run setup      # tạo CSDL và dữ liệu mẫu: 3 kho, 50 xe, 60 tài xế, 7 ngày lịch sử, 300 đơn hôm nay
npm run dev        # mở http://localhost:3000
```

Mật khẩu chung cho mọi tài khoản: `Slms@2026`. Nên mở 3 cửa sổ trình duyệt (một cửa sổ thường, hai cửa sổ ẩn danh) để đăng nhập ba vai trò cùng lúc. App tài xế nên mở bằng chế độ điện thoại của trình duyệt (F12, biểu tượng điện thoại) hoặc bằng điện thoại thật cùng mạng Wi-Fi.

## 1. Đăng nhập và phân quyền

| Bước | Thao tác | Kết quả mong đợi | TC |
|---|---|---|---|
| 1.1 | Đăng nhập `dieuphoi01` | Vào màn hình Đơn hàng | TC08 |
| 1.2 | Đăng nhập `dieuphoi02` với mật khẩu sai 5 lần, lần 6 nhập đúng | Báo sai mật khẩu, sau lần 5 bị khóa 15 phút, lần 6 vẫn bị từ chối | TC09, TC10 |
| 1.3 | Đăng nhập `nhanvienmoi` | Bắt buộc đổi mật khẩu trước khi dùng | TC11 |
| 1.4 | Đăng nhập `taixe01`, gõ địa chỉ `/warehouse` | Trang "Không có quyền truy cập" | TC07 |

## 2. Đơn hàng (`dieuphoi01`)

| Bước | Thao tác | Kết quả mong đợi | TC |
|---|---|---|---|
| 2.1 | *+ Tạo đơn*: người nhận "Nguyễn Văn B", SĐT 0912345123, Đống Đa, 12 kg | Cước tạm tính 65.000 đ; lưu xong đơn ở "Chờ duyệt" | TC01, TC13 |
| 2.2 | Tạo đơn nhưng bỏ trống SĐT | Báo lỗi ngay tại ô SĐT, không lưu | TC02 |
| 2.3 | *Nhập Excel*: tải file mẫu, điền vài dòng (cố ý để trống địa chỉ 1 dòng), tải lên | Dòng đúng được tạo; dòng sai báo số dòng và lỗi | TC14, TC15 |
| 2.4 | Lọc "Chờ duyệt", tích chọn vài đơn, bấm *Duyệt* | Đơn chuyển "Đã duyệt" | TC16 |
| 2.5 | Bấm vào một đơn | Bảng chi tiết bên phải có lịch sử trạng thái, người thực hiện, thời điểm | TC18 |

## 3. Phương tiện (`dieuphoi01`, menu Phương tiện)

| Bước | Thao tác | Kết quả mong đợi | TC |
|---|---|---|---|
| 3.1 | *+ Thêm xe* 29C-345.67, loại "Tải 1,5 tấn", ngày bảo dưỡng sau 2 tháng | Xe mới ở trạng thái "Sẵn sàng" | TC25 |
| 3.2 | Mở tab *Bảo dưỡng* | 1 xe đến hạn hôm nay (đang bảo dưỡng) và các xe sắp đến hạn trong 7 ngày | TC26 |

## 4. Điều phối (`dieuphoi01`, menu Điều phối)

| Bước | Thao tác | Kết quả mong đợi | TC |
|---|---|---|---|
| 4.1 | Chọn *Kho 1*, ô *Số đơn* nhập 50, tích chọn 5 xe, bấm *Tối ưu tuyến* | Có kết quả dưới 1 giây; không xe nào vượt tải (thanh tải màu xanh) | TC03 |
| 4.2 | Bấm *Làm lại*, để trống các ô, bấm *Tối ưu tuyến* (dùng mọi xe) | Xe đến hạn bảo dưỡng không xuất hiện trong kết quả | TC26 |
| 4.3 | Bấm vào một xe, chuyển 1 đơn sang xe khác, bấm ↑ ↓ đổi thứ tự | Quãng đường, thời gian tính lại; quá tải thì thanh tải đỏ và nút xác nhận bị khóa | TC30 |
| 4.4 | Bấm *Xác nhận và gửi lệnh* | Các chuyến chuyển "Đã gửi lệnh", đơn chuyển "Đã phân xe". **Ghi lại mã tài xế (TXnn) của một chuyến**, tài khoản app là `taixenn` | TC31 |
| 4.5 | Tạo lại một kế hoạch có tài xế vừa được giao chuyến | Tài xế đang có chuyến không còn trong danh sách chọn | TC27 |

## 5. Kho (`thukho01`)

| Bước | Thao tác | Kết quả mong đợi | TC |
|---|---|---|---|
| 5.1 | Tab *Xuất kho*, quét (gõ rồi Enter) `MV001`, sửa số lượng 25, xác nhận | Từ chối "Vượt số lượng tồn"; tồn vẫn 20 | TC04 |
| 5.2 | Xuất 2 `MV002` | Xuất được, hiện cảnh báo dưới mức tối thiểu | TC24 |
| 5.3 | Chọn chuyến ở bước 4.4 trong ô *Chuyến xe*, quét vài mã, xác nhận | Tồn kho giảm; đơn của chuyến chuyển "Đang giao"; có liên kết *In phiếu xuất* | TC20, TC21 |
| 5.4 | Tab *Nhập kho*, quét mã mới `MV011`, nhập tên, chọn ô `A-01-03`, lưu. Tab *Tồn kho* tìm vị trí `A-01-03` | Hàng nằm đúng ô | TC19, TC23 |
| 5.5 | Tab *Kiểm kê*, nhập thực tế `MV003` ít hơn tồn 2 đơn vị, trình duyệt. Đăng nhập `thukho02`, tab *Chứng từ*, bấm *Duyệt* | Tồn chỉ giảm 2 sau khi được duyệt (người lập không tự duyệt được) | TC22 |

## 6. App tài xế (`taixenn` của bước 4.4, mở `/driver`)

| Bước | Thao tác | Kết quả mong đợi | TC |
|---|---|---|---|
| 6.1 | Mở app | Thấy chuyến, điểm giao đúng thứ tự, đủ thông tin người nhận | TC32 |
| 6.2 | Bấm *Dẫn đường* ở điểm 1 | Mở Google Maps tới đúng điểm | TC33 |
| 6.3 | Nếu chuyến chưa xuất kho: bấm *Đã nhận hàng, bắt đầu chuyến*. Cho phép trình duyệt lấy vị trí | Đơn chuyển "Đang giao", app báo đang gửi GPS | TC05 |
| 6.4 | Bên `dieuphoi01`: *Điều phối* → *Theo dõi chuyến xe* (bật *Mô phỏng GPS* nếu không di chuyển thật) | Xe hiện trên bản đồ, tự cập nhật mỗi 10 giây | TC05 |
| 6.5 | *Giao hàng* điểm 1: chụp ảnh, *Gửi mã OTP*, nhập `111111` | Báo "OTP không đúng", cho nhập lại | TC06 |
| 6.6 | Nhập đúng mã hiện trên màn hình (SMS giả lập), *Xác nhận đã giao* | Đơn "Đã giao" | TC34 |
| 6.7 | *Không giao được* điểm 2: chọn lý do, chụp ảnh | Đơn chuyển "Giao lại" | TC36 |

## 7. Khách hàng tra cứu (`/tracking`, không đăng nhập)

| Bước | Thao tác | Kết quả mong đợi | TC |
|---|---|---|---|
| 7.1 | Nhập mã đơn của điểm 1 và đúng SĐT người nhận | Thấy trạng thái, lịch sử, các tin SMS đã nhận (kể cả tin "đã giao") | TC37, TC38 |
| 7.2 | Nhập sai SĐT | Báo không tìm thấy | TC37 |

## 8. Báo cáo và quản trị

| Bước | Thao tác | Kết quả mong đợi | TC |
|---|---|---|---|
| 8.1 | `quanly01` mở *Dashboard*, chọn ngày hôm qua | Khoảng 1.200 đơn, tỷ lệ đúng hẹn khoảng 95% | TC39 |
| 8.2 | *Báo cáo*: xem 7 ngày, bấm *Xuất Excel* và *Xuất PDF* (chọn "Lưu dưới dạng PDF") | File mở được, tiếng Việt đúng, số liệu khớp màn hình | TC40, TC41 |
| 8.3 | `admin` → *Quản trị* → *Người dùng*: tạo `tk01` vai trò Thủ kho. Đăng nhập `tk01` | Phải đổi mật khẩu, sau đó chỉ thấy menu của Thủ kho | TC11, TC12 |
| 8.4 | *Bảng giá cước*: nội thành 30.000 thành 32.000, lưu. Tạo đơn mới 12 kg nội thành | Đơn mới 67.000 đ; đơn cũ giữ nguyên | TC43 |
| 8.5 | *Nhật ký thao tác* | Có dòng sửa bảng giá với giá trị cũ, giá trị mới, người, thời điểm | TC42 |

## Ghi chú

- SMS và OTP là giả lập: tin nhắn được lưu và hiện ở trang tra cứu, mã OTP hiện trên app tài xế.
- Bản đồ dùng OpenStreetMap nên cần Internet. Khoảng cách là đường chim bay nhân hệ số 1,3, không gọi API bản đồ trả phí.
- Các ca kiểm thử phi chức năng (TC44 tải 200 người dùng, TC45 HTTPS, TC46 sao lưu, TC47 thiết bị) thuộc môi trường triển khai thật, không nằm trong bản demo.
