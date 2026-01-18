import type { Metadata } from "next"
import { Inter } from "next/font/google"
import { Toaster } from "@/components/ui/toaster"
import "./globals.css"
import { Providers } from "./providers"
import PublicShell from "./public-shell"

const inter = Inter({
  subsets: ["latin"],
  display: "swap",
})

export const metadata: Metadata = {
  title: "Apotek Sehat - Admin",
  description: "Apotek Sehat - Admin",
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${inter.className} group/body antialiased`}>
        <Providers>
          <PublicShell>{children}</PublicShell>
        </Providers>
        <Toaster />
      </body>
    </html>
  )
}
