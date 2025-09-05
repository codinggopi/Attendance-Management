import type { Student, Teacher, Course, AttendanceRecord, AttendanceStatus } from './types';

const handleResponse = async (response: Response) => {
    if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`API Error: ${response.status} ${response.statusText} - ${errorText}`);
    }
    return response.json();
}

// Student APIs
export const getStudents = (): Promise<Student[]> => fetch('/api/students').then(handleResponse);
export const addStudent = (studentData: Omit<Student, 'id'>): Promise<Student> => {
    return fetch('/api/students', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(studentData),
    }).then(handleResponse);
};
export const updateStudent = (student: Student): Promise<void> => {
    return fetch(`/api/students/${student.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(student),
    }).then(res => res.ok ? Promise.resolve() : Promise.reject());
};
export const deleteStudent = (studentId: string): Promise<void> => {
    return fetch(`/api/students/${studentId}`, { method: 'DELETE' })
     .then(res => res.ok ? Promise.resolve() : Promise.reject());
};


// Teacher APIs
export const getTeachers = (): Promise<Teacher[]> => fetch('/api/teachers').then(handleResponse);
export const addTeacher = (teacherData: Omit<Teacher, 'id'>): Promise<Teacher> => {
     return fetch('/api/teachers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(teacherData),
    }).then(handleResponse);
};
export const updateTeacher = (teacher: Teacher): Promise<void> => {
    return fetch(`/api/teachers/${teacher.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(teacher),
    }).then(res => res.ok ? Promise.resolve() : Promise.reject());
};
export const deleteTeacher = (teacherId: string): Promise<void> => {
    return fetch(`/api/teachers/${teacherId}`, { method: 'DELETE' })
     .then(res => res.ok ? Promise.resolve() : Promise.reject());
};

// Course APIs
export const getCourses = (): Promise<Course[]> => fetch('/api/courses').then(handleResponse);
export const addCourse = (courseData: Omit<Course, 'id'|'studentIds'>): Promise<Course> => {
    return fetch('/api/courses', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(courseData),
    }).then(handleResponse);
};
export const updateCourse = (course: Course): Promise<void> => {
    return fetch(`/api/courses/${course.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(course),
    }).then(res => res.ok ? Promise.resolve() : Promise.reject());
};
export const deleteCourse = (courseId: string): Promise<void> => {
    return fetch(`/api/courses/${courseId}`, { method: 'DELETE' })
     .then(res => res.ok ? Promise.resolve() : Promise.reject());
};
export const deleteAllCourses = (): Promise<void> => {
    return fetch('/api/courses/all', { method: 'DELETE' })
        .then(res => res.ok ? Promise.resolve() : Promise.reject());
};
export const enrollInCourse = (courseId: string, studentId: string): Promise<Course> => {
    return fetch(`/api/courses/${courseId}/enroll`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ studentId }),
    }).then(handleResponse);
}


// Attendance APIs
export const getAttendanceRecords = (): Promise<AttendanceRecord[]> => fetch('/api/attendance').then(handleResponse);
export const addAttendanceRecord = (recordData: Omit<AttendanceRecord, 'id'>): Promise<AttendanceRecord> => {
    return fetch('/api/attendance', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(recordData),
    }).then(handleResponse);
};
export const addBulkAttendanceRecords = (records: Omit<AttendanceRecord, 'id'>[]): Promise<void> => {
    return fetch('/api/attendance/bulk', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(records),
    }).then(res => res.ok ? Promise.resolve() : Promise.reject());
};
export const updateAttendanceRecord = (record: AttendanceRecord): Promise<void> => {
    return fetch(`/api/attendance/${record.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(record),
    }).then(res => res.ok ? Promise.resolve() : Promise.reject());
}

// User APIs
export const deleteAllUsers = (): Promise<void> => {
    return fetch('/api/users/all', { method: 'DELETE' })
     .then(res => res.ok ? Promise.resolve() : Promise.reject());
}
