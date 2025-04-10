import type { ReactNode } from 'react'
import { useKindeAuth } from '@kinde-oss/kinde-auth-react'

interface AuthGuardProps {
  children: ReactNode
}

export function AuthGuard({ children }: AuthGuardProps) {
  const { isLoading, isAuthenticated, login } = useKindeAuth()

  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="text-center">
          <h2 className="text-xl font-semibold">Loading...</h2>
        </div>
      </div>
    )
  }

  if (!isAuthenticated) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="rounded-lg bg-white p-8 shadow-md text-center">
          <h2 className="mb-4 text-2xl font-bold">Please Sign In</h2>
          <p className="mb-6 text-gray-600">
            You need to be signed in to access this application.
          </p>
          <button
            onClick={() => login()}
            className="rounded bg-blue-600 px-4 py-2 text-white hover:bg-blue-700"
          >
            Sign In
          </button>
        </div>
      </div>
    )
  }

  return <>{children}</>
}
