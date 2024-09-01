import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { viteCommonjs } from "@originjs/vite-plugin-commonjs";

export default defineConfig({
  plugins: [
    viteCommonjs({
      include: [
        "schema-js",
        "clsx",
        "scheduler",
        "@protobufjs/aspromise",
        "@protobufjs/base64",
        "@protobufjs/eventemitter",
        "@protobufjs/float",
        "@protobufjs/inquire",
        "@protobufjs/utf8",
        "@protobufjs/pool",
      ],
    }),
    react(),
  ],
  server: {
    proxy: {
      "/api": {
        target: "ws://127.0.0.1:8080",
        ws: true,
      },
    },
    host: true,
  },
  resolve: {
    preserveSymlinks: true,
  },
  optimizeDeps: {
    include: ["schema-js", "clsx", "scheduler", "protobufjs"],
  },
  build: {
    commonjsOptions: {
      include: [/node_modules/],
      transformMixedEsModules: true,
    },
  },
});
