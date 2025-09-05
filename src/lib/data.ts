import type { Student, Teacher, Course, AttendanceRecord } from './types';

export const students: Student[] = [
  { id: 's001', name: 'Alice Johnson', dept: 'Computer Science', email: 'alice.j@example.com' },
  { id: 's002', name: 'Bob Williams', dept: 'Physics', email: 'bob.w@example.com' },
  { id: 's003', name: 'Charlie Brown', dept: 'Mathematics', email: 'charlie.b@example.com' },
  { id: 's004', name: 'Diana Miller', dept: 'Chemistry', email: 'diana.m@example.com' },
  { id: 's005', name: 'Ethan Davis', dept: 'Computer Science', email: 'ethan.d@example.com' },
  { id: 's006', name: 'Fiona Garcia', dept: 'Physics', email: 'fiona.g@example.com' },
  { id: 's007', name: 'George Rodriguez', dept: 'Mathematics', email: 'george.r@example.com' },
];

export const teachers: Teacher[] = [
  { id: 't01', name: 'Mr. Smith', email: 'smith@example.com' },
  { id: 't02', name: 'Ms. Jones', email: 'jones@example.com' },
];

export const courses: Course[] = [
  { id: 'c101', name: 'Algebra II', teacherId: 't01', studentIds: ['s001', 's002', 's005'] },
  { id: 'c202', name: 'World History', teacherId: 't02', studentIds: ['s003', 's004', 's006', 's007'] },
  { id: 'c303', name: 'English Literature', teacherId: 't01', studentIds: ['s001', 's003', 's004'] },
  { id: 'c404', name: 'Chemistry', teacherId: 't02', studentIds: ['s002', 's005', 's006', 's007'] },
];

export const attendanceRecords: AttendanceRecord[] = [
  // Alice's records
  { id: 'ar001', studentId: 's001', courseId: 'c101', date: '2023-10-02', status: 'present' },
  { id: 'ar002', studentId: 's001', courseId: 'c101', date: '2023-10-04', status: 'absent' },
  { id: 'ar003', studentId: 's001', courseId: 'c101', date: '2023-10-06', status: 'present' },
  // Bob's records
  { id: 'ar004', studentId: 's002', courseId: 'c101', date: '2023-10-02', status: 'present' },
  { id: 'ar005', studentId: 's002', courseId: 'c101', date: '2023-10-04', status: 'present' },
  { id: 'ar006', studentId: 's002', courseId: 'c101', date: '2023-10-06', status: 'late' },
  // Charlie's records - poor attendance
  { id: 'ar007', studentId: 's003', courseId: 'c202', date: '2023-10-03', status: 'absent' },
  { id: 'ar008', studentId: 's003', courseId: 'c202', date: '2023-10-05', status: 'absent' },
];
