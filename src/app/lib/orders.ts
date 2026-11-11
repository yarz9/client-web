// Narudžbe se pamte u pregledniku kako bi kupac mogao ponovo otvoriti potvrdu
// nakon osvježavanja stranice ili vraćanja na sajt. Ovo nije zamjena za serversku
// evidenciju: konačan status i cijenu dostave i dalje potvrđuje BioHerbica.
// Čuvaju se samo referenca, stavke i token za praćenje — bez imena, telefona i adrese.
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
  items: SavedOrderItem[]
  subtotal: number
  status: string
  trackToken?: string
}

const STORAGE_KEY = 'bioherbica-orders'
const LIMIT = 10

function isSavedOrder(value: unknown): value is SavedOrder {
  if (!value || typeof value !== 'object') return false
  const candidate = value as Partial<SavedOrder>
  return typeof candidate.reference === 'string' && Array.isArray(candidate.items) && typeof candidate.subtotal === 'number'
}

function write(orders: SavedOrder[]) {
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(orders.slice(0, LIMIT)))
  } catch {
    // Privatni režim može blokirati pohranu; potvrda je tada vidljiva samo do zatvaranja kartice.
  }
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
  write([order, ...loadOrders().filter(existing => existing.reference !== order.reference)])
}

export function patchOrder(reference: string, changes: Partial<SavedOrder>) {
  write(loadOrders().map(order => order.reference === reference ? { ...order, ...changes } : order))
}

export function removeOrder(reference: string) {
  write(loadOrders().filter(order => order.reference !== reference))
}
