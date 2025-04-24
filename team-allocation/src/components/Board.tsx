import {
  DndContext,
  DragOverlay,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core'
import { arrayMove, sortableKeyboardCoordinates } from '@dnd-kit/sortable'
import React from 'react'
import { AddColumnButton } from './AddColumnButton'
import { Column } from './Column'
import { UserCard } from './UserCard'
import type { ColumnData } from './Column'
import type { DragEndEvent, DragOverEvent, DragStartEvent } from '@dnd-kit/core'

interface BoardProps {
  users: Array<string>
  columns: Array<ColumnData>
  onBoardChange: (columns: Array<ColumnData>) => void
}

export function Board({ users, columns, onBoardChange }: BoardProps) {
  const [activeUser, setActiveUser] = React.useState<string | null>(null)

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    }),
  )

  // Add helper to move a user from its current column to target column
  const moveUserToColumn = React.useCallback(
    (userId: string, targetColumnId: string) => {
      return columns.map((col) => {
        if (col.userIds.includes(userId)) {
          return { ...col, userIds: col.userIds.filter((id) => id !== userId) }
        }
        if (col.id === targetColumnId) {
          return { ...col, userIds: [...col.userIds, userId] }
        }
        return col
      })
    },
    [columns],
  )

  const handleDragStart = React.useCallback(
    (event: DragStartEvent) => {
      if (typeof event.active.id !== 'string') return
      const id = event.active.id
      if (users.includes(id)) {
        setActiveUser(id)
      }
    },
    [users],
  )

  const handleDragOver = React.useCallback(
    (event: DragOverEvent) => {
      const { active, over } = event
      if (!over) return

      const activeId = typeof active.id === 'string' ? active.id : ''
      if (!activeId) return

      if (!users.includes(activeId)) return

      const overColumn = columns.find((col) => col.id === over.id)
      const overUser =
        typeof over.id === 'string' && users.includes(over.id) ? over.id : null
      const overUserColumn = overUser
        ? columns.find((col) => col.userIds.includes(overUser))
        : null

      const sourceColumn = columns.find((col) => col.userIds.includes(activeId))

      if (overColumn) {
        if (sourceColumn?.id === overColumn.id) return
        const updatedColumns = moveUserToColumn(activeId, overColumn.id)
        onBoardChange(updatedColumns)
      } else if (overUser && overUserColumn) {
        if (sourceColumn?.id === overUserColumn.id) return
        const updatedColumns = moveUserToColumn(activeId, overUserColumn.id)
        onBoardChange(updatedColumns)
      }
    },
    [columns, users, moveUserToColumn, onBoardChange],
  )

  const handleDragEnd = React.useCallback(
    (event: DragEndEvent) => {
      setActiveUser(null)

      const { active, over } = event
      if (!over) return

      const activeId = typeof active.id === 'string' ? active.id : ''
      const overId = typeof over.id === 'string' ? over.id : ''
      if (!activeId || activeId === overId) return

      const activeColumnIndex = columns.findIndex((col) =>
        col.userIds.includes(activeId),
      )
      if (activeColumnIndex !== -1) {
        const activeColumn = columns[activeColumnIndex]
        const overItemIndex = activeColumn.userIds.indexOf(overId)
        if (overItemIndex !== -1) {
          const oldIndex = activeColumn.userIds.indexOf(activeId)
          const newUserIds = arrayMove(
            activeColumn.userIds,
            oldIndex,
            overItemIndex,
          )
          const updatedColumns = [...columns]
          updatedColumns[activeColumnIndex] = {
            ...activeColumn,
            userIds: newUserIds,
          }
          onBoardChange(updatedColumns)
        }
      }
    },
    [columns, onBoardChange],
  )

  const handleAddColumn = (title: string) => {
    const newColumn: ColumnData = {
      id: title.toLowerCase().replace(/\s+/g, '-'),
      title,
      userIds: [],
    }

    onBoardChange([...columns, newColumn])
  }

  const handleRenameColumn = (columnId: string, title: string) => {
    const updatedColumns = columns.map((col) =>
      col.id === columnId ? { ...col, title } : col,
    )

    onBoardChange(updatedColumns)
  }

  return (
    <DndContext
      sensors={sensors}
      onDragStart={handleDragStart}
      onDragOver={handleDragOver}
      onDragEnd={handleDragEnd}
    >
      <div className="flex gap-4 p-4 overflow-x-auto h-full">
        {columns.map((column) => (
          <Column
            key={column.id}
            column={column}
            users={users}
            onRenameColumn={handleRenameColumn}
          />
        ))}
        <AddColumnButton onAddColumn={handleAddColumn} />
      </div>

      {/* Custom drag overlay with explicit positioning */}
      <DragOverlay
        adjustScale={false}
        zIndex={9999}
        dropAnimation={{
          duration: 200,
          easing: 'cubic-bezier(0.18, 0.67, 0.6, 1.22)',
        }}
        className="absolute pointer-events-none origin-top-left box-border"
      >
        {activeUser ? <UserCard user={activeUser} isDragging={true} /> : null}
      </DragOverlay>
    </DndContext>
  )
}
