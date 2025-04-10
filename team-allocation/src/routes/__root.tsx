import { Outlet, createRootRoute } from '@tanstack/react-router'
import { TanStackRouterDevtools } from '@tanstack/react-router-devtools'
import { AuthGuard } from '../components/AuthGuard'

export const Route = createRootRoute({
  component: () => (
    <>
      <AuthGuard>
        <Outlet />
      </AuthGuard>
      <TanStackRouterDevtools />
    </>
  ),
})
