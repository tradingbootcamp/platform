import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { zodValidator } from '@tanstack/zod-adapter'
import { useMemo } from 'react'
import { z } from 'zod'
import { Board } from '../components/Board'
import type { ColumnData } from '../components/Column'

// Define dummy users (just strings now)
const dummyUsers = [
  'John Doe',
  'Jane Smith',
  'Bob Johnson',
  'Alice Williams',
  'Mike Brown',
  'Sarah Davis',
  'David Miller',
  'Emily Wilson',
  'Chris Moore',
  'Lisa Taylor',
]

// Define the search params schema
const searchParamsSchema = z.object({
  team_names: z.array(z.string()).default([]),
  team_allocation: z.array(z.array(z.string())).default([]),
})

export const Route = createFileRoute('/')({
  validateSearch: zodValidator(searchParamsSchema),
  component: HomePage,
})

function HomePage() {
  const { team_names, team_allocation } = Route.useSearch()
  const navigate = useNavigate({ from: Route.fullPath })

  // Find unallocated users - users not in any team
  const unallocatedUsers = useMemo(() => {
    const allocatedUsers = team_allocation.flat()
    return dummyUsers.filter((user) => !allocatedUsers.includes(user))
  }, [team_allocation])

  // Convert team_names and team_allocation to columns format for Board component
  // Include the unallocated users as a special column that isn't saved in the URL
  const columnsData: Array<ColumnData> = useMemo(() => {
    // Create columns for teams from URL state
    const teamColumns = team_names.map((title, index) => ({
      id: title.toLowerCase().replace(/\s+/g, '-'),
      title,
      userIds: team_allocation[index] || [],
    }))

    // Add the unallocated column at the beginning
    return [
      {
        id: 'unallocated',
        title: 'Unallocated',
        userIds: unallocatedUsers,
      },
      ...teamColumns,
    ]
  }, [team_names, team_allocation, unallocatedUsers])

  const handleBoardChange = (
    newTeamNames: Array<string>,
    newTeamAllocation: Array<Array<string>>,
  ) => {
    navigate({
      search: (prev) => ({
        ...prev,
        team_names: newTeamNames,
        team_allocation: newTeamAllocation,
      }),
    })
  }

  const copyBoardStateToClipboard = () => {
    const boardState = {
      team_names,
      team_allocation,
    }
    navigator.clipboard.writeText(JSON.stringify(boardState, null, 2))
  }

  return (
    <div className="flex flex-col h-screen">
      <header className="bg-gray-800 text-white p-4 flex justify-between items-center">
        <h1 className="text-2xl font-bold">Team Allocation Board</h1>
        <button
          onClick={copyBoardStateToClipboard}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded"
        >
          Copy as JSON
        </button>
      </header>

      <main className="flex-1 overflow-hidden">
        <Board
          users={dummyUsers}
          columns={columnsData}
          onBoardChange={(newColumns) => {
            // Convert columns back to team_names and team_allocation
            // Exclude the unallocated column from being saved in the URL
            const actualTeamColumns = newColumns.filter(
              (col) => col.id !== 'unallocated',
            )
            const newTeamNames = actualTeamColumns.map((col) => col.title)
            const newTeamAllocation = actualTeamColumns.map(
              (col) => col.userIds,
            )
            handleBoardChange(newTeamNames, newTeamAllocation)
          }}
        />
      </main>
    </div>
  )
}
