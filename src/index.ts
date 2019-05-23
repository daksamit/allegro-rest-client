const fetch = require("node-fetch");
const Storage = require("dom-storage");
const jwt = require("jsonwebtoken");

interface IClientConfig {
  app_name: string
  client_id: string
  client_secret: string
  url_redirect: string
}
interface IOptions {
  sandbox: boolean
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
  private storagePath: string;
  private storage: any; // TODO:
  private tokens: any;
  constructor(clientConfig: IClientConfig, options: IOptions) { // TODO: any
    this.baseUrl = "https://allegro.pl";
    this.apiUrl = "https://api.allegro.pl";
    if (options.sandbox === true) {
      this.baseUrl = "https://allegro.pl.allegrosandbox.pl";
      this.apiUrl = "https://api.allegro.pl.allegrosandbox.pl";
    }
    this.config = clientConfig;
    this.oauthUser = Buffer.from(`${this.config.client_id}:${this.config.client_secret}`).toString("base64");
    this.account = options.account || "default";
    this.tokens = null

    this.storagePath = `./allegro_tokens_${this.account}.json`;
  }
  public getSellerId() {
    const accessToken = this.getAccessToken();
    return accessToken ? jwt.decode(accessToken).user_name : null;
  }
  public async authorize(code: string): Promise<void> {
    console.log(`app_name: ${this.config.app_name}, account: ${this.account}, authorizing...`);
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
      this.storeTokens(tokensResponse); // TODO remove
      this.setTokens(tokensResponse)
      console.log(`app_name: ${this.config.app_name}, account: ${this.account}, access tokens saved.`);
      return tokensResponse;
    } catch (err) {
      // console.log(err);
      throw err;
    }
  }
  public async refreshTokens(): Promise<void> {
    console.log(`app_name: ${this.config.app_name}, account: ${this.account}, refreshing tokens...`);
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
      this.storeTokens(tokensResponse); // TODO remove
      this.setTokens(tokensResponse)
      console.log(`app_name: ${this.config.app_name}, account: ${this.account}, refresh tokens updated.`);
      return tokensResponse;
    } catch (err) {
      // console.log(err);
      throw err;
    }
  }
  public request(endpoint: string, options?: any): Promise<any> { // TODO: request
    console.log(options ? options.method : "GET", endpoint);
    if (options && options.data) {
      options.body = JSON.stringify(options.data);
    }
    const tokens = this.getTokens()
    const accessToken = tokens.access_token
    return fetch(`${this.apiUrl}${endpoint}`, Object.assign({
      method: "GET",
      timeout: 12000,
      headers: {
        "Authorization": "Bearer " + accessToken,
        "Accept": "application/vnd.allegro.public.v1+json",
        "Content-Type": "application/vnd.allegro.public.v1+json",
      },
    }, options))
      .then((res: any) => res.json())
      .catch((error: any) => {
        throw error;
      });
  }
  public get() { }
  public post() { }
  public put() { }
  public delete() { }
  public setTokens (tokens: any) { // TODO ! any
    this.tokens = tokens
  }
  public getTokens (): any { // TODO ! any
    return this.tokens
  }
  public getAccount(): string {
    return this.account
  }


  private storeTokens(tokens: any): void { // TODO: any!!
    this.storage = new Storage(this.storagePath, { strict: false, ws: "  " });
    this.storage.setItem(`${this.config.app_name}_access`, tokens.access_token || null);
    this.storage.setItem(`${this.config.app_name}_refresh`, tokens.refresh_token || null);
  }
  private getAccessToken() {
    this.storage = new Storage(this.storagePath, { strict: false, ws: "  " });
    return this.storage.getItem(`${this.config.app_name}_access`);
  }
  private getRefreshToken() {
    this.storage = new Storage(this.storagePath, { strict: false, ws: "  " });
    return this.storage.getItem(`${this.config.app_name}_refresh`);
  }
}

export default AllegroRestClient;
