import type { LoaderFunctionArgs } from '@remix-run/cloudflare';
import { handleAuth } from '@workos-inc/authkit-remix';


export const loader = (args: LoaderFunctionArgs) => {
  return handleAuth()(args);
};