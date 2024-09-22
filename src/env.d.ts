/// <reference path="../.astro/types.d.ts" />
/// <reference types="astro/client" />

interface ImportMetaEnv {
  readonly PUBLIC_MOVEMBERAPI: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
