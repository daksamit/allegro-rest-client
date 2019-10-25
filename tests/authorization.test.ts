import { AllegroRestClient } from '../src';
import * as types from '../src/types';

const Storage = require('node-storage');
const storage = new Storage('tmpstorage');
storage.set = storage.put;

const clientConfig = {
  app_name: 'rest-client',
  type: 'web',
  client_id: 'bcfaf324a2104824b81fbd97aea46654',
  client_secret:
    'eO0Y22o82ENzONrGIFoNf6Qi6fO3mmUYiONjJvQVl5161H5Gj4slpgCj1dcbV4Zn',
  url_redirect: 'https://allegro-rest-client.daksamit.pl',
};

// https://allegro.pl.allegrosandbox.pl/auth/oauth/authorize?response_type=code&client_id=bcfaf324a2104824b81fbd97aea46654&redirect_uri=https://allegro-rest-client.daksamit.pl

test('authorize client, should throw error: "invalid_code"', async () => {
  try {
    const clientOptions = {
      sandbox: true,
    };
    const allegroClient = await AllegroRestClient(clientConfig, clientOptions);
    await allegroClient.authorize('invalid_code');
  } catch (err) {
    const value: types.Error = err;
    const keys = Object.keys(value);

    expect(keys.length).toEqual(2);
    expect(value.error).toBe('invalid_grant');
    expect(value.error_description).toBe(
      'Invalid authorization code: invalid_code',
    );
  }
});

test('authorize client, should throw error: "missing_access_token"', async () => {
  try {
    const clientOptions = {
      sandbox: true,
      account: 'dfkml2389ajasd',
    };
    const allegroClient = await AllegroRestClient(clientConfig, clientOptions);
    await allegroClient.get('/sale/offers/123');
  } catch (err) {
    const value: types.Error = err;
    const keys = Object.keys(value);

    expect(keys.length).toEqual(2);
    expect(value.error).toBe('missing_access_token');
    expect(value.error_description).toBe(
      'Access token is missing or not stored in the app.',
    );
  }
});
