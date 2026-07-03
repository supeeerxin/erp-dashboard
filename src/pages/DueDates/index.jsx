import React, { useState, useMemo } from 'react'
import { 
  Calendar, 
  Clock, 
  Users, 
  Package, 
  DollarSign, 
  CreditCard, 
  ShoppingBag, 
  Bell, 
  AlertCircle, 
  CheckCircle, 
  ChevronLeft, 
  ChevronRight, 
  List,
  Car,
  Filter
} from 'lucide-react'
import { useRiceCredit } from '../../context/RiceCreditContext'
import { useCashLoans } from '../../context/CashLoanContext'
import { usePayables } from '../../context/PayableContext'
import { useBreadOrders } from '../../context/BreadOrderContext'
import { useRentals } from '../../context/RentalContext'
import { useCustomers } from '../../context/CustomerContext'
import { format, parseISO, isToday, isTomorrow, isAfter, isBefore, addDays, startOfMonth, endOfMonth, eachDayOfInterval, isSameDay, isWithinInterval } from 'date-fns'
import { useNavigate } from 'react-router-dom'

const DueDates = () => {
  const navigate = useNavigate()
  const [view, setView] = useState('list')
  const [filterType, setFilterType] = useState('all')
  const [currentDate, setCurrentDate] = useState(new Date())
  const [selectedDate, setSelectedDate] = useState(null)

  // Get data from contexts
  const { transactions: riceCredits } = useRiceCredit()
  const { loans: cashLoans } = useCashLoans()
  const { payables } = usePayables()
  const { orders: breadOrders } = useBreadOrders()
  const { rentals } = useRentals()
  const { getCustomer } = useCustomers()

  // Get all due items
  const dueItems = useMemo(() => {
    const items = []

    // Rice Credit due dates
    riceCredits?.forEach(t => {
      if (!t.isDeleted && t.status !== 'completed' && t.dueDate) {
        const dueDate = parseISO(t.dueDate)
        const customer = getCustomer(t.customerId)
        items.push({
          id: `rice-${t.id}`,
          type: 'rice-credit',
          title: 'Rice Credit Payment',
          customer: customer?.name || t.customerName || 'Unknown',
          amount: t.remainingBalance || 0,
          dueDate: dueDate,
          status: t.status || 'active',
          original: t,
          icon: Package,
          color: 'text-blue-500',
          bgColor: 'bg-blue-50 dark:bg-blue-900/20',
          borderColor: 'border-blue-200 dark:border-blue-800',
          route: '/rice-credit'
        })
      }
    })

    // Cash Loan due dates
    cashLoans?.forEach(l => {
      if (!l.isDeleted && l.status !== 'completed' && l.dueDate) {
        const dueDate = parseISO(l.dueDate)
        const customer = getCustomer(l.customerId)
        items.push({
          id: `loan-${l.id}`,
          type: 'cash-loan',
          title: 'Cash Loan Payment',
          customer: customer?.name || l.customerName || 'Unknown',
          amount: l.remainingBalance || 0,
          dueDate: dueDate,
          status: l.status || 'active',
          original: l,
          icon: DollarSign,
          color: 'text-green-500',
          bgColor: 'bg-green-50 dark:bg-green-900/20',
          borderColor: 'border-green-200 dark:border-green-800',
          route: '/cash-loans'
        })
      }
    })

    // Payables due dates
    payables?.forEach(p => {
      if (!p.isDeleted && p.status !== 'paid' && p.dueDate) {
        const dueDate = parseISO(p.dueDate)
        items.push({
          id: `payable-${p.id}`,
          type: 'payable',
          title: p.name || 'Payable',
          customer: p.category || 'Bill',
          amount: p.amount || 0,
          dueDate: dueDate,
          status: p.status || 'unpaid',
          original: p,
          icon: CreditCard,
          color: 'text-red-500',
          bgColor: 'bg-red-50 dark:bg-red-900/20',
          borderColor: 'border-red-200 dark:border-red-800',
          route: '/payables'
        })
      }
    })

    // Bread Order delivery dates
    breadOrders?.forEach(o => {
      if (!o.isDeleted && o.status !== 'completed' && o.deliveryDate) {
        const dueDate = parseISO(o.deliveryDate)
        const customer = getCustomer(o.customerId)
        items.push({
          id: `order-${o.id}`,
          type: 'bread-order',
          title: 'Bread Order Delivery',
          customer: customer?.name || o.customerName || 'Unknown',
          amount: o.totalSellingPrice || 0,
          dueDate: dueDate,
          status: o.status || 'pending',
          original: o,
          icon: ShoppingBag,
          color: 'text-yellow-500',
          bgColor: 'bg-yellow-50 dark:bg-yellow-900/20',
          borderColor: 'border-yellow-200 dark:border-yellow-800',
          route: '/bread-orders'
        })
      }
    })

    // Rental due dates (end dates)
    rentals?.forEach(r => {
      if (!r.isDeleted && r.status !== 'completed' && r.status !== 'cancelled' && r.end_date) {
        const dueDate = parseISO(r.end_date)
        const vehicle = r.vehicle_plate || 'Vehicle'
        items.push({
          id: `rental-${r.id}`,
          type: 'rental',
          title: 'Rental End Date',
          customer: r.driver_name || 'Unknown',
          amount: r.remaining_balance || 0,
          dueDate: dueDate,
          status: r.status || 'active',
          original: r,
          icon: Car,
          color: 'text-pink-500',
          bgColor: 'bg-pink-50 dark:bg-pink-900/20',
          borderColor: 'border-pink-200 dark:border-pink-800',
          route: '/car-rental'
        })
      }
    })

    // Sort by due date
    items.sort((a, b) => a.dueDate - b.dueDate)
    return items
  }, [riceCredits, cashLoans, payables, breadOrders, rentals, getCustomer])

  // Filter items
  const filteredItems = useMemo(() => {
    let items = dueItems

    if (filterType !== 'all') {
      items = items.filter(item => item.type === filterType)
    }

    if (selectedDate) {
      items = items.filter(item => isSameDay(item.dueDate, selectedDate))
    }

    return items
  }, [dueItems, filterType, selectedDate])

  // Get upcoming items (next 7 days)
  const upcomingItems = useMemo(() => {
    const today = new Date()
    const nextWeek = addDays(today, 7)
    return dueItems.filter(item => 
      isAfter(item.dueDate, today) && isBefore(item.dueDate, nextWeek)
    )
  }, [dueItems])

  // Get overdue items
  const overdueItems = useMemo(() => {
    const today = new Date()
    return dueItems.filter(item => 
      isBefore(item.dueDate, today) && item.status !== 'completed'
    )
  }, [dueItems])

  // Get today's items
  const todayItems = useMemo(() => {
    const today = new Date()
    return dueItems.filter(item => isToday(item.dueDate))
  }, [dueItems])

  // Calendar days
  const calendarDays = useMemo(() => {
    const start = startOfMonth(currentDate)
    const end = endOfMonth(currentDate)
    return eachDayOfInterval({ start, end })
  }, [currentDate])

  const getStatusBadge = (status) => {
    switch (status) {
      case 'overdue':
        return <span className="badge badge-danger"><AlertCircle className="w-3 h-3 mr-1" /> Overdue</span>
      case 'completed':
      case 'paid':
        return <span className="badge badge-success"><CheckCircle className="w-3 h-3 mr-1" /> Done</span>
      default:
        return <span className="badge badge-warning"><Clock className="w-3 h-3 mr-1" /> Pending</span>
    }
  }

  const getDueStatus = (date) => {
    const today = new Date()
    if (isToday(date)) return 'today'
    if (isTomorrow(date)) return 'tomorrow'
    if (isAfter(date, today)) return 'upcoming'
    return 'overdue'
  }

  const getDaysUntil = (date) => {
    const today = new Date()
    const diffTime = date - today
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
    if (diffDays < 0) return `${Math.abs(diffDays)} days overdue`
    if (diffDays === 0) return 'Today'
    if (diffDays === 1) return 'Tomorrow'
    return `${diffDays} days left`
  }

  const handleItemClick = (item) => {
    navigate(item.route)
  }

  const handlePrevMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1))
  }

  const handleNextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1))
  }

  const handleDateClick = (date) => {
    setSelectedDate(isSameDay(selectedDate || new Date(0), date) ? null : date)
  }

  const getDayItems = (date) => {
    return dueItems.filter(item => isSameDay(item.dueDate, date))
  }

  const getDayColor = (date) => {
    const items = getDayItems(date)
    if (items.length === 0) return ''
    const hasOverdue = items.some(i => i.status === 'overdue' || isBefore(i.dueDate, new Date()))
    const hasToday = items.some(i => isToday(i.dueDate))
    if (hasOverdue) return 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300'
    if (hasToday) return 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300'
    return 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-300'
  }

  const filterOptions = [
    { id: 'all', label: 'All', icon: Filter },
    { id: 'rice-credit', label: 'Rice Credit', icon: Package },
    { id: 'cash-loan', label: 'Cash Loans', icon: DollarSign },
    { id: 'payable', label: 'Bills', icon: CreditCard },
    { id: 'bread-order', label: 'Orders', icon: ShoppingBag },
    { id: 'rental', label: 'Rentals', icon: Car },
  ]

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
            <Calendar className="w-6 h-6 text-primary-500" />
            Due Dates & Reminders
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Track all upcoming payments, deliveries, rentals, and bills
          </p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => setView('list')}
            className={`btn-secondary flex items-center gap-2 ${view === 'list' ? 'bg-primary-500 text-white hover:bg-primary-600' : ''}`}
          >
            <List className="w-4 h-4" /> List
          </button>
          <button
            onClick={() => setView('calendar')}
            className={`btn-secondary flex items-center gap-2 ${view === 'calendar' ? 'bg-primary-500 text-white hover:bg-primary-600' : ''}`}
          >
            <Calendar className="w-4 h-4" /> Calendar
          </button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <div className="card p-4 bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-5 h-5 text-red-600 dark:text-red-400" />
            <p className="text-sm text-gray-600 dark:text-gray-400">Overdue</p>
          </div>
          <p className="text-2xl font-bold text-red-600 dark:text-red-400 mt-2">{overdueItems.length}</p>
        </div>
        <div className="card p-4 bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800">
          <div className="flex items-center gap-2">
            <Clock className="w-5 h-5 text-blue-600 dark:text-blue-400" />
            <p className="text-sm text-gray-600 dark:text-gray-400">Due Today</p>
          </div>
          <p className="text-2xl font-bold text-blue-600 dark:text-blue-400 mt-2">{todayItems.length}</p>
        </div>
        <div className="card p-4 bg-yellow-50 dark:bg-yellow-900/20 border-yellow-200 dark:border-yellow-800">
          <div className="flex items-center gap-2">
            <Bell className="w-5 h-5 text-yellow-600 dark:text-yellow-400" />
            <p className="text-sm text-gray-600 dark:text-gray-400">Upcoming (7 days)</p>
          </div>
          <p className="text-2xl font-bold text-yellow-600 dark:text-yellow-400 mt-2">{upcomingItems.length}</p>
        </div>
        <div className="card p-4 bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800">
          <div className="flex items-center gap-2">
            <CheckCircle className="w-5 h-5 text-green-600 dark:text-green-400" />
            <p className="text-sm text-gray-600 dark:text-gray-400">Total Items</p>
          </div>
          <p className="text-2xl font-bold text-green-600 dark:text-green-400 mt-2">{dueItems.length}</p>
        </div>
      </div>

      {/* Filters */}
      <div className="card">
        <div className="flex flex-wrap gap-2">
          {filterOptions.map((option) => {
            const Icon = option.icon
            const isActive = filterType === option.id
            return (
              <button
                key={option.id}
                onClick={() => setFilterType(option.id)}
                className={`btn-secondary text-sm px-3 py-1 flex items-center gap-1 ${
                  isActive ? 'bg-primary-500 text-white hover:bg-primary-600' : ''
                }`}
              >
                <Icon className="w-3 h-3" />
                {option.label}
              </button>
            )
          })}
        </div>
      </div>

      {/* List View */}
      {view === 'list' && (
        <div className="card">
          {filteredItems.length === 0 ? (
            <div className="empty-state">
              <Calendar className="empty-state-icon" />
              <p className="empty-state-text">No due items found</p>
              <p className="empty-state-subtext">
                {selectedDate ? 'No items due on this date' : 'All caught up! No pending due dates.'}
              </p>
              {selectedDate && (
                <button
                  onClick={() => setSelectedDate(null)}
                  className="btn-primary mt-4"
                >
                  Clear Filter
                </button>
              )}
            </div>
          ) : (
            <div className="space-y-3">
              {filteredItems.map((item) => {
                const Icon = item.icon
                const dueStatus = getDueStatus(item.dueDate)
                const daysUntil = getDaysUntil(item.dueDate)
                
                return (
                  <div
                    key={item.id}
                    onClick={() => handleItemClick(item)}
                    className={`p-4 rounded-lg border cursor-pointer transition-all hover:shadow-md ${item.borderColor} ${item.bgColor}`}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex items-start gap-3">
                        <div className={`p-2 rounded-lg ${item.bgColor}`}>
                          <Icon className={`w-5 h-5 ${item.color}`} />
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <h4 className="font-semibold text-gray-900 dark:text-white">{item.title}</h4>
                            <span className="text-xs text-gray-500 dark:text-gray-400 capitalize">{item.type.replace('-', ' ')}</span>
                          </div>
                          <p className="text-sm text-gray-600 dark:text-gray-400">
                            {item.customer}
                          </p>
                          <div className="flex items-center gap-3 mt-1">
                            <span className="text-sm font-medium text-gray-900 dark:text-white">
                              ₱{item.amount.toLocaleString()}
                            </span>
                            <span className={`text-xs font-medium ${dueStatus === 'overdue' ? 'text-red-500' : dueStatus === 'today' ? 'text-blue-500' : 'text-yellow-500'}`}>
                              {daysUntil}
                            </span>
                            {getStatusBadge(item.status)}
                          </div>
                          <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">
                            Due: {format(item.dueDate, 'MMM dd, yyyy')}
                          </p>
                        </div>
                      </div>
                      <button className="text-xs text-primary-500 hover:text-primary-600 font-medium">
                        View →
                      </button>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      )}

      {/* Calendar View */}
      {view === 'calendar' && (
        <div className="card">
          {/* Calendar Header */}
          <div className="flex items-center justify-between mb-4">
            <button onClick={handlePrevMonth} className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700">
              <ChevronLeft className="w-5 h-5" />
            </button>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              {format(currentDate, 'MMMM yyyy')}
            </h3>
            <button onClick={handleNextMonth} className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700">
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>

          {/* Calendar Grid */}
          <div className="grid grid-cols-7 gap-1">
            {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
              <div key={day} className="text-center text-xs font-medium text-gray-500 dark:text-gray-400 py-2">
                {day}
              </div>
            ))}
            
            {/* Empty days before start of month */}
            {Array.from({ length: calendarDays[0]?.getDay() || 0 }).map((_, i) => (
              <div key={`empty-${i}`} className="h-24 rounded-lg bg-gray-50 dark:bg-gray-800/30" />
            ))}
            
            {/* Calendar Days */}
            {calendarDays.map((date) => {
              const dayItems = getDayItems(date)
              const dayColor = getDayColor(date)
              const isSelected = selectedDate && isSameDay(date, selectedDate)
              const isTodayDate = isToday(date)
              
              return (
                <div
                  key={date.toString()}
                  onClick={() => handleDateClick(date)}
                  className={`h-24 rounded-lg p-1 cursor-pointer transition-all hover:scale-105 ${
                    isSelected ? 'ring-2 ring-primary-500' : ''
                  } ${
                    isTodayDate ? 'border-2 border-primary-500' : ''
                  } ${dayColor}`}
                >
                  <div className="flex justify-between items-start">
                    <span className={`text-xs font-medium ${isTodayDate ? 'text-primary-600 dark:text-primary-400' : ''}`}>
                      {format(date, 'd')}
                    </span>
                    {dayItems.length > 0 && (
                      <span className="text-xs bg-primary-500 text-white rounded-full px-1.5 py-0.5">
                        {dayItems.length}
                      </span>
                    )}
                  </div>
                  <div className="mt-1 space-y-0.5 overflow-hidden">
                    {dayItems.slice(0, 3).map((item, idx) => {
                      const Icon = item.icon
                      return (
                        <div key={idx} className="flex items-center gap-0.5 text-[10px] truncate">
                          <Icon className="w-2.5 h-2.5 flex-shrink-0" />
                          <span className="truncate">{item.customer}</span>
                        </div>
                      )
                    })}
                    {dayItems.length > 3 && (
                      <div className="text-[10px] text-gray-500 dark:text-gray-400">
                        +{dayItems.length - 3} more
                      </div>
                    )}
                  </div>
                </div>
              )
            })}
          </div>

          {/* Selected Date Details */}
          {selectedDate && (
            <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
              <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">
                Items for {format(selectedDate, 'MMMM dd, yyyy')}
              </h4>
              {getDayItems(selectedDate).length === 0 ? (
                <p className="text-sm text-gray-500 dark:text-gray-400">No items on this date</p>
              ) : (
                <div className="space-y-2">
                  {getDayItems(selectedDate).map((item) => {
                    const Icon = item.icon
                    return (
                      <div
                        key={item.id}
                        onClick={() => handleItemClick(item)}
                        className="flex items-center justify-between p-3 rounded-lg border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700/50 cursor-pointer"
                      >
                        <div className="flex items-center gap-3">
                          <Icon className={`w-4 h-4 ${item.color}`} />
                          <div>
                            <p className="text-sm font-medium text-gray-900 dark:text-white">{item.title}</p>
                            <p className="text-xs text-gray-500 dark:text-gray-400">{item.customer}</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-sm font-medium text-gray-900 dark:text-white">₱{item.amount.toLocaleString()}</p>
                          {getStatusBadge(item.status)}
                        </div>
                      </div>
                    )
                  })}
                </div>
              )}
              <button
                onClick={() => setSelectedDate(null)}
                className="mt-3 text-sm text-primary-500 hover:text-primary-600 font-medium"
              >
                Clear filter
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

export default DueDates
