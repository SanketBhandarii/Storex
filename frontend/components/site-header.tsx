"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

const links = [
  { href: "/", label: "Dashboard" },
  { href: "/items", label: "Inventory" },
  { href: "/orders", label: "Orders" },
]

export function SiteHeader() {
  const pathname = usePathname()
  const [open, setOpen] = useState(false)

  return (
    <header
      className={cn(
        "sticky top-0 z-50 border-b",
        "bg-background/60 backdrop-blur supports-[backdrop-filter]:bg-background/60",
      )}
      role="banner"
    >
      <div className="mx-auto flex h-14 w-full max-w-7xl items-center justify-between px-4 md:h-16 md:px-6 lg:px-8">
        <Link href="/" className="font-semibold">
          Stationery Admin
          <span className="sr-only">Home</span>
        </Link>

        <nav className="hidden items-center gap-1 sm:flex" aria-label="Main">
          {links.map((l) => {
            const active = pathname === l.href
            return (
              <Link key={l.href} href={l.href}>
                <Button
                  variant={active ? "default" : "ghost"}
                  className={cn("rounded-full", active && "font-semibold")}
                >
                  {l.label}
                </Button>
              </Link>
            )
          })}
        </nav>

        <div className="sm:hidden">
          <Button
            variant="ghost"
            aria-expanded={open}
            aria-controls="mobile-menu"
            aria-label="Toggle Menu"
            onClick={() => setOpen((v) => !v)}
          >
            {open ? "Close" : "Menu"}
          </Button>
        </div>
      </div>

      {/* Mobile menu */}
      <div
        id="mobile-menu"
        className={cn("sm:hidden border-t", open ? "block" : "hidden", "bg-background/80 backdrop-blur")}
      >
        <div className="mx-auto flex w-full max-w-7xl flex-col gap-1 p-4">
          {links.map((l) => {
            const active = pathname === l.href
            return (
              <Link key={l.href} href={l.href} onClick={() => setOpen(false)}>
                <Button
                  variant={active ? "default" : "ghost"}
                  className={cn("w-full justify-start rounded-full", active && "font-semibold")}
                >
                  {l.label}
                </Button>
              </Link>
            )
          })}
        </div>
      </div>
    </header>
  )
}
