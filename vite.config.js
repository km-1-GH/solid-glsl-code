import { defineConfig } from 'vite';
import solidPlugin from 'vite-plugin-solid';

export default defineConfig({
  plugins: [solidPlugin()],
  server: {
    port: 3000,
    open: '/index.html',
    base: '/',
    hmr: false,
  },
  build: {
    target: 'esnext',
    rollupOptions: {
      input: {
        index: 'index.html',
        webgl01: 'WebGLSchool-01.html',
        webgl02: 'WebGLSchool-02.html',
        webgl03: 'WebGLSchool-03.html',
        webgl05: 'WebGLSchool-05.html',
      },
    },
  },
  base: '/solid-glsl',
});
