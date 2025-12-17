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
      !isSSR && nodePolyfills({
        include: ["buffer"],
        globals: {
          Buffer: true,
          global: false,
          process: false,
        },
        protocolImports: true,
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
      external: isSSR ? [] : ['@remix-run/node', 'undici'],
    },
  };
});
