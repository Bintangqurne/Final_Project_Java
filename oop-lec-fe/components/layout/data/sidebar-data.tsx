import {
  IconApps,
  IconBarrierBlock,
  IconBug,
  IconTag,
  IconChecklist,
  IconCode,
  IconCoin,
  IconError404,
  IconLayoutDashboard,
  IconLock,
  IconLockAccess,
  IconNotification,
  IconPackage,
  IconServerOff,
  IconSettings,
  IconTool,
  IconUser,
  IconUserOff,
  IconUsers,
} from "@tabler/icons-react"
import { AudioWaveform, GalleryVerticalEnd } from "lucide-react"
import { cn } from "@/lib/utils"
import { Logo } from "@/components/logo"
import { type SidebarData } from "../types"

export const sidebarData: SidebarData = {
  user: {
    name: "ausrobdev",
    email: "rob@shadcnblocks.com",
    avatar: "/avatars/ausrobdev-avatar.png",
  },
  teams: [
    {
      name: "Apotek Sehat - Admin",
      logo: ({ className }: { className: string }) => (
        <Logo className={cn("invert dark:invert-0", className)} />
      ),
      plan: "Apotek",
    },
    {
      name: "Acme Inc",
      logo: GalleryVerticalEnd,
      plan: "Enterprise",
    },
    {
      name: "Acme Corp.",
      logo: AudioWaveform,
      plan: "Startup",
    },
  ],
  navGroups: [
    {
      title: "General",
      items: [
        {
          title: "Dashboard",
          icon: IconLayoutDashboard,
          items: [
            {
              title: "Dashboard 1",
              url: "/admin/",
            },
            {
              title: "Dashboard 2",
              url: "/admin/dashboard-2",
            },
            {
              title: "Dashboard 3",
              url: "/admin/dashboard-3",
            },
          ],
        },
        {
          title: "Products",
          url: "/admin/products",
          icon: IconPackage,
        },
        {
          title: "Categories",
          url: "/admin/categories",
          icon: IconTag,
        },
        {
          title: "Tasks",
          url: "/admin/tasks",
          icon: IconChecklist,
        },
        {
          title: "Users",
          url: "/admin/users",
          icon: IconUsers,
        },
      ],
    },
    {
      title: "Pages",
      items: [
        {
          title: "Auth",
          icon: IconLockAccess,
          items: [
            {
              title: "Login",
              url: "/login",
            },
            {
              title: "Register",
              url: "/register",
            },
            {
              title: "Forgot Password",
              url: "/forgot-password",
            },
          ],
        },
        {
          title: "Errors",
          icon: IconBug,
          items: [
            {
              title: "Unauthorized",
              url: "/401",
              icon: IconLock,
            },
            {
              title: "Forbidden",
              url: "/403",
              icon: IconUserOff,
            },
            {
              title: "Not Found",
              url: "/404",
              icon: IconError404,
            },
            {
              title: "Internal Server Error",
              url: "/error",
              icon: IconServerOff,
            },
            {
              title: "Maintenance Error",
              url: "/503",
              icon: IconBarrierBlock,
            },
          ],
        },
      ],
    },
    {
      title: "Other",
      items: [
        {
          title: "Settings",
          icon: IconSettings,
          items: [
            {
              title: "General",
              icon: IconTool,
              url: "/admin/settings",
            },
            {
              title: "Profile",
              icon: IconUser,
              url: "/admin/settings/profile",
            },
            {
              title: "Billing",
              icon: IconCoin,
              url: "/admin/settings/billing",
            },
            {
              title: "Plans",
              icon: IconChecklist,
              url: "/admin/settings/plans",
            },
            {
              title: "Connected Apps",
              icon: IconApps,
              url: "/admin/settings/connected-apps",
            },
            {
              title: "Notifications",
              icon: IconNotification,
              url: "/admin/settings/notifications",
            },
          ],
        },
        {
          title: "Developers",
          icon: IconCode,
          items: [
            {
              title: "Overview",
              url: "/admin/developers/overview",
            },
            {
              title: "API Keys",
              url: "/admin/developers/api-keys",
            },
            {
              title: "Webhooks",
              url: "/admin/developers/webhooks",
            },
            {
              title: "Events/Logs",
              url: "/admin/developers/events-&-logs",
            },
          ],
        },
      ],
    },
  ],
}
