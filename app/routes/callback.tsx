import type { LoaderFunctionArgs } from '@remix-run/cloudflare';
import pkg from '@workos-inc/authkit-remix';

const { handleAuth } = pkg;

export const loader = (args: LoaderFunctionArgs) => {
  return handleAuth()(args);
};
