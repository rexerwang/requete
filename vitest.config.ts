import { defineConfig } from 'vitest/config'

export default defineConfig({
  test: {
    globals: true,
    setupFiles: ['./test/setup'],
    alias: {
      'requete/shared': './src/shared.ts',
      'requete/adapter': './src/adapter.ts',
      'requete/middleware': './src/middleware.ts',
      requete: './src/index.ts',
    },
  },
})
