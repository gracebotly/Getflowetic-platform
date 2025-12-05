import type { LoaderFunctionArgs } from '@remix-run/node';  
import { authLoader } from '@workos-inc/authkit-remix';

/**  
 * OAuth callback route for WorkOS AuthKit  
 * Handles the OAuth redirect from WorkOS after authentication  
 *   
 * This route:  
 * - Exchanges the authorization code for a session  
 * - Sets a secure HTTP-only session cookie  
 * - Redirects user back to the application  
 */  
export const loader = (args: LoaderFunctionArgs) => {  
  return authLoader(args);  
};

// No default export needed - this is a redirect-only route