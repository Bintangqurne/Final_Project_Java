"use client"

import { useEffect, useMemo, useState } from "react"
import {
  IconClipboardCheck,
  IconReceiptFilled,
  IconReportMoney,
  IconUserFilled,
} from "@tabler/icons-react"
import StatsCard from "./stats-card"

type AdminSummary = {
  totalOrders?: number
  pendingPaymentOrders?: number
  paidOrders?: number
  cancelledOrders?: number
  paidRevenue?: string | number
  totalUsers?: number
  userCount?: number
  totalUserRoleUser?: number
}

function extractMessage(value: unknown): string | undefined {
  if (value && typeof value === "object" && "message" in value) {
    const msg = (value as { message?: unknown }).message
    return typeof msg === "string" ? msg : undefined
  }
  return undefined
}

function toNumber(value: unknown): number {
  if (typeof value === "number") return Number.isFinite(value) ? value : 0
  if (typeof value === "string") {
    const n = Number(value)
    return Number.isFinite(n) ? n : 0
  }
  return 0
}

export default function Stats() {
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [summary, setSummary] = useState<AdminSummary | null>(null)

  useEffect(() => {
    let cancelled = false
    async function run() {
      setLoading(true)
      setError(null)
      try {
        const res = await fetch("/api/admin/summary")
        const text = await res.text()
        const data: unknown = text ? JSON.parse(text) : null
        if (!res.ok) {
          throw new Error(extractMessage(data) ?? `Request failed (${res.status})`)
        }
        if (!cancelled) setSummary(data as AdminSummary)
      } catch (e) {
        if (!cancelled)
          setError(e instanceof Error ? e.message : "Failed to load summary")
      } finally {
        if (!cancelled) setLoading(false)
      }
    }
    run()
    return () => {
      cancelled = true
    }
  }, [])

  const cards = useMemo(() => {
    const totalOrders = toNumber(summary?.totalOrders)
    const pendingOrders = toNumber(summary?.pendingPaymentOrders)
    const paidRevenue = toNumber(summary?.paidRevenue)
    const totalUsers =
      toNumber(summary?.totalUserRoleUser) ||
      toNumber(summary?.userCount) ||
      toNumber(summary?.totalUsers)

    return [
      {
        label: "Total Sales",
        type: "up" as const,
        percentage: 0,
        stats: paidRevenue,
        sign: "money" as const,
        profit: 0,
        icon: IconReportMoney,
      },
      {
        label: "Total Orders",
        type: "up" as const,
        percentage: 0,
        stats: totalOrders,
        sign: "number" as const,
        profit: 0,
        icon: IconClipboardCheck,
      },
      {
        label: "Total Users",
        type: "up" as const,
        percentage: 0,
        stats: totalUsers,
        sign: "number" as const,
        profit: 0,
        icon: IconUserFilled,
      },
      {
        label: "Pending Orders",
        type: "down" as const,
        percentage: 0,
        stats: pendingOrders,
        sign: "number" as const,
        profit: 0,
        icon: IconReceiptFilled,
      },
    ]
  }, [summary])

  return (
    <div className="col-span-6 grid grid-cols-6 gap-4">
      {loading ? (
        <div className="col-span-6 text-sm text-muted-foreground">Loading...</div>
      ) : error ? (
        <div className="col-span-6 text-sm text-red-600">{error}</div>
      ) : (
        cards.map((stats) => (
          <div key={stats.label} className="col-span-3">
            <StatsCard key={stats.label} {...stats} />
          </div>
        ))
      )}
    </div>
  )
}
