import { ProtectedRoute } from '../components/auth/ProtectedRoute';
import { UserMenu } from '../components/auth/UserMenu';

export default function Editor() {
  return (
    <ProtectedRoute>
      <div className="min-h-screen">
        {/* Add UserMenu to your header */}
        <header className="flex justify-between items-center p-4">
          <h1>Dashboard</h1>
          <UserMenu />
        </header>
        
        {/* Your existing editor content */}
      </div>
    </ProtectedRoute>
  );
}
