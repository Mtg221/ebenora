import { createContext, useContext, useEffect, useMemo, useState } from 'react'

const CartContext = createContext(null)
const STORAGE_KEY = 'ebenora_cart'

// Un item = { paintingId, title, image, format, dimensions, price, qty }
// La clé d'unicité est paintingId + format.

export function CartProvider({ children }) {
  const [items, setItems] = useState(() => {
    try { return JSON.parse(localStorage.getItem(STORAGE_KEY)) || [] }
    catch { return [] }
  })

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(items))
  }, [items])

  function add(item) {
    setItems((prev) => {
      const i = prev.findIndex((x) => x.paintingId === item.paintingId && x.format === item.format)
      if (i >= 0) {
        const next = [...prev]
        next[i] = { ...next[i], qty: next[i].qty + item.qty }
        return next
      }
      return [...prev, item]
    })
  }

  function setQty(paintingId, format, qty) {
    setItems((prev) =>
      prev
        .map((x) => (x.paintingId === paintingId && x.format === format ? { ...x, qty } : x))
        .filter((x) => x.qty > 0)
    )
  }

  function remove(paintingId, format) {
    setItems((prev) => prev.filter((x) => !(x.paintingId === paintingId && x.format === format)))
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
