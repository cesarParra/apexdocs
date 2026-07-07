import { defineConfig } from 'vitest/config';
import path from 'node:path';

export default defineConfig({
  test: {
    globals: true,
    environment: 'node',
    include: ['src/**/*.{spec,test}.ts'],
    exclude: ['dist/**', 'examples/**', 'node_modules/**'],
    alias: [
      { find: /^#utils\//, replacement: path.resolve(__dirname, 'src/util') + '/' },
      // yargs ships both ESM and CJS; the source uses the CJS singleton API
      // (yargs.config/parseSync). Resolve to the CJS build so tests match runtime.
      { find: /^yargs$/, replacement: path.resolve(__dirname, 'node_modules/yargs/index.cjs') },
    ],
  },
});
