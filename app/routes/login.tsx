import type { LoaderFunctionArgs } from '@remix-run/node';  
import { redirect } from '@remix-run/node';  
import { getSignInUrl } from '@workos-inc/authkit-remix';

/**  
 * Login route - redirects to WorkOS hosted authentication page  
 *   
 * This route:  
 * - Generates the WorkOS sign-in URL with proper OAuth parameters  
 * - Redirects user to WorkOS for authentication  
 * - No client-side rendering needed  
 */  
export const loader = async (args: LoaderFunctionArgs) => {  
  const signInUrl = await getSignInUrl();  
  return redirect(signInUrl);  
};

// No default export needed - this is a redirect-only route