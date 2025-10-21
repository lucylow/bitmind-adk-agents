/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_SUPABASE_URL: string
  readonly VITE_SUPABASE_ANON_KEY: string
  readonly VITE_OPENAI_API_KEY?: string
  readonly VITE_GOOGLE_API_KEY?: string
  readonly VITE_ETH_RPC_URL?: string
  readonly VITE_POLYGON_RPC_URL?: string
  readonly VITE_SUBGRAPH_URL?: string
  // add more env variables as needed
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}

