import { useDroppable } from '@dnd-kit/core'
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable'
import React from 'react'
import { UserCard } from './UserCard'

export interface ColumnData {
  id: string
  title: string
  userIds: Array<string>
}

interface ColumnProps {
  column: ColumnData
  users: Array<string>
  onRenameColumn: (id: string, title: string) => void
}

export function Column({ column, users, onRenameColumn }: ColumnProps) {
  const [isEditing, setIsEditing] = React.useState(false)
  const [title, setTitle] = React.useState(column.title)
  const { setNodeRef, isOver } = useDroppable({ id: column.id })

  const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setTitle(e.target.value)
  }

  const handleTitleSave = () => {
    if (title.trim()) {
      onRenameColumn(column.id, title)
    } else {
      setTitle(column.title)
    }
    setIsEditing(false)
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleTitleSave()
    } else if (e.key === 'Escape') {
      setTitle(column.title)
      setIsEditing(false)
    }
  }

  // Filter users that belong to this column
  const columnUsers = users.filter((user) => column.userIds.includes(user))

  return (
    <div
      ref={setNodeRef}
      className={`bg-gray-100 rounded-lg p-4 w-80 h-full flex flex-col ${
        isOver ? 'ring-2 ring-blue-500 bg-gray-50' : ''
      }`}
    >
      <div className="mb-3 flex items-center justify-between">
        {isEditing ? (
          <input
            type="text"
            value={title}
            onChange={handleTitleChange}
            onBlur={handleTitleSave}
            onKeyDown={handleKeyDown}
            className="w-full p-1 border border-gray-300 rounded"
            autoFocus
          />
        ) : (
          <h3
            className="text-lg font-semibold cursor-pointer"
            onClick={() => setIsEditing(true)}
          >
            {column.title}
          </h3>
        )}
        <span className="text-sm bg-gray-200 rounded-full px-2 py-1 ml-2">
          {columnUsers.length}
        </span>
      </div>

      <div className="flex-1 overflow-y-auto">
        <SortableContext
          items={columnUsers}
          strategy={verticalListSortingStrategy}
        >
          {columnUsers.map((user) => (
            <UserCard key={user} user={user} />
          ))}
        </SortableContext>
      </div>
    </div>
  )
}
