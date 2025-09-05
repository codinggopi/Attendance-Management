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
import { courses as initialCourses, students as allStudents, teachers } from '@/lib/data';
import type { Course, Student, AttendanceStatus } from '@/lib/types';
import { predictStudentAbsence } from '@/ai/flows/predict-student-absence';
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
const currentTeacher = teachers[0];

const AttendanceTaker = () => {
  const { toast } = useToast();
  const [courses, setCourses] = useState(initialCourses.filter(c => c.teacherId === currentTeacher.id));
  const [selectedCourseId, setSelectedCourseId] = useState<string | undefined>(courses[0]?.id);
  const [studentsInCourse, setStudentsInCourse] = useState<Student[]>([]);
  const [attendance, setAttendance] = useState<Record<string, AttendanceStatus>>({});
  const [isEditing, setIsEditing] = useState(false);
  const [editedCourseName, setEditedCourseName] = useState("");

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
    }
  }, [selectedCourseId, courses]);

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

  const selectedCourse = courses.find(c => c.id === selectedCourseId);

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
                <Button variant="outline"><Pencil className="mr-2 h-4 w-4" /> Edit Course</Button>
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
        <Select onValueChange={setSelectedCourseId} defaultValue={selectedCourseId}>
          <SelectTrigger>
            <SelectValue placeholder="Select a course..." />
          </SelectTrigger>
          <SelectContent>
            {courses.map(course => (
              <SelectItem key={course.id} value={course.id}>{course.name}</SelectItem>
            ))}
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
              {studentsInCourse.map(student => (
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
              ))}
            </TableBody>
          </Table>
        </div>
        <Button onClick={handleSubmit} className="w-full">Submit Attendance</Button>
      </CardContent>
    </Card>
  );
};

const RosterManagement = () => {
  const { toast } = useToast();
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const formData = new FormData(e.target as HTMLFormElement);
    const studentName = formData.get('studentName');
    toast({
        title: "Student Added",
        description: `${studentName} has been added to the system.`,
    });
    (e.target as HTMLFormElement).reset();
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
            <Label htmlFor="studentGrade">Grade</Label>
            <Input id="studentGrade" name="studentGrade" type="number" placeholder="e.g., 10" required />
          </div>
          <Button type="submit" className="w-full">Add Student</Button>
        </form>
      </CardContent>
    </Card>
  );
};

const AIPredictions = () => {
  const { toast } = useToast();
  const [predictions, setPredictions] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchPredictions = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const studentsToPredict = allStudents.slice(0, 3); // Predict for a few students
        const historicalData = JSON.stringify([
            { date: '2023-10-02', status: 'present' },
            { date: '2023-10-04', status: 'absent' },
        ]);
        const scheduleData = JSON.stringify(initialCourses.map(c => ({ name: c.name, schedule: c.schedule })));
        
        const predictionPromises = studentsToPredict.map(student => 
          predictStudentAbsence({
            studentId: student.id,
            historicalAttendanceData: historicalData,
            currentClassSchedule: scheduleData
          }).then(result => ({ ...result, studentName: student.name }))
        );
        
        const results = await Promise.all(predictionPromises);
        setPredictions(results.filter(p => p.willBeAbsent));
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
  }, [toast]);
  
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
      </CardContent>
    </Card>
  );
};


export default function TeacherDashboard() {
  return (
    <Tabs defaultValue="attendance">
      <TabsList className="grid w-full grid-cols-3">
        <TabsTrigger value="attendance"><ListChecks className="mr-2 h-4 w-4" />Take Attendance</TabsTrigger>
        <TabsTrigger value="roster"><UserPlus className="mr-2 h-4 w-4" />Manage Students</TabsTrigger>
        <TabsTrigger value="ai"><BrainCircuit className="mr-2 h-4 w-4" />AI Insights</TabsTrigger>
      </TabsList>
      <TabsContent value="attendance" className="mt-6">
        <AttendanceTaker />
      </TabsContent>
      <TabsContent value="roster" className="mt-6">
        <RosterManagement />
      </TabsContent>
      <TabsContent value="ai" className="mt-6">
        <AIPredictions />
      </TabsContent>
    </Tabs>
  );
}
