/** FR25 – reasons a driver can pick when a delivery fails. */
export const FAIL_REASONS = [
  "Người nhận không nghe máy",
  "Người nhận hẹn giao lại",
  "Sai địa chỉ",
  "Người nhận từ chối nhận hàng",
  "Không vào được khu vực giao",
  "Hàng hư hỏng",
] as const;

/** FR27 – SMS templates (mocked gateway). */
export const SMS_TEMPLATES = {
  assigned: (code: string, plate: string) => `SLMS: Don ${code} da duoc xep len xe ${plate}, se giao trong ngay.`,
  delivering: (code: string, eta: string) => `SLMS: Don ${code} dang duoc giao, du kien den luc ${eta}.`,
  otp: (code: string, otp: string) => `SLMS: Ma xac nhan nhan hang don ${code} la ${otp}. Hieu luc 30 phut. Chi dua ma cho tai xe khi da nhan hang.`,
  delivered: (code: string) => `SLMS: Don ${code} da giao thanh cong. Cam on quy khach.`,
  failed: (code: string, reason: string) => `SLMS: Don ${code} chua giao duoc (${reason}). Chung toi se lien he giao lai.`,
  returned: (code: string) => `SLMS: Don ${code} khong giao duoc sau nhieu lan, hang duoc hoan ve kho.`,
};

/** Opens turn-by-turn navigation in the phone's map app (FR22, TC33). */
export const navigationUrl = (lat: number, lng: number) => `https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}&travelmode=driving`;

export const PHOTO_MAX_SIZE = 720; // px, longest side after compression
