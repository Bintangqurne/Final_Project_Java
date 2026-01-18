"use client"

import Link from "next/link"
import { useEffect, useMemo, useState } from "react"
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb"
import { UserPrimaryActions } from "./components/user-primary-actions"
import { columns } from "./components/users-columns"
import { UsersStats } from "./components/users-stats"
import { UsersTable } from "./components/users-table"
import { userListSchema } from "./data/schema"

type AdminUser = {
  id: number
  name: string
  username: string
  email: string
  role: string
}

type PageResponse<T> = {
  content: T[]
  number: number
  size: number
  totalElements: number
  totalPages: number
}

function mapToTemplateUser(u: AdminUser) {
  const name = u.name ?? ""
  const parts = name.trim().split(/\s+/)
  const firstName = parts[0] ?? ""
  const lastName = parts.slice(1).join(" ")
  return {
    id: u.id,
    name: u.name,
    username: u.username,
    email: u.email,
    role: u.role,
    firstName,
    lastName,
    phoneNumber: "",
    status: "active" as const,
  }
}

function extractMessage(value: unknown): string | undefined {
  if (value && typeof value === "object" && "message" in value) {
    const msg = (value as { message?: unknown }).message
    return typeof msg === "string" ? msg : undefined
  }
  return undefined
}

export default function UsersPage() {
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [page, setPage] = useState<PageResponse<AdminUser> | null>(null)

  const users = useMemo(() => page?.content ?? [], [page])
  const userList = useMemo(() => {
    const mapped = users.map(mapToTemplateUser)
    return userListSchema.parse(mapped)
  }, [users])

  useEffect(() => {
    let cancelled = false
    async function run() {
      setLoading(true)
      setError(null)
      try {
        const res = await fetch("/api/admin/users?page=0&size=50")
        const text = await res.text()
        const data: unknown = text ? JSON.parse(text) : null
        if (!res.ok) {
          throw new Error(extractMessage(data) ?? `Request failed (${res.status})`)
        }
        if (!cancelled) setPage(data as PageResponse<AdminUser>)
      } catch (e) {
        if (!cancelled)
          setError(e instanceof Error ? e.message : "Failed to load users")
      } finally {
        if (!cancelled) setLoading(false)
      }
    }
    run()
    return () => {
      cancelled = true
    }
  }, [])

  return (
    <>
      <div className="mb-4 flex flex-col gap-2">
        <Breadcrumb>
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbLink asChild>
                <Link href="/">Home</Link>
              </BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbPage>Users</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>
        <div className="flex flex-wrap items-center justify-between gap-2">
          <h2 className="flex-none text-xl font-bold tracking-tight">
            User List
          </h2>
          <UserPrimaryActions />
        </div>
      </div>
      <div className="flex-1">
        {error ? <div className="text-sm text-red-600">{error}</div> : null}
        {loading ? (
          <div className="text-sm text-muted-foreground">Loading...</div>
        ) : (
          <UsersTable data={userList} columns={columns} />
        )}
      </div>
    </>
  )
}
