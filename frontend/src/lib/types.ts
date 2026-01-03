export type AttendanceStatus = 'present' | 'absent' | 'late' | 'unmarked';

export interface Student {
  id: number;
  name: string;
  dept: string;
  email: string;
}

export interface Teacher {
  id: number;
  name: string;
  email: string;
  dept: string;
}

export interface Course {
  id: number;
  name: string;
  teacherId: number;
  studentIds: number[];
}

export interface AttendanceRecord {
  id: number;
  studentId: number;
  courseId: number;
  date: string; // YYYY-MM-DD
  status: AttendanceStatus;
}
