"use client";

import { useState, useEffect, useMemo } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { MessageSquare } from "lucide-react";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Bell, Pencil } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import type { Course, Student, AttendanceStatus, Teacher } from '@/lib/types';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogTrigger,
  DialogClose,
} from '@/components/ui/dialog';
import * as api from '@/lib/api';
import { Trash2 } from "lucide-react";
import { isToday } from 'date-fns';


/* ================= STUDENTS FEEDBACK SECTION ================= */
const TeacherFeedbackSection = () => {
  const { toast } = useToast();
  const [feedbacks, setFeedbacks] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.getTeacherFeedback()
      .then(setFeedbacks)
      .catch(() => {
        toast({
          variant: "destructive",
          title: "Error",
          description: "Failed to load student feedback",
        });
      })
      .finally(() => setLoading(false));
  }, []);

  return (
    <Card className="mt-6">
      <CardHeader className="flex flex-row items-start justify-between">
  {/* LEFT SIDE */}
  <div>
    <CardTitle className="flex items-center gap-2">
      <MessageSquare size={20} />
      Students Feedbacks
    </CardTitle>
    <CardDescription>
      Feedback submitted by Students
    </CardDescription>
  </div>

  {/* RIGHT SIDE */}
  <Button
    variant="destructive"
    size="sm"
    className="flex items-center gap-2 mt-1"
    onClick={async () => {
      if (!confirm("Delete all feedbacks?")) return;

      await api.deleteAllFeedback();
      setFeedbacks([]);

      toast({
        title: "Deleted",
        description: "All feedbacks removed",
      });
    }}
  >
    <Trash2 size={16} />
    Delete All
  </Button>
</CardHeader>
      <CardContent className="space-y-4">
        {loading && (
          <p className="text-center text-muted-foreground">
            Loading feedback...
          </p>
        )}

        {!loading && feedbacks.length === 0 && (
          <p className="text-center text-muted-foreground">
            No feedback received yet
          </p>
        )}

        {feedbacks.map((f) => (
          <div
            key={f.id}
            className="border rounded-md p-4 bg-muted flex justify-between items-start gap-4"
          >
            {/* LEFT */}
            <div>
              <div className="flex items-center gap-2">
                <p className="font-semibold">{f.studentName}</p>
              </div>

              <p className="text-xs text-muted-foreground mt-1">
                {new Date(f.created_at).toLocaleString("en-IN", {
                  dateStyle: "full",
                  timeStyle: "short",
                })}
              </p>

              <p className="mt-2">{f.message}</p>
            </div>
            
            {/* RIGHT – DELETE */}
            <div>
              <Button
                size="icon"
                variant="ghost"
                className="text-red-500 hover:bg-red-100"
                onClick={async () => {

                  if (!confirm("Delete this feedback?")) return;

                  try {
                    await api.deleteFeedback(f.id);

                    setFeedbacks(prev => 
                      prev.filter(item => item.id !== f.id)
                    );
                    toast({ title: "Feedback deleted" });
                  } catch {
                    toast({
                      variant: "destructive",
                      title: "Delete failed",
                    });
                  }
                }}
              >
                <Trash2 size={18} />
              </Button>
            </div>
          </div>))}

        </CardContent>
      </Card>
  );
};

/* ================= TEACHER NOTIFICATIONS ================= */
const TeacherNotificationSection = () => {
  const { toast } = useToast();
  const [notifications, setNotifications] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.getTeacherNotifications()
      .then(setNotifications)
      .catch(() => {
      })
      .finally(() => setLoading(false));
  }, []);

  return (
    <Card className="mt-6">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Bell size={18} />
          Notifications
        </CardTitle>
        <CardDescription>
          System & student updates
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-3">
        {loading && (
          <p className="text-center text-muted-foreground">
            Loading notifications...
          </p>
        )}

        {!loading && notifications.length === 0 && (
          <p className="text-center text-muted-foreground">
            No notifications
          </p>
        )}

        {notifications.map((n) => (
          <div key={n.id} className="border rounded-md p-3">
            <p className="font-semibold">{n.title}</p>
            <p className="text-xs text-muted-foreground">
              {new Date(n.created_at).toLocaleString()}
            </p>
            <p className="mt-1">{n.message}</p>
          </div>
        ))}
      </CardContent>
    </Card>
  );
};



