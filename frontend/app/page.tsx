import { Suspense } from "react"
import { DashboardOverview } from "@/components/dashboard/overview"

export default function Page() {
  return (
    <div className="mx-auto w-full max-w-7xl p-4 md:p-6 lg:p-8">
      <h1 className="text-pretty text-2xl font-semibold tracking-tight md:text-3xl">Dashboard</h1>
      <p className="text-muted-foreground mt-1">Overview of inventory and orders.</p>

      <div className="mt-6">
        <Suspense fallback={<div className="text-muted-foreground">Loading dashboard…</div>}>
          <DashboardOverview />
        </Suspense>
      </div>
    </div>
  )
}
