import type React from "react"
import type { Metadata } from "next"
import { Header } from "@/components/Header"
import { Footer } from "@/components/Footer"
import "./globals.css"

export const metadata: Metadata = {
  title: "CollegeCuts Tracker",
  description: "Tracking program cuts and closures in higher education",
    generator: 'v0.dev'
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className="font-sans">
        <div className="relative flex min-h-screen flex-col">
          <div className="mx-auto max-w-5xl w-full px-4">
            <Header />
          </div>
          <main className="flex-1 w-full max-w-[var(--max-width)] mx-auto">{children}</main>
          <div className="mx-auto max-w-5xl w-full px-4">
            <Footer />
          </div>
        </div>
      </body>
    </html>
  )
}
