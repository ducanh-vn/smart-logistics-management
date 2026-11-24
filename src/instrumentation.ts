/**
 * Runs once when the server starts. Business days (today's orders, dashboard, trips) are
 * computed in Vietnam time even on hosts that run in UTC, such as Vercel.
 */
export function register() {
  process.env.TZ = process.env.APP_TZ || "Asia/Ho_Chi_Minh";
}
