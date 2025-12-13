import type { LoaderFunctionArgs } from '@remix-run/cloudflare';
import { redirect } from '@remix-run/cloudflare';
import { authkitLoader } from '@workos-inc/authkit-remix';

export const loader = async (args: LoaderFunctionArgs) => {
  // Process the callback (sets session cookie)
  await authkitLoader(args);
  
  // Redirect to home page after successful authentication
  return redirect('/');
};
