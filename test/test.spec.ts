import { expect } from "chai";
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

describe("AllegroClient", () => {
  it("should throw error invalid auth code", async () => {
    try {
      await allegroClient.authorize("wrong_auth_code");
    } catch (err) {
      expect(err).haveOwnProperty("error");
      expect(err).haveOwnProperty("error_description");
      expect(Object.keys(err).length).to.equal(2);
    }
  });
  // it("should authorize app in 10 seconds", async () => {
  //   try {
  //     const tokens: any = await allegroClient.authorize("YbEJSW1FUMAxXFXAI6jH5bgyLw6Xb1OQ");
  //     expect(tokens).haveOwnProperty("access_token");
  //     expect(tokens).haveOwnProperty("refresh_token");
  //     expect(tokens).haveOwnProperty("token_type");
  //     expect(tokens).haveOwnProperty("expires_in");
  //     expect(tokens).haveOwnProperty("scope");
  //     expect(tokens).haveOwnProperty("jti");
  //     expect(Object.keys(tokens).length).to.equal(6);
  //   } catch (err) {
  //     expect(err).to.not.throw(err);
  //   }
  // });
  it("should refresh saved token", async () => {
    try {
      const tokens: any = await allegroClient.refreshTokens();
      expect(tokens).haveOwnProperty("access_token");
      expect(tokens).haveOwnProperty("refresh_token");
      expect(tokens).haveOwnProperty("token_type");
      expect(tokens).haveOwnProperty("expires_in");
      expect(tokens).haveOwnProperty("jti");
      expect(Object.keys(tokens).length).to.equal(5);
    } catch (err) {
      expect(err).to.not.throw(err);
    }
  });
});
