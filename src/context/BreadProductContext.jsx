import React, { createContext, useContext, useState, useEffect } from 'react'
import { useNotification } from './NotificationContext'

const BreadProductContext = createContext()

export const useBreadProducts = () => {
  const context = useContext(BreadProductContext)
  if (!context) {
    throw new Error('useBreadProducts must be used within BreadProductProvider')
  }
  return context
}

export const BreadProductProvider = ({ children }) => {
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)
  const { showNotification } = useNotification()

  // Default products
  const defaultProducts = [
    { id: 1, name: 'Pandesal', pricePerBox: 250, pricePerPiece: 2.5 },
    { id: 2, name: 'Monay', pricePerBox: 300, pricePerPiece: 3 },
    { id: 3, name: 'Ensaymada', pricePerBox: 400, pricePerPiece: 4 },
    { id: 4, name: 'Pan de Coco', pricePerBox: 350, pricePerPiece: 3.5 },
    { id: 5, name: 'Spanish Bread', pricePerBox: 380, pricePerPiece: 3.8 },
  ]

  useEffect(() => {
    const saved = localStorage.getItem('breadProducts')
    if (saved) {
      setProducts(JSON.parse(saved))
    } else {
      setProducts(defaultProducts)
      localStorage.setItem('breadProducts', JSON.stringify(defaultProducts))
    }
    setLoading(false)
  }, [])

  useEffect(() => {
    if (!loading) {
      localStorage.setItem('breadProducts', JSON.stringify(products))
    }
  }, [products, loading])

  const addProduct = (data) => {
    const newProduct = {
      id: Date.now(),
      ...data,
      createdAt: new Date().toISOString()
    }
    setProducts(prev => [...prev, newProduct])
    showNotification('Product added!', 'success')
    return newProduct
  }

  const updateProduct = (id, data) => {
    setProducts(prev => prev.map(product =>
      product.id === id
        ? { ...product, ...data }
        : product
    ))
    showNotification('Product updated!', 'success')
  }

  const deleteProduct = (id) => {
    setProducts(prev => prev.filter(product => product.id !== id))
    showNotification('Product deleted!', 'success')
  }

  const getProduct = (id) => {
    return products.find(product => product.id === id)
  }

  const value = {
    products,
    loading,
    addProduct,
    updateProduct,
    deleteProduct,
    getProduct
  }

  return (
    <BreadProductContext.Provider value={value}>
      {children}
    </BreadProductContext.Provider>
  )
}
