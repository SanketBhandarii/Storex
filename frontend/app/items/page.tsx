"use client"

import useSWR from "swr"
import { useMemo, useState } from "react"
import { fetcher, apiFetch } from "@/lib/swr-fetcher"
import type { Item } from "@/lib/types"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Table, TableBody, TableCaption, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"

export default function ItemsPage() {
  const { data, isLoading, error, mutate } = useSWR<Item[]>("/items", fetcher)
  const [query, setQuery] = useState("")
  const filtered = useMemo(() => {
    if (!data) return []
    const q = query.trim().toLowerCase()
    if (!q) return data
    return data.filter((i) => [i.name, i.sku, i.category].some((v) => (v || "").toLowerCase().includes(q)))
  }, [data, query])

  return (
    <div className="mx-auto w-full max-w-7xl p-4 md:p-6 lg:p-8">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-pretty text-2xl font-semibold tracking-tight md:text-3xl">Inventory</h1>
          <p className="text-muted-foreground mt-1">Manage items, stock, and pricing.</p>
        </div>
        <div className="flex gap-2">
          <Input
            placeholder="Search by name, SKU, category"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="w-[260px]"
          />
          <CreateItemDialog onCreated={() => mutate()} />
        </div>
      </div>

      <Card className="mt-6">
        <CardHeader>
          <CardTitle>Items</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="text-muted-foreground">Loading items…</div>
          ) : error ? (
            <div className="text-destructive">Failed to load items.</div>
          ) : filtered.length === 0 ? (
            <div className="text-muted-foreground">No items found.</div>
          ) : (
            <Table>
              <TableCaption>All items</TableCaption>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>SKU</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead className="text-right">Price</TableHead>
                  <TableHead className="text-right">Stock</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.map((item) => (
                  <TableRow key={item.id}>
                    <TableCell className="font-medium">{item.name ?? "—"}</TableCell>
                    <TableCell>{item.sku ?? "—"}</TableCell>
                    <TableCell>{item.category ? <Badge variant="secondary">{item.category}</Badge> : "—"}</TableCell>
                    <TableCell className="text-right">{formatCurrency(item.price)}</TableCell>
                    <TableCell className="text-right">
                      <span className={cn(item.stock != null && item.stock <= 10 && "text-yellow-500")}>
                        {item.stock ?? 0}
                      </span>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button variant="outline" size="sm" onClick={() => adjustStock(item, -1, mutate)}>
                          -1
                        </Button>
                        <Button variant="outline" size="sm" onClick={() => adjustStock(item, +1, mutate)}>
                          +1
                        </Button>
                        <EditItemDialog item={item} onUpdated={() => mutate()} />
                        <Button variant="destructive" size="sm" onClick={() => deleteItem(item.id, mutate)}>
                          Delete
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

async function adjustStock(item: Item, delta: number, mutate: any) {
  const next = { ...item, stock: Math.max(0, (item.stock ?? 0) + delta) }
  await mutate(
    async () => {
      await apiFetch(`/items/${item.id}`, { method: "PUT", body: JSON.stringify(next) })
      return null
    },
    {
      optimisticData: (curr: Item[] | undefined) => (curr || []).map((i) => (i.id === item.id ? next : i)),
      rollbackOnError: true,
      populateCache: false,
      revalidate: true,
    },
  )
}

async function deleteItem(id: string | number | undefined, mutate: any) {
  if (id == null) return
  await mutate(
    async () => {
      await apiFetch(`/items/${id}`, { method: "DELETE" })
      return null
    },
    {
      optimisticData: (curr: Item[] | undefined) => (curr || []).filter((i) => i.id !== id),
      rollbackOnError: true,
      populateCache: false,
      revalidate: true,
    },
  )
}

function CreateItemDialog({ onCreated }: { onCreated: () => void }) {
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [name, setName] = useState("")
  const [sku, setSku] = useState("")
  const [price, setPrice] = useState<number | "">("")
  const [stock, setStock] = useState<number | "">("")

  async function onSubmit() {
    setLoading(true)
    try {
      await apiFetch("/items", {
        method: "POST",
        body: JSON.stringify({
          name,
          sku,
          price: Number(price) || 0,
          stock: Number(stock) || 0,
        }),
      })
      setOpen(false)
      onCreated()
      setName("")
      setSku("")
      setPrice("")
      setStock("")
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>Add Item</Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[480px]">
        <DialogHeader>
          <DialogTitle>New Item</DialogTitle>
        </DialogHeader>
        <div className="grid gap-4 py-2">
          <div className="grid gap-2">
            <Label htmlFor="name">Name</Label>
            <Input id="name" value={name} onChange={(e) => setName(e.target.value)} />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="sku">SKU</Label>
            <Input id="sku" value={sku} onChange={(e) => setSku(e.target.value)} />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="price">Price</Label>
            <Input
              id="price"
              type="number"
              inputMode="decimal"
              value={price}
              onChange={(e) => setPrice(e.target.value === "" ? "" : Number(e.target.value))}
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="stock">Stock</Label>
            <Input
              id="stock"
              type="number"
              inputMode="numeric"
              value={stock}
              onChange={(e) => setStock(e.target.value === "" ? "" : Number(e.target.value))}
            />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)}>
            Cancel
          </Button>
          <Button onClick={onSubmit} disabled={loading}>
            {loading ? "Saving…" : "Save"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

function EditItemDialog({ item, onUpdated }: { item: Item; onUpdated: () => void }) {
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [name, setName] = useState(item.name || "")
  const [sku, setSku] = useState(item.sku || "")
  const [price, setPrice] = useState<number | "">(item.price ?? "")
  const [stock, setStock] = useState<number | "">(item.stock ?? "")

  async function onSubmit() {
    setLoading(true)
    try {
      await apiFetch(`/items/${item.id}`, {
        method: "PUT",
        body: JSON.stringify({
          ...item,
          name,
          sku,
          price: Number(price) || 0,
          stock: Number(stock) || 0,
        }),
      })
      setOpen(false)
      onUpdated()
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          Edit
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[480px]">
        <DialogHeader>
          <DialogTitle>Edit Item</DialogTitle>
        </DialogHeader>
        <div className="grid gap-4 py-2">
          <div className="grid gap-2">
            <Label htmlFor="name">Name</Label>
            <Input id="name" value={name} onChange={(e) => setName(e.target.value)} />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="sku">SKU</Label>
            <Input id="sku" value={sku} onChange={(e) => setSku(e.target.value)} />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="price">Price</Label>
            <Input
              id="price"
              type="number"
              inputMode="decimal"
              value={price}
              onChange={(e) => setPrice(e.target.value === "" ? "" : Number(e.target.value))}
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="stock">Stock</Label>
            <Input
              id="stock"
              type="number"
              inputMode="numeric"
              value={stock}
              onChange={(e) => setStock(e.target.value === "" ? "" : Number(e.target.value))}
            />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)}>
            Cancel
          </Button>
          <Button onClick={onSubmit} disabled={loading}>
            {loading ? "Saving…" : "Save changes"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
