import { getExpiredIn } from "./helpers"
import { AuthResponse, ClientConfig, ClientOptions } from "./types"

const request = require("request")
const jwt = require("jsonwebtoken")

const allegroApi = function (config: ClientConfig, options: ClientOptions) {
  let baseUrl: string = 'https://allegro.pl'
  let apiUrl: string = 'https://api.allegro.pl'
  if (options && options.sandbox === true) {
    baseUrl = 'https://allegro.pl.allegrosandbox.pl'
    apiUrl = 'https://api.allegro.pl.allegrosandbox.pl'
  }
  let isLogging: boolean = false
  if (options && options.logger === true) {
    isLogging = true
  }
  let tokens: AuthResponse
  const oauthUser: any = Buffer.from(`${config.client_id}:${config.client_secret}`).toString('base64')
  const account: string = options && options.account || 'default'

  const refresh = async (): Promise<AuthResponse | any> => {
    if (!tokens || !tokens.refresh_token) {
      return Promise.reject({
        error: 'missing_refresh_token',
        error_description: 'Refresh token is missing or not stored in the app.'
      })
    }
    if (isLogging) {
      console.info(`app_name: ${config.app_name}, account: ${account}, refreshing tokens...`)
    }
    return new Promise((resolve, reject) => {
      const refreshOptions = {
        method: 'POST',
        uri: `${baseUrl}/auth/oauth/token?`
          + `grant_type=refresh_token&`
          + `refresh_token=${tokens.refresh_token}&`
          + `redirect_uri=${config.url_redirect}`,
        headers: {
          Authorization: `Basic ${oauthUser}`,
        }
      }
      request(refreshOptions, (err: any, response: any, body: any) => {
        body = body && JSON.parse(body)
        if (err) {
          return reject({
            error: 'request_err',
            error_description: err
          })
        }
        else if (body.error) return reject(body)
        body.created_at = Math.ceil(Date.now() / 1000)
        return resolve(body)
      })
    })
  }

  const authorize = async (code: string): Promise<AuthResponse | any> => {
    if (isLogging) {
      console.info(`app_name: ${config.app_name}, account: ${account}, authorizing...`)
    }
    return new Promise((resolve, reject) => {
      const authorizeOptions = {
        method: 'POST',
        uri: `${baseUrl}/auth/oauth/token?`
          + `grant_type=authorization_code&`
          + `code=${code}&`
          + `redirect_uri=${config.url_redirect}`,
        headers: {
          Authorization: `Basic ${oauthUser}`,
        }
      }
      request(authorizeOptions, (err: any, response: any, body: any) => {
        body = body && JSON.parse(body)
        if (err) {
          return reject({
            error: 'request_err',
            error_description: err
          })
        }
        else if (body.error) return reject(body)
        body.created_at = Math.ceil(Date.now() / 1000)
        return resolve(body)
      })
    })
  }

  const makeRequest = async (endpoint: string, opts?: any): Promise<any> => {
    if (getExpiredIn(tokens) < 6) {
      await refresh()
    }
    if (!tokens || !tokens.access_token) {
      return Promise.reject({
        error: 'missing_access_token',
        error_description: 'Access token is missing or not stored in the app.'
      })
    }
    if (isLogging) {
      console.debug(`app_name: ${config.app_name}, account: ${account}, request: ${endpoint}`)
    }
    const requestOptions = {
      uri: `${apiUrl}${endpoint}`,
      method: opts && opts.method || 'GET',
      headers: {
        Authorization: `Bearer ${tokens.access_token}`,
        Accept: 'application/vnd.allegro.public.v1+json'
      }
    }
    return new Promise((resolve, reject) => {
      request(Object.assign(requestOptions, opts), (err: any, response: any, body: any) => {
        body = body && JSON.parse(body)
        if (err) {
          return reject({
            error: 'request_err',
            error_description: err
          })
        }
        else if (body.error && body.errors) return reject(body)
        return resolve(body)
      })
    })
  }

  return {
    getAccount: (): string => account,
    getSellerId: (): string => tokens ? jwt.decode(tokens.access_token).user_name : null,

    authorize,
    setTokens: (authTokens: AuthResponse) => tokens = authTokens,

    request: makeRequest,
    get: (endpoint: string, opts?: any) => makeRequest(endpoint, { ...opts, method: 'GET' }),
    post: (endpoint: string, opts?: any) => makeRequest(endpoint, { ...opts, method: 'POST' }),
    put: (endpoint: string, opts?: any) => makeRequest(endpoint, { ...opts, method: 'PUT' }),
    delete: (endpoint: string, opts?: any) => makeRequest(endpoint, { ...opts, method: 'DELETE' })
  }
}

export default allegroApi