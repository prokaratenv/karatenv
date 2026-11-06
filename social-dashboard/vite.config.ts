/// <reference types="vitest" />
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { viteSingleFile } from 'vite-plugin-singlefile';

// `npm run build:single` produces one self-contained dist-single/index.html
// that can be opened from disk or hosted anywhere.
// `npm run build:artifact` is the same single file, minus features a sandboxed host blocks
// (file downloads, direct Claude API calls).
export default defineConfig(({ mode }) => ({
  plugins: mode === 'single' || mode === 'artifact' ? [react(), viteSingleFile()] : [react()],
  build: { outDir: mode === 'single' ? 'dist-single' : mode === 'artifact' ? 'dist-artifact' : 'dist' },
  test: { environment: 'node' },
}));
