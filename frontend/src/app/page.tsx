import Link from 'next/link';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { UserCog, BookUser, User, GraduationCap } from 'lucide-react';

const roles = [
  {
    name: 'Admin',
    href: '/login/admin',
    description: 'Manage teachers, students, and system settings.',
    icon: <UserCog className="w-12 h-12" />,
  },
  {
    name: 'Teacher',
    href: '/login/teacher',
    description: 'Track attendance and manage your students.',
    icon: <BookUser className="w-12 h-12" />,
  },
  {
    name: 'Student',
    href: '/login/student',
    description: 'Login to your class and view your attendance.',
    icon: <User className="w-12 h-12" />,
  },
];


export default function Home() {
  return (
    <main className="relative flex flex-col items-center justify-center min-h-screen p-4 sm:p-6 lg:p-8">
      {/* ===== HERO ===== */}
      <div className="text-center mb-12">
        <div className="inline-flex items-center justify-center bg-primary text-primary-foreground p-4 rounded-full mb-4 shadow-lg">
          <GraduationCap className="w-16 h-16" />
        </div>
        <h1
  className="
    font-headline font-bold text-primary
    text-4xl sm:text-5xl md:text-6xl
    mt-4
    flex items-center justify-center gap-4
  "
><span>A+ Attendance</span>
</h1>
        <p className="mt-4 text-lg sm:text-xl text-muted-foreground max-w-2xl mx-auto">
          The smart, simple, and streamlined way to manage class attendance.
        </p>
      </div>

      {/* ===== ROLES ===== */}
      <div className="w-full max-w-4xl">
        <h2 className="text-2xl font-semibold text-center mb-6 text-foreground">
          Select Your Role
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {roles.map((role) => (
            <Link href={role.href} key={role.name} className="group">
              <Card className="h-full transition-all duration-300 ease-in-out hover:shadow-xl hover:-translate-y-2 hover:border-primary">
                <CardHeader className="items-center text-center">
                  <div className="p-4 bg-secondary rounded-full text-primary mb-4 transition-colors group-hover:bg-primary group-hover:text-primary-foreground">
                    {role.icon}
                  </div>
                  <CardTitle className="text-2xl font-headline">
                    {role.name}
                  </CardTitle>
                </CardHeader>

                <CardContent>
                  <CardDescription className="text-center">
                    {role.description}
                  </CardDescription>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      </div>
    </main>
  );
}

