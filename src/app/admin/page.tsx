import { PageHeader } from '@/components/page-header';
import AdminDashboard from '@/components/admin-dashboard';

export default function AdminPage() {
  return (
    <div className="flex flex-col min-h-screen bg-background">
      <main className="flex-1 p-4 sm:p-6 lg:p-8">
        <div className="max-w-7xl mx-auto">
          <PageHeader title="Admin Dashboard" />
          <div className="mt-6">
            <AdminDashboard />
          </div>
        </div>
      </main>
    </div>
  );
}
