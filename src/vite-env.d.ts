/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_GITHUB_TOKEN?: string
  readonly VITE_INDEED_API_KEY?: string
  readonly VITE_LINKEDIN_API_KEY?: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}