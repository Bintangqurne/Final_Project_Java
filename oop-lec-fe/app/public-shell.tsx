"use client"

import Navbar from "@/components/navbar"
import SmoothScroll from "@/components/smooth-scroll"
import { usePathname } from "next/navigation"

interface Props {
  children: React.ReactNode
}

export default function PublicShell({ children }: Props) {
  const pathname = usePathname()

  if (pathname?.startsWith("/admin")) {
    return <>{children}</>
  }

  return (
    <>
      <Navbar />
      <SmoothScroll>{children}</SmoothScroll>
    </>
  )
}
