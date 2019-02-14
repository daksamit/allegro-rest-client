class AllegroRestClient {
  private config: any;
  public baseUrl: string = "https://allegro.pl";
  public apiUrl: string = "https://api.allegro.pl";
  public client(clientConfig: any, options: any) {
    this.config = clientConfig;
    if (options.sandbox === true) {
      this.baseUrl = "https://allegro.pl.allegrosandbox.pl";
      this.apiUrl = "https://api.allegro.pl.allegrosandbox.pl";
    }
  }
}

export default new AllegroRestClient();
