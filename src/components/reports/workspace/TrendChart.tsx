"use client";
import { CartesianGrid, Legend, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import type { DashboardData } from "@/types/report";
import { CHART } from "@/constants/reports";

const short = (day: string) => `${day.slice(8, 10)}/${day.slice(5, 7)}`;

/** 7-day trend: orders created vs delivered (same unit, one axis) and on-time rate as its own chart. */
export function TrendChart({ d }: { d: DashboardData }) {
  const rows = d.trend.map((t) => ({ ...t, label: short(t.day), onTime: t.onTimeRate === null ? null : Math.round(t.onTimeRate * 1000) / 10 }));
  return (
    <div className="grid gap-3 lg:grid-cols-2">
      <div className="rounded-xl border bg-white p-4">
        <h3 className="mb-2 text-sm font-semibold text-slate-700">Số đơn 7 ngày gần nhất</h3>
        <ResponsiveContainer width="100%" height={240}>
          <LineChart data={rows} margin={{ top: 8, right: 12, left: -8, bottom: 0 }}>
            <CartesianGrid vertical={false} stroke={CHART.grid} />
            <XAxis dataKey="label" tick={{ fontSize: 11, fill: CHART.axis }} tickLine={false} axisLine={{ stroke: CHART.grid }} />
            <YAxis tick={{ fontSize: 11, fill: CHART.axis }} tickLine={false} axisLine={false} />
            <Tooltip />
            <Legend iconType="plainline" wrapperStyle={{ fontSize: 12 }} />
            <Line type="monotone" dataKey="created" name="Đơn tạo" stroke={CHART.series1} strokeWidth={2} dot={{ r: 4 }} activeDot={{ r: 6 }} />
            <Line type="monotone" dataKey="delivered" name="Đơn đã giao" stroke={CHART.series2} strokeWidth={2} dot={{ r: 4 }} activeDot={{ r: 6 }} />
          </LineChart>
        </ResponsiveContainer>
      </div>
      <div className="rounded-xl border bg-white p-4">
        <h3 className="mb-2 text-sm font-semibold text-slate-700">Tỷ lệ giao đúng hẹn (%)</h3>
        <ResponsiveContainer width="100%" height={240}>
          <LineChart data={rows} margin={{ top: 8, right: 12, left: -8, bottom: 0 }}>
            <CartesianGrid vertical={false} stroke={CHART.grid} />
            <XAxis dataKey="label" tick={{ fontSize: 11, fill: CHART.axis }} tickLine={false} axisLine={{ stroke: CHART.grid }} />
            <YAxis domain={[80, 100]} tick={{ fontSize: 11, fill: CHART.axis }} tickLine={false} axisLine={false} />
            <Tooltip formatter={(v) => [`${v}%`, "Đúng hẹn"]} />
            <Line type="monotone" dataKey="onTime" name="Đúng hẹn" stroke={CHART.series1} strokeWidth={2} dot={{ r: 4 }} activeDot={{ r: 6 }} connectNulls />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
