const fetch = require("node-fetch");
const jwt = require("jsonwebtoken");

interface IClientConfig {
  app_name: string
  client_id: string
  client_secret: string
  url_redirect: string
}
interface IOptions {
  sandbox?: boolean
  logger?: boolean
  account?: string
}

interface ITokens {
  access_token: string
  refresh_token: string
}

class AllegroRestClient {
  public baseUrl: string;
  public apiUrl: string;
  public oauthUser: any;
  private config: IClientConfig; // TODO: not any!!
  private account: string;
  private logger: boolean;
  // private storagePath: string;
  // private storage: any; // TODO:
  private tokens: any;
  constructor(clientConfig: IClientConfig, options: IOptions) { // TODO: any
    this.baseUrl = "https://allegro.pl";
    this.apiUrl = "https://api.allegro.pl";
    this.logger = false;
    if (options.sandbox === true) {
      this.baseUrl = "https://allegro.pl.allegrosandbox.pl";
      this.apiUrl = "https://api.allegro.pl.allegrosandbox.pl";
    }
    if (options.logger === true) {
      this.logger = true;
    }
    this.config = clientConfig;
    this.oauthUser = Buffer.from(`${this.config.client_id}:${this.config.client_secret}`).toString("base64");
    this.account = options.account || "default";
    this.tokens = null

    // this.storagePath = `./allegro_tokens_${this.account}.json`;
  }
  public getSellerId() {
    // const accessToken = this.getAccessToken();
    const tokens = this.getTokens()
    return tokens ? jwt.decode(tokens.access_token).user_name : null;
  }
  public async authorize(code: string): Promise<void> {
    if (this.logger) console.info(`app_name: ${this.config.app_name}, account: ${this.account}, authorizing...`);
    try {
      const authorizeCreatedAt = Math.ceil(Date.now() / 1000)
      let tokensResponse = await fetch(`${this.baseUrl}/auth/oauth/token?`
        + `grant_type=authorization_code&`
        + `code=${code}&`
        + `redirect_uri=${this.config.url_redirect}`, {
          method: "POST",
          headers: {
            Authorization: `Basic ${this.oauthUser}`,
          },
        });
      tokensResponse = await tokensResponse.json();
      if (tokensResponse.error && tokensResponse.error_description) {
        throw tokensResponse;
      }
      tokensResponse.created_at = authorizeCreatedAt
      // this.storeTokens(tokensResponse); // TODO remove
      this.setTokens(tokensResponse)
      if (this.logger) console.info(`app_name: ${this.config.app_name}, account: ${this.account}, access tokens saved.`);
      return tokensResponse;
    } catch (err) {
      throw err;
    }
  }
  public async refreshTokens(): Promise<void> {
    if (this.logger) console.info(`app_name: ${this.config.app_name}, account: ${this.account}, refreshing tokens...`);
    try {
      const tokens = this.getTokens()
      const refreshToken = tokens.refresh_token

      const refreshCreatedAt = Math.ceil(Date.now() / 1000)
      let tokensResponse = await fetch(`${this.baseUrl}/auth/oauth/token?`
        + `grant_type=refresh_token&`
        + `refresh_token=${refreshToken}&`
        + `redirect_uri=${this.config.url_redirect}`, {
          method: "POST",
          headers: {
            Authorization: `Basic ${this.oauthUser}`,
          },
        });
      tokensResponse = await tokensResponse.json();
      if (tokensResponse.error && tokensResponse.error_description) {
        throw tokensResponse;
      }
      tokensResponse.created_at = refreshCreatedAt
      // this.storeTokens(tokensResponse); // TODO remove
      this.setTokens(tokensResponse)
      if (this.logger) console.info(`app_name: ${this.config.app_name}, account: ${this.account}, refresh tokens updated.`);
      return tokensResponse;
    } catch (err) {
      throw err;
    }
  }
  public request(endpoint: string, options?: any): Promise<any> { // TODO: request
    if (this.logger) console.info(options ? options.method : "GET", endpoint);
    if (options && options.data) {
      options.body = JSON.stringify(options.data);
    }
    const tokens = this.getTokens()
    if (!tokens) {
      throw new Error(`There is no access_token for account: ${this.account}`)
    }
    const accessToken = tokens.access_token
    return fetch(`${this.apiUrl}${endpoint}`, Object.assign({
      method: "GET",
      timeout: 20000,
      headers: {
        "Authorization": "Bearer " + accessToken,
        "Accept": "application/vnd.allegro.public.v1+json",
        "Content-Type": "application/vnd.allegro.public.v1+json",
      },
    }, options))
      .then((res: any) => res.json())
      .then((res: any) => {
        if (res && res.errors) {
          throw res.errors
        }
        return res
      })
  }
  public get(endpoint: string, options?: any): Promise<any> {
    return this.request(endpoint, Object.assign(options || {}, {
      method: 'GET'
    }))
  }
  public getOffer(offerId: string | number): Promise<any> {
    return this.request(`/sale/offers/${offerId}`)
  }
  public post(endpoint: string, options?: any): Promise<any> {
    return this.request(endpoint, Object.assign(options || {}, {
      method: 'POST'
    }))
  }
  public put(endpoint: string, options?: any): Promise<any> {
    return this.request(endpoint, Object.assign(options || {}, {
      method: 'PUT'
    }))
  }
  public delete(endpoint: string, options?: any): Promise<any> {
    return this.request(endpoint, Object.assign(options || {}, {
      method: 'DELETE'
    }))
  }
  public setTokens(tokens: any) { // TODO ! any
    this.tokens = tokens
  }
  public getTokens(): any { // TODO ! any
    return this.tokens
  }
  public getAccount(): string {
    return this.account
  }

  // private storeTokens(tokens: any): void { // TODO: any!!
  //   this.storage = new Storage(this.storagePath, { strict: false, ws: "  " });
  //   this.storage.setItem(`${this.config.app_name}_access`, tokens.access_token || null);
  //   this.storage.setItem(`${this.config.app_name}_refresh`, tokens.refresh_token || null);
  // }
  // private getAccessToken() {
  //   this.storage = new Storage(this.storagePath, { strict: false, ws: "  " });
  //   return this.storage.getItem(`${this.config.app_name}_access`);
  // }
  // private getRefreshToken() {
  //   this.storage = new Storage(this.storagePath, { strict: false, ws: "  " });
  //   return this.storage.getItem(`${this.config.app_name}_refresh`);
  // }
}

export default AllegroRestClient;
