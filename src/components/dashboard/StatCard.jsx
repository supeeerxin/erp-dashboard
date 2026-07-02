import React from 'react'
import { ArrowUp, ArrowDown } from 'lucide-react'

const StatCard = ({ title, value, icon: Icon, color, subtitle, trend, trendValue }) => {
  return (
    <div className="card card-hover">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
            {title}
          </p>
          <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">
            {value}
          </p>
          {subtitle && (
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
              {subtitle}
            </p>
          )}
          {trend && (
            <div className="flex items-center gap-1 mt-2">
              {trend === 'up' ? (
                <ArrowUp className="w-4 h-4 text-green-500" />
              ) : (
                <ArrowDown className="w-4 h-4 text-red-500" />
              )}
              <span className={`text-sm font-medium ${
                trend === 'up' ? 'text-green-500' : 'text-red-500'
              }`}>
                {trendValue}
              </span>
              <span className="text-sm text-gray-500 dark:text-gray-400 ml-1">
                vs last month
              </span>
            </div>
          )}
        </div>
        <div className={`p-3 rounded-xl bg-opacity-10 ${color}`}>
          <Icon className={`w-6 h-6 ${color}`} />
        </div>
      </div>
    </div>
  )
}

export default StatCard
