import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  test: {
    environment: 'node', // Cukup node environment untuk pengujian unit middleware
    include: ['tests/**/*.test.ts'],
  },
});
