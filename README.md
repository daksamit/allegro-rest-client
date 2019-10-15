# allegro-rest-client

Allegro REST API client written in typescript.
register allegro application - https://apps.developer.allegro.pl.allegrosandbox.pl

## Getting Started

Install allegro-rest-client using yarn

```sh
yarn add allegro-rest-client
```

### Example of use

``` js
import AllegroRestClient from "allegro-rest-client";

const clientConfig = { // app client config
  app_name: "rest-client",
  type: "web",
  client_id: "bcfaf324a2104824b81fbd97aea46654",
  client_secret: "eO0Y22o82ENzONrGIFoNf6Qi6fO3mmUYiONjJvQVl5161H5Gj4slpgCj1dcbV4Zn",
  url_redirect: "https://allegro-rest-client.daksamit.pl",
};

// link to authorize your app:
// https://allegro.pl.allegrosandbox.pl/auth/oauth/authorize?response_type=code&client_id=bcfaf324a2104824b81fbd97aea46654&redirect_uri=https://allegro-rest-client.daksamit.pl
const allegroClient = new AllegroRestClient(clientConfig, { sandbox: true, account: "default" });

// authorize app with code from above link:
allegroClient.authorize("generated_code...");
// refresh tokens
allegroClient.refreshTokens();
// example request allegro rest api:
try {
  let offers = await allegroClient.request("/sale/offers?limit=5");
} catch (err) {
  console.log(err)
}
```

## tests

If you want to check app, run `yarn test`. (in progress)
Authorizing app is commented - use for getting tokens at first time.

## helpful links

- [allegro rest api official documentation](https://developer.allegro.pl/documentation)

Library is still in progress..

v 0.2.0 - updated API.
