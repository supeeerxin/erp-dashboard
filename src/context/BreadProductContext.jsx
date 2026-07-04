import React, { createContext, useContext, useState, useEffect } from 'react'
import { useNotification } from './NotificationContext'
import { useAudit } from './AuditContext'
import { supabase } from '../services/supabase'

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
  const { addLog } = useAudit()

  const loadProducts = async () => {
    try {
      setLoading(true)
      const { data, error } = await supabase
        .from('bread_products')
        .select('*')
        .order('created_at', { ascending: false })

      if (error) throw error
      setProducts(data || [])
    } catch (error) {
      console.error('Error loading products:', error)
      showNotification('Failed to load products', 'error')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadProducts()
  }, [])

  const refreshProducts = async () => {
    await loadProducts()
  }

  const addProduct = async (data) => {
    try {
      const newProduct = {
        id: Date.now(),
        name: data.name,
        selling_price_per_box: data.sellingPricePerBox || 0,
        selling_price_per_piece: data.sellingPricePerPiece || 0,
        cost_per_box: data.costPerBox || 0,
        cost_per_piece: data.costPerPiece || 0,
        pieces_per_box: data.piecesPerBox || 24,
        stock_boxes: data.stockBoxes || 0,
        stock_pieces: data.stockPieces || 0,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }

      const { data: inserted, error } = await supabase
        .from('bread_products')
        .insert([newProduct])
        .select()

      if (error) throw error

      setProducts(prev => [inserted[0], ...prev])
      showNotification('Product added!', 'success')
      addLog('Created', 'Bread Product', `Added product: ${data.name}`)
      return inserted[0]
    } catch (error) {
      console.error('Error adding product:', error)
      showNotification('Failed to add product', 'error')
      return null
    }
  }

  const updateProduct = async (id, data) => {
    try {
      const { data: updated, error } = await supabase
        .from('bread_products')
        .update({
          name: data.name,
          selling_price_per_box: data.sellingPricePerBox || 0,
          selling_price_per_piece: data.sellingPricePerPiece || 0,
          cost_per_box: data.costPerBox || 0,
          cost_per_piece: data.costPerPiece || 0,
          pieces_per_box: data.piecesPerBox || 24,
          stock_boxes: data.stockBoxes || 0,
          stock_pieces: data.stockPieces || 0,
          updated_at: new Date().toISOString()
        })
        .eq('id', id)
        .select()

      if (error) throw error

      setProducts(prev => prev.map(p => p.id === id ? updated[0] : p))
      showNotification('Product updated!', 'success')
      addLog('Updated', 'Bread Product', `Updated product: ${data.name}`)
    } catch (error) {
      console.error('Error updating product:', error)
      showNotification('Failed to update product', 'error')
    }
  }

  const deleteProduct = async (id) => {
    try {
      const product = products.find(p => p.id === id)
      const { error } = await supabase
        .from('bread_products')
        .delete()
        .eq('id', id)

      if (error) throw error

      setProducts(prev => prev.filter(p => p.id !== id))
      showNotification('Product deleted!', 'success')
      addLog('Deleted', 'Bread Product', `Deleted product: ${product?.name || 'Unknown'}`)
    } catch (error) {
      console.error('Error deleting product:', error)
      showNotification('Failed to delete product', 'error')
    }
  }

  const getProduct = (id) => {
    return products.find(product => product.id === id)
  }

  const deductInventory = async (productId, boxes, pieces) => {
    try {
      const product = products.find(p => p.id === productId)
      if (!product) return

      const newStockBoxes = Math.max(0, (product.stock_boxes || 0) - (boxes || 0))
      const newStockPieces = Math.max(0, (product.stock_pieces || 0) - (pieces || 0))

      const { error } = await supabase
        .from('bread_products')
        .update({
          stock_boxes: newStockBoxes,
          stock_pieces: newStockPieces,
          updated_at: new Date().toISOString()
        })
        .eq('id', productId)

      if (error) throw error

      setProducts(prev => prev.map(p => 
        p.id === productId 
          ? { ...p, stock_boxes: newStockBoxes, stock_pieces: newStockPieces }
          : p
      ))

      if (newStockBoxes <= 5 && newStockBoxes > 0) {
        showNotification(`Low stock: ${product.name} - only ${newStockBoxes} boxes left!`, 'warning')
      }
      if (newStockBoxes === 0 && (boxes || 0) > 0) {
        showNotification(`${product.name} is now out of stock!`, 'error')
      }
    } catch (error) {
      console.error('Error deducting inventory:', error)
    }
  }

  const restoreInventory = async (productId, boxes, pieces) => {
    try {
      const product = products.find(p => p.id === productId)
      if (!product) return

      const newStockBoxes = (product.stock_boxes || 0) + (boxes || 0)
      const newStockPieces = (product.stock_pieces || 0) + (pieces || 0)

      const { error } = await supabase
        .from('bread_products')
        .update({
          stock_boxes: newStockBoxes,
          stock_pieces: newStockPieces,
          updated_at: new Date().toISOString()
        })
        .eq('id', productId)

      if (error) throw error

      setProducts(prev => prev.map(p => 
        p.id === productId 
          ? { ...p, stock_boxes: newStockBoxes, stock_pieces: newStockPieces }
          : p
      ))
    } catch (error) {
      console.error('Error restoring inventory:', error)
    }
  }

  const value = {
    products,
    loading,
    addProduct,
    updateProduct,
    deleteProduct,
    getProduct,
    deductInventory,
    restoreInventory,
    refreshProducts
  }

  return (
    <BreadProductContext.Provider value={value}>
      {children}
    </BreadProductContext.Provider>
  )
}
