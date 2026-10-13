import { defineConfig } from '@playwright/test'

// Usa o Microsoft Edge/Chrome já instalado (nenhum download de navegador).
// Antes: npm run build. O servidor de preview é iniciado automaticamente.
export default defineConfig({
  testDir: './e2e',
  timeout: 180_000,
  reporter: [['list']],
  use: {
    baseURL: 'http://127.0.0.1:4173',
    channel: process.env.PW_CHANNEL ?? 'msedge',
    viewport: { width: 1920, height: 1080 },
    acceptDownloads: true,
  },
  webServer: {
    command: 'npm run preview -- --port 4173 --host 127.0.0.1 --strictPort',
    url: 'http://127.0.0.1:4173',
    reuseExistingServer: true,
    timeout: 60_000,
  },
})
