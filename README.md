# allegro-rest-client

in progress..

register allegro application - https://apps.developer.allegro.pl.allegrosandbox.pl

## example of use

``` js
import allegroRest from "allegro-rest-client";

const clientConfig = { // app client config
  app_name: "rest-client",
  type: "web",
  client_id: "bcfaf324a2104824b81fbd97aea46654",
  client_secret: "eO0Y22o82ENzONrGIFoNf6Qi6fO3mmUYiONjJvQVl5161H5Gj4slpgCj1dcbV4Zn",
  url_redirect: "https://allegro-rest-client.daksamit.pl",
};

// link to authorize your app
// https://allegro.pl.allegrosandbox.pl/auth/oauth/authorize?response_type=code&client_id=bcfaf324a2104824b81fbd97aea46654&redirect_uri=https://allegro-rest-client.daksamit.pl
const allegroClient = allegroRest.client(clientConfig, { sandbox: true });

// authorize app with code from above link 
allegroClient.authorize("code...");
// refresh rokens
allegroClient.refreshTokens();
```