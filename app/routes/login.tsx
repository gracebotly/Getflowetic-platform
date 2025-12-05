import { useAuth } from '@workos-inc/authkit-react';
import { Navigate, useLocation } from 'react-router-dom';
import { useEffect, useState } from 'react';

export default function Login() {
  const { user, isLoading, getAuthorizationUrl } = useAuth();
  const location = useLocation();
  const [isRedirecting, setIsRedirecting] = useState(false);

  // Get the page they tried to visit (or default to dashboard)
  const from = (location.state as any)?.from?.pathname || '/dashboard';

  useEffect(() => {
    // If already logged in, redirect to intended destination
    if (user) {
      return;
    }

    // If not loading and no user, redirect to WorkOS AuthKit
    if (!isLoading && !user && !isRedirecting) {
      setIsRedirecting(true);
      
      // Get WorkOS authorization URL and redirect
      const authUrl = getAuthorizationUrl();
      window.location.href = authUrl;
    }
  }, [user, isLoading, getAuthorizationUrl, isRedirecting]);

  // If user is logged in, redirect to intended page
  if (user) {
    return <Navigate to={from} replace />;
  }

  // Show loading state while redirecting
  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-indigo-50 to-purple-50">
      <div className="text-center p-8 bg-white rounded-xl shadow-lg">
        <div className="mb-6">
          <svg
            className="w-16 h-16 mx-auto text-indigo-600"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
            />
          </svg>
        </div>
        <h1 className="text-2xl font-bold text-gray-900 mb-4">
          Getflowetic
        </h1>
        <p className="text-gray-600 mb-6">
          {isRedirecting ? 'Redirecting to login...' : 'Preparing secure login...'}
        </p>
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600 mx-auto" />
      </div>
    </div>
  );
}
