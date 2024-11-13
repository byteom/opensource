import { defineConfig } from 'vite';

export default defineConfig({
  // Any other config...
  define: {
    'process.env': process.env,
  },
});
