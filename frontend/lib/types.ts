export type Item = {
  id: string | number
  name?: string
  sku?: string
  price?: number
  stock?: number
  category?: string
  imageUrl?: string
  [key: string]: unknown
}

export type Order = {
  id: string | number
  customerName?: string
  email?: string
  status?: "pending" | "processing" | "shipped" | "delivered" | "cancelled" | string
  total?: number
  createdAt?: string
  items?: Array<{ itemId: string | number; quantity: number; price?: number }>
  [key: string]: unknown
}
