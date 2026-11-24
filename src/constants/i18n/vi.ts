/** Vietnamese UI dictionary. Keep all user-facing text here. */
export const vi = {
  appName: "SLMS – Quản Lý Logistics Thông Minh",
  appShort: "SLMS",
  company: "Công ty Logistics ABC",
  nav: {
    dashboard: "Dashboard",
    orders: "Đơn hàng",
    warehouse: "Kho",
    fleet: "Phương tiện",
    dispatch: "Điều phối",
    reports: "Báo cáo",
    admin: "Quản trị",
    driver: "Chuyến của tôi",
    tracking: "Tra cứu đơn",
  },
  common: {
    save: "Lưu",
    cancel: "Hủy",
    confirm: "Xác nhận",
    search: "Tìm kiếm",
    loading: "Đang tải…",
    noData: "Không có dữ liệu",
    logout: "Đăng xuất",
  },
  errors: {
    required: "Trường này là bắt buộc",
    phone: "Số điện thoại không hợp lệ",
    positive: "Giá trị phải lớn hơn 0",
    forbidden: "Không có quyền truy cập",
    notFound: "Không tìm thấy dữ liệu",
  },
} as const;
