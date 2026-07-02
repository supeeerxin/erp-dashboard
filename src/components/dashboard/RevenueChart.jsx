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
import { Line } from 'react-chartjs-2'
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

const RevenueChart = ({ data, label }) => {
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
        borderWidth: 1,
        callbacks: {
          label: function(context) {
            return `₱${context.parsed.y.toLocaleString()}`
          }
        }
      }
    },
    scales: {
      y: {
        beginAtZero: true,
        grid: {
          color: darkMode ? '#374151' : '#e5e7eb'
        },
        ticks: {
          color: darkMode ? '#9ca3af' : '#6b7280',
          callback: function(value) {
            return '₱' + value.toLocaleString()
          }
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

  const chartData = {
    labels: data?.labels || ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul'],
    datasets: [
      {
        label: label || 'Revenue',
        data: data?.values || [0, 0, 0, 0, 0, 0, 0],
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
      }
    ]
  }

  return (
    <div className="card">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
          {label || 'Revenue Overview'}
        </h3>
      </div>
      <div className="h-72">
        <Line options={options} data={chartData} />
      </div>
    </div>
  )
}

export default RevenueChart
