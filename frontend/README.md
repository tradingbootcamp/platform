# Code for the live frontend website

## Configuration

To use your own local exchange, copy `example.env` to `.env`.

## Developing

Install `pnpm` with `npm install -g pnpm`

Once you've installed dependencies with `pnpm install`, start a development server:

```bash
pnpm run dev
```

## Generating API Types

To generate TypeScript types from the backend's OpenAPI spec, ensure the backend is running on `localhost:8000`, then run:

```bash
pnpm run generate:api
```

This fetches the OpenAPI spec and generates typed fetch wrappers in `src/lib/api.generated.ts`. Use the client from `src/lib/scenariosApi.ts`:

```typescript
import { scenariosApi } from '$lib/scenariosApi';

const { data, error } = await scenariosApi.GET('/some/endpoint');
```

## Building

To create a production version of your app:

```bash
pnpm run build
```

You can preview the production build with `pnpm run preview`.
