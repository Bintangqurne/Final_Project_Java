"use client"

import { useEffect, useMemo, useState } from "react"
import { ArrowUpRight } from "lucide-react"
import {
  Bar,
  BarChart,
  CartesianGrid,
  XAxis,
} from "recharts"
import { Badge } from "@/components/ui/badge"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  ChartConfig,
  ChartContainer,
  ChartLegend,
  ChartLegendContent,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

type Order = {
  id: number
  status?: string
  totalAmount?: string | number
  createdAt?: string
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

function formatRupiah(value: unknown): string {
  return `Rp ${new Intl.NumberFormat("id-ID").format(toNumber(value))}`
}

const MONTHS = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
] as const

const monthOptions = MONTHS.map((label, i) => ({ label, value: String(i + 1) }))

const chartConfig = {
  revenue: {
    label: "Revenue",
    color: "var(--chart-1)",
  },
} satisfies ChartConfig

export default function RevenueChart() {
  const now = new Date()
  const [year, setYear] = useState(String(now.getFullYear()))
  const [month, setMonth] = useState(String(now.getMonth() + 1))
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [orders, setOrders] = useState<Order[]>([])

  useEffect(() => {
    let cancelled = false
    async function run() {
      setLoading(true)
      setError(null)
      try {
        const res = await fetch("/api/admin/orders")
        const data: unknown = await res.json().catch(() => null)
        if (!res.ok) {
          throw new Error(extractMessage(data) ?? `Request failed (${res.status})`)
        }
        if (!cancelled) setOrders(Array.isArray(data) ? (data as Order[]) : [])
      } catch (e) {
        if (!cancelled)
          setError(e instanceof Error ? e.message : "Failed to load orders")
      } finally {
        if (!cancelled) setLoading(false)
      }
    }
    run()
    return () => {
      cancelled = true
    }
  }, [])

  const parsedYear = Number(year)
  const parsedMonth = Number(month)

  const revenueByMonth = useMemo(() => {
    const totals = new Array<number>(12).fill(0)
    for (const o of orders) {
      if (!o.createdAt) continue
      const d = new Date(o.createdAt)
      if (!Number.isFinite(d.getTime())) continue
      if (d.getFullYear() !== parsedYear) continue
      const status = (o.status ?? "").toUpperCase()
      if (status && !["PAID", "COMPLETED"].includes(status)) continue
      const m = d.getMonth()
      totals[m] += toNumber(o.totalAmount)
    }
    return totals
  }, [orders, parsedYear])

  const chartData = useMemo(() => {
    return MONTHS.map((label, idx) => ({
      month: label,
      revenue: revenueByMonth[idx] ?? 0,
    }))
  }, [revenueByMonth])

  const selectedMonthRevenue = useMemo(() => {
    const idx = Math.max(0, Math.min(11, parsedMonth - 1))
    return revenueByMonth[idx] ?? 0
  }, [parsedMonth, revenueByMonth])

  return (
    <Card className="min-h-[320px]">
      <CardHeader className="p-4">
        <div className="flex items-center justify-between">
          <CardTitle>Revenue</CardTitle>
          <div className="flex items-center gap-2">
            <Select value={month} onValueChange={setMonth}>
              <SelectTrigger className="w-[140px]">
                <SelectValue placeholder="Month" />
              </SelectTrigger>
              <SelectContent>
                {monthOptions.map((m) => (
                  <SelectItem key={m.value} value={m.value}>
                    {m.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={year} onValueChange={setYear}>
              <SelectTrigger className="w-[100px]">
              <SelectValue placeholder="Year" />
            </SelectTrigger>
            <SelectContent>
              {[now.getFullYear() - 1, now.getFullYear(), now.getFullYear() + 1].map((y) => (
                <SelectItem key={y} value={String(y)}>
                  {y}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          </div>
        </div>
        <CardDescription>
          <div className="flex items-center gap-2">
            <p className="text-2xl font-semibold text-black dark:text-white">
              {loading ? "-" : formatRupiah(selectedMonthRevenue)}
            </p>
            <Badge
              variant="secondary"
              className="bg-opacity-20 rounded-xl bg-emerald-500 px-[5px] py-[2px] text-[10px] leading-none"
            >
              <div className="flex items-center gap-[2px] text-emerald-500">
                <ArrowUpRight size={12} />
                <p className="text-[8px]">+10%</p>
              </div>
            </Badge>
          </div>
        </CardDescription>
      </CardHeader>
      <CardContent className="px-4 pb-4">
        {error ? (
          <div className="text-sm text-red-600">{error}</div>
        ) : (
          <ChartContainer className="h-[220px] w-full" config={chartConfig}>
            <BarChart accessibilityLayer data={chartData}>
              <ChartLegend content={<ChartLegendContent />} />
              <CartesianGrid vertical={false} />
              <XAxis
                dataKey="month"
                tickLine={false}
                tickMargin={10}
                axisLine={false}
                tickFormatter={(value) => String(value).slice(0, 3)}
              />

              <ChartTooltip
                cursor={false}
                content={<ChartTooltipContent indicator="dashed" />}
              />
              <Bar
                dataKey="revenue"
                barSize={20}
                fill="var(--color-revenue)"
                radius={4}
              />
            </BarChart>
          </ChartContainer>
        )}
      </CardContent>
    </Card>
  )
}
