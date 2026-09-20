![Logo](https://github.com/user-attachments/assets/fc5e20b0-9b33-4a9a-b4a8-447874663cad)

<h1 align="center">Hatsuboshi API</h1>

<div align="center">
  <img src="https://img.shields.io/badge/typescript-%23007ACC.svg?style=for-the-badge&logo=typescript&logoColor=white">
  <img src="https://img.shields.io/badge/express.js-%23404d59.svg?style=for-the-badge&logo=express&logoColor=%2361DAFB">
  <img src="https://img.shields.io/badge/openapi%20initiative-%23000000.svg?style=for-the-badge&logo=openapiinitiative&logoColor=white">
  <img src="https://img.shields.io/badge/MongoDB-%234ea94b.svg?style=for-the-badge&logo=mongodb&logoColor=white">
  <img src="https://img.shields.io/badge/firebase-%23DD2C00.svg?style=for-the-badge&logo=firebase&logoColor=white">
  <img src="https://img.shields.io/badge/vercel-%23000000.svg?style=for-the-badge&logo=vercel&logoColor=white">
</div>
<br>

**[Hatsuboshi API](https://docs.hatsuboshi.app/api/) is an unofficial, public, stateless RESTful API that provides programmatic access to a variety of data from _Gakuen IDOLM@STER_.**
- CRUD operations for various in-game resources (e.g. Skills, P-Idols, Support Cards, etc.)
- Strongly typed request & response data models, serialized as JSON
- Authentication for privileged actions, using either cookies or API keys
- Comprehensive OpenAPI specification, with [beautiful documentation](https://docs.hatsuboshi.app/api/)
- Backward compatibility through versioned API endpoints

Hatsuboshi API's production URI is [`https://api.hatsuboshi.app`](https://api.hatsuboshi.app).

> [!IMPORTANT]
> This project is hand-built by a fellow producer **without the use of any AI-generated content / code**.

## Example Usage

```bash
$ curl https://api.hatsuboshi.app/v1/p-idols/763034
```

```json
{
  "id": "763034",
  "createdAt": "2026-07-07T07:35:55.674Z",
  "updatedAt": "2026-07-08T07:35:55.674Z",
  "name": {
    "ja": "自己肯定感爆上げ↑↑しゅきしゅきソング",
    "en": "Self-Affirmation Explosion↑↑ Shuki Shuki Song",
    "ro": "Jikokouteikan Bakuage↑↑ Shuki Shuki Song"
  },
  "visual": { ... },
  "character": { ... },
  "rarity": "ssr",
  "plan": "sense",
  "subplan": "focus",
  "isWelfare": false,
  // ... and more fields!
}
```
> [!TIP]
> Hatsuboshi API makes use of the [**Hatsuboshi App Types Package**](https://github.com/hatsuboshi-app/types) ([`@hatsuboshi/types`](https://www.npmjs.com/package/@hatsuboshi/types)) to provide strong typing for its response objects. **It is highly recommended to make use of this package when consuming the API.**
>
> For example:
> ```ts
> // returns an IPIdol object as JSON
> const res = await fetch('https://api.hatsuboshi.app/v1/p-idols/763034')
>
> // creates a PIdol object using JSON response!
> const data = new PIdol(await res.json())
> 
> console.log(data.name.ja)  // "自己肯定感爆上げ↑↑しゅきしゅきソング"
> ```

## Technical Details

This API is built using the [Express.js](https://expressjs.com/) framework, and is deployed on [Vercel](https://vercel.com/). The repository is designed around a document-oriented database architecture and currently uses [MongoDB Atlas](https://www.mongodb.com/products/platform) in both development and production environments.

### Service Modules

This API uses service modules defined through service interfaces, which are injected as dependencies and initialized globally via a factory. This allows each service to remain fully modular, provided that its implementation correctly conforms to the corresponding interface. In addition to cloud-based implementations, each service also provides an in-memory implementation, which allows the application to run independently of external cloud providers in a local development environment.

- `IRepositoryService`:
  - Implemented with [MongoDB Atlas](https://www.mongodb.com/products/platform), and an in-memory implementation.

- `IAuthService`:
  - Implemented with [Firebase Authentication](https://firebase.google.com/docs/auth), and an in-memory implementation.

- `IAssetService`:
  - Implemented with a [self-hosted](https://garagehq.deuxfleurs.fr/) [AWS S3](https://aws.amazon.com/s3/) bucket running on local hardware, and an in-memory implementation.

> [!TIP]
> The following environment variables are available to customize app defaults:
> - `PORT` (default: `3001`)
> - `API_ENV` (default: `local`, available: `local`, `development`, `production`)

> [!CAUTION]
> The following environment variables are **required** to be present in order to use cloud-based implementations of each service module, on top of setting `API_ENV` to either `development` or `production`.
> - `MONGO_SHARED`
> - `MONGO_CLUSTER`
> - `MONGO_USER`
> - `MONGO_PASS`
> - `S3_KEY`
> - `S3_SECRET`
> - `S3_REGION`
> - `S3_BUCKET`

### Running the App

To run the development server locally:

```bash
$ npm run dev
```

To build the app (& run the production-optimized build):

```bash
$ npm run build
$ npm run start
```

## Deployment

This app uses [GitHub Actions](https://github.com/features/actions) to automatically run CI/CD pipelines for deployment.

- The `main` branch automatically deploys to the production environment ([`https://api.hatsuboshi.app`](https://api.hatsuboshi.app)).
  - It also automatically pushes generated documentation artifacts to [docs repo](https://github.com/hatsuboshi-app/docs),
  - ...which then automatically deploys the up-to-date documentation to [`https://docs.hatsuboshi.app/api`](https://docs.hatsuboshi.app/api).

- The `dev` branch automatically deploys to the development environment ([`https://api-dev.hatsuboshi.app`](https://api-dev.hatsuboshi.app)).
  - It also automatically pushes generated documentation artifacts to the [docs repo](https://github.com/hatsuboshi-app/docs),
  - ...which then automatically deploys the up-to-date documentation to [`https://docs.hatsuboshi.app/api-dev`](https://docs.hatsuboshi.app/api-dev).

- For every other branch, a development preview deployment is deployed on every push.

## Contributing

Feel free to [open an issue](https://github.com/hatsuboshi-app/backend/issues/new) for any bugs, feature requests, or questions to do with this app.

When contributing, please use _feature branching_ when implementing new features, and submit a pull request titled using the [Conventional Commits](https://www.conventionalcommits.org/en/v1.0.0/) specification, targeting the `dev` branch.

Feel free to contact me, [@HuzzuDesu on Twitter](https://x.com/HuzzuDesu) or `@huzzudesu` on Discord for any other questions or inquiries.

**There is currently no Discord server for the purposes of development for this project.**

## Disclaimer

> [!WARNING]
> This app is a part of a fan-made project and **NOT** an officially endorsed app for Gakuen IDOLM@STER, nor is it associated with BNEI, QualiArts Inc., or any other official entities. All rights to assets, contents & data belong to their respective copyright owners.
