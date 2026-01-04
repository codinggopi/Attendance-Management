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
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import type { AttendanceRecord, AttendanceStatus, Course } from "@/lib/types";
import * as api from "@/lib/api";

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
        <CardDescription>Official TIME ZONE</CardDescription>
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

/* ================= ATTENDANCE CARD ================= */
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
        <CardDescription>
          Attendance records for your enrolled courses
        </CardDescription>
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
  const [loading, setLoading] = useState(true);

useEffect(() => {
  const load = async () => {
    try {
      const [studentData, courseData, attendanceData] =
        await Promise.all([
          api.getStudents(),          // 👈 NEW
          api.getCourses(),
          api.getAttendanceRecords(),
        ]);

      setStudentName(studentData[0]?.name || "");
      setCourses(courseData);
      setAttendance(attendanceData);
    } catch {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to load student data",
      });
    } finally {
      setLoading(false);
    }
  };

  load();
}, []);


  if (loading) return <p>Loading...</p>;

  return (
    <div>

    <div className="mb-6 p-5 rounded-xl border border-border bg-card shadow-sm">
  <h2 className="text-2xl font-bold mb-3 text-center text-foreground">
    Welcome,  {studentName}
  </h2>
  <p className="text-muted-foreground text-center">
    Here you can view your attendance overview
  </p>
</div>
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <div className="lg:col-span-1">
        <TimeDisplayCard />
      </div>

      <div className="lg:col-span-2">
        <AttendanceHistoryCard
          courses={courses}
          records={attendance}
        />
      </div>
    </div>
  </div>
  );
}
