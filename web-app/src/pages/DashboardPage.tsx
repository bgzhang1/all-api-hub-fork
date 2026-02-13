import React from "react"
import { useQuery } from "@tanstack/react-query"
import { accountService } from "~/services/accounts"
import toast from "react-hot-toast"

export function DashboardPage() {
  const { data: accounts, isLoading, error } = useQuery({
    queryKey: ["accounts"],
    queryFn: accountService.getAll,
  })

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-lg">加载中...</div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-lg text-red-600">加载失败</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <nav className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <h1 className="text-xl font-semibold">All API Hub</h1>
            </div>
            <div className="flex items-center">
              <button
                onClick={() => {
                  authService.logout()
                  window.location.href = "/login"
                }}
                className="text-gray-700 hover:text-gray-900"
              >
                退出登录
              </button>
            </div>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          <div className="mb-4">
            <h2 className="text-2xl font-bold text-gray-900">账户管理</h2>
            <p className="mt-1 text-sm text-gray-600">
              管理您的所有 API 账户
            </p>
          </div>

          {accounts && accounts.length === 0 ? (
            <div className="bg-white shadow rounded-lg p-6 text-center">
              <p className="text-gray-500">暂无账户，请添加账户</p>
            </div>
          ) : (
            <div className="bg-white shadow overflow-hidden sm:rounded-md">
              <ul className="divide-y divide-gray-200">
                {accounts?.map((account) => (
                  <li key={account.id}>
                    <div className="px-4 py-4 sm:px-6">
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <p className="text-sm font-medium text-indigo-600 truncate">
                            {account.name}
                          </p>
                          <div className="mt-2 flex items-center text-sm text-gray-500">
                            <span className="truncate">{account.site_url}</span>
                          </div>
                        </div>
                        <div className="ml-2 flex-shrink-0 flex">
                          <p className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                            {account.site_type}
                          </p>
                        </div>
                      </div>
                      <div className="mt-2 sm:flex sm:justify-between">
                        <div className="sm:flex">
                          <p className="flex items-center text-sm text-gray-500">
                            余额: {account.quota?.toFixed(2) || "N/A"}
                          </p>
                          <p className="mt-2 flex items-center text-sm text-gray-500 sm:mt-0 sm:ml-6">
                            已用: {account.used?.toFixed(2) || "N/A"}
                          </p>
                        </div>
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </main>
    </div>
  )
}

import { authService } from "~/services/auth"
