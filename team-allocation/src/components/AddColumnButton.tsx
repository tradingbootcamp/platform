import React, { useState } from 'react'

interface AddColumnButtonProps {
  onAddColumn: (title: string) => void
}

export function AddColumnButton({ onAddColumn }: AddColumnButtonProps) {
  const [isAdding, setIsAdding] = useState(false)
  const [title, setTitle] = useState('')

  const handleSubmit = () => {
    if (title.trim()) {
      onAddColumn(title.trim())
      setTitle('')
    }
    setIsAdding(false)
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSubmit()
    } else if (e.key === 'Escape') {
      setTitle('')
      setIsAdding(false)
    }
  }

  if (isAdding) {
    return (
      <div className="bg-gray-100 rounded-lg p-4 w-80 h-min">
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          onBlur={handleSubmit}
          onKeyDown={handleKeyDown}
          placeholder="Enter column title..."
          className="w-full p-2 border border-gray-300 rounded"
          autoFocus
        />
      </div>
    )
  }

  return (
    <button
      onClick={() => setIsAdding(true)}
      className="bg-gray-100 hover:bg-gray-200 rounded-lg p-4 w-80 h-16 flex items-center justify-center cursor-pointer"
    >
      <span className="text-gray-600">+ Add Column</span>
    </button>
  )
}
