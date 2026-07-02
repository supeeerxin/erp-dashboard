// Generate unique transaction number
export const generateTransactionNumber = (prefix = 'TRX') => {
  const date = new Date()
  const year = date.getFullYear().toString().slice(-2)
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  
  // Get last transaction number from localStorage
  const lastNumber = parseInt(localStorage.getItem('lastTransactionNumber') || '0')
  const newNumber = lastNumber + 1
  localStorage.setItem('lastTransactionNumber', String(newNumber))
  
  // Format: TRX-2026-07-0001
  const sequence = String(newNumber).padStart(4, '0')
  return `${prefix}-${year}${month}${day}-${sequence}`
}

// Format: RICE-2026-07-0001 for rice credit
export const generateRiceCreditNumber = () => {
  return generateTransactionNumber('RICE')
}

// Format: LOAN-2026-07-0001 for cash loans
export const generateLoanNumber = () => {
  return generateTransactionNumber('LOAN')
}

// Format: ORDER-2026-07-0001 for bread orders
export const generateOrderNumber = () => {
  return generateTransactionNumber('ORDER')
}

// Format: INC-2026-07-0001 for income
export const generateIncomeNumber = () => {
  return generateTransactionNumber('INC')
}

// Format: EXP-2026-07-0001 for expenses
export const generateExpenseNumber = () => {
  return generateTransactionNumber('EXP')
}