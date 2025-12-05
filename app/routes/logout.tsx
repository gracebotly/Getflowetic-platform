import type { ActionFunctionArgs, LoaderFunctionArgs } from '@remix-run/node';  
import { signOut } from '@workos-inc/authkit-remix';

/**  
 * Logout route - terminates the WorkOS session  
 *   
 * Handles both POST (form submission) and GET (direct navigation)  
 * POST is preferred for security (CSRF protection)  
 *   
 * This route:  
 * - Clears the secure session cookie  
 * - Redirects to the configured logout URL  
 */  
export async function action({ request }: ActionFunctionArgs) {  
  return await signOut(request);  
}

export async function loader({ request }: LoaderFunctionArgs) {  
  return await signOut(request);  
}

// No default export needed - this is an action-only route