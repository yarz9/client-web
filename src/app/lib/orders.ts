// Narudžbe se pamte u pregledniku kako bi kupac mogao ponovo otvoriti potvrdu
// nakon osvježavanja stranice ili vraćanja na sajt. Ovo nije zamjena za serversku
// evidenciju: konačan status i cijenu dostave i dalje potvrđuje BioHerbica.
export type SavedOrderItem = {
  slug: string
  name: string
  option?: string
  quantity: number
  unitPrice: number
}

export type SavedOrder = {
  reference: string
  createdAt: string
  name: string
  phone: string
  city: string
  address: string
  items: SavedOrderItem[]
  subtotal: number
  status: string
}

const STORAGE_KEY = 'bioherbica-orders'
const LIMIT = 10

function isSavedOrder(value: unknown): value is SavedOrder {
  if (!value || typeof value !== 'object') return false
  const candidate = value as Partial<SavedOrder>
  return typeof candidate.reference === 'string' && Array.isArray(candidate.items) && typeof candidate.subtotal === 'number'
}

export function loadOrders(): SavedOrder[] {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY)
    if (!raw) return []
    const parsed: unknown = JSON.parse(raw)
    if (!Array.isArray(parsed)) return []
    return parsed.filter(isSavedOrder)
  } catch {
    return []
  }
}

export function loadOrder(reference: string): SavedOrder | undefined {
  return loadOrders().find(order => order.reference === reference)
}

// Najnoviji zahtjev ide prvi, a stariji se odbacuju da pohrana ne raste bez granice.
export function saveOrder(order: SavedOrder) {
  try {
    const next = [order, ...loadOrders().filter(existing => existing.reference !== order.reference)].slice(0, LIMIT)
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(next))
  } catch {
    // Privatni režim može blokirati pohranu; potvrda je tada vidljiva samo do zatvaranja kartice.
  }
}
