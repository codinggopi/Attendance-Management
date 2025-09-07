import type { Student, Teacher, Course, AttendanceRecord } from './types';

export const students: Student[] = [
  { id: 1, name: 'Alice Johnson', dept: 'Computer Science', email: 'alice.j@example.com' },
  { id: 2, name: 'Bob Williams', dept: 'Physics', email: 'bob.w@example.com' },
  { id: 3, name: 'Charlie Brown', dept: 'Mathematics', email: 'charlie.b@example.com' },
  { id: 4, name: 'Diana Miller', dept: 'Chemistry', email: 'diana.m@example.com' },
  { id: 5, name: 'Ethan Davis', dept: 'Computer Science', email: 'ethan.d@example.com' },
  { id: 6, name: 'Fiona Garcia', dept: 'Physics', email: 'fiona.g@example.com' },
  { id: 7, name: 'George Rodriguez', dept: 'Mathematics', email: 'george.r@example.com' },
];

export const teachers: Teacher[] = [
  { id: 1, name: 'Mr. Smith', email: 'smith@example.com' },
  { id: 2, name: 'Ms. Jones', email: 'jones@example.com' },
];

export const courses: Course[] = [
  { id: 101, name: 'Algebra II', teacherId: 1, studentIds: [1, 2, 5] },
  { id: 202, name: 'World History', teacherId: 2, studentIds: [3, 4, 6, 7] },
  { id: 303, name: 'English Literature', teacherId: 1, studentIds: [1, 3, 4] },
  { id: 404, name: 'Chemistry', teacherId: 2, studentIds: [2, 5, 6, 7] },
];

export const attendanceRecords: AttendanceRecord[] = [
  // Alice's records
  { id: 1, studentId: 1, courseId: 101, date: '2023-10-02', status: 'present' },
  { id: 2, studentId: 1, courseId: 101, date: '2023-10-04', status: 'absent' },
  { id: 3, studentId: 1, courseId: 101, date: '2023-10-06', status: 'present' },
  // Bob's records
  { id: 4, studentId: 2, courseId: 101, date: '2023-10-02', status: 'present' },
  { id: 5, studentId: 2, courseId: 101, date: '2023-10-04', status: 'present' },
  { id: 6, studentId: 2, courseId: 101, date: '2023-10-06', status: 'late' },
  // Charlie's records - poor attendance
  { id: 7, studentId: 3, courseId: 202, date: '2023-10-03', status: 'absent' },
  { id: 8, studentId: 3, courseId: 202, date: '2023-10-05', status: 'absent' },
];