/* ================= ATTENDANCE TAKER ================= */
const AttendanceTaker = ({
  allStudents,
  teacher,
  courses,
  onSaveAttendance,
  onEnrollStudent,

}: {
  allStudents: Student[];
  teacher: Teacher;          
  courses: Course[];
  onSaveAttendance: (
    records: Record<string, AttendanceStatus>,
    courseId: number
  ) => void;
  onEnrollStudent: (courseId: number, studentId: number) => void;
  }) => {


  const { toast } = useToast();
  const [selectedCourseId, setSelectedCourseId] = useState<number | undefined>(undefined);
  const [studentsInCourse, setStudentsInCourse] = useState<Student[]>([]);
  const [attendance, setAttendance] = useState<Record<string, AttendanceStatus>>({});
  const teacherCourses = courses.filter(c => c.teacherId === teacher.id);
  const [editingRecordId, setEditingRecordId] = useState<number | null>(null);
  const [editStatus, setEditStatus] = useState<AttendanceStatus>("present");
  const [selectedStudentIds, setSelectedStudentIds] = useState<number[]>([]);
  const [attendanceHistory, setAttendanceHistory] = useState<any[]>([]);
  const today = new Date().toISOString().split("T")[0];
  const loadAttendanceHistory = async (courseId: number) => {
  try {
    const records = await api.getAttendanceRecords();

    const filtered = records.filter(
      (r: any) => r.courseId === courseId
    );

    setAttendanceHistory(filtered);
  } catch {
    toast({
      variant: "destructive",
      title: "Failed to load attendance history",
    });
  }
  };
  const [statusFilter, setStatusFilter] = useState<
  "all" | "present" | "absent" | "late"
  >("all");

  const filteredAttendance = attendanceHistory.filter(record =>
  statusFilter === "all"
    ? true
    : record.status === statusFilter
  );

  useEffect(() => {
    if (teacherCourses.length > 0 && !selectedCourseId) {
      setSelectedCourseId(teacherCourses[0].id);
    }
  }, [teacherCourses, selectedCourseId]);
  useEffect(() => {
  if (!selectedCourseId) {
    setStudentsInCourse([]);
    setAttendance({});
    return;
  }

  const course = courses.find(c => c.id === selectedCourseId);
  if (!course) return;

  const studentIds = course.studentIds || [];

  setStudentsInCourse(
    allStudents.filter(s => studentIds.includes(s.id))
  );

  const initialAttendance: Record<string, AttendanceStatus> = {};
  studentIds.forEach(id => {
    initialAttendance[id] = "unmarked";
  });

  setAttendance(initialAttendance);

  // ✅ load existing attendance
  loadAttendanceHistory(selectedCourseId);

  }, [selectedCourseId, courses, allStudents]);

  const handleAttendanceChange = (studentId: number, status: AttendanceStatus) => {
    setAttendance(prev => ({ ...prev, [studentId]: status }));
  };

const handleSubmit = async () => {
  if (!selectedCourseId) return;

  const records = Object.entries(attendance)
    .filter(([studentId, status]) =>
      status !== "unmarked" &&
      !alreadyMarkedStudentIds.includes(Number(studentId))
    )
    .map(([studentId, status]) => ({
      studentId: Number(studentId),
      courseId: selectedCourseId,
      date: today,
      status,
    }));

  // 🚫 If nothing to save
  if (records.length === 0) {
    toast({
      variant: "destructive",
      title: "Attendance already marked",
      description: "You can edit it in Attendance Details section",
    });
    return;
  }

  await api.addBulkAttendanceRecords(records);

  toast({ title: "Attendance Submitted" });

  loadAttendanceHistory(selectedCourseId);
};




  const toggleStudent = (id: number) => {
  setSelectedStudentIds(prev =>
    prev.includes(id)
      ? prev.filter(sid => sid !== id)
      : [...prev, id]
  );
};

const alreadyMarkedStudentIds = useMemo(() => {
  return attendanceHistory
    .filter(r => r.date === today)
    .map(r => r.studentId) ?? [];
}, [attendanceHistory, today]);



  const handleBulkEnroll = async () => {
  if (!selectedCourseId || selectedStudentIds.length === 0) return;

  try {
    for (const studentId of selectedStudentIds) {
      await onEnrollStudent(selectedCourseId, studentId);
    }

    toast({
      title: "Students Enrolled",
      description: `${selectedStudentIds.length} students enrolled successfully`,
    });

    setSelectedStudentIds([]);
  } catch {
    toast({
      variant: "destructive",
      title: "Enrollment Failed",
    });
  }
  };
  return (
  <Card>
    <CardHeader className="flex flex-row justify-between items-center">
      <div>
        <CardTitle>Take Attendance</CardTitle>
        <CardDescription>Enroll a student and mark attendance.</CardDescription>
      </div>
    </CardHeader>

    <CardContent className="space-y-6">

      {/* ===== TEACHER + SUBJECT DISPLAY ===== */}
      {teacherCourses.length === 1 && (
        <div className="rounded-md border px-4 py-3 flex items-center justify-between">
          <div className="text-base font-bold ">
            {teacherCourses[0].name}
          </div>

          <div className="text-lg text-foreground">
            <span className="font-bold ">Staff Name:</span> {teacher.name}
          </div>
        </div>
      )}
      {/* 🔔 NOTIFICATIONS HERE */}
      <TeacherNotificationSection />

      {/* ===== BULK ENROLL STUDENTS ===== */}
      <div className="space-y-3 border rounded-md p-4">
        <Label className="font-semibold">Enroll Students</Label>

        <div className="max-h-48 overflow-y-auto space-y-2">
          {allStudents
            .filter(s => !studentsInCourse.some(es => es.id === s.id))
            .map(student => (
              <div key={student.id} className="flex items-center gap-4">
                <input
                  type="checkbox"
                  checked={selectedStudentIds.includes(student.id)}
                  onChange={() => toggleStudent(student.id)}
                />
                <span>{student.name}</span>
              </div>
            ))}
        </div>

        <Button
          onClick={handleBulkEnroll}
          disabled={selectedStudentIds.length === 0}
            className="w-full bg-sky-400  text-white"
        >
          Enroll Selected Students
        </Button>
      </div>

{/* ===== ATTENDANCE MARKING BOX ===== */}
<div className="border rounded-md p-4 space-y-4">
  {/* 🔹 HEADING */}
  <h3 className="text-lg font-semibold  mb-4">
    Mark Attendances for Students
  </h3>

<Table>
  <TableHeader>
    <TableRow>
      <TableHead>Students</TableHead>
      <TableHead>Status</TableHead>
    </TableRow>
  </TableHeader>

  <TableBody>
    {studentsInCourse.map(student => (
      <TableRow key={student.id}>
        <TableCell className="font-medium">
          {student.name}
        </TableCell>

        <TableCell>
          <RadioGroup
            value={attendance[student.id]}
            disabled={alreadyMarkedStudentIds.includes(student.id)}
            onValueChange={(v) =>
              handleAttendanceChange(student.id, v as AttendanceStatus)
            }
            className="flex gap-6"
          >
            {["present", "absent", "late"].map(s => (
              <div key={s} className="flex items-center gap-3">
                <RadioGroupItem value={s} id={`${s}-${student.id}`} />
                <Label htmlFor={`${s}-${student.id}`} className="capitalize">
                  {s}
                </Label>
              </div>
            ))}
          </RadioGroup>
        </TableCell>
      </TableRow>
    ))}
  </TableBody>
</Table>


  <Button
    className="w-full bg-sky-400  text-white"
    onClick={handleSubmit}
  >
    Submit Attendance
  </Button>

</div>


      {/* ===== ATTENDANCE DETAILS ===== */}

      {attendanceHistory.length > 0 && (
        <div className="border rounded-md p-4">
<div className="flex items-center justify-between gap-2 mb-4 w-full">
  {/* LEFT : TITLE */}
  <h3 className="font-semibold text-lg flex-1 truncate">
    Attendance Details
  </h3>

  {/* RIGHT : ACTIONS */}
  <div className="flex items-center gap-2 flex-shrink-0">

    {/* FILTER */}
    <Select
      value={statusFilter}
      onValueChange={(v) =>
        setStatusFilter(v as "all" | "present" | "absent" | "late")
      }
    >
      <SelectTrigger className="w-24 sm:w-40 h-9">
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="all">All</SelectItem>
        <SelectItem value="present">Present</SelectItem>
        <SelectItem value="absent">Absent</SelectItem>
        <SelectItem value="late">Late</SelectItem>
      </SelectContent>
    </Select>

    {/* DELETE */}
    <Button
      variant="destructive"
      size="icon"
      className="h-9 w-9 sm:w-auto sm:px-4"
      disabled={attendanceHistory.length === 0}
      onClick={async () => {
        if (!selectedCourseId) return;
        if (!confirm("Delete ALL attendance for this course?")) return;

        await api.deleteAttendanceByCourse(selectedCourseId);
        toast({ title: "Course attendance deleted" });
        loadAttendanceHistory(selectedCourseId);
      }}
    >
      <Trash2 size={16} />
      <span className="hidden sm:inline ml-2">Delete All</span>
    </Button>
  </div>
</div>

{/* TABLE */}
<Table>
  <TableHeader>
    <TableRow>
      <TableHead>Student</TableHead>
      <TableHead>Date</TableHead>
      <TableHead>Status</TableHead>
      <TableHead className='text-balance'>Action</TableHead>
    </TableRow>
  </TableHeader>

  <TableBody>
    {filteredAttendance.map((record) => (
      <TableRow key={record.id}>
        <TableCell>{record.studentName}</TableCell>
        <TableCell>{record.date}</TableCell>

        {/* STATUS */}
        <TableCell>
          {editingRecordId === record.id ? (
            <Select
              value={editStatus}
              onValueChange={(v) =>
                setEditStatus(v as AttendanceStatus)
              }
            >
              <SelectTrigger className="w-28">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="present">Present</SelectItem>
                <SelectItem value="absent">Absent</SelectItem>
                <SelectItem value="late">Late</SelectItem>
              </SelectContent>
            </Select>
          ) : (
            <span className="capitalize font-medium">
              {record.status}
            </span>
          )}
        </TableCell>

        {/* ACTION */}
<TableCell className="text-right">
  <div className="flex justify items-center gap-4">

    {/* EDIT */}
    {editingRecordId === record.id ? (
      <Button
        size="icon"
        className="px-4"
        onClick={async () => {
          await api.updateAttendanceRecord(record.id, {
            status: editStatus,
          });

          /* ✅ UPDATE attendance state ALSO */
          setAttendance(prev => ({
            ...prev,
            [record.studentId]: editStatus,
          }));

          toast({ title: "Attendance Updated" });
          setEditingRecordId(null);
          loadAttendanceHistory(selectedCourseId!);
        }}
      >
        Save
      </Button>
    ) : (
      <Button
        size="icon"
        variant="ghost"
      className="text-blue-500 hover:bg-blue-100 hover:text-blue-600"
        onClick={() => {
          setEditingRecordId(record.id);
          setEditStatus(record.status);
        }}
      >
        <Pencil size={18} />
      </Button>
    )}

    {/* DELETE */}
    <Button
      size="icon"
      variant="ghost"
      className="text-red-500 hover:bg-red-100 hover:text-red-600"
      onClick={async () => {
        if (!confirm("Delete this attendance record?")) return;

        await api.deleteAttendanceRecord(record.id);

        toast({ title: "Attendance Deleted" });

        setAttendanceHistory([]);
        await loadAttendanceHistory(selectedCourseId!);
      }}
    >
      <Trash2 size={18} />
    </Button>


  </div>
</TableCell>


</TableRow>
))}
</TableBody>
</Table>


</div>

      )}
    </CardContent>
  </Card>
  );
  };

 /* ================= MAIN TEACHER DASHBOARD ================= */
