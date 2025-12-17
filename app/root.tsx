// app/root.tsx  
import React from 'react';  
import type { LinksFunction, LoaderFunctionArgs } from '@remix-run/node';  
import {  
  Links,  
  Meta,  
  Outlet,  
  Scripts,  
  ScrollRestoration,  
} from '@remix-run/react';  
import { authkitLoader } from '@workos-inc/authkit-remix';

import tailwindReset from '@unocss/reset/tailwind-compat.css?url';  
import { useStore } from '@nanostores/react';  
import { themeStore } from './lib/stores/theme';  
import { stripIndents } from './utils/stripIndent';  
import { createHead } from 'remix-island';  
import { useEffect } from 'react';  
import { DndProvider } from 'react-dnd';  
import { HTML5Backend } from 'react-dnd-html5-backend';  
import { ConvexProvider } from 'convex/react';  
import { convex } from '~/lib/convexClient';  
import { cssTransition, ToastContainer } from 'react-toastify';

import reactToastifyStyles from 'react-toastify/dist/ReactToastify.css?url';  
import globalStyles from './styles/index.scss?url';  
import xtermStyles from '@xterm/xterm/css/xterm.css?url';

import 'virtual:uno.css';

const toastAnimation = cssTransition({  
  enter: 'animated fadeInRight',  
  exit: 'animated fadeOutRight',  
});

export const links: LinksFunction = () => [  
  { rel: 'icon', href: '/favicon.svg', type: 'image/svg+xml' },  
  { rel: 'stylesheet', href: reactToastifyStyles },  
  { rel: 'stylesheet', href: tailwindReset },  
  { rel: 'stylesheet', href: globalStyles },  
  { rel: 'stylesheet', href: xtermStyles },  
  { rel: 'preconnect', href: 'https://fonts.googleapis.com' },  
  {  
    rel: 'preconnect',  
    href: 'https://fonts.gstatic.com',  
    crossOrigin: 'anonymous',  
  },  
  {  
    rel: 'stylesheet',  
    href: 'https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap',  
  },  
];

const inlineThemeCode = stripIndents`  
  setTutorialKitTheme();

  function setTutorialKitTheme() {  
    let theme = localStorage.getItem('bolt_theme');

    if (!theme) {  
      theme = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';  
    }

    document.querySelector('html')?.setAttribute('data-theme', theme);  
  }  
`;

export const Head = createHead(() => (  
  <>  
    <meta charSet="utf-8" />  
    <meta name="viewport" content="width=device-width, initial-scale=1" />  
    <Meta />  
    <Links />  
    <script dangerouslySetInnerHTML={{ __html: inlineThemeCode }} />  
  </>  
));

/**  
 * Global Auth Loader  
 * ------------------  
 * This pattern:  
 * - Runs on every request  
 * - Injects WorkOS `user`, `session`, `signInUrl`, `signUpUrl` into root route load data  
 * - Allows every child route to access auth state via useLoaderData  
 * - Enables protected loaders (`ensureSignedIn`)  
 */  
export const loader = (args: LoaderFunctionArgs) =>  
  authkitLoader(args, async ({ auth }) => {  
    // `auth` contains: user, sessionId, organizationId, accessToken, etc.  
    // Return auth so components can access user data via useRouteLoaderData
    return auth;  
  });

function ClientProviders({ children }: { children: React.ReactNode }) {
  const [isClient, setIsClient] = React.useState(false);

  React.useEffect(() => {
    setIsClient(true);
  }, []);

  if (!isClient) {
    return <>{children}</>;
  }

  return (
    <DndProvider backend={HTML5Backend}>{children}</DndProvider>
  );
}

export function Layout({ children }: { children: React.ReactNode }) {  
  const theme = useStore(themeStore);

  useEffect(() => {  
    document.querySelector('html')?.setAttribute('data-theme', theme);  
  }, [theme]);

  return (  
    <html>  
      <head>  
        <Meta />  
        <Links />  
        <script dangerouslySetInnerHTML={{ __html: inlineThemeCode }} />  
      </head>  
      <body>  
        <ConvexProvider client={convex}>
          <ClientProviders>{children}</ClientProviders>
        </ConvexProvider>
        <ToastContainer  
          closeButton={({ closeToast }) => (  
            <button className="Toastify__close-button" onClick={closeToast}>  
              <div className="i-ph:x text-lg" />  
            </button>  
          )}  
          icon={({ type }) => {  
            switch (type) {  
              case 'success':  
                return (  
                  <div className="i-ph:check-bold text-bolt-elements-icon-success text-2xl" />  
                );  
              case 'error':  
                return (  
                  <div className="i-ph:warning-circle-bold text-bolt-elements-icon-error text-2xl" />  
                );  
            }  
          }}  
          position="bottom-right"  
          pauseOnFocusLoss  
          transition={toastAnimation}  
          autoClose={3000}  
        />  
        <ScrollRestoration />  
        <Scripts />  
      </body>  
    </html>  
  );  
}

export default function App() {
  return <Outlet />;
}
