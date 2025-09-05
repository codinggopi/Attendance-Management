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
import { BrainCircuit, UserPlus, ListChecks, CheckCircle, AlertCircle, XCircle, Clock, Pencil, Check, X } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { courses as initialCourses, students as initialStudents, teachers as initialTeachers } from '@/lib/data';
import type { Course, Student, AttendanceStatus, Teacher } from '@/lib/types';
import { predictStudentAbsence } from '@/ai/flows/predict-student-absence';
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

// Mock current teacher
const TeacherSelector = ({ teachers, currentTeacherId, onTeacherChange }: { teachers: Teacher[], currentTeacherId: string, onTeacherChange: (id: string) => void }) => {
    return (
        <div className="mb-4">
            <label htmlFor="teacher-selector" className="block text-sm font-medium text-gray-700 mb-1">Select Teacher:</label>
            <select
                id="teacher-selector"
                value={currentTeacherId}
                onChange={(e) => onTeacherChange(e.target.value)}
                className="block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-primary focus:border-primary sm:text-sm rounded-md"
            >
                {teachers.map(t => (
                    <option key={t.id} value={t.id}>{t.name}</option>
                ))}
            </select>
        </div>
    )
}

const AttendanceTaker = ({ allStudents, teacherId }: { allStudents: Student[], teacherId: string }) => {
  const { toast } = useToast();
  const [courses, setCourses] = usePersistentState<Course[]>('courses', initialCourses);
  const [selectedCourseId, setSelectedCourseId] = useState<string | undefined>(undefined);
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

  const handleAttendanceChange = (studentId: string, status: AttendanceStatus) => {
    setAttendance(prev => ({ ...prev, [studentId]: status }));
  };
  
  const handleSubmit = () => {
    console.log("Submitting attendance:", attendance);
    toast({
      title: "Attendance Submitted!",
      description: "The attendance records have been saved.",
    });
  };

  const handleUpdateCourseName = () => {
    if (!selectedCourseId) return;
    setCourses(prevCourses => prevCourses.map(c => c.id === selectedCourseId ? {...c, name: editedCourseName} : c));
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
        <Select onValueChange={setSelectedCourseId} value={selectedCourseId}>
          <SelectTrigger>
            <SelectValue placeholder="Select a course..." />
          </SelectTrigger>
          <SelectContent>
            {teacherCourses.length > 0 ? teacherCourses.map(course => (
              <SelectItem key={course.id} value={course.id}>{course.name}</SelectItem>
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

const RosterManagement = ({ onAddStudent }: { onAddStudent: (student: Omit<Student, 'id' | 'email'> & { email: string }) => void }) => {
  const { toast } = useToast();
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const formData = new FormData(e.target as HTMLFormElement);
    const studentName = formData.get('studentName') as string;
    const studentEmail = formData.get('studentEmail') as string;
    const studentDept = formData.get('studentDept') as string;

    if (studentName && studentEmail && studentDept) {
        onAddStudent({ name: studentName, email: studentEmail, dept: studentDept });
        toast({
            title: "Student Added",
            description: `${studentName} has been added to the system.`,
        });
        (e.target as HTMLFormElement).reset();
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Add New Student</CardTitle>
        <CardDescription>Add a new student to the school roster.</CardDescription>
      </CardHeader>
      <CardContent>
        <form className="space-y-4" onSubmit={handleSubmit}>
          <div className="space-y-2">
            <Label htmlFor="studentName">Student Name</Label>
            <Input id="studentName" name="studentName" placeholder="e.g., Jane Doe" required />
          </div>
          <div className="space-y-2">
            <Label htmlFor="studentEmail">Student Email</Label>
            <Input id="studentEmail" name="studentEmail" type="email" placeholder="e.g., jane.d@example.com" required />
          </div>
          <div className="space-y-2">
            <Label htmlFor="studentDept">Department</Label>
            <Input id="studentDept" name="studentDept" placeholder="e.g., Computer Science" required />
          </div>
          <Button type="submit" className="w-full">Add Student</Button>
        </form>
      </CardContent>
    </Card>
  );
};

const AIPredictions = ({ allStudents, courses }: { allStudents: Student[], courses: Course[] }) => {
  const { toast } = useToast();
  const [predictions, setPredictions] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchPredictions = async () => {
      if (allStudents.length === 0) {
        setPredictions([]);
        return;
      }
      setIsLoading(true);
      setError(null);
      try {
        const studentsToPredict = allStudents.slice(0, 3);
        const historicalData = JSON.stringify([
            { date: '2023-10-02', status: 'present' },
            { date: '2023-10-04', status: 'absent' },
        ]);
        const scheduleData = JSON.stringify(courses.map(c => ({ name: c.name })));
        
        const predictionPromises = studentsToPredict.map(student => 
          predictStudentAbsence({
            studentId: student.id,
            historicalAttendanceData: historicalData,
            currentClassSchedule: scheduleData
          }).then(result => ({ ...result, studentName: student.name }))
          .catch(e => {
            console.error(`Failed to get prediction for student ${student.id}:`, e);
            return null;
          })
        );
        
        const results = await Promise.all(predictionPromises);
        const validResults = results.filter((p): p is (NonNullable<typeof p>) => p !== null && p.willBeAbsent);
        setPredictions(validResults);
        if (results.some(r => r === null)) {
            setError("Could not fetch all predictions. The AI model might be temporarily unavailable.");
        }

      } catch (e) {
        console.error(e);
        setError("Could not fetch predictions. The AI model might be temporarily unavailable.");
        toast({
            variant: "destructive",
            title: "Prediction Error",
            description: "Failed to fetch absence predictions.",
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchPredictions();
  }, [toast, allStudents, courses]);
  
  const getIcon = (confidence: number) => {
    if (confidence > 0.75) return <AlertCircle className="h-5 w-5 text-red-500" />;
    if (confidence > 0.5) return <AlertCircle className="h-5 w-5 text-yellow-500" />;
    return <AlertCircle className="h-5 w-5 text-gray-400" />;
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>AI-Powered Absence Predictions</CardTitle>
        <CardDescription>Students likely to be absent today based on historical patterns.</CardDescription>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="text-center text-muted-foreground">Analyzing patterns...</div>
        ) : error ? (
            <div className="text-center text-destructive">{error}</div>
        ): predictions.length > 0 ? (
          <ul className="space-y-4">
            {predictions.map((p, i) => (
              <li key={i} className="flex items-start gap-4 p-3 bg-secondary rounded-lg">
                {getIcon(p.confidenceScore)}
                <div>
                  <p className="font-semibold">{p.studentName}</p>
                  <p className="text-sm text-muted-foreground">{p.reason}</p>
                </div>
                <div className="ml-auto text-right">
                  <p className="font-bold text-sm">{(p.confidenceScore * 100).toFixed(0)}%</p>
                  <p className="text-xs text-muted-foreground">Confidence</p>
                </div>
              </li>
            ))}
          </ul>
        ) : (
          <div className="text-center text-muted-foreground">No absence predictions at this time.</div>
        )}
        {error && !isLoading && <div className="text-destructive mt-2">{error}</div>}
      </CardContent>
    </Card>
  );
};


export default function TeacherDashboard() {
  const [allStudents, setAllStudents] = usePersistentState<Student[]>('students', initialStudents);
  const [teachers] = usePersistentState<Teacher[]>('teachers', initialTeachers);
  const [courses] = usePersistentState<Course[]>('courses', initialCourses);
  const [currentTeacherId, setCurrentTeacherId] = useState('');
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
    if (teachers.length > 0) {
      setCurrentTeacherId(teachers[0].id)
    }
  }, [teachers]);
  

  const handleAddStudent = (studentData: Omit<Student, 'id'>) => {
      const newStudent: Student = {
          id: `s${Date.now()}`,
          ...studentData
      };
      setAllStudents(prev => [...prev, newStudent]);
  };

  if (!isClient) {
    return null; // or a loading spinner
  }

  return (
    <div>
        <TeacherSelector teachers={teachers} currentTeacherId={currentTeacherId} onTeacherChange={setCurrentTeacherId} />
        <Tabs defaultValue="attendance">
        <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="attendance"><ListChecks className="mr-2 h-4 w-4" />Take Attendance</TabsTrigger>
            <TabsTrigger value="roster"><UserPlus className="mr-2 h-4 w-4" />Manage Students</TabsTrigger>
            <TabsTrigger value="ai"><BrainCircuit className="mr-2 h-4 w-4" />AI Insights</TabsTrigger>
        </TabsList>
        <TabsContent value="attendance" className="mt-6">
            <AttendanceTaker allStudents={allStudents} teacherId={currentTeacherId} />
        </TabsContent>
        <TabsContent value="roster" className="mt-6">
            <RosterManagement onAddStudent={handleAddStudent} />
        </TabsContent>
        <TabsContent value="ai" className="mt-6">
            <AIPredictions allStudents={allStudents} courses={courses} />
        </TabsContent>
        </Tabs>
    </div>
  );
}
