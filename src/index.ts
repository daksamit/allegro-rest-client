const fetch = require("node-fetch");
const Storage = require("dom-storage");
const CronJob = require("cron").CronJob;
class AllegroRestClient {
  public baseUrl: string = "https://allegro.pl";
  public apiUrl: string = "https://api.allegro.pl";
  public oauthUser: any;
  private config: any; // TODO: not any!!
  private storage: any; // TODO:
  public client(clientConfig: any, options: any) { // TODO: any
    this.config = clientConfig;
    this.oauthUser = Buffer.from(this.config.client_id + ":" + this.config.client_secret).toString("base64");
    this.storage = new Storage(`./tokens/allegro-tokens-${this.config.app_name}.json`, {strinct: false, ws: "  "});
    if (options.sandbox === true) {
      this.baseUrl = "https://allegro.pl.allegrosandbox.pl";
      this.apiUrl = "https://api.allegro.pl.allegrosandbox.pl";
    }
    this.setCronRefresh();

    // this.refreshTokens();
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
      })
      .catch((error: any) => {
        console.log("cant authorize", error);
      });
  }
  public get(endpoint: string) { // TODO: request
    console.log(endpoint);
  }
  public getSellerId() {
  }
  private storeTokens(tokens: any): void { // TODO: any!!
    this.storage.setItem("accessToken", tokens.access_token || null);
    this.storage.setItem("refreshToken", tokens.refresh_token || null);
    console.log(this.getAccessToken());
    console.log(this.getRefreshToken());
  }
  private getAccessToken() {
    return this.storage.getItem("accessToken");
  }
  private getRefreshToken() {
    return this.storage.getItem("refreshToken");
  }
  private refreshTokens(): void {
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
      })
      .catch((error: any) => {
        console.log("cant rafersh", error);
      });
  }
  private setCronRefresh() {
    const job = new CronJob("0 */6 * * *", () => {
      const d = new Date();
      this.refreshTokens();
      console.log("Every 6 hours:", d);
    });
    job.start();
  }
}

export default new AllegroRestClient();
