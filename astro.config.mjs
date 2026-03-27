// @ts-check
import { defineConfig } from 'astro/config';
import tailwindcss from '@tailwindcss/vite';
import react from '@astrojs/react';

export default defineConfig({
  site: 'https://kaankeskindil.com',
  vite: {
    plugins: [tailwindcss()],
    build: {
      minify: false,
      rollupOptions: {
        output: {
          manualChunks(id) {
            if (id.includes('three/')) return 'vendor-three';
            if (id.includes('@react-three/')) return 'vendor-r3f';
          }
        }
      }
    },
    ssr: {
      external: ['three', '@react-three/fiber', '@react-three/drei']
    }
  },
  integrations: [react()]
});
