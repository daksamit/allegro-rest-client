const fetch = require("node-fetch");
const Storage = require("dom-storage");
class AllegroRestClient {
  public baseUrl: string = "https://allegro.pl";
  public apiUrl: string = "https://api.allegro.pl";
  public oauthUser: any;
  private config: any; // TODO: not any!!
  private storage: any; // TODO:
  public client(clientConfig: any, options: any) { // TODO: any
    this.config = clientConfig;
    this.oauthUser = Buffer.from(`${this.config.client_id}:${this.config.client_secret}`).toString("base64");
    this.storage = new Storage(`./allegro-tokens-${this.config.app_name}.json`, { strict: false, ws: "  " });
    if (options.sandbox === true) {
      this.baseUrl = "https://allegro.pl.allegrosandbox.pl";
      this.apiUrl = "https://api.allegro.pl.allegrosandbox.pl";
    }
    return this;
  }
  public authorize(code: string): void {
      console.log("authorizing app");
      fetch(`${this.baseUrl}/auth/oauth/token?`
        + `grant_type=authorization_code&`
        + `code=${code}&`
        + `redirect_uri=${this.config.url_redirect}`, {
        method: "POST",
        headers: {
          Authorization: `Basic ${this.oauthUser}`,
        },
      })
      .then ((res: any) => res.json())
      .then((res: any) => {
        if (res.error && res.error_description) {
          throw res;
        }
        this.storeTokens(res);
        console.log("access tokens saved.");
      })
      .catch((error: any) => {
      });
  }
  public getSellerId() {
  }
  public refreshTokens(): void {
    console.log("refreshing tokens");
    fetch(`${this.baseUrl}/auth/oauth/token?`
        + `grant_type=refresh_token&`
        + `refresh_token=${this.getRefreshToken()}&`
        + `redirect_uri=${this.config.url_redirect}`, {
        method: "POST",
        headers: {
          Authorization: `Basic ${this.oauthUser}`,
        },
      })
      .then ((res: any) => res.json())
      .then((res: any) => {
        if (res.error && res.error_description) {
          throw res;
        }
        this.storeTokens(res);
        console.log("refresh tokens updated.");
      })
      .catch((error: any) => {
      });
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
    .then((res: any) => res.json());
  }
  private storeTokens(tokens: any): void { // TODO: any!!
    this.storage.setItem("accessToken", tokens.access_token || null);
    this.storage.setItem("refreshToken", tokens.refresh_token || null);
  }
  private getAccessToken() {
    return this.storage.getItem("accessToken");
  }
  private getRefreshToken() {
    return this.storage.getItem("refreshToken");
  }
}

export default new AllegroRestClient();
