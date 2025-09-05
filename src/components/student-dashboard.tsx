"use client";

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { CheckCircle, XCircle, Clock, CalendarDays, AlertCircle, Pencil, PlusCircle, BookOpen, Check, X } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { students as initialStudents, courses as initialCourses, attendanceRecords as initialAttendanceRecords, getCurrentCourseForStudent } from '@/lib/data';
import type { AttendanceRecord, AttendanceStatus, Course, Student } from '@/lib/types';
import { usePersistentState } from '@/hooks/use-persistent-state';
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

// This is now a selector, a real app would have a login system.
const StudentSelector = ({ students, currentStudentId, onStudentChange }: { students: Student[], currentStudentId: string, onStudentChange: (id: string) => void }) => {
    if (students.length === 0) return null;
    return (
        <div className="mb-4">
            <label htmlFor="student-selector" className="block text-sm font-medium text-gray-700 mb-1">Select Student:</label>
            <select
                id="student-selector"
                value={currentStudentId}
                onChange={(e) => onStudentChange(e.target.value)}
                className="block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-primary focus:border-primary sm:text-sm rounded-md"
            >
                {students.map(s => (
                    <option key={s.id} value={s.id}>{s.name}</option>
                ))}
            </select>
        </div>
    )
}

const SelfCheckInCard = ({ courses, student }: { courses: Course[], student?: Student }) => {
  const { toast } = useToast();
  const [currentTime, setCurrentTime] = useState(new Date());
  const [currentCourse, setCurrentCourse] = useState<Course | undefined>(undefined);
  const [isCheckedIn, setIsCheckedIn] = useState(false);

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    if (!student) return;
    const findCourse = () => {
        const day = currentTime.getDay();
        return courses.find(c => {
            if (!c.studentIds.includes(student.id)) return false;
            if (c.schedule.includes("MWF") && (day === 1 || day === 3 || day === 5)) return true;
            if (c.schedule.includes("TTh") && (day === 2 || day === 4)) return true;
            return false;
        });
    }
    setCurrentCourse(findCourse());
    setIsCheckedIn(false); 
  }, [currentTime, courses, student]);

  const handleCheckIn = () => {
    setIsCheckedIn(true);
    toast({
      title: "Check-in Successful!",
      description: `You've been marked present for ${currentCourse?.name}.`,
    });
  };

  return (
    <Card className="flex flex-col">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <CheckCircle className="text-primary" />
          Self Check-In
        </CardTitle>
        <CardDescription>Mark yourself present for your current class.</CardDescription>
      </CardHeader>
      <CardContent className="flex-grow space-y-4">
        <div className="p-4 bg-secondary rounded-lg text-center">
          <p className="text-lg font-medium text-muted-foreground">{currentTime.toLocaleDateString(undefined, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>
          <p className="text-5xl font-bold font-mono text-foreground">{currentTime.toLocaleTimeString()}</p>
        </div>
        {currentCourse ? (
          <div className="p-4 border rounded-lg space-y-2">
            <h3 className="font-semibold text-lg text-primary">{currentCourse.name}</h3>
            <p className="text-muted-foreground flex items-center gap-2"><Clock className="w-4 h-4" /> {currentCourse.schedule}</p>
          </div>
        ) : (
          <div className="p-4 border border-dashed rounded-lg flex items-center gap-3 text-muted-foreground">
            <AlertCircle className="w-8 h-8"/>
            <span>No classes scheduled at this time.</span>
          </div>
        )}
      </CardContent>
      <CardFooter>
        <Button 
          className="w-full" 
          size="lg" 
          onClick={handleCheckIn}
          disabled={!currentCourse || isCheckedIn}
        >
          {isCheckedIn ? 'Checked-In' : 'Check-In Now'}
        </Button>
      </CardFooter>
    </Card>
  );
};

const AttendanceHistoryCard = ({ courses, studentId }: { courses: Course[], studentId: string }) => {
  const { toast } = useToast();
  const [attendanceRecords, setAttendanceRecords] = usePersistentState<AttendanceRecord[]>(`attendance_records_${studentId}`, initialAttendanceRecords.filter(r => r.studentId === studentId));
  const [editingRecordId, setEditingRecordId] = useState<string | null>(null);
  const [editedStatus, setEditedStatus] = useState<AttendanceStatus>('present');

  useEffect(() => {
    setAttendanceRecords(initialAttendanceRecords.filter(r => r.studentId === studentId))
  }, [studentId, setAttendanceRecords]);
  

  const handleEdit = (record: AttendanceRecord) => {
    setEditingRecordId(record.id);
    setEditedStatus(record.status);
  }

  const handleSave = (recordId: string) => {
    setAttendanceRecords(prev => prev.map(r => r.id === recordId ? { ...r, status: editedStatus } : r));
    setEditingRecordId(null);
    toast({ title: "Record updated" });
  }

  const handleCancel = () => {
    setEditingRecordId(null);
  }

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
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {attendanceRecords.length > 0 ? attendanceRecords.map(record => {
              const course = courses.find(c => c.id === record.courseId);
              return (
                <TableRow key={record.id}>
                  {editingRecordId === record.id ? (
                    <>
                      <TableCell>{new Date(record.date).toLocaleDateString()}</TableCell>
                      <TableCell>{course?.name || 'Unknown Course'}</TableCell>
                      <TableCell>
                         <select value={editedStatus} onChange={(e) => setEditedStatus(e.target.value as AttendanceStatus)}>
                            <option value="present">Present</option>
                            <option value="absent">Absent</option>
                            <option value="late">Late</option>
                        </select>
                      </TableCell>
                      <TableCell className="text-right">
                        <Button variant="ghost" size="icon" onClick={() => handleSave(record.id)}><Check className="h-4 w-4" /></Button>
                        <Button variant="ghost" size="icon" onClick={handleCancel}><X className="h-4 w-4" /></Button>
                      </TableCell>
                    </>
                  ) : (
                    <>
                      <TableCell>{new Date(record.date).toLocaleDateString()}</TableCell>
                      <TableCell>{course?.name || 'Unknown Course'}</TableCell>
                      <TableCell>{getStatusBadge(record.status)}</TableCell>
                      <TableCell className="text-right">
                        <Button variant="ghost" size="icon" onClick={() => handleEdit(record)}><Pencil className="h-4 w-4" /></Button>
                      </TableCell>
                    </>
                  )}
                </TableRow>
              );
            }) : (
              <TableRow>
                <TableCell colSpan={4} className="text-center h-24">No attendance records found.</TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
};

const EnrollInCourseCard = ({ courses, onEnroll, studentId }: { courses: Course[], onEnroll: (courseId: string) => void, studentId: string }) => {
    const availableCourses = courses.filter(c => !c.studentIds.includes(studentId));
    const { toast } = useToast();

    const handleEnroll = (courseId: string, courseName: string) => {
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
                                    <p className="text-sm text-muted-foreground">{course.schedule}</p>
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
  const [students] = usePersistentState<Student[]>('students', initialStudents);
  const [courses, setCourses] = usePersistentState<Course[]>('courses', initialCourses);
  const [currentStudentId, setCurrentStudentId] = useState(students[0]?.id || '');
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  useEffect(() => {
    if(isClient && !currentStudentId && students.length > 0) {
        setCurrentStudentId(students[0].id)
    }
  }, [students, currentStudentId, isClient]);
  
  const handleEnroll = (courseId: string) => {
    setCourses(prevCourses => {
        return prevCourses.map(course => {
            if (course.id === courseId) {
                // Ensure studentIds is not duplicated
                const newStudentIds = new Set([...course.studentIds, currentStudentId]);
                return { ...course, studentIds: Array.from(newStudentIds) };
            }
            return course;
        });
    });
  };

  const currentStudent = students.find(s => s.id === currentStudentId);
  const enrolledCourses = courses.filter(c => c.studentIds.includes(currentStudentId));

  if (!isClient) {
    return null; // Or a loading spinner
  }

  return (
      <div>
        <StudentSelector students={students} currentStudentId={currentStudentId} onStudentChange={setCurrentStudentId} />
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
          <div className="lg:col-span-1 flex flex-col gap-6">
            <SelfCheckInCard courses={courses} student={currentStudent}/>
            <EnrollInCourseCard courses={courses} onEnroll={handleEnroll} studentId={currentStudentId} />
          </div>
          <div className="lg:col-span-2">
            <AttendanceHistoryCard courses={enrolledCourses} studentId={currentStudentId} />
          </div>
        </div>
      </div>
  );
}
