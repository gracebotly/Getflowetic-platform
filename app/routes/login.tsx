import type { LoaderFunctionArgs } from '@remix-run/node';
import { redirect } from '@remix-run/node';
import { getSignInUrl } from '@workos-inc/authkit-remix';

/**
 * Login route - redirects to WorkOS hosted authentication page
 */
export const loader = async (_args: LoaderFunctionArgs) => {
  const signInUrl = await getSignInUrl();
  return redirect(signInUrl);
};
