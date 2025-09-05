import { PageHeader } from '@/components/page-header';
import TeacherDashboard from '@/components/teacher-dashboard';

export default function TeacherPage() {
  return (
    <div className="flex flex-col min-h-screen bg-background">
      <main className="flex-1 p-4 sm:p-6 lg:p-8">
        <div className="max-w-7xl mx-auto">
          <PageHeader title="Teacher Dashboard" />
          <div className="mt-6">
            <TeacherDashboard />
          </div>
        </div>
      </main>
    </div>
  );
}
