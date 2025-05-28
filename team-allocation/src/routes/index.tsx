import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { zodValidator } from '@tanstack/zod-adapter'
import { useMemo, useState } from 'react'
import { z } from 'zod'
import { useKindeAuth } from '@kinde-oss/kinde-auth-react'
import { Board } from '../components/Board'
import { PixieFilter } from '../components/PixieFilter'
import type { ColumnData } from '../components/Column'
import { useServerAccounts } from '@/lib/api'

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
  const { user, logout } = useKindeAuth()
  const { accounts, accountByPixieTransferAmount } = useServerAccounts()
  const [excludedPixieAmounts, setExcludedPixieAmounts] = useState<
    Set<number | 'none'>
  >(new Set())

  const filteredAccounts = useMemo(() => {
    return accounts.filter((account) => {
      if (!account.isUser) return false

      const accountId = account.id

      const hasPixieTransfer = Object.values(accountByPixieTransferAmount).some(
        (ids) => ids.includes(accountId),
      )

      if (!hasPixieTransfer && excludedPixieAmounts.has('none')) {
        return false
      }

      if (hasPixieTransfer) {
        for (const [amount, accountIds] of Object.entries(
          accountByPixieTransferAmount,
        )) {
          const numericAmount = Number(amount)
          if (
            accountIds.includes(accountId) &&
            excludedPixieAmounts.has(numericAmount)
          ) {
            return false
          }
        }
      }

      return true
    })
  }, [accounts, accountByPixieTransferAmount, excludedPixieAmounts])

  const accountNames = filteredAccounts.map((account) => account.name || '')

  // Find unallocated users - users not in any team
  const unallocatedUsers = useMemo(() => {
    const allocatedUsers = team_allocation.flat()
    return accountNames.filter((account) => !allocatedUsers.includes(account))
  }, [team_allocation, accountNames])

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
      team_allocation: team_allocation.map((team) =>
        team.filter((name) => accountNames.includes(name)),
      ),
    }
    navigator.clipboard.writeText(JSON.stringify(boardState, null, 2))
  }

  return (
    <div className="flex flex-col h-screen">
      <header className="bg-gray-800 text-white p-4 flex justify-between items-center">
        <div className="flex items-center space-x-4">
          <h1 className="text-2xl font-bold">Team Allocation Board</h1>
        </div>
        <div className="flex items-center space-x-4">
          <PixieFilter
            accountByPixieTransferAmount={accountByPixieTransferAmount}
            onChange={setExcludedPixieAmounts}
          />
          <button
            onClick={copyBoardStateToClipboard}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded"
          >
            Copy as JSON
          </button>
          {user && (
            <div className="text-sm">Hello, {user.givenName || user.email}</div>
          )}
          <button
            onClick={() => logout()}
            className="bg-red-600 hover:bg-red-700 text-white px-3 py-1 text-sm rounded"
          >
            Sign Out
          </button>
        </div>
      </header>

      <main className="flex-1 overflow-hidden">
        <Board
          users={accountNames}
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
