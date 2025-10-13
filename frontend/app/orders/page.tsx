"use client"

import useSWR from "swr"
import { useMemo, useState } from "react"
import { fetcher, apiFetch } from "@/lib/swr-fetcher"
import type { Order } from "@/lib/types"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCaption, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

const STATUSES = ["pending", "processing", "shipped", "delivered", "cancelled"] as const

export default function OrdersPage() {
  const { data, isLoading, error, mutate } = useSWR<Order[]>("/orders", fetcher)
  const [query, setQuery] = useState("")
  const [status, setStatus] = useState<string>("all")

  const filtered = useMemo(() => {
    const list = data || []
    const q = query.trim().toLowerCase()
    return list.filter((o) => {
      const matchesQuery =
        !q ||
        [o.id?.toString(), o.customerName, o.email].filter(Boolean).some((v) => (v as string).toLowerCase().includes(q))
      const matchesStatus = status === "all" || o.status === status
      return matchesQuery && matchesStatus
    })
  }, [data, query, status])

  return (
    <div className="mx-auto w-full max-w-7xl p-4 md:p-6 lg:p-8">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-pretty text-2xl font-semibold tracking-tight md:text-3xl">Orders</h1>
          <p className="text-muted-foreground mt-1">Track and update order statuses.</p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Input
            placeholder="Search by id, customer or email"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="w-[260px]"
          />
          <div className="grid gap-2">
            <Label className="sr-only" htmlFor="status">
              Status
            </Label>
            <Select value={status} onValueChange={setStatus}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Filter status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All</SelectItem>
                {STATUSES.map((s) => (
                  <SelectItem key={s} value={s}>
                    {s[0].toUpperCase() + s.slice(1)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      <Card className="mt-6">
        <CardHeader>
          <CardTitle>All Orders</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="text-muted-foreground">Loading orders…</div>
          ) : error ? (
            <div className="text-destructive">Failed to load orders.</div>
          ) : filtered.length === 0 ? (
            <div className="text-muted-foreground">No orders found.</div>
          ) : (
            <Table>
              <TableCaption>All orders</TableCaption>
              <TableHeader>
                <TableRow>
                  <TableHead>ID</TableHead>
                  <TableHead>Customer</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Total</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.map((o) => (
                  <TableRow key={o.id}>
                    <TableCell className="font-medium">{o.id}</TableCell>
                    <TableCell>{o.customerName ?? "—"}</TableCell>
                    <TableCell>{o.email ?? "—"}</TableCell>
                    <TableCell>
                      <Badge variant="secondary">{o.status ?? "pending"}</Badge>
                    </TableCell>
                    <TableCell className="text-right">{formatCurrency(o.total)}</TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <NextStatusButton order={o} mutate={mutate} />
                        <Button variant="outline" size="sm" onClick={() => updateStatus(o, "cancelled", mutate)}>
                          Cancel
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

function formatCurrency(n?: number | null) {
  const num = typeof n === "number" ? n : 0
  return new Intl.NumberFormat(undefined, { style: "currency", currency: "USD" }).format(num)
}

function NextStatusButton({ order, mutate }: { order: Order; mutate: any }) {
  const idx = STATUSES.indexOf((order.status as any) || "pending")
  const next = STATUSES[Math.min(idx + 1, STATUSES.length - 1)]
  const disabled = order.status === "delivered" || order.status === "cancelled"
  return (
    <Button size="sm" disabled={disabled} onClick={() => updateStatus(order, next, mutate)}>
      {disabled ? "Completed" : `Mark ${next}`}
    </Button>
  )
}

async function updateStatus(order: Order, status: string, mutate: any) {
  const next = { ...order, status }
  await mutate(
    async () => {
      await apiFetch(`/orders/${order.id}`, {
        method: "PATCH",
        body: JSON.stringify({ status }),
      })
      return null
    },
    {
      optimisticData: (curr: Order[] | undefined) => (curr || []).map((o) => (o.id === order.id ? next : o)),
      rollbackOnError: true,
      populateCache: false,
      revalidate: true,
    },
  )
}
