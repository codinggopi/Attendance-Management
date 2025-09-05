"use client";

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { CheckCircle, XCircle, Clock, CalendarDays, AlertCircle, Pencil, PlusCircle, BookOpen } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { students, courses as initialCourses, attendanceRecords as initialAttendanceRecords, getCurrentCourseForStudent } from '@/lib/data';
import type { AttendanceRecord, AttendanceStatus, Course, Student } from '@/lib/types';
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

// Mock current student
const currentStudent: Student = students[0];

const SelfCheckInCard = ({ courses }: { courses: Course[] }) => {
  const { toast } = useToast();
  const [currentTime, setCurrentTime] = useState(new Date());
  const [currentCourse, setCurrentCourse] = useState<Course | undefined>(undefined);
  const [isCheckedIn, setIsCheckedIn] = useState(false);

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    // This logic needs to be aware of the student's current enrollments
    const findCourse = () => {
        const day = currentTime.getDay();
        return courses.find(c => {
            if (!c.studentIds.includes(currentStudent.id)) return false;
            if (c.schedule.includes("MWF") && (day === 1 || day === 3 || day === 5)) return true;
            if (c.schedule.includes("TTh") && (day === 2 || day === 4)) return true;
            return false;
        });
    }
    setCurrentCourse(findCourse());
  }, [currentTime, courses]);

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

const AttendanceHistoryCard = ({ courses }: { courses: Course[] }) => {
  const { toast } = useToast();
  const [attendanceRecords, setAttendanceRecords] = useState(initialAttendanceRecords.filter(r => r.studentId === currentStudent.id));
  const [editingRecordId, setEditingRecordId] = useState<string | null>(null);
  const [editedStatus, setEditedStatus] = useState<AttendanceStatus>('present');

  const handleEdit = (record: AttendanceRecord) => {
    setEditingRecordId(record.id);
    setEditedStatus(record.status);
  }

  const handleSave = (recordId: string) => {
    setAttendanceRecords(prev => prev.map(r => r.id === recordId ? { ...r, status: editedStatus } : r));
    setEditingRecordId(null);
    toast({ title: "Record updated" });
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
                  <TableCell>{new Date(record.date).toLocaleDateString()}</TableCell>
                  <TableCell>{course?.name || 'Unknown Course'}</TableCell>
                  <TableCell>{getStatusBadge(record.status)}</TableCell>
                  <TableCell className="text-right">
                  <Dialog>
                    <DialogTrigger asChild>
                      <Button variant="ghost" size="icon" onClick={() => handleEdit(record)}><Pencil className="h-4 w-4" /></Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Edit Attendance Record</DialogTitle>
                        <DialogDescription>
                          Update the status for this attendance record. This is for demonstration, students would typically not be able to edit this.
                        </DialogDescription>
                      </DialogHeader>
                      {/* Form to edit would go here */}
                      <DialogFooter>
                        <DialogClose asChild>
                          <Button type="button" onClick={() => handleSave(record.id)}>Save changes</Button>
                        </DialogClose>
                      </DialogFooter>
                    </DialogContent>
                  </Dialog>
                  </TableCell>
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

const EnrollInCourseCard = ({ courses, onEnroll }: { courses: Course[], onEnroll: (courseId: string) => void }) => {
    const availableCourses = courses.filter(c => !c.studentIds.includes(currentStudent.id));
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
  const [courses, setCourses] = useState<Course[]>(initialCourses);
  
  const handleEnroll = (courseId: string) => {
    setCourses(prevCourses => {
        return prevCourses.map(course => {
            if (course.id === courseId) {
                return { ...course, studentIds: [...course.studentIds, currentStudent.id] };
            }
            return course;
        });
    });
  };

  const enrolledCourses = courses.filter(c => c.studentIds.includes(currentStudent.id));

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
      <div className="lg:col-span-1 flex flex-col gap-6">
        <SelfCheckInCard courses={courses}/>
        <EnrollInCourseCard courses={courses} onEnroll={handleEnroll} />
      </div>
      <div className="lg:col-span-2">
        <AttendanceHistoryCard courses={enrolledCourses} />
      </div>
    </div>
  );
}
