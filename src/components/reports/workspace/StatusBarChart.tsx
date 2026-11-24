"use client";
import { Bar, BarChart, CartesianGrid, LabelList, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import type { DashboardData } from "@/types/report";
import { ORDER_STATUS_LABELS } from "@/constants/orderStatus";
import { CHART } from "@/constants/reports";

/** Orders of the day by status – one series, so one colour and no legend. */
export function StatusBarChart({ d }: { d: DashboardData }) {
  const order = Object.keys(ORDER_STATUS_LABELS) as (keyof typeof ORDER_STATUS_LABELS)[];
  const rows = order.map((s) => ({ name: ORDER_STATUS_LABELS[s], count: d.ordersByStatus.find((x) => x.status === s)?.count ?? 0 }));
  return (
    <div className="rounded-xl border bg-white p-4">
      <h3 className="mb-2 text-sm font-semibold text-slate-700">Đơn trong ngày theo trạng thái</h3>
      <ResponsiveContainer width="100%" height={260}>
        <BarChart data={rows} margin={{ top: 20, right: 8, left: -12, bottom: 0 }}>
          <CartesianGrid vertical={false} stroke={CHART.grid} />
          <XAxis dataKey="name" tick={{ fontSize: 11, fill: CHART.axis }} interval={0} tickLine={false} axisLine={{ stroke: CHART.grid }} />
          <YAxis allowDecimals={false} tick={{ fontSize: 11, fill: CHART.axis }} tickLine={false} axisLine={false} />
          <Tooltip cursor={{ fill: "#f1f5f9" }} formatter={(v) => [v, "Số đơn"]} />
          <Bar dataKey="count" fill={CHART.series1} radius={[4, 4, 0, 0]} maxBarSize={36}>
            <LabelList dataKey="count" position="top" style={{ fontSize: 11, fill: CHART.text }} />
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
