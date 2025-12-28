
"use client";

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { CheckCircle, XCircle, Clock, CalendarDays, AlertCircle, PlusCircle, BookOpen } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import type { AttendanceRecord, AttendanceStatus, Course, Student } from '@/lib/types';
import * as api from '@/lib/api';

// This is now a selector, a real app would have a login system.
const StudentSelector = ({ students, currentStudentId, onStudentChange }: { students: Student[], currentStudentId: number, onStudentChange: (id: number) => void }) => {
    if (students.length === 0) return null;
    return (
        <div className="mb-4">
            <label htmlFor="student-selector" className="block text-sm font-medium text-gray-700 mb-1">Select Student:</label>
            <select
                id="student-selector"
                value={currentStudentId}
                onChange={(e) => onStudentChange(parseInt(e.target.value, 10))}
                className="block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-primary focus:border-primary sm:text-sm rounded-md"
            >
                {students.map(s => (
                    <option key={s.id} value={s.id}>{s.name}</option>
                ))}
            </select>
        </div>
    )
}

const TimeDisplayCard = () => {
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  return (
    <Card className="flex flex-col">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Clock className="text-primary" />
          Current Time
        </CardTitle>
        <CardDescription>The official school time.</CardDescription>
      </CardHeader>
      <CardContent className="flex-grow space-y-4">
        <div className="p-4 bg-secondary rounded-lg text-center">
          <p className="text-lg font-medium text-muted-foreground">{currentTime.toLocaleDateString(undefined, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>
          <p className="text-5xl font-bold font-mono text-foreground">{currentTime.toLocaleTimeString()}</p>
        </div>
      </CardContent>
    </Card>
  );
};


const AttendanceHistoryCard = ({ courses, studentId, attendanceRecords }: { courses: Course[], studentId: number, attendanceRecords: AttendanceRecord[] }) => {
  const enrolledCourses = courses.filter(c => c.studentIds.includes(studentId));
  const studentAttendanceRecords = attendanceRecords.filter(r => r.studentId === studentId);

  const getStatusBadge = (status: AttendanceStatus) => {
    switch (status) {
      case 'present':
        return <Badge variant="secondary" className="bg-green-100 text-green-800"><CheckCircle className="mr-1 h-3 w-3" />Present</Badge>;
      case 'absent':
        return <Badge variant="destructive"><XCircle className="mr-1 h-3 w-3" />Absent</Badge>;
      case 'late':
        return <Badge variant="secondary" className="bg-yellow-100 text-yellow-800"><Clock className="mr-1 h-3 w-3" />Late</Badge>;
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
        <CardDescription>A log of your attendance records across all classes.</CardDescription>
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
            {studentAttendanceRecords.length > 0 ? [...studentAttendanceRecords].sort((a,b) => new Date(b.date).getTime() - new Date(a.date).getTime()).map(record => {
              const course = enrolledCourses.find(c => c.id === record.courseId);
              if (!course) return null; // Don't render records for courses not currently enrolled in
              return (
                <TableRow key={record.id}>
                    <TableCell>{new Date(record.date).toLocaleDateString()}</TableCell>
                    <TableCell>{course?.name || 'Unknown Course'}</TableCell>
                    <TableCell>{getStatusBadge(record.status)}</TableCell>
                </TableRow>
              );
            }) : (
              <TableRow>
                <TableCell colSpan={3} className="text-center h-24">No attendance records found.</TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
};

const EnrollInCourseCard = ({ courses, onEnroll, studentId }: { courses: Course[], onEnroll: (courseId: number) => void, studentId: number }) => {
    const availableCourses = courses.filter(c => !c.studentIds.includes(studentId));
    const { toast } = useToast();

    const handleEnroll = (courseId: number, courseName: string) => {
        onEnroll(courseId);
        toast({
            title: "Enrolled Successfully!",
            description: `You have been enrolled in ${courseName}.`
        })
    }
    
    return (
        <Card>
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <BookOpen className="text-primary" />
                    Enroll in Courses
                </CardTitle>
                <CardDescription>Add new subjects to your schedule.</CardDescription>
            </CardHeader>
            <CardContent>
                {availableCourses.length > 0 ? (
                    <ul className="space-y-3">
                        {availableCourses.map(course => (
                            <li key={course.id} className="flex items-center justify-between p-3 bg-secondary rounded-lg">
                                <div>
                                    <p className="font-semibold">{course.name}</p>
                                </div>
                                <Button size="sm" onClick={() => handleEnroll(course.id, course.name)}>
                                    <PlusCircle className="mr-2 h-4 w-4" /> Enroll
                                </Button>
                            </li>
                        ))}
                    </ul>
                ) : (
                    <div className="text-center text-muted-foreground p-4">
                        No more courses available to enroll in.
                    </div>
                )}
            </CardContent>
        </Card>
    );
}

export default function StudentDashboard() {
  const { toast } = useToast();
  const [students, setStudents] = useState<Student[]>([]);
  const [courses, setCourses] = useState<Course[]>([]);
  const [attendanceRecords, setAttendanceRecords] = useState<AttendanceRecord[]>([]);
  const [currentStudentId, setCurrentStudentId] = useState(0);
  const [isLoading, setIsLoading] = useState(true);

  const fetchData = async () => {
    setIsLoading(true);
    try {
      const [studentsData, coursesData, attendanceData] = await Promise.all([
        api.getStudents(),
        api.getCourses(),
        api.getAttendanceRecords(),
      ]);

      setStudents(studentsData);
      setCourses(coursesData);
      setAttendanceRecords(attendanceData);
      if (studentsData.length > 0) {
        setCurrentStudentId(studentsData[0].id);
      }
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error fetching data",
        description: "Could not load data from the server.",
      });
      console.error("Failed to fetch data:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);
  
  const handleEnroll = async (courseId: number) => {
    try {
        const updatedCourse = await api.enrollInCourse(courseId, currentStudentId);
        setCourses(prev => prev.map(c => c.id === courseId ? updatedCourse : c));
    } catch (error) {
         toast({ variant: "destructive", title: "Error", description: "Could not enroll in course." });
    }
  };

  if (isLoading) {
    return <div>Loading...</div>;
  }

  return (
      <div>
        <StudentSelector students={students} currentStudentId={currentStudentId} onStudentChange={setCurrentStudentId} />
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
          <div className="lg:col-span-1 flex flex-col gap-6">
            <TimeDisplayCard />
            <EnrollInCourseCard courses={courses} onEnroll={handleEnroll} studentId={currentStudentId} />
          </div>
          <div className="lg:col-span-2">
            <AttendanceHistoryCard courses={courses} studentId={currentStudentId} attendanceRecords={attendanceRecords} />
          </div>
        </div>
      </div>
  );
}
