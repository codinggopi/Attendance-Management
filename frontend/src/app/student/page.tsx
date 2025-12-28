import { PageHeader } from '@/components/page-header';
import StudentDashboard from '@/components/student-dashboard';

export default function StudentPage() {
  return (
    <div className="flex flex-col min-h-screen bg-background">
      <main className="flex-1 p-4 sm:p-6 lg:p-8">
        <div className="max-w-7xl mx-auto">
          <PageHeader title="Student Dashboard" />
          <div className="mt-6">
            <StudentDashboard />
          </div>
        </div>
      </main>
    </div>
  );
}
