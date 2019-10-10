import { AuthResponse } from "./types"

export const getExpiredIn = (tokens: AuthResponse): number => {
  let now = +new Date()
  if (!tokens || !tokens.created_at) return 0
  let expiration = new Date((tokens.expires_in + tokens.created_at) * 1000)
  let expHours = (+expiration - +now) / 1000 / 60 / 60
  return expHours
}