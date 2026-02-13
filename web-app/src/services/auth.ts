import api from "./api"

export interface LoginRequest {
  username: string
  password: string
}

export interface AuthResponse {
  token: string
  user: {
    id: number
    username: string
  }
}

export const authService = {
  login: async (data: LoginRequest): Promise<AuthResponse> => {
    const response = await api.post("/auth/login", data)
    localStorage.setItem("token", response.data.token)
    return response.data
  },

  register: async (data: LoginRequest): Promise<AuthResponse> => {
    const response = await api.post("/auth/register", data)
    localStorage.setItem("token", response.data.token)
    return response.data
  },

  logout: () => {
    localStorage.removeItem("token")
  },

  isAuthenticated: (): boolean => {
    return !!localStorage.getItem("token")
  },
}
