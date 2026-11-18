/// <reference types="vite/client" />
interface ImportMetaEnv { readonly VITE_AUTOR: string; readonly VITE_SITE_URL: string }
interface ImportMeta { readonly env: ImportMetaEnv }
