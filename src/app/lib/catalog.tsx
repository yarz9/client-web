import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react'
import { categories as fallbackCategories, products as fallbackProducts, type Product } from '../../data/products'

export type CatalogCategory = { key: string; label: string; blurb: string; number: string; sortOrder?: number }
type CatalogState = { products: Product[]; categories: CatalogCategory[]; loading: boolean; refresh: () => Promise<void> }
const CatalogContext = createContext<CatalogState | null>(null)

export function CatalogProvider({ children }: { children: ReactNode }) {
  const [products, setProducts] = useState<Product[]>(fallbackProducts)
  const [categories, setCategories] = useState<CatalogCategory[]>(fallbackCategories)
  const [loading, setLoading] = useState(true)
  const refresh = useCallback(async () => {
    setLoading(true)
    try {
      const [productResponse, categoryResponse] = await Promise.all([fetch('/api/products'), fetch('/api/categories')])
      if (productResponse.ok) {
        const body = await productResponse.json() as { results?: Product[] }
        if (body.results) setProducts(body.results)
      }
      if (categoryResponse.ok) {
        const body = await categoryResponse.json() as { results?: CatalogCategory[] }
        if (body.results) setCategories(body.results)
      }
    } catch {
      // Keep the development preview or last valid catalogue during database outages.
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { void refresh() }, [refresh])

  const value = useMemo(() => ({ products, categories, loading, refresh }), [products, categories, loading, refresh])
  return <CatalogContext.Provider value={value}>{children}</CatalogContext.Provider>
}

export function useCatalog() {
  const value = useContext(CatalogContext)
  if (!value) throw new Error('useCatalog outside CatalogProvider')
  return value
}
