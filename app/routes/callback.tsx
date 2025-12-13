import type { LoaderFunctionArgs } from '@remix-run/cloudflare';
import { authkitLoader } from '@workos-inc/authkit-remix';

export const loader = (args: LoaderFunctionArgs) => {
  return authkitLoader(args);
};
