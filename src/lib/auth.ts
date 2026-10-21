import { api, ApiError, refreshAccessToken } from "@/lib/api"
import type { TypeRoles } from "@/types/users"
import { useAuthStore, type AuthUser } from "@/stores/auth"

// TODO: match these field names and the endpoint to the backend.
export type RegisterPayload = {
  userType: TypeRoles
  name: string
  email: string
  password: string
  referralByCode?: string
}

// Sign-up / sign-in response (the `data` part of the backend's { message, data }).
export type AuthResponse = {
  token: string
  user: AuthUser
}

export async function register(payload: RegisterPayload, userType: TypeRoles | undefined) {

  if(!userType) throw new Error("invalid user type");

  const res = await api.post<AuthResponse>(`/auth/${userType.toLowerCase()}/sign-up`, payload)
  // The backend returns the raw user row without userType, so add it from the endpoint we called.
  res.user = { ...res.user, userType }
  useAuthStore.getState().setAuth(res.token, res.user)
  return res
}

export type SignInPayload = {
  email: string
  password: string
  userType: TypeRoles
}

// TODO: confirm the sign-in endpoint matches the backend (assumed to mirror sign-up).
export async function signIn(payload: SignInPayload, userType: TypeRoles) {
  const res = await api.post<AuthResponse>(`/auth/${userType.toLowerCase()}/sign-in`, payload)
  res.user = { ...res.user, userType }
  useAuthStore.getState().setAuth(res.token, res.user)
  return res
}

// Loads the logged-in user's profile into the store.
export async function fetchCurrentUser() {
  const user = await api.get<AuthUser>("/auth/credential")
  useAuthStore.getState().setUser(user)
  return user
}

// Restores the session from the refresh-token cookie, then loads the user.
// Resolves to true if the user is logged in.
export async function refresh() {
  if (!(await refreshAccessToken())) return false
  try {
    await fetchCurrentUser()
  } catch {
    // Token is valid but the profile failed to load; stay logged in without it.
  }
  return true
}

// The backend clears the refresh-token cookie.
export async function logout() {
  try {
    await api.post("/auth/sign-out")
  } finally {
    // Log out locally even if the request fails.
    useAuthStore.getState().clearAuth()
  }
}

// TODO: match how the backend reports a bad referral code (status, error code or field name).
export function isReferralError(err: unknown): err is ApiError {
  return err instanceof ApiError && err.status === 400 && /referral|referal/i.test(err.message)
}
