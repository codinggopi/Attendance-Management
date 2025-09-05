export type AttendanceStatus = 'present' | 'absent' | 'late' | 'unmarked';

export interface Student {
  id: string;
  name: string;
  dept: string;
  email: string;
}

export interface Teacher {
  id: string;
  name: string;
  email: string;
}

export interface Course {
  id: string;
  name: string;
  teacherId: string;
  studentIds: string[];
  schedule: string;
}

export interface AttendanceRecord {
  id: string;
  studentId: string;
  courseId: string;
  date: string; // YYYY-MM-DD
  status: AttendanceStatus;
}

    