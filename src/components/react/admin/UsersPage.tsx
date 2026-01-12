import { AuthProvider } from '../auth/AuthProvider';
import { UsersManagement } from './UsersManagement';

export default function UsersPage() {
  return (
    <AuthProvider>
      <UsersManagement />
    </AuthProvider>
  );
}
