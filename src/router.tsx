import { createRouter, createRootRoute, createRoute } from '@tanstack/react-router'
import { Layout } from './components/Layout.tsx'
import { Home } from './pages/Home.tsx'
import { Cars } from './pages/Cars.tsx'

const rootRoute = createRootRoute({
  component: Layout,
})

const indexRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/',
  component: Home,
})

const carsRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/cars',
  component: Cars,
})

const routeTree = rootRoute.addChildren([indexRoute, carsRoute])

export const router = createRouter({ routeTree })

declare module '@tanstack/react-router' {
  interface Register {
    router: typeof router
  }
}
