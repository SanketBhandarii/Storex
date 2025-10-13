"use client"

import useSWR from "swr"
import { fetcher } from "@/lib/swr-fetcher"
import type { Item, Order } from "@/lib/types"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ResponsiveContainer, BarChart, XAxis, YAxis, Bar, Tooltip, CartesianGrid } from "recharts"

export function DashboardOverview() {
  const { data: items } = useSWR<Item[]>("/items", fetcher)
  const { data: orders } = useSWR<Order[]>("/orders", fetcher)

  const totalItems = items?.length ?? 0
  const lowStock = (items || []).filter((i) => (i.stock ?? 0) <= 10).length
  const totalOrders = orders?.length ?? 0
  const revenue = (orders || []).reduce((sum, o) => sum + (o.total || 0), 0)

  // Build simple orders-by-status chart
  const byStatus = Object.entries(
    (orders || []).reduce<Record<string, number>>((acc, o) => {
      const k = o.status || "pending"
      acc[k] = (acc[k] || 0) + 1
      return acc
    }, {}),
  ).map(([status, count]) => ({ status, count }))

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      <StatCard title="Total Items" value={totalItems} />
      <StatCard title="Low Stock" value={lowStock} />
      <StatCard title="Orders" value={totalOrders} />
      <StatCard title="Revenue" value={formatCurrency(revenue)} />
      <Card className="md:col-span-2 lg:col-span-4">
        <CardHeader>
          <CardTitle>Orders by Status</CardTitle>
        </CardHeader>
        <CardContent className="h-[320px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={byStatus}>
              <CartesianGrid strokeDasharray="4 4" strokeOpacity={0.2} />
              <XAxis dataKey="status" />
              <YAxis allowDecimals={false} />
              <Tooltip />
              <Bar dataKey="count" fill="var(--color-primary)" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  )
}

function StatCard({ title, value }: { title: string; value: number | string }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-sm font-medium text-muted-foreground">{title}</CardTitle>
      </CardHeader>
      <CardContent className="text-2xl font-semibold">{String(value)}</CardContent>
    </Card>
  )
}

function formatCurrency(n?: number | null) {
  const num = typeof n === "number" ? n : 0
  return new Intl.NumberFormat(undefined, { style: "currency", currency: "USD" }).format(num)
}
