import Link from 'next/link';
import { GraduationCap, LogOut } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ThemeToggle } from '@/components/theme-toggle';

type PageHeaderProps = {
  title: string;
};

export function PageHeader({ title }: PageHeaderProps) {
  return (
    <header className="bg-card shadow-sm p-4 rounded-lg flex items-center justify-between">
      <div className="flex items-center gap-4">
        <Link href="/" className="flex items-center gap-2 text-primary">
          <GraduationCap className="h-8 w-8" />
          <span className="font-headline text-xl font-bold hidden sm:inline">A+ Attendance</span>
        </Link>
        <div className="w-px h-8 bg-border mx-2 hidden md:block"></div>
        <h1 className="text-xl font-semibold text-foreground">{title}</h1>
      </div>
      <div className="flex items-center gap-4">
        <ThemeToggle  />
        <Button variant="outline" asChild>
        <Link href="/">
          <LogOut className="mr-2 h-4 w-4" />
          Sign Out
        </Link>
      </Button>
      </div>

    </header>
  );
}
