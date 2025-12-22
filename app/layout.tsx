import type React from "react"
import type { Metadata } from "next"
import "./globals.css"
import type { Viewport } from "next"
import { Toaster } from "@/components/ui/toaster"
import { OnlineTracker } from "@/components/online-tracker"
import { GoogleAnalytics } from "@/components/google-analytics"

export const metadata: Metadata = {
  title: "BMW Insurance - Win Two Cars 2024",
  description: "Get insurance discounts up to 30% and win two BMW 520i 2024 cars",
  icons: {
    icon: [
      {
        url: "/icon-light-32x32.png",
        media: "(prefers-color-scheme: light)",
      },
      {
        url: "/icon-dark-32x32.png",
        media: "(prefers-color-scheme: dark)",
      },
      {
        url: "/icon.svg",
        type: "image/svg+xml",
      },
    ],
    apple: "/apple-icon.png",
  },
}

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
}


export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="ar">
      <head>
        <GoogleAnalytics />
      </head>
      <body>
        {children}
        <Toaster />
        <OnlineTracker />
      </body>
    </html>
  )
}
