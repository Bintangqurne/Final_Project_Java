"use client"

import { useCallback, useEffect, useMemo, useState } from "react"
import { formatDistanceToNow } from "date-fns"
import { cn } from "@/lib/utils"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"

type Order = {
  id: number
  orderCode?: string
  status?: string
  approvalStatus?: string
  totalAmount?: string | number
  createdAt?: string
  shippingAddress?: string | null
  shippingPhone?: string | null
  user?: { name?: string; email?: string }
  username?: string
  email?: string
  customerName?: string
  customerEmail?: string
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
  const n = toNumber(value)
  return `Rp ${new Intl.NumberFormat("id-ID").format(n)}`
}

const statusClass = new Map<string, string>([
  ["PAID", "bg-emerald-50 border-emerald-300 text-emerald-700"],
  ["DELIVERING", "bg-indigo-50 border-indigo-300 text-indigo-700"],
  ["DELIVERED", "bg-blue-50 border-blue-300 text-blue-700"],
  ["COMPLETED", "bg-emerald-50 border-emerald-300 text-emerald-700"],
  ["PROCESSING", "bg-emerald-50 border-emerald-300 text-emerald-700"],
  ["PENDING", "bg-orange-50 border-orange-300 text-orange-700"],
  ["PENDING_PAYMENT", "bg-orange-50 border-orange-300 text-orange-700"],
  ["REJECTED", "bg-destructive/10 border-destructive/30 text-destructive"],
  ["CANCELLED", "bg-destructive/10 border-destructive/30 text-destructive"],
  ["FAILED", "bg-destructive/10 border-destructive/30 text-destructive"],
])

