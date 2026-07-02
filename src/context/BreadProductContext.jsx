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

  const defaultProducts = [
    { 
      id: 1, 
      name: 'Pandesal', 
      sellingPricePerBox: 250, 
      piecesPerBox: 24, 
      sellingPricePerPiece: 10.42,
      costPerBox: 180,
      costPerPiece: 7.50,
      stockBoxes: 20,
      stockPieces: 0
    },
    { 
      id: 2, 
      name: 'Monay', 
      sellingPricePerBox: 300, 
      piecesPerBox: 24, 
      sellingPricePerPiece: 12.50,
      costPerBox: 220,
      costPerPiece: 9.17,
      stockBoxes: 15,
      stockPieces: 0
    },
    { 
      id: 3, 
      name: 'Ensaymada', 
      sellingPricePerBox: 400, 
      piecesPerBox: 20, 
      sellingPricePerPiece: 20.00,
      costPerBox: 300,
      costPerPiece: 15.00,
      stockBoxes: 10,
      stockPieces: 0
    },
    { 
      id: 4, 
      name: 'Pan de Coco', 
      sellingPricePerBox: 350, 
      piecesPerBox: 24, 
      sellingPricePerPiece: 14.58,
      costPerBox: 260,
      costPerPiece: 10.83,
      stockBoxes: 12,
      stockPieces: 0
    },
    { 
      id: 5, 
      name: 'Spanish Bread', 
      sellingPricePerBox: 380, 
      piecesPerBox: 20, 
      sellingPricePerPiece: 19.00,
      costPerBox: 280,
      costPerPiece: 14.00,
      stockBoxes: 10,
      stockPieces: 0
    },
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
      stockBoxes: data.stockBoxes || 0,
      stockPieces: data.stockPieces || 0,
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

  const deductInventory = (productId, boxes, pieces) => {
    setProducts(prev => prev.map(product => {
      if (product.id === productId) {
        const newStockBoxes = Math.max(0, (product.stockBoxes || 0) - (boxes || 0))
        const newStockPieces = Math.max(0, (product.stockPieces || 0) - (pieces || 0))
        
        if (newStockBoxes <= 5 && newStockBoxes > 0) {
          showNotification(`Low stock: ${product.name} - only ${newStockBoxes} boxes left!`, 'warning')
        }
        if (newStockBoxes === 0 && (boxes || 0) > 0) {
          showNotification(`${product.name} is now out of stock!`, 'error')
        }
        
        return {
          ...product,
          stockBoxes: newStockBoxes,
          stockPieces: newStockPieces
        }
      }
      return product
    }))
  }

  const restoreInventory = (productId, boxes, pieces) => {
    setProducts(prev => prev.map(product => {
      if (product.id === productId) {
        return {
          ...product,
          stockBoxes: (product.stockBoxes || 0) + (boxes || 0),
          stockPieces: (product.stockPieces || 0) + (pieces || 0)
        }
      }
      return product
    }))
  }

  const value = {
    products,
    loading,
    addProduct,
    updateProduct,
    deleteProduct,
    getProduct,
    deductInventory,
    restoreInventory
  }

  return (
    <BreadProductContext.Provider value={value}>
      {children}
    </BreadProductContext.Provider>
  )
}
