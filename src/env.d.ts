/// <reference types="astro/client" />
/// <reference types="@cloudflare/workers-types" />

declare global {
  namespace App {
    interface Locals {
      requestId?: string;
      userId?: string;
      userEmail?: string;
    }
  }

  interface Window {
    toggleTheme?: () => void;
    ui?: unknown;
  }

  const SwaggerUIBundle: {
    (options: Record<string, unknown>): unknown;
    presets: {
      apis: unknown;
    };
    StandalonePreset: unknown;
  };
}

export {};
