"use client";

import { useEffect, useState } from "react";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableHeader,
  TableRow,
  TableHead,
  TableBody,
  TableCell,
} from "@/components/ui/table";
import {
  CheckCircle,
  XCircle,
  Clock,
  CalendarDays,
  Bell,
  MessageSquare,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import type { AttendanceRecord, AttendanceStatus, Course } from "@/lib/types";
import * as api from "@/lib/api";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";

// 🔐 LOCAL-ONLY FEEDBACK HIDE (STUDENT SIDE)

const getHiddenFeedbackIds = (): number[] => {
  if (typeof window === "undefined") return [];
  const data = localStorage.getItem("hidden_feedbacks");
  return data ? JSON.parse(data) : [];
};

const hideFeedback = (id: number) => {
  if (typeof window === "undefined") return;

  const existing = getHiddenFeedbackIds();
  localStorage.setItem(
    "hidden_feedbacks",
    JSON.stringify([...existing, id])
  );
};
/* ================= TIME CARD ================= */
const TimeDisplayCard = () => {
  const [now, setNow] = useState(new Date());

  useEffect(() => {
    const t = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(t);
  }, []);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Clock className="text-primary" />
          Current Time
        </CardTitle>
        <CardDescription>Official Time</CardDescription>
      </CardHeader>
      <CardContent className="text-center">
        <p className="text-muted-foreground">
          {now.toLocaleDateString(undefined, {
            weekday: "long",
            year: "numeric",
            month: "long",
            day: "numeric",
          })}
        </p>
        <p className="text-4xl font-mono font-bold">
          {now.toLocaleTimeString()}
        </p>
      </CardContent>
    </Card>
  );
};

