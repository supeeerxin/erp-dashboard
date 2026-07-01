import React from 'react'

const LoadingSkeleton = () => {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-4 md:p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header Skeleton */}
        <div className="flex justify-between items-center mb-6">
          <div className="skeleton h-10 w-48"></div>
          <div className="flex gap-3">
            <div className="skeleton h-10 w-10 rounded-full"></div>
            <div className="skeleton h-10 w-10 rounded-full"></div>
          </div>
        </div>

        {/* Stats Skeleton */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="card">
              <div className="skeleton h-4 w-24 mb-2"></div>
              <div className="skeleton h-8 w-32"></div>
              <div className="skeleton h-4 w-20 mt-2"></div>
            </div>
          ))}
        </div>

        {/* Charts Skeleton */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-6">
          <div className="card">
            <div className="skeleton h-6 w-40 mb-4"></div>
            <div className="skeleton h-64 w-full"></div>
          </div>
          <div className="card">
            <div className="skeleton h-6 w-40 mb-4"></div>
            <div className="skeleton h-64 w-full"></div>
          </div>
        </div>

        {/* Table Skeleton */}
        <div className="card">
          <div className="skeleton h-6 w-40 mb-4"></div>
          <div className="space-y-3">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="flex gap-4">
                <div className="skeleton h-12 flex-1"></div>
                <div className="skeleton h-12 flex-1"></div>
                <div className="skeleton h-12 flex-1"></div>
                <div className="skeleton h-12 w-24"></div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

export default LoadingSkeleton