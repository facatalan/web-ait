import { AuthProvider } from '../auth/AuthProvider';
import { AdminDashboard } from './AdminDashboard';

export default function AdminPage() {
  return (
    <AuthProvider>
      <AdminDashboard />
    </AuthProvider>
  );
}
