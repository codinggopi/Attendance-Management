
"use client";

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ListChecks, Pencil } from "lucide-react";
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

// Mock current teacher
const TeacherSelector = ({ teachers, currentTeacherId, onTeacherChange }: { teachers: Teacher[], currentTeacherId: number, onTeacherChange: (id: number) => void }) => {
    return (
        <div className="mb-4">
            <label htmlFor="teacher-selector" className="block text-sm font-medium text-gray-700 mb-1">Select Teacher:</label>
            <select
                id="teacher-selector"
                value={currentTeacherId}
                onChange={(e) => onTeacherChange(parseInt(e.target.value, 10))}
                className="block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-primary focus:border-primary sm:text-sm rounded-md"
            >
                {teachers.map(t => (
                    <option key={t.id} value={t.id}>{t.name}</option>
                ))}
            </select>
        </div>
    )
}

const AttendanceTaker = ({ allStudents, teacherId, courses, onUpdateCourse, onSaveAttendance }: { allStudents: Student[], teacherId: number, courses: Course[], onUpdateCourse: (id: number, name: string) => void, onSaveAttendance: (records: Record<string, AttendanceStatus>, courseId: number) => void }) => {
  const { toast } = useToast();
  const [selectedCourseId, setSelectedCourseId] = useState<number | undefined>(undefined);
  const [studentsInCourse, setStudentsInCourse] = useState<Student[]>([]);
  const [attendance, setAttendance] = useState<Record<string, AttendanceStatus>>({});
  const [editedCourseName, setEditedCourseName] = useState("");

  const teacherCourses = courses.filter(c => c.teacherId === teacherId);

  useEffect(() => {
    if (teacherCourses.length > 0 && !selectedCourseId) {
        setSelectedCourseId(teacherCourses[0].id);
    }
  }, [teacherId, teacherCourses, selectedCourseId])

  useEffect(() => {
    if (selectedCourseId) {
      const course = courses.find(c => c.id === selectedCourseId);
      if (course) {
        setEditedCourseName(course.name);
        const studentIds = course.studentIds;
        setStudentsInCourse(allStudents.filter(s => studentIds.includes(s.id)));
        
        const initialAttendance: Record<string, AttendanceStatus> = {};
        studentIds.forEach(id => { initialAttendance[id] = 'unmarked' });
        setAttendance(initialAttendance);
      }
    } else {
        setStudentsInCourse([]);
        setAttendance({});
        setEditedCourseName("");
    }
  }, [selectedCourseId, courses, allStudents]);

  const handleAttendanceChange = (studentId: number, status: AttendanceStatus) => {
    setAttendance(prev => ({ ...prev, [studentId]: status }));
  };
  
  const handleSubmit = () => {
    if (selectedCourseId === undefined) return;
    onSaveAttendance(attendance, selectedCourseId);
    toast({
      title: "Attendance Submitted!",
      description: "The attendance records have been saved.",
    });
  };

  const handleUpdateCourseName = () => {
    if (!selectedCourseId) return;
    onUpdateCourse(selectedCourseId, editedCourseName);
    toast({ title: "Course Updated", description: "Course name has been saved." });
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
            <div>
                <CardTitle>Take Attendance</CardTitle>
                <CardDescription>Select a class and mark student attendance for today.</CardDescription>
            </div>
            <Dialog>
              <DialogTrigger asChild>
                <Button variant="outline" disabled={!selectedCourseId}><Pencil className="mr-2 h-4 w-4" /> Edit Course</Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Edit Course</DialogTitle>
                  <DialogDescription>
                    Update the details for the selected course.
                  </DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="course-name" className="text-right">
                      Name
                    </Label>
                    <Input id="course-name" value={editedCourseName} onChange={(e) => setEditedCourseName(e.target.value)} className="col-span-3" />
                  </div>
                </div>
                <DialogFooter>
                  <DialogClose asChild>
                    <Button type="button" onClick={handleUpdateCourseName}>Save changes</Button>
                  </DialogClose>
                </DialogFooter>
              </DialogContent>
            </Dialog>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <Select onValueChange={(value) => setSelectedCourseId(parseInt(value, 10))} value={selectedCourseId !== undefined ? String(selectedCourseId) : undefined}>
          <SelectTrigger>
            <SelectValue placeholder="Select a course..." />
          </SelectTrigger>
          <SelectContent>
            {teacherCourses.length > 0 ? teacherCourses.map(course => (
              <SelectItem key={course.id} value={String(course.id)}>{course.name}</SelectItem>
            )) : <SelectItem value="none" disabled>No courses found for this teacher.</SelectItem>}
          </SelectContent>
        </Select>

        <div className="border rounded-lg">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Student Name</TableHead>
                <TableHead className="text-right">Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {studentsInCourse.length > 0 ? studentsInCourse.map(student => (
                <TableRow key={student.id}>
                  <TableCell>{student.name}</TableCell>
                  <TableCell className="text-right">
                    <RadioGroup 
                      defaultValue="unmarked" 
                      className="flex justify-end gap-4" 
                      value={attendance[student.id]} 
                      onValueChange={(value) => handleAttendanceChange(student.id, value as AttendanceStatus)}
                    >
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="present" id={`present-${student.id}`} />
                        <Label htmlFor={`present-${student.id}`}>Present</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="absent" id={`absent-${student.id}`} />
                        <Label htmlFor={`absent-${student.id}`}>Absent</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="late" id={`late-${student.id}`} />
                        <Label htmlFor={`late-${student.id}`}>Late</Label>
                      </div>
                    </RadioGroup>
                  </TableCell>
                </TableRow>
              )) : (
                  <TableRow>
                    <TableCell colSpan={2} className="h-24 text-center">
                        Select a course to see students.
                    </TableCell>
                  </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
        <Button onClick={handleSubmit} className="w-full" disabled={studentsInCourse.length === 0}>Submit Attendance</Button>
      </CardContent>
    </Card>
  );
};

export default function TeacherDashboard() {
  const { toast } = useToast();
  const [allStudents, setAllStudents] = useState<Student[]>([]);
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [courses, setCourses] = useState<Course[]>([]);
  const [currentTeacherId, setCurrentTeacherId] = useState(0);
  const [isLoading, setIsLoading] = useState(true);

  const fetchData = async () => {
    setIsLoading(true);
    try {
      const [studentsData, teachersData, coursesData] = await Promise.all([
        api.getStudents(),
        api.getTeachers(),
        api.getCourses(),
      ]);

      setAllStudents(studentsData);
      setTeachers(teachersData);
      setCourses(coursesData);
      if (teachersData.length > 0) {
        setCurrentTeacherId(teachersData[0].id);
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
  

  const handleUpdateCourse = async (id: number, name: string) => {
    const course = courses.find(c => c.id === id);
    if (!course) return;
    const updatedCourse = { ...course, name };
     try {
        await api.updateCourse(updatedCourse);
        setCourses(prev => prev.map(c => c.id === id ? updatedCourse : c));
    } catch (error) {
        toast({ variant: "destructive", title: "Error", description: "Could not update course." });
    }
  }

  const handleSaveAttendance = async (attendance: Record<string, AttendanceStatus>, courseId: number) => {
    const records = Object.entries(attendance)
        .filter(([, status]) => status !== 'unmarked')
        .map(([studentId, status]) => ({
            studentId: parseInt(studentId, 10),
            courseId: courseId,
            date: new Date().toISOString().split('T')[0],
            status,
        }));
    
    try {
        await api.addBulkAttendanceRecords(records);
        // Optionally refetch attendance data here or update state optimistically
    } catch (error) {
        toast({ variant: "destructive", title: "Error", description: "Could not save attendance." });
    }
  }

  if (isLoading) {
    return <div>Loading...</div>;
  }

  return (
    <div>
        {teachers.length > 0 && currentTeacherId !== 0 && <TeacherSelector teachers={teachers} currentTeacherId={currentTeacherId} onTeacherChange={setCurrentTeacherId} />}
        <AttendanceTaker 
          allStudents={allStudents} 
          teacherId={currentTeacherId} 
          courses={courses}
          onUpdateCourse={handleUpdateCourse}
          onSaveAttendance={handleSaveAttendance}
        />
    </div>
  );
}

    
