"use client"

import * as React from "react"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarRail,
} from "@/components/ui/sidebar"
import { NavGroup } from "@/components/layout/nav-group"
import { NavUser } from "@/components/layout/nav-user"
import { TeamSwitcher } from "@/components/layout/team-switcher"
import { sidebarData } from "./data/sidebar-data"

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const [user, setUser] = React.useState(sidebarData.user)

  React.useEffect(() => {
    let cancelled = false

    async function run() {
      try {
        const res = await fetch("/api/auth/session")
        const data = (await res.json()) as {
          name: string | null
          email: string | null
          role: string | null
        }

        if (!cancelled) {
          setUser((prev) => ({
            ...prev,
            name: data.name ?? prev.name,
            email: data.email ?? prev.email,
          }))
        }
      } catch {
      }
    }

    run()
    return () => {
      cancelled = true
    }
  }, [])

  return (
    <div className="relative">
      <Sidebar collapsible="icon" {...props}>
        <SidebarHeader>
          <TeamSwitcher teams={sidebarData.teams} />
        </SidebarHeader>
        <SidebarContent>
          {sidebarData.navGroups.map((props) => (
            <NavGroup key={props.title} {...props} />
          ))}
        </SidebarContent>
        <SidebarFooter>
          <NavUser user={user} />
        </SidebarFooter>
        <SidebarRail />
      </Sidebar>
    </div>
  )
}
