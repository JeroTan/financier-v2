// @ts-check
import { defineConfig } from "astro/config";
import cloudflare from "@astrojs/cloudflare";
import react from "@astrojs/react";
import tailwindcss from "@tailwindcss/vite";

const serverOnlyOptimizeExcludes = ["drizzle-orm", "drizzle-orm/d1"];
const remoteBindings = process.env.CLOUDFLARE_REMOTE_BINDINGS !== "false";
const inspectorPort = process.env.CLOUDFLARE_INSPECTOR === "false" ? false : undefined;

// https://astro.build/config
export default defineConfig({
  output: "server",
  devToolbar: {
    enabled: false,
  },
  server: {
    port: 4333,
    host: true,
  },
  adapter: cloudflare({ remoteBindings, inspectorPort }),
  integrations: [react()],
  vite: {
    optimizeDeps: {
      exclude: serverOnlyOptimizeExcludes,
    },
    plugins: [tailwindcss()],
    resolve: {
      alias: {
        "@": "/src",
      },
    },
  },
});
