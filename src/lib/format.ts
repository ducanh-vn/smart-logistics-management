const vnd = new Intl.NumberFormat("vi-VN");

export const formatVnd = (value: number): string => `${vnd.format(Math.round(value))} đ`;
export const formatNumber = (value: number, digits = 0): string =>
  new Intl.NumberFormat("vi-VN", { maximumFractionDigits: digits }).format(value);

export const formatDate = (value: Date | string): string =>
  new Date(value).toLocaleDateString("vi-VN", { day: "2-digit", month: "2-digit", year: "numeric" });

const pad = (n: number) => String(n).padStart(2, "0");

/** "HH:mm dd/MM/yyyy" in the server/browser local time. */
export const formatDateTime = (value: Date | string): string => {
  const d = new Date(value);
  return `${pad(d.getHours())}:${pad(d.getMinutes())} ${pad(d.getDate())}/${pad(d.getMonth() + 1)}/${d.getFullYear()}`;
};

/** Masks a phone number for display on the driver app (NFR12): 0912xxx123. */
export const maskPhone = (phone: string): string =>
  phone.length < 7 ? phone : `${phone.slice(0, 4)}xxx${phone.slice(-3)}`;

/** Order code DHyyMMdd + 4 digits (design doc, table DON_HANG). */
export const orderCode = (date: Date, seq: number): string => {
  const y = String(date.getFullYear()).slice(-2);
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `DH${y}${m}${d}${String(seq).padStart(4, "0")}`;
};
