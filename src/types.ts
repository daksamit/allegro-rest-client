export interface ClientConfig {
  app_name: string
  type: string
  client_id: string
  client_secret: string
  url_redirect?: string
}

export interface ClientOptions {
  sandbox?: boolean
  logger?: boolean
  account?: string
  storage?: any
}

export interface DeviceResponse {
  device_code: string
  expires_in: number
  user_code: string
  interval: number
  verification_uri: string
  verification_uri_complete: string
}

export interface AuthResponse {
  access_token: string
  refresh_token: string
  token_type: string
  created_at?: number /* seconds since 1970 */
  expires_in: number
  scope: string
  jti: string
}

export interface Error {
  error: string
  error_description: string
}
export interface Errors {
  errors: {
    code: string
    message: string
    details: any
    path: string
    userMessage: any
  }[]
}
