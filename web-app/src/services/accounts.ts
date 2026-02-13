import api from "./api"

export interface Account {
  id: string
  name: string
  site_url: string
  site_type: string
  access_token?: string
  cookies?: string
  quota?: number
  used?: number
  income?: number
  recharge_ratio?: number
  health_status?: string
  last_refresh_at?: number
  auto_refresh_enabled: boolean
  tags: string[]
  data: Record<string, any>
  created_at: number
  updated_at: number
}

export const accountService = {
  getAll: async (): Promise<Account[]> => {
    const response = await api.get("/accounts")
    return response.data
  },

  getById: async (id: string): Promise<Account> => {
    const response = await api.get(`/accounts/${id}`)
    return response.data
  },

  create: async (account: Partial<Account>): Promise<{ id: string }> => {
    const response = await api.post("/accounts", account)
    return response.data
  },

  update: async (id: string, updates: Partial<Account>): Promise<void> => {
    await api.put(`/accounts/${id}`, updates)
  },

  delete: async (id: string): Promise<void> => {
    await api.delete(`/accounts/${id}`)
  },

  getTokens: async (accountId: string): Promise<any[]> => {
    const response = await api.get(`/accounts/${accountId}/tokens`)
    return response.data
  },
}
