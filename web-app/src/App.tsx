import React from "react"
import {
  BrowserRouter,
  Routes,
  Route,
  Navigate,
} from "react-router-dom"
import { QueryClient, QueryClientProvider } from "@tanstack/react-query"
import { Toaster } from "react-hot-toast"
import { LoginPage } from "~/pages/LoginPage"
import { DashboardPage } from "~/pages/DashboardPage"
import { authService } from "~/services/auth"
import "~/styles/index.css"

const queryClient = new QueryClient()

function PrivateRoute({ children }: { children: React.ReactNode }) {
  const isAuth = authService.isAuthenticated()
  return isAuth ? <>{children}</> : <Navigate to="/login" />
}

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route
            path="/"
            element={
              <PrivateRoute>
                <DashboardPage />
              </PrivateRoute>
            }
          />
        </Routes>
      </BrowserRouter>
      <Toaster position="top-right" />
    </QueryClientProvider>
  )
}
