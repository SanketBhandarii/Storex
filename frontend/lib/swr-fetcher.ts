export const API_BASE =
  (typeof process !== "undefined" && process.env?.NEXT_PUBLIC_API_URL) || "http://localhost:8080/api"

export async function apiFetch(path: string, init?: RequestInit) {
  const res = await fetch(`${API_BASE}${path}`, {
    ...init,
    headers: {
      "Content-Type": "application/json",
      ...(init?.headers || {}),
    },
  })
  if (!res.ok) {
    const text = await res.text().catch(() => "")
    throw new Error(`API error ${res.status}: ${text}`)
  }
  if (res.status === 204) return null
  const contentType = res.headers.get("content-type") || ""
  if (contentType.includes("application/json")) {
    return res.json()
  }
  return res.text()
}

export const fetcher = (path: string) => apiFetch(path)
