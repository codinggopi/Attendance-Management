
import type { Student, Teacher, Course, AttendanceRecord, AttendanceStatus } from './types';

// TODO: Replace with your actual backend URL
const BASE_URL = 'https://t2cl04dd-8000.inc1.devtunnels.ms';
// const BASE_URL = 'https://codinggopi.pythonanywhere.com';
 
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
export const getStudents = async (): Promise<Student[]> => {
    try {
        const response = await fetch(`${BASE_URL}/api/students/`);
        return handleResponse(response);
    } catch (error) {
        console.error("Failed to fetch students:", error);
        throw error;
    }
};

export const addStudent = async (studentData: Omit<Student, 'id'>): Promise<Student> => {
    try {
        const response = await fetch(`${BASE_URL}/api/students/`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(studentData),
        });
        return handleResponse(response);
    } catch (error) {
        console.error("Failed to add student:", error);
        throw error;
    }
};

export const updateStudent = async (student: Student): Promise<void> => {
    try {
        const response = await fetch(`${BASE_URL}/api/students/${student.id}/`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(student),
        });
        return handleResponse(response);
    } catch (error) {
        console.error("Failed to update student:", error);
        throw error;
    }
};

export const deleteStudent = async (studentId: number): Promise<void> => {
    try {
        const response = await fetch(`${BASE_URL}/api/students/${studentId}/`, { method: 'DELETE' });
        return handleResponse(response);
    } catch (error) {
        console.error("Failed to delete student:", error);
        throw error;
    }
};


// Teacher APIs
export const getTeachers = async (): Promise<Teacher[]> => {
    try {
        const response = await fetch(`${BASE_URL}/api/teachers/`);
        return handleResponse(response);
    } catch (error) {
        console.error("Failed to fetch teachers:", error);
        throw error;
    }
};

export const addTeacher = async (teacherData: Omit<Teacher, 'id'>): Promise<Teacher> => {
    try {
        const response = await fetch(`${BASE_URL}/api/teachers/`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(teacherData),
        });
        return handleResponse(response);
    } catch (error) {
        console.error("Failed to add teacher:", error);
        throw error;
    }
};

export const updateTeacher = async (teacher: Teacher): Promise<void> => {
    try {
        const response = await fetch(`${BASE_URL}/api/teachers/${teacher.id}/`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(teacher),
        });
        return handleResponse(response);
    } catch (error) {
        console.error("Failed to update teacher:", error);
        throw error;
    }
};

export const deleteTeacher = async (teacherId: number): Promise<void> => {
    try {
        const response = await fetch(`${BASE_URL}/api/teachers/${teacherId}/`, { method: 'DELETE' });
        return handleResponse(response);
    } catch (error) {
        console.error("Failed to delete teacher:", error);
        throw error;
    }
};

// Course APIs
export const getCourses = async (): Promise<Course[]> => {
    try {
        const response = await fetch(`${BASE_URL}/api/courses/`);
        return handleResponse(response);
    } catch (error) {
        console.error("Failed to fetch courses:", error);
        throw error;
    }
};

export const addCourse = async (courseData: Omit<Course, 'id'|'studentIds'>): Promise<Course> => {
    try {
        const response = await fetch(`${BASE_URL}/api/courses/`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(courseData),
        });
        return handleResponse(response);
    } catch (error) {
        console.error("Failed to add course:", error);
        throw error;
    }
};

export const updateCourse = async (course: Course): Promise<void> => {
    try {
        const response = await fetch(`${BASE_URL}/api/courses/${course.id}/`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(course),
        });
        return handleResponse(response);
    } catch (error) {
        console.error("Failed to update course:", error);
        throw error;
    }
};

export const deleteCourse = async (courseId: number): Promise<void> => {
    try {
        const response = await fetch(`${BASE_URL}/api/courses/${courseId}/`, { method: 'DELETE' });
        return handleResponse(response);
    } catch (error) {
        console.error("Failed to delete course:", error);
        throw error;
    }
};

export const deleteAllCourses = async (): Promise<void> => {
    try {
        const response = await fetch(`${BASE_URL}/api/courses/all/`, { method: 'DELETE' });
        return handleResponse(response);
    } catch (error) {
        console.error("Failed to delete all courses:", error);
        throw error;
    }
};

export const enrollInCourse = async (courseId: number, studentId: number): Promise<Course> => {
    try {
        const response = await fetch(`${BASE_URL}/api/courses/${courseId}/enroll/`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ studentId }),
        });
        return handleResponse(response);
    } catch (error) {
        console.error("Failed to enroll in course:", error);
        throw error;
    }
}


// Attendance APIs
export const getAttendanceRecords = async (): Promise<AttendanceRecord[]> => {
    try {
        const response = await fetch(`${BASE_URL}/api/attendance/`);
        return handleResponse(response);
    } catch (error) {
        console.error("Failed to fetch attendance records:", error);
        throw error;
    }
};

export const addAttendanceRecord = async (recordData: Omit<AttendanceRecord, 'id'>): Promise<AttendanceRecord> => {
    try {
        const response = await fetch(`${BASE_URL}/api/attendance/`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(recordData),
        });
        return handleResponse(response);
    } catch (error) {
        console.error("Failed to add attendance record:", error);
        throw error;
    }
};

export const addBulkAttendanceRecords = async (records: Omit<AttendanceRecord, 'id'>[]): Promise<void> => {
    try {
        const response = await fetch(`${BASE_URL}/api/attendance/bulk/`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(records),
        });
        return handleResponse(response);
    } catch (error) {
        console.error("Failed to add bulk attendance records:", error);
        throw error;
    }
};

export const updateAttendanceRecord = async (record: AttendanceRecord): Promise<void> => {
    try {
        const response = await fetch(`${BASE_URL}/api/attendance/${record.id}/`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(record),
        });
        return handleResponse(response);
    } catch (error) {
        console.error("Failed to update attendance record:", error);
        throw error;
    }
}

// User APIs
export const deleteAllUsers = async (): Promise<void> => {
    try {
        const response = await fetch(`${BASE_URL}/api/users/all/`, { method: 'DELETE' });
        return handleResponse(response);
    } catch (error) {
        console.error("Failed to delete all users:", error);
        throw error;
    }
}
