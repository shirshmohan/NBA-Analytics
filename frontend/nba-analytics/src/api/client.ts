const BASE_URL = import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:8000'

export class ApiError extends Error {
  constructor(public status: number, message: string) {
    super(message)
    this.name = 'ApiError'
  }
}

function buildUrl(path: string, params?: Record<string, string | number | boolean | undefined | null>): string {
  const url = new URL(`${BASE_URL}${path}`)
  if (params) {
    Object.entries(params).forEach(([key, val]) => {
      if (val !== undefined && val !== null && val !== '') {
        url.searchParams.set(key, String(val))
      }
    })
  }
  return url.toString()
}

export async function apiGet<T>(
  path: string,
  params?: Record<string, string | number | boolean | undefined | null>
): Promise<T> {
  const url = buildUrl(path, params)
  const response = await fetch(url, {
    headers: { 'Content-Type': 'application/json' },
  })

  if (!response.ok) {
    let message = `HTTP ${response.status}`
    try {
      const body = await response.json()
      message = body.detail ?? body.message ?? message
    } catch {}
    throw new ApiError(response.status, message)
  }

  return response.json() as Promise<T>
}

export function mockDelay<T>(data: T, ms = 400): Promise<T> {
  return new Promise(resolve => setTimeout(() => resolve(data), ms))
}

export function shouldUseMocks(): boolean {
  try {
    const stored = localStorage.getItem('nba-settings')
    if (stored) {
      const parsed = JSON.parse(stored)
      if (parsed.useMockData !== undefined) return parsed.useMockData
    }
  } catch {}
  return import.meta.env.VITE_USE_MOCKS === 'true'
}
