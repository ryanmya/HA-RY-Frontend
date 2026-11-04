import { create } from "zustand"
import type { TypeRoles } from "@/types/users"

// TODO: match to the user object the backend returns.
export type AuthUser = {
  id: string
  name: string
  email: string
  userType: TypeRoles
  role?: "ADMIN" | "SUPER_ADMIN"
  profilePicture?: string | null
  referralCode?: string | null
  point?: number
}

type AuthState = {
  // Kept in memory only (never localStorage). The refresh token lives in an httpOnly cookie.
  accessToken: string | null
  user: AuthUser | null
  // Leaving user out keeps the current one (e.g. a token refresh doesn't return the user).
  setAuth: (accessToken: string, user?: AuthUser | null) => void
  setUser: (user: AuthUser | null) => void
  clearAuth: () => void
}

export const useAuthStore = create<AuthState>()((set) => ({
  accessToken: null,
  user: null,
  setAuth: (accessToken, user) =>
    set(user === undefined ? { accessToken } : { accessToken, user }),
  setUser: (user) => set({ user }),
  clearAuth: () => set({ accessToken: null, user: null }),
}))
