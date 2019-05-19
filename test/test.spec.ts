import AllegroRestClient from "../src";

const clientConfig = {
  app_name: "rest-client",
  type: "web",
  client_id: "bcfaf324a2104824b81fbd97aea46654",
  client_secret: "eO0Y22o82ENzONrGIFoNf6Qi6fO3mmUYiONjJvQVl5161H5Gj4slpgCj1dcbV4Zn",
  url_redirect: "https://allegro-rest-client.daksamit.pl",
};

// https://allegro.pl.allegrosandbox.pl/auth/oauth/authorize?response_type=code&client_id=bcfaf324a2104824b81fbd97aea46654&redirect_uri=https://allegro-rest-client.daksamit.pl
const allegroClient = new AllegroRestClient(clientConfig, { sandbox: true, account: "test_account" });

test('authorize client, should throw error invalid auth code', async () => {
  try {
    await allegroClient.authorize("invalid_auth_code");
  } catch (err) {
    const keys = Object.keys(err)
    expect(err).toHaveProperty("error");
    expect(err).toHaveProperty("error_description");
    expect(Object.keys(err).length).toEqual(2);
  }
})
