import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// Caminho do backend dentro do htdocs do XAMPP (C:\xampp\htdocs\entrefans\entrefans\backend)
const BACKEND_PATH = '/entrefans/entrefans/backend'
const proxy = (p: string) => ({ target: 'http://localhost:8080',changeOrigin: true, rewrite: (path: string) => path.replace(p, `${BACKEND_PATH}${p}`) })

export default defineConfig({
  plugins: [react()],
  server: { port: 5173, proxy: { '/api': proxy('/api'), '/uploads': proxy('/uploads') } },
})
