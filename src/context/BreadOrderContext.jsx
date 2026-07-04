const addOrder = async (data) => {
  try {
    console.log('📝 Adding bread order with data:', data)

    if (!data.customerId || !data.productId) {
      showNotification('Please select a customer and product', 'error')
      return null
    }

    const boxes = parseInt(data.boxes) || 0
    const pieces = parseInt(data.pieces) || 0
    
    // Check stock before creating order
    const { data: productData, error: productError } = await supabase
      .from('bread_products')
      .select('*')
      .eq('id', parseInt(data.productId))
      .single()

    if (productError) {
      console.error('Error fetching product:', productError)
      showNotification('Product not found', 'error')
      return null
    }

    if (boxes > (productData.stock_boxes || 0)) {
      showNotification(`Not enough boxes! Available: ${productData.stock_boxes}`, 'error')
      return null
    }
    if (pieces > (productData.stock_pieces || 0)) {
      showNotification(`Not enough pieces! Available: ${productData.stock_pieces}`, 'error')
      return null
    }

    // Deduct inventory
    const newStockBoxes = Math.max(0, (productData.stock_boxes || 0) - boxes)
    const newStockPieces = Math.max(0, (productData.stock_pieces || 0) - pieces)

    await supabase
      .from('bread_products')
      .update({
        stock_boxes: newStockBoxes,
        stock_pieces: newStockPieces,
        updated_at: new Date().toISOString()
      })
      .eq('id', parseInt(data.productId))

    const sellingPricePerBox = parseFloat(data.sellingPricePerBox) || 0
    const sellingPricePerPiece = parseFloat(data.sellingPricePerPiece) || 0
    const costPerBox = parseFloat(data.costPerBox) || 0
    const costPerPiece = parseFloat(data.costPerPiece) || 0
    
    const totalSellingPrice = (boxes * sellingPricePerBox) + (pieces * sellingPricePerPiece)
    const totalCost = (boxes * costPerBox) + (pieces * costPerPiece)
    const profit = totalSellingPrice - totalCost

    const newOrder = {
      id: Date.now(),
      transaction_number: generateOrderNumber(),
      customer_id: parseInt(data.customerId),
      customer_name: data.customerName || '',
      product_id: parseInt(data.productId),
      product_name: data.productName || '',
      boxes: boxes,
      pieces: pieces,
      selling_price_per_box: sellingPricePerBox,
      selling_price_per_piece: sellingPricePerPiece,
      cost_per_box: costPerBox,
      cost_per_piece: costPerPiece,
      total_selling_price: totalSellingPrice,
      total_cost: totalCost,
      profit: profit,
      remaining_balance: totalSellingPrice,
      payments: [],
      status: data.status || 'pending',
      delivery_date: data.deliveryDate || null,
      notes: data.notes || '',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      is_deleted: false
    }

    console.log('📤 Inserting bread order:', newOrder)

    const { data: inserted, error } = await supabase
      .from('bread_orders')
      .insert([newOrder])
      .select()

    if (error) {
      console.error('❌ Supabase insert error:', error)
      showNotification('Failed to create order: ' + error.message, 'error')
      return null
    }

    console.log('✅ Bread order created:', inserted[0])
    setOrders(prev => [inserted[0], ...prev])
    showNotification(`Order ${inserted[0].transaction_number} created!`, 'success')
    addLog('Created', 'Bread Order', `Created order: ${inserted[0].transaction_number}`)
    
    // Refresh products to update stock display
    // You may want to call a refresh function here
    
    return inserted[0]
  } catch (error) {
    console.error('❌ Error adding order:', error)
    showNotification('Failed to create order: ' + error.message, 'error')
    return null
  }
}
