import { createContext, useContext, useEffect, useMemo, useState } from 'react'

const CartContext = createContext(null)
const STORAGE_KEY = 'ebenora_cart'

// Un item = { paintingId, title, image, format, dimensions, material, price, qty,
//             custom, customDimensions }
// La clé d'unicité (lineKey) combine paintingId + format + matière + dimensions
// sur-mesure : deux variantes d'un même tableau restent des lignes distinctes.

export function lineKey(item) {
  return [item.paintingId, item.format, item.material || '', item.customDimensions || ''].join('|')
}

export function CartProvider({ children }) {
  const [items, setItems] = useState(() => {
    try { return JSON.parse(localStorage.getItem(STORAGE_KEY)) || [] }
    catch { return [] }
  })

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(items))
  }, [items])

  function add(item) {
    const key = lineKey(item)
    setItems((prev) => {
      const i = prev.findIndex((x) => lineKey(x) === key)
      if (i >= 0) {
        const next = [...prev]
        next[i] = { ...next[i], qty: next[i].qty + item.qty }
        return next
      }
      return [...prev, item]
    })
  }

  function setQty(key, qty) {
    setItems((prev) =>
      prev
        .map((x) => (lineKey(x) === key ? { ...x, qty } : x))
        .filter((x) => x.qty > 0)
    )
  }

  function remove(key) {
    setItems((prev) => prev.filter((x) => lineKey(x) !== key))
  }

  function clear() { setItems([]) }

  const count = useMemo(() => items.reduce((s, x) => s + x.qty, 0), [items])
  const total = useMemo(() => items.reduce((s, x) => s + x.price * x.qty, 0), [items])

  return (
    <CartContext.Provider value={{ items, add, setQty, remove, clear, count, total }}>
      {children}
    </CartContext.Provider>
  )
}

export function useCart() {
  return useContext(CartContext)
}
