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
  { id: 'c101', name: 'Algebra II', teacherId: 't01', studentIds: ['s001', 's002', 's005'], schedule: 'MWF 9:00 AM' },
  { id: 'c202', name: 'World History', teacherId: 't02', studentIds: ['s003', 's004', 's006', 's007'], schedule: 'TTh 1:00 PM' },
  { id: 'c303', name: 'English Literature', teacherId: 't01', studentIds: ['s001', 's003', 's004'], schedule: 'MWF 11:00 AM' },
  { id: 'c404', name: 'Chemistry', teacherId: 't02', studentIds: ['s002', 's005', 's006', 's007'], schedule: 'TTh 10:00 AM' },
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

export const getCurrentCourseForStudent = (studentId: string, date: Date): Course | undefined => {
  // Simple logic: find a course for today. In a real app, this would be complex.
  const day = date.getDay(); // 0=Sun, 1=Mon, ..., 6=Sat
  return courses.find(c => {
    if (!c.studentIds.includes(studentId)) return false;
    if (c.schedule.includes("MWF") && (day === 1 || day === 3 || day === 5)) return true;
    if (c.schedule.includes("TTh") && (day === 2 || day === 4)) return true;
    return false;
  });
};
