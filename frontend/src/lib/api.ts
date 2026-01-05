import type {
  Student,
  Teacher,
  Course,
  Feedback,
  Notification,
  AttendanceRecord,
} from "./types";

// TODO: Replace with your actual backend URL

// const BASE_URL = 'https://t2cl04dd-8000.inc1.devtunnels.ms';
const BASE_URL = 'https://codinggopi.pythonanywhere.com/api';
// const BASE_URL = 'http://localhost:8000/api';


const authFetch = async (url: string, options: RequestInit = {}) => {
  let token = localStorage.getItem("access");

  const makeRequest = async (accessToken: string | null) => {
    const headers: Record<string, string> = {
      "Content-Type": "application/json",
      ...(options.headers as Record<string, string> || {}),
    };

    if (accessToken) {
      headers["Authorization"] = `Bearer ${accessToken}`;
    }

    return fetch(url, {
      ...options,
      headers,
    });
  };

  let response = await makeRequest(token);

  if (response.status === 401) {
    const newToken = await refreshAccessToken();
    if (!newToken) throw new Error("Session expired");

    response = await makeRequest(newToken);
  }

  return response;
};


/* ================== RESPONSE HANDLER ================== */
const handleResponse = async (response: Response) => {
  if (!response.ok) {
    const text = await response.text();
    throw new Error(`API Error ${response.status}: ${text}`);
  }
  if (response.status === 204) return null;
  return response.json();
};

const refreshAccessToken = async (): Promise<string | null> => {
  const refresh = localStorage.getItem("refresh");
  if (!refresh) return null;

  const res = await fetch(`${BASE_URL}/token/refresh/`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ refresh }),
  });

  if (!res.ok) {
    // Refresh token also expired → logout
    localStorage.clear();
    window.location.href = "/";
    return null;
  }

  const data = await res.json();
  localStorage.setItem("access", data.access);
  if (data.refresh) {
    localStorage.setItem("refresh", data.refresh);
  }
  return data.access;
};

export const resetPassword = async (
  username: string,
  newPassword: string
): Promise<void> => {
  const response = await authFetch(`${BASE_URL}/reset-password/`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      username,
      new_password: newPassword,
    }),
  });

  if (!response.ok) {
    const text = await response.text();
    throw new Error(`Reset failed: ${text}`);
  }
};
/* -------------------- AUTH APIs -------------------- */

export type LoginResponse = {
  access: string;
  refresh: string;
  role: "admin" | "teacher" | "student";
  username: string;
};

export const loginUser = async (
  username: string,
  password: string
): Promise<LoginResponse> => {
  const res = await authFetch(`${BASE_URL}/login/`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ username, password }),
  });

  if (!res.ok) {
    const error = await res.json();
    throw new Error(error?.non_field_errors?.[0] || "Login failed");
  }

  return res.json();
};

export const logoutfun = async () => {
  const refresh = localStorage.getItem("refresh");
  if (!refresh) return;

  await authFetch(`${BASE_URL}/logout/`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ refresh }),
  });

  localStorage.clear();
  window.location.href = "/";
};


/* -------------------- STUDENT APIs -------------------- */
export const getStudents = async (): Promise<Student[]> => {
  const res = await authFetch(`${BASE_URL}/students/`);
  return handleResponse(res);
};

export const addStudent = async (
  data: Omit<Student, "id">
): Promise<Student> => {
  const res = await authFetch(`${BASE_URL}/students/`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  return handleResponse(res);
};

export const updateStudent = async (student: Student): Promise<Student> => {
  const res = await authFetch(`${BASE_URL}/students/${student.id}/`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(student),
  });
  return handleResponse(res);
};

export const deleteStudent = async (id: number): Promise<void> => {
  const res = await authFetch(`${BASE_URL}/students/${id}/`, {
    method: "DELETE",
  });
  return handleResponse(res);
};

export const deleteAllStudents = async (): Promise<void> => {
    try {
        const response = await authFetch(`${BASE_URL}/students/all/`, { method: 'DELETE' });
        return handleResponse(response);
    } catch (error) {
        console.error("Failed to delete all students:", error);
        throw error;
    }
};
export const deleteAttendanceByCourse = async (courseId: number) => {
  const res = await authFetch(
    `${BASE_URL}/attendance/by-course/${courseId}/`,
    { method: "DELETE" }
  );
  return handleResponse(res);
};



/* -------------------- TEACHER APIs -------------------- */
export const getMyTeacherProfile = async (): Promise<Teacher> => {
  const res = await authFetch(`${BASE_URL}/teachers/me/`);
  return handleResponse(res);
};

export const getTeachers = async (): Promise<Teacher[]> => {
  const res = await authFetch(`${BASE_URL}/teachers/`);
  return handleResponse(res);
};

export const addTeacher = async (
  data: Omit<Teacher, "id">
): Promise<Teacher> => {
  const res = await authFetch(`${BASE_URL}/teachers/`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  return handleResponse(res);
};

export const updateTeacher = async (teacher: Teacher): Promise<Teacher> => {
  const res = await authFetch(`${BASE_URL}/teachers/${teacher.id}/`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(teacher),
  });
  return handleResponse(res);
};

export const deleteTeacher = async (id: number): Promise<void> => {
  const res = await authFetch(`${BASE_URL}/teachers/${id}/`, {
    method: "DELETE",
  });
  return handleResponse(res);
};

export const deleteAllTeachers = async (): Promise<void> => {
    try {
        const response = await authFetch(`${BASE_URL}/teachers/all/`, { method: 'DELETE' });
        return handleResponse(response);
    } catch (error) {
        console.error("Failed to delete all teachers:", error);
        throw error;
    }
};

