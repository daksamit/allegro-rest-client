const fetch = require("node-fetch");
const Storage = require("dom-storage");
const jwt = require("jsonwebtoken");

interface IClientConfig {
  app_name: string;
  client_id: string;
  client_secret: string;
  url_redirect: string;
}
interface IOptions {
  sandbox: boolean;
  account?: string;
}

class AllegroRestClient {
  public baseUrl: string;
  public apiUrl: string;
  public oauthUser: any;
  private config: IClientConfig; // TODO: not any!!
  private account?: string;
  private storagePath: string;
  private storage: any; // TODO:
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
    this.storagePath = `./allegro_tokens_${this.account}.json`;
  }
  public async authorize(code: string): Promise<void> {
    console.log(`app_name: ${this.config.app_name}, account: ${this.account}, authorizing...`);
    try {
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
      this.storeTokens(tokensResponse);
      console.log(`app_name: ${this.config.app_name}, account: ${this.account}, access tokens saved.`);
      return tokensResponse;
    } catch (err) {
      console.log(err);
      throw err;
    }
  }
  public getSellerId() {
    const accessToken = this.getAccessToken();
    return accessToken ? jwt.decode(accessToken).user_name : null;
  }
  public async refreshTokens(token?: string): Promise<void> {
    console.log(`app_name: ${this.config.app_name}, account: ${this.account}, refreshing tokens...`);
    try {
      let refreshToken = token || this.getRefreshToken();
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
      this.storeTokens(tokensResponse);
      console.log(`app_name: ${this.config.app_name}, account: ${this.account}, refresh tokens updated.`);
      return tokensResponse;
    } catch (err) {
      console.log(err);
      throw err;
    }
  }
  public request(endpoint: string, options?: any): Promise<any> { // TODO: request
    console.log(options ? options.method : "GET", endpoint);
    if (options && options.data) {
      options.body = JSON.stringify(options.data);
    }
    return fetch(`${this.apiUrl}${endpoint}`, Object.assign({
      method: "GET",
      timeout: 12000,
      headers: {
        "Authorization": "Bearer " + this.getAccessToken(),
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
