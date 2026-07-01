import React from 'react'
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  Filler
} from 'chart.js'
import { Line, Bar } from 'react-chartjs-2'
import { useTheme } from '../../context/ThemeContext'

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  Filler
)

const RevenueChart = () => {
  const { darkMode } = useTheme()

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top',
        labels: {
          color: darkMode ? '#e5e7eb' : '#374151',
          usePointStyle: true,
          padding: 20
        }
      },
      tooltip: {
        backgroundColor: darkMode ? '#1f2937' : '#ffffff',
        titleColor: darkMode ? '#e5e7eb' : '#111827',
        bodyColor: darkMode ? '#e5e7eb' : '#374151',
        borderColor: darkMode ? '#374151' : '#e5e7eb',
        borderWidth: 1
      }
    },
    scales: {
      y: {
        beginAtZero: true,
        grid: {
          color: darkMode ? '#374151' : '#e5e7eb'
        },
        ticks: {
          color: darkMode ? '#9ca3af' : '#6b7280'
        }
      },
      x: {
        grid: {
          color: darkMode ? '#374151' : '#e5e7eb'
        },
        ticks: {
          color: darkMode ? '#9ca3af' : '#6b7280'
        }
      }
    }
  }

  const data = {
    labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul'],
    datasets: [
      {
        label: 'Revenue',
        data: [6500, 7800, 9200, 8500, 9800, 11200, 12500],
        borderColor: '#0ea5e9',
        backgroundColor: darkMode 
          ? 'rgba(14, 165, 233, 0.2)'
          : 'rgba(14, 165, 233, 0.1)',
        fill: true,
        tension: 0.4,
        pointBackgroundColor: '#0ea5e9',
        pointBorderColor: darkMode ? '#1f2937' : '#ffffff',
        pointBorderWidth: 2,
        pointRadius: 4,
        pointHoverRadius: 6
      },
      {
        label: 'Expenses',
        data: [4200, 4800, 5200, 4900, 5600, 6100, 6800],
        borderColor: '#ef4444',
        backgroundColor: darkMode
          ? 'rgba(239, 68, 68, 0.2)'
          : 'rgba(239, 68, 68, 0.1)',
        fill: true,
        tension: 0.4,
        pointBackgroundColor: '#ef4444',
        pointBorderColor: darkMode ? '#1f2937' : '#ffffff',
        pointBorderWidth: 2,
        pointRadius: 4,
        pointHoverRadius: 6
      }
    ]
  }

  return (
    <div className="card">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
          Revenue Overview
        </h3>
        <div className="flex items-center gap-2">
          <button className="px-3 py-1 text-sm bg-primary-500 text-white rounded-lg hover:bg-primary-600 transition-colors">
            Monthly
          </button>
          <button className="px-3 py-1 text-sm text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors">
            Weekly
          </button>
        </div>
      </div>
      <div className="h-80">
        <Line options={options} data={data} />
      </div>
    </div>
  )
}

export default RevenueChart