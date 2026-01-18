"use client";

import { useEffect, useMemo, useState } from "react";

type AdminSummary = {
  totalOrders: number;
  pendingPaymentOrders: number;
  paidOrders: number;
  cancelledOrders: number;
  paidRevenue: string | number;
};

function extractMessage(value: unknown): string | undefined {
  if (value && typeof value === "object" && "message" in value) {
    const msg = (value as { message?: unknown }).message;
    return typeof msg === "string" ? msg : undefined;
  }
  return undefined;
}

function formatNumber(value: string | number) {
  const n = typeof value === "number" ? value : Number(value);
  if (Number.isFinite(n)) return new Intl.NumberFormat("id-ID").format(n);
  return String(value);
}

function StatCard({ title, value, subtitle }: { title: string; value: string; subtitle?: string }) {
  return (
    <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-xs">
      <div className="text-sm text-gray-500">{title}</div>
      <div className="mt-2 text-2xl font-semibold text-gray-900">{value}</div>
      {subtitle ? <div className="mt-2 text-xs text-gray-500">{subtitle}</div> : null}
    </div>
  );
}

export default function AdminDashboardPage() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [summary, setSummary] = useState<AdminSummary | null>(null);

  useEffect(() => {
    let cancelled = false;
    async function run() {
      setLoading(true);
      setError(null);
      try {
        const res = await fetch("/api/admin/summary");
        const text = await res.text();
        const data: unknown = text ? JSON.parse(text) : null;
        if (!res.ok) {
          const msg = extractMessage(data) ?? `Request failed (${res.status})`;
          throw new Error(msg);
        }
        if (!cancelled) setSummary(data as AdminSummary);
      } catch (e) {
        if (!cancelled) setError(e instanceof Error ? e.message : "Failed to load summary");
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    run();
    return () => {
      cancelled = true;
    };
  }, []);

  const revenue = useMemo(() => {
    if (!summary) return "Rp 0";
    return `Rp ${formatNumber(summary.paidRevenue)}`;
  }, [summary]);

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col items-start justify-between gap-2 sm:flex-row sm:items-center">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-gray-900">Dashboard</h1>
          <p className="mt-1 text-sm text-gray-500">Summary of your store performance.</p>
        </div>
      </div>

      {loading ? <div className="text-sm text-gray-500">Loading...</div> : null}
      {error ? <div className="rounded-md bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div> : null}

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Total Sales"
          value={summary ? formatNumber(summary.paidOrders) : "-"}
          subtitle="Paid orders count"
        />
        <StatCard
          title="Total Orders"
          value={summary ? formatNumber(summary.totalOrders) : "-"}
          subtitle="All orders"
        />
        <StatCard title="Revenue" value={summary ? revenue : "-"} subtitle="Paid revenue" />
        <StatCard title="Total Visitors" value={"-"} subtitle="Placeholder" />
        <StatCard title="Refunded" value={"-"} subtitle="Placeholder" />
      </div>

      {summary ? (
        <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-xs">
          <h2 className="text-sm font-semibold text-gray-900">Orders breakdown</h2>
          <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-3">
            <div className="rounded-lg bg-gray-50 p-3">
              <div className="text-xs text-gray-500">Pending payment</div>
              <div className="mt-1 text-lg font-semibold text-gray-900">{formatNumber(summary.pendingPaymentOrders)}</div>
            </div>
            <div className="rounded-lg bg-gray-50 p-3">
              <div className="text-xs text-gray-500">Paid</div>
              <div className="mt-1 text-lg font-semibold text-gray-900">{formatNumber(summary.paidOrders)}</div>
            </div>
            <div className="rounded-lg bg-gray-50 p-3">
              <div className="text-xs text-gray-500">Cancelled</div>
              <div className="mt-1 text-lg font-semibold text-gray-900">{formatNumber(summary.cancelledOrders)}</div>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
