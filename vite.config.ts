import { vitePlugin as remixVitePlugin } from '@remix-run/dev';
import UnoCSS from 'unocss/vite';
import { defineConfig, type ViteDevServer } from 'vite';
import tsconfigPaths from 'vite-tsconfig-paths';
import * as dotenv from 'dotenv';
import { installGlobals } from '@remix-run/node';
import { vercelPreset } from '@vercel/remix/vite';
import { nodePolyfills } from 'vite-plugin-node-polyfills';

dotenv.config({ path: '.env.local' });
dotenv.config({ path: '.env' });
dotenv.config();

installGlobals();

export default defineConfig(({ isSsrBuild }) => {
  const isSSR = isSsrBuild === true;

  return {
    define: {
      'process.env.NODE_ENV': JSON.stringify(process.env.NODE_ENV),
    },
    build: {
      target: 'esnext',
    },
    resolve: {
      alias: {},
    },
    optimizeDeps: {
      exclude: [],
    },
    plugins: [
      remixVitePlugin({
        presets: [vercelPreset()],
      }),
      // ✅ Only apply polyfills to CLIENT build, NOT server/SSR
      !isSSR && nodePolyfills({
        globals: {
          Buffer: true,
        },
        // Don't polyfill fs for browser
        exclude: ['fs', 'fs/promises', 'node:fs', 'node:fs/promises'],
      }),
      UnoCSS(),
      tsconfigPaths(),
    ].filter(Boolean),
    envPrefix: ['VITE_'],
    css: {
      preprocessorOptions: {
        scss: {
          api: 'modern-compiler',
        },
      },
    },
    test: {
      exclude: [
        '**/node_modules/**',
        '**/dist/**',
        '**/cypress/**',
        '**/.{idea,git,cache,output,temp}/**',
        '**/{karma,rollup,webpack,vite,vitest,jest,ava,babel,nyc,cypress,tsup,build}.config.*',
        '**/tests/preview/**',
      ],
    },
    ssr: {
      noExternal: ['convex'],
    },
  };
});
