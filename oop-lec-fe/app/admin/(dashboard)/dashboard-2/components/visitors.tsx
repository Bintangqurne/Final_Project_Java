"use client"

import * as React from "react"
import { TrendingUp } from "lucide-react"
import { Label, Pie, PieChart } from "recharts"
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart"

type AdminSummary = {
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

const chartConfig = {
  users: {
    label: "Users",
  },
  user: {
    label: "Users",
    color: "var(--chart-1)",
  },
} satisfies ChartConfig

export default function Visitors() {
  const [loading, setLoading] = React.useState(true)
  const [error, setError] = React.useState<string | null>(null)
  const [summary, setSummary] = React.useState<AdminSummary | null>(null)

  React.useEffect(() => {
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

  const totalUsers = React.useMemo(() => {
    return (
      toNumber(summary?.totalUserRoleUser) ||
      toNumber(summary?.userCount) ||
      toNumber(summary?.totalUsers)
    )
  }, [summary])

  const chartData = React.useMemo(() => {
    return [{ key: "user", users: totalUsers, fill: "var(--color-user)" }]
  }, [totalUsers])

  return (
    <Card className="flex h-full flex-col">
      <CardHeader className="items-center pb-0">
        <CardTitle>Total Users - Chart</CardTitle>
        <CardDescription>Role USER</CardDescription>
      </CardHeader>
      <CardContent className="flex-1 pb-0">
        {error ? (
          <div className="text-sm text-red-600">{error}</div>
        ) : null}
        <ChartContainer
          config={chartConfig}
          className="mx-auto aspect-square max-h-[250px]"
        >
          <PieChart>
            <ChartTooltip
              cursor={false}
              content={<ChartTooltipContent hideLabel />}
            />
            <Pie
              data={chartData}
              dataKey="users"
              nameKey="key"
              innerRadius={60}
              strokeWidth={5}
            >
              <Label
                content={({ viewBox }) => {
                  if (viewBox && "cx" in viewBox && "cy" in viewBox) {
                    return (
                      <text
                        x={viewBox.cx}
                        y={viewBox.cy}
                        textAnchor="middle"
                        dominantBaseline="middle"
                      >
                        <tspan
                          x={viewBox.cx}
                          y={viewBox.cy}
                          className="fill-foreground text-3xl font-bold"
                        >
                          {loading ? "-" : totalUsers.toLocaleString()}
                        </tspan>
                        <tspan
                          x={viewBox.cx}
                          y={(viewBox.cy || 0) + 24}
                          className="fill-muted-foreground"
                        >
                          Users
                        </tspan>
                      </text>
                    )
                  }
                }}
              />
            </Pie>
          </PieChart>
        </ChartContainer>
      </CardContent>
      <CardFooter className="flex-col gap-2 text-sm">
        <div className="flex items-center gap-2 leading-none font-medium">
          Trending up by 5.2% this month <TrendingUp className="h-4 w-4" />
        </div>
        <div className="text-muted-foreground leading-none">
          Total accounts with role USER
        </div>
      </CardFooter>
    </Card>
  )
}
