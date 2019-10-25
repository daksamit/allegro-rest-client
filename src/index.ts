import { getExpiredIn } from './helpers';
import {
  AuthResponse,
  Error,
  Errors,
  ClientConfig,
  ClientOptions,
} from './types';

import request from 'request';
import * as jwt from 'jsonwebtoken';

async function AllegroRestClient(
  config: ClientConfig,
  options: ClientOptions,
): Promise<any> {
  let baseUrl = 'https://allegro.pl';
  let apiUrl = 'https://api.allegro.pl';
  if (options && options.sandbox === true) {
    baseUrl = 'https://allegro.pl.allegrosandbox.pl';
    apiUrl = 'https://api.allegro.pl.allegrosandbox.pl';
  }
  const oauthUser: string = Buffer.from(
    `${config.client_id}:${config.client_secret}`,
  ).toString('base64');
  const account: string = (options && options.account) || 'default';
  const isLogging: boolean = options && options.logger === true;
  const store: any = {};
  const storage = options.storage
    ? options.storage
    : {
        set(tokens: AuthResponse): void {
          store[account] = tokens;
        },
        get(): AuthResponse {
          return store[account];
        },
      };
  let tokens: AuthResponse = (await storage.get(account)) || null;

  const storeTokens = async (authTokens: AuthResponse): Promise<void> => {
    await storage.set(account, authTokens);
    tokens = authTokens;
  };

  const refresh = async (): Promise<AuthResponse | Error> => {
    if (!tokens || !tokens.refresh_token) {
      return Promise.reject({
        error: 'missing_refresh_token',
        error_description: 'Refresh token is missing or not stored in the app.', // eslint-disable-line
      });
    }
    if (isLogging) {
      console.info(
        `app_name: ${config.app_name}, account: ${account}, refreshing tokens...`,
      );
    }
    return new Promise((resolve, reject) => {
      const refreshOptions = {
        method: 'POST',
        uri:
          `${baseUrl}/auth/oauth/token?` +
          `grant_type=refresh_token&` +
          `refresh_token=${tokens.refresh_token}&` +
          `redirect_uri=${config.url_redirect}`,
        headers: {
          Authorization: `Basic ${oauthUser}`,
        },
      };
      request(
        refreshOptions,
        async (err: any, response: any, body: any): Promise<void> => {
          const refreshedTokens = body && JSON.parse(body);
          if (err) {
            return reject({
              error: 'request_err',
            error_description: err, // eslint-disable-line
            });
          } else if (refreshedTokens.error) return reject(refreshedTokens);
        refreshedTokens.created_at = Math.ceil(Date.now() / 1000); // eslint-disable-line
          storeTokens(refreshedTokens);
          return resolve(refreshedTokens);
        },
      );
    });
  };

  const authorize = async (code: string): Promise<AuthResponse | Error> => {
    if (isLogging) {
      console.info(
        `app_name: ${config.app_name}, account: ${account}, authorizing...`,
      );
    }
    return new Promise((resolve, reject) => {
      const authorizeOptions = {
        method: 'POST',
        uri:
          `${baseUrl}/auth/oauth/token?` +
          `grant_type=authorization_code&` +
          `code=${code}&` +
          `redirect_uri=${config.url_redirect}`,
        headers: {
          Authorization: `Basic ${oauthUser}`,
        },
      };
      request(authorizeOptions, async (err: any, response: any, body: any) => {
        const authorizedTokens = body && JSON.parse(body);
        if (err) {
          return reject({
            error: 'request_err',
            error_description: err, // eslint-disable-line
          });
        } else if (authorizedTokens.error) return reject(authorizedTokens);
        authorizedTokens.created_at = Math.ceil(Date.now() / 1000); // eslint-disable-line
        storeTokens(authorizedTokens);
        return resolve(authorizedTokens);
      });
    });
  };

  const makeRequest = async (
    endpoint: string,
    opts?: any,
  ): Promise<any | Error | Errors> => {
    if (tokens && tokens.refresh_token && getExpiredIn(tokens) < 6) {
      await refresh();
    }
    if (!tokens || !tokens.access_token) {
      return Promise.reject({
        error: 'missing_access_token',
        error_description: 'Access token is missing or not stored in the app.', // eslint-disable-line
      });
    }
    if (isLogging) {
      console.debug(
        `app_name: ${config.app_name}, account: ${account}, request: ${endpoint}`,
      );
    }
    const requestOptions = {
      uri: `${apiUrl}${endpoint}`,
      method: (opts && opts.method) || 'GET',
      headers: {
        Authorization: `Bearer ${tokens.access_token}`,
        Accept: 'application/vnd.allegro.public.v1+json',
      },
    };

    return new Promise((resolve, reject) => {
      request(
        Object.assign(requestOptions, opts),
        (err: any, response: any, body: any) => {
          body = body && JSON.parse(body);
          if (err) {
            return reject({
              error: 'request_err',
              error_description: err, // eslint-disable-line
            });
          } else if (body.error || body.errors) return reject(body);
          return resolve(body);
        },
      );
    });
  };

  return {
    getAccount: (): string => account,
    getSellerId: (): string | null => {
      if (tokens && tokens.access_token) {
        const decoded: any = jwt.decode(tokens.access_token);
        return (decoded && decoded.username) || null;
      }
      return null;
    },
    authorize,
    request: makeRequest,
    get: (endpoint: string, opts?: any) =>
      makeRequest(endpoint, { ...opts, method: 'GET' }),
    post: (endpoint: string, opts?: any) =>
      makeRequest(endpoint, { ...opts, method: 'POST' }),
    put: (endpoint: string, opts?: any) =>
      makeRequest(endpoint, { ...opts, method: 'PUT' }),
    delete: (endpoint: string, opts?: any) =>
      makeRequest(endpoint, { ...opts, method: 'DELETE' }),
  };
}

export {
  AllegroRestClient,
  ClientConfig,
  ClientOptions,
  AuthResponse,
  Error,
  Errors,
};