export default function RecentActivity() {
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [orders, setOrders] = useState<Order[]>([])

  const refresh = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const res = await fetch("/api/admin/orders")
      const data: unknown = await res.json().catch(() => null)
      if (!res.ok) {
        throw new Error(extractMessage(data) ?? `Request failed (${res.status})`)
      }

      const list = Array.isArray(data) ? (data as Order[]) : []
      const sorted = [...list].sort((a, b) => {
        const at = a.createdAt ? Date.parse(a.createdAt) : 0
        const bt = b.createdAt ? Date.parse(b.createdAt) : 0
        return bt - at
      })

      setOrders(sorted)
    } catch (e) {
      const msg = e instanceof Error ? e.message : "Failed to load orders"
      setError(msg)
      if (msg.toLowerCase().includes("unauthorized") || msg.includes("401")) {
        window.location.href = "/login"
      }
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    refresh()
  }, [refresh])

  async function onApprove(orderId: number) {
    setError(null)
    try {
      const res = await fetch(`/api/admin/orders/${encodeURIComponent(String(orderId))}/approve`, {
        method: "POST",
      })
      const data: unknown = await res.json().catch(() => null)
      if (!res.ok) {
        throw new Error(extractMessage(data) ?? `Request failed (${res.status})`)
      }
      await refresh()
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to approve")
    }
  }

  async function onReject(orderId: number) {
    setError(null)
    try {
      const res = await fetch(`/api/admin/orders/${encodeURIComponent(String(orderId))}/reject`, {
        method: "POST",
      })
      const data: unknown = await res.json().catch(() => null)
      if (!res.ok) {
        throw new Error(extractMessage(data) ?? `Request failed (${res.status})`)
      }
      await refresh()
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to reject")
    }
  }

  async function onDeliver(orderId: number) {
    setError(null)
    try {
      const res = await fetch(`/api/admin/orders/${encodeURIComponent(String(orderId))}/deliver`, {
        method: "POST",
      })
      const data: unknown = await res.json().catch(() => null)
      if (!res.ok) {
        throw new Error(extractMessage(data) ?? `Request failed (${res.status})`)
      }
      await refresh()
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to start delivery")
    }
  }

  async function onMarkDelivered(orderId: number) {
    setError(null)
    try {
      const res = await fetch(`/api/admin/orders/${encodeURIComponent(String(orderId))}/delivered`, {
        method: "POST",
      })
      const data: unknown = await res.json().catch(() => null)
      if (!res.ok) {
        throw new Error(extractMessage(data) ?? `Request failed (${res.status})`)
      }
      await refresh()
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to mark delivered")
    }
  }

  const rows = useMemo(() => orders.slice(0, 10), [orders])

  return (
    <Card className="h-full">
      <CardHeader className="p-4">
        <div className="flex items-center justify-between">
          <CardTitle>Recent Activity</CardTitle>
          <Select>
            <SelectTrigger className="w-min">
              <SelectValue placeholder="Period" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="last_24h">Last 24h</SelectItem>
              <SelectItem value="last_week">Last Week</SelectItem>
              <SelectItem value="last_month">Last Month</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </CardHeader>
      <CardContent className="h-[calc(100%_-_68px)] px-2 pt-0">
        <Table>
          <TableCaption>A list of your recent activity.</TableCaption>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[100px]">User</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>ID</TableHead>
              <TableHead>Shipping</TableHead>
              <TableHead>Date</TableHead>
              <TableHead className="text-right">Amount</TableHead>
              <TableHead className="text-right">Action</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={7} className="h-24 text-center">
                  Loading...
                </TableCell>
              </TableRow>
            ) : error ? (
              <TableRow>
                <TableCell colSpan={7} className="h-24 text-center text-red-600">
                  {error}
                </TableCell>
              </TableRow>
            ) : rows.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="h-24 text-center">
                  No orders.
                </TableCell>
              </TableRow>
            ) : (
              rows.map((order) => {
                const name =
                  order.user?.name ||
                  order.customerName ||
                  order.username ||
                  "Buyer"
                const email =
                  order.user?.email ||
                  order.customerEmail ||
                  order.email ||
                  "-"
                const status = (order.status ?? "-").toString()
                const approvalStatus = (order.approvalStatus ?? "PENDING").toString()
                const createdAt = order.createdAt ? new Date(order.createdAt) : null
                const shippingAddress = (order.shippingAddress ?? "-").toString()
                const shippingPhone = (order.shippingPhone ?? "").toString()
                const statusUpper = status.toUpperCase()
                const approvalUpper = approvalStatus.toUpperCase()
                return (
                  <TableRow key={order.id}>
                <TableCell>
                  <div className="flex items-center gap-2">
                    <Avatar className="h-9 w-9">
                      <AvatarImage src="/" alt="Avatar" />
                      <AvatarFallback>
                        {name.slice(0, 2)}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex flex-col items-start">
                      <p className="font-bold">{name}</p>
                      <p className="text-xs opacity-70">{email}</p>
                    </div>
                  </div>
                </TableCell>
                <TableCell>
                  <Badge
                    variant="outline"
                    className={cn(
                      "dark:bg-opacity-5 rounded-full px-2 py-[4px] text-[11px] leading-none",
                      statusClass.get(status) ?? ""
                    )}
                  >
                    {status}
                  </Badge>
                </TableCell>
                <TableCell className="tracking-tight">{order.orderCode ?? `#${order.id}`}</TableCell>
                <TableCell className="max-w-[280px]">
                  <div className="flex flex-col">
                    <p className="text-xs text-gray-700 line-clamp-2">{shippingAddress}</p>
                    {shippingPhone ? <p className="text-[11px] opacity-70">{shippingPhone}</p> : null}
                  </div>
                </TableCell>
                <TableCell>
                  {createdAt ? formatDistanceToNow(createdAt, { addSuffix: true }) : "-"}
                </TableCell>
                <TableCell className="text-right">
                  {formatRupiah(order.totalAmount)}
                </TableCell>
                <TableCell className="text-right">
                  {statusUpper === "PAID" && approvalUpper === "PENDING" ? (
                    <div className="flex justify-end gap-2">
                      <Button size="sm" onClick={() => onApprove(order.id)}>
                        Approve
                      </Button>
                      <Button size="sm" variant="destructive" onClick={() => onReject(order.id)}>
                        Reject
                      </Button>
                    </div>
                  ) : statusUpper === "PROCESSING" ? (
                    <div className="flex justify-end gap-2">
                      <Button size="sm" onClick={() => onDeliver(order.id)}>
                        Deliver
                      </Button>
                    </div>
                  ) : statusUpper === "DELIVERING" ? (
                    <div className="flex justify-end gap-2">
                      <Button size="sm" onClick={() => onMarkDelivered(order.id)}>
                        Mark delivered
                      </Button>
                    </div>
                  ) : (
                    <span className="text-xs text-muted-foreground">-</span>
                  )}
                </TableCell>
              </TableRow>
                )
              })
            )}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  )
}