export default function TeacherDashboard() {
  const { toast } = useToast();

  const [teacher, setTeacher] = useState<Teacher | null>(null);   // ✅ CHANGED
  const [allStudents, setAllStudents] = useState<Student[]>([]);
  const [courses, setCourses] = useState<Course[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // ✅ CHANGED – only logged-in teacher data
  useEffect(() => {
    const load = async () => {
      try {
        const [teacherData, coursesData, studentsData] = await Promise.all([
          api.getMyTeacherProfile(),  // ✅ only logged-in teacher
          api.getCourses(),           // filtered by backend
          api.getStudents(),          // enrolled students only
        ]);

        setTeacher(teacherData);
        setCourses(coursesData);
        setAllStudents(studentsData);
      } catch (error) {
        toast({
          variant: "destructive",
          title: "Error",
          description: "Failed to load teacher dashboard"
        });
      } finally {
        setIsLoading(false);
      }
    };

    load();
  }, []);

  const handleEnrollStudent = async (courseId: number, studentId: number) => {
    try {
      await api.enrollStudent(courseId, studentId);

    toast({
      title: "Student Enrolled",
      description: "Student added to course successfully",
    });

    const updatedCourses = await api.getCourses();
    setCourses(updatedCourses);
  } catch {
    toast({
      variant: "destructive",
      title: "Enrollment failed",
    });
  }
  };

  const handleSaveAttendance = async (
    attendance: Record<string, AttendanceStatus>,
    courseId: number
  ) => {

    const records = Object.entries(attendance)
      .filter(([studentId, status]) => 
        status !== "unmarked" && !alreadyMarkedStudentIds.includes(Number(studentId)))
      .map(([studentId, status]) => ({
        studentId: Number(studentId),
        courseId,
        date: today,
        status,
      }));

    await api.addBulkAttendanceRecords(records);
  };

  if (isLoading) return <div>Loading...</div>;

  return (
    <div>
      {teacher && (
        <AttendanceTaker
          allStudents={allStudents}
          teacher={teacher}      // ✅ logged-in teacher only
          courses={courses}
          onSaveAttendance={handleSaveAttendance}
          onEnrollStudent={handleEnrollStudent}
        />
      )}
      <TeacherFeedbackSection />
    </div>
  );
}