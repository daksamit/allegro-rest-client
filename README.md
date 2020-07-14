# allegro-rest-client

Allegro REST API client for managing allegro.pl auctions with ease using node.

## Getting Started

This library provides simple wrapper for managing allegro rest api resources according to [docs](https://developer.allegro.pl/documentation/)

### Prerequisites

Registration new app [here](https://apps.developer.allegro.pl.allegrosandbox.pl).
You have to choose between two types of app:

- WEB: need authorization code from url: <https://allegro.pl/auth/oauth/authorize?response_type=code&client_id=clientid&redirect_uri=https://url-redirect.daksamit.pl>
- DEVICE: bind an app via allegro.pl with device_code and authorize app

Installation:

```sh
yarn add allegro-rest-client
# or
npm install allegro-rest-client
```

### Usage

Following example shows, how to import and use library to fetch allegro categories

```ts
import { AllegroRestClient, ClientConfig, ClientOptions } from 'allegro-rest-client'

const config: ClientConfig = {
  app_name: 'rest-client-device', // registered app name
  type: 'device', // or web
  client_id: 'f070c07c4d814b0c8f45f596bf654936',
  client_secret: 'cpbqO3WtsLpyQ4V9RTauaSx0G1rb8S762fZdLYoA7VDAzFvhFrsfvJJIbqMAjyMs',
}
const options: ClientOptions = {
  account: 'allegro-account', // default
  sandbox: true, // false
  logger: true, // false
  storage: {
    // api for storing auth tokens
    async set(account: string, tokens: any) {
      storeApi.save(account, tokens)
    },
    async get(account: string) {
      return storeApi.get(account)
    },
  },
}
try {
  const allegroClient = await AllegroRestClient(config, options)
  const { verification_uri_complete, device_code } = await allegroClient.bindApp()
  // open given url - verification_uri_complete and associate app
  console.log({ verification_uri_complete, device_code })

  await allegroClient.authorize(device_code)

  const { categories } = await allegroClient.get('/sale/categories')
  console.log(categories)
} catch (err) {
  console.error(err)
}
```

config - holds registered app credentials
options - comprises:

- account: allegro account name used by AllegroRestClient instance
- sandbox: boolean if use app from allegro sandbox
- logger: boolean if logging requests info
- storage: object with set and get methods for storing app credentials per account

Authorizing app via 'device' type is preffered way - after calling bindApp method, you need visit and authorize app from 'verification_uri_complete' url, and call authorize method with obtained device_code along with verification_uri_complete.

What library do:

- refresh tokens every 12 hours
- wraps client to call resources from [docs](https://developer.allegro.pl/documentation/)
- passes default 'Authorization' header for all requests and 'Accept' `application/vnd.allegro.public.v1+json` (for some resources you need different Content-Type - check docs)
- allows to call allegro.pl resources via [request](https://www.npmjs.com/package/request) module

Examples:

```js
// ...
const { categories } = await allegroClient.get('/sale/categories')
const { offers, count, totalCount } = await allegroClient.get('/sale/offers')
const { id: offerId, validation, ...offer } = await allegroClient.post('/sale/offers', {
  body: JSON.stringify({
    name: 'Test offer',
  }),
}) // draft offer, 'validation.errors' contains array of missing offer data
const publishedOffer = await allegroClient.put(`/sale/offers/${offerId}`) // complete draft offer and publish
const { rates } = await allegroClient.get(`/sale/offers/${offerId}/shipping-rates`, {
  headers: {
    Accept: 'application/vnd.allegro.beta.v1+json',
  },
})
```

## Future plans

- replace deprecated request module (axios or bent)
- ...

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details
