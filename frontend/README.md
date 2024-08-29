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

Once you've installed dependencies with `npm install` (or `pnpm install` or `yarn`), start a development server:

```bash
npm run dev

# or start the server and open the app in a new browser tab
npm run dev -- --open
```

## Building

To create a production version of your app:

```bash
npm run build
```

You can preview the production build with `npm run preview`.
