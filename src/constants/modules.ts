/** Modules shown on the home page; FR ranges follow the SRS. */
export const MODULE_CARDS = [
  { href: "/orders", title: "Quản lý đơn hàng", desc: "Tạo, nhập Excel, duyệt, tính cước", fr: "FR01 – FR06" },
  { href: "/warehouse", title: "Quản lý kho bãi", desc: "Nhập, xuất, kiểm kê, vị trí lưu trữ", fr: "FR07 – FR12" },
  { href: "/fleet", title: "Phương tiện, tài xế", desc: "Hồ sơ xe, bảo dưỡng, ca làm việc", fr: "FR13 – FR15" },
  { href: "/dispatch", title: "Điều phối, tối ưu tuyến", desc: "Phân xe, tối ưu lộ trình, theo dõi bản đồ", fr: "FR16 – FR20" },
  { href: "/driver", title: "Ứng dụng tài xế", desc: "Nhận chuyến, xác nhận giao bằng OTP", fr: "FR21 – FR25" },
  { href: "/tracking", title: "Tra cứu đơn hàng", desc: "Cổng tra cứu cho khách hàng", fr: "FR26 – FR27" },
  { href: "/dashboard", title: "Dashboard, báo cáo", desc: "Số liệu vận hành, báo cáo hiệu suất", fr: "FR28 – FR30" },
  { href: "/admin", title: "Quản trị hệ thống", desc: "Người dùng, phân quyền, bảng giá, nhật ký", fr: "FR31 – FR34" },
] as const;
