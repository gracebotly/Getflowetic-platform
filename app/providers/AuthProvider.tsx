import { AuthKitProvider } from '@workos-inc/authkit-react';
import { ReactNode } from 'react';

interface AuthProviderProps {
  children: ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const clientId = import.meta.env.VITE_WORKOS_CLIENT_ID;
  
  if (!clientId) {
    console.error('VITE_WORKOS_CLIENT_ID is not set');
    return null;
  }

  return (
    <AuthKitProvider
      clientId={clientId}
      apiHostname="api.workos.com"
    >
      {children}
    </AuthKitProvider>
  );
}