/* -------------------- COURSE APIs -------------------- */
export const getCourses = async (): Promise<Course[]> => {
  const res = await authFetch(`${BASE_URL}/courses/`);
  return handleResponse(res);
};

export const addCourse = async (
  data: Omit<Course, "id">
): Promise<Course> => {
    console.log("Adding course with data:", data);
    console.log(JSON.stringify(data));
  const res = await authFetch(`${BASE_URL}/courses/`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  return handleResponse(res);
};

export const updateCourse = async (course: Course): Promise<Course> => {
  const res = await authFetch(`${BASE_URL}/courses/${course.id}/`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(course),
  });
  return handleResponse(res);
};

export const deleteCourse = async (id: number): Promise<void> => {
  const res = await authFetch(`${BASE_URL}/courses/${id}/`, {
    method: "DELETE",
  });
  return handleResponse(res);
};

export const deleteAllCourses = async (): Promise<void> => {
    try {
        const response = await authFetch(`${BASE_URL}/courses/all/`, { method: 'DELETE' });
        return handleResponse(response);
    } catch (error) {
        console.error("Failed to delete all courses:", error);
        throw error;
    }
};

/* -------------------- COURSE ENROLL -------------------- */

export const enrollStudent = async (
  courseId: number,
  studentId: number
): Promise<void> => {
  const res = await authFetch(
    `${BASE_URL}/courses/${courseId}/enroll-student/`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ student_id: studentId }),
    }
  );
  await handleResponse(res);
};

/* -------------------- STUDENT DASHBOARD -------------------- */

export const getMyEnrolledCourses = async (): Promise<Course[]> => {
  const res = await authFetch(`${BASE_URL}/students/my-courses/`);
  return handleResponse(res);
};



/* -------------------- ATTENDANCE APIs -------------------- */
export const getAttendanceRecords = async (): Promise<AttendanceRecord[]> => {
  const res = await authFetch(`${BASE_URL}/attendance/`);
  return handleResponse(res);
};

export const addAttendanceRecord = async (
  data: Omit<AttendanceRecord, "id">
): Promise<AttendanceRecord> => {
  const res = await authFetch(`${BASE_URL}/attendance/`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  return handleResponse(res);
};

export const addBulkAttendanceRecords = async (records: Omit<AttendanceRecord, 'id'>[]): Promise<void> => {
    try {
        const response = await authFetch(`${BASE_URL}/attendance/bulk/`, {
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
  id: number,
  data: { status: string }
) => {
  const res = await authFetch(`${BASE_URL}/attendance/${id}/`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  return handleResponse(res);
};



export const deleteAttendanceRecord = async (
  id: number
): Promise<void> => {
  const res = await authFetch(`${BASE_URL}/attendance/${id}/`, {
    method: "DELETE",
  });
  return handleResponse(res);
};

export const deleteAllAttendanceRecords = async (): Promise<void> => {
    try {
        const res = await authFetch(`${BASE_URL}/attendance/all/`, { method: 'DELETE' });
        return handleResponse(res);
    } catch (error) {
        console.error("Failed to delete all attendance records:", error);
        throw error;
    }
};

export const getAttendanceSummary = async () => {
  const res = await authFetch(`${BASE_URL}/attendance/summary/`);
  return handleResponse(res);
};
export const getMyAttendanceRecords = async (): Promise<AttendanceRecord[]> => {
  const res = await authFetch(`${BASE_URL}/attendance/my-records/`);
  return handleResponse(res);
}

// export async function getTeacherFeedback() {
//   const token = localStorage.getItem("access");

//   const res = await fetch(
//     "http://localhost:8000/api/feedback/",
//     {
//       headers: {
//         Authorization: `Bearer ${token}`,
//       },
//     }
//   );

//   if (!res.ok) {
//     throw new Error("Failed to fetch feedback");
//   }

//   return res.json();
// }


/* ================= TEACHER FEEDBACK ================= */
export const getTeacherFeedback = async () => {
  const res = await authFetch(`${BASE_URL}/feedback/`);
  return handleResponse(res);
};

/* ================= TEACHER NOTIFICATIONS ================= */
export const getTeacherNotifications = async () => {
  const res = await authFetch(`${BASE_URL}/notifications/`);
  return handleResponse(res);
};

export async function submitFeedback(data: {
  course: number;
  message: string;
}) {
  const token = localStorage.getItem("access");

  const res = await fetch(`${BASE_URL}/feedback/`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(data),
  });

  if (!res.ok) {
    throw new Error("Failed to submit feedback");
  }

  return res.json();
}


export const getMyFeedback = async (): Promise<Feedback[]> => {
  const res = await authFetch(`${BASE_URL}/feedback/my/`);
  return handleResponse(res);
};

/* -------------------- NOTIFICATION APIs -------------------- */

export const getMyNotifications = async (): Promise<Notification[]> => {
  const res = await authFetch(`${BASE_URL}/notifications/my/`);
  return handleResponse(res);
};
export const deleteFeedback = async (id: number) => {
  const res = await authFetch(`${BASE_URL}/feedback/${id}/`, {
    method: "DELETE",
  });
  if (!res.ok) throw new Error("Delete failed");
};

export const deleteAllFeedback = async () => {
  const res = await authFetch(`${BASE_URL}/feedback/delete-all/`, {
    method: "DELETE",
  });

  if (!res.ok) {
    throw new Error("Delete all feedback failed");
  }

  return res.json();
};

