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
        index: 'src/index/index.jsx',
        webgl01: 'src/WebGLSchool-01/main.js'
      }
    }
  },
  base: '/solid-glsl'
});
