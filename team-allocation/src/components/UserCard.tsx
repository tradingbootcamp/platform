import { useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'

interface UserCardProps {
  user: string
  isDragging?: boolean
}

export function UserCard({ user, isDragging = false }: UserCardProps) {
  const { attributes, listeners, setNodeRef, transform, transition } =
    useSortable({
      id: user,
      disabled: isDragging,
    })

  const nonDraggingStyle = {
    transform: CSS.Transform.toString(transform),
    transition,
  }
  // For drag overlay, we don't need inline styles as Tailwind classes are used
  const dragOverlayStyle = {}

  return (
    <div
      ref={isDragging ? undefined : setNodeRef}
      style={!isDragging ? nonDraggingStyle : dragOverlayStyle}
      {...(!isDragging && attributes)}
      {...(!isDragging && listeners)}
      className={
        !isDragging
          ? 'bg-white p-3 rounded shadow mb-2 flex items-center cursor-grab'
          : 'bg-white p-3 rounded shadow-lg border border-gray-300 mb-2 flex items-center w-80 h-16'
      }
    >
      <div className="w-8 h-8 rounded-full bg-gray-300 flex items-center justify-center mr-3">
        {user.charAt(0).toUpperCase()}
      </div>
      <span className="truncate">{user}</span>
    </div>
  )
}