/* ================= ATTENDANCE HISTORY ================= */
const AttendanceHistoryCard = ({
  courses,
  records,
}: {
  courses: Course[];
  records: AttendanceRecord[];
}) => {
  const badge = (status: AttendanceStatus) => {
    switch (status) {
      case "present":
        return (
          <Badge className="bg-green-100 text-green-800">
            <CheckCircle className="mr-1 h-3 w-3" /> Present
          </Badge>
        );
      case "absent":
        return (
          <Badge variant="destructive">
            <XCircle className="mr-1 h-3 w-3" /> Absent
          </Badge>
        );
      case "late":
        return (
          <Badge className="bg-yellow-100 text-yellow-800">
            <Clock className="mr-1 h-3 w-3" /> Late
          </Badge>
        );
      default:
        return <Badge variant="outline">Unmarked</Badge>;
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <CalendarDays className="text-primary" />
          My Attendance History
        </CardTitle>
      </CardHeader>

      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Date</TableHead>
              <TableHead>Course</TableHead>
              <TableHead>Status</TableHead>
            </TableRow>
          </TableHeader>

          <TableBody>
            {records.length === 0 && (
              <TableRow>
                <TableCell colSpan={3} className="text-center">
                  No attendance records found
                </TableCell>
              </TableRow>
            )}

            {[...records]
              .sort(
                (a, b) =>
                  new Date(b.date).getTime() -
                  new Date(a.date).getTime()
              )
              .map((r) => {
                const course = courses.find(
                  (c) => c.id === r.courseId
                );
                if (!course) return null;

                return (
                  <TableRow key={r.id}>
                    <TableCell>
                      {new Date(r.date).toLocaleDateString()}
                    </TableCell>
                    <TableCell>{course.name}</TableCell>
                    <TableCell>{badge(r.status)}</TableCell>
                  </TableRow>
                );
              })}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
};

/* ================= MAIN DASHBOARD ================= */
export default function StudentDashboard() {
  const { toast } = useToast();

  const [studentName, setStudentName] = useState("");
  const [courses, setCourses] = useState<Course[]>([]);
  const [attendance, setAttendance] = useState<AttendanceRecord[]>([]);
  const [summary, setSummary] = useState<any>(null);
  const [feedbacks, setFeedbacks] = useState<any[]>([]);
  const [notifications, setNotifications] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [feedbackText, setFeedbackText] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [selectedCourseId, setSelectedCourseId] = useState<number | null>(null);
  const [hiddenIds, setHiddenIds] = useState<number[]>([]);
  useEffect(() => {
  setHiddenIds(getHiddenFeedbackIds());
}, []);
  const visibleFeedbacks = feedbacks.filter((f) => !hiddenIds.includes(f.id));


  useEffect(() => {
  const token = localStorage.getItem("access");
  if (!token) {
    window.location.href = "/";
  }
}, []);

const authFetch = async (url: string, options: RequestInit = {}) => {
  const token = localStorage.getItem("access");

  if (!token) {
    window.location.href = "/";
    throw new Error("No access token");
  }

  return fetch(url, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
      ...(options.headers || {}),
    },
  });
};


useEffect(() => {
  const load = async () => {
    try {
      const [
        summaryData,
        studentData,
        courseData,
        attendanceData,
        feedbackData,
        notificationData,
      ] = await Promise.all([
        api.getAttendanceSummary(),
        api.getStudents(),
        api.getCourses(),
        api.getAttendanceRecords(),
        api.getMyFeedback(),        // ✅
        api.getMyNotifications(), // ✅
      ]);

      setSummary(summaryData);
      setStudentName(studentData[0]?.name || "");
      setCourses(courseData);
      setAttendance(attendanceData);
      setFeedbacks(feedbackData || []);
      setNotifications(notificationData || []);
    } catch {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to load student dashboard",
      });
    } finally {
      setLoading(false);
    }
  };

  load();
}, []);


  if (loading) return <p>Loading...</p>;

  return (
    <div className="space-y-6">
      {/* Welcome */}
      <Card>
        <CardContent className="p-5 text-center">
          <h2 className="text-2xl font-bold">Welcome, {studentName}</h2>
          <p className="text-muted-foreground">
            Here you can view your attendance overview
          </p>
        </CardContent>
      </Card>
      {/* Notifications */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bell /> Notifications
          </CardTitle>
        </CardHeader>
        <CardContent>
          {notifications.length === 0 ? (
            <p className="text-muted-foreground text-center">
              No notifications
            </p>
          ) : (
            notifications.map((n) => (
              <div key={n.id} className="border rounded p-3 mb-3">
                <p className="font-semibold">{n.title}</p>
                <p className="text-sm text-muted-foreground">
                  {new Date(n.created_at).toLocaleDateString()}
                </p>
                <p>{n.message}</p>
              </div>
            ))
          )}
        </CardContent>
      </Card>

      {/* Summary */}
      {summary && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <AttendanceOverview percentage={summary.overall} />
          <SubjectAttendance subjects={summary.subjects} />
        </div>
      )}

      {/* Time + Attendance */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <TimeDisplayCard />
        <div className="lg:col-span-2">
          <AttendanceHistoryCard
            courses={courses}
            records={attendance}
          />
        </div>
      </div>
<Card className="mt-6">
  <CardHeader>
    <CardTitle>Give Feedback</CardTitle>
    <CardDescription>
      Your feedback will be shared with your teacher
    </CardDescription>
  </CardHeader>

  <CardContent className="space-y-3">

    {/* COURSE SELECT */}
    <Select
      value={selectedCourseId?.toString()}
      onValueChange={(v) => setSelectedCourseId(Number(v))}
    >
      <SelectTrigger>
        <SelectValue placeholder="Select Course" />
      </SelectTrigger>

      <SelectContent>
        {courses.map((course) => (
          <SelectItem
            key={course.id}
            value={course.id.toString()}
          >
            {course.name}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>

    {/* FEEDBACK TEXT */}
    <textarea
      className="w-full min-h-[100px] border rounded-md p-2 focus:outline-none focus:ring-1 focus:ring-primary"
      placeholder="Write your feedback here..."
      value={feedbackText}
      onChange={(e) => setFeedbackText(e.target.value)}
    />

    <Button
      className="mt-2"
      disabled={submitting || !feedbackText.trim() || !selectedCourseId}
      onClick={async () => {
        try {
          setSubmitting(true);

          await api.submitFeedback({
            message: feedbackText,
            course: selectedCourseId, // ✅
          });

          const updatedFeedback = await api.getMyFeedback();
          setFeedbacks(updatedFeedback);

          toast({
            title: "Feedback sent",
            description: "Thank you for your feedback!",
          });

          setFeedbackText("");
          setSelectedCourseId(null);
        } catch {
          toast({
            variant: "destructive",
            title: "Error",
            description: "Failed to submit feedback",
          });
        } finally {
          setSubmitting(false);
        }
      }}
    >
      {submitting ? "Submitting..." : "Submit Feedback"}
    </Button>

  </CardContent>
</Card>


      {/* Feedback */}
<Card>
  <CardHeader>
    <CardTitle className="flex items-center gap-2">
      <MessageSquare /> My Feedback
    </CardTitle>
  </CardHeader>

  <CardContent>
    {visibleFeedbacks.length === 0 ? (
      <p className="text-muted-foreground text-center">
        No feedback submitted
      </p>
    ) : (
      visibleFeedbacks.map((f) => (
        <div
          key={f.id}
          className="border rounded p-3 mb-3 flex justify-between items-start"
        >
          <div>
            <p className="text-xs text-muted-foreground">
              {new Date(f.created_at).toLocaleString("en-IN", {
                dateStyle: "medium",
                timeStyle: "short",
              })}
            </p>
            <p className="mt-1">{f.message}</p>
          </div>

          {/* 🗑️ STUDENT DELETE (LOCAL ONLY) */}
          <Button
            size="icon"
            variant="ghost"
            className="text-red-500"
            onClick={() => {
              hideFeedback(f.id);              // ✅ now defined
              setHiddenIds((prev) => [...prev, f.id]);
            }}
          >
            🗑️
          </Button>
        </div>
      ))
    )}
  </CardContent>
</Card>

    </div>
  );
}

/* ================= OVERALL % ================= */
export function AttendanceOverview({ percentage }: { percentage: number }) {
  const color =
    percentage >= 75
      ? "text-green-600"
      : percentage >= 60
      ? "text-yellow-500"
      : "text-red-600";

  return (
    <Card className="text-center">
      <CardHeader>
        <CardTitle>Overall Attendance</CardTitle>
      </CardHeader>
      <CardContent>
        <div className={`text-5xl font-bold ${color}`}>
          {percentage}%
        </div>
        <p className="text-muted-foreground mt-2">
          Required: 75%
        </p>
      </CardContent>
    </Card>
  );
}

/* ================= SUBJECT WISE ================= */
export function SubjectAttendance({ subjects }: any) {
  return (
    <div className="space-y-4">
      {subjects.map((s: any) => (
        <div key={s.courseId}>
          <div className="flex justify-between mb-1">
            <span>{s.courseName}</span>
            <span>{s.percentage}%</span>
          </div>
          <div className="h-2 bg-muted rounded">
            <div
              className={`h-2 rounded ${
                s.percentage >= 75
                  ? "bg-green-500"
                  : s.percentage >= 60
                  ? "bg-yellow-500"
                  : "bg-red-500"
              }`}
              style={{ width: `${s.percentage}%` }}
            />
          </div>
        </div>
      ))}
    </div>
  );
}
export const logoutfun = async () => {
  localStorage.clear();
  window.location.href = "/";
};


