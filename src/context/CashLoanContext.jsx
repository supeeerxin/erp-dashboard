const addLoan = async (data) => {
  try {
    console.log('📝 Adding loan with data:', data)
    
    // Validate required fields
    if (!data.customerId || !data.principal) {
      showNotification('Please select a customer and enter principal amount', 'error')
      return null
    }

    const principal = parseFloat(data.principal) || 0
    const interestRate = parseFloat(data.interestRate) || 0
    const interestType = data.interestType || 'fixed'
    const interestAmount = interestType === 'percentage' 
      ? (principal * interestRate / 100) 
      : interestRate
    
    const totalPayable = principal + interestAmount
    const downPayment = parseFloat(data.downPayment) || 0
    const numberOfPayments = parseInt(data.numberOfPayments) || 1
    const remainingBalance = totalPayable - downPayment
    const paymentPerGive = numberOfPayments > 1 ? remainingBalance / numberOfPayments : remainingBalance

    const initialPayments = downPayment > 0 ? [{
      id: Date.now(),
      amount: downPayment,
      date: new Date().toISOString(),
      type: 'downpayment'
    }] : []

    const newLoan = {
      id: Date.now(),
      transaction_number: generateLoanNumber(),
      customer_id: parseInt(data.customerId),
      customer_name: data.customerName || '',
      principal: principal,
      interest_rate: interestRate,
      interest_type: interestType,
      interest_amount: interestAmount,
      total_payable: totalPayable,
      down_payment: downPayment,
      number_of_payments: numberOfPayments,
      payment_per_give: paymentPerGive,
      remaining_balance: remainingBalance,
      status: remainingBalance <= 0 ? 'completed' : 'active',
      due_date: data.dueDate || null,
      payment_term: data.paymentTerm || 'months',
      term_value: parseInt(data.termValue) || 1,
      payments: initialPayments,
      description: data.description || '',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      is_deleted: false
    }

    console.log('📤 Inserting loan:', newLoan)

    const { data: inserted, error } = await supabase
      .from('cash_loans')
      .insert([newLoan])
      .select()

    if (error) {
      console.error('❌ Supabase insert error:', error)
      showNotification('Failed to create loan: ' + error.message, 'error')
      return null
    }

    console.log('✅ Loan created:', inserted[0])
    setLoans(prev => [inserted[0], ...prev])
    showNotification(`Loan ${inserted[0].transaction_number} created!`, 'success')
    addLog('Created', 'Cash Loan', `Created loan: ${inserted[0].transaction_number} for ₱${principal}`)
    return inserted[0]
  } catch (error) {
    console.error('❌ Error adding loan:', error)
    showNotification('Failed to create loan: ' + error.message, 'error')
    return null
  }
}
