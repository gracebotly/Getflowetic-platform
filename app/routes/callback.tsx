import type { LoaderFunctionArgs } from '@remix-run/cloudflare';
import { authkitLoader } from '@workos-inc/authkit-remix';

export const loader = async (args: LoaderFunctionArgs) => {
  // Let AuthKit process the callback and set the session cookie
  const response = await authkitLoader(args);

  // Preserve all headers (including Set-Cookie) and add the redirect Location
  const headers = new Headers(response.headers);
  headers.set('Location', '/');

  // Redirect to home while keeping the Set-Cookie header intact
  return new Response(null, {
    status: 302,
    headers,
  });
};
