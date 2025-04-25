import { useState } from 'react'

interface PixieFilterProps {
  accountByPixieTransferAmount: Record<number, Array<number>>
  onChange: (excludedAmounts: Set<number | 'none'>) => void
}

export function PixieFilter({
  accountByPixieTransferAmount,
  onChange,
}: PixieFilterProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [excludedAmounts, setExcludedAmounts] = useState<Set<number | 'none'>>(
    new Set(),
  )

  const amounts = Object.keys(accountByPixieTransferAmount)
    .map(Number)
    .sort((a, b) => a - b)

  const handleToggleFilter = (amount: number | 'none') => {
    const newExcludedAmounts = new Set(excludedAmounts)

    if (excludedAmounts.has(amount)) {
      newExcludedAmounts.delete(amount)
    } else {
      newExcludedAmounts.add(amount)
    }

    setExcludedAmounts(newExcludedAmounts)
    onChange(newExcludedAmounts)
  }

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded flex items-center"
      >
        <span>Filter By Pixie</span>
        <svg
          className={`ml-2 h-4 w-4 transition-transform ${isOpen ? 'rotate-180' : ''}`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2"
            d="M19 9l-7 7-7-7"
          />
        </svg>
      </button>

      {isOpen && (
        <div className="absolute z-10 right-0 mt-2 w-56 bg-white border border-gray-200 rounded-md shadow-lg p-2 text-gray-800">
          <div className="p-2">
            <label className="flex items-center space-x-2 cursor-pointer text-gray-800">
              <input
                type="checkbox"
                checked={!excludedAmounts.has('none')}
                onChange={() => handleToggleFilter('none')}
                className="rounded"
              />
              <span>No Pixie</span>
            </label>

            {amounts.map((amount) => (
              <label
                key={amount}
                className="flex items-center space-x-2 mt-1 cursor-pointer text-gray-800"
              >
                <input
                  type="checkbox"
                  checked={!excludedAmounts.has(amount)}
                  onChange={() => handleToggleFilter(amount)}
                  className="rounded"
                />
                <span>Amount: {amount}</span>
              </label>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
