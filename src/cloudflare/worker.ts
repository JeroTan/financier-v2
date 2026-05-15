import { handle } from "@astrojs/cloudflare/handler";

// For modularity, export all from your durable objects here
// export * from "./durable-objects/__IF_THERE_IS_ANY";

export default {
  async fetch(request, env, ctx) {
    return handle(request, env, ctx);
  },
} satisfies ExportedHandler<Env>;
