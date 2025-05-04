import { API_BASE_URL } from "./config"

export async function getAuthToken() {
  if (typeof window !== "undefined") {
    return localStorage.getItem("adminToken")
  }
  return null
}

export async function fetchWithAuth(endpoint: string, options: RequestInit = {}) {
  const token = await getAuthToken()

  // Đảm bảo endpoint không bắt đầu bằng "/"
  const normalizedEndpoint = endpoint.startsWith("/") ? endpoint.substring(1) : endpoint

  // Tạo URL đầy đủ
  const url = `${API_BASE_URL}/${normalizedEndpoint}`

  const headers = {
    "Content-Type": "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...options.headers,
  }

  // Thêm timeout để tránh request treo quá lâu
  const controller = new AbortController()
  const timeoutId = setTimeout(() => controller.abort(), 30000)

  try {
    const response = await fetch(url, {
      ...options,
      headers,
      signal: controller.signal,
    })

    return response
  } finally {
    clearTimeout(timeoutId)
  }
}

export function isAuthenticated() {
  if (typeof window !== "undefined") {
    const token = localStorage.getItem("adminToken")
    return !!token
  }
  return false
}

export function logout() {
  if (typeof window !== "undefined") {
    localStorage.removeItem("adminToken")
    window.location.href = "/login"
  }
}
