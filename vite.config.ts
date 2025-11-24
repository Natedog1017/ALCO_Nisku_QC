import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  base: '/ALCO.Nisku.QC/',   // ← important for GitHub Pages
  build: {
    outDir: 'dist'            // ← make sure this says dist
  }
})
