# A simple HTML/JS client for the bootcamp

Edit this to build your own UI. It uses React, which makes it easy to live-update the UI, and PicoCSS, which makes normal, unstyled HTML look nice. The entire UI is contained in `src/App.tsx` - look there first to understand and edit the code.

## Setup

Make sure you have Node.js by running `npm --version`. If not, [download it from the website](https://nodejs.org/en). Once you have it, run `npm install -g pnpm`.

Then, clone this repo and navigate to the `client-web/` directory:

```shell
git clone https://github.com/Crazytieguy/trading-bootcamp-platform
cd trading-bootcamp-platform/client-web
pnpm install
pnpm install vite
```

Now copy the `example.env` file into `.env`, and fill in the blanks with your account details. For each you'll need to go to the [original website](https://fractal.market), log in, and press Ctrl+Shift+J or Cmd+Option+J to see the web console, where your account details (jwt, idJwt, and actingAs) are being logged.

Once you've done that, run `pnpm run dev` and go to [http://localhost:5173/](http://localhost:5173/) to see the example site!

There's a few supporting files in the project to help handle the underlying connection to the server, but it's designed so that you only need to look at `src/App.tsx` to build your UI. Try making small changes in the `App.tsx` code and see them reflected in the website!
