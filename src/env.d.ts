/// <reference path="../.astro/types.d.ts" />
/// <reference types="astro/client" />

interface ImportMetaEnv {
  readonly PUBLIC_MOVEMBERAPI: string;
  readonly PUBLIC_CHRONOS_API_URL: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
