import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react'

import { bySlug, type Product } from '../../data/products'

export interface CartLine {
  slug: string
  option?: string
  quantity: number
}

interface CartState {
  lines: CartLine[]
  open: boolean
  add: (product: Product, option?: string, quantity?: number) => void
  setQuantity: (slug: string, option: string | undefined, quantity: number) => void
  remove: (slug: string, option?: string) => void
  clear: () => void
  setOpen: (open: boolean) => void
  count: number
  subtotal: number
  items: (CartLine & { product: Product })[]
}

const CartContext = createContext<CartState | null>(null)
const KEY = 'bioherbica-cart'
const MAX_QUANTITY = 50

export function CartProvider({ children }: { children: ReactNode }) {
  const [lines, setLines] = useState<CartLine[]>(() => {
    try {
      const raw = localStorage.getItem(KEY)
      return raw ? (JSON.parse(raw) as CartLine[]).filter((line) => {
        const product = bySlug(line.slug)
        return Boolean(product?.available && product.price !== null && product.verificationStatus === 'verified' && Number.isInteger(line.quantity) && line.quantity > 0 && line.quantity <= MAX_QUANTITY)
      }) : []
    } catch {
      return []
    }
  })
  const [open, setOpen] = useState(false)

  useEffect(() => {
    localStorage.setItem(KEY, JSON.stringify(lines))
  }, [lines])

  const same = (a: CartLine, slug: string, option?: string) => a.slug === slug && (a.option ?? '') === (option ?? '')

  const add = useCallback((product: Product, option?: string, quantity = 1) => {
    if (!product.available || product.price === null || product.verificationStatus !== 'verified' || !Number.isInteger(quantity) || quantity < 1) return
    setLines((prev) => {
      const existing = prev.find((l) => same(l, product.slug, option))
      if (existing) return prev.map((l) => (l === existing ? { ...l, quantity: Math.min(MAX_QUANTITY, l.quantity + quantity) } : l))
      return [...prev, { slug: product.slug, option, quantity: Math.min(MAX_QUANTITY, quantity) }]
    })
    setOpen(true)
  }, [])

  const setQuantity = useCallback((slug: string, option: string | undefined, quantity: number) => {
    setLines((prev) => (quantity <= 0 ? prev.filter((l) => !same(l, slug, option)) : prev.map((l) => (same(l, slug, option) ? { ...l, quantity: Math.min(MAX_QUANTITY, Math.floor(quantity)) } : l))))
  }, [])

  const remove = useCallback((slug: string, option?: string) => setLines((prev) => prev.filter((l) => !same(l, slug, option))), [])
  const clear = useCallback(() => setLines([]), [])

  const value = useMemo<CartState>(() => {
    const items = lines.map((line) => ({ ...line, product: bySlug(line.slug)! })).filter((line) => line.product.available && line.product.price !== null && line.product.verificationStatus === 'verified')
    return {
      lines,
      open,
      add,
      setQuantity,
      remove,
      clear,
      setOpen,
      items,
      count: items.reduce((n, l) => n + l.quantity, 0),
      subtotal: items.reduce((n, l) => n + l.quantity * (l.product.price ?? 0), 0),
    }
  }, [lines, open, add, setQuantity, remove, clear])

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>
}

export function useCart(): CartState {
  const ctx = useContext(CartContext)
  if (!ctx) throw new Error('useCart outside CartProvider')
  return ctx
}

export const money = (value: number) => `${new Intl.NumberFormat('bs-BA', { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(value)} KM`
