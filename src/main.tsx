import ReactDOM from 'react-dom/client'
import { RouterProvider } from 'react-router-dom'
import { QueryClientProvider } from '@tanstack/react-query'
import { router } from './routes/router'
import { API_ORIGIN } from './api/apiConfig'
import { queryClient } from './api/queryClient'
import './index.css'

const installContentSecurityPolicy = () => {
  if (typeof document === "undefined") {
    return
  }

  if (document.querySelector('meta[http-equiv="Content-Security-Policy"]')) {
    return
  }

  const connectTargets = new Set(["'self'"])
  if (API_ORIGIN) {
    connectTargets.add(API_ORIGIN)
  }

  const policy = [
    "default-src 'self'",
    "script-src 'self'",
    `connect-src ${Array.from(connectTargets).join(" ")}`,
    "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
    "font-src 'self' https://fonts.gstatic.com",
    "img-src 'self' data: blob:",
    "media-src 'self' blob:",
    "frame-src 'self' blob:",
    "worker-src 'self' blob:",
    "object-src 'self' blob:",
    "base-uri 'self'",
    "form-action 'self'",
    "upgrade-insecure-requests",
  ].join("; ")

  const meta = document.createElement("meta")
  meta.httpEquiv = "Content-Security-Policy"
  meta.content = policy
  document.head.appendChild(meta)
}

installContentSecurityPolicy()

ReactDOM.createRoot(document.getElementById('root')!).render(
  <QueryClientProvider client={queryClient}>
    <RouterProvider router={router} />
  </QueryClientProvider>
)
