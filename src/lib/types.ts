export type AttendanceStatus = 'present' | 'absent' | 'late' | 'unmarked';

export interface Student {
  id: string;
  name: string;
  grade: number;
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
  schedule: string; // e.g., "MWF 10:00 - 11:00"
}

export interface AttendanceRecord {
  id: string;
  studentId: string;
  courseId: string;
  date: string; // YYYY-MM-DD
  status: AttendanceStatus;
}
