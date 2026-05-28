import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { createBrowserRouter, RouterProvider } from 'react-router-dom'
import './styles/globals.css'
import { PlpRoute } from './routes/plp'
import { RouteErrorBoundary } from './routes/error-boundary'

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 60_000,
      gcTime: 5 * 60_000,
      refetchOnWindowFocus: false,
      retry: 2,
    },
  },
})

const router = createBrowserRouter([
  {
    path: '/',
    element: <PlpRoute />,
    errorElement: <RouteErrorBoundary />,
  },
])

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <QueryClientProvider client={queryClient}>
      <RouterProvider router={router} />
    </QueryClientProvider>
  </StrictMode>,
)
