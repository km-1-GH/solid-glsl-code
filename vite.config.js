import { defineConfig } from 'vite';
import solidPlugin from 'vite-plugin-solid';

export default defineConfig({
  plugins: [solidPlugin()],
  server: {
    port: 3000,
    open: '/index.html',
  },
  build: {
    target: 'esnext',
    rollupOptions: {
      input: {
        index: 'index.html',
        webgl01: 'WebGLSchool-01.html',
      },
    },
  },
  base: '/solid-glsl'
});
