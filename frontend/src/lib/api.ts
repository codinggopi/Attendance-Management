import type {
  Student,
  Teacher,
  Course,
  AttendanceRecord,
} from "./types";

// TODO: Replace with your actual backend URL
// const BASE_URL = 'https://t2cl04dd-8000.inc1.devtunnels.ms';
const BASE_URL = 'https://codinggopi.pythonanywhere.com/api';
// const BASE_URL = 'http://localhost:8000/api';
 
const handleResponse = async (response: Response) => {
  if (!response.ok) {
    const text = await response.text();
    throw new Error(`API Error ${response.status}: ${text}`);
  }
  if (response.status === 204) return null;
  return response.json();
};

/* -------------------- STUDENT APIs -------------------- */
export const getStudents = async (): Promise<Student[]> => {
  const res = await fetch(`${BASE_URL}/students/`);
  return handleResponse(res);
};

export const addStudent = async (
  data: Omit<Student, "id">
): Promise<Student> => {
  const res = await fetch(`${BASE_URL}/students/`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  return handleResponse(res);
};

export const updateStudent = async (student: Student): Promise<Student> => {
  const res = await fetch(`${BASE_URL}/students/${student.id}/`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(student),
  });
  return handleResponse(res);
};

export const deleteStudent = async (id: number): Promise<void> => {
  const res = await fetch(`${BASE_URL}/students/${id}/`, {
    method: "DELETE",
  });
  return handleResponse(res);
};

export const deleteAllStudents = async (): Promise<void> => {
    try {
        const response = await fetch(`${BASE_URL}/students/all/`, { method: 'DELETE' });
        return handleResponse(response);
    } catch (error) {
        console.error("Failed to delete all students:", error);
        throw error;
    }
};


/* -------------------- TEACHER APIs -------------------- */
export const getTeachers = async (): Promise<Teacher[]> => {
  const res = await fetch(`${BASE_URL}/teachers/`);
  return handleResponse(res);
};

export const addTeacher = async (
  data: Omit<Teacher, "id">
): Promise<Teacher> => {
  const res = await fetch(`${BASE_URL}/teachers/`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  return handleResponse(res);
};

export const updateTeacher = async (teacher: Teacher): Promise<Teacher> => {
  const res = await fetch(`${BASE_URL}/teachers/${teacher.id}/`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(teacher),
  });
  return handleResponse(res);
};

export const deleteTeacher = async (id: number): Promise<void> => {
  const res = await fetch(`${BASE_URL}/teachers/${id}/`, {
    method: "DELETE",
  });
  return handleResponse(res);
};

export const deleteAllTeachers = async (): Promise<void> => {
    try {
        const response = await fetch(`${BASE_URL}/teachers/all/`, { method: 'DELETE' });
        return handleResponse(response);
    } catch (error) {
        console.error("Failed to delete all teachers:", error);
        throw error;
    }
};

/* -------------------- COURSE APIs -------------------- */
export const getCourses = async (): Promise<Course[]> => {
  const res = await fetch(`${BASE_URL}/courses/`);
  return handleResponse(res);
};

export const addCourse = async (
  data: Omit<Course, "id">
): Promise<Course> => {
    console.log("Adding course with data:", data);
    console.log(JSON.stringify(data));
  const res = await fetch(`${BASE_URL}/courses/`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  return handleResponse(res);
};

export const updateCourse = async (course: Course): Promise<Course> => {
  const res = await fetch(`${BASE_URL}/courses/${course.id}/`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(course),
  });
  return handleResponse(res);
};

export const deleteCourse = async (id: number): Promise<void> => {
  const res = await fetch(`${BASE_URL}/courses/${id}/`, {
    method: "DELETE",
  });
  return handleResponse(res);
};

export const deleteAllCourses = async (): Promise<void> => {
    try {
        const response = await fetch(`${BASE_URL}/courses/all/`, { method: 'DELETE' });
        return handleResponse(response);
    } catch (error) {
        console.error("Failed to delete all courses:", error);
        throw error;
    }
};


export const enrollInCourse = async (courseId: number, studentId: number): Promise<Course> => {
    try {
        const response = await fetch(`${BASE_URL}/courses/${courseId}/enroll/`, {
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


/* -------------------- ATTENDANCE APIs -------------------- */
export const getAttendanceRecords = async (): Promise<AttendanceRecord[]> => {
  const res = await fetch(`${BASE_URL}/attendance/`);
  return handleResponse(res);
};

export const addAttendanceRecord = async (
  data: Omit<AttendanceRecord, "id">
): Promise<AttendanceRecord> => {
  const res = await fetch(`${BASE_URL}/attendance/`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  return handleResponse(res);
};

export const addBulkAttendanceRecords = async (records: Omit<AttendanceRecord, 'id'>[]): Promise<void> => {
    try {
        const response = await fetch(`${BASE_URL}/attendance/bulk/`, {
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


export const updateAttendanceRecord = async (
  record: AttendanceRecord
): Promise<AttendanceRecord> => {
  const res = await fetch(`${BASE_URL}/attendance/${record.id}/`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(record),
  });
  return handleResponse(res);
};

export const deleteAttendanceRecord = async (
  id: number
): Promise<void> => {
  const res = await fetch(`${BASE_URL}/attendance/${id}/`, {
    method: "DELETE",
  });
  return handleResponse(res);
};

export const deleteAllAttendanceRecords = async (): Promise<void> => {
    try {
        const response = await fetch(`${BASE_URL}/attendance/all/`, { method: 'DELETE' });
        return handleResponse(response);
    } catch (error) {
        console.error("Failed to delete all attendance records:", error);
        throw error;
    }
};


