
import type { Student, Teacher, Course, AttendanceRecord, AttendanceStatus } from './types';

// TODO: Replace with your actual backend URL
const BASE_URL = 'https://t2cl04dd-8000.inc1.devtunnels.ms';

const handleResponse = async (response: Response) => {
    if (!response.ok) {
        const errorText = await response.text().catch(() => 'Could not read error response');
        throw new Error(`API Error: ${response.status} ${response.statusText} - ${errorText}`);
    }
    if (response.status === 204) {
        // No content to parse, return null or an appropriate value
        return null;
    }
    try {
        return await response.json();
    } catch (error) {
        throw new Error('Failed to parse JSON response from API.');
    }
}

// Student APIs
export const getStudents = (): Promise<Student[]> => fetch(`${BASE_URL}/api/students/`).then(handleResponse);
export const addStudent = (studentData: Omit<Student, 'id'>): Promise<Student> => {
    return fetch(`${BASE_URL}/api/students/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(studentData),
    }).then(handleResponse);
};
export const updateStudent = (student: Student): Promise<void> => {
    return fetch(`${BASE_URL}/api/students/${student.id}/`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(student),
    }).then(handleResponse);
};
export const deleteStudent = (studentId: string): Promise<void> => {
    return fetch(`${BASE_URL}/api/students/${studentId}/`, { method: 'DELETE' })
     .then(handleResponse);
};


// Teacher APIs
export const getTeachers = (): Promise<Teacher[]> => fetch(`${BASE_URL}/api/teachers/`).then(handleResponse);
export const addTeacher = (teacherData: Omit<Teacher, 'id'>): Promise<Teacher> => {
     return fetch(`${BASE_URL}/api/teachers/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(teacherData),
    }).then(handleResponse);
};
export const updateTeacher = (teacher: Teacher): Promise<void> => {
    return fetch(`${BASE_URL}/api/teachers/${teacher.id}/`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(teacher),
    }).then(handleResponse);
};
export const deleteTeacher = (teacherId: string): Promise<void> => {
    return fetch(`${BASE_URL}/api/teachers/${teacherId}/`, { method: 'DELETE' })
     .then(handleResponse);
};

// Course APIs
export const getCourses = (): Promise<Course[]> => fetch(`${BASE_URL}/api/courses/`).then(handleResponse);
export const addCourse = (courseData: Omit<Course, 'id'|'studentIds'>): Promise<Course> => {
    return fetch(`${BASE_URL}/api/courses/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(courseData),
    }).then(handleResponse);
};
export const updateCourse = (course: Course): Promise<void> => {
    return fetch(`${BASE_URL}/api/courses/${course.id}/`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(course),
    }).then(handleResponse);
};
export const deleteCourse = (courseId: string): Promise<void> => {
    return fetch(`${BASE_URL}/api/courses/${courseId}/`, { method: 'DELETE' })
     .then(handleResponse);
};
export const deleteAllCourses = (): Promise<void> => {
    return fetch(`${BASE_URL}/api/courses/all/`, { method: 'DELETE' })
        .then(handleResponse);
};
export const enrollInCourse = (courseId: string, studentId: string): Promise<Course> => {
    return fetch(`${BASE_URL}/api/courses/${courseId}/enroll/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ studentId }),
    }).then(handleResponse);
}


// Attendance APIs
export const getAttendanceRecords = (): Promise<AttendanceRecord[]> => fetch(`${BASE_URL}/api/attendance/`).then(handleResponse);
export const addAttendanceRecord = (recordData: Omit<AttendanceRecord, 'id'>): Promise<AttendanceRecord> => {
    return fetch(`${BASE_URL}/api/attendance/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(recordData),
    }).then(handleResponse);
};
export const addBulkAttendanceRecords = (records: Omit<AttendanceRecord, 'id'>[]): Promise<void> => {
    return fetch(`${BASE_URL}/api/attendance/bulk/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(records),
    }).then(handleResponse);
};
export const updateAttendanceRecord = (record: AttendanceRecord): Promise<void> => {
    return fetch(`${BASE_URL}/api/attendance/${record.id}/`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(record),
    }).then(handleResponse);
}

// User APIs
export const deleteAllUsers = (): Promise<void> => {
    return fetch(`${BASE_URL}/api/users/all/`, { method: 'DELETE' })
     .then(handleResponse);
}
