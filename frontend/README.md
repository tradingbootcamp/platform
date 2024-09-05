# Code for the live frontend website

## Configuration

To use the public web API, copy `example.env` to `.env` and set the environment variables like so:

```
PUBLIC_KINDE_CLIENT_ID=a9869bb1225848b9ad5bad2a04b72b5f
PUBLIC_KINDE_DOMAIN=https://crazytieguy.kinde.com
PUBLIC_KINDE_REDIRECT_URI=https://localhost:5173
PUBLIC_SERVER_URL=https://trading-bootcamp.fly.dev/api
```

To use your own locally hosted API, set `PUBLIC_SERVER_URL=/api`

## Developing

Install `pnpm` with `npm install -g pnpm`

Once you've installed dependencies with `pnpm install`, start a development server:

```bash
pnpm run dev
```

## Building

To create a production version of your app:

```bash
pnpm run build
```

You can preview the production build with `pnpm run preview`.
