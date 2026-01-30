import { useState } from 'react'
import {
  SHOE_SIZES_EU,
  APPAREL_SIZES
} from '../../lib/sizeConversion'

export default function SizePicker({ selectedSizes = [], onChange, type = 'shoes' }) {
  const [activeTab, setActiveTab] = useState('all')

  const sizeGroups = type === 'apparel'
    ? { all: APPAREL_SIZES }
    : {
        all: SHOE_SIZES_EU,
        adult: SHOE_SIZES_EU.filter(s => s >= 35),
        kids: SHOE_SIZES_EU.filter(s => s < 35)
      }

  const toggleSize = (size) => {
    const sizeStr = size.toString()
    const newSizes = selectedSizes.includes(sizeStr)
      ? selectedSizes.filter(s => s !== sizeStr)
      : [...selectedSizes, sizeStr]
    onChange(newSizes)
  }

  const selectAll = () => {
    const allSizes = sizeGroups[activeTab].map(s => s.toString())
    // Add to existing sizes (avoid duplicates)
    const newSizes = [...new Set([...selectedSizes, ...allSizes])]
    onChange(newSizes)
  }

  const clearAll = () => {
    onChange([])
  }

  const currentSizes = sizeGroups[activeTab]

  return (
    <div className="space-y-3">
      {/* Header with actions */}
      <div className="flex items-center justify-between">
        <div className="flex gap-2">
          {type === 'shoes' && (
            <>
              <button
                type="button"
                onClick={() => setActiveTab('all')}
                className={`px-3 py-1 rounded-lg text-sm font-medium transition-colors ${
                  activeTab === 'all'
                    ? 'bg-gray-900 dark:bg-gray-100 text-white dark:text-black'
                    : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300'
                }`}
              >
                All
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('adult')}
                className={`px-3 py-1 rounded-lg text-sm font-medium transition-colors ${
                  activeTab === 'adult'
                    ? 'bg-gray-900 dark:bg-gray-100 text-white dark:text-black'
                    : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300'
                }`}
              >
                Adult
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('kids')}
                className={`px-3 py-1 rounded-lg text-sm font-medium transition-colors ${
                  activeTab === 'kids'
                    ? 'bg-gray-900 dark:bg-gray-100 text-white dark:text-black'
                    : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300'
                }`}
              >
                Kids
              </button>
            </>
          )}
        </div>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={selectAll}
            className="text-xs text-blue-600 dark:text-blue-400 hover:underline"
          >
            Select All
          </button>
          <button
            type="button"
            onClick={clearAll}
            className="text-xs text-red-600 dark:text-red-400 hover:underline"
          >
            Clear
          </button>
        </div>
      </div>

      {/* Selected count */}
      <div className="text-sm text-gray-600 dark:text-gray-400">
        {selectedSizes.length} size{selectedSizes.length !== 1 ? 's' : ''} selected
        {selectedSizes.length > 0 && (
          <span className="ml-2 text-xs text-gray-500 dark:text-gray-500">
            ({selectedSizes.sort((a, b) => parseInt(a) - parseInt(b)).join(', ')})
          </span>
        )}
      </div>

      {/* Size grid */}
      <div className="grid grid-cols-6 sm:grid-cols-8 md:grid-cols-10 gap-2 p-4 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 max-h-64 overflow-y-auto">
        {currentSizes.map((size) => {
          const sizeStr = size.toString()
          const isSelected = selectedSizes.includes(sizeStr)
          return (
            <button
              key={size}
              type="button"
              onClick={() => toggleSize(size)}
              className={`px-2 py-2 rounded-lg text-sm font-medium transition-colors ${
                isSelected
                  ? 'bg-black text-white dark:bg-white dark:text-black ring-2 ring-blue-500'
                  : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
              }`}
            >
              {type === 'shoes' ? `EU ${size}` : size}
            </button>
          )
        })}
      </div>

      {/* Helper text */}
      <p className="text-xs text-gray-500 dark:text-gray-500">
        {type === 'shoes'
          ? 'Sizes are stored in EU format. US sizes will be automatically converted for customers.'
          : 'Select all applicable sizes for this apparel item.'}
      </p>
    </div>
  )
}
